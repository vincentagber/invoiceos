import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { logger } from '../utils/logger';
import fs from 'fs';
import path from 'path';

const UPLOAD_DIR = path.join(__dirname, '../../uploads');

export const uploadDocument = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const file = req.file;
        const { type } = req.body;

        if (!file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const fileExt = file.originalname.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const relativePath = `${req.user?.id || 'anonymous'}/${type || 'general'}`;
        const dirPath = path.join(UPLOAD_DIR, relativePath);

        fs.mkdirSync(dirPath, { recursive: true });
        fs.writeFileSync(path.join(dirPath, fileName), file.buffer);

        const url = `/uploads/${relativePath}/${fileName}`;

        res.json({
            success: true,
            message: 'Document committed to storage ledger.',
            url,
            fileName: file.originalname,
            path: `${relativePath}/${fileName}`,
        });
    } catch (error) {
        next(error);
    }
};
