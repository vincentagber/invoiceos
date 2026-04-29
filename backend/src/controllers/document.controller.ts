import { Response, NextFunction } from 'express';
import { supabase } from '../lib/supabase';
import { AuthRequest } from '../middlewares/auth.middleware';
import { logger } from '../utils/logger';

export const uploadDocument = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const file = req.file;
        const { type } = req.body;

        if (!file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const fileExt = file.originalname.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `${req.user?.id}/${type || 'general'}/${fileName}`;

        // Attempt to upload to 'documents' bucket
        const { data, error } = await supabase.storage
            .from('documents')
            .upload(filePath, file.buffer, {
                contentType: file.mimetype,
                upsert: true
            });

        if (error) {
            logger.error('Document upload failure:', error);
            if (error.message.includes('bucket not found')) {
                return res.status(500).json({ 
                    error: 'Institutional storage bucket "documents" not found. Please initialize the "documents" bucket in Supabase Storage.' 
                });
            }
            throw error;
        }

        const { data: urlData } = supabase.storage
            .from('documents')
            .getPublicUrl(filePath);

        res.json({
            success: true,
            message: 'Document committed to storage ledger.',
            url: urlData.publicUrl,
            fileName: file.originalname,
            path: filePath
        });
    } catch (error) {
        next(error);
    }
};
