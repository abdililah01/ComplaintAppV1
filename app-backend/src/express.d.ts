// Fichier: /src/express.d.ts (CORRIGÉ)

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import 'express';

declare global {
    namespace Express {
        export interface Request {
            id?: string;
        }
    }
}