import { Pool } from 'pg';

import { getDatabaseConfig } from './database.config.js';
import { runMigrations } from './run-migrations.js';
const pool = new Pool(getDatabaseConfig());

try {
  const applied = await runMigrations(pool);
  process.stdout.write(`Applied migrations: ${applied.join(', ')}.\n`);
} finally {
  await pool.end();
}
