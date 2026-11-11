import { createHash, randomUUID } from 'node:crypto';
import { setTimeout as delay } from 'node:timers/promises';
import { isPublicCnSearchUrl } from './cn-search-page';
import { buildCnSearchDocument } from './cn-search-strategy';
import {
  assertValidSearchSection,
  getSearchSectionIdentity,
  type SearchSection,
} from './kb-record';
import { buildPublishedCnSearchSettings as buildMeilisearchSettings } from './meilisearch-settings';

const RELEASE_ID = '_docs_release';
type Release = {
  release: string;
  revision: string;
  count: number;
  checksum: string;
};
export type SearchIndexReceipt = Release & {
  format: 1;
  hostHash: string;
  indexUid: string;
  stagedUid: string;
  baseRelease: string | null;
  promotionTaskUid?: number;
};

type Document = Record<string, unknown> & { id: string };
export type SearchIndexClient = {
  hostHash: string;
  getRelease(uid: string): Promise<Release | null>;
  ensureIndex(uid: string): Promise<void>;
  createIndex(uid: string): Promise<void>;
  settings(uid: string): Promise<void>;
  documents(uid: string, documents: Document[]): Promise<void>;
  count(uid: string): Promise<number>;
  swap(indexUid: string, stagedUid: string): Promise<number>;
  wait(taskUid: number): Promise<void>;
};

function hash(value: string) {
  return createHash('sha256').update(value).digest('hex');
}

function transportFailure(error: unknown) {
  const failure = error as {
    name?: string;
    code?: string | number;
    cause?: { code?: string };
  } | null;
  const code = failure?.cause?.code ?? failure?.code;
  return {
    name: failure?.name ?? 'Error',
    code,
    transient:
      failure?.name === 'TimeoutError' ||
      [
        'ECONNRESET',
        'ETIMEDOUT',
        'EPIPE',
        'ECONNREFUSED',
        'EAI_AGAIN',
        'UND_ERR_SOCKET',
        'UND_ERR_CONNECT_TIMEOUT',
        'UND_ERR_HEADERS_TIMEOUT',
        'UND_ERR_BODY_TIMEOUT',
      ].includes(String(code)),
  };
}

