import { Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { logger } from '../utils/logger';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || process.env.JWT_SECRET!;
const ALGORITHM = 'aes-256-gcm';

const encrypt = (text: string): string => {
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'invoiceos-salt', 32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
};

const decrypt = (encryptedText: string): string => {
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'invoiceos-salt', 32);
  const [ivHex, authTagHex, encrypted] = encryptedText.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

export const getAll = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const business = await prisma.business.findFirst({
            where: { ownerId: req.user?.id as string },
            include: { subscription: true },
        });

        if (!business) return res.status(404).json({ error: 'Business not found' });

        // Mask SMTP password in response
        const smtpConfig = business.smtpConfig as any || {};
        if (smtpConfig.pass) {
          smtpConfig.pass = '••••••••';
        }

        res.json({
            ...business,
            smtpConfig,
            businessName: business.name,
            brandColor: business.brandColor || '#5E6AD2',
            logo: null,
            favicon: null,
            icon: null,
        });
    } catch (error) {
        next(error);
    }
};

export const updateBusiness = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { businessName, address, email, phone, taxNumber, paymentDetails } = req.body;

        const updated = await prisma.business.updateMany({
            where: { ownerId: req.user?.id as string },
            data: {
                name: businessName,
                address: address || null,
                email: email || null,
                phone: phone || null,
                taxNumber: taxNumber || null,
                paymentDetails: paymentDetails || null,
            },
        });

        res.json({ success: true, count: updated.count });
    } catch (error) {
        next(error);
    }
};

export const updateBranding = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { brandColor, customDomain } = req.body;

        const data: any = {};
        if (brandColor) data.brandColor = brandColor;
        if (customDomain) data.customDomain = customDomain;

        await prisma.business.updateMany({
            where: { ownerId: req.user?.id as string },
            data,
        });

        res.json({ success: true });
    } catch (error) {
        next(error);
    }
};

export const updateInvoiceDefaults = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { defaultCurrency, invoicePrefix, defaultDuePeriod, defaultDiscount, defaultNotes } = req.body;

        await prisma.business.updateMany({
            where: { ownerId: req.user?.id as string },
            data: {
                defaultCurrency: defaultCurrency || undefined,
                invoicePrefix: invoicePrefix || undefined,
                defaultDuePeriod: defaultDuePeriod || undefined,
                defaultDiscount: parseFloat(defaultDiscount) || 0,
                defaultNotes: defaultNotes || undefined,
            },
        });

        res.json({ success: true });
    } catch (error) {
        next(error);
    }
};

export const updateWorkflow = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { invoiceReminders, documentStyle, estimatePrefix, bccEmails } = req.body;

        await prisma.business.updateMany({
            where: { ownerId: req.user?.id as string },
            data: {
                invoiceReminders: invoiceReminders ?? undefined,
                documentStyle: documentStyle || undefined,
                invoicePrefix: estimatePrefix || undefined,
                bccEmails: bccEmails ?? undefined,
            },
        });

        res.json({ success: true });
    } catch (error) {
        next(error);
    }
};

export const updateNotifications = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { autoSendInvoice, paymentReminders, dailySummary } = req.body;

        await prisma.business.updateMany({
            where: { ownerId: req.user?.id as string },
            data: {
                autoSendInvoice: autoSendInvoice ?? undefined,
                paymentReminders: paymentReminders ?? undefined,
                dailySummary: dailySummary ?? undefined,
            },
        });

        res.json({ success: true });
    } catch (error) {
        next(error);
    }
};

export const updateEmail = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { smtpHost, smtpPort, smtpUsername, smtpPassword, fromName, fromEmail } = req.body;

        const encryptedPassword = smtpPassword ? encrypt(smtpPassword) : undefined;

        await prisma.business.updateMany({
            where: { ownerId: req.user?.id as string },
            data: {
                smtpConfig: {
                    host: smtpHost,
                    port: smtpPort,
                    user: smtpUsername,
                    pass: encryptedPassword,
                    fromName,
                    fromEmail,
                },
            },
        });

        res.json({ success: true });
    } catch (error) {
        next(error);
    }
};

export const sendTestEmail = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { smtpHost, smtpPort, smtpUsername, smtpPassword, fromName, fromEmail } = req.body;

        const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: parseInt(smtpPort),
            secure: parseInt(smtpPort) === 465,
            auth: {
                user: smtpUsername,
                pass: smtpPassword,
            },
        });

        await transporter.sendMail({
            from: `"${fromName}" <${fromEmail}>`,
            to: req.user?.email,
            subject: 'InvoiceOS - Institutional SMTP Verification',
            text: 'Your SMTP configuration has been successfully verified by the InvoiceOS ledger.',
            html: '<b>Your SMTP configuration has been successfully verified by the InvoiceOS ledger.</b>',
        });

        res.json({ success: true, message: 'Institutional test email dispatched.' });
    } catch (error: any) {
        logger.error('SMTP Test Failure:', error);
        res.status(500).json({ error: `SMTP Verification Failed: ${error.message}` });
    }
};

export const deleteBusiness = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const count = await prisma.business.count({
            where: { ownerId: req.user?.id as string },
        });

        if (count <= 1) {
            return res.status(400).json({ error: 'Cannot delete your only institutional workspace. Create another before termination.' });
        }

        await prisma.business.deleteMany({
            where: { ownerId: req.user?.id as string },
        });

        res.json({ success: true });
    } catch (error) {
        next(error);
    }
};

export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { name, profilePicture } = req.body;

        await prisma.user.update({
            where: { id: req.user?.id as string },
            data: {
                name: name || undefined,
            },
        });

        res.json({ success: true });
    } catch (error) {
        next(error);
    }
};
