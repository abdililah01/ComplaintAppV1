"use strict";
// Fichier: /app-backend/src/lookup/index.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app")); // Importe l'application configurée
const pino_1 = __importDefault(require("pino"));
const logger = (0, pino_1.default)({ level: process.env.NODE_ENV === 'production' ? 'info' : 'debug' });
const PORT = Number(process.env.PORT || 3001);
// Démarre le serveur en écoutant sur le bon port
app_1.default.listen(PORT, '0.0.0.0', () => {
    logger.info(`🚀 Lookup API is running on http://0.0.0.0:${PORT}`);
});
