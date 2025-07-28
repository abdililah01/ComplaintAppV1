// Fichier: /src/trx/services/complaint.service.ts

import prisma from '../../common/prisma';

// On définit une interface pour typer les données attendues par la procédure stockée
// C'est un contrat clair entre notre API et la base de données.
export interface CreateComplaintParams {
    PlaignantTypePersonne: 'P' | 'M';
    PlaignantNom: string;
    PlaignantPrenom: string | null;
    PlaignantCIN: string | null;
    PlaignantIdPays: number;
    PlaignantIdVille: number;
    PlaignantIdSituationResidence: number;
    PlaignantIdProfession: number;
    PlaignantSexe: 'M' | 'F' | 'X' | null;
    PlaignantAdresse: string;
    PlaignantTelephone: string;
    PlaignantEmail: string;
    PlaignantNomCommercial: string | null;
    PlaignantNumeroRC: string | null;

    DefendeurTypePersonne: 'P' | 'M' | 'I';
    DefendeurNom: string | null;
    DefendeurNomCommercial: string | null;

    ResumePlainte: string;
    SessionId: string;
}

// On définit une interface pour le type de retour de la procédure
export interface CreateComplaintResult {
    IdPlainte: bigint;
    TrackingCode: string;
}

/**
 * Appelle la procédure stockée sp_Mobile_CreatePlainte de manière sécurisée.
 * @param params - Les données de la plainte validées.
 * @returns Le résultat de la procédure stockée.
 */
export const createComplaintInDB = async (params: CreateComplaintParams): Promise<CreateComplaintResult[]> => {
    // NOTE: $queryRaw est utilisé ici car notre SP retourne un résultat (SELECT).
    // C'est une méthode sécurisée qui utilise des requêtes paramétrées.
    const result = await prisma.$queryRaw<CreateComplaintResult[]>`
        EXEC dbo.sp_Mobile_CreatePlainte
            @PlaignantTypePersonne = ${params.PlaignantTypePersonne},
            @PlaignantNom = ${params.PlaignantNom},
            @PlaignantPrenom = ${params.PlaignantPrenom},
            @PlaignantCIN = ${params.PlaignantCIN},
            @PlaignantIdPays = ${params.PlaignantIdPays},
            @PlaignantIdVille = ${params.PlaignantIdVille},
            @PlaignantIdSituationResidence = ${params.PlaignantIdSituationResidence},
            @PlaignantIdProfession = ${params.PlaignantIdProfession},
            @PlaignantSexe = ${params.PlaignantSexe},
            @PlaignantAdresse = ${params.PlaignantAdresse},
            @PlaignantTelephone = ${params.PlaignantTelephone},
            @PlaignantEmail = ${params.PlaignantEmail},
            @PlaignantNomCommercial = ${params.PlaignantNomCommercial},
            @PlaignantNumeroRC = ${params.PlaignantNumeroRC},
            @DefendeurTypePersonne = ${params.DefendeurTypePersonne},
            @DefendeurNom = ${params.DefendeurNom},
            @DefendeurNomCommercial = ${params.DefendeurNomCommercial},
            @ResumePlainte = ${params.ResumePlainte},
            @SessionId = ${params.SessionId};
    `;

    return result;
};