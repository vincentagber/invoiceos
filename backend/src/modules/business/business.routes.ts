import { Router } from 'express';
import { businessController } from './business.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();
router.use(authenticate);

router.get('/me', businessController.getCurrent);
router.put('/me', businessController.updateCurrent);
router.get('/:id', businessController.getOne);
router.put('/:id', businessController.update);
router.patch('/:id/branding', businessController.updateBranding);

export default router;
