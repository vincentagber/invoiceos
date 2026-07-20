import { Router } from 'express';
import { analyticsController } from './analytics.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();
router.use(authenticate);

router.get('/summary', analyticsController.getSummary);
router.get('/revenue-trends', analyticsController.getRevenueTrends);

export default router;
