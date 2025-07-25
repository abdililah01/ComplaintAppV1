import app from './app';
import dotenv from 'dotenv';

// Charge les variables d'environnement depuis le fichier .env
dotenv.config();

// Récupère le port depuis les variables d'environnement, avec 3000 comme valeur par défaut
const PORT = process.env.PORT || 3000;

// Démarre le serveur
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
