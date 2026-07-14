import { Router } from 'express';
import multer from 'multer';
import * as expenseController from '../controllers/expense.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.use(authenticate);

router.get('/', expenseController.getAll);
router.post('/', expenseController.create);
router.post('/upload-excel', upload.single('file'), expenseController.uploadExcel);
router.put('/:id', expenseController.update);
router.delete('/:id', expenseController.remove);

export default router;
