import { readdir, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Pool } from 'pg';

export async function runMigrations(pool: Pool): Promise<string[]> {
  const directory = join(dirname(fileURLToPath(import.meta.url)), 'migrations');
  const filenames = (await readdir(directory)).filter((name) => name.endsWith('.sql')).sort();

  for (const filename of filenames) {
    await pool.query(await readFile(join(directory, filename), 'utf8'));
  }

  return filenames;
}
