// Fichier: /app-backend/eslint.config.js (FINAL & CORRECT)

const tseslint = require('typescript-eslint');

module.exports = tseslint.config(
    // Applique les règles recommandées par défaut
    ...tseslint.configs.recommended,

    // --- Configuration Globale ---
    {
        // Indique à ESLint d'ignorer complètement ces dossiers.
        // C'est la correction la plus importante.
        ignores: ['dist/', 'node_modules/'],
    },

    // --- Exception pour les fichiers .js (comme celui-ci) ---
    {
        files: ['**/*.js'],
        rules: {
            // Permet l'utilisation de 'require()' dans les fichiers de configuration .js
            '@typescript-eslint/no-var-requires': 'off',
            '@typescript-eslint/no-require-imports': 'off',
        },
    }
);