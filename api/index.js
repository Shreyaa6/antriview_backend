import { createApp } from '../src/app.js';
import { config } from '../src/config.js';
import { pool } from '../src/infrastructure/database/pool.js';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let schemaEnsured = false;

async function ensureSchema() {
  if (schemaEnsured) return;
  try {
    // In vercel, __dirname is backend/api
    const schemaPath = path.join(__dirname, '..', 'src', 'infrastructure', 'database', 'schema.sql');
    console.log('[Vercel Function] schema path', schemaPath);
    const sql = await fs.readFile(schemaPath, 'utf8');
    await pool.query(sql);
    schemaEnsured = true;
  } catch (error) {
    console.error('Failed to ensure schema:', error);
    throw error;
  }
}

console.log('[Vercel Function] api/index.js initializing');
console.log('[Vercel Function] config status', {
  hasDatabaseUrl: Boolean(config.databaseUrl),
  hasJwtSecret: Boolean(config.jwtSecret),
  hasGoogleClientId: Boolean(config.googleClientId),
  hasGroqApiKey: Boolean(config.groqApiKey),
});
// Ensure schema is loaded before creating the app
await ensureSchema();
console.log('[Vercel Function] api/index.js schema check complete');

const app = createApp();

export default app;
