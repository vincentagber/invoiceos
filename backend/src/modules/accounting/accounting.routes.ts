import { Router } from 'express';
import { accountingController } from './accounting.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();
router.use(authenticate);

router.get('/summary', accountingController.getSummary);
router.get('/compliance-status', accountingController.getComplianceStatus);

export default router;
