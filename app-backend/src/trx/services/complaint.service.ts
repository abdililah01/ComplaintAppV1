import prisma from '../../common/prisma';

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

export async function createComplaintInDB(
    p: CreateComplaintParams
): Promise<CreateComplaintResult[]> {
    // inline all parameters into one EXEC string
    const sql = `
EXEC dbo.sp_Mobile_CreatePlainte
  @PlaignantTypePersonne='${p.PlaignantTypePersonne}',
  @PlaignantNom='${p.PlaignantNom.replace(/'/g, "''")}',
  @PlaignantPrenom='${(p.PlaignantPrenom || '').replace(/'/g, "''")}',
  @PlaignantCIN='${(p.PlaignantCIN || '').replace(/'/g, "''")}',
  @PlaignantIdPays=${p.PlaignantIdPays},
  @PlaignantIdVille=${p.PlaignantIdVille},
  @PlaignantIdSituationResidence=${p.PlaignantIdSituationResidence},
  @PlaignantIdProfession=${p.PlaignantIdProfession},
  @PlaignantSexe='${p.PlaignantSexe || ''}',
  @PlaignantAdresse='${(p.PlaignantAdresse || '').replace(/'/g, "''")}',
  @PlaignantTelephone='${(p.PlaignantTelephone || '').replace(/'/g, "''")}',
  @PlaignantEmail='${(p.PlaignantEmail || '').replace(/'/g, "''")}',
  @PlaignantNomCommercial='${(p.PlaignantNomCommercial || '').replace(/'/g, "''")}',
  @PlaignantNumeroRC='${(p.PlaignantNumeroRC || '').replace(/'/g, "''")}',
  @DefendeurTypePersonne='${p.DefendeurTypePersonne}',
  @DefendeurNom='${(p.DefendeurNom || '').replace(/'/g, "''")}',
  @DefendeurNomCommercial='${(p.DefendeurNomCommercial || '').replace(/'/g, "''")}',
  @IdObjetInjustice=${p.IdObjetInjustice},
  @IdJuridiction=${p.IdJuridiction},
  @ResumePlainte='${p.ResumePlainte.replace(/'/g, "''")}',
  @SessionId='${p.SessionId.replace(/'/g, "''")}'
`;

    // $queryRawUnsafe returns the SELECTed IdPlainte & TrackingCode
    return prisma.$queryRawUnsafe<CreateComplaintResult[]>(sql);
}
