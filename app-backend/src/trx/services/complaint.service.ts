import prisma from '../../common/prisma';

export type CreateComplaintParams = {
  PlaignantTypePersonne: 'P' | 'M';
  PlaignantNom: string | null;
  PlaignantPrenom: string | null;
  PlaignantCIN: string | null;
  PlaignantNomCommercial: string | null;     // ✅ matches SP
  PlaignantNumeroRC: string | null;
  PlaignantIdPays: number;
  PlaignantIdVille: number;
  PlaignantIdSituationResidence: number | null;
  PlaignantIdProfession: number | null;
  PlaignantSexe?: string | null;
  PlaignantAdresse?: string | null;
  PlaignantTelephone?: string | null;
  PlaignantEmail?: string | null;
  PlaignantSiegeSocial?: string | null;
  PlaignantNomRepresentantLegal?: string | null;

  DefendeurTypePersonne: 'P' | 'M' | 'I';
  DefendeurNom: string | null;
  DefendeurNomCommercial: string | null;     // ✅ matches SP
  DefendeurNumeroRC: string | null;

  IdObjetInjustice: number;
  IdJuridiction: number;
  ResumePlainte: string;

  SessionId?: string | null;
};

export async function createComplaint(p: CreateComplaintParams) {
  // The stored proc SELECTs: complaintId (BIGINT) and trackingCode (NVARCHAR)
  const rows: Array<{ complaintId: bigint; trackingCode: string }> =
    await prisma.$queryRaw`
      EXEC dbo.sp_Mobile_CreatePlainte
        @PlaignantTypePersonne          = ${p.PlaignantTypePersonne},
        @PlaignantNom                   = ${p.PlaignantNom},
        @PlaignantPrenom                = ${p.PlaignantPrenom},
        @PlaignantCIN                   = ${p.PlaignantCIN},
        @PlaignantIdPays                = ${p.PlaignantIdPays},
        @PlaignantIdVille               = ${p.PlaignantIdVille},
        @PlaignantIdSituationResidence  = ${p.PlaignantIdSituationResidence},
        @PlaignantIdProfession          = ${p.PlaignantIdProfession},
        @PlaignantSexe                  = ${p.PlaignantSexe ?? null},
        @PlaignantAdresse               = ${p.PlaignantAdresse ?? null},
        @PlaignantTelephone             = ${p.PlaignantTelephone ?? null},
        @PlaignantEmail                 = ${p.PlaignantEmail ?? null},

        @PlaignantNomCommercial         = ${p.PlaignantNomCommercial},
        @PlaignantNumeroRC              = ${p.PlaignantNumeroRC},
        @PlaignantSiegeSocial           = ${p.PlaignantSiegeSocial ?? null},
        @PlaignantNomRepresentantLegal  = ${p.PlaignantNomRepresentantLegal ?? null},

        @DefendeurTypePersonne          = ${p.DefendeurTypePersonne},
        @DefendeurNom                   = ${p.DefendeurNom},
        @DefendeurNomCommercial         = ${p.DefendeurNomCommercial},
        @DefendeurNumeroRC              = ${p.DefendeurNumeroRC},

        @IdObjetInjustice               = ${p.IdObjetInjustice},
        @IdJuridiction                  = ${p.IdJuridiction},
        @ResumePlainte                  = ${p.ResumePlainte},

        @SessionId                      = ${p.SessionId ?? null};
    `;

  const r = rows?.[0];
  if (!r) throw new Error('sp_Mobile_CreatePlainte returned no result');

  return {
    complaintId: r.complaintId.toString(), // BigInt → string for JSON
    trackingCode: r.trackingCode,
  };
}

// Export alias so Jest mock in tests/trx.test.ts works
export const createComplaintInDB = createComplaint;
