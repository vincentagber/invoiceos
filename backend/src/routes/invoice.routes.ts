import { Router } from 'express';
import * as invoiceController from '../controllers/invoice.controller';
import { authenticate, checkRole } from '../middlewares/auth.middleware';

const router = Router();

// Base Authentication
router.use(authenticate);

// Organization Roles
const ROLES = {
  ANY: ['OWNER', 'ADMIN', 'MEMBER'],
  MANAGE: ['OWNER', 'ADMIN'],
  ROOT: ['OWNER']
};

// Routes with RBAC
router.get('/', checkRole(ROLES.ANY), invoiceController.getAll);
router.post('/', checkRole(ROLES.MANAGE), invoiceController.create);
router.get('/:id', checkRole(ROLES.ANY), invoiceController.getOne);
router.put('/:id', checkRole(ROLES.MANAGE), invoiceController.update);
router.patch('/:id/status', checkRole(ROLES.MANAGE), invoiceController.updateStatus);
router.post('/:id/view', checkRole(ROLES.ANY), invoiceController.trackView);
router.post('/:id/send', checkRole(ROLES.MANAGE), invoiceController.sendInvoice);
router.post('/:id/payments', checkRole(ROLES.MANAGE), invoiceController.addPayment);
router.post('/:id/remind', checkRole(ROLES.MANAGE), invoiceController.triggerReminder);
router.delete('/:id', checkRole(ROLES.ROOT), invoiceController.remove); // Only Owner can delete

export default router;
