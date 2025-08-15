// Fichier: /app-backend/jest.config.js

/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    clearMocks: true,
    testMatch: [
      '**/tests/*.test.ts',            // for files in tests/
      '**/src/tests/*.spec.ts',        // for files in src/tests/ (including SQLi)
      '**/src/trx/__tests__/**/*.spec.ts' // specific for trx folder if needed
    ],
    setupFilesAfterEnv: ['<rootDir>/tests/jest.env.setup.js'],
  };
  