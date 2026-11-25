import { spawn, spawnSync } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';

const root = process.cwd();
const apiProcess = spawn(
  process.execPath,
  [
    'node_modules/tsx/dist/cli.mjs',
    '--tsconfig',
    'apps/api/tsconfig.json',
    'apps/api/src/main.ts',
  ],
  { cwd: root, env: process.env, stdio: ['ignore', 'ignore', 'pipe'] },
);
let apiErrorOutput = '';
apiProcess.stderr.setEncoding('utf8');
apiProcess.stderr.on('data', (chunk) => {
  apiErrorOutput = `${apiErrorOutput}${chunk}`.slice(-4000);
});

try {
  let ready = false;
  for (let attempt = 0; attempt < 60; attempt += 1) {
    if (apiProcess.exitCode !== null) break;
    try {
      const response = await fetch('http://127.0.0.1:3001/api/health', {
        signal: AbortSignal.timeout(1000),
      });
      if (response.ok) {
        ready = true;
        break;
      }
    } catch {
      await delay(500);
    }
  }
  if (!ready) {
    throw new Error(
      `Local API did not become ready.${apiErrorOutput ? `\n${apiErrorOutput}` : ''}`,
    );
  }

  const result = spawnSync(process.execPath, ['scripts/test-local-supabase.mjs'], {
    cwd: root,
    env: process.env,
    stdio: 'inherit',
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exitCode = result.status ?? 1;
} finally {
  if (apiProcess.exitCode === null) {
    apiProcess.kill('SIGTERM');
    await Promise.race([
      new Promise((resolve) => apiProcess.once('exit', resolve)),
      delay(5000),
    ]);
    if (apiProcess.exitCode === null) apiProcess.kill('SIGKILL');
  }
}
