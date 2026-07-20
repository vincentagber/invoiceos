import dotenv from 'dotenv';

dotenv.config();

const validateEnv = () => {
  const required = ['DATABASE_URL', 'JWT_SECRET', 'REFRESH_TOKEN_SECRET', 'FRONTEND_URL'] as const;
  const missing = required.filter((v) => !process.env[v]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  ['JWT_SECRET', 'REFRESH_TOKEN_SECRET'].forEach((secret) => {
    const value = process.env[secret] || '';
    if (value.length < 32) {
      throw new Error(`${secret} must be at least 32 characters (use: openssl rand -hex 32)`);
    }
  });
};

validateEnv();

export const env = {
  port: parseInt(process.env.PORT || '4000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',

  database: {
    url: process.env.DATABASE_URL!,
  },

  jwt: {
    secret: process.env.JWT_SECRET!,
    refreshSecret: process.env.REFRESH_TOKEN_SECRET!,
    expiry: process.env.JWT_EXPIRY || '24h',
    issuer: 'invoiceos' as const,
    audience: 'invoiceos-client' as const,
  },

  cors: {
    frontendUrl: process.env.FRONTEND_URL!,
    frontendUrlDev: process.env.FRONTEND_URL_DEV,
  },

  supabase: {
    url: process.env.SUPABASE_URL,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },

  paystack: {
    secretKey: process.env.PAYSTACK_SECRET_KEY,
  },

  openai: {
    apiKey: process.env.OPENAI_API_KEY,
  },

  smtp: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASSWORD,
    fromEmail: process.env.SMTP_FROM_EMAIL,
    fromName: process.env.SMTP_FROM_NAME,
  },

  sentry: {
    dsn: process.env.SENTRY_DSN,
  },

  log: {
    level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  },
} as const;
