// Fichier: /src/express.d.ts
import express from 'express';
// Étend le namespace global d'Express
declare global {
    namespace Express {
        // Ajoute la propriété 'id' à l'interface Request
        export interface Request {
            id?: string;
        }
    }
}