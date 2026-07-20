import { Router } from 'express';
import { complianceController } from './compliance.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();

// Public routes
router.get('/countries', complianceController.getCountries);

// Authenticated routes
router.use(authenticate);

router.get('/status', complianceController.getStatus);
router.get('/deadlines', complianceController.getDeadlines);
router.get('/connectors', complianceController.getConnectors);

// Admin: Compliance Config CRUD
router.get('/admin/configs', complianceController.listConfigs);
router.get('/admin/config', complianceController.getConfigByCountry);
router.get('/admin/configs/:id', complianceController.getConfig);
router.post('/admin/configs', complianceController.createConfig);
router.put('/admin/configs/:id', complianceController.updateConfig);
router.delete('/admin/configs/:id', complianceController.deleteConfig);
router.post('/admin/cache/invalidate', complianceController.invalidateCache);

// Admin: Tax Rules CRUD
router.get('/admin/tax-rules', complianceController.listTaxRules);
router.post('/admin/tax-rules', complianceController.createTaxRule);
router.put('/admin/tax-rules/:id', complianceController.updateTaxRule);
router.delete('/admin/tax-rules/:id', complianceController.deleteTaxRule);

// Admin: Deadlines CRUD
router.get('/admin/deadlines', complianceController.listDeadlines);
router.post('/admin/deadlines', complianceController.createDeadline);
router.put('/admin/deadlines/:id', complianceController.updateDeadline);
router.delete('/admin/deadlines/:id', complianceController.deleteDeadline);

// Admin: Connectors CRUD
router.get('/admin/connectors', complianceController.listConnectorsAdmin);
router.post('/admin/connectors', complianceController.createConnector);
router.put('/admin/connectors/:id', complianceController.updateConnector);
router.delete('/admin/connectors/:id', complianceController.deleteConnector);

export default router;
