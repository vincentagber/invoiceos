"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const logger_1 = require("../utils/logger");
const errorHandler = (err, req, res, next) => {
    logger_1.logger.error(err);
    const status = err.status || 500;
    // Send generic message to client in production
    const clientMessage = status === 500
        ? 'An error occurred. Our team has been notified.'
        : err.message;
    const response = {
        error: {
            message: clientMessage,
            status,
            timestamp: new Date().toISOString(),
        },
    };
    // Only expose stack trace and details in development
    if (process.env.NODE_ENV !== 'production') {
        response.error.stack = err.stack;
        response.error.details = err.details;
    }
    res.status(status).json(response);
};
exports.errorHandler = errorHandler;
