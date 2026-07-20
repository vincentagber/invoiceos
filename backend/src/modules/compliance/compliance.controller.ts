import { Request, Response, NextFunction } from 'express';
import prisma from '../../lib/prisma';
import { verifyBusinessOwnership } from '../../middlewares/auth.middleware';
import { getBusinessComplianceStatus, getAvailableCountries, invalidateConfigCache } from './compliance.service';
import { ForbiddenError } from '../../shared/errors';

export const complianceController = {
  // ─── Business Compliance Dashboard ───────────────────────────

  async getStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const businessId = req.query.businessId as string;
      if (!businessId) return res.status(400).json({ message: 'Business ID is required' });

      const owns = await verifyBusinessOwnership(req.user!.id, businessId);
      if (!owns) throw new ForbiddenError();

      const status = await getBusinessComplianceStatus(businessId);
      res.json({ success: true, data: status });
    } catch (error) {
      next(error);
    }
  },

  async getCountries(req: Request, res: Response, next: NextFunction) {
    try {
      const countries = await getAvailableCountries();
      res.json({ success: true, data: countries });
    } catch (error) {
      next(error);
    }
  },

  // ─── Admin: Compliance Configuration CRUD ────────────────────

  async listConfigs(req: Request, res: Response, next: NextFunction) {
    try {
      const configs = await prisma.complianceConfig.findMany({
        where: { isActive: true },
        orderBy: { countryName: 'asc' },
        select: {
          id: true,
          countryCode: true,
          countryName: true,
          currency: true,
          governingBody: true,
          defaultVatRate: true,
          defaultCorporateRate: true,
          requiresTaxRegistration: true,
          qrRequired: true,
          continuousTransmission: true,
          portalName: true,
          isActive: true,
          effectiveFrom: true,
          effectiveTo: true,
          version: true,
        },
      });
      res.json({ success: true, data: configs });
    } catch (error) {
      next(error);
    }
  },

  async getConfig(req: Request, res: Response, next: NextFunction) {
    try {
      const config = await prisma.complianceConfig.findUnique({
        where: { id: req.params.id as string },
        include: { taxRules: true, deadlines: true, connectors: true },
      });
      if (!config) return res.status(404).json({ message: 'Compliance config not found' });
      res.json({ success: true, data: config });
    } catch (error) {
      next(error);
    }
  },

  async getConfigByCountry(req: Request, res: Response, next: NextFunction) {
    try {
      const countryCode = (req.query.countryCode as string)?.toUpperCase();
      if (!countryCode) return res.status(400).json({ message: 'Country code is required' });

      const config = await prisma.complianceConfig.findFirst({
        where: {
          countryCode,
          isActive: true,
          effectiveFrom: { lte: new Date() },
          OR: [{ effectiveTo: null }, { effectiveTo: { gte: new Date() } }],
        },
        orderBy: { effectiveFrom: 'desc' },
        include: {
          taxRules: { where: { isActive: true }, orderBy: { priority: 'asc' } },
          deadlines: { where: { isActive: true } },
          connectors: { where: { isActive: true } },
        },
      });
      if (!config) return res.status(404).json({ message: `No active config for ${countryCode}` });
      res.json({ success: true, data: config });
    } catch (error) {
      next(error);
    }
  },

  async getDeadlines(req: Request, res: Response, next: NextFunction) {
    try {
      const countryCode = (req.query.countryCode as string)?.toUpperCase();
      const businessId = req.query.businessId as string;

      let targetCountry: string | undefined = countryCode;
      if (!targetCountry && businessId) {
        const business = await prisma.business.findUnique({ where: { id: businessId }, select: { country: true } });
        targetCountry = business?.country;
      }

      if (!targetCountry) return res.status(400).json({ message: 'Country code or business ID required' });

      const config = await prisma.complianceConfig.findFirst({
        where: {
          countryCode: targetCountry,
          isActive: true,
          effectiveFrom: { lte: new Date() },
          OR: [{ effectiveTo: null }, { effectiveTo: { gte: new Date() } }],
        },
        orderBy: { effectiveFrom: 'desc' },
        include: { deadlines: { where: { isActive: true } } },
      });

      res.json({ success: true, data: config?.deadlines || [] });
    } catch (error) {
      next(error);
    }
  },

  async getConnectors(req: Request, res: Response, next: NextFunction) {
    try {
      const countryCode = (req.query.countryCode as string)?.toUpperCase();
      if (!countryCode) return res.status(400).json({ message: 'Country code is required' });

      const config = await prisma.complianceConfig.findFirst({
        where: {
          countryCode,
          isActive: true,
          effectiveFrom: { lte: new Date() },
          OR: [{ effectiveTo: null }, { effectiveTo: { gte: new Date() } }],
        },
        orderBy: { effectiveFrom: 'desc' },
        include: { connectors: { where: { isActive: true } } },
      });

      res.json({ success: true, data: config?.connectors || [] });
    } catch (error) {
      next(error);
    }
  },

  async invalidateCache(req: Request, res: Response, next: NextFunction) {
    try {
      invalidateConfigCache(req.query.countryCode as string);
      res.json({ success: true, message: 'Cache invalidated' });
    } catch (error) {
      next(error);
    }
  },

  // ─── Admin: CRUD Operations ────────────────────────────────────

  async createConfig(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body;
      const config = await prisma.complianceConfig.create({ data });
      invalidateConfigCache(config.countryCode);
      res.status(201).json({ success: true, data: config });
    } catch (error) {
      next(error);
    }
  },

  async updateConfig(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const existing = await prisma.complianceConfig.findUnique({ where: { id } });
      if (!existing) return res.status(404).json({ message: 'Compliance config not found' });

      const data = req.body;
      const config = await prisma.complianceConfig.update({ where: { id }, data });
      invalidateConfigCache(config.countryCode);
      res.json({ success: true, data: config });
    } catch (error) {
      next(error);
    }
  },

  async deleteConfig(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const existing = await prisma.complianceConfig.findUnique({ where: { id } });
      if (!existing) return res.status(404).json({ message: 'Compliance config not found' });

      await prisma.complianceConfig.update({ where: { id }, data: { isActive: false } });
      invalidateConfigCache(existing.countryCode);
      res.json({ success: true, message: 'Compliance config deactivated' });
    } catch (error) {
      next(error);
    }
  },

  // ─── Admin: Tax Rules CRUD ──────────────────────────────────────

  async listTaxRules(req: Request, res: Response, next: NextFunction) {
    try {
      const configId = req.query.configId as string;
      const rules = await prisma.taxRule.findMany({
        where: configId ? { configId } : {},
        orderBy: [{ configId: 'asc' }, { priority: 'asc' }],
      });
      res.json({ success: true, data: rules });
    } catch (error) {
      next(error);
    }
  },

  async createTaxRule(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body;
      const rule = await prisma.taxRule.create({ data });
      invalidateConfigCache();
      res.status(201).json({ success: true, data: rule });
    } catch (error) {
      next(error);
    }
  },

  async updateTaxRule(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const existing = await prisma.taxRule.findUnique({ where: { id } });
      if (!existing) return res.status(404).json({ message: 'Tax rule not found' });

      const rule = await prisma.taxRule.update({ where: { id }, data: req.body });
      invalidateConfigCache();
      res.json({ success: true, data: rule });
    } catch (error) {
      next(error);
    }
  },

  async deleteTaxRule(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const existing = await prisma.taxRule.findUnique({ where: { id } });
      if (!existing) return res.status(404).json({ message: 'Tax rule not found' });

      await prisma.taxRule.update({ where: { id }, data: { isActive: false } });
      invalidateConfigCache();
      res.json({ success: true, message: 'Tax rule deactivated' });
    } catch (error) {
      next(error);
    }
  },

  // ─── Admin: Compliance Deadlines CRUD ───────────────────────────

  async listDeadlines(req: Request, res: Response, next: NextFunction) {
    try {
      const configId = req.query.configId as string;
      const deadlines = await prisma.complianceDeadline.findMany({
        where: configId ? { configId } : {},
        orderBy: { dueDay: 'asc' },
      });
      res.json({ success: true, data: deadlines });
    } catch (error) {
      next(error);
    }
  },

  async createDeadline(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body;
      const deadline = await prisma.complianceDeadline.create({ data });
      invalidateConfigCache();
      res.status(201).json({ success: true, data: deadline });
    } catch (error) {
      next(error);
    }
  },

  async updateDeadline(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const existing = await prisma.complianceDeadline.findUnique({ where: { id } });
      if (!existing) return res.status(404).json({ message: 'Deadline not found' });

      const deadline = await prisma.complianceDeadline.update({ where: { id }, data: req.body });
      invalidateConfigCache();
      res.json({ success: true, data: deadline });
    } catch (error) {
      next(error);
    }
  },

  async deleteDeadline(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const existing = await prisma.complianceDeadline.findUnique({ where: { id } });
      if (!existing) return res.status(404).json({ message: 'Deadline not found' });

      await prisma.complianceDeadline.update({ where: { id }, data: { isActive: false } });
      invalidateConfigCache();
      res.json({ success: true, message: 'Deadline deactivated' });
    } catch (error) {
      next(error);
    }
  },

  // ─── Admin: Government Connectors CRUD ──────────────────────────

  async listConnectorsAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const configId = req.query.configId as string;
      const connectors = await prisma.governmentConnector.findMany({
        where: configId ? { configId } : {},
      });
      res.json({ success: true, data: connectors });
    } catch (error) {
      next(error);
    }
  },

  async createConnector(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body;
      const connector = await prisma.governmentConnector.create({ data });
      invalidateConfigCache();
      res.status(201).json({ success: true, data: connector });
    } catch (error) {
      next(error);
    }
  },

  async updateConnector(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const existing = await prisma.governmentConnector.findUnique({ where: { id } });
      if (!existing) return res.status(404).json({ message: 'Connector not found' });

      const connector = await prisma.governmentConnector.update({ where: { id }, data: req.body });
      invalidateConfigCache();
      res.json({ success: true, data: connector });
    } catch (error) {
      next(error);
    }
  },

  async deleteConnector(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const existing = await prisma.governmentConnector.findUnique({ where: { id } });
      if (!existing) return res.status(404).json({ message: 'Connector not found' });

      await prisma.governmentConnector.update({ where: { id }, data: { isActive: false } });
      invalidateConfigCache();
      res.json({ success: true, message: 'Connector deactivated' });
    } catch (error) {
      next(error);
    }
  },
};
