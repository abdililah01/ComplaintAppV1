# Étape 1: Utiliser une image Node.js officielle comme base
FROM node:18-alpine

# Étape 2: Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Étape 3: Copier les fichiers de manifeste du projet
COPY package*.json ./

# Étape 4: Installer les dépendances de production
RUN npm install --production

# Étape 5: Copier le reste du code de l'application
COPY . .

# Étape 6: Exposer le port que l'application utilisera
EXPOSE 3000

# Étape 7: Commande pour démarrer l'application (en mode dev pour le moment via docker-compose)
# Le CMD du docker-compose.yml prendra le dessus, c'est normal.
CMD [ "npm", "run", "dev" ]