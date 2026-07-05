import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { algoliasearch } from 'algoliasearch';
import { sync } from 'fumadocs-core/search/algolia';

const appId = process.env.VITE_ALGOLIA_APP_ID;
const adminApiKey = process.env.ALGOLIA_ADMIN_API_KEY;
const indexName = process.env.ALGOLIA_INDEX_NAME ?? 'docs_portal_en';

if (process.env.ALGOLIA_SYNC_DISABLED === 'true') {
  console.log('Skipping Algolia search sync: ALGOLIA_SYNC_DISABLED=true.');
  process.exit(0);
}

if (!appId || !adminApiKey) {
  console.log(
    'Skipping Algolia search sync: VITE_ALGOLIA_APP_ID or ALGOLIA_ADMIN_API_KEY is not configured.',
  );
  process.exit(0);
}

const client = algoliasearch(appId, adminApiKey);

const artifactPath = path.join(
  process.cwd(),
  'public',
  '__static',
  'docs-search',
  'algolia-records.json',
);

let records;
try {
  records = JSON.parse(await readFile(artifactPath, 'utf8'));
} catch (error) {
  if (error?.code === 'ENOENT') {
    console.error(
      `Algolia records artifact not found at ${artifactPath}. ` +
        'Run the build first (bun run docs:static-payload) before syncing.',
    );
  } else {
    console.error(
      `Failed to read Algolia records artifact at ${artifactPath}: ${error?.message ?? error}`,
    );
  }
  process.exit(1);
}

await sync(client, {
  indexName,
  documents: records,
});

await client.setSettings({
  indexName,
  indexSettings: {
    attributeForDistinct: 'page_id',
    attributesForFaceting: [
      'filterOnly(locale)',
      'searchable(product)',
      'searchable(platform)',
      'filterOnly(tab)',
      'filterOnly(objectType)',
      'filterOnly(category)',
    ],
    attributesToRetrieve: [
      'objectID',
      'title',
      'description',
      'section',
      'content',
      'url',
      'section_id',
      'breadcrumbs',
      'locale',
      'product',
      'platform',
      'tab',
      'objectType',
      'category',
    ],
    searchableAttributes: [
      'unordered(title)',
      'unordered(section)',
      'unordered(description)',
      'unordered(content)',
      'unordered(product)',
      'unordered(platform)',
    ],
  },
});

console.log(`Synced ${records.length} records to Algolia index ${indexName}.`);
