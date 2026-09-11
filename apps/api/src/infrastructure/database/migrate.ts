import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Pool } from 'pg';

import { getDatabaseConfig } from './database.config.js';

const currentDirectory = dirname(fileURLToPath(import.meta.url));
const migration = await readFile(
  join(currentDirectory, 'migrations/001-create-work-orders.sql'),
  'utf8',
);
const pool = new Pool(getDatabaseConfig());

try {
  await pool.query(migration);
  process.stdout.write('Applied migration 001-create-work-orders.\n');
} finally {
  await pool.end();
}
