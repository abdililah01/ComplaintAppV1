"use strict";
// Fichier: /src/common/prisma.ts
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
// Crée une instance unique du client Prisma.
// Cette instance gérera le pool de connexions à la base de données pour nous.
const prisma = new client_1.PrismaClient();
// Exporte l'instance pour qu'elle puisse être importée et utilisée
// dans n'importe quelle autre partie de notre application (Lookup ou Transactional API).
exports.default = prisma;
