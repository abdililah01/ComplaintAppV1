import { Request, Response, NextFunction } from 'express';
import { CreateComplaintInput } from '../schemas/complaint.schema';
import { createComplaintInDB } from '../services/complaint.service';

export async function createComplaintHandler(
    req: Request<{}, {}, CreateComplaintInput>,
    res: Response,
    next: NextFunction
) {
    const { plaignant, defendeur, plainteDetails, phoneToVerify } = req.body;
    const sessionId = (req.headers['x-session-id'] as string) || '';

    const params = {
        PlaignantTypePersonne: 'P' as const,
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
        SessionId: sessionId,
        PhoneToVerify: phoneToVerify, // if you need it later
    };

    try {
        const [result] = await createComplaintInDB(params);
        return res.status(201).json({
            message: 'Complaint created',
            complaintId: result.IdPlainte.toString(),
            trackingCode: result.TrackingCode,
        });
    } catch (err) {
        console.error('Error creating complaint', err);
        return next(err);
    }
}
