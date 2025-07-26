// Fichier: /app-backend/eslint.config.js

const tseslint = require('typescript-eslint');

module.exports = tseslint.config(
    // Applique les règles recommandées à tous les fichiers par défaut
    ...tseslint.configs.recommended,

    // AJOUT: Crée une section d'exception spécifique pour les fichiers .js
    {
        // Ce bloc s'applique UNIQUEMENT aux fichiers se terminant par .js
        files: ['**/*.js'],
        // Dans ces fichiers, on désactive la règle qui nous pose problème.
        rules: {
            '@typescript-eslint/no-require-imports': 'off',
        },
    }
);