/**
 * Loads environment variables.
 * • If .env.local exists, load it **first** so it *wins*.
 * • Then fall back to .env to fill any gaps.
 */
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

const projectRoot = path.resolve(__dirname, '..', '..');
const localEnvPath = path.join(projectRoot, '.env.local');
const baseEnvPath = path.join(projectRoot, '.env');

// Load .env.local (highest priority)
if (fs.existsSync(localEnvPath)) {
  console.info(`⚙️  Loading environment from ${localEnvPath}`);
  dotenv.config({ path: localEnvPath });
}

// Load .env (fallback values only)
if (fs.existsSync(baseEnvPath)) {
  console.info(`⚙️  Loading environment from ${baseEnvPath}`);
  dotenv.config({ path: baseEnvPath, override: false });
} else {
  console.warn(`⚠️  Base env file not found at ${baseEnvPath}`);
}
