// -----------------------------------------------------------------------------
// file : src/trx/schemas/complaint.schema.ts
// -----------------------------------------------------------------------------
import { z } from 'zod';

/* ───────────── 1. legacy flat shape (unchanged) ─────────────────────────── */
const flatBody = z.object({
  PlaignantTypePersonne: z.enum(['P', 'M']),
  PlaignantNom: z.string().min(1),
  PlaignantPrenom: z.string().nullable(),
  PlaignantCIN: z.string().nullable(),
  PlaignantIdPays: z.number().int(),
  PlaignantIdVille: z.number().int(),
  PlaignantIdSituationResidence: z.number().int(),
  PlaignantIdProfession: z.number().int(),
  PlaignantSexe: z.enum(['M', 'F', 'X']).nullable(),
  PlaignantAdresse: z.string().nullable(),
  PlaignantTelephone: z.string().nullable(),
  PlaignantEmail: z.string().email().nullable(),
  PlaignantNomCommercial: z.string().nullable(),
  PlaignantNumeroRC: z.string().nullable(),

  DefendeurTypePersonne: z.enum(['P', 'M', 'I']),
  DefendeurNom: z.string().nullable(),
  DefendeurNomCommercial: z.string().nullable(),

  IdObjetInjustice: z.number().int(),
  IdJuridiction: z.number().int(),
  ResumePlainte: z.string().min(10),

  SessionId:     z.string().min(1),
  PhoneToVerify: z.string().min(1),
});

/* ───────────── 2. nested mobile shape (updated) ─────────────────────────── */
const nestedBase = z.object({
  complainantType: z.enum(['individual', 'legal']).optional(),

  plaignant: z.object({
    nom:      z.string().min(1),
    prenom:   z.string().min(1).optional(),            // optional now
    cin:      z.string().nullable(),
    numeroRC: z.string().min(1).optional(),            // only for legal
    idPays:   z.number().int(),
    idVille:  z.number().int(),
    idSituationResidence: z.number().int(),
    idProfession:         z.number().int(),
    sexe:     z.enum(['M', 'F', 'X']).nullable(),
    adresse:  z.string().nullable(),
    telephone: z.string().nullable(),
    email:    z.string().email().nullable(),
  }),

  defendeur: z.object({
    type: z.enum(['P', 'M', 'I']),
    nom:  z.string().nullable().optional(),
    nomCommercial: z.string().nullable().optional(),
  }),

  plainteDetails: z.object({
    resume:           z.string().min(10),
    idObjetInjustice: z.number().int(),
    idJuridiction:    z.number().int(),
  }),

  phoneToVerify: z.string().min(1),
});

/* require prenom for individuals, numeroRC for legals */
const nestedBody = nestedBase.superRefine((data, ctx) => {
  const isLegal = data.complainantType === 'legal' ||
                  (!!data.plaignant.numeroRC && data.plaignant.numeroRC !== '');

  if (isLegal && !data.plaignant.numeroRC) {
    ctx.addIssue({
      code:    z.ZodIssueCode.custom,
      path:    ['plaignant', 'numeroRC'],
      message: 'numeroRC is required for legal complainants',
    });
  }

  if (!isLegal && !data.plaignant.prenom) {
    ctx.addIssue({
      code:    z.ZodIssueCode.custom,
      path:    ['plaignant', 'prenom'],
      message: 'prenom is required for individual complainants',
    });
  }
});

/* ───────────── 3. accept either shape ───────────────────────────────────── */
export const createComplaintSchema = z.object({
  body: z.union([nestedBody, flatBody]),
});

export type CreateComplaintInput =
  z.infer<typeof createComplaintSchema>['body'];
