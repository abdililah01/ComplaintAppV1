import { Router } from 'express';
import rateLimit from 'express-rate-limit';

import { validate } from '../middleware/validate';
import { createComplaintSchema } from '../schemas/complaint.schema';
import { createComplaintHandler } from '../controllers/complaint.controller';
import { requireAuth } from '../middleware/requireAuth';

import { upload, validateAndProcessUploads } from '../middleware/upload.middleware';
import { saveAttachments } from '../controllers/file.controller';

const router = Router();

/** Per-route rate limiter for uploads */
const uploadLimiter = rateLimit({
  windowMs: Number(process.env.UPLOAD_RATE_WINDOW_MS || 60_000), // 1 min window
  max: Number(process.env.UPLOAD_RATE_MAX || 30),                // 30 requests/min/IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'RATE_LIMITED' },
});

/** POST /api/v1/complaints (create) */
router.post(
  '/complaints',
  requireAuth,
  validate(createComplaintSchema),
  createComplaintHandler
);

/** POST /api/v1/files (attachments)
 *  - rate-limited
 *  - <= 5 files (also enforced in multer limits)
 *  - validateAndProcessUploads does magic-byte + AV + jpeg normalize
 */
router.post(
  '/files',
  requireAuth,
  uploadLimiter,
  upload.array('files', 5),
  validateAndProcessUploads,
  saveAttachments
);

export default router;
