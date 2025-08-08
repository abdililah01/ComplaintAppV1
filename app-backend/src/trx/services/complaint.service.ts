import prisma from '../../common/prisma';

/* ─────────────── param & result types ─────────────────────────────────── */

export interface CreateComplaintParams {
  /* plaignant ----------------------------------------------------------- */
  PlaignantTypePersonne        : 'P' | 'M';
  PlaignantNom                 : string | null;  // nullable when legal
  PlaignantPrenom              : string | null;  // nullable when legal
  PlaignantCIN                 : string | null;
  PlaignantIdPays              : number;
  PlaignantIdVille             : number;
  PlaignantIdSituationResidence: number;
  PlaignantIdProfession        : number;
  PlaignantSexe                : string | null;
  PlaignantAdresse             : string | null;
  PlaignantTelephone           : string | null;
  PlaignantEmail               : string | null;
  PlaignantNomCommercial       : string | null;
  PlaignantNumeroRC            : string | null;

  /* défendeur ----------------------------------------------------------- */
  DefendeurTypePersonne        : 'P' | 'M' | 'I';
  DefendeurNom                 : string | null;
  DefendeurNomCommercial       : string | null;

  /* plainte ------------------------------------------------------------- */
  IdObjetInjustice             : number;
  IdJuridiction                : number;
  ResumePlainte                : string;

  /* misc --------------------------------------------------------------- */
  SessionId                    : string;
  PhoneToVerify                : string;
}

export interface CreateComplaintResult {
  IdPlainte   : bigint;
  TrackingCode: string;
}

/* ─────────────── call the stored procedure via Prisma ────────────────── */
export async function createComplaintInDB(
  p: CreateComplaintParams,
): Promise<CreateComplaintResult[]> {
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
