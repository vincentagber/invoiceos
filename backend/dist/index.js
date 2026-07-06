"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const compression_1 = __importDefault(require("compression"));
const Sentry = __importStar(require("@sentry/node"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const invoice_routes_1 = __importDefault(require("./routes/invoice.routes"));
const client_routes_1 = __importDefault(require("./routes/client.routes"));
const business_routes_1 = __importDefault(require("./routes/business.routes"));
const analytics_routes_1 = __importDefault(require("./routes/analytics.routes"));
const ai_routes_1 = __importDefault(require("./routes/ai.routes"));
const quotation_routes_1 = __importDefault(require("./routes/quotation.routes"));
const billing_routes_1 = __importDefault(require("./routes/billing.routes"));
const expense_routes_1 = __importDefault(require("./routes/expense.routes"));
const settings_routes_1 = __importDefault(require("./routes/settings.routes"));
const document_routes_1 = __importDefault(require("./routes/document.routes"));
const errorHandler_1 = require("./middlewares/errorHandler");
const logger_1 = require("./utils/logger");
dotenv_1.default.config();
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
    logger_1.logger.info('Environment validation passed');
};
validateEnvironment();
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
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
// Security headers
app.use((0, helmet_1.default)({
    contentSecurityPolicy: false,
    hsts: { maxAge: 31536000, includeSubDomains: true },
    frameguard: { action: 'deny' },
    noSniff: true,
    xssFilter: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
}));
// Performance: Compression
app.use((0, compression_1.default)({ level: 6, threshold: 1024 }));
// CORS: Restrict to specific frontend origins
const allowedOrigins = [
    process.env.FRONTEND_URL,
    process.env.FRONTEND_URL_DEV,
].filter(Boolean);
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
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
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: process.env.FRONTEND_URL,
        methods: ['GET', 'POST'],
        credentials: true,
        maxAge: 3600,
    },
});
// Socket.io Connection
io.on('connection', (socket) => {
    logger_1.logger.info(`Client connected: ${socket.id}`);
    socket.on('join-business', (businessId) => {
        socket.join(businessId);
        logger_1.logger.info(`Socket ${socket.id} joined business ${businessId}`);
    });
    socket.on('disconnect', () => {
        logger_1.logger.info(`Client disconnected: ${socket.id}`);
    });
});
// Body parsing with size limits
app.use(express_1.default.json({ limit: '5mb' }));
app.use(express_1.default.urlencoded({ limit: '5mb', extended: true }));
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 5,
    skipSuccessfulRequests: true,
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
// Request timeout
app.use((req, res, next) => {
    req.setTimeout(30000);
    next();
});
// Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/invoices', invoice_routes_1.default);
app.use('/api/clients', client_routes_1.default);
app.use('/api/business', business_routes_1.default);
app.use('/api/analytics', analytics_routes_1.default);
app.use('/api/ai', ai_routes_1.default);
app.use('/api/quotations', quotation_routes_1.default);
app.use('/api/billing', billing_routes_1.default);
app.use('/api/expenses', expense_routes_1.default);
app.use('/api/settings', settings_routes_1.default);
app.use('/api/documents', document_routes_1.default);
// Health check endpoint
app.get('/api/health', async (req, res) => {
    try {
        const prisma = (await Promise.resolve().then(() => __importStar(require('./lib/prisma')))).default;
        await prisma.$queryRaw `SELECT 1`;
        res.status(200).json({
            status: 'healthy',
            database: 'connected',
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        res.status(503).json({
            status: 'unhealthy',
            database: 'disconnected',
            error: error.message,
            timestamp: new Date().toISOString(),
        });
    }
});
// Attach IO to request for use in controllers
app.set('io', io);
// Sentry error handler (must be before express error handler)
if (process.env.SENTRY_DSN) {
    Sentry.setupExpressErrorHandler(app);
}
// Error Handling
app.use(errorHandler_1.errorHandler);
const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
    logger_1.logger.info(`InvoiceOS Backend running on http://localhost:${PORT}`);
});
