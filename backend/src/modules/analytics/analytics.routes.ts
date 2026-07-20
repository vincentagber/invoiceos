import { Router } from 'express';
import { analyticsController } from './analytics.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { requirePermission } from '../authz';
import { Permissions } from '../authz/authz.types';

const router = Router();
router.use(authenticate);

router.get('/summary', requirePermission(Permissions.AnalyticsView), analyticsController.getSummary);
router.get('/revenue-trends', requirePermission(Permissions.AnalyticsView), analyticsController.getRevenueTrends);

export default router;
