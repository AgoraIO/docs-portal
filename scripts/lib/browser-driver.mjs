import { execFile } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';

const execute = promisify(execFile);

export async function createBrowserDriver({
  executable = process.env.CN_LINK_BROWSER_EXECUTABLE || 'agent-browser',
  timeoutMs = 15000,
} = {}) {
  const directory = await mkdtemp(path.join(tmpdir(), 'cn-link-browser-'));
  const config = path.join(directory, 'config.json');
  await writeFile(config, '{}');
  const session = `cn-link-audit-${randomUUID()}`;
  // Do not inherit a user's attached browser, persistent profile, or auth state.
  const env = Object.fromEntries(
    Object.entries(process.env).filter(
      ([key]) => !key.startsWith('AGENT_BROWSER_'),
    ),
  );
  env.AGENT_BROWSER_DEFAULT_TIMEOUT = String(timeoutMs);
  // Native CDP traffic does not refresh the daemon's CLI idle timer.
  // This isolated audit session is owned and closed explicitly by this driver.
  env.AGENT_BROWSER_IDLE_TIMEOUT_MS = '0';
  const run = async (...args) => {
    let stdout, executionError;
    try {
      ({ stdout } = await execute(
        executable,
        ['--config', config, '--session', session, '--json', ...args],
        {
          env,
          // Native 0.25.4 open waits 25s even with DEFAULT_TIMEOUT set.
          // Let it return before snapshotting; killing only its client leaves
          // the daemon busy and blocks evidence for this and the next target.
          timeout:
            args[0] === 'open'
              ? Math.max(28000, timeoutMs + 3000)
              : timeoutMs + 3000,
          maxBuffer: 32 * 1024 * 1024,
        },
      ));
    } catch (error) {
      executionError = error;
      stdout = error.stdout;
    }
    let parsed;
    try {
      parsed = JSON.parse(stdout);
    } catch {
      throw executionError ?? new Error('invalid-browser-json');
    }
    if (parsed.success !== true)
      throw new Error(
        typeof parsed.error === 'string'
          ? parsed.error
          : JSON.stringify(parsed.error ?? parsed),
      );
    if (executionError) throw executionError;
    return parsed.data;
  };
  const evaluate = async (script) => (await run('eval', script)).result;
  return {
    run,
    evaluate,
    close: async () => {
      try {
        await run('close');
      } catch {
        /* Still remove our configuration after a launch failure. */
      } finally {
        await rm(directory, { recursive: true, force: true });
      }
    },
  };
}
