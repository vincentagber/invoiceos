import { Response, NextFunction } from 'express';
import { supabase } from '../lib/supabase';
import { AuthRequest } from '../middlewares/auth.middleware';
import nodemailer from 'nodemailer';
import { logger } from '../utils/logger';

export const getAll = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { data: business, error } = await supabase
            .from('organizations')
            .select('*, subscriptions(*)')
            .eq('owner_id', req.user?.id as string)
            .maybeSingle();

        if (error) throw error;
        if (!business) return res.status(404).json({ error: 'Business not found' });

        // Map Supabase snake_case to frontend camelCase
        const result = {
            ...business,
            name: business.name,
            businessName: business.name,
            brandColor: business.primary_color || business.brand_color || '#5E6AD2',
            logo: business.logo_url || business.logo || null,
            favicon: business.favicon_url || business.favicon || null,
            icon: business.icon_url || business.icon || null,
            taxNumber: business.tax_number || business.taxNumber || '',
            paymentDetails: business.payment_details || business.paymentDetails || '',
            defaultCurrency: business.default_currency || business.defaultCurrency || 'NGN',
            invoicePrefix: business.invoice_prefix || business.invoicePrefix || 'INV',
            defaultDuePeriod: business.default_due_period || business.defaultDuePeriod || 'Net 30 Days',
            defaultDiscount: business.default_discount || business.defaultDiscount || 0,
            defaultNotes: business.default_notes || business.defaultNotes || '',
            invoiceReminders: business.invoice_reminders ?? business.invoiceReminders ?? false,
            documentStyle: business.document_style || business.documentStyle || 'Professional',
            estimatePrefix: business.estimate_prefix || business.estimatePrefix || 'EST',
            bccEmails: business.bcc_emails ?? business.bccEmails ?? false,
            autoSendInvoice: business.auto_send_invoice ?? business.autoSendInvoice ?? false,
            paymentReminders: business.payment_reminders ?? business.paymentReminders ?? true,
            dailySummary: business.daily_summary ?? business.dailySummary ?? false,
            smtpConfig: business.smtp_config || business.smtpConfig || {},
        };

        res.json(result);
    } catch (error) {
        next(error);
    }
};

export const updateBusiness = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { businessName, address, email, phone, taxNumber, paymentDetails } = req.body;
        
        const { data: updated, error } = await supabase
            .from('organizations')
            .update({
                name: businessName,
                address,
                email,
                phone,
                tax_number: taxNumber,
                payment_details: paymentDetails,
                updated_at: new Date().toISOString()
            })
            .eq('owner_id', req.user?.id as string)
            .select()
            .single();

        if (error) throw error;
        res.json(updated);
    } catch (error) {
        next(error);
    }
};

export const updateBranding = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { brandColor, customDomain, logo, favicon, icon } = req.body;
        
        const data: any = { 
            primary_color: brandColor, 
            brand_color: brandColor,
            custom_domain: customDomain,
            updated_at: new Date().toISOString()
        };

        // Handle Base64 images or URLs
        if (logo) {
            if (logo.startsWith('http')) data.logo_url = logo;
            else data.logo = logo; // Keep as base64 in text/bytea column
        }
        if (favicon) {
            if (favicon.startsWith('http')) data.favicon_url = favicon;
            else data.favicon = favicon;
        }
        if (icon) {
            if (icon.startsWith('http')) data.icon_url = icon;
            else data.icon = icon;
        }

        const { data: updated, error } = await supabase
            .from('organizations')
            .update(data)
            .eq('owner_id', req.user?.id as string)
            .select()
            .single();

        if (error) throw error;
        res.json({ success: true, data: updated });
    } catch (error) {
        next(error);
    }
};

export const updateInvoiceDefaults = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { defaultCurrency, invoicePrefix, defaultDuePeriod, defaultDiscount, defaultNotes } = req.body;
        
        const { data: updated, error } = await supabase
            .from('organizations')
            .update({
                default_currency: defaultCurrency,
                invoice_prefix: invoicePrefix,
                default_due_period: defaultDuePeriod,
                default_discount: parseFloat(defaultDiscount) || 0,
                default_notes: defaultNotes,
                updated_at: new Date().toISOString()
            })
            .eq('owner_id', req.user?.id as string)
            .select()
            .single();

        if (error) throw error;
        res.json(updated);
    } catch (error) {
        next(error);
    }
};

export const updateWorkflow = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { invoiceReminders, documentStyle, estimatePrefix, bccEmails } = req.body;
        
        const { data: updated, error } = await supabase
            .from('organizations')
            .update({
                invoice_reminders: invoiceReminders,
                document_style: documentStyle,
                estimate_prefix: estimatePrefix,
                bcc_emails: bccEmails,
                updated_at: new Date().toISOString()
            })
            .eq('owner_id', req.user?.id as string)
            .select()
            .single();

        if (error) throw error;
        res.json(updated);
    } catch (error) {
        next(error);
    }
};

export const updateNotifications = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { autoSendInvoice, paymentReminders, dailySummary } = req.body;
        
        const { data: updated, error } = await supabase
            .from('organizations')
            .update({
                auto_send_invoice: autoSendInvoice,
                payment_reminders: paymentReminders,
                daily_summary: dailySummary,
                updated_at: new Date().toISOString()
            })
            .eq('owner_id', req.user?.id as string)
            .select()
            .single();

        if (error) throw error;
        res.json(updated);
    } catch (error) {
        next(error);
    }
};

export const updateEmail = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { smtpHost, smtpPort, smtpUsername, smtpPassword, fromName, fromEmail } = req.body;
        
        const { data: updated, error } = await supabase
            .from('organizations')
            .update({
                smtp_config: {
                    host: smtpHost,
                    port: smtpPort,
                    user: smtpUsername,
                    pass: smtpPassword,
                    fromName,
                    fromEmail
                },
                updated_at: new Date().toISOString()
            })
            .eq('owner_id', req.user?.id as string)
            .select()
            .single();

        if (error) throw error;
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
        logger.error('SMTP Test Failure:', error);
        res.status(500).json({ error: `SMTP Verification Failed: ${error.message}` });
    }
};

export const deleteBusiness = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        // 1. Check for other workspaces
        const { count, error: countError } = await supabase
            .from('organizations')
            .select('*', { count: 'exact', head: true })
            .eq('owner_id', req.user?.id as string);

        if (countError) throw countError;
        if (count && count <= 1) {
            return res.status(400).json({ error: 'Cannot delete your only institutional workspace. Create another before termination.' });
        }

        const { error: delError } = await supabase
            .from('organizations')
            .delete()
            .eq('owner_id', req.user?.id as string);

        if (delError) throw delError;
        res.json({ success: true });
    } catch (error) {
        next(error);
    }
};

export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { name, profilePicture } = req.body;
        
        const { data: updated, error } = await supabase
            .from('users') 
            .update({ 
                name, 
                profile_picture: profilePicture,
                updated_at: new Date().toISOString()
            })
            .eq('id', req.user?.id as string)
            .select()
            .single();

        if (error) throw error;
        res.json({ success: true, data: updated });
    } catch (error) {
        next(error);
    }
};


