// file: app-backend/src/trx/schemas/complaint.schema.ts
import { z } from 'zod';

/* ───────── 1) legacy flat shape ───────────────────────────────────────── */
const flatBody = z.object({
  /* plaignant */
  PlaignantTypePersonne: z.enum(['P', 'M']),
  PlaignantNom: z.string().nullable().optional(),
  PlaignantPrenom: z.string().nullable().optional(),
  PlaignantCIN: z.string().nullable().optional(),
  PlaignantIdPays: z.number().int(),
  PlaignantIdVille: z.number().int(),
  PlaignantIdSituationResidence: z.number().int(),
  PlaignantIdProfession: z.number().int(),
  PlaignantSexe: z.enum(['M', 'F']).nullable().optional(),
  PlaignantAdresse: z.string().nullable().optional(),
  PlaignantTelephone: z.string().nullable().optional(),
  PlaignantEmail: z.string().email().nullable().optional(),

  PlaignantNomCommercial: z.string().nullable().optional(),              // required iff 'M' (validated below)
  // RC optional; also allow "" because mobile may send empty string
  PlaignantNumeroRC: z.string().nullable().optional().or(z.literal('')),
  PlaignantSiegeSocial: z.string().nullable().optional(),               // required iff 'M' (validated below)
  PlaignantNomRepresentantLegal: z.string().nullable().optional(),      // required iff 'M' (validated below)

  /* défendeur */
  DefendeurTypePersonne: z.enum(['P', 'M', 'I']),
  DefendeurNom: z.string().nullable().optional(),
  DefendeurNomCommercial: z.string().nullable().optional(),              // required iff 'M' (validated below)
  // RC optional; also allow ""
  DefendeurNumeroRC: z.string().nullable().optional().or(z.literal('')),

  /* plainte */
  IdObjetInjustice: z.number().int(),
  IdJuridiction: z.number().int(),
  ResumePlainte: z.string(),

  /* misc */
  SessionId: z.string().optional(),
  PhoneToVerify: z.string().optional(),
}).superRefine((p, ctx) => {
  // ── Complainant rules
  if (p.PlaignantTypePersonne === 'M') {
    if (!p.PlaignantNomCommercial || !p.PlaignantNomCommercial.trim()) {
      ctx.addIssue({
        code: 'custom',
        path: ['PlaignantNomCommercial'],
        message: 'nomCommercial is required for legal complainant',
      });
    }
    if (!p.PlaignantSiegeSocial || !p.PlaignantSiegeSocial.trim()) {
      ctx.addIssue({
        code: 'custom',
        path: ['PlaignantSiegeSocial'],
        message: 'siegeSocial is required for legal complainant',
      });
    }
    if (
      !p.PlaignantNomRepresentantLegal ||
      !p.PlaignantNomRepresentantLegal.trim()
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['PlaignantNomRepresentantLegal'],
        message: 'representantLegal is required for legal complainant',
      });
    }
    // RC is optional → no check
  } else if (p.PlaignantTypePersonne === 'P') {
    if (!p.PlaignantNom || !p.PlaignantNom.trim()) {
      ctx.addIssue({
        code: 'custom',
        path: ['PlaignantNom'],
        message: 'nom is required for individual complainant',
      });
    }
    if (!p.PlaignantPrenom || !p.PlaignantPrenom.trim()) {
      ctx.addIssue({
        code: 'custom',
        path: ['PlaignantPrenom'],
        message: 'prenom is required for individual complainant',
      });
    }
  }

  // ── Defendant rules
  if (p.DefendeurTypePersonne === 'M') {
    if (!p.DefendeurNomCommercial || !p.DefendeurNomCommercial.trim()) {
      ctx.addIssue({
        code: 'custom',
        path: ['DefendeurNomCommercial'],
        message: 'nomCommercial is required for legal defendant',
      });
    }
    // RC optional → no check
  } else if (p.DefendeurTypePersonne === 'P') {
    if (!p.DefendeurNom || !p.DefendeurNom.trim()) {
      ctx.addIssue({
        code: 'custom',
        path: ['DefendeurNom'],
        message: 'nom is required for individual defendant',
      });
    }
  }
});

