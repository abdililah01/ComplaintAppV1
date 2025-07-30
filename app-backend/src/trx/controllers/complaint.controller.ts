import { Request, Response, NextFunction } from 'express';
import { CreateComplaintInput } from '../schemas/complaint.schema';
import { createComplaintInDB, CreateComplaintParams } from '../services/complaint.service';

/**
 * Convert either payload shape into the DB-ready CreateComplaintParams.
 * Keeps a single source of truth for the service layer.
 */
function mapBodyToParams(
    body: CreateComplaintInput,
    sessionIdHeader: string | undefined,
): CreateComplaintParams {
    if ('plaignant' in body) {
        /* ─────────────────────────────────────────────────────────────────── */
        /*  Nested (new) shape                                                */
        /* ─────────────────────────────────────────────────────────────────── */
        const { plaignant, defendeur, plainteDetails, phoneToVerify } = body;

        return {
            PlaignantTypePersonne: 'P',
            PlaignantNom: plaignant.nom,
            PlaignantPrenom: plaignant.prenom,
            PlaignantCIN: plaignant.cin,
            PlaignantIdPays: plaignant.idPays,
            PlaignantIdVille: plaignant.idVille,
            PlaignantIdSituationResidence: plaignant.idSituationResidence,
            PlaignantIdProfession: plaignant.idProfession,
            PlaignantSexe: plaignant.sexe,
            PlaignantAdresse: plaignant.adresse,
            PlaignantTelephone: plaignant.telephone,
            PlaignantEmail: plaignant.email,
            PlaignantNomCommercial: null,
            PlaignantNumeroRC: null,

            DefendeurTypePersonne: defendeur.type,
            DefendeurNom: defendeur.nom ?? null,
            DefendeurNomCommercial: defendeur.nomCommercial ?? null,

            IdObjetInjustice: plainteDetails.idObjetInjustice,
            IdJuridiction: plainteDetails.idJuridiction,
            ResumePlainte: plainteDetails.resume,

            SessionId: sessionIdHeader ?? '',
            PhoneToVerify: phoneToVerify,
        };
    }

    /* ─────────────────────────────────────────────────────────────────────  */
    /*  Flat (legacy) shape                                                  */
    /* ─────────────────────────────────────────────────────────────────────  */
    const legacy = body; // TS already knows it's the flat variant

    return {
        PlaignantTypePersonne: legacy.PlaignantTypePersonne,
        PlaignantNom: legacy.PlaignantNom,
        PlaignantPrenom: legacy.PlaignantPrenom,
        PlaignantCIN: legacy.PlaignantCIN,
        PlaignantIdPays: legacy.PlaignantIdPays,
        PlaignantIdVille: legacy.PlaignantIdVille,
        PlaignantIdSituationResidence: legacy.PlaignantIdSituationResidence,
        PlaignantIdProfession: legacy.PlaignantIdProfession,
        PlaignantSexe: legacy.PlaignantSexe,
        PlaignantAdresse: legacy.PlaignantAdresse,
        PlaignantTelephone: legacy.PlaignantTelephone,
        PlaignantEmail: legacy.PlaignantEmail,
        PlaignantNomCommercial: legacy.PlaignantNomCommercial,
        PlaignantNumeroRC: legacy.PlaignantNumeroRC,

        DefendeurTypePersonne: legacy.DefendeurTypePersonne,
        DefendeurNom: legacy.DefendeurNom,
        DefendeurNomCommercial: legacy.DefendeurNomCommercial,

        IdObjetInjustice: legacy.IdObjetInjustice,
        IdJuridiction: legacy.IdJuridiction,
        ResumePlainte: legacy.ResumePlainte,

        SessionId: legacy.SessionId,
        PhoneToVerify: legacy.PhoneToVerify,
    };
}

/* -------------------------------------------------------------------------- */
/*  Controller                                                                */
/* -------------------------------------------------------------------------- */

export async function createComplaintHandler(
    req: Request<{}, {}, CreateComplaintInput>,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const params = mapBodyToParams(req.body, req.headers['x-session-id'] as string | undefined);

        const [result] = await createComplaintInDB(params);

        res.status(201).json({
            message: 'Complaint created',
            complaintId: result.IdPlainte.toString(),
            trackingCode: result.TrackingCode,
        });
    } catch (err) {
        console.error('Error creating complaint', err);
        next(err);
    }
}
