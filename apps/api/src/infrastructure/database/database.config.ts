import type { PoolConfig } from 'pg';

export function getDatabaseConfig(): PoolConfig {
  return {
    database: process.env.POSTGRES_DB ?? 'trevvos_fieldops',
    host: process.env.POSTGRES_HOST ?? '127.0.0.1',
    password: process.env.POSTGRES_PASSWORD ?? 'fieldops_local_only',
    port: Number(process.env.POSTGRES_PORT ?? 5432),
    user: process.env.POSTGRES_USER ?? 'fieldops',
  };
}
