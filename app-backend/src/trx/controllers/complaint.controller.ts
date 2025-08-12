import type { Request, Response } from 'express';
import validator from 'validator';
import { createComplaintInDB } from '../services/complaint.service';
import type { CreateComplaintBody } from '../schemas/complaint.schema';

/* ───────────────────────────── Helpers ───────────────────────────── */

const esc = (v: unknown, max?: number): string | null => {
  if (v == null) return null;
  let s = String(v);
  if (typeof max === 'number' && max > 0 && s.length > max) s = s.slice(0, max);
  // Trim control chars and spaces, then HTML-escape
  s = s.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '').trim();
  if (!s) return null;
  return validator.escape(s);
};

// strict email cleaner: cut at common XSS delimiters, lower-case, validate
const cleanEmailStrict = (v: unknown): string | null => {
  if (v == null) return null;
  const candidate = String(v).trim().split(/[\s"'<>]/)[0].toLowerCase();
  return validator.isEmail(candidate) ? candidate : null;
};

// keep only digits and leading '+'
const cleanPhone = (v: unknown): string | null => {
  if (v == null) return null;
  const raw = String(v);
  const cleaned = raw.replace(/[^\d+]/g, '').replace(/(?!^)\+/g, '');
  return cleaned.trim() || null;
};

const isNestedBody = (b: CreateComplaintBody): b is CreateComplaintBody & { complainantType: 'individual' | 'legal' } =>
  typeof (b as any)?.complainantType === 'string';

/* ───────────────────────────── Handler ───────────────────────────── */

export const createComplaintHandler = async (req: Request, res: Response) => {
  // validate.ts replaces req.body with the parsed Zod object
  const body = req.body as CreateComplaintBody;

  try {
    const params = mapBodyToSpParams(body);

    // tests mock this to return: [{ IdPlainte: BigInt(...), TrackingCode: '...' }]
    const rows: any = await createComplaintInDB(params);
    const row = Array.isArray(rows) ? rows[0] : rows;

    const complaintIdRaw = row?.IdPlainte ?? row?.complaintId;
    const trackingCode = row?.TrackingCode ?? row?.trackingCode;

    if (complaintIdRaw == null || !trackingCode) {
      return res.status(500).json({ error: 'Stored procedure returned no data' });
    }

    return res.status(201).json({
      complaintId: complaintIdRaw.toString(), // BigInt → string
      trackingCode,
    });
  } catch (err: any) {
    // keep logs minimal (no PII)
    console.error({ err: { message: err?.message, code: err?.code } }, 'createComplaint failed');
    return res.status(500).json({ error: 'Failed to create complaint' });
  }
};

/* ───────────────────────────── Mapper ───────────────────────────── */

function mapBodyToSpParams(body: CreateComplaintBody) {
  if (isNestedBody(body)) {
    const b: any = body;
    const pl = b.plaignant ?? {};
    const def = b.defendeur ?? {};
    // accept either `plainte` or `plainteDetails`
    const pld = b.plainteDetails ?? b.plainte ?? {};

    const PlaignantTypePersonne: 'P' | 'M' = b.complainantType === 'individual' ? 'P' : 'M';

    return {
      /* ─── PLAIGNANT ───────────────────────────────────────────── */
      PlaignantTypePersonne,
      PlaignantNom: esc(pl.nom, 200),
      PlaignantPrenom: esc(pl.prenom, 200),
      PlaignantCIN: esc(pl.cin, 50),

      // accept raisonSociale OR nomCommercial (RN)
      PlaignantNomCommercial: esc(pl.nomCommercial ?? pl.raisonSociale, 600),
      PlaignantNumeroRC: esc(pl.numeroRC, 100),

      PlaignantIdPays: pl.idPays,
      PlaignantIdVille: pl.idVille,
      PlaignantIdSituationResidence: pl.idSituationResidence ?? null,
      PlaignantIdProfession: pl.idProfession ?? null,

      PlaignantSexe: esc(pl.sexe, 1),
      PlaignantAdresse: esc(pl.adresse, 255),
      PlaignantTelephone: cleanPhone(pl.telephone ?? b.phoneToVerify),
      PlaignantEmail: cleanEmailStrict(pl.email),

      PlaignantSiegeSocial: esc(pl.siegeSocial, 1000),
      PlaignantNomRepresentantLegal: esc(pl.nomRepresentantLegal ?? pl.representantLegal, 600),

      /* ─── DÉFENDEUR (flat or nested) ─────────────────────────── */
      DefendeurTypePersonne: def.type,
      DefendeurNom: esc(def.personnePhysique?.nom ?? def.nom, 200),
      DefendeurNomCommercial: esc(
        def.personneMorale?.nomCommercial ??
          def.personneMorale?.raisonSociale ??
          def.nomCommercial,
        600
      ),
      DefendeurNumeroRC: esc(def.personneMorale?.numeroRC ?? def.numeroRC, 100),

      /* ─── PLAINTE ─────────────────────────────────────────────── */
      IdObjetInjustice: Number(pld.idObjetInjustice),
      IdJuridiction: Number(pld.idJuridiction),
      // critical: store escaped value to neutralize HTML/JS at rest
      ResumePlainte: esc(pld.resume, 4000) ?? '',

      /* ─── MISC ───────────────────────────────────────────────── */
      SessionId: esc(b.sessionId, 500) ?? 'session-from-api',
    } as const;
  }

  // Legacy flat body → sanitize strings before passing through
  const f: any = body;
  return {
    ...f,
    PlaignantNom: esc(f.PlaignantNom, 200),
    PlaignantPrenom: esc(f.PlaignantPrenom, 200),
    PlaignantCIN: esc(f.PlaignantCIN, 50),
    PlaignantNomCommercial: esc(f.PlaignantNomCommercial, 600),
    PlaignantNumeroRC: esc(f.PlaignantNumeroRC, 100),
    PlaignantSexe: esc(f.PlaignantSexe, 1),
    PlaignantAdresse: esc(f.PlaignantAdresse, 255),
    PlaignantTelephone: cleanPhone(f.PlaignantTelephone),
    PlaignantEmail: cleanEmailStrict(f.PlaignantEmail),

    DefendeurNom: esc(f.DefendeurNom, 200),
    DefendeurNomCommercial: esc(f.DefendeurNomCommercial, 600),
    DefendeurNumeroRC: esc(f.DefendeurNumeroRC, 100),

    IdObjetInjustice: Number(f.IdObjetInjustice),
    IdJuridiction: Number(f.IdJuridiction),
    ResumePlainte: esc(f.ResumePlainte, 4000) ?? '',

    SessionId: esc(f.SessionId, 500) ?? 'session-from-api',
  };
}
