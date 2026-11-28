import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { extname, join, resolve, sep } from 'node:path';
import { stdout } from 'node:process';
import { fileURLToPath, URL } from 'node:url';
import { chromium } from 'playwright';

const repositoryRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const exportDirectory = join(repositoryRoot, 'apps/mobile/dist');
const baseUrl = 'http://localhost';
const transitDataPath = join(
  repositoryRoot,
  'apps/mobile/src/features/campus/data/campus-transit.json',
);
const contentTypes = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.ico', 'image/x-icon'],
  ['.jpeg', 'image/jpeg'],
  ['.jpg', 'image/jpeg'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.png', 'image/png'],
  ['.svg', 'image/svg+xml'],
  ['.webp', 'image/webp'],
  ['.woff', 'font/woff'],
  ['.woff2', 'font/woff2'],
]);

async function serveExport(route) {
  const pathname = decodeURIComponent(new URL(route.request().url()).pathname);
  const resource = pathname === '/' ? '/index.html' : pathname;
  const file = extname(resource) ? resource : `${resource}.html`;
  const path = resolve(exportDirectory, `.${file}`);
  if (!path.startsWith(`${exportDirectory}${sep}`) || !existsSync(path)) {
    return route.fulfill({ status: 404 });
  }
  return route.fulfill({
    path,
    contentType: contentTypes.get(extname(path)) ?? 'application/octet-stream',
  });
}

function findSharedStopForLine44() {
  const data = JSON.parse(readFileSync(transitDataPath, 'utf8'));
  const line = data.lines.find((candidate) => candidate.reference === '44');
  assert.ok(line, 'The exported transit dataset should include line 44.');

  const sharedStop = data.stops.find(
    (stop) =>
      line.stopIds.includes(stop.id) &&
      data.lines.filter((candidate) => candidate.stopIds.includes(stop.id)).length > 1,
  );
  assert.ok(
    sharedStop,
    'Line 44 should include at least one stop shared with another line.',
  );
  return sharedStop;
}

const publicIncident = {
  publicId: 'smoke-parking',
  category: 'parking',
  description: 'Incidencia de prueba en el aparcamiento.',
  status: 'received',
  updatedAt: '2026-11-27T10:00:00Z',
  latitude: 40.45,
  longitude: -3.72,
};

async function checkPageWidth(page, viewport) {
  if (viewport.width < 500) {
    const overflow = await page.evaluate(
      'document.documentElement.scrollWidth > window.innerWidth',
    );
    assert.equal(
      overflow,
      false,
      `Horizontal overflow on ${page.url()} at ${viewport.width}px.`,
    );
  }
}

async function verifyIncidents(page) {
  await page.getByRole('link', { name: 'Incidencias', exact: true }).click();
  await page.waitForURL(`${baseUrl}/incidents`);
  await page.getByRole('heading', { name: 'Incidencias de movilidad' }).waitFor();
  await page.getByRole('heading', { name: 'Incidencias públicas' }).waitFor();
  await page.getByRole('button', { name: 'Actualizar' }).waitFor();
  await page.getByRole('radio', { name: 'Todas', exact: true }).waitFor();
  await page
    .getByRole('textbox', { name: 'Buscar lugar para filtrar incidencias por zona' })
    .waitFor();
  await page.getByText(publicIncident.description, { exact: true }).waitFor();
  await page
    .getByRole('link', { name: 'Inicia sesión para confirmar esta incidencia' })
    .waitFor();
  await page.getByRole('radio', { name: 'En revisión' }).click();
  await page.getByText('No hay incidencias publicadas en esta categoría.').waitFor();
  await page.getByRole('radio', { name: 'Cualquier estado' }).click();
  await page.getByText(publicIncident.description, { exact: true }).waitFor();
}

async function verifyViewport(browser, viewport) {
  const page = await browser.newPage({ viewport });
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await page.route(`${baseUrl}/**`, serveExport);
  await page.route('https://tile.openstreetmap.org/**', (route) => route.abort());
  await page.route('**/api/auth/session', (route) =>
    route.fulfill({ json: { user: null } }),
  );
  await page.route(
    (url) => url.pathname === '/api/incidents',
    (route) => {
      const status = new URL(route.request().url()).searchParams.get('status');
      const incidents =
        status && status !== publicIncident.status ? [] : [publicIncident];
      return route.fulfill({ json: { incidents } });
    },
  );

  try {
    await page.goto(baseUrl, { waitUntil: 'networkidle' });
    await page.getByRole('heading', { name: 'UniMovil' }).waitFor();
    await page.getByLabel('Buscar lugares del campus').waitFor();
    await page.locator('.leaflet-container').waitFor();

    const placeSearch = page.getByLabel('Buscar lugares del campus');
    await placeSearch.fill('biblioteca');
    await page
      .getByRole('button', { name: /Biblioteca/i })
      .first()
      .waitFor();
    await page
      .getByRole('button', { name: /Biblioteca/i })
      .first()
      .click();
    await placeSearch.fill('');

    await page.getByRole('button', { name: 'Planificar ruta' }).click();
    await page.getByLabel('Origen de la ruta').fill('Facultad de Farmacia');
    await page
      .getByRole('button', { name: 'Facultad de Farmacia', exact: true })
      .click();
    await page.getByLabel('Destino de la ruta').fill('Facultad de Medicina');
    await page
      .getByRole('button', { name: 'Facultad de Medicina', exact: true })
      .click();
    await page.getByRole('heading', { name: 'Ruta a pie estimada' }).waitFor();

    await page.getByRole('button', { name: 'Autobuses y paradas' }).click();
    await page.getByLabel('Buscar línea de autobús').fill('44');
    await page.getByRole('button', { name: '44: Callao' }).click();

    const sharedStop = findSharedStopForLine44();
    const stopButton = page
      .getByRole('button', { name: new RegExp(sharedStop.name, 'i') })
      .first();
    await stopButton.scrollIntoViewIfNeeded();
    await stopButton.click();

    await page.getByRole('heading', { name: /^Línea 44:/ }).waitFor();
    await page.getByRole('link', { name: 'Consultar avisos de EMT Madrid' }).waitFor();
    const hasScheduleOrEmptyNotice = await page
      .getByText(/Próximas salidas programadas|no contiene salidas próximas/i)
      .count();
    assert.ok(
      hasScheduleOrEmptyNotice > 0,
      'The selected stop should show schedule data or its empty state.',
    );

    await checkPageWidth(page, viewport);
    await verifyIncidents(page);
    await checkPageWidth(page, viewport);

    assert.deepEqual(pageErrors, [], `Browser page errors at ${viewport.width}px.`);
    stdout.write(
      `Web smoke passed for / and /incidents at ${viewport.width} × ${viewport.height}\n`,
    );
  } finally {
    await page.close();
  }
}

assert.ok(
  existsSync(join(exportDirectory, 'index.html')),
  'Run npm run export:web first.',
);
let browser;

try {
  browser = await chromium.launch({
    headless: true,
    channel: process.env.PLAYWRIGHT_CHANNEL,
  });
  await verifyViewport(browser, { width: 1280, height: 800 });
  await verifyViewport(browser, { width: 390, height: 844 });
} finally {
  await browser?.close();
}
