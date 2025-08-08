// -----------------------------------------------------------------------------
// file : src/trx/schemas/complaint.schema.ts
// -----------------------------------------------------------------------------
import { z } from 'zod';

/* ───────── 1. legacy flat shape (unchanged) ─────────────────────────────── */
const flatBody = z.object({
  /* … everything exactly as before … */
  PlaignantSexe: z.enum(['M', 'F']).nullable(),
  /* rest omitted for brevity */
});

/* ───────── 2. nested mobile shape ──────────────────────────────────────── */
const nestedBase = z.object({
  complainantType: z.enum(['individual', 'legal']),

  plaignant: z.object({
    /* common fk/meta */
    idPays              : z.number().int(),
    idVille             : z.number().int(),
    idSituationResidence: z.number().int().min(1),
    idProfession        : z.literal(1),
    sexe                : z.enum(['M', 'F']).nullable().optional(), // 🔸 now optional
    adresse             : z.string().nullable().optional(),
    telephone           : z.string().nullable().optional(),
    email               : z.string().email().nullable().optional(),

    /* individual fields */
    nom   : z.string().min(1).optional(),
    prenom: z.string().min(1).optional(),
    cin   : z.string().nullable().optional(),

    /* legal-entity fields */
    nomCommercial: z.string().min(1).optional(),
    numeroRC     : z.string().min(1).optional(),
  }),

  defendeur: z.object({
    type         : z.enum(['P', 'M', 'I']),
    nom          : z.string().nullable().optional(),
    nomCommercial: z.string().nullable().optional(),
  }),

  plainteDetails: z.object({
    resume           : z.string().min(10),
    idObjetInjustice : z.number().int(),
    idJuridiction    : z.number().int(),
  }),

  phoneToVerify: z.string().min(1),
});

/* ───────── custom rules (individual ↔ legal) ───────────────────────────── */
const nestedBody = nestedBase.superRefine((data, ctx) => {
  const p = data.plaignant;

  if (data.complainantType === 'individual') {
    if (!p.nom)
      ctx.addIssue({ code:'custom', path:['plaignant','nom'], message:'nom is required for individual' });
    if (!p.prenom)
      ctx.addIssue({ code:'custom', path:['plaignant','prenom'], message:'prenom is required for individual' });

    if (p.numeroRC)
      ctx.addIssue({ code:'custom', path:['plaignant','numeroRC'], message:'numeroRC not allowed for individual' });
    if (p.nomCommercial)
      ctx.addIssue({ code:'custom', path:['plaignant','nomCommercial'], message:'nomCommercial not allowed for individual' });
  } else { // legal
    if (!p.nomCommercial)
      ctx.addIssue({ code:'custom', path:['plaignant','nomCommercial'], message:'nomCommercial is required for legal' });
    if (!p.numeroRC)
      ctx.addIssue({ code:'custom', path:['plaignant','numeroRC'], message:'numeroRC is required for legal' });

    if (p.prenom)
      ctx.addIssue({ code:'custom', path:['plaignant','prenom'], message:'prenom not allowed for legal' });
  }
});

/* ───────── 3. API contract ─────────────────────────────────────────────── */
export const createComplaintSchema = z.object({
  body: z.union([flatBody, nestedBody]),
});

export type CreateComplaintInput =
  z.infer<typeof createComplaintSchema>['body'];
