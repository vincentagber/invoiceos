import { Router } from 'express';
import { authzController } from './authz.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { requirePermission } from './authz.middleware';
import { Permissions } from './authz.types';

const router = Router();
router.use(authenticate);

router.get('/permissions', authzController.getPermissions);
router.get('/roles', authzController.getRoles);
router.get('/me', authzController.getMyPermissions);
router.post('/reseed', requirePermission(Permissions.OrganizationRolesManage), authzController.reseed);

export default router;
