import { Request, Response, NextFunction } from 'express';
import prisma from '../../lib/prisma';
import { getEffectivePermissions } from './authz.service';
import { seedPermissionsAndRoles } from './authz.seed';

export const authzController = {
  async getPermissions(_req: Request, res: Response, next: NextFunction) {
    try {
      const permissions = await prisma.permission.findMany({ orderBy: [{ group: 'asc' }, { name: 'asc' }] });
      res.json(permissions);
    } catch (error) {
      next(error);
    }
  },

  async getRoles(_req: Request, res: Response, next: NextFunction) {
    try {
      const roles = await prisma.role.findMany({
        include: { permissions: { include: { permission: true } } },
        orderBy: { name: 'asc' },
      });
      res.json(roles);
    } catch (error) {
      next(error);
    }
  },

  async getMyPermissions(req: Request, res: Response, next: NextFunction) {
    try {
      const businessId = req.query.businessId as string;
      if (!businessId || !req.user?.id) {
        res.json([]);
        return;
      }
      const permissions = await getEffectivePermissions(req.user.id, businessId);
      res.json(permissions);
    } catch (error) {
      next(error);
    }
  },

  async reseed(_req: Request, res: Response, next: NextFunction) {
    try {
      await seedPermissionsAndRoles();
      res.json({ success: true, message: 'Permissions and roles reseeded' });
    } catch (error) {
      next(error);
    }
  },
};
