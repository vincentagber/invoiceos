import { Router } from 'express';
import * as billingController from '../controllers/billing.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/verify', billingController.verifySubscription);
router.get('/:businessId', billingController.getSubscription);
router.get('/:businessId/history', billingController.getBillingHistory);

export default router;
