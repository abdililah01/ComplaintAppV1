import type { Request, Response } from 'express';
import { createComplaintInDB } from '../services/complaint.service';
import type { CreateComplaintBody } from '../schemas/complaint.schema';

export const createComplaintHandler = async (req: Request, res: Response) => {
  const body = req.body as CreateComplaintBody;
  const params = mapBodyToSpParams(body);

  try {
    const rows: any = await createComplaintInDB(params);
    const row = Array.isArray(rows) ? rows[0] : rows;
    const complaintIdRaw = row?.IdPlainte ?? row?.complaintId;
    const trackingCode = row?.TrackingCode ?? row?.trackingCode;

    if (complaintIdRaw == null || !trackingCode) {
      return res.status(500).json({ error: 'Stored procedure returned no data' });
    }

    return res.status(201).json({
      complaintId: complaintIdRaw.toString(),
      trackingCode,
    });
  } catch (err: any) {
    console.error({ err }, 'createComplaint failed');
    return res.status(500).json({ error: 'Failed to create complaint' });
  }
};

function mapBodyToSpParams(body: CreateComplaintBody) {
  const isNested = 'complainantType' in (body as any);

  if (isNested) {
    const b: any = body;
    const pl = b.plaignant ?? {};
    const def = b.defendeur ?? {};
    const pld = b.plainteDetails ?? b.plainte ?? {};

    const PlaignantTypePersonne = b.complainantType === 'individual' ? 'P' : 'M';

    return {
      /* ─── PLAIGNANT (P/M) ─── */
      PlaignantTypePersonne,
      PlaignantNom: pl.nom ?? null,
      PlaignantPrenom: pl.prenom ?? null,
      PlaignantCIN: pl.cin ?? null,

      // accept both nomCommercial (frontend) and raisonSociale (older)
      PlaignantNomCommercial: pl.nomCommercial ?? pl.raisonSociale ?? null,
      PlaignantNumeroRC: pl.numeroRC ?? null,

      PlaignantIdPays: pl.idPays,
      PlaignantIdVille: pl.idVille,
      PlaignantIdSituationResidence: pl.idSituationResidence ?? null,
      PlaignantIdProfession: pl.idProfession ?? null,
      PlaignantSexe: pl.sexe ?? null,
      PlaignantAdresse: pl.adresse ?? null,
      PlaignantTelephone: pl.telephone ?? b.phoneToVerify ?? null,
      PlaignantEmail: pl.email ?? null,

      // accept both nomRepresentantLegal (older) and representantLegal (frontend)
      PlaignantSiegeSocial: pl.siegeSocial ?? null,
      PlaignantNomRepresentantLegal: pl.nomRepresentantLegal ?? pl.representantLegal ?? null,

      /* ─── DÉFENDEUR (flat or nested) ─── */
      DefendeurTypePersonne: def.type,
      DefendeurNom:
        def.personnePhysique?.nom ??
        def.nom ??
        null,
      DefendeurNomCommercial:
        def.personneMorale?.raisonSociale ??
        def.nomCommercial ??
        null,
      DefendeurNumeroRC:
        def.personneMorale?.numeroRC ??
        def.numeroRC ??
        null,

      /* ─── PLAINTE ─── */
      IdObjetInjustice: pld.idObjetInjustice,
      IdJuridiction: pld.idJuridiction,
      ResumePlainte: pld.resume,

      /* ─── MISC ─── */
      SessionId: b.sessionId ?? 'session-from-api',
    } as const;
  }

  // legacy flat shape already matches the SP
  return body as any;
}
