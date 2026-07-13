import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { logger } from '../utils/logger';
import fs from 'fs';
import path from 'path';

const UPLOAD_DIR = path.join(__dirname, '../../uploads');

// Whitelist of allowed document type subdirectories
const ALLOWED_TYPES = ['general', 'invoice', 'receipt', 'tax', 'expense'];

const sanitizeType = (type: string): string => {
  if (!type) return 'general';
  // Strip path traversal and non-alphanumeric chars (except hyphens/underscores)
  const clean = type.replace(/[^a-zA-Z0-9_-]/g, '');
  return ALLOWED_TYPES.includes(clean) ? clean : 'general';
};

export const uploadDocument = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const file = req.file;
        const { type } = req.body;

        if (!file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const safeType = sanitizeType(type);
        const fileExt = file.originalname.split('.').pop()?.replace(/[^a-zA-Z0-9]/g, '') || 'bin';
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const relativePath = `${req.user?.id || 'anonymous'}/${safeType}`;
        const dirPath = path.join(UPLOAD_DIR, relativePath);

        // Ensure the resolved path is within UPLOAD_DIR
        const resolvedDir = path.resolve(dirPath);
        const resolvedUploadDir = path.resolve(UPLOAD_DIR);
        if (!resolvedDir.startsWith(resolvedUploadDir)) {
            return res.status(400).json({ error: 'Invalid upload path' });
        }

        fs.mkdirSync(dirPath, { recursive: true });
        fs.writeFileSync(path.join(dirPath, fileName), file.buffer);

        const url = `/uploads/${relativePath}/${fileName}`;

        res.json({
            success: true,
            message: 'Document committed to storage ledger.',
            url,
            fileName: file.originalname,
        });
    } catch (error) {
        next(error);
    }
};
