import { createHash } from 'node:crypto';
import type { SearchSection } from '../../src/lib/search/kb-record';
import { assertValidSearchSection } from '../../src/lib/search/kb-record';
import { cnKbManifest } from './cn-kb-manifest';
import {
  extractCnKbRecords,
  readCnKbSourceDocuments,
} from './extract-cn-kb-records';
import { buildMeilisearchSettings } from './meilisearch-settings';

export const demoIndexUid = 'cn-kb-demo-v1';
type Settings = ReturnType<typeof buildMeilisearchSettings>;
export type MeiliDocument = SearchSection & { sourceId: string };

export type MeiliIndexClient = {
  createIndex(uid: string): Promise<number | undefined>;
  updateSettings(uid: string, settings: Settings): Promise<number>;
  addDocuments(uid: string, records: MeiliDocument[]): Promise<number>;
  waitForTask(taskUid: number): Promise<void>;
};

export async function indexCnKb(
  records: readonly SearchSection[],
  client: MeiliIndexClient,
): Promise<{ indexUid: string; taskUid: number }> {
  if (!records.length) throw new Error('Refusing to upload an empty KB');
  const seen = new Set<string>();
  for (const record of records) {
    assertValidSearchSection(record);
    if (
      record.hidden ||
      record.status !== 'published' ||
      record.locale !== 'zh-CN'
    ) {
      throw new Error(`Record is not public CN content: ${record.id}`);
    }
    if (seen.has(record.id))
      throw new Error(`duplicate record ID: ${record.id}`);
    seen.add(record.id);
    const path = record.url.split('#')[0];
    if (
      !cnKbManifest.some(
        (entry) =>
          path === entry.route ||
          record.platform?.some(
            (platform) => path === `${entry.route}/${platform}`,
          ),
      )
    ) {
      throw new Error(`Record URL is outside the demo manifest: ${record.id}`);
    }
  }

  const creationTask = await client.createIndex(demoIndexUid);
  if (creationTask !== undefined) await client.waitForTask(creationTask);
  const settingsTask = await client.updateSettings(
    demoIndexUid,
    buildMeilisearchSettings(),
  );
  await client.waitForTask(settingsTask);
  const documents = [...records]
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((record) => ({
      ...record,
      sourceId: record.id,
      id: createHash('sha256').update(record.id).digest('hex'),
    }));
  const taskUid = await client.addDocuments(demoIndexUid, documents);
  await client.waitForTask(taskUid);
  return { indexUid: demoIndexUid, taskUid };
}

type MeiliTask = {
  taskUid: number;
  status: 'enqueued' | 'processing' | 'succeeded' | 'failed' | 'canceled';
  error?: { message?: string };
};

export function createMeiliIndexClient(
  host: string,
  masterKey: string,
): MeiliIndexClient {
  const base = new URL(host);
  if (
    base.protocol !== 'http:' ||
    !['localhost', '127.0.0.1'].includes(base.hostname)
  ) {
    throw new Error('Demo indexer only supports a local HTTP Meilisearch host');
  }
  if (!masterKey || masterKey.length < 16)
    throw new Error('Missing Meilisearch master key');
  async function request<T>(
    path: string,
    method = 'GET',
    body?: unknown,
  ): Promise<T> {
    const response = await fetch(new URL(path, base), {
      method,
      headers: {
        Authorization: `Bearer ${masterKey}`,
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok)
      throw new Error(
        `Meilisearch ${method} ${path} failed (HTTP ${response.status})`,
      );
    return response.json() as Promise<T>;
  }
  return {
    async createIndex(uid) {
      const existing = await fetch(new URL(`/indexes/${uid}`, base), {
        headers: { Authorization: `Bearer ${masterKey}` },
        signal: AbortSignal.timeout(10000),
      });
      if (existing.ok) return undefined;
      if (existing.status !== 404)
        throw new Error(
          `Meilisearch index lookup failed (HTTP ${existing.status})`,
        );
      const task = await request<MeiliTask>('/indexes', 'POST', {
        uid,
        primaryKey: 'id',
      });
      return task.taskUid;
    },
    async updateSettings(uid, settings) {
      const task = await request<MeiliTask>(
        `/indexes/${uid}/settings`,
        'PATCH',
        settings,
      );
      return task.taskUid;
    },
    async addDocuments(uid, records) {
      const task = await request<MeiliTask>(
        `/indexes/${uid}/documents`,
        'POST',
        records,
      );
      return task.taskUid;
    },
    async waitForTask(taskUid) {
      const deadline = Date.now() + 60000;
      while (Date.now() < deadline) {
        const task = await request<MeiliTask>(`/tasks/${taskUid}`);
        if (task.status === 'succeeded') return;
        if (task.status === 'failed' || task.status === 'canceled') {
          throw new Error(
            `Meilisearch task ${taskUid} ${task.status}: ${task.error?.message ?? 'unknown error'}`,
          );
        }
        await new Promise((resolve) => setTimeout(resolve, 250));
      }
      throw new Error(`Meilisearch task ${taskUid} timed out`);
    },
  };
}

if (import.meta.main) {
  try {
    const docs = await readCnKbSourceDocuments(cnKbManifest);
    const records = extractCnKbRecords({
      manifest: cnKbManifest,
      source: docs,
    });
    const client = createMeiliIndexClient(
      process.env.MEILI_HOST ?? 'http://127.0.0.1:7700',
      process.env.MEILI_MASTER_KEY ?? '',
    );
    const result = await indexCnKb(records, client);
    console.log(
      `Indexed ${records.length} CN sections in ${result.indexUid} (task ${result.taskUid})`,
    );
  } catch (error) {
    console.error(
      error instanceof Error ? error.message : 'KB indexing failed',
    );
    process.exitCode = 1;
  }
}
