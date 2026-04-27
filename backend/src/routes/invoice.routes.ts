import { Router } from 'express';
import * as invoiceController from '../controllers/invoice.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', invoiceController.getAll);
router.post('/', invoiceController.create);
router.get('/:id', invoiceController.getOne);
router.put('/:id', invoiceController.update);
router.patch('/:id/status', invoiceController.updateStatus);
router.post('/:id/view', invoiceController.trackView);
router.post('/:id/send', invoiceController.sendInvoice);
router.post('/:id/payments', invoiceController.addPayment);
router.post('/:id/remind', invoiceController.triggerReminder);
router.delete('/:id', invoiceController.remove);

export default router;
