// files: src/types/express.d.ts
import 'express';
import type { AccessClaims } from '../trx/auth/jwt';

declare module 'express-serve-static-core' {
  interface Request {
    auth?: AccessClaims;
    files?: Express.Multer.File[];
    processedFiles?: Array<{
      filename: string;
      buffer: Buffer;
      mimetype: string;
    }>;
  }
}
