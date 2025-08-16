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
/**
 * Only enforce:
 *  - correct field name ("files")
 *  - max counts/size (via limits)
 * DO NOT enforce MIME here (some clients label PDFs as octet-stream).
 */
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE, files: MAX_FILES },
  fileFilter: (_req, file, cb: FileFilterCallback) => {
    if (file.fieldname !== 'files') {
      return cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', file.fieldname));
    }
    cb(null, true);
  },
});
/** ------------------------------------------------------------------------- */

/**
 * Validate and process uploaded files:
 * - Strict magic-byte type check (PDF/JPEG only)
 * - AV scan via clamd (will return 415 on malware; 503 if scanner down unless you set AV_FAIL_OPEN=true)
 * - JPEG normalization (autorotate, strip metadata, re-encode)
 * - Safe randomized filename with correct extension
 * Produces req.processedFiles for the controller layer to persist.
 */
export async function validateAndProcessUploads(
  req: Request & { processedFiles?: ProcessedFile[] },
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const files = req.files as Express.Multer.File[] | undefined;
    if (!files?.length) {
      return void res.status(400).json({ error: 'NO_FILES' });
    }

    await ensureFileType();
    const processed: ProcessedFile[] = [];

    for (const file of files) {
      // 1) Magic-byte detection (authoritative)
      const ft = await fileTypeFromBuffer(file.buffer);
      if (!ft || !ALLOWED_MIME.has(ft.mime)) {
        return void res.status(415).json({
          error: 'UNSUPPORTED_FILE_TYPE',
          file: file.originalname,
          detected: ft?.mime || null,
        });
      }

      // 2) Antivirus scan
      const av = await scanBufferDetailed(file.buffer);
      if (av.status === 'FOUND') {
        return void res.status(415).json({
          error: 'MALWARE_DETECTED',
          file: file.originalname,
          signature: av.reason || undefined,
        });
      }
      if (av.status === 'ERROR') {
        const FAIL_OPEN = String(process.env.AV_FAIL_OPEN || '').toLowerCase() === 'true';
        if (!FAIL_OPEN) {
          return void res.status(503).json({
            error: 'AV_UNAVAILABLE',
            details: av.reason || av.raw || '',
          });
        }
        // fail-open in dev if configured
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

    req.processedFiles = processed;
    next();
  } catch (err) {
    next(err);
  }
}
