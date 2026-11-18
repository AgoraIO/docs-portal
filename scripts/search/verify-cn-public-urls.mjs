import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { parseArgs } from 'node:util';
import {
  isPublicCnSearchUrl,
  toCnPublicSearchUrl,
} from '../../src/lib/search/cn-search-urls.mjs';

const { values } = parseArgs({
  options: {
    origin: { type: 'string' },
    records: { type: 'string', default: 'dist/search/cn-records.json' },
    html: { type: 'string', default: 'dist/client' },
    out: {
      type: 'string',
      default: 'dist/search/cn-public-urls-verification.json',
    },
  },
});
assert.ok(
  values.origin,
  'Provide --origin for the deployed frontend before index promotion',
);
const origin = new URL(values.origin);
assert.ok(
  ['https:', 'http:'].includes(origin.protocol) &&
    !origin.username &&
    !origin.password &&
    origin.pathname === '/' &&
    !origin.search &&
    !origin.hash,
  'Use a public frontend origin without a path or credentials',
);
const records = JSON.parse(await readFile(values.records, 'utf8'));
assert.ok(
  Array.isArray(records) && records.length > 0,
  'Refuse an empty search export',
);
const targets = new Set();
// Validate every destination before making requests. Never probe arbitrary origins.
for (const record of records) {
  assert.equal(record.locale, 'zh-CN', 'Only CN records may be checked');
  for (const value of [
    record.url,
    ...(record.canonicalUrl === undefined ? [] : [record.canonicalUrl]),
  ]) {
    assert.ok(
      isPublicCnSearchUrl(value) && value === toCnPublicSearchUrl(value),
      'Re-export the complete index with unprefixed public URLs',
    );
    const target = new URL(value, origin);
    targets.add(`${target.pathname}${target.search}`);
  }
}
const urls = [...targets];
const htmlRoot = path.resolve(values.html);
const routes = JSON.parse(
  await readFile(path.join(htmlRoot, '__static/docs-routes.json'), 'utf8'),
);
const routesByPublicUrl = new Map(
  routes
    .filter((route) => isPublicCnSearchUrl(route.url))
    .map((route) => [toCnPublicSearchUrl(route.url), route]),
);
const digest = (bytes) => createHash('sha256').update(bytes).digest('hex');
const expectedDigests = new Map();
for (const target of urls) {
  const route = routesByPublicUrl.get(new URL(target, origin).pathname);
  assert.ok(route, `Missing built route for ${target}`);
  const file = path.resolve(htmlRoot, `.${route.url}`, 'index.html');
  assert.ok(
    file.startsWith(`${htmlRoot}${path.sep}`),
    'Unsafe HTML artifact path',
  );
  expectedDigests.set(target, digest(await readFile(file)));
}
const failures = [];
let cursor = 0;
await Promise.all(
  Array.from({ length: Math.min(8, urls.length) }, async () => {
    while (cursor < urls.length) {
      const target = urls[cursor++];
      try {
        let current = new URL(target, origin);
        for (let hop = 0; ; hop++) {
          const response = await fetch(current, {
            redirect: 'manual',
            cache: 'no-store',
            signal: AbortSignal.timeout(15000),
          });
          if (response.status === 200) {
            assert.match(
              response.headers.get('content-type') ?? '',
              /^text\/html\b/i,
              'Result must serve document HTML',
            );
            assert.equal(
              digest(Buffer.from(await response.arrayBuffer())),
              expectedDigests.get(target),
              'Public HTML must match this release artifact, not a fallback or stale page',
            );
            break;
          }
          await response.body?.cancel();
          assert.ok(
            [301, 302, 307, 308].includes(response.status) &&
              hop < 2 &&
              response.headers.get('location'),
            `Expected a public document, HTTP ${response.status}`,
          );
          const next = new URL(response.headers.get('location'), current);
          // Directory slash normalization is allowed; old prefixes, login/error
          // pages and cross-origin redirects cannot disguise an unavailable route.
          assert.ok(
            next.origin === origin.origin &&
              next.pathname.replace(/\/$/, '') ===
                current.pathname.replace(/\/$/, '') &&
              next.search === current.search &&
              !next.hash,
            'Public result must open directly; only a trailing-slash redirect is allowed',
          );
          current = next;
        }
      } catch (error) {
        failures.push({ url: target, error: error.message });
      }
    }
  }),
);
const report = {
  status: failures.length ? 'FAIL' : 'PASS',
  origin: origin.origin,
  records: records.length,
  checked: urls.length,
  failures,
};
await mkdir(path.dirname(values.out), { recursive: true });
await writeFile(values.out, `${JSON.stringify(report, null, 2)}\n`);
console.log(
  JSON.stringify({
    status: report.status,
    checked: report.checked,
    failures: failures.length,
    report: values.out,
  }),
);
if (failures.length) process.exitCode = 1;
