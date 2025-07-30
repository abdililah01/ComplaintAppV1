import { Request, Response, NextFunction } from 'express';
import prisma from '../../common/prisma';
import { mkdir, writeFile } from 'fs/promises';
import { resolve, join, extname } from 'path';
import { Prisma } from '@prisma/client';          // FIX

/* ---------- Types -------------------------------------------------------- */

export interface ProcessedFile {
  filename: string;
  buffer: Buffer;
  mimetype: string;
}

interface RequestWithFiles extends Request {
  processedFiles?: ProcessedFile[];
  body: { complaintId: string | number; [k: string]: unknown };
}

interface PieceJointeResult {
  id: number;
  Contenu: Buffer;
  IdPlainte: number;
  extensionPJ: string | null;
  TypePieceJointe: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/* ---------- Controller --------------------------------------------------- */

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

    /* save to disk ------------------------------------------------------- */
    const uploadDir = resolve(__dirname, '../../../uploads');
    await mkdir(uploadDir, { recursive: true });

    /* save metadata + blob in one DB tx --------------------------------- */
    const saved = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const out: PieceJointeResult[] = [];

      for (const { filename, buffer, mimetype } of files) {
        await writeFile(join(uploadDir, filename), buffer);

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
