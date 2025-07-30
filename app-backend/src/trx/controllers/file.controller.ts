import { Request, Response, NextFunction } from 'express';
import prisma from '../../common/prisma';
import type { Prisma, PieceJointe } from '@prisma/client';        // ★ types only
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

    /* 1 ─ ensure upload directory exists -------------------------------- */
    const uploadDir = resolve(__dirname, '../../../uploads');
    await mkdir(uploadDir, { recursive: true });

    /* 2 ─ save files + metadata inside one DB transaction --------------- */
    const saved = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const out: PieceJointe[] = [];                              // ★ generated type

      for (const { filename, buffer, mimetype } of files) {
        // store binary on disk
        await writeFile(join(uploadDir, filename), buffer);

        // store metadata + blob in SQL Server
        const pj = await tx.pieceJointe.create({
          data: {
            Contenu: buffer,
            IdPlainte: idPlainte,
            extensionPJ: extname(filename).slice(1) || null,
            TypePieceJointe: mimetype,
          },
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
