// file: app-backend/src/trx/services/complaint.service.ts
import prisma from '../../common/prisma';

export interface CreateComplaintParams {
  /* plaignant */
  PlaignantTypePersonne: 'P' | 'M';
  PlaignantNom: string | null;
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
  PlaignantNumeroRC: string | null;            // optional
  PlaignantSiegeSocial: string | null;         // REQUIRED when legal
  PlaignantNomRepresentantLegal: string | null;// REQUIRED when legal

  /* défendeur */
  DefendeurTypePersonne: 'P' | 'M' | 'I';
  DefendeurNom: string | null;
  DefendeurNomCommercial: string | null;       // REQUIRED when legal
  DefendeurNumeroRC: string | null;            // optional

  /* plainte */
  IdObjetInjustice: number;
  IdJuridiction: number;
  ResumePlainte: string;

  /* misc */
  SessionId: string;
  PhoneToVerify: string | undefined;
}

export interface CreateComplaintResult {
  IdPlainte: bigint;
  TrackingCode: string;
}

/* Call the stored procedure */
export async function createComplaintInDB(
  p: CreateComplaintParams,
): Promise<CreateComplaintResult[]> {
  return prisma.$queryRaw<CreateComplaintResult[]>`
    EXEC dbo.sp_Mobile_CreatePlainte
      @PlaignantTypePersonne          = ${p.PlaignantTypePersonne},
      @PlaignantNom                   = ${p.PlaignantNom},
      @PlaignantPrenom                = ${p.PlaignantPrenom},
      @PlaignantCIN                   = ${p.PlaignantCIN},
      @PlaignantIdPays                = ${p.PlaignantIdPays},
      @PlaignantIdVille               = ${p.PlaignantIdVille},
      @PlaignantIdSituationResidence  = ${p.PlaignantIdSituationResidence},
      @PlaignantIdProfession          = ${p.PlaignantIdProfession},
      @PlaignantSexe                  = ${p.PlaignantSexe},
      @PlaignantAdresse               = ${p.PlaignantAdresse},
      @PlaignantTelephone             = ${p.PlaignantTelephone},
      @PlaignantEmail                 = ${p.PlaignantEmail},

      @PlaignantNomCommercial         = ${p.PlaignantNomCommercial},
      @PlaignantNumeroRC              = ${p.PlaignantNumeroRC},
      @PlaignantSiegeSocial           = ${p.PlaignantSiegeSocial},            -- NEW
      @PlaignantNomRepresentantLegal  = ${p.PlaignantNomRepresentantLegal},   -- NEW

      @DefendeurTypePersonne          = ${p.DefendeurTypePersonne},
      @DefendeurNom                   = ${p.DefendeurNom},
      @DefendeurNomCommercial         = ${p.DefendeurNomCommercial},
      @DefendeurNumeroRC              = ${p.DefendeurNumeroRC},

      @IdObjetInjustice               = ${p.IdObjetInjustice},
      @IdJuridiction                  = ${p.IdJuridiction},
      @ResumePlainte                  = ${p.ResumePlainte},
      @SessionId                      = ${p.SessionId}
  `;
}
