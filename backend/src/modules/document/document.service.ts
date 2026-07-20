import fs from 'fs';
import path from 'path';

const UPLOAD_DIR = path.join(__dirname, '../../uploads');
const ALLOWED_TYPES = ['general', 'invoice', 'receipt', 'tax', 'expense'];

const sanitizeType = (type: string): string => {
  if (!type) return 'general';
  const clean = type.replace(/[^a-zA-Z0-9_-]/g, '');
  return ALLOWED_TYPES.includes(clean) ? clean : 'general';
};

export const documentService = {
  upload(file: Express.Multer.File, type: string, userId: string) {
    const safeType = sanitizeType(type);
    const fileExt = file.originalname.split('.').pop()?.replace(/[^a-zA-Z0-9]/g, '') || 'bin';
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const relativePath = `${userId}/${safeType}`;
    const dirPath = path.join(UPLOAD_DIR, relativePath);

    const resolvedDir = path.resolve(dirPath);
    const resolvedUploadDir = path.resolve(UPLOAD_DIR);
    if (!resolvedDir.startsWith(resolvedUploadDir)) {
      throw new Error('Invalid upload path');
    }

    fs.mkdirSync(dirPath, { recursive: true });
    fs.writeFileSync(path.join(dirPath, fileName), file.buffer);

    return {
      success: true,
      message: 'Document committed to storage ledger.',
      url: `/uploads/${relativePath}/${fileName}`,
      fileName: file.originalname,
    };
  },
};
