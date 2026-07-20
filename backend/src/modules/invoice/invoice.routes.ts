import { Router } from 'express';
import { invoiceController } from './invoice.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { requirePermission } from '../authz';
import { Permissions } from '../authz/authz.types';
import { idempotency } from '../../middlewares/idempotency.middleware';

const router = Router();

router.get('/public/:id', invoiceController.getPublic);

router.use(authenticate);

router.get('/', requirePermission(Permissions.InvoiceRead), invoiceController.getAll);
router.post('/', idempotency(), requirePermission(Permissions.InvoiceCreate), invoiceController.create);
router.get('/:id', requirePermission(Permissions.InvoiceRead), invoiceController.getOne);
router.put('/:id', requirePermission(Permissions.InvoiceUpdate), invoiceController.update);
router.patch('/:id/status', requirePermission(Permissions.InvoiceApprove), invoiceController.updateStatus);
router.post('/:id/view', requirePermission(Permissions.InvoiceRead), invoiceController.trackView);
router.post('/:id/send', requirePermission(Permissions.InvoiceSend), invoiceController.sendInvoice);
router.post('/:id/payments', idempotency(), requirePermission(Permissions.InvoicePaymentRecord), invoiceController.addPayment);
router.post('/:id/remind', requirePermission(Permissions.InvoiceSend), invoiceController.triggerReminder);
router.delete('/:id', requirePermission(Permissions.InvoiceDelete), invoiceController.remove);

export default router;
