/**
 * PROTOTYPE: measure the current CN search payload and client-side Orama cold
 * start against the real local docs-search endpoint. This is a client-shaped
 * Node measurement, not a browser memory benchmark.
 */
import { gzipSync } from 'node:zlib';
import { create, insertMultiple, search } from '@orama/orama';
import type { SearchEntry } from '../../docs-search.ts';

const endpoint =
  process.env.CN_SEARCH_ENDPOINT ??
  'http://127.0.0.1:3010/__static/docs-search/zh-CN.json';
const startedAt = now();

console.log('CN client cold-start benchmark');
console.log(`Endpoint: ${endpoint}`);

const fetchStartedAt = now();
const response = await fetch(endpoint, {
  headers: { 'accept-encoding': 'gzip' },
});
if (!response.ok) {
  throw new Error(`Search index request failed: ${response.status}`);
}
const responseBytes = Buffer.from(await response.arrayBuffer());
const fetchMs = now() - fetchStartedAt;

const parseStartedAt = now();
const entries = JSON.parse(responseBytes.toString('utf8')) as SearchEntry[];
const parseMs = now() - parseStartedAt;
const json = JSON.stringify(entries);
const jsonBytes = Buffer.byteLength(json);

const indexStartedAt = now();
const database = create({
  components: { tokenizer: createDocsTokenizer() },
  schema: {
    content: 'string',
    description: 'string',
    objectType: 'enum',
    platform: 'enum[]',
    product: 'enum',
    tab: 'enum',
    title: 'string',
    url: 'string',
  },
});
await insertMultiple(database, entries);
const indexMs = now() - indexStartedAt;

const queryStartedAt = now();
const result = await search(database, {
  boost: { title: 4, description: 2 },
  limit: 5,
  properties: ['title', 'description', 'content', 'url'],
  term: 'removeHandler',
});
const queryMs = now() - queryStartedAt;

console.log(`Records: ${entries.length}`);
printBytes('Response bytes', responseBytes.byteLength);
printBytes('JSON bytes', jsonBytes);
printBytes('JSON gzip estimate', gzipSync(json).byteLength);
console.log(`Fetch: ${fetchMs.toFixed(1)} ms`);
console.log(`JSON parse: ${parseMs.toFixed(1)} ms`);
console.log(`Orama index: ${indexMs.toFixed(1)} ms`);
console.log(`Orama query: ${queryMs.toFixed(1)} ms`);
console.log(`Total cold start: ${(now() - startedAt).toFixed(1)} ms`);
console.log(
  `Heap used after index: ${formatBytes(process.memoryUsage().heapUsed)}`,
);
console.log(`Top result: ${result.hits[0]?.document.title ?? '(none)'}`);

function createDocsTokenizer() {
  return {
    language: 'docs',
    normalizationCache: new Map<string, string>(),
    tokenize(raw: string) {
      const normalized = raw.normalize('NFKC').toLowerCase();
      const sourceTokens =
        normalized.match(/[\p{Script=Han}]+|[\p{Letter}\p{Number}_-]+/gu) ?? [];
      const tokens = new Set<string>();

      for (const sourceToken of sourceTokens) {
        tokens.add(sourceToken);
        if (!/\p{Script=Han}/u.test(sourceToken)) {
          continue;
        }
        const characters = Array.from(sourceToken);
        for (const character of characters) {
          tokens.add(character);
        }
        for (let index = 0; index < characters.length - 1; index += 1) {
          tokens.add(`${characters[index]}${characters[index + 1]}`);
        }
      }

      return [...tokens];
    },
  };
}

function now() {
  return Number(process.hrtime.bigint()) / 1_000_000;
}

function printBytes(label: string, bytes: number) {
  console.log(`${label}: ${formatBytes(bytes)}`);
}

function formatBytes(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KiB`;
  }
  return `${(bytes / 1024 / 1024).toFixed(1)} MiB`;
}
