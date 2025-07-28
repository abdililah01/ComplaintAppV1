"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Fichier: /src/trx/index.ts
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
// Charge les variables d'environnement
dotenv_1.default.config({ path: '../../.env' }); // On précise le chemin vers le .env racine
const app = (0, express_1.default)();
const PORT = process.env.TRX_API_PORT || 3000;
app.get('/healthz', (req, res) => {
    res.status(200).json({ status: 'ok', api: 'transactional' });
});
app.listen(PORT, () => {
    console.log(`🚀 Transactional API is running on http://localhost:${PORT}`);
});
