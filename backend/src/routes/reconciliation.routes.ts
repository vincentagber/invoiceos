import { Router } from 'express';
import * as reconciliationController from '../controllers/reconciliation.controller';
import { authenticate, checkRole } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

const ROLES = {
  ANY: ['OWNER', 'ADMIN', 'MEMBER'],
  MANAGE: ['OWNER', 'ADMIN'],
};

router.get('/', checkRole(ROLES.ANY), reconciliationController.getReconciliationData);
router.get('/summary', checkRole(ROLES.ANY), reconciliationController.getSummary);
router.post('/match', checkRole(ROLES.MANAGE), reconciliationController.manualMatch);
router.post('/mark-paid', checkRole(ROLES.MANAGE), reconciliationController.manualMarkPaid);
router.post('/refund', checkRole(ROLES.MANAGE), reconciliationController.refund);
router.post('/dispute', checkRole(ROLES.MANAGE), reconciliationController.dispute);

export default router;
