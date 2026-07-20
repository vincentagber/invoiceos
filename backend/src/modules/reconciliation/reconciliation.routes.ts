import { Router } from 'express';
import { reconciliationController } from './reconciliation.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();
router.use(authenticate);

router.get('/', reconciliationController.getReconciliationData);
router.get('/summary', reconciliationController.getSummary);
router.post('/match', reconciliationController.manualMatch);
router.post('/mark-paid', reconciliationController.manualMarkPaid);
router.post('/refund', reconciliationController.refund);
router.post('/dispute', reconciliationController.dispute);

export default router;
