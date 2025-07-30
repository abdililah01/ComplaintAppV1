"use strict";
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
const prisma_1 = __importDefault(require("../common/prisma"));
const router = (0, express_1.Router)();
/**
 * Helper function to pick the right label based on lang.
 */
const getLabel = (lang, nom, nomFr) => {
    if (!nom.includes(' -- ')) {
        return nomFr || nom;
    }
    const [latinName, arabicName] = nom.split(' -- ');
    return lang === 'ar' ? (arabicName || latinName) : (nomFr || latinName);
};
// 1. GET /pays
router.get('/pays', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const lang = req.query.lang === 'ar' ? 'ar' : 'lat';
    try {
        const pays = yield prisma_1.default.pays.findMany({ orderBy: { Nom: 'asc' } });
        const data = pays.map(p => ({
            id: p.Id,
            label: getLabel(lang, p.Nom, p.Nom_Fr),
        }));
        res.set('Cache-Control', 'public, max-age=86400').json(data);
    }
    catch (_a) {
        res.status(500).json({ error: 'Failed to retrieve countries' });
    }
}));
// 2. GET /villes
router.get('/villes', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const lang = req.query.lang === 'ar' ? 'ar' : 'lat';
    const idPays = parseInt(req.query.idPays, 10);
    if (isNaN(idPays)) {
        return res.status(400).json({ error: 'idPays parameter is required and must be a number.' });
    }
    try {
        // Always fetch whatever cities exist (may be an empty array)
        const villes = yield prisma_1.default.ville.findMany({
            where: { IdPays: idPays },
            orderBy: { Nom: 'asc' },
        });
        const data = villes.map(v => ({
            id: v.Id,
            label: getLabel(lang, v.Nom, v.Nom_Fr),
        }));
        res.set('Cache-Control', 'public, max-age=3600').json(data);
    }
    catch (_a) {
        res.status(500).json({ error: 'Failed to retrieve cities' });
    }
}));
// 3. GET /juridictions
router.get('/juridictions', (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const juris = yield prisma_1.default.juridiction.findMany({
            where: { Affichable: true },
            orderBy: { Nom: 'asc' },
        });
        const data = juris.map(j => ({
            id: j.Id,
            label: j.Nom,
        }));
        res.set('Cache-Control', 'public, max-age=86400').json(data);
    }
    catch (_a) {
        res.status(500).json({ error: 'Failed to retrieve jurisdictions' });
    }
}));
// 4. GET /objets
router.get('/objets', (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const objets = yield prisma_1.default.objetInjustice.findMany({ orderBy: { Libelle: 'asc' } });
        const data = objets.map(o => ({
            id: o.IdObjetInjustice,
            label: o.Libelle,
        }));
        res.set('Cache-Control', 'public, max-age=86400').json(data);
    }
    catch (_a) {
        res.status(500).json({ error: 'Failed to retrieve complaint objects' });
    }
}));
// 5. GET /professions
router.get('/professions', (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const profs = yield prisma_1.default.profession.findMany({ orderBy: { Libelle: 'asc' } });
        const data = profs.map(p => ({
            id: p.Id,
            label: p.Libelle,
        }));
        res.set('Cache-Control', 'public, max-age=86400').json(data);
    }
    catch (_a) {
        res.status(500).json({ error: 'Failed to retrieve professions' });
    }
}));
// 6. GET /situations-residence
router.get('/situations-residence', (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const situations = yield prisma_1.default.situationResidence.findMany({ orderBy: { Libelle: 'asc' } });
        const data = situations.map(s => ({
            id: s.Id,
            label: s.Libelle,
        }));
        res.set('Cache-Control', 'public, max-age=86400').json(data);
    }
    catch (_a) {
        res.status(500).json({ error: 'Failed to retrieve residence situations' });
    }
}));
exports.default = router;
