import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import path from 'path';
import { Server } from 'socket.io';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import * as Sentry from "@sentry/node";
import prisma from './lib/prisma';
import authRoutes from './routes/auth.routes';
import invoiceRoutes from './routes/invoice.routes';
import clientRoutes from './routes/client.routes';
import businessRoutes from './routes/business.routes';
import analyticsRoutes from './routes/analytics.routes';
import aiRoutes from './routes/ai.routes';
import quotationRoutes from './routes/quotation.routes';
import billingRoutes from './routes/billing.routes';
import expenseRoutes from './routes/expense.routes';
import settingsRoutes from './routes/settings.routes';
import documentRoutes from './routes/document.routes';
import reconciliationRoutes from './routes/reconciliation.routes';
import accountingRoutes from './routes/accounting.routes';
import complianceRoutes from './routes/compliance.routes';
import { errorHandler } from './middlewares/errorHandler';
import { logger } from './utils/logger';

dotenv.config();

// Validate required environment variables at startup
const validateEnvironment = () => {
  const required = ['DATABASE_URL', 'JWT_SECRET', 'REFRESH_TOKEN_SECRET', 'FRONTEND_URL'];
  const missing = required.filter(v => !process.env[v]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  const secrets = ['JWT_SECRET', 'REFRESH_TOKEN_SECRET'];
  secrets.forEach(secret => {
    const value = process.env[secret] || '';
    if (value.length < 32) {
      throw new Error(`${secret} must be at least 32 characters (use: openssl rand -hex 32)`);
    }
  });

  logger.info('Environment validation passed');
};

validateEnvironment();

const app = express();
const httpServer = createServer(app);

// Trust proxy for rate limiting behind Render/Vercel
app.set('trust proxy', 1);

// Sentry error tracking
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0.1,
    integrations: [Sentry.expressIntegration()],
  });
}

// Security: Remove server fingerprinting
app.disable('x-powered-by');

// Security headers with Content Security Policy enabled
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", process.env.FRONTEND_URL || ''],
      fontSrc: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
      baseUri: ["'self'"],
    },
  },
  hsts: { maxAge: 31536000, includeSubDomains: true },
  frameguard: { action: 'deny' },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
}));

// Performance: Compression
app.use(compression({ level: 6, threshold: 1024 }));

// CORS: Restrict to specific frontend origins
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.FRONTEND_URL_DEV,
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS policy violation'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 3600,
}));

// Socket.io with restricted CORS
if (!process.env.FRONTEND_URL) {
  throw new Error('FRONTEND_URL must be set for Socket.io CORS configuration');
}

const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST'],
    credentials: true,
    maxAge: 3600,
  },
});

// Socket.io authentication middleware
io.use(async (socket, next) => {
  const token = socket.handshake.auth?.token || socket.handshake.query?.token;
  if (!token) {
    return next(new Error('Authentication required'));
  }
  try {
    const decoded = jwt.verify(token.toString(), process.env.JWT_SECRET!, {
      issuer: 'invoiceos',
      audience: 'invoiceos-client',
    }) as { id: string; email: string };
    socket.data.user = decoded;
    next();
  } catch {
    next(new Error('Authentication failed'));
  }
});

// Socket.io Connection
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id} (user: ${socket.data.user?.id})`);

  socket.on('join-business', async (businessId) => {
    if (!businessId || !socket.data.user?.id) {
      socket.emit('error', { message: 'Authentication required to join business room' });
      return;
    }
    // Verify user owns or is a member of the business
    const business = await prisma.business.findFirst({
      where: {
        id: businessId,
        ownerId: socket.data.user.id,
      },
      select: { id: true },
    });
    if (business) {
      socket.join(businessId);
      logger.info(`Socket ${socket.id} joined business ${businessId}`);
    } else {
      socket.emit('error', { message: 'Unauthorized: not a member of this business' });
    }
  });

  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

// Serve uploaded files through controller (removed public static serving)

// Body parsing with size limits
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ limit: '1mb', extended: true }));
app.use(cookieParser());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Input validation rate limiter
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/ai', aiLimiter);

// Request timeout
app.use((req, res, next) => {
  req.setTimeout(30000);
  next();
});

// Health check endpoint (before routes so it is always accessible)
app.get('/api/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      status: 'healthy',
      database: 'connected',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(503).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/business', businessRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/quotations', quotationRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/reconciliation', reconciliationRoutes);
app.use('/api/accounting', accountingRoutes);
app.use('/api/compliance', complianceRoutes);

// Attach IO to request for use in controllers
app.set('io', io);

// Sentry error handler (must be before express error handler)
if (process.env.SENTRY_DSN) {
  Sentry.setupExpressErrorHandler(app);
}

// Error Handling
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  logger.info(`InvoiceOS Backend running on http://localhost:${PORT}`);
});
