// -----------------------------------------------------------------------------
// file : src/trx/controllers/complaint.controller.ts
// -----------------------------------------------------------------------------
import { Request, Response, NextFunction } from 'express';

import { CreateComplaintInput } from '../schemas/complaint.schema';
import {
  createComplaintInDB,
  CreateComplaintParams,
} from '../services/complaint.service';

/* ────────────────────────── helpers ─────────────────────────────────────── */

const toTypePersonne = (k: 'individual' | 'legal'): 'P' | 'M' =>
  k === 'legal' ? 'M' : 'P';

const inferTypePersonne = (
  flag: 'individual' | 'legal' | undefined,
  hasNumeroRC: boolean,
): 'P' | 'M' => {
  if (flag) return toTypePersonne(flag);
  return hasNumeroRC ? 'M' : 'P';
};

/* ───────────── map incoming JSON → stored-procedure parameters ──────────── */
function mapBodyToParams(
  body: CreateComplaintInput,
  sessionIdHeader?: string,
): CreateComplaintParams {
  /* ---------- 1.  Nested mobile style ---------- */
  if ('plaignant' in body) {
    const {
      complainantType,
      plaignant,
      defendeur,
      plainteDetails,
      phoneToVerify,
    } = body;

    const typePers = inferTypePersonne(
      complainantType,
      !!plaignant.numeroRC && plaignant.numeroRC.trim() !== '',
    );

    /* FIX ⬇︎ — never pass NULL, fallback to '-' */
    const prenomForSQL =
      plaignant.prenom && plaignant.prenom.trim() !== '' ? plaignant.prenom : '-';

    return {
      /* ── plaignant ────────────────────────────────────────────────────── */
      PlaignantTypePersonne: typePers,
      PlaignantNom:          plaignant.nom,
      PlaignantPrenom:       prenomForSQL,              // ★ always non-NULL
      PlaignantCIN:          plaignant.cin,
      PlaignantIdPays:       plaignant.idPays,
      PlaignantIdVille:      plaignant.idVille,
      PlaignantIdSituationResidence: plaignant.idSituationResidence,
      PlaignantIdProfession: plaignant.idProfession,
      PlaignantSexe:         plaignant.sexe,
      PlaignantAdresse:      plaignant.adresse,
      PlaignantTelephone:    plaignant.telephone,
      PlaignantEmail:        plaignant.email,
      PlaignantNomCommercial: typePers === 'M' ? plaignant.nom : null,
      PlaignantNumeroRC:      typePers === 'M'
                                ? (plaignant.numeroRC ?? '').trim() || 'N/A'
                                : null,

      /* ── défendeur ───────────────────────────────────────────────────── */
      DefendeurTypePersonne:  defendeur.type,
      DefendeurNom:           defendeur.nom           ?? null,
      DefendeurNomCommercial: defendeur.nomCommercial ?? null,

      /* ── plainte details ─────────────────────────────────────────────── */
      IdObjetInjustice: plainteDetails.idObjetInjustice,
      IdJuridiction:    plainteDetails.idJuridiction,
      ResumePlainte:    plainteDetails.resume,

      /* ── misc ────────────────────────────────────────────────────────── */
      SessionId:     sessionIdHeader ?? '',
      PhoneToVerify: phoneToVerify,
    };
  }

  /* ---------- 2.  Legacy flat style ---------- */
  const p = body;
  return {
    PlaignantTypePersonne: p.PlaignantTypePersonne,
    PlaignantNom:          p.PlaignantNom,
    PlaignantPrenom:       p.PlaignantPrenom || '-',   // ★ fallback
    PlaignantCIN:          p.PlaignantCIN,
    PlaignantIdPays:       p.PlaignantIdPays,
    PlaignantIdVille:      p.PlaignantIdVille,
    PlaignantIdSituationResidence: p.PlaignantIdSituationResidence,
    PlaignantIdProfession: p.PlaignantIdProfession,
    PlaignantSexe:         p.PlaignantSexe,
    PlaignantAdresse:      p.PlaignantAdresse,
    PlaignantTelephone:    p.PlaignantTelephone,
    PlaignantEmail:        p.PlaignantEmail,
    PlaignantNomCommercial: p.PlaignantNomCommercial,
    PlaignantNumeroRC:      p.PlaignantNumeroRC,

    DefendeurTypePersonne:  p.DefendeurTypePersonne,
    DefendeurNom:           p.DefendeurNom,
    DefendeurNomCommercial: p.DefendeurNomCommercial,

    IdObjetInjustice: p.IdObjetInjustice,
    IdJuridiction:    p.IdJuridiction,
    ResumePlainte:    p.ResumePlainte,

    SessionId:     p.SessionId,
    PhoneToVerify: p.PhoneToVerify,
  };
}

/* ───────────────────────────── controller ───────────────────────────────── */
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

    const [result] = await createComplaintInDB(params);

    res.status(201).json({
      message:      'Complaint created',
      complaintId:  result.IdPlainte.toString(),
      trackingCode: result.TrackingCode,
    });
  } catch (err) {
    console.error('Error creating complaint', err);
    next(err);
  }
}
