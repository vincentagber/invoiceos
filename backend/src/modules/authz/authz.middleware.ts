import { Request, Response, NextFunction } from 'express';
import { ForbiddenError, UnauthorizedError } from '../../shared/errors';
import { can } from './authz.service';
import type { PermissionKey } from './authz.types';

export function requirePermission(permission: PermissionKey) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (!req.user?.id) {
        throw new UnauthorizedError('Authentication required');
      }

      const businessId =
        (req.query.businessId as string) ||
        (req.body?.businessId as string) ||
        (req.params?.businessId as string);

      if (!businessId) {
        throw new ForbiddenError('Business ID required for permission check');
      }

      const result = await can(req.user.id, businessId, permission);

      if (!result.allowed) {
        throw new ForbiddenError(result.reason || 'Insufficient permissions');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
