import { Router } from 'express';
import * as expenseController from '../controllers/expense.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();
router.use(authenticate);

router.get('/', expenseController.getAll);
router.post('/', expenseController.create);
router.put('/:id', expenseController.update);
router.delete('/:id', expenseController.remove);

export default router;
