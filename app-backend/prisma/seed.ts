// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    console.log('Start seeding…')

    /* ── Pays ───────────────────────────────────────────────────────── */
    await prisma.pays.createMany({
        data: [
            { Nom: 'MAROC -- المغرب', Code: 'MA', Nationalite: 'Marocaine' },
            { Nom: 'FRANCE -- فرنسا', Code: 'FR', Nationalite: 'Française' },
        ],

    })

    /* ── Villes ─────────────────────────────────────────────────────── */
    await prisma.ville.createMany({
        data: [
            { Nom: 'RABAT -- الرباط',              IdPays: 1, CodePostal: '10000' },
            { Nom: 'CASABLANCA -- الدار البيضاء', IdPays: 1, CodePostal: '20000' },
            { Nom: 'PARIS -- باريس',               IdPays: 2, CodePostal: '75000' },
        ],

    })

    /* ── SituationResidence ────────────────────────────────────────── */
    await prisma.situationResidence.createMany({
        data: [
            { Libelle: 'Propriétaire' },
            { Libelle: 'Locataire'    },
        ],

    })

    /* ── Profession ────────────────────────────────────────────────── */
    await prisma.profession.createMany({
        data: [
            { Libelle: 'Salarié'  },
            { Libelle: 'Artisan'  },
            { Libelle: 'Étudiant' },
        ],

    })

    /* ── Juridiction ───────────────────────────────────────────────── */
    await prisma.juridiction.createMany({
        data: [
            { Nom: 'TRIBUNAL DE RABAT', Affichable: true },
            { Nom: 'TRIBUNAL DE CASA',  Affichable: true },
        ],

    })

    /* ── ObjetInjustice ────────────────────────────────────────────── */
    await prisma.objetInjustice.createMany({
        data: [
            { Libelle: 'Vol'         },
            { Libelle: 'Escroquerie' },
        ],

    })

    /* ── RolePlainte ───────────────────────────────────────────────── */
    await prisma.rolePlainte.createMany({
        data: [
            { Libelle: 'Plaignant' },
            { Libelle: 'Défendeur' },
        ],

    })

    console.log('Seeding finished.')
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(() => prisma.$disconnect())
