"use strict";
// Fichier: /app-backend/src/lookup/index.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const helmet_1 = __importDefault(require("helmet")); // Pour la sécurité HTTP
const cors_1 = __importDefault(require("cors")); // Pour la gestion des CORS
const express_rate_limit_1 = __importDefault(require("express-rate-limit")); // Pour limiter les requêtes
const pino_1 = __importDefault(require("pino")); // Pour les logs
const crypto_1 = require("crypto"); // Pour les IDs de requête
const routes_1 = __importDefault(require("./routes")); // Importe nos futures routes de lookup
// Charge les variables d'environnement depuis le .env racine
dotenv_1.default.config({ path: '../../.env' });
// Initialisation du logger Pino
const logger = (0, pino_1.default)({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    transport: {
        target: 'pino-pretty', // Permet des logs plus lisibles en dev
        options: {
            colorize: true,
            translateTime: 'SYS:HH:MM:ss',
            ignore: 'pid,hostname',
        },
    },
});
const app = (0, express_1.default)();
const PORT = process.env.LOOKUP_API_PORT || 3001;
// --- Middlewares Globaux ---
// Ajout d'un ID de requête unique pour le traçage dans les logs
app.use((req, res, next) => {
    req.id = (0, crypto_1.randomUUID)();
    logger.info({ id: req.id, method: req.method, url: req.url }, 'Incoming request');
    next();
});
// Sécurité HTTP avec Helmet
app.use((0, helmet_1.default)());
// Gestion des CORS (Cross-Origin Resource Sharing)
// En dev, on autorise tout. En prod, on restreint aux origines de l'app mobile.
app.use((0, cors_1.default)({
    origin: process.env.NODE_ENV === 'production' ? ['https://app.mobile.com'] : '*',
    methods: ['GET', 'HEAD', 'OPTIONS'], // Lookup API n'aura que des GET
}));
// Limiteur de requêtes pour prévenir les abus (100 requêtes par IP toutes les 15 minutes)
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limite chaque IP à 100 requêtes par fenêtre
    message: 'Too many requests from this IP, please try again after 15 minutes',
    standardHeaders: true, // Renvoie les infos de rate limit dans les headers
    legacyHeaders: false, // Désactive les anciens headers
});
app.use(limiter);
// Parse le JSON des requêtes (pas strictement nécessaire pour une Lookup API GET-only, mais bonne pratique)
app.use(express_1.default.json());
// --- Routes de l'API ---
app.use('/lookups', routes_1.default); // Toutes les routes définies dans lookupRoutes commenceront par /lookups
// Route de santé (déjà existante, mais avec logs)
app.get('/healthz', (req, res) => {
    logger.info({ id: req.id }, 'Health check successful');
    res.status(200).json({ status: 'ok', api: 'lookup', message: 'API is healthy' });
});
// Middleware de gestion des erreurs (doit être le dernier)
app.use((err, req, res, next) => {
    logger.error({ id: req.id, error: err.message, stack: err.stack }, 'Unhandled error');
    res.status(err.status || 500).json({
        error: {
            message: err.message || 'An unexpected error occurred',
        },
    });
});
// Démarrage du serveur
app.listen(PORT, () => {
    logger.info(`🚀 Lookup API is running on http://localhost:${PORT}`);
});
