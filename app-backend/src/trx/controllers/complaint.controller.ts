// file: app-backend/src/trx/controllers/complaint.controller.ts
import { Request, Response, NextFunction } from 'express';
import { CreateComplaintInput } from '../schemas/complaint.schema';
import { createComplaintInDB, CreateComplaintParams } from '../services/complaint.service';

/** Map 'individual' | 'legal' → 'P' | 'M' */
const toTypePersonne = (k: 'individual' | 'legal'): 'P' | 'M' =>
  k === 'legal' ? 'M' : 'P';

/**
 * We extend service params locally so we can pass the two new fields required
 * for a legal complainant (Step 1): SiegeSocial (mapped to EnseigneSociale in DB)
 * and NomRepresentantLegal. Make sure these are also added to the service layer
 * and forwarded to the stored procedure.
 */
type AugmentedParams = CreateComplaintParams & {
  PlaignantSiegeSocial: string | null;
  PlaignantNomRepresentantLegal: string | null;
};

function mapBodyToParams(
  body: CreateComplaintInput,
  sessionIdHeader?: string,
): AugmentedParams {
  // ── nested (mobile) payload ────────────────────────────────────────────
  if ('plaignant' in body) {
    const { complainantType, plaignant, defendeur, plainteDetails, phoneToVerify } =
      body;

    const typePers = toTypePersonne(complainantType);
    const isLegal = typePers === 'M';

    const params: AugmentedParams = {
      /* plaignant ------------------------------------------------------- */
      PlaignantTypePersonne: typePers,
      PlaignantNom: isLegal ? null : plaignant.nom ?? null,
      PlaignantPrenom: isLegal ? null : plaignant.prenom ?? '-',
      PlaignantCIN: isLegal ? null : plaignant.cin ?? null,

      PlaignantIdPays: plaignant.idPays,
      PlaignantIdVille: plaignant.idVille,
      PlaignantIdSituationResidence: plaignant.idSituationResidence,
      PlaignantIdProfession: plaignant.idProfession,
      PlaignantSexe: plaignant.sexe ?? null,
      PlaignantAdresse: plaignant.adresse ?? null,
      PlaignantTelephone: plaignant.telephone ?? null,
      PlaignantEmail: plaignant.email ?? null,

      // Step 1 (legal complainant): required → nomCommercial, siegeSocial, representantLegal
      PlaignantNomCommercial: isLegal ? plaignant.nomCommercial! : null,
      PlaignantNumeroRC: isLegal ? plaignant.numeroRC ?? null : null, // RC optional
      PlaignantSiegeSocial: isLegal ? plaignant.siegeSocial! : null,
      PlaignantNomRepresentantLegal: isLegal ? plaignant.representantLegal! : null,

      /* défendeur ------------------------------------------------------- */
      // Step 2 (legal defendant): required → nomCommercial only; RC optional
      DefendeurTypePersonne: defendeur.type,
      DefendeurNom: defendeur.nom ?? null,
      DefendeurNomCommercial: defendeur.nomCommercial ?? null,
      DefendeurNumeroRC: defendeur.type === 'M' ? defendeur.numeroRC ?? null : null,

      /* plainte --------------------------------------------------------- */
      IdObjetInjustice: plainteDetails.idObjetInjustice,
      IdJuridiction: plainteDetails.idJuridiction,
      ResumePlainte: plainteDetails.resume,

      /* misc ------------------------------------------------------------ */
      SessionId: sessionIdHeader ?? '',
      PhoneToVerify: phoneToVerify,
    };

    return params;
  }

  // ── legacy flat payload ────────────────────────────────────────────────
  const p: any = body;
  const params: AugmentedParams = {
    PlaignantTypePersonne: p.PlaignantTypePersonne,
    PlaignantNom: p.PlaignantNom,
    PlaignantPrenom: p.PlaignantPrenom || '-',
    PlaignantCIN: p.PlaignantCIN,
    PlaignantIdPays: p.PlaignantIdPays,
    PlaignantIdVille: p.PlaignantIdVille,
    PlaignantIdSituationResidence: p.PlaignantIdSituationResidence,
    PlaignantIdProfession: p.PlaignantIdProfession,
    PlaignantSexe: p.PlaignantSexe ?? null,
    PlaignantAdresse: p.PlaignantAdresse,
    PlaignantTelephone: p.PlaignantTelephone,
    PlaignantEmail: p.PlaignantEmail,

    // Legal complainant fields (RC optional)
    PlaignantNomCommercial: p.PlaignantNomCommercial ?? null,
    PlaignantNumeroRC: p.PlaignantNumeroRC ?? null,
    PlaignantSiegeSocial: p.PlaignantSiegeSocial ?? null,
    PlaignantNomRepresentantLegal: p.PlaignantNomRepresentantLegal ?? null,

    // Legal defendant: require only NomCommercial; RC optional
    DefendeurTypePersonne: p.DefendeurTypePersonne,
    DefendeurNom: p.DefendeurNom ?? null,
    DefendeurNomCommercial: p.DefendeurNomCommercial ?? null,
    DefendeurNumeroRC: p.DefendeurNumeroRC ?? null,

    IdObjetInjustice: p.IdObjetInjustice,
    IdJuridiction: p.IdJuridiction,
    ResumePlainte: p.ResumePlainte,

    SessionId: p.SessionId ?? '',
    PhoneToVerify: p.PhoneToVerify ?? '',
  };

  return params;
}

export async function createComplaintHandler(
  req: Request<{}, {}, CreateComplaintInput>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const params = mapBodyToParams(
      req.body,
      req.headers['x-session-id'] as string | undefined,
    );

    // NOTE:
    // - Ensure CreateComplaintParams (service layer) includes:
    //     PlaignantSiegeSocial: string | null
    //     PlaignantNomRepresentantLegal: string | null
    // - And forward both to the stored procedure parameters.
    const [result] = await createComplaintInDB(
      params as unknown as CreateComplaintParams,
    );

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
