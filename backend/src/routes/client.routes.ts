import { Router } from 'express';
import * as clientController from '../controllers/client.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();
router.use(authenticate);

router.get('/', clientController.getAll);
router.post('/', clientController.create);
router.get('/:id', clientController.getOne);

export default router;
