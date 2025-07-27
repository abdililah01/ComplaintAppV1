"use strict";
// Fichier: /app-backend/src/lookup/routes.ts
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../common/prisma")); // Importe l'instance de Prisma
const pino_1 = __importDefault(require("pino")); // Pour les logs
const router = (0, express_1.Router)();
const logger = (0, pino_1.default)(); // Utilisez la même instance de logger que dans index.ts si possible
// Route GET /lookups/pays
router.get('/pays', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const lang = req.query.lang === 'ar' ? 'ar' : 'lat'; // Détermine la langue (Arabe ou Latin)
    const requestId = req.id; // Récupère l'ID de la requête pour les logs
    try {
        // Utilise le client Prisma pour récupérer les pays
        const countries = yield prisma_1.default.pays.findMany({
            select: {
                Id: true,
                Nom: true, // Contient le format "LATIN -- ARABE"
                Code: true,
                Nom_Fr: true, // Colonne pour le nom en français
            },
        });
        // Formate les données selon la langue demandée
        const formattedCountries = countries.map(country => {
            const [latinName, arabicName] = country.Nom.split(' -- ');
            return {
                id: country.Id,
                label: lang === 'ar' ? (arabicName || latinName) : (country.Nom_Fr || latinName), // Priorise Nom_Fr si disponible
            };
        });
        // Ajoute un header de cache car ce sont des données statiques
        res.set('Cache-Control', 'public, max-age=86400'); // Cache 24 heures
        logger.info({ id: requestId, count: formattedCountries.length }, 'Fetched countries lookup');
        res.json(formattedCountries);
    }
    catch (error) {
        logger.error({ id: requestId, error: error.message, stack: error.stack }, 'Error fetching countries');
        res.status(500).json({ error: 'Failed to retrieve countries' });
    }
}));
exports.default = router;
