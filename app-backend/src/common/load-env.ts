/**
 * Loads environment variables.
 * • If .env.local exists, load it **first** so it *wins*.
 * • Always fall back to .env afterwards.
 */
import * as dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();                     // repo root when you run  npm run …
const localEnv     = path.join(projectRoot, '.env.local');
const baseEnv      = path.join(projectRoot, '.env');

if (fs.existsSync(localEnv)) {
  dotenv.config({ path: localEnv });                   // highest priority
}
dotenv.config({ path: baseEnv, override: false });     // only fill the gaps
