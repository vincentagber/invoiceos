import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error(err);
  
  const status = err.status || 500;
  
  // Send generic message to client in production
  const clientMessage = status === 500 
    ? 'An error occurred. Our team has been notified.' 
    : err.message;
  
  const response: any = {
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
