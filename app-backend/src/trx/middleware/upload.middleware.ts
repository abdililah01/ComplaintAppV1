import multer, { FileFilterCallback } from 'multer';
import { Request, Response, NextFunction } from 'express';
import { extname } from 'path';
import { scanBuffer } from '../services/clamav.service';
import sharp from 'sharp';

/* -------- Lazy ESM loader for file-type --------------------------------- */
type FileTypeResult = import('file-type').FileTypeResult;
let fileTypeFromBuffer: (b: Buffer) => Promise<FileTypeResult | undefined>;

async function ensureFileType(): Promise<void> {
  if (!fileTypeFromBuffer) {
    const mod = await import('file-type');
    fileTypeFromBuffer =
        (mod as any).fileTypeFromBuffer ?? (mod as any).fromBuffer;
  }
}
/* ------------------------------------------------------------------------ */

export interface ProcessedFile {
  filename: string;
  buffer: Buffer;
  mimetype: string;
}

const ALLOWED_MIMES = ['image/jpeg', 'image/jpg', 'application/pdf'];

/* -------------------- Multer config ------------------------------------- */
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024, files: 5 },
  fileFilter: (_req, file, cb: FileFilterCallback) => {
    if (ALLOWED_MIMES.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Unsupported file type'));
  },
});

/* ---------------- Post-upload pipeline ---------------------------------- */
export async function validateAndProcessUploads(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
  const files = req.files as Express.Multer.File[] | undefined;
  if (!files?.length) return next();

  const processed: ProcessedFile[] = [];

  await ensureFileType();

  for (const file of files) {
    /* 1 — magic-byte verification */
    const detected = await fileTypeFromBuffer(file.buffer);
    if (!detected || !ALLOWED_MIMES.includes(detected.mime)) {
      res.status(415).json({ error: `File signature mismatch: ${file.originalname}` }); // FIX
      return;                                                                           // FIX
    }

    /* 2 — ClamAV */
    if (!(await scanBuffer(file.buffer))) {
      res.status(415).json({ error: `Malware detected in ${file.originalname}` });      // FIX
      return;                                                                           // FIX
    }

    /* 3 — strip EXIF / auto-rotate */
    let buffer = file.buffer;
    if (file.mimetype.startsWith('image/')) {
      buffer = await sharp(buffer).rotate().toBuffer();
    }

    /* 4 — safe filename */
    const filename =
        `${Date.now()}-${Math.random().toString(36).slice(2)}${extname(file.originalname)}`;

    processed.push({ filename, buffer, mimetype: file.mimetype });
  }

  (req as Request & { processedFiles: ProcessedFile[] }).processedFiles = processed;
  next();
}
