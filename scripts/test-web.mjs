import assert from 'node:assert/strict';
import { createReadStream, existsSync, readFileSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, resolve, sep } from 'node:path';
import { stdout } from 'node:process';
import { fileURLToPath, URL } from 'node:url';
import { chromium } from 'playwright';

const repositoryRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const exportDirectory = join(repositoryRoot, 'apps/mobile/dist');
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

function sendFile(response, filePath) {
  response.writeHead(200, {
    'Content-Type': contentTypes.get(extname(filePath)) ?? 'application/octet-stream',
    'Cache-Control': 'no-store',
  });
  createReadStream(filePath).pipe(response);
}

function startStaticServer() {
  assert.ok(
    existsSync(join(exportDirectory, 'index.html')),
    'Run npm run export:web first.',
  );

  const server = createServer((request, response) => {
    const pathname = new URL(request.url ?? '/', 'http://localhost').pathname;
    let requestedPath;

    try {
      requestedPath = resolve(exportDirectory, `.${decodeURIComponent(pathname)}`);
    } catch {
      response.writeHead(400).end('Invalid path');
      return;
    }

    if (
      requestedPath !== exportDirectory &&
      !requestedPath.startsWith(`${exportDirectory}${sep}`)
    ) {
      response.writeHead(403).end('Forbidden');
      return;
    }

    const filePath =
      existsSync(requestedPath) && statSync(requestedPath).isFile()
        ? requestedPath
        : join(exportDirectory, 'index.html');
    sendFile(response, filePath);
  });

  return new Promise((resolveServer, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      assert.ok(address && typeof address !== 'string');
      resolveServer({ server, url: `http://127.0.0.1:${address.port}` });
    });
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

async function verifyViewport(browser, baseUrl, viewport) {
  const page = await browser.newPage({ viewport });
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await page.route('https://tile.openstreetmap.org/**', (route) => route.abort());

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

    if (viewport.width < 500) {
      const horizontalOverflow = await page.evaluate(
        'document.documentElement.scrollWidth > window.innerWidth + 1',
      );
      assert.equal(
        horizontalOverflow,
        false,
        'The narrow layout should not overflow horizontally.',
      );
    }

    assert.deepEqual(pageErrors, [], `Browser page errors at ${viewport.width}px.`);
    stdout.write(`Web smoke passed at ${viewport.width} × ${viewport.height}\n`);
  } finally {
    await page.close();
  }
}

const { server, url } = await startStaticServer();
let browser;

try {
  browser = await chromium.launch({ headless: true });
  await verifyViewport(browser, url, { width: 1280, height: 800 });
  await verifyViewport(browser, url, { width: 390, height: 844 });
} finally {
  await browser?.close();
  await new Promise((resolveServer, reject) => {
    server.close((error) => (error ? reject(error) : resolveServer()));
  });
}
