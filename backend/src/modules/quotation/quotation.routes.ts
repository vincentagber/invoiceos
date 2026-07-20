import { Router } from 'express';
import { quotationController } from './quotation.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { requirePermission } from '../authz';
import { Permissions } from '../authz/authz.types';

const router = Router();
router.use(authenticate);

router.get('/', requirePermission(Permissions.QuotationRead), quotationController.getAll);
router.post('/', requirePermission(Permissions.QuotationCreate), quotationController.create);
router.get('/:id', requirePermission(Permissions.QuotationRead), quotationController.getOne);
router.put('/:id', requirePermission(Permissions.QuotationUpdate), quotationController.update);
router.delete('/:id', requirePermission(Permissions.QuotationDelete), quotationController.remove);
router.post('/:id/convert', requirePermission(Permissions.QuotationConvert), quotationController.convertToInvoice);

export default router;
