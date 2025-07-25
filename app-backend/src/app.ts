import express, { Express, Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';

// Crée l'instance de l'application Express
const app: Express = express();

// --- Middlewares de sécurité ---
app.use(helmet()); // Applique des en-têtes HTTP sécurisés
app.use(cors());   // Autorise les requêtes cross-origin (nous le configurerons plus tard)
app.use(express.json()); // Permet à Express de parser le JSON des requêtes

// --- Route de test pour vérifier la santé de l'API ---
app.get('/healthz', (req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', message: 'API is healthy' });
});

// Exporte l'application pour pouvoir l'utiliser dans d'autres fichiers (notamment server.ts et nos tests)
export default app;