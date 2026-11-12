import { execFile } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { promisify } from 'node:util';
import { digest } from './policy.mjs';

const execute = promisify(execFile);

// Layout fixtures use the exact fonts declared by the app. No CSS is replaced.
// Remote delivery/CORS remains a separate check on the actual preview origin.
export async function fontFixtures(mode) {
  if (!['remote', 'fixture'].includes(mode))
    throw new Error('--fonts must be remote or fixture');
  if (mode === 'remote') return new Map();
  const urls = [
    ...readFileSync('src/styles/app.css', 'utf8').matchAll(
      /url\(["']?(https:\/\/[^\s"')]+\.woff2)["']?\)/g,
    ),
  ].map((match) => match[1]);
  if (!urls.length)
    throw new Error(
      'No declared font fixtures; update font loader for the new CSS format',
    );
  const fonts = new Map();
  for (const url of new Set(urls)) {
    const { stdout } = await execute(
      'curl',
      [
        '--fail',
        '--location',
        '--silent',
        '--show-error',
        '--max-time',
        '30',
        url,
      ],
      { encoding: 'buffer', maxBuffer: 16 * 1024 * 1024, timeout: 35000 },
    );
    if (stdout.subarray(0, 4).toString() !== 'wOF2')
      throw new Error(`Invalid WOFF2 fixture: ${url}`);
    fonts.set(url, {
      body: stdout.toString('base64'),
      hash: digest(stdout),
      bytes: stdout.length,
    });
  }
  return fonts;
}
