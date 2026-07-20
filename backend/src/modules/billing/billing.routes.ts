import { Router } from 'express';
import { billingController } from './billing.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { requirePermission } from '../authz';
import { Permissions } from '../authz/authz.types';

const router = Router();
router.use(authenticate);

router.post('/verify', requirePermission(Permissions.SubscriptionManage), billingController.verifySubscription);
router.get('/:businessId', requirePermission(Permissions.SubscriptionRead), billingController.getSubscription);
router.get('/:businessId/history', requirePermission(Permissions.SubscriptionRead), billingController.getBillingHistory);

export default router;
