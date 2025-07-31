// files: src/types/express.d.ts
import 'express-serve-static-core';
import type { ProcessedFile } from '../trx/middleware/upload.middleware';

declare module 'express-serve-static-core' {
  interface Request {
    /** existing custom request ID, if any */
    id?: string;

    /** injected by our Multer middleware */
    files?: Express.Multer.File[];

    /** set by validateAndProcessUploads */
    processedFiles?: ProcessedFile[];
  }
}
