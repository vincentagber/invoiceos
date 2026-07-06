"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const stripSensitiveData = winston_1.default.format((info) => {
    const sensitiveKeys = ['password', 'token', 'jwt', 'secret', 'key', 'apiKey', 'authorization'];
    let message = JSON.stringify(info);
    sensitiveKeys.forEach(key => {
        const regex = new RegExp(`"${key}"\\s*:\\s*"[^"]*"`, 'gi');
        message = message.replace(regex, `"${key}": "[REDACTED]"`);
    });
    try {
        return JSON.parse(message);
    }
    catch {
        return info;
    }
});
const myFormat = winston_1.default.format.printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} [${level}]: ${stack || message}`;
});
exports.logger = winston_1.default.createLogger({
    level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
    format: winston_1.default.format.combine(stripSensitiveData(), winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston_1.default.format.errors({ stack: true }), winston_1.default.format.json()),
    transports: [
        new winston_1.default.transports.Console({
            format: winston_1.default.format.combine(winston_1.default.format.colorize(), myFormat),
        }),
        new winston_1.default.transports.File({ filename: 'error.log', level: 'error', maxsize: 10485760, maxFiles: 5 }),
        new winston_1.default.transports.File({ filename: 'combined.log', maxsize: 10485760, maxFiles: 5 }),
    ],
});
