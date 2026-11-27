import { Client } from 'pg';
import { readFile } from 'node:fs/promises';

const envText = await readFile('.env.local', 'utf8');
for (const line of envText.split('\n')) {
  if (!line || line.startsWith('#')) continue;
  const separator = line.indexOf('=');
  process.env[line.slice(0, separator)] = line.slice(separator + 1);
}

if (!process.env.MIGRATION_DATABASE_URL) {
  throw new Error('Run npm run local:env before seeding local data.');
}

const client = new Client({ connectionString: process.env.MIGRATION_DATABASE_URL });
await client.connect();
try {
  await client.query(
    `INSERT INTO unimovil.incidents
       (public_id, category, description, public_summary, approximate_zone,
        operational_status, visibility, revision, published_revision, location)
     VALUES (
       'local-demo-access-obstruction',
       'access_obstruction',
       'Ejemplo local sintético para probar el mapa. No describe una incidencia real.',
       'Ejemplo local sintético para probar el mapa. No describe una incidencia real.',
       'Entorno de Ciudad Universitaria (ejemplo sintético)',
       'under_review',
       'published',
       1,
       1,
       extensions.ST_SetSRID(
         extensions.ST_MakePoint(-3.7262::double precision, 40.4486::double precision),
         4326
       )::extensions.geography
     )
     ON CONFLICT (public_id) DO NOTHING`,
  );
} finally {
  await client.end();
}

console.log('Inserted the synthetic local public incident fixture if it was absent.');
