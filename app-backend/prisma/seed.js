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
Object.defineProperty(exports, "__esModule", { value: true });
// prisma/seed.ts
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Start seeding…');
        /* ── Pays ───────────────────────────────────────────────────────── */
        yield prisma.pays.createMany({
            data: [
                { Nom: 'MAROC -- المغرب', Code: 'MA', Nationalite: 'Marocaine' },
                { Nom: 'FRANCE -- فرنسا', Code: 'FR', Nationalite: 'Française' },
            ],
        });
        /* ── Villes ─────────────────────────────────────────────────────── */
        yield prisma.ville.createMany({
            data: [
                { Nom: 'RABAT -- الرباط', IdPays: 1, CodePostal: '10000' },
                { Nom: 'CASABLANCA -- الدار البيضاء', IdPays: 1, CodePostal: '20000' },
                { Nom: 'PARIS -- باريس', IdPays: 2, CodePostal: '75000' },
            ],
        });
        /* ── SituationResidence ────────────────────────────────────────── */
        yield prisma.situationResidence.createMany({
            data: [
                { Libelle: 'Propriétaire' },
                { Libelle: 'Locataire' },
            ],
        });
        /* ── Profession ────────────────────────────────────────────────── */
        yield prisma.profession.createMany({
            data: [
                { Libelle: 'Salarié' },
                { Libelle: 'Artisan' },
                { Libelle: 'Étudiant' },
            ],
        });
        /* ── Juridiction ───────────────────────────────────────────────── */
        yield prisma.juridiction.createMany({
            data: [
                { Nom: 'TRIBUNAL DE RABAT', Affichable: true },
                { Nom: 'TRIBUNAL DE CASA', Affichable: true },
            ],
        });
        /* ── ObjetInjustice ────────────────────────────────────────────── */
        yield prisma.objetInjustice.createMany({
            data: [
                { Libelle: 'Vol' },
                { Libelle: 'Escroquerie' },
            ],
        });
        /* ── RolePlainte ───────────────────────────────────────────────── */
        yield prisma.rolePlainte.createMany({
            data: [
                { Libelle: 'Plaignant' },
                { Libelle: 'Défendeur' },
            ],
        });
        console.log('Seeding finished.');
    });
}
main()
    .catch(e => {
    console.error(e);
    process.exit(1);
})
    .finally(() => prisma.$disconnect());
