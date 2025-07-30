import { z } from 'zod';

export const createComplaintSchema = z.object({
    body: z.object({
        plaignant: z.object({
            nom: z.string().min(1),
            prenom: z.string().min(1),
            cin: z.string().min(1),
            idPays: z.number(),
            idVille: z.number(),
            idSituationResidence: z.number(),
            idProfession: z.number(),
            sexe: z.enum(['M', 'F', 'X']).nullable(),
            adresse: z.string().min(1),
            telephone: z.string().min(1),
            email: z.string().email(),
        }),
        defendeur: z.object({
            type: z.enum(['P', 'M', 'I']),
            nom: z.string().nullable().optional(),
            nomCommercial: z.string().nullable().optional(),
        }),
        plainteDetails: z.object({
            resume: z.string().min(10),
            idObjetInjustice: z.number(),
            idJuridiction: z.number(),
        }),
        phoneToVerify: z.string().min(1),
    }),
});

export type CreateComplaintInput = z.infer<
    typeof createComplaintSchema
>['body'];
