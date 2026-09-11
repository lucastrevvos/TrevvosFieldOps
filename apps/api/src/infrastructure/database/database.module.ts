import { Global, Module } from '@nestjs/common';
import { Pool } from 'pg';

import { getDatabaseConfig } from './database.config.js';

export const DATABASE_POOL = Symbol('DATABASE_POOL');

@Global()
@Module({
  exports: [DATABASE_POOL],
  providers: [
    {
      provide: DATABASE_POOL,
      useFactory: (): Pool => new Pool(getDatabaseConfig()),
    },
  ],
})
export class DatabaseModule {}
