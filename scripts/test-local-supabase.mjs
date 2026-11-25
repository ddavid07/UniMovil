import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash, randomUUID } from 'node:crypto';
import { Client } from 'pg';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import sharp from 'sharp';

const envText = await readFile('.env.local', 'utf8');
for (const line of envText.split('\n')) {
  if (!line || line.startsWith('#')) continue;
  const separator = line.indexOf('=');
  process.env[line.slice(0, separator)] = line.slice(separator + 1);
}

const supabaseUrl = process.env.SUPABASE_URL;
const anonKey = process.env.SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const databaseUrl = process.env.MIGRATION_DATABASE_URL;
const apiUrl = `http://127.0.0.1:${process.env.API_PORT ?? '3001'}/api`;
if (!supabaseUrl || !anonKey || !serviceRoleKey || !databaseUrl) {
  throw new Error('Run npm run local:env before the local integration check.');
}
if (!['localhost', '127.0.0.1', '::1'].includes(new URL(supabaseUrl).hostname)) {
  throw new Error('This integration check only accepts a loopback Supabase URL.');
}

const admin = createSupabaseClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const anonymous = createSupabaseClient(supabaseUrl, anonKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const database = new Client({ connectionString: databaseUrl });
const accounts = [];

async function api(path, init = {}) {
  return fetch(`${apiUrl}${path}`, init);
}

async function json(response) {
  return response.json().catch(() => ({}));
}

async function createConfirmedAccount() {
  const suffix = randomUUID();
  const email = `unimovil-${suffix}@example.test`;
  const password = `Local-Test-${suffix.slice(0, 8)}-Aa9!`;
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  assert.ifError(error);
  accounts.push(data.user.id);
  const { data: sessionData, error: sessionError } =
    await anonymous.auth.signInWithPassword({
      email,
      password,
    });
  assert.ifError(sessionError);
  assert.ok(sessionData.session);
  return {
    id: data.user.id,
    email,
    password,
    accessToken: sessionData.session.access_token,
  };
}

function authHeaders(token) {
  return { Authorization: `Bearer ${token}` };
}

async function run() {
  await database.connect();
  const healthResponse = await api('/health');
  assert.equal(healthResponse.status, 200, 'API health endpoint responds');
  console.log('✓ API health');

  const publicResponse = await api('/incidents');
  assert.equal(
    publicResponse.status,
    200,
    'public incident feed is available anonymously',
  );
  const publicFeed = await json(publicResponse);
  assert.ok(
    publicFeed.incidents.some(
      (incident) => incident.publicId === 'local-demo-access-obstruction',
    ),
  );
  assert.ok(
    publicFeed.incidents.every((incident) =>
      Object.keys(incident).every((key) =>
        [
          'publicId',
          'category',
          'description',
          'status',
          'updatedAt',
          'latitude',
          'longitude',
        ].includes(key),
      ),
    ),
  );
  const categoryFeed = await json(await api('/incidents?category=access_obstruction'));
  assert.ok(
    categoryFeed.incidents.every(
      (incident) => incident.category === 'access_obstruction',
    ),
  );
  const statusFeed = await json(await api('/incidents?status=under_review'));
  assert.ok(
    statusFeed.incidents.length > 0 &&
      statusFeed.incidents.every((incident) => incident.status === 'under_review'),
  );
  assert.equal((await api('/incidents?status=not-a-status')).status, 400);
  assert.equal((await api('/incidents?category=not-a-category')).status, 400);
  console.log('✓ public incident projection and anonymous access');

  const registrationEmail = `unimovil-${randomUUID()}@example.test`;
  const registrationPassword = `Local-Test-${randomUUID().slice(0, 8)}-Aa9!`;
  const registrationResponse = await api('/auth/sign-up', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: registrationEmail, password: registrationPassword }),
  });
  assert.equal(registrationResponse.status, 201);
  assert.equal((await json(registrationResponse)).confirmationRequired, true);
  const registrationUser = await database.query(
    'SELECT id, email_confirmed_at FROM auth.users WHERE email = $1',
    [registrationEmail],
  );
  assert.equal(registrationUser.rowCount, 1);
  assert.equal(registrationUser.rows[0].email_confirmed_at, null);
  const registrationUserId = registrationUser.rows[0].id;
  accounts.push(registrationUserId);
  const blockedLogin = await anonymous.auth.signInWithPassword({
    email: registrationEmail,
    password: registrationPassword,
  });
  assert.ok(blockedLogin.error, 'unconfirmed email cannot start an account session');
  const confirmation = await admin.auth.admin.updateUserById(registrationUserId, {
    email_confirm: true,
  });
  assert.ifError(confirmation.error);
  const confirmedLogin = await anonymous.auth.signInWithPassword({
    email: registrationEmail,
    password: registrationPassword,
  });
  assert.ifError(confirmedLogin.error);
  assert.ok(confirmedLogin.data.session);
  console.log('✓ registration requires email confirmation before account access');

  const noSession = await api('/me/favorites');
  assert.equal(noSession.status, 401, 'private API rejects anonymous requests');

  const first = await createConfirmedAccount();
  const second = await createConfirmedAccount();
  const profileResponse = await api('/me', { headers: authHeaders(first.accessToken) });
  assert.equal(profileResponse.status, 200);
  assert.equal((await json(profileResponse)).id, first.id);
  const profileUpdate = await api('/me', {
    method: 'PATCH',
    headers: { ...authHeaders(first.accessToken), 'Content-Type': 'application/json' },
    body: JSON.stringify({ relationship: 'student' }),
  });
  assert.equal(profileUpdate.status, 200, 'profile update succeeds for owner');
  assert.equal((await json(profileUpdate)).relationship, 'student');
  console.log('✓ account profile and ownership');

  const favoriteResponse = await api('/me/favorites', {
    method: 'POST',
    headers: { ...authHeaders(first.accessToken), 'Content-Type': 'application/json' },
    body: JSON.stringify({ resourceType: 'transit-stop', resourceId: 'smoke-stop' }),
  });
  assert.equal(favoriteResponse.status, 201);
  const favorite = await json(favoriteResponse);
  const firstFavorites = await json(
    await api('/me/favorites', { headers: authHeaders(first.accessToken) }),
  );
  const secondFavorites = await json(
    await api('/me/favorites', { headers: authHeaders(second.accessToken) }),
  );
  assert.ok(firstFavorites.favorites.some((item) => item.id === favorite.id));
  assert.equal(
    secondFavorites.favorites.length,
    0,
    'another account cannot read the favorite',
  );
  const crossDelete = await api(`/me/favorites/${favorite.id}`, {
    method: 'DELETE',
    headers: authHeaders(second.accessToken),
  });
  assert.equal(crossDelete.status, 204);
  const preservedFavorites = await json(
    await api('/me/favorites', { headers: authHeaders(first.accessToken) }),
  );
  assert.ok(preservedFavorites.favorites.some((item) => item.id === favorite.id));
  console.log('✓ favorite persistence and cross-account isolation');

  const browserLogin = await api('/auth/sign-in', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: 'http://localhost:8081' },
    body: JSON.stringify({ email: first.email, password: first.password }),
  });
  assert.equal(browserLogin.status, 200);
  const cookieHeader = browserLogin.headers.get('set-cookie');
  assert.ok(
    cookieHeader?.includes('HttpOnly') &&
      cookieHeader.includes('Secure') &&
      cookieHeader.includes('SameSite=Lax'),
  );
  const cookie = cookieHeader.split(';', 1)[0];
  const sessionId = cookie.slice(cookie.indexOf('=') + 1);
  const sessionHash = createHash('sha256').update(sessionId).digest('hex');
  await database.query(
    `UPDATE unimovil.web_sessions SET access_token_expires_at = now() - interval '1 minute'
     WHERE session_hash = $1`,
    [sessionHash],
  );
  const browserSession = await api('/auth/session', { headers: { Cookie: cookie } });
  assert.equal((await json(browserSession)).user.id, first.id);
  const refreshedSession = await database.query(
    'SELECT access_token_expires_at FROM unimovil.web_sessions WHERE session_hash = $1',
    [sessionHash],
  );
  assert.ok(refreshedSession.rows[0]?.access_token_expires_at.getTime() > Date.now());
  const csrfRejected = await api('/me/favorites', {
    method: 'POST',
    headers: {
      Cookie: cookie,
      Origin: 'https://attacker.invalid',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ resourceType: 'place', resourceId: 'attacker' }),
  });
  assert.ok(
    csrfRejected.status >= 400,
    'cookie-authenticated mutations reject an untrusted origin',
  );
  const browserLogout = await api('/auth/sign-out', {
    method: 'POST',
    headers: { Cookie: cookie, Origin: 'http://localhost:8081' },
  });
  assert.equal(browserLogout.status, 204);
  console.log('✓ browser BFF cookie, session and CSRF origin check');

  const recoveryRequests = await Promise.all([
    api('/auth/recovery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: first.email }),
    }),
    api('/auth/recovery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'not-registered@example.test' }),
    }),
  ]);
  const recoveryBodies = await Promise.all(recoveryRequests.map(json));
  assert.deepEqual(
    recoveryRequests.map((response) => response.status),
    [202, 202],
  );
  assert.equal(recoveryBodies[0].message, recoveryBodies[1].message);
  console.log('✓ password recovery response does not reveal account existence');

  const recoveryLink = await admin.auth.admin.generateLink({
    type: 'recovery',
    email: first.email,
  });
  assert.ifError(recoveryLink.error);
  const { data: recoverySession, error: recoveryError } =
    await anonymous.auth.verifyOtp({
      token_hash: recoveryLink.data.properties.hashed_token,
      type: 'recovery',
    });
  assert.ifError(recoveryError);
  assert.ok(recoverySession.session);
  const newPassword = `Recovered-${randomUUID().slice(0, 12)}-Aa9!`;
  const passwordUpdate = await api('/auth/update-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      accessToken: recoverySession.session.access_token,
      password: newPassword,
    }),
  });
  assert.equal(passwordUpdate.status, 204, 'valid recovery token can update password');
  const { data: renewedSession, error: newPasswordError } =
    await anonymous.auth.signInWithPassword({
      email: first.email,
      password: newPassword,
    });
  assert.ifError(newPasswordError);
  assert.ok(renewedSession.session);
  first.accessToken = renewedSession.session.access_token;
  console.log('✓ password recovery through Supabase Auth');

  const png = await sharp({
    create: { width: 16, height: 16, channels: 3, background: '#b71234' },
  })
    .png()
    .toBuffer();
  const form = new FormData();
  form.set('category', 'access_obstruction');
  form.set(
    'description',
    'Incidencia sintética de prueba automatizada; no describe un hecho real.',
  );
  form.set('coordinates', JSON.stringify({ latitude: 40.4486, longitude: -3.7262 }));
  form.set('files', new File([png], 'synthetic.png', { type: 'image/png' }));
  const idempotencyKey = randomUUID();
  const incidentResponse = await api('/incidents', {
    method: 'POST',
    headers: { ...authHeaders(first.accessToken), 'Idempotency-Key': idempotencyKey },
    body: form,
  });
  assert.equal(incidentResponse.status, 201);
  const incident = await json(incidentResponse);
  assert.equal(incident.status, 'received');
  assert.equal(incident.visibility, 'private');
  assert.equal(incident.attachmentCount, 1);
  const ownIncidentFeed = await json(
    await api('/me/incidents', { headers: authHeaders(first.accessToken) }),
  );
  const ownIncident = ownIncidentFeed.incidents.find((item) => item.id === incident.id);
  assert.equal(typeof ownIncident.latitude, 'number');
  assert.equal(typeof ownIncident.longitude, 'number');
  const attachmentResult = await database.query(
    `SELECT id, storage_path FROM unimovil.incident_attachments WHERE incident_id = $1`,
    [incident.id],
  );
  assert.equal(attachmentResult.rowCount, 1);
  const attachment = attachmentResult.rows[0];
  const ownerDownload = await api(
    `/me/incidents/${incident.id}/attachments/${attachment.id}`,
    {
      headers: authHeaders(first.accessToken),
    },
  );
  assert.equal(ownerDownload.status, 200);
  const normalizedImage = Buffer.from(await ownerDownload.arrayBuffer());
  const imageMetadata = await sharp(normalizedImage).metadata();
  assert.equal(imageMetadata.format, 'webp');
  assert.equal(
    imageMetadata.exif,
    undefined,
    'normalized image does not retain EXIF metadata',
  );
  const privateDownload = await api(
    `/me/incidents/${incident.id}/attachments/${attachment.id}`,
    {
      headers: authHeaders(second.accessToken),
    },
  );
  assert.equal(
    privateDownload.status,
    404,
    'another account cannot download private evidence',
  );
  const publicAfterReport = await json(await api('/incidents'));
  assert.ok(
    !publicAfterReport.incidents.some((item) => item.publicId === incident.publicId),
  );
  const repeatForm = new FormData();
  repeatForm.set('category', 'access_obstruction');
  repeatForm.set(
    'description',
    'Incidencia sintética de prueba automatizada; no describe un hecho real.',
  );
  repeatForm.set(
    'coordinates',
    JSON.stringify({ latitude: 40.4486, longitude: -3.7262 }),
  );
  repeatForm.set('files', new File([png], 'synthetic.png', { type: 'image/png' }));
  const repeated = await api('/incidents', {
    method: 'POST',
    headers: { ...authHeaders(first.accessToken), 'Idempotency-Key': idempotencyKey },
    body: repeatForm,
  });
  assert.equal(repeated.status, 201);
  assert.equal((await json(repeated)).id, incident.id, 'retry is idempotent');
  console.log(
    '✓ private incident upload, image normalization, authorization and idempotency',
  );

  const anonymousStorage = await fetch(
    `${supabaseUrl}/storage/v1/object/public/incident-evidence/${attachment.storage_path}`,
    { headers: { apikey: anonKey } },
  );
  assert.notEqual(
    anonymousStorage.status,
    200,
    'incident evidence is not publicly readable',
  );
  console.log('✓ incident evidence bucket is private');

  const deleted = await api('/me', {
    method: 'DELETE',
    headers: authHeaders(first.accessToken),
  });
  assert.equal(deleted.status, 204, 'account deletion succeeds');
  const accountAfterDelete = await admin.auth.admin.getUserById(first.id);
  assert.ok(accountAfterDelete.error, 'account identity is deleted');
  const remainingIncident = await database.query(
    'SELECT id FROM unimovil.incidents WHERE id = $1',
    [incident.id],
  );
  assert.equal(
    remainingIncident.rowCount,
    0,
    'private incident cascades with account deletion',
  );
  const remainingObject = await database.query(
    'SELECT id FROM unimovil.incident_attachments WHERE id = $1',
    [attachment.id],
  );
  assert.equal(
    remainingObject.rowCount,
    0,
    'attachment metadata is deleted with account',
  );
  console.log('✓ account deletion cascades private records and evidence');

  const secondDelete = await api('/me', {
    method: 'DELETE',
    headers: authHeaders(second.accessToken),
  });
  assert.equal(secondDelete.status, 204);
  console.log('✓ temporary test accounts removed');
}

try {
  await run();
} finally {
  await database.end().catch(() => undefined);
  for (const userId of accounts)
    await admin.auth.admin.deleteUser(userId).catch(() => undefined);
}
