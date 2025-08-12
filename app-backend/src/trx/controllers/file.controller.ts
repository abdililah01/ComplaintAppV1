import { Request, Response, NextFunction } from 'express';
import prisma from '../../common/prisma';
import type { Prisma } from '@prisma/client';           // ✅ type-only import is fine now
import { mkdir, writeFile } from 'fs/promises';
import { resolve, join, extname } from 'path';

/* ---------- Local helper types ---------------------------------------- */
export interface ProcessedFile {
  filename: string;
  buffer: Buffer;
  mimetype: string;
}

interface RequestWithFiles extends Request {
  processedFiles?: ProcessedFile[];
  body: { complaintId: string | number; [k: string]: unknown };
}

/* ---------- Prisma typed select (omit Contenu) ------------------------- */
// Build a plain object that *satisfies* the Prisma select type (no runtime Prisma usage)
const pieceJointeSelect = {
  Id: true,
  IdPlainte: true,
  extensionPJ: true,
  TypePieceJointe: true,
} satisfies Prisma.PieceJointeSelect;

type PieceJointePublic = Prisma.PieceJointeGetPayload<{ select: typeof pieceJointeSelect }>;

/* ---------- Controller ------------------------------------------------- */
export async function saveAttachments(
  req: RequestWithFiles,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const files = req.processedFiles;
    const idPlainte = Number(req.body.complaintId);

    if (!files?.length || Number.isNaN(idPlainte)) {
      res.status(400).json({ error: 'Missing files or invalid complaintId' });
      return;
    }

    // 1) ensure upload directory exists
    const uploadDir = resolve(__dirname, '../../../uploads');
    await mkdir(uploadDir, { recursive: true });

    // 2) save files + metadata inside one DB transaction
    const saved = await prisma.$transaction(async (tx) => {
      const out: PieceJointePublic[] = [];

      for (const { filename, buffer, mimetype } of files) {
        // optional: keep disk copy alongside DB blob
        await writeFile(join(uploadDir, filename), buffer);

        const pj = await tx.pieceJointe.create({
          data: {
            Contenu: buffer, // stored in DB, but NOT returned
            IdPlainte: idPlainte,
            extensionPJ: extname(filename).slice(1) || null,
            TypePieceJointe: mimetype,
          },
          select: pieceJointeSelect, // ← response excludes Contenu
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
