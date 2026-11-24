import { spawn } from 'node:child_process';
import { parseArgs } from 'node:util';
import { type ReleaseCommand, releaseCnSearch } from './cn-release';

const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: { revision: { type: 'string' }, origin: { type: 'string' } },
  strict: true,
});
const mode = positionals[0];
if (
  positionals.length !== 1 ||
  !['bundle', 'prepare', 'promote'].includes(mode) ||
  !values.revision
)
  throw new Error(
    'Usage: release-cn.ts bundle|prepare|promote --revision=<full commit SHA> [--origin=https://docs.example]',
  );

const command: ReleaseCommand = ([executable, ...args], env) =>
  new Promise((resolve, reject) => {
    const capture = executable === 'git';
    const child = spawn(executable, args, {
      env: { ...process.env, ...env },
      stdio: capture
        ? ['ignore', 'pipe', 'inherit']
        : ['ignore', 'inherit', 'inherit'],
    });
    let stdout = '';
    child.stdout?.on('data', (bytes) => {
      stdout += bytes.toString();
    });
    child.on('error', reject);
    child.on('close', (code, signal) =>
      code === 0
        ? resolve(stdout)
        : reject(
            new Error(
              `${executable} ${args.join(' ')} failed (${signal ?? code})`,
            ),
          ),
    );
  });

await releaseCnSearch(
  mode as 'bundle' | 'prepare' | 'promote',
  { root: process.cwd(), revision: values.revision, origin: values.origin },
  command,
);
