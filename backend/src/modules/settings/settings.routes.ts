import { Router } from 'express';
import { settingsController } from './settings.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();
router.use(authenticate);

router.get('/', settingsController.getAll);
router.put('/business', settingsController.updateBusiness);
router.put('/branding', settingsController.updateBranding);
router.put('/invoice-defaults', settingsController.updateInvoiceDefaults);
router.put('/workflow', settingsController.updateWorkflow);
router.put('/notifications', settingsController.updateNotifications);
router.put('/email', settingsController.updateEmail);
router.post('/email/test', settingsController.sendTestEmail);
router.delete('/business', settingsController.deleteBusiness);
router.put('/profile', settingsController.updateProfile);

export default router;
