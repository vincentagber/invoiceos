import { Router } from 'express';
import multer from 'multer';
import { expenseController } from './expense.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { requirePermission } from '../authz';
import { Permissions } from '../authz/authz.types';
import { idempotency } from '../../middlewares/idempotency.middleware';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.use(authenticate);

router.get('/', requirePermission(Permissions.ExpenseRead), expenseController.getAll);
router.post('/', idempotency(), requirePermission(Permissions.ExpenseCreate), expenseController.create);
router.post('/upload-excel', idempotency(), requirePermission(Permissions.ExpenseBulkImport), upload.single('file'), expenseController.uploadExcel);
router.put('/:id', requirePermission(Permissions.ExpenseUpdate), expenseController.update);
router.delete('/:id', requirePermission(Permissions.ExpenseDelete), expenseController.remove);

export default router;
