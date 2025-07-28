# Fichier: /app-backend/Dockerfile

# Étape 1: Utiliser une image Node.js basée sur Debian (plus compatible avec Prisma)
FROM node:18-slim

# Étape 2: Installer les dépendances système nécessaires pour Prisma
RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

# Étape 3: Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Étape 4: Copier les fichiers de manifeste et le schéma Prisma
COPY package*.json ./
COPY prisma ./prisma/

# Étape 5: Installer TOUTES les dépendances (dev et prod)
RUN npm install

# Étape 6: Générer le client Prisma
RUN npx prisma generate

# Étape 7: Copier le reste du code de l'application
COPY . .

# Étape 8: Exposer le port que l'application utilisera
EXPOSE 3000

# Étape 9: Commande par défaut
CMD [ "npm", "run", "dev" ]