export function createSearchIndexClient({
  host,
  writeKey,
  taskKey,
}: {
  host: string;
  writeKey: string;
  taskKey?: string;
}): SearchIndexClient {
  const url = new URL(host);
  if (
    !['http:', 'https:'].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    !writeKey
  )
    throw new Error('Invalid Meilisearch job configuration');
  const base = host.replace(/\/$/, '');
  const request = async (path: string, method = 'GET', body?: unknown) => {
    // Document IDs and the serialized batch stay identical if an accepted write
    // loses its acknowledgement. Never repeat index creation or index swaps.
    const retrySafe =
      method === 'GET' ||
      (method === 'POST' && /^\/indexes\/[^/]+\/documents$/.test(path));
    const maxAttempts = retrySafe ? 3 : 1;
    const payload = body === undefined ? undefined : JSON.stringify(body);
    const payloadBytes = payload === undefined ? 0 : Buffer.byteLength(payload);
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const started = Date.now();
      let status: number | undefined;
      try {
        const response = await fetch(`${base}${path}`, {
          method,
          signal: AbortSignal.timeout(30_000),
          headers: {
            Authorization: `Bearer ${path.startsWith('/tasks/') ? (taskKey ?? writeKey) : writeKey}`,
            'Content-Type': 'application/json',
          },
          ...(payload !== undefined ? { body: payload } : {}),
        });
        status = response.status;
        if (status === 404) return null;
        if (!response.ok)
          throw new Error(`Meilisearch job request failed (HTTP ${status})`);
        return await response.json();
      } catch (error) {
        const failure = transportFailure(error);
        const details = {
          method,
          path,
          attempt,
          elapsedMs: Date.now() - started,
          payloadBytes,
          error: failure.name,
          code: failure.code,
          status,
        };
        if (!failure.transient || attempt === maxAttempts) {
          const reason = status ? `HTTP ${status}` : failure.name;
          throw new Error(
            `Meilisearch ${method} ${path} failed after ${attempt} attempts (${reason})`,
            { cause: error },
          );
        }
        console.warn(
          `[search-index] Retrying transport failure ${JSON.stringify(details)}`,
        );
        await delay(250 * 2 ** (attempt - 1));
      }
    }
    throw new Error('Meilisearch request attempts exhausted');
  };
  const task = async (
    path: string,
    method: string,
    body: unknown,
  ): Promise<number> => {
    const result = await request(path, method, body);
    if (!Number.isSafeInteger(result?.taskUid))
      throw new Error('Missing Meilisearch task ID');
    return result.taskUid;
  };
  const wait = async (taskUid: number) => {
    const deadline = Date.now() + 15 * 60_000;
    while (Date.now() < deadline) {
      const result = await request(`/tasks/${taskUid}`);
      if (result?.status === 'succeeded') return;
      if (!result)
        throw new Error(
          `Meilisearch task ${taskUid} is missing or not visible; check MEILI_TASK_API_KEY permissions before retrying`,
        );
      if (['failed', 'canceled'].includes(result.status))
        throw new Error(`Meilisearch task ${taskUid} failed`);
      await delay(500);
    }
    throw new Error(
      `Meilisearch task ${taskUid} timed out; inspect the task before retrying`,
    );
  };
  const createIndex = async (uid: string) => {
    await wait(await task('/indexes', 'POST', { uid, primaryKey: 'id' }));
  };
  return {
    hostHash: hash(base),
    wait,
    createIndex,
    async getRelease(uid) {
      return (await request(
        `/indexes/${encodeURIComponent(uid)}/documents/${RELEASE_ID}`,
      )) as Release | null;
    },
    async ensureIndex(uid) {
      if (!(await request(`/indexes/${encodeURIComponent(uid)}`)))
        await createIndex(uid);
    },
    async settings(uid) {
      await wait(
        await task(
          `/indexes/${encodeURIComponent(uid)}/settings`,
          'PATCH',
          buildMeilisearchSettings(),
        ),
      );
    },
    async documents(uid, documents) {
      await wait(
        await task(
          `/indexes/${encodeURIComponent(uid)}/documents`,
          'POST',
          documents,
        ),
      );
    },
    async count(uid) {
      const stats = await request(`/indexes/${encodeURIComponent(uid)}/stats`);
      if (!Number.isSafeInteger(stats?.numberOfDocuments))
        throw new Error('Invalid Meilisearch index stats');
      return stats.numberOfDocuments;
    },
    swap: (indexUid, stagedUid) =>
      task('/swap-indexes', 'POST', [{ indexes: [indexUid, stagedUid] }]),
  };
}

