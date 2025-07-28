// Fichier: /src/trx/index.ts
import express from 'express';
import dotenv from 'dotenv';

// Charge les variables d'environnement
dotenv.config({ path: '../../.env' }); // On précise le chemin vers le .env racine

const app = express();
const PORT = process.env.TRX_API_PORT || 3000;

app.get('/healthz', (req, res) => {
    res.status(200).json({ status: 'ok', api: 'transactional' });
});

app.listen(PORT, () => {
    console.log(`🚀 Transactional API is running on http://localhost:${PORT}`);
});