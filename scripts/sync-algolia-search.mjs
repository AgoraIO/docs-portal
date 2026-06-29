import { algoliasearch } from 'algoliasearch';
import { getAlgoliaDocsRecords } from '../src/lib/search/algolia-records.server.ts';

const appId = process.env.ALGOLIA_APP_ID;
const adminApiKey = process.env.ALGOLIA_ADMIN_API_KEY;
const indexName =
  process.env.ALGOLIA_INDEX_NAME ??
  process.env.VITE_ALGOLIA_INDEX_NAME ??
  'docs_platform_aware_markdown';

if (!appId || !adminApiKey) {
  console.error(
    'Missing ALGOLIA_APP_ID or ALGOLIA_ADMIN_API_KEY. Refusing to sync search records.',
  );
  process.exit(1);
}

const client = algoliasearch(appId, adminApiKey);
const records = await getAlgoliaDocsRecords();

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
    ],
    attributesToRetrieve: [
      'objectID',
      'title',
      'description',
      'section',
      'content',
      'url',
      'breadcrumbs',
      'locale',
      'product',
      'platform',
      'tab',
      'objectType',
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

await client.replaceAllObjects({
  indexName,
  objects: records,
});

console.log(`Synced ${records.length} records to Algolia index ${indexName}.`);
