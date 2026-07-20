import { Request, Response, NextFunction } from 'express';
import { ConflictError } from '../shared/errors';

const completedKeys = new Map<string, { status: number; body: unknown }>();

const TTL = 1000 * 60 * 60;

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of completedKeys) {
    if (entry.status === 0) completedKeys.delete(key);
  }
}, TTL);

export function idempotency() {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.method !== 'POST') return next();

    const key = req.headers['idempotency-key'] as string;
    if (!key) return next();

    const existing = completedKeys.get(key);
    if (existing) {
      return res.status(existing.status).json(existing.body);
    }

    const originalJson = res.json.bind(res);
    res.json = function (body: unknown) {
      completedKeys.set(key, { status: res.statusCode, body });
      return originalJson(body);
    };

    next();
  };
}
