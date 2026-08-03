import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { OPENAPI_LANES } from '../src/lib/openapi/lanes';

const PUBLIC_DOCS_BASE_URL = 'https://docs.agora.io';
const STATUS_PAGE_URL = 'https://status.agora.io/';
const repoRoot = process.cwd();
const catalogPath = path.join(repoRoot, 'public/.well-known/api-catalog');
const checkOnly = process.argv.includes('--check');

const linkset = OPENAPI_LANES.map((lane) => ({
  anchor: `${PUBLIC_DOCS_BASE_URL}${lane.parentUrl.en}`,
  'service-desc': [
    {
      href: `${PUBLIC_DOCS_BASE_URL}${lane.publicSourceUrl.en}`,
      type: 'application/yaml',
    },
  ],
  'service-doc': [
    {
      href: `${PUBLIC_DOCS_BASE_URL}${lane.parentUrl.en}`,
      type: 'text/html',
    },
  ],
  status: [
    {
      href: STATUS_PAGE_URL,
      type: 'text/html',
    },
  ],
}));

const content = `${JSON.stringify({ linkset }, null, 2)}\n`;

if (checkOnly) {
  let current = '';
  try {
    current = await readFile(catalogPath, 'utf8');
  } catch {
    throw new Error(
      `${path.relative(repoRoot, catalogPath)} is missing; run bun run scripts/generate-api-catalog.ts`,
    );
  }

  if (current !== content) {
    throw new Error(
      `${path.relative(
        repoRoot,
        catalogPath,
      )} is out of date; run bun run scripts/generate-api-catalog.ts`,
    );
  }
} else {
  await writeFile(catalogPath, content);
}

console.log(
  `[api-catalog] ${linkset.length} API${linkset.length === 1 ? '' : 's'} published to ${path.relative(repoRoot, catalogPath)}`,
);
