const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 4000;

// Middlewares
app.use(cors()); // Accepte les requêtes de l'extérieur
app.use(express.json()); // Permet au serveur de lire le JSON envoyé par l'app

// Un "endpoint" de test : une URL que notre app mobile pourra appeler
app.get('/api/test', (req, res) => {
    console.log("✅ Requête reçue sur /api/test");
    res.json({ message: "Le backend Node.js répond correctement !" });
});

// On met le serveur en écoute sur le port 4000
app.listen(PORT, () => {
    console.log(`🚀 Backend démarré et à l'écoute sur http://localhost:${PORT}`);
});