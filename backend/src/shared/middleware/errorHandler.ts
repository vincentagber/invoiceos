import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { AppError } from '../errors';
import { logger } from '../utils/logger';

export const errorHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  logger.error(err instanceof Error ? err : new Error(String(err)));

  if (err instanceof AppError) {
    const response = {
      success: false as const,
      error: {
        code: err.code,
        message: err.message,
        status: err.statusCode,
        timestamp: new Date().toISOString(),
        ...(err.details ? { details: err.details } : {}),
      },
    };

    if (process.env.NODE_ENV !== 'production') {
      (response.error as any).stack = err.stack;
    }

    return res.status(err.statusCode).json(response);
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    const errorMap: Record<string, { status: number; code: string; message: string }> = {
      P2002: { status: 409, code: 'UNIQUE_CONSTRAINT', message: 'A record with this value already exists.' },
      P2025: { status: 404, code: 'NOT_FOUND', message: 'Record not found.' },
      P2003: { status: 400, code: 'FOREIGN_KEY', message: 'Referenced record does not exist.' },
    };

    const mapped = errorMap[err.code] || { status: 500, code: 'DATABASE_ERROR', message: 'A database error occurred.' };

    return res.status(mapped.status).json({
      success: false,
      error: {
        code: mapped.code,
        message: mapped.message,
        status: mapped.status,
        timestamp: new Date().toISOString(),
      },
    });
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid data provided.',
        status: 400,
        timestamp: new Date().toISOString(),
      },
    });
  }

  const status = err instanceof Error ? 500 : 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'An error occurred. Our team has been notified.'
    : (err instanceof Error ? err.message : 'An unknown error occurred');

  return res.status(status).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message,
      status,
      timestamp: new Date().toISOString(),
      ...(process.env.NODE_ENV !== 'production' && err instanceof Error ? { stack: err.stack } : {}),
    },
  });
};
