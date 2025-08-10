import { z } from 'zod';

const MAX_NAME = 200;
const MAX_RESUME = 4000;

/* helpers */
const nullishStr = (max: number) =>
  z.string().trim().max(max).nullish().transform(v => (v == null || v === '' ? undefined : v));

/* ───────────── Person schemas ───────────── */

const personPhysicalSchema = z
  .object({
    nom: z.string().trim().min(1).max(MAX_NAME),
    prenom: z.string().trim().min(1).max(MAX_NAME),
    cin: z
      .string()
      .trim()
      .max(50)
      .optional()
      .or(z.literal(''))
      .transform(v => (v ? v : null)),
    idPays: z.coerce.number().int(),
    idVille: z.coerce.number().int(),
    idSituationResidence: z.coerce.number().int(),
    idProfession: z.coerce.number().int(),
    sexe: nullishStr(1),
    adresse: nullishStr(255),
    telephone: nullishStr(30),
    email: nullishStr(200), // ✅ allow null from app
  })
  .strict();

/**
 * Legal entity: accept BOTH old backend names and RN names
 *  - raisonSociale (old) OR nomCommercial (RN)
 *  - nomRepresentantLegal (old) OR representantLegal (RN)
 */
const personLegalSchema = z
  .object({
    // names (both accepted; refined later)
    raisonSociale: nullishStr(255),
    nomCommercial: nullishStr(600),

    numeroRC: z
      .string()
      .trim()
      .max(100)
      .optional()
      .or(z.literal(''))
      .transform(v => (v ? v : null)),

    idPays: z.coerce.number().int(),
    idVille: z.coerce.number().int(),

    siegeSocial: nullishStr(1000),
    // both accepted; refined later
    nomRepresentantLegal: nullishStr(600),
    representantLegal: nullishStr(600),

    telephone: nullishStr(30),
    email: nullishStr(200),
    adresse: nullishStr(255),
    // some RN defaults may include these
    idSituationResidence: z.coerce.number().int().optional(),
    idProfession: z.coerce.number().int().optional(),
  })
  .strict();

/* ───────────── Defendant (accept flat OR nested) ───────────── */

const defendantFlatSchema = z
  .object({
    type: z.enum(['P', 'M', 'I']),
    nom: nullishStr(200),
    nomCommercial: nullishStr(600),
    numeroRC: nullishStr(100),
  })
  .strict();

const defendantNestedSchema = z
  .object({
    type: z.enum(['P', 'M', 'I']),
    personnePhysique: personPhysicalSchema.partial().optional(),
    personneMorale: personLegalSchema.partial().optional(),
  })
  .strict();

const defendantSchema = z.union([defendantNestedSchema, defendantFlatSchema]);

const plainteSchema = z
  .object({
    idObjetInjustice: z.coerce.number().int(),
    idJuridiction: z.coerce.number().int(),
    resume: z.string().trim().min(1).max(MAX_RESUME),
  })
  .strict();

/* ───────────── Nested body: two shapes (plainte OR plainteDetails) ───────────── */

const nestedBase = z
  .object({
    complainantType: z.enum(['individual', 'legal']),
    plaignant: z.union([personPhysicalSchema, personLegalSchema]),
    defendeur: defendantSchema,
    phoneToVerify: nullishStr(30),
    sessionId: nullishStr(500),
  })
  .strict();

const nestedWithPlainte = nestedBase.extend({ plainte: plainteSchema }).strict();
const nestedWithPlainteDetails = nestedBase.extend({ plainteDetails: plainteSchema }).strict();

// shared refinement: enforce required fields depending on complainantType
const refineComplainant = (val: any, ctx: z.RefinementCtx) => {
  if (val.complainantType === 'individual') {
    if (!('nom' in (val.plaignant as any))) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['plaignant', 'nom'],
        message: 'nom requis',
      });
    }
  } else {
    const hasName =
      (val.plaignant as any)?.raisonSociale ||
      (val.plaignant as any)?.nomCommercial;
    if (!hasName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['plaignant'],
        message: 'raisonSociale/nomCommercial requis',
      });
    }
    const hasRep =
      (val.plaignant as any)?.nomRepresentantLegal ||
      (val.plaignant as any)?.representantLegal;
    if (!hasRep) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['plaignant'],
        message: 'nomRepresentantLegal/representantLegal requis',
      });
    }
    if (!(val.plaignant as any)?.siegeSocial) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['plaignant', 'siegeSocial'],
        message: 'siegeSocial requis',
      });
    }
  }
};

const refinedNestedWithPlainte = nestedWithPlainte.superRefine(refineComplainant);
const refinedNestedWithPlainteDetails =
  nestedWithPlainteDetails.superRefine(refineComplainant);

export const nestedBody = z.union([
  refinedNestedWithPlainte,
  refinedNestedWithPlainteDetails,
]);

/* ───────────── Legacy flat body ───────────── */

export const flatBody = z
  .object({
    PlaignantTypePersonne: z.enum(['P', 'M']).or(z.string().regex(/^[PM]$/)),
    PlaignantNom: nullishStr(MAX_NAME),
    PlaignantPrenom: nullishStr(MAX_NAME),
    PlaignantCIN: nullishStr(50),

    PlaignantNomCommercial: nullishStr(600),
    PlaignantNumeroRC: nullishStr(100),
    PlaignantIdPays: z.coerce.number().int(),
    PlaignantIdVille: z.coerce.number().int(),
    PlaignantIdSituationResidence: z.coerce.number().int().optional(),
    PlaignantIdProfession: z.coerce.number().int().optional(),
    PlaignantSexe: nullishStr(1),
    PlaignantAdresse: nullishStr(255),
    PlaignantTelephone: nullishStr(30),
    PlaignantEmail: nullishStr(200),

    DefendeurTypePersonne: z.enum(['P', 'M', 'I']).or(z.string().regex(/^[PMI]$/)),
    DefendeurNom: nullishStr(MAX_NAME),
    DefendeurNomCommercial: nullishStr(600),
    DefendeurNumeroRC: nullishStr(100),

    IdObjetInjustice: z.coerce.number().int(),
    IdJuridiction: z.coerce.number().int(),
    ResumePlainte: z.string().trim().min(1).max(MAX_RESUME),

    SessionId: nullishStr(500),
  })
  .strict();

/* ───────────── Wrapper ───────────── */

export const createComplaintSchema = z.object({
  body: z.union([nestedBody, flatBody]),
});

export type CreateComplaintBody = z.infer<typeof createComplaintSchema>['body'];
