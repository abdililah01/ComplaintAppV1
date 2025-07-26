// Fichier: /app-backend/prisma/seed.ts
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding...');

    await prisma.pays.createMany({
        data: [
            { Id: 1, Nom: 'MAROC -- المغرب', Code: 'MA', Nationalite: 'Marocaine' },
            { Id: 2, Nom: 'FRANCE -- فرنسا', Code: 'FR', Nationalite: 'Française' },
        ],
        // CORRECTION: 'skipDuplicates: true' a été retiré car non supporté par SQL Server.
    });

    await prisma.ville.createMany({
        data: [
            { Id: 1, Nom: 'RABAT -- الرباط', IdPays: 1, CodePostal: '10000' },
            { Id: 2, Nom: 'CASABLANCA -- الدار البيضاء', IdPays: 1, CodePostal: '20000' },
            { Id: 3, Nom: 'PARIS -- باريس', IdPays: 2, CodePostal: '75000' },
        ],
        // CORRECTION: 'skipDuplicates: true' a été retiré car non supporté par SQL Server.
    });

    await prisma.situationResidence.createMany({
        data: [{ Id: 1, Libelle: 'Propriétaire' }, { Id: 2, Libelle: 'Locataire' }],
        // CORRECTION: 'skipDuplicates: true' a été retiré car non supporté par SQL Server.
    });

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });