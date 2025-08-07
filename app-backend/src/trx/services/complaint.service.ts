//file app-backend/src/trx/services/complaint.service.ts
import prisma from '../../common/prisma';
import { Prisma } from '@prisma/client';          // FIX: pull in Prisma types

export interface CreateComplaintParams {
    PlaignantTypePersonne: 'P' | 'M';
    PlaignantNom: string;
    PlaignantPrenom: string | null;
    PlaignantCIN: string | null;
    PlaignantIdPays: number;
    PlaignantIdVille: number;
    PlaignantIdSituationResidence: number;
    PlaignantIdProfession: number;
    PlaignantSexe: string | null;
    PlaignantAdresse: string | null;
    PlaignantTelephone: string | null;
    PlaignantEmail: string | null;
    PlaignantNomCommercial: string | null;
    PlaignantNumeroRC: string | null;
    DefendeurTypePersonne: 'P' | 'M' | 'I';
    DefendeurNom: string | null;
    DefendeurNomCommercial: string | null;
    IdObjetInjustice: number;
    IdJuridiction: number;
    ResumePlainte: string;
    SessionId: string;
    PhoneToVerify: string;
}

export interface CreateComplaintResult {
    IdPlainte: bigint;
    TrackingCode: string;
}

/**
 * Runs the SQL-Server stored procedure `dbo.sp_Mobile_CreatePlainte`
 * using **fully-parameterised** SQL to avoid injection attacks.
 */
export async function createComplaintInDB(
    p: CreateComplaintParams,
): Promise<CreateComplaintResult[]> {
    // FIX: use the `$queryRaw` *tagged template* — Prisma
    //      handles escaping & type-mapping automatically.
    return prisma.$queryRaw<CreateComplaintResult[]>`
    EXEC dbo.sp_Mobile_CreatePlainte
      @PlaignantTypePersonne         = ${p.PlaignantTypePersonne},
      @PlaignantNom                  = ${p.PlaignantNom},
      @PlaignantPrenom               = ${p.PlaignantPrenom},
      @PlaignantCIN                  = ${p.PlaignantCIN},
      @PlaignantIdPays               = ${p.PlaignantIdPays},
      @PlaignantIdVille              = ${p.PlaignantIdVille},
      @PlaignantIdSituationResidence = ${p.PlaignantIdSituationResidence},
      @PlaignantIdProfession         = ${p.PlaignantIdProfession},
      @PlaignantSexe                 = ${p.PlaignantSexe},
      @PlaignantAdresse              = ${p.PlaignantAdresse},
      @PlaignantTelephone            = ${p.PlaignantTelephone},
      @PlaignantEmail                = ${p.PlaignantEmail},
      @PlaignantNomCommercial        = ${p.PlaignantNomCommercial},
      @PlaignantNumeroRC             = ${p.PlaignantNumeroRC},
      @DefendeurTypePersonne         = ${p.DefendeurTypePersonne},
      @DefendeurNom                  = ${p.DefendeurNom},
      @DefendeurNomCommercial        = ${p.DefendeurNomCommercial},
      @IdObjetInjustice              = ${p.IdObjetInjustice},
      @IdJuridiction                 = ${p.IdJuridiction},
      @ResumePlainte                 = ${p.ResumePlainte},
      @SessionId                     = ${p.SessionId}
  `;
}
