import multer, { FileFilterCallback } from 'multer';
import { Request, Response, NextFunction } from 'express';
import { extname } from 'path';
import { scanBuffer } from '../services/clamav.service';
import sharp from 'sharp';

import type { FileTypeResult } from 'file-type'; // compile-time only

/* -------------------------------------------------------------------------- */
/*  Helpers & constants                                                       */
/* -------------------------------------------------------------------------- */

export interface ProcessedFile {
  filename: string;
  buffer: Buffer;
  mimetype: string;
}

const ALLOWED_MIMES = ['image/jpeg', 'image/jpg', 'application/pdf'];

/**
 * Lazy-loads `file-type` once and memoises the reference.
 * This avoids the `require() of ES module … not supported` error
 * while keeping startup fast.
 */
let fileTypeFromBuffer: (b: Buffer) => Promise<FileTypeResult | undefined>;

async function ensureFileType(): Promise<void> {
  if (!fileTypeFromBuffer) {
    // dynamic import works in every CommonJS module
    const mod = await import('file-type');
    // `fromBuffer` was renamed to `fileTypeFromBuffer` in v17 – keep both
    fileTypeFromBuffer =
        (mod as any).fileTypeFromBuffer ?? (mod as any).fromBuffer;
  }
}

/* -------------------------------------------------------------------------- */
/*  Multer middleware                                                         */
/* -------------------------------------------------------------------------- */

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024, files: 5 },
  fileFilter: async (_req, file, cb: FileFilterCallback): Promise<void> => {
    try {
      /* 1 ─ quick MIME header check */
      if (!ALLOWED_MIMES.includes(file.mimetype)) {
        return cb(new Error('Unsupported file type'));
      }

      /* 2 ─ magic-bytes verification */
      await ensureFileType();
      const type = await fileTypeFromBuffer(file.buffer);
      if (!type || !ALLOWED_MIMES.includes(type.mime)) {
        return cb(new Error('File signature mismatch'));
      }

      cb(null, true);
    } catch (err) {
      cb(err as Error);
    }
  },
});

/* -------------------------------------------------------------------------- */
/*  Post-upload processing                                                    */
/* -------------------------------------------------------------------------- */

export async function validateAndProcessUploads(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
  const files = req.files as Express.Multer.File[] | undefined;
  if (!files?.length) return next();

  const processed: ProcessedFile[] = [];

  for (const file of files) {
    /* 3 ─ ClamAV scan */
    const clean = await scanBuffer(file.buffer);
    if (!clean) {
      res.status(415).json({ error: 'Malware detected' });
      return;
    }

    /* 4 ─ strip EXIF + auto-rotate for images */
    let buffer = file.buffer;
    if (file.mimetype.startsWith('image/')) {
      buffer = await sharp(buffer).rotate().toBuffer();
    }

    /* 5 ─ safe, random filename */
    const filename = `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}${extname(file.originalname)}`;

    processed.push({ filename, buffer, mimetype: file.mimetype });
  }

  (req as Request & { processedFiles: ProcessedFile[] }).processedFiles = processed;
  next();
}
