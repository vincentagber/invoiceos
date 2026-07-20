import { Router } from 'express';
import { clientController } from './client.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();
router.use(authenticate);

router.get('/', clientController.getAll);
router.post('/', clientController.create);
router.get('/:id', clientController.getOne);
router.put('/:id', clientController.update);
router.delete('/:id', clientController.remove);

export default router;
