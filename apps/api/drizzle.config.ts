import { defineConfig } from 'drizzle-kit';
import dotenv from 'dotenv';
import { resolve } from 'node:path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });
dotenv.config({ path: resolve(process.cwd(), '../../.env.local') });

export default defineConfig({
  dialect: 'postgresql',
  schema: './apps/api/src/database/schema.ts',
  out: './apps/api/drizzle',
  dbCredentials: {
    url:
      process.env.MIGRATION_DATABASE_URL ??
      process.env.DATABASE_URL ??
      'postgresql://postgres:postgres@127.0.0.1:54322/postgres',
  },
  strict: true,
  verbose: true,
});
