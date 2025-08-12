// app-backend/src/trx/middlewares/upload.middleware.ts
import multer, { FileFilterCallback } from 'multer';
import { Request, Response, NextFunction } from 'express';
import sharp from 'sharp';
import crypto from 'crypto';
import { scanBufferDetailed } from '../services/clamav.service';

/** ---- Lazy ESM loader for file-type (works with TS/ESM/CommonJS builds) ---- */
type FileTypeResult = import('file-type').FileTypeResult;
let fileTypeFromBuffer: (b: Buffer) => Promise<FileTypeResult | undefined>;

async function ensureFileType(): Promise<void> {
  if (!fileTypeFromBuffer) {
    const mod = await import('file-type');
    // handle both modern and legacy exports
    fileTypeFromBuffer =
      (mod as any).fileTypeFromBuffer ?? (mod as any).fromBuffer;
  }
}
/** ------------------------------------------------------------------------- */

export interface ProcessedFile {
  filename: string;   // safe randomized filename with correct extension
  buffer: Buffer;     // final processed bytes (after AV + normalization)
  mimetype: string;   // detected MIME from magic bytes (authoritative)
}

export const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB
export const MAX_FILES = 5;
const ALLOWED_MIME = new Set(['image/jpeg', 'application/pdf']);

function extForMime(mime: string): '.jpg' | '.pdf' {
  return mime === 'image/jpeg' ? '.jpg' : '.pdf';
}

/** -------------------- Multer (memory) config ----------------------------- */
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE, files: MAX_FILES },
  fileFilter: (_req, file, cb: FileFilterCallback) => {
    // Hint for clients; real enforcement is via magic bytes below
    if (ALLOWED_MIME.has(file.mimetype)) cb(null, true);
    else cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', file.fieldname));
  },
});
/** ------------------------------------------------------------------------- */

/**
 * Validate and process uploaded files:
 * - Strict magic-byte type check (PDF/JPEG only)
 * - Real AV scan via clamd with detailed status (CLEAN | FOUND | ERROR)
 * - JPEG normalization (autorotate, strip metadata, re-encode)
 * - Safe randomized filename with correct extension
 * Produces req.processedFiles for the controller layer to persist.
 */
export async function validateAndProcessUploads(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const files = req.files as Express.Multer.File[] | undefined;
    if (!files?.length) {
      res.status(400).json({ error: 'NO_FILES' });
      return;
    }

    await ensureFileType();

    const processed: ProcessedFile[] = [];

    for (const file of files) {
      // 1) Strict magic-byte detection
      const ft = await fileTypeFromBuffer(file.buffer);
      if (!ft || !ALLOWED_MIME.has(ft.mime)) {
        res.status(415).json({
          error: 'UNSUPPORTED_FILE_TYPE',
          file: file.originalname,
        });
        return;
      }

      // 2) Antivirus scan with detailed result
      const av = await scanBufferDetailed(file.buffer);
      if (av.status === 'FOUND') {
        res.status(415).json({
          error: 'MALWARE_DETECTED',
          file: file.originalname,
        });
        return;
      }
      if (av.status === 'ERROR') {
        // Clamd not reachable / protocol issue — surface as service unavailable
        res.status(503).json({
          error: 'AV_UNAVAILABLE',
          details: av.reason || av.raw || '',
        });
        return;
      }

      // 3) JPEG normalization (autorotate + strip metadata)
      let outBuffer = file.buffer;
      if (ft.mime === 'image/jpeg') {
        outBuffer = await sharp(outBuffer).rotate().jpeg({ quality: 90 }).toBuffer();
      }

      // 4) Safe randomized filename with correct extension
      const id = typeof (crypto as any).randomUUID === 'function'
        ? (crypto as any).randomUUID()
        : crypto.randomBytes(8).toString('hex');
      const safeName = `${Date.now()}-${id}${extForMime(ft.mime)}`;

      processed.push({
        filename: safeName,
        buffer: outBuffer,
        mimetype: ft.mime,
      });
    }

    (req as Request & { processedFiles: ProcessedFile[] }).processedFiles = processed;
    next();
  } catch (err) {
    next(err);
  }
}
