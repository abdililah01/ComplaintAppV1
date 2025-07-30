import { Router } from 'express';
import { validate } from '../middleware/validate';
import {
    createComplaintSchema,
} from '../schemas/complaint.schema';
import { createComplaintHandler } from '../controllers/complaint.controller';

const router = Router();

// POST /api/v1/complaints
router.post(
    '/complaints',
    validate(createComplaintSchema),
    createComplaintHandler
);

export default router;
