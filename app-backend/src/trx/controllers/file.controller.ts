import { Request, Response, NextFunction } from 'express';
import prisma from '../../common/prisma';
import type { Prisma } from '@prisma/client';
import { mkdir, writeFile } from 'fs/promises';
import { resolve, join, extname } from 'path';

/* ---------- Types shared with upload.middleware ------------------------ */
export interface ProcessedFile {
  filename: string;    // randomized safe name with proper extension
  buffer: Buffer;      // AV-checked + normalized bytes
  mimetype: string;    // authoritative MIME from magic bytes
}

interface RequestWithFiles extends Request {
  processedFiles?: ProcessedFile[];
  body: { complaintId?: string | number; [k: string]: unknown };
  // `requireAuth` attaches `auth` (AccessClaims) to req
  auth?: { jti?: string } | any;
}

/* ---------- Prisma typed select (omit Contenu) ------------------------- */
const pieceJointeSelect = {
  Id: true,
  IdPlainte: true,
  extensionPJ: true,
  TypePieceJointe: true,
  SessionId: true,
} satisfies Prisma.PieceJointeSelect;

type PieceJointePublic = Prisma.PieceJointeGetPayload<{
  select: typeof pieceJointeSelect;
}>;

/* ---------- Controller ------------------------------------------------- */
export async function saveAttachments(
  req: RequestWithFiles,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // MUST have a verified token with a session id
    const jti: string | undefined = (req as any)?.auth?.jti;
    if (!jti) {
      res.status(401).json({ error: 'UNAUTHORIZED' });
      return;
    }

    const idPlainte = Number(req.body?.complaintId);
    if (!idPlainte || Number.isNaN(idPlainte)) {
      res.status(400).json({ error: 'INVALID_COMPLAINT_ID' });
      return;
    }

    // Prefer processed files from the AV/magic-bytes step; fallback to raw multer if needed
    const files: ProcessedFile[] | undefined =
      req.processedFiles ||
      ((req.files as any as Express.Multer.File[] | undefined)?.map((f) => ({
        filename: f.originalname,
        buffer: f.buffer,
        mimetype: f.mimetype,
      })) ?? undefined);

    if (!files?.length) {
      res.status(400).json({ error: 'NO_FILES' });
      return;
    }

    // Optional disk copy alongside DB BLOB (keeps your current behavior)
    const uploadDir = resolve(__dirname, '../../../uploads');
    await mkdir(uploadDir, { recursive: true });

    const saved: PieceJointePublic[] = await prisma.$transaction(async (tx) => {
      const out: PieceJointePublic[] = [];

      for (const file of files) {
        await writeFile(join(uploadDir, file.filename), file.buffer);

        const pj = await tx.pieceJointe.create({
          data: {
            IdPlainte: idPlainte,
            Contenu: file.buffer,                                  // stored in DB
            extensionPJ: extname(file.filename).slice(1) || null,
            TypePieceJointe: file.mimetype || null,
            SessionId: jti,                                         // <-- stamp session
          },
          select: pieceJointeSelect, // never return the BLOB in API response
        });

        out.push(pj);
      }

      return out;
    });

    res.status(201).json({ attachments: saved });
  } catch (err) {
    next(err);
  }
}
