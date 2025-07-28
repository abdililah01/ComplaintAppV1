// Fichier: /app-backend/jest.config.js

/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    // Efface les mocks entre chaque test pour une isolation parfaite
    clearMocks: true,
    // Indique à Jest de chercher les fichiers de test dans tout le projet
    testMatch: ['**/tests/**/*.test.ts'],
};