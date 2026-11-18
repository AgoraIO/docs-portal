import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { parseArgs } from 'node:util';
import type { SearchSection } from '../../src/lib/search/kb-record';
import {
  createSearchIndexClient,
  prepareSearchIndex,
  promoteSearchIndex,
  type SearchIndexReceipt,
} from '../../src/lib/search/meilisearch-index.server';

const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: {
    records: { type: 'string', default: 'dist/search/cn-records.json' },
    receipt: { type: 'string', default: 'dist/search/cn-release.json' },
    revision: { type: 'string' },
  },
  strict: true,
});
const mode = positionals[0];
if (positionals.length !== 1 || !['prepare', 'promote'].includes(mode))
  throw new Error(
    'Usage: sync-cn.ts prepare|promote --revision=<deployed commit SHA> [--records=...] [--receipt=...]',
  );
if (!values.revision)
  throw new Error(
    '--revision is required and must match the static site release',
  );
const host = process.env.MEILI_HOST;
const writeKey = process.env.MEILI_WRITE_API_KEY;
const indexUid = process.env.MEILI_INDEX_UID;
if (!host || !writeKey || !indexUid)
  throw new Error(
    'Set MEILI_HOST, MEILI_INDEX_UID and MEILI_WRITE_API_KEY for the indexing job',
  );
const client = createSearchIndexClient({
  host,
  writeKey,
  taskKey: process.env.MEILI_TASK_API_KEY,
});
const save = async (receipt: SearchIndexReceipt) => {
  await mkdir(path.dirname(values.receipt), { recursive: true });
  const temporaryPath = `${values.receipt}.tmp`;
  await writeFile(temporaryPath, `${JSON.stringify(receipt, null, 2)}\n`, {
    mode: 0o600,
  });
  await rename(temporaryPath, values.receipt);
};
if (mode === 'prepare') {
  const records = JSON.parse(
    await readFile(values.records, 'utf8'),
  ) as SearchSection[];
  const receipt = await prepareSearchIndex({
    client,
    indexUid,
    records,
    revision: values.revision,
  });
  await save(receipt);
  console.log(
    `Prepared ${receipt.count} sections for ${receipt.revision}; receipt: ${values.receipt}`,
  );
} else {
  const receipt = JSON.parse(
    await readFile(values.receipt, 'utf8'),
  ) as SearchIndexReceipt;
  if (receipt.revision !== values.revision || receipt.indexUid !== indexUid)
    throw new Error(
      'Receipt does not match the deployed revision or configured index',
    );
  const result = await promoteSearchIndex(client, receipt, async (taskUid) => {
    receipt.promotionTaskUid = taskUid;
    await save(receipt);
  });
  console.log(
    `Search release ${receipt.revision}: ${result}; previous index retained at ${receipt.stagedUid}`,
  );
}
