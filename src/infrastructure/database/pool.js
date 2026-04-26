import pg from 'pg';
import { config } from '../../config.js';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: config.databaseUrl,
  max: 20,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 8_000,
  ssl: config.databaseUrl.includes('localhost') ? false : { rejectUnauthorized: false }
});

pool.on('error', (error) => {
  console.error('Unexpected postgres pool error', error);
});
