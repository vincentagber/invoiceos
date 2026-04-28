import { Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';
import nodemailer from 'nodemailer';

export const getAll = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const business = await prisma.business.findFirst({
            where: { ownerId: req.user?.id },
            include: { subscription: true }
        });

        if (!business) return res.status(404).json({ error: 'Business not found' });

        // Convert Buffer to Base64 for the frontend
        const result = {
            ...business,
            logo: business.logo ? `data:image/png;base64,${Buffer.from(business.logo).toString('base64')}` : null,
            favicon: business.favicon ? `data:image/png;base64,${Buffer.from(business.favicon).toString('base64')}` : null,
            icon: business.icon ? `data:image/png;base64,${Buffer.from(business.icon).toString('base64')}` : null,
        };

        res.json(result);
    } catch (error) {
        next(error);
    }
};

export const updateBusiness = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { businessName, address, email, phone, taxNumber, paymentDetails } = req.body;
        const business = await prisma.business.findFirst({ where: { ownerId: req.user?.id } });
        if (!business) return res.status(404).json({ error: 'Business not found' });

        const updated = await prisma.business.update({
            where: { id: business.id },
            data: {
                name: businessName,
                address,
                email,
                phone,
                taxNumber,
                paymentDetails
            }
        });

        res.json(updated);
    } catch (error) {
        next(error);
    }
};

export const updateBranding = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { brandColor, customDomain, logo, favicon, icon } = req.body;
        const business = await prisma.business.findFirst({ where: { ownerId: req.user?.id } });
        if (!business) return res.status(404).json({ error: 'Business not found' });

        const data: any = { brandColor, customDomain };

        // Handle Base64 images
        if (logo && logo.startsWith('data:')) {
            data.logo = Buffer.from(logo.split(',')[1], 'base64');
        }
        if (favicon && favicon.startsWith('data:')) {
            data.favicon = Buffer.from(favicon.split(',')[1], 'base64');
        }
        if (icon && icon.startsWith('data:')) {
            data.icon = Buffer.from(icon.split(',')[1], 'base64');
        }

        const updated = await prisma.business.update({
            where: { id: business.id },
            data
        });

        res.json({ success: true });
    } catch (error) {
        next(error);
    }
};

export const updateInvoiceDefaults = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { defaultCurrency, invoicePrefix, defaultDuePeriod, defaultDiscount, defaultNotes } = req.body;
        const business = await prisma.business.findFirst({ where: { ownerId: req.user?.id } });
        if (!business) return res.status(404).json({ error: 'Business not found' });

        const updated = await prisma.business.update({
            where: { id: business.id },
            data: {
                defaultCurrency,
                invoicePrefix,
                defaultDuePeriod,
                defaultDiscount: parseFloat(defaultDiscount) || 0,
                defaultNotes
            }
        });

        res.json(updated);
    } catch (error) {
        next(error);
    }
};

export const updateWorkflow = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { invoiceReminders, documentStyle, estimatePrefix, bccEmails } = req.body;
        const business = await prisma.business.findFirst({ where: { ownerId: req.user?.id } });
        if (!business) return res.status(404).json({ error: 'Business not found' });

        const updated = await prisma.business.update({
            where: { id: business.id },
            data: {
                invoiceReminders,
                documentStyle,
                estimatePrefix,
                bccEmails
            }
        });

        res.json(updated);
    } catch (error) {
        next(error);
    }
};

export const updateNotifications = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { autoSendInvoice, paymentReminders, dailySummary } = req.body;
        const business = await prisma.business.findFirst({ where: { ownerId: req.user?.id } });
        if (!business) return res.status(404).json({ error: 'Business not found' });

        const updated = await prisma.business.update({
            where: { id: business.id },
            data: {
                autoSendInvoice,
                paymentReminders,
                dailySummary
            }
        });

        res.json(updated);
    } catch (error) {
        next(error);
    }
};

export const updateEmail = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { smtpHost, smtpPort, smtpUsername, smtpPassword, fromName, fromEmail } = req.body;
        const business = await prisma.business.findFirst({ where: { ownerId: req.user?.id } });
        if (!business) return res.status(404).json({ error: 'Business not found' });

        const updated = await prisma.business.update({
            where: { id: business.id },
            data: {
                smtpConfig: {
                    host: smtpHost,
                    port: smtpPort,
                    user: smtpUsername,
                    pass: smtpPassword,
                    fromName,
                    fromEmail
                }
            }
        });

        res.json(updated);
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
        res.status(500).json({ error: `SMTP Verification Failed: ${error.message}` });
    }
};

export const deleteBusiness = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const business = await prisma.business.findFirst({ 
            where: { ownerId: req.user?.id },
            include: { subscription: true }
        });
        
        if (!business) return res.status(404).json({ error: 'Business not found' });

        // Safeguard: Check if only business
        const count = await prisma.business.count({ where: { ownerId: req.user?.id } });
        if (count <= 1) {
            return res.status(400).json({ error: 'Cannot delete your only institutional workspace. Create another before termination.' });
        }

        // Safeguard: Active subscription
        if (business.subscription && business.subscription.status === 'ACTIVE') {
            return res.status(400).json({ error: 'Active subscription detected. Cancel subscription before workspace termination.' });
        }

        await prisma.business.delete({ where: { id: business.id } });
        res.json({ success: true });
    } catch (error) {
        next(error);
    }
};

export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { name, profilePicture } = req.body;
        const data: any = { name };

        if (profilePicture && profilePicture.startsWith('data:')) {
            data.profilePicture = Buffer.from(profilePicture.split(',')[1], 'base64');
        }

        const updated = await prisma.user.update({
            where: { id: req.user?.id },
            data
        });

        res.json({ success: true });
    } catch (error) {
        next(error);
    }
};
