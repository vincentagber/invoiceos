import { Router, Request, Response, NextFunction } from 'express';
import multer, { FileFilterCallback } from 'multer';
import * as documentController from '../controllers/document.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// Configure storage to use memory for streaming to Supabase
const storage = multer.memoryStorage();

// Define allowed institutional MIME types
const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/png',
    'image/jpeg'
];

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
    },
    fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Unsupported file type. Please upload PDF, Word, Excel, or Images.') as any, false);
        }
    }
});

router.use(authenticate);

/**
 * Local Error Handler for Multer
 * Intercepts size and type errors before they reach the controller
 */
const multerErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File too large. Institutional limit is 10MB.' });
        }
        return res.status(400).json({ error: `Upload protocol error: ${err.message}` });
    } else if (err) {
        return res.status(400).json({ error: err.message });
    }
    next();
};

router.post('/upload', upload.single('file'), multerErrorHandler, documentController.uploadDocument);

export default router;

