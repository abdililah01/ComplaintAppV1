// files: src/types/express.d.ts
import 'express-serve-static-core';

declare module 'express-serve-static-core' {
  interface Request {
    files?: Express.Multer.File[];
    processedFiles?: Array<{
      filename: string;
      buffer: Buffer;
      mimetype: string;
    }>;
  }
}
