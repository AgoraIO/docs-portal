import type { GoldenQuery } from './golden-queries.ts';
import type { SearchDocument } from './model.ts';

type MeiliSearchResponse = {
  hits: SearchDocument[];
  processingTimeMs: number;
};

export type MeiliBuildMetrics = {
  createIndexMs: number;
  documentUploadMs: number;
  settingsMs: number;
  totalMs: number;
};

export type MeiliClient = {
  indexUid: string;
  metrics: MeiliBuildMetrics;
  search(documents: SearchDocument[], query: string): Promise<SearchDocument[]>;
  update(documents: SearchDocument[]): Promise<number>;
  stats(): Promise<Record<string, unknown>>;
  settings(): Promise<unknown>;
};

const MEILI_URL = process.env.MEILI_URL ?? 'http://127.0.0.1:7700';
const MEILI_KEY = process.env.MEILI_KEY;

export async function createMeiliClient(
  documents: SearchDocument[],
): Promise<MeiliClient> {
  const startedAt = Date.now();
  const indexUid = `cn-search-lab-${Date.now()}`;
  const meiliDocuments = documents.map((document, index) => ({
    ...document,
    id: `doc-${index}`,
  }));
  const indexUrl = `${MEILI_URL}/indexes/${indexUid}`;
  const headers = requestHeaders();
  const meiliIdBySourceId = new Map(
    documents.map((document, index) => [document.id, `doc-${index}`]),
  );

  const createStartedAt = Date.now();
  const createTask = await request(`${MEILI_URL}/indexes`, {
    body: JSON.stringify({ uid: indexUid, primaryKey: 'id' }),
    headers,
    method: 'POST',
  });
  await waitForTask(
    indexUid,
    createTask.taskUid as string | number | undefined,
  );
  const createIndexMs = Date.now() - createStartedAt;

  const uploadStartedAt = Date.now();
  const task = await request(`${indexUrl}/documents`, {
    body: JSON.stringify(meiliDocuments),
    headers: { ...headers, 'content-type': 'application/json' },
    method: 'POST',
  });
  await waitForTask(indexUid, task.taskUid as string | number | undefined);
  const documentUploadMs = Date.now() - uploadStartedAt;

  const settingsStartedAt = Date.now();
  const settingsTask = await request(`${indexUrl}/settings`, {
    body: JSON.stringify({
      searchableAttributes: [
        'aliases',
        'title',
        'sectionTitle',
        'pageTitle',
        'content',
        'headingPath',
        'url',
      ],
      displayedAttributes: [
        'id',
        'title',
        'sectionTitle',
        'pageTitle',
        'content',
        'headingPath',
        'url',
        'platform',
        'product',
        'version',
        'docType',
        'hidden',
      ],
      filterableAttributes: [
        'locale',
        'product',
        'platform',
        'version',
        'docType',
        'hidden',
      ],
    }),
    headers: { ...headers, 'content-type': 'application/json' },
    method: 'PATCH',
  });
  await waitForTask(
    indexUid,
    settingsTask.taskUid as string | number | undefined,
  );
  const settingsMs = Date.now() - settingsStartedAt;

  return {
    indexUid,
    metrics: {
      createIndexMs,
      documentUploadMs,
      settingsMs,
      totalMs: Date.now() - startedAt,
    },
    async search(_sourceDocuments, query) {
      const result = await request(`${indexUrl}/search`, {
        body: JSON.stringify({
          attributesToHighlight: ['title', 'sectionTitle', 'content'],
          limit: 5,
          matchingStrategy: 'all',
          q: query,
        }),
        headers: { ...headers, 'content-type': 'application/json' },
        method: 'POST',
      });
      return (result as MeiliSearchResponse).hits;
    },
    async update(sourceDocuments) {
      const updateDocuments = sourceDocuments.map((document) => ({
        ...document,
        id: meiliIdBySourceId.get(document.id),
      }));
      const updateTask = await request(`${indexUrl}/documents`, {
        body: JSON.stringify(updateDocuments),
        headers: { ...headers, 'content-type': 'application/json' },
        method: 'PUT',
      });
      await waitForTask(
        indexUid,
        updateTask.taskUid as string | number | undefined,
      );
      return sourceDocuments.length;
    },
    async stats() {
      return request(`${indexUrl}/stats`, { headers });
    },
    async settings() {
      return request(`${indexUrl}/settings`, { headers });
    },
  };
}

export async function compareMeili(
  client: MeiliClient,
  documents: SearchDocument[],
  goldenQueries: GoldenQuery[],
) {
  const rows = [];
  const latency: number[] = [];

  for (const golden of goldenQueries) {
    const startedAt = Date.now();
    const hits = await client.search(documents, golden.query);
    latency.push(Date.now() - startedAt);
    const target = hits.some((hit) => {
      const [baseUrl, anchor = ''] = hit.url.split('#');
      return (
        golden.expectedBaseUrls.includes(baseUrl) &&
        (golden.target === 'page' ||
          golden.expectedAnchors.includes(anchor.toLowerCase()))
      );
    });
    rows.push({ query: golden.query, target, type: golden.type });
  }

  return {
    latency,
    rows,
  };
}

async function waitForTask(
  indexUid: string,
  taskUid: number | string | undefined,
) {
  if (!taskUid) {
    return;
  }

  for (;;) {
    const task = await request(`${MEILI_URL}/tasks/${taskUid}`, {
      headers: requestHeaders(),
    });
    if (task.status === 'succeeded') {
      return;
    }
    if (task.status === 'failed') {
      throw new Error(
        `Meilisearch task failed for ${indexUid}: ${JSON.stringify(task.error)}`,
      );
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}

function requestHeaders() {
  return {
    ...(MEILI_KEY ? { authorization: `Bearer ${MEILI_KEY}` } : {}),
    accept: 'application/json',
    'content-type': 'application/json',
  };
}

async function request(url: string, options: RequestInit = {}) {
  const response = await fetch(url, options);
  const body = await response.json();
  if (!response.ok) {
    throw new Error(
      `${response.status} ${response.statusText}: ${JSON.stringify(body)}`,
    );
  }
  return body as Record<string, unknown>;
}
