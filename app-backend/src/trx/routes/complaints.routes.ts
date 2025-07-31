// src/trx/routes/complaints.routes.ts
import { Router } from 'express';
import { validate } from '../middleware/validate';
import {
    createComplaintSchema,
} from '../schemas/complaint.schema';
import { createComplaintHandler } from '../controllers/complaint.controller';
import { upload, validateAndProcessUploads } from '../middleware/upload.middleware';
import { saveAttachments } from '../controllers/file.controller';

const router = Router();

// POST /api/v1/complaints
router.post(
    '/complaints',
    validate(createComplaintSchema),
    createComplaintHandler
);

// Day 5 — Secure uploads
router.post(
    '/files',
    upload.array('files'),
    validateAndProcessUploads,
    saveAttachments
);
export default router;
