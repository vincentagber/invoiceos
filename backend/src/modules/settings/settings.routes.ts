import { Router } from 'express';
import { settingsController } from './settings.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { requirePermission } from '../authz';
import { Permissions } from '../authz/authz.types';

const router = Router();
router.use(authenticate);

router.get('/', requirePermission(Permissions.SettingsRead), settingsController.getAll);
router.put('/business', requirePermission(Permissions.SettingsUpdate), settingsController.updateBusiness);
router.put('/branding', requirePermission(Permissions.SettingsBranding), settingsController.updateBranding);
router.put('/invoice-defaults', requirePermission(Permissions.SettingsUpdate), settingsController.updateInvoiceDefaults);
router.put('/workflow', requirePermission(Permissions.SettingsWorkflow), settingsController.updateWorkflow);
router.put('/notifications', requirePermission(Permissions.SettingsUpdate), settingsController.updateNotifications);
router.put('/email', requirePermission(Permissions.SettingsEmail), settingsController.updateEmail);
router.post('/email/test', requirePermission(Permissions.SettingsEmail), settingsController.sendTestEmail);
router.delete('/business', requirePermission(Permissions.SettingsDeleteBusiness), settingsController.deleteBusiness);
router.put('/profile', requirePermission(Permissions.SettingsRead), settingsController.updateProfile);

export default router;
