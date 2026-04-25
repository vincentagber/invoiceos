import { Router } from 'express';
import * as aiController from '../controllers/ai.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/analyze', aiController.analyzeInvoice);
router.post('/generate-description', aiController.generateDescription);

export default router;
