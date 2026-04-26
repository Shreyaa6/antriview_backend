import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApp } from './app.js';
import { config } from './config.js';
import { pool } from './infrastructure/database/pool.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function ensureSchema() {
  try {
    const schemaPath = path.join(__dirname, 'infrastructure', 'database', 'schema.sql');
    const sql = await fs.readFile(schemaPath, 'utf8');
    await pool.query(sql);
    console.log('Database schema ensured.');
  } catch (error) {
    console.error('Failed to ensure schema (Database might be paused or unreachable):', error.message);
  }
}

async function start() {
  await ensureSchema();
  const app = createApp();
  app.listen(config.port, () => {
    console.log(`Backend listening on http://localhost:${config.port}`);
  });
}

start().catch((error) => {
  console.error('Failed to start backend', error);
  process.exit(1);
});
