import { algoliasearch } from 'algoliasearch';
import { sync } from 'fumadocs-core/search/algolia';
import { getAlgoliaDocsRecords } from '../src/lib/search/algolia-records.server.ts';
import { shouldSyncAlgoliaSearch } from '../src/lib/search/search-provider.ts';
import { DOCS_REGION } from '../src/lib/site-region.ts';

const appId = process.env.VITE_ALGOLIA_APP_ID;
const adminApiKey = process.env.ALGOLIA_ADMIN_API_KEY;
const indexName = process.env.ALGOLIA_INDEX_NAME ?? 'docs_portal_en';

if (!shouldSyncAlgoliaSearch(DOCS_REGION)) {
  console.log(`Skipping Algolia search sync for docs region: ${DOCS_REGION}.`);
  process.exit(0);
}

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
const records = await getAlgoliaDocsRecords();

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
