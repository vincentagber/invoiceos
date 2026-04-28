import { Router } from 'express';
import * as billingController from '../controllers/billing.controller';

const router = Router();

router.post('/verify', billingController.verifySubscription);
router.get('/:businessId', billingController.getSubscription);
router.get('/:businessId/history', billingController.getBillingHistory);

export default router;
