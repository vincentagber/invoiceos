import { Router } from 'express';
import * as quotationController from '../controllers/quotation.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', quotationController.getAll);
router.post('/', quotationController.create);
router.get('/:id', quotationController.getOne);
router.put('/:id', quotationController.update);
router.delete('/:id', quotationController.remove);
router.post('/:id/convert', quotationController.convertToInvoice);

export default router;
