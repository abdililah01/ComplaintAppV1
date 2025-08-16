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
  const jti = (req as any).auth?.jti || null;

  try {
    const params = mapBodyToSpParams(body, jti);

    // In prod, this executes the real SP; in tests it's mocked
    const result: any = await createComplaintInDB(params);

    // Accept both shapes (old tests vs. real SP return)
    const complaintIdRaw = result?.complaintId ?? result?.IdPlainte;
    const trackingCode   = result?.trackingCode ?? result?.TrackingCode;

    if (complaintIdRaw == null || !trackingCode) {
      return res.status(500).json({ error: 'Stored procedure returned no data' });
    }

    return res.status(201).json({
      complaintId: complaintIdRaw.toString(), // BigInt → string
      trackingCode,
    });
  } catch (err: any) {
    // Minimal log; add detail in non-prod to help local debugging
    const detail = process.env.NODE_ENV !== 'production' ? String(err?.message ?? err) : undefined;
    console.error({ err: { message: err?.message, code: err?.code } }, 'createComplaint failed');
    return res.status(500).json({ error: 'Failed to create complaint', detail });
  }
};

/* ───────────────────────────── Mapper ───────────────────────────── */

function mapBodyToSpParams(body: CreateComplaintBody, sessionId: string | null) {
  if (isNestedBody(body)) {
    const b: any = body;
    const pl = b.plaignant ?? {};
    const def = b.defendeur ?? {};
    const pld = b.plainteDetails ?? b.plainte ?? {};

    const PlaignantTypePersonne: 'P' | 'M' = b.complainantType === 'individual' ? 'P' : 'M';

    return {
      /* ─── PLAIGNANT ───────────────────────────────────────────── */
      PlaignantTypePersonne,
      PlaignantNom: esc(pl.nom, 200),
      PlaignantPrenom: esc(pl.prenom, 200),
      PlaignantCIN: esc(pl.cin, 50),

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

      /* ─── DÉFENDEUR ─────────────────────────────────────────── */
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
      ResumePlainte: esc(pld.resume, 4000) ?? '',

      /* ─── MISC ───────────────────────────────────────────────── */
      SessionId: sessionId,
    } as const;
  }

  // Legacy flat body
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

    SessionId: sessionId,
  };
}