export async function prepareSearchIndex({
  client,
  indexUid,
  records,
  revision,
}: {
  client: SearchIndexClient;
  indexUid: string;
  records: SearchSection[];
  revision: string;
}): Promise<SearchIndexReceipt> {
  if (!/^[\w-]{1,100}$/.test(indexUid) || !revision.trim())
    throw new Error('Index UID and release revision are required');
  if (!records.length)
    throw new Error('Refusing to publish an empty search index');
  const seen = new Set<string>();
  // Validate the entire snapshot before making any write request.
  for (const record of records) {
    assertValidSearchSection(record);
    if (typeof record.isDefaultPlatform !== 'boolean')
      throw new Error(
        'Re-export CN records with default-platform metadata before preparing an index',
      );
    if (
      record.locale !== 'zh-CN' ||
      record.status !== 'published' ||
      !isPublicCnSearchUrl(record.url) ||
      (record.canonicalUrl !== undefined &&
        !isPublicCnSearchUrl(record.canonicalUrl))
    )
      throw new Error('Only published public CN records may be indexed');
    if (seen.has(record.id))
      throw new Error(`Duplicate search section ID: ${record.id}`);
    seen.add(record.id);
  }
  const preparedRecords = records.map((record) => ({
    ...buildCnSearchDocument(record),
    distinctKey: hash(getSearchSectionIdentity(record)),
  }));
  // 回执同时覆盖检索字段和设置；源文档相同不代表搜索行为相同。
  const checksum = hash(
    JSON.stringify({
      records: preparedRecords,
      settings: buildMeilisearchSettings(),
    }),
  );
  const release = randomUUID();
  const stagedUid = `${indexUid}__${release.replaceAll('-', '')}`;
  const baseRelease = (await client.getRelease(indexUid))?.release ?? null;
  const receipt: SearchIndexReceipt = {
    format: 1,
    hostHash: client.hostHash,
    indexUid,
    stagedUid,
    release,
    revision,
    checksum,
    count: records.length,
    baseRelease,
  };
  await client.createIndex(stagedUid);
  await client.settings(stagedUid);
  const documents = preparedRecords.map((record) => ({
    ...record,
    sourceId: record.id,
    id: hash(record.id),
  }));
  for (let index = 0; index < documents.length; index += 500)
    await client.documents(stagedUid, documents.slice(index, index + 500));
  // Internal metadata makes promotion retries safe. Public queries always exclude this record.
  await client.documents(stagedUid, [
    {
      id: RELEASE_ID,
      release,
      revision,
      checksum,
      count: records.length,
      locale: 'zh-CN',
      hidden: true,
      status: 'internal',
    },
  ]);
  if ((await client.count(stagedUid)) !== records.length + 1)
    throw new Error('Staged search index document count mismatch');
  return receipt;
}

export async function promoteSearchIndex(
  client: SearchIndexClient,
  receipt: SearchIndexReceipt,
  onTask: (taskUid: number) => Promise<void>,
): Promise<'promoted' | 'already-active'> {
  if (
    receipt.format !== 1 ||
    receipt.hostHash !== client.hostHash ||
    !/^[\w-]{1,100}$/.test(receipt.indexUid) ||
    !receipt.stagedUid.startsWith(`${receipt.indexUid}__`) ||
    !/^[\w-]+$/.test(receipt.stagedUid) ||
    !receipt.release ||
    !receipt.revision ||
    !Number.isSafeInteger(receipt.count) ||
    receipt.count < 1
  )
    throw new Error('Invalid search release receipt');
  if (receipt.promotionTaskUid !== undefined) {
    if (
      !Number.isSafeInteger(receipt.promotionTaskUid) ||
      receipt.promotionTaskUid < 0
    )
      throw new Error('Invalid promotion task ID');
    await client.wait(receipt.promotionTaskUid);
  }
  const active = await client.getRelease(receipt.indexUid);
  if (active?.release === receipt.release) return 'already-active';
  if (receipt.promotionTaskUid !== undefined)
    throw new Error('Promotion task finished but release is no longer active');
  if ((active?.release ?? null) !== receipt.baseRelease)
    throw new Error(
      'A different search release was promoted; prepare a new snapshot',
    );
  const staged = await client.getRelease(receipt.stagedUid);
  if (
    staged?.release !== receipt.release ||
    staged.checksum !== receipt.checksum ||
    staged.count !== receipt.count ||
    staged.revision !== receipt.revision ||
    (await client.count(receipt.stagedUid)) !== receipt.count + 1
  )
    throw new Error('Staged search release does not match receipt');
  await client.ensureIndex(receipt.indexUid);
  const taskUid = await client.swap(receipt.indexUid, receipt.stagedUid);
  await onTask(taskUid);
  await client.wait(taskUid);
  if ((await client.getRelease(receipt.indexUid))?.release !== receipt.release)
    throw new Error('Search release activation could not be verified');
  return 'promoted';
}
