import { spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';

const commands = new Set([
  'start',
  'web',
  'android',
  'ios',
  'export:android',
  'export:ios',
  'export:web',
]);
const command = process.argv[2];
if (!command || !commands.has(command)) {
  throw new Error('Choose a supported Expo task from the root package scripts.');
}

const envText = await readFile('.env.local', 'utf8').catch(() => '');
const localEnvironment = Object.fromEntries(
  envText
    .split('\n')
    .filter((line) => line && !line.startsWith('#'))
    .map((line) => {
      const separator = line.indexOf('=');
      return [line.slice(0, separator), line.slice(separator + 1)];
    }),
);
const child = spawn('npm', ['run', command, '--workspace=@unimovil/mobile'], {
  cwd: process.cwd(),
  env: { ...process.env, ...localEnvironment },
  stdio: 'inherit',
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => child.kill(signal));
}
child.once('error', (error) => {
  console.error(`Could not start Expo task: ${error.message}`);
  process.exitCode = 1;
});
child.once('exit', (code, signal) => {
  process.exitCode = code ?? (signal ? 1 : 0);
});
