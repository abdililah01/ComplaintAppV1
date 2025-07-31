import { z } from 'zod';

/* -------------------------------------------------------------------------- */
/*  1.  NEW  – legacy flat shape                                              */
/* -------------------------------------------------------------------------- */
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

    SessionId: z.string().min(1),             // ★ carried by legacy clients
    PhoneToVerify: z.string().min(1),
});

/* -------------------------------------------------------------------------- */
/*  2.  Existing nested shape                                                 */
/* -------------------------------------------------------------------------- */
const nestedBody = z.object({
    plaignant: z.object({
        nom: z.string().min(1),
        prenom: z.string().min(1),
        cin: z.string().nullable(),
        idPays: z.number().int(),
        idVille: z.number().int(),
        idSituationResidence: z.number().int(),
        idProfession: z.number().int(),
        sexe: z.enum(['M', 'F', 'X']).nullable(),
        adresse: z.string().nullable(),
        telephone: z.string().nullable(),
        email: z.string().email().nullable(),
    }),
    defendeur: z.object({
        type: z.enum(['P', 'M', 'I']),
        nom: z.string().nullable().optional(),
        nomCommercial: z.string().nullable().optional(),
    }),
    plainteDetails: z.object({
        resume: z.string().min(10),
        idObjetInjustice: z.number().int(),
        idJuridiction: z.number().int(),
    }),
    phoneToVerify: z.string().min(1),
});

/* -------------------------------------------------------------------------- */
/*  3.  UNION  – accept either                                                */
/* -------------------------------------------------------------------------- */
export const createComplaintSchema = z.object({
    body: z.union([nestedBody, flatBody]),     // ★ key line
});

export type CreateComplaintInput = z.infer<typeof createComplaintSchema>['body'];
