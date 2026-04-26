import { createApp } from '../src/app.js';
import { pool } from '../src/db/pool.js';
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
    const schemaPath = path.join(__dirname, '..', 'src', 'db', 'schema.sql');
    const sql = await fs.readFile(schemaPath, 'utf8');
    await pool.query(sql);
    schemaEnsured = true;
  } catch (error) {
    console.error('Failed to ensure schema:', error);
  }
}

const app = createApp();

// Add ensureSchema as a middleware so it runs on the first request
// without blocking the module export
app.use(async (req, res, next) => {
  await ensureSchema();
  next();
});

export default app;
