import prisma from '../../lib/prisma';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { NotFoundError } from '../../shared/errors';
import { logger } from '../../utils/logger';

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

export const settingsService = {
  async getAll(userId: string) {
    const business = await prisma.business.findFirst({
      where: { ownerId: userId },
      include: { subscription: true },
    });
    if (!business) throw new NotFoundError('Business');

    const smtpConfig = (business.smtpConfig as Record<string, unknown>) || {};
    if (smtpConfig.pass) smtpConfig.pass = '••••••••';

    return {
      ...business,
      smtpConfig,
      businessName: business.name,
      brandColor: business.brandColor || '#5E6AD2',
      logo: null,
      favicon: null,
      icon: null,
    };
  },

  async updateBusiness(userId: string, data: { businessName?: string; address?: string; email?: string; phone?: string; taxNumber?: string; paymentDetails?: string }) {
    await prisma.business.updateMany({
      where: { ownerId: userId },
      data: {
        name: data.businessName,
        address: data.address || null,
        email: data.email || null,
        phone: data.phone || null,
        taxNumber: data.taxNumber || null,
        paymentDetails: data.paymentDetails || null,
      },
    });
    return { success: true };
  },

  async updateBranding(userId: string, data: { brandColor?: string; customDomain?: string }) {
    const updateData: Record<string, unknown> = {};
    if (data.brandColor) updateData.brandColor = data.brandColor;
    if (data.customDomain) updateData.customDomain = data.customDomain;

    await prisma.business.updateMany({ where: { ownerId: userId }, data: updateData });
    return { success: true };
  },

  async updateInvoiceDefaults(userId: string, data: { defaultCurrency?: string; invoicePrefix?: string; defaultDuePeriod?: string; defaultDiscount?: number; defaultNotes?: string }) {
    await prisma.business.updateMany({
      where: { ownerId: userId },
      data: {
        defaultCurrency: data.defaultCurrency || undefined,
        invoicePrefix: data.invoicePrefix || undefined,
        defaultDuePeriod: data.defaultDuePeriod || undefined,
        defaultDiscount: data.defaultDiscount !== undefined ? data.defaultDiscount : 0,
        defaultNotes: data.defaultNotes || undefined,
      },
    });
    return { success: true };
  },

  async updateWorkflow(userId: string, data: { invoiceReminders?: boolean; documentStyle?: string; estimatePrefix?: string; bccEmails?: boolean }) {
    await prisma.business.updateMany({
      where: { ownerId: userId },
      data: {
        invoiceReminders: data.invoiceReminders ?? undefined,
        documentStyle: data.documentStyle || undefined,
        invoicePrefix: data.estimatePrefix || undefined,
        bccEmails: data.bccEmails ?? undefined,
      },
    });
    return { success: true };
  },

  async updateNotifications(userId: string, data: { autoSendInvoice?: boolean; paymentReminders?: boolean; dailySummary?: boolean }) {
    await prisma.business.updateMany({
      where: { ownerId: userId },
      data: {
        autoSendInvoice: data.autoSendInvoice ?? undefined,
        paymentReminders: data.paymentReminders ?? undefined,
        dailySummary: data.dailySummary ?? undefined,
      },
    });
    return { success: true };
  },

  async updateEmail(userId: string, data: { smtpHost?: string; smtpPort?: string; smtpUsername?: string; smtpPassword?: string; fromName?: string; fromEmail?: string }) {
    const encryptedPassword = data.smtpPassword ? encrypt(data.smtpPassword) : undefined;

    await prisma.business.updateMany({
      where: { ownerId: userId },
      data: {
        smtpConfig: {
          host: data.smtpHost,
          port: data.smtpPort,
          user: data.smtpUsername,
          pass: encryptedPassword,
          fromName: data.fromName,
          fromEmail: data.fromEmail,
        },
      },
    });
    return { success: true };
  },

  async sendTestEmail(userId: string, data: { smtpHost: string; smtpPort: string; smtpUsername: string; smtpPassword: string; fromName: string; fromEmail: string }) {
    const transporter = nodemailer.createTransport({
      host: data.smtpHost,
      port: parseInt(data.smtpPort),
      secure: parseInt(data.smtpPort) === 465,
      auth: { user: data.smtpUsername, pass: data.smtpPassword },
    });

    await transporter.sendMail({
      from: `"${data.fromName}" <${data.fromEmail}>`,
      to: reqUserEmail(userId),
      subject: 'InvoiceOS - Institutional SMTP Verification',
      text: 'Your SMTP configuration has been successfully verified by the InvoiceOS ledger.',
      html: '<b>Your SMTP configuration has been successfully verified by the InvoiceOS ledger.</b>',
    });

    return { success: true, message: 'Institutional test email dispatched.' };
  },

  async deleteBusiness(userId: string) {
    const count = await prisma.business.count({ where: { ownerId: userId } });
    if (count <= 1) {
      throw new Error('Cannot delete your only institutional workspace. Create another before termination.');
    }
    await prisma.business.deleteMany({ where: { ownerId: userId } });
    return { success: true };
  },

  async updateProfile(userId: string, data: { name?: string }) {
    await prisma.user.update({
      where: { id: userId },
      data: { name: data.name || undefined },
    });
    return { success: true };
  },
};

function reqUserEmail(_userId: string): string {
  return 'user@example.com';
}

export const reqUserEmailExport = reqUserEmail;
