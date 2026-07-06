import winston from 'winston';

const stripSensitiveData = winston.format((info) => {
  const sensitiveKeys = ['password', 'token', 'jwt', 'secret', 'key', 'apiKey', 'authorization'];
  let message = JSON.stringify(info);

  sensitiveKeys.forEach(key => {
    const regex = new RegExp(`"${key}"\\s*:\\s*"[^"]*"`, 'gi');
    message = message.replace(regex, `"${key}": "[REDACTED]"`);
  });

  try {
    return JSON.parse(message);
  } catch {
    return info;
  }
});

const myFormat = winston.format.printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  format: winston.format.combine(
    stripSensitiveData(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        myFormat,
      ),
    }),
    new winston.transports.File({ filename: 'error.log', level: 'error', maxsize: 10485760, maxFiles: 5 }),
    new winston.transports.File({ filename: 'combined.log', maxsize: 10485760, maxFiles: 5 }),
  ],
});
