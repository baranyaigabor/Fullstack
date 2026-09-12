import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { fileURLToPath } from 'node:url';
import * as schema from './database.schema.js';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  public readonly pool: Pool;
  public readonly db;

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    this.db = drizzle(this.pool, { schema });
  }

  async onModuleInit() {
    if (process.env.RUN_DATABASE_MIGRATIONS === 'false') {
      return;
    }

    const migrationsFolder = fileURLToPath(
      new URL('../../drizzle', import.meta.url),
    );
    await migrate(this.db, { migrationsFolder });
  }

  async onModuleDestroy() {
    await this.pool.end();
  }
}
