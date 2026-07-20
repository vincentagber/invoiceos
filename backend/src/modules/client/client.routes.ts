import { Router } from 'express';
import { clientController } from './client.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { requirePermission } from '../authz';
import { Permissions } from '../authz/authz.types';

const router = Router();
router.use(authenticate);

router.get('/', requirePermission(Permissions.ClientRead), clientController.getAll);
router.post('/', requirePermission(Permissions.ClientCreate), clientController.create);
router.get('/:id', requirePermission(Permissions.ClientRead), clientController.getOne);
router.put('/:id', requirePermission(Permissions.ClientUpdate), clientController.update);
router.delete('/:id', requirePermission(Permissions.ClientDelete), clientController.remove);

export default router;
