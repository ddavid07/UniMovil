import { Client } from 'pg';
import { readFile } from 'node:fs/promises';

const envText = await readFile('.env.local', 'utf8');
for (const line of envText.split('\n')) {
  if (!line || line.startsWith('#')) continue;
  const separator = line.indexOf('=');
  process.env[line.slice(0, separator)] = line.slice(separator + 1);
}

const client = new Client({ connectionString: process.env.MIGRATION_DATABASE_URL });
await client.connect();
try {
  await client.query('BEGIN');
  await client.query(
    `DO $setup$
     BEGIN
       IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'unimovil_runtime') THEN
         CREATE ROLE unimovil_runtime LOGIN;
       END IF;
     END
     $setup$`,
  );
  if (!/^[a-f0-9]{48}$/.test(process.env.RUNTIME_DB_PASSWORD ?? '')) {
    throw new Error('The local runtime database password is invalid.');
  }
  await client.query(
    `ALTER ROLE unimovil_runtime WITH LOGIN PASSWORD '${process.env.RUNTIME_DB_PASSWORD}'`,
  );
  await client.query('GRANT anon, authenticated TO unimovil_runtime');
  await client.query('GRANT USAGE ON SCHEMA unimovil TO unimovil_runtime');
  await client.query(
    'GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA unimovil TO unimovil_runtime',
  );
  await client.query(
    'REVOKE UPDATE, DELETE ON unimovil.incident_audit_events FROM unimovil_runtime',
  );
  await client.query(
    'GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA unimovil TO unimovil_runtime',
  );
  await client.query('COMMIT');
} catch (error) {
  await client.query('ROLLBACK');
  throw error;
} finally {
  await client.end();
}
console.log('Configured the least-privilege local API database role.');