/* ───────── 2) nested mobile shape ─────────────────────────────────────── */
const nestedBase = z.object({
  complainantType: z.enum(['individual', 'legal']),

  plaignant: z.object({
    idPays: z.number().int(),
    idVille: z.number().int(),
    idSituationResidence: z.number().int(),
    idProfession: z.number().int(),
    sexe: z.enum(['M', 'F']).nullable().optional(),
    adresse: z.string().nullable().optional(),
    telephone: z.string().nullable().optional(),
    email: z.string().email().nullable().optional(),

    // individual
    nom: z.string().min(1).optional(),
    prenom: z.string().min(1).optional(),
    cin: z.string().nullable().optional(),

    // legal (RC optional)
    nomCommercial: z.string().min(1).optional(),
    // allow "", because UI may send empty string when not provided
    numeroRC: z.string().min(1).optional().or(z.literal('')),

    // Step 1 requirements (persisted by SP)
    siegeSocial: z.string().min(1).optional(),
    representantLegal: z.string().min(1).optional(),
  }),

  defendeur: z.object({
    type: z.enum(['P', 'M', 'I']),
    nom: z.string().nullable().optional(),
    nomCommercial: z.string().nullable().optional(), // required iff 'M'
    // allow "", optional
    numeroRC: z.string().nullable().optional().or(z.literal('')),
  }),

  plainteDetails: z.object({
    resume: z.string().min(10),
    idObjetInjustice: z.number().int(),
    idJuridiction: z.number().int(),
  }),

  phoneToVerify: z.string().min(1),
});

const nestedBody = nestedBase.superRefine((data, ctx) => {
  const p = data.plaignant;

  if (data.complainantType === 'individual') {
    if (!p.nom)
      ctx.addIssue({
        code: 'custom',
        path: ['plaignant', 'nom'],
        message: 'nom is required for individual',
      });
    if (!p.prenom)
      ctx.addIssue({
        code: 'custom',
        path: ['plaignant', 'prenom'],
        message: 'prenom is required for individual',
      });

    if (p.nomCommercial)
      ctx.addIssue({
        code: 'custom',
        path: ['plaignant', 'nomCommercial'],
        message: 'nomCommercial not allowed for individual',
      });
    if (p.siegeSocial)
      ctx.addIssue({
        code: 'custom',
        path: ['plaignant', 'siegeSocial'],
        message: 'siegeSocial not allowed for individual',
      });
    if (p.representantLegal)
      ctx.addIssue({
        code: 'custom',
        path: ['plaignant', 'representantLegal'],
        message: 'representantLegal not allowed for individual',
      });
  } else {
    // LEGAL complainant (Step 1): require nomCommercial + siegeSocial + representantLegal
    if (!p.nomCommercial)
      ctx.addIssue({
        code: 'custom',
        path: ['plaignant', 'nomCommercial'],
        message: 'nomCommercial is required for legal complainant',
      });
    if (!p.siegeSocial)
      ctx.addIssue({
        code: 'custom',
        path: ['plaignant', 'siegeSocial'],
        message: 'siegeSocial is required for legal complainant',
      });
    if (!p.representantLegal)
      ctx.addIssue({
        code: 'custom',
        path: ['plaignant', 'representantLegal'],
        message: 'representantLegal is required for legal complainant',
      });

    // RC optional → no check
    if (p.prenom)
      ctx.addIssue({
        code: 'custom',
        path: ['plaignant', 'prenom'],
        message: 'prenom not allowed for legal',
      });
    if (p.nom)
      ctx.addIssue({
        code: 'custom',
        path: ['plaignant', 'nom'],
        message: 'nom not allowed for legal',
      });
  }

  // Defendant rules (Step 2)
  const d = data.defendeur;
  if (d.type === 'M') {
    if (!d.nomCommercial) {
      ctx.addIssue({
        code: 'custom',
        path: ['defendeur', 'nomCommercial'],
        message: 'nomCommercial is required for legal defendant',
      });
    }
    // RC optional → no check
  } else if (d.type === 'P') {
    if (!d.nom) {
      ctx.addIssue({
        code: 'custom',
        path: ['defendeur', 'nom'],
        message: 'nom is required for individual defendant',
      });
    }
  }
});

/* ───────── 3) API contract ───────────────────────────────────────────── */
export const createComplaintSchema = z.object({
  body: z.union([flatBody, nestedBody]),
});

export type CreateComplaintInput =
  z.infer<typeof createComplaintSchema>['body'];
