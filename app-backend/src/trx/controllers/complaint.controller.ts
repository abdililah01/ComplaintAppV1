import { Request, Response, NextFunction } from 'express';
import { CreateComplaintInput } from '../schemas/complaint.schema';
import { createComplaintInDB, CreateComplaintParams } from '../services/complaint.service';

/* helpers --------------------------------------------------------------- */
const toTypePersonne = (k: 'individual' | 'legal'): 'P' | 'M' => (k === 'legal' ? 'M' : 'P');

const inferTypePersonne = (
  flag: 'individual' | 'legal',
  hasNumeroRC: boolean,
): 'P' | 'M' => (flag ? toTypePersonne(flag) : hasNumeroRC ? 'M' : 'P');

/* mapper ----------------------------------------------------------------*/
function mapBodyToParams(
  body: CreateComplaintInput,
  sessionIdHeader?: string,
): CreateComplaintParams {
  /* ── nested (mobile) -------------------------------------------------- */
  if ('plaignant' in body) {
    const { complainantType, plaignant, defendeur, plainteDetails, phoneToVerify } = body;
    const typePers = inferTypePersonne(complainantType, !!plaignant.numeroRC);
    const isLegal  = typePers === 'M';

    return {
      /* plaignant */
      PlaignantTypePersonne: typePers,
      PlaignantNom         : isLegal ? null : plaignant.nom ?? null,
      PlaignantPrenom      : isLegal ? null : plaignant.prenom ?? '-',
      PlaignantCIN         : isLegal ? null : plaignant.cin ?? null,

      PlaignantIdPays              : plaignant.idPays,
      PlaignantIdVille             : plaignant.idVille,
      PlaignantIdSituationResidence: plaignant.idSituationResidence,
      PlaignantIdProfession        : plaignant.idProfession,
      PlaignantSexe                : plaignant.sexe ?? null,
      PlaignantAdresse             : plaignant.adresse ?? null,
      PlaignantTelephone           : plaignant.telephone ?? null,
      PlaignantEmail               : plaignant.email ?? null,

      PlaignantNomCommercial       : isLegal ? plaignant.nomCommercial! : null,
      PlaignantNumeroRC            : isLegal ? plaignant.numeroRC!      : null,

      /* défendeur */
      DefendeurTypePersonne : defendeur.type,
      DefendeurNom          : defendeur.nom ?? null,
      DefendeurNomCommercial: defendeur.nomCommercial ?? null,

      /* plainte */
      IdObjetInjustice: plainteDetails.idObjetInjustice,
      IdJuridiction   : plainteDetails.idJuridiction,
      ResumePlainte   : plainteDetails.resume,

      /* misc */
      SessionId    : sessionIdHeader ?? '',
      PhoneToVerify: phoneToVerify,
    };
  }

  /* ── flat (legacy) ---------------------------------------------------- */
  const p: any = body;
  return {
    PlaignantTypePersonne: p.PlaignantTypePersonne,
    PlaignantNom         : p.PlaignantNom,
    PlaignantPrenom      : p.PlaignantPrenom || '-',
    PlaignantCIN         : p.PlaignantCIN,
    PlaignantIdPays      : p.PlaignantIdPays,
    PlaignantIdVille     : p.PlaignantIdVille,
    PlaignantIdSituationResidence: p.PlaignantIdSituationResidence,
    PlaignantIdProfession: p.PlaignantIdProfession,
    PlaignantSexe        : p.PlaignantSexe,
    PlaignantAdresse     : p.PlaignantAdresse,
    PlaignantTelephone   : p.PlaignantTelephone,
    PlaignantEmail       : p.PlaignantEmail,
    PlaignantNomCommercial: p.PlaignantNomCommercial,
    PlaignantNumeroRC     : p.PlaignantNumeroRC,

    DefendeurTypePersonne : p.DefendeurTypePersonne,
    DefendeurNom          : p.DefendeurNom,
    DefendeurNomCommercial: p.DefendeurNomCommercial,

    IdObjetInjustice: p.IdObjetInjustice,
    IdJuridiction   : p.IdJuridiction,
    ResumePlainte   : p.ResumePlainte,

    SessionId    : p.SessionId,
    PhoneToVerify: p.PhoneToVerify,
  };
}

/* controller ------------------------------------------------------------ */
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
