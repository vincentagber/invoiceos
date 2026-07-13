import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { logger } from '../utils/logger';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error(err);

  // Prisma known request errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return res.status(409).json({ error: { message: 'A record with this value already exists.', status: 409, timestamp: new Date().toISOString() } });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({ error: { message: 'Record not found.', status: 404, timestamp: new Date().toISOString() } });
    }
    if (err.code === 'P2003') {
      return res.status(400).json({ error: { message: 'Referenced record does not exist.', status: 400, timestamp: new Date().toISOString() } });
    }
  }

  // Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: {
        message: 'Validation failed',
        status: 400,
        timestamp: new Date().toISOString(),
        details: err.issues.map((e: any) => ({ field: e.path.join('.'), message: e.message })),
      },
    });
  }

  const status = err.status || 500;
  
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
  
  if (process.env.NODE_ENV !== 'production') {
    response.error.stack = err.stack;
    response.error.details = err.details;
  }
  
  res.status(status).json(response);
};
