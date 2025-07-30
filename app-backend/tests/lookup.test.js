"use strict";
// Fichier: /app-backend/tests/lookup.test.ts
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
const supertest_1 = __importDefault(require("supertest"));
// On importe l'instance d'Express depuis notre fichier app.ts, pas le serveur.
const app_1 = __importDefault(require("../src/lookup/app"));
// Le 'describe' regroupe tous les tests liés aux endpoints de lookup
describe('Lookup API Endpoints (/lookups)', () => {
    // Test du Healthcheck de base
    describe('GET /healthz', () => {
        it('should return a 200 status and an ok message', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app_1.default).get('/healthz');
            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual({ status: 'ok' });
        }));
    });
    // Tests pour la route /pays
    describe('GET /lookups/pays', () => {
        it('should return a list of countries with the correct structure', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app_1.default).get('/lookups/pays');
            expect(res.statusCode).toEqual(200);
            expect(res.headers['content-type']).toMatch(/json/);
            expect(Array.isArray(res.body)).toBe(true);
            // On s'attend à ce que notre script de seed ait inséré des pays
            expect(res.body.length).toBeGreaterThan(0);
            // On vérifie que le premier objet a bien les propriétés 'id' et 'label'
            expect(res.body[0]).toHaveProperty('id');
            expect(res.body[0]).toHaveProperty('label');
        }));
    });
    // Tests pour la route /villes
    describe('GET /lookups/villes', () => {
        it('should return a list of cities for a valid idPays', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app_1.default).get('/lookups/villes?idPays=1'); // On teste avec l'ID du Maroc
            expect(res.statusCode).toEqual(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThan(0);
            expect(res.body[0]).toHaveProperty('id');
            expect(res.body[0]).toHaveProperty('label');
        }));
        it('should return a 400 Bad Request error if idPays is missing', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app_1.default).get('/lookups/villes');
            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('error');
        }));
        it('should return an empty list for an idPays that has no cities', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app_1.default).get('/lookups/villes?idPays=9999'); // Un ID qui n'existe pas
            expect(res.statusCode).toEqual(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toEqual(0);
        }));
    });
    // Tests pour les autres routes de lookup (on vérifie simplement qu'elles retournent un tableau)
    describe('GET /lookups/juridictions', () => {
        it('should return a list of jurisdictions', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app_1.default).get('/lookups/juridictions');
            expect(res.statusCode).toEqual(200);
            expect(Array.isArray(res.body)).toBe(true);
        }));
    });
    describe('GET /lookups/objets', () => {
        it('should return a list of complaint objects', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app_1.default).get('/lookups/objets');
            expect(res.statusCode).toEqual(200);
            expect(Array.isArray(res.body)).toBe(true);
        }));
    });
    describe('GET /lookups/professions', () => {
        it('should return a list of professions', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app_1.default).get('/lookups/professions');
            expect(res.statusCode).toEqual(200);
            expect(Array.isArray(res.body)).toBe(true);
        }));
    });
    describe('GET /lookups/situations-residence', () => {
        it('should return a list of residence situations', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app_1.default).get('/lookups/situations-residence');
            expect(res.statusCode).toEqual(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThan(0); // On sait qu'on a seedé cette table
        }));
    });
    // Test pour une route qui n'existe pas
    describe('GET /a-non-existent-route', () => {
        it('should return a 404 Not Found error', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app_1.default).get('/a-non-existent-route');
            expect(res.statusCode).toEqual(404);
            expect(res.body).toEqual({ error: 'Not found', path: '/a-non-existent-route' });
        }));
    });
});
