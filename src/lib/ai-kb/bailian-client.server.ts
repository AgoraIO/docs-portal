import { createHash } from 'node:crypto';
import { workspaceHost } from './bailian-config';
import { requireText } from './corpus';

type JsonObject = Record<string, unknown>;
export type UploadBytes = Uint8Array<ArrayBuffer>;
export type UploadLease = {
  leaseId: string;
  url: string;
  headers: Record<string, string>;
};
export type RemoteRow = {
  documentId: string;
  name?: string;
  jobId?: string;
  code: string;
  status: string;
};
export class BailianError extends Error {
  constructor(
    public readonly code: string,
    public readonly requestId?: string,
  ) {
    super(`Bailian ${code}${requestId ? ` (request ${requestId})` : ''}`);
  }
}
const object = (v: unknown): JsonObject => {
  if (!v || typeof v !== 'object' || Array.isArray(v))
    throw new BailianError('PROTOCOL');
  return v as JsonObject;
};
const list = (v: unknown): unknown[] => {
  if (!Array.isArray(v)) throw new BailianError('PROTOCOL');
  return v;
};
const integer = (v: unknown, min = 0): number => {
  if (!Number.isSafeInteger(v) || (v as number) < min)
    throw new BailianError('PROTOCOL');
  return v as number;
};
const text = (v: unknown): string => {
  if (typeof v !== 'string' || !v.trim()) throw new BailianError('PROTOCOL');
  return v;
};
const ids = (v: string[]) => {
  if (
    !Array.isArray(v) ||
    !v.length ||
    v.some((id) => typeof id !== 'string' || !id.trim()) ||
    new Set(v).size !== v.length
  )
    throw new BailianError('INVALID_IDS');
  return v;
};
const connector = '/api/v1/connector/dash/';
const index = '/api/v1/indices/rag/';
function row(raw: unknown): RemoteRow {
  const r = object(raw);
  return {
    documentId: text(r.doc_id),
    code: text(r.code),
    status: text(r.status),
    ...(r.doc_name !== undefined ? { name: text(r.doc_name) } : {}),
    ...(r.ingestion_id !== undefined ? { jobId: text(r.ingestion_id) } : {}),
  };
}
export function createBailianClient(options: {
  workspaceId: string;
  apiKey: string;
  fetch?: typeof fetch;
  timeoutMs?: number;
  onRequestId?: (requestId: string) => void | Promise<void>;
}) {
  const host = workspaceHost(options.workspaceId);
  const apiKey = requireText(options.apiKey, 'API Key');
  const fetcher = options.fetch ?? fetch;
  const timeoutMs = options.timeoutMs ?? 30000;
  if (!Number.isSafeInteger(timeoutMs) || timeoutMs < 1)
    throw new BailianError('INVALID_TIMEOUT');
  async function request(
    route: string,
    body?: JsonObject,
    query?: Record<string, string>,
  ): Promise<JsonObject> {
    const url = new URL(route, host);
    for (const [key, value] of Object.entries(query ?? {}))
      url.searchParams.set(key, value);
    let response: Response;
    try {
      response = await fetcher(url.toString(), {
        method: query ? 'GET' : 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          ...(query ? {} : { 'Content-Type': 'application/json' }),
        },
        ...(query ? {} : { body: JSON.stringify(body ?? {}) }),
        redirect: 'error',
        signal: AbortSignal.timeout(timeoutMs),
      });
    } catch {
      throw new BailianError('TRANSPORT');
    }
    if (!response.ok) throw new BailianError(`HTTP_${response.status}`);
    let value: JsonObject;
    try {
      value = object(await response.json());
    } catch {
      throw new BailianError('PROTOCOL');
    }
    const requestId =
      typeof (value.request_id ?? value.requestId) === 'string' &&
      !String(value.request_id ?? value.requestId).includes(apiKey) &&
      /^[a-zA-Z0-9_-]{1,128}$/.test(String(value.request_id ?? value.requestId))
        ? String(value.request_id ?? value.requestId)
        : undefined;
    const invalid =
      value.code !== 'Success' ||
      (value.status_code !== undefined && value.status_code !== 200) ||
      (value.status !== undefined &&
        value.status !== 200 &&
        value.status !== 'SUCCESS') ||
      (value.success !== undefined && value.success !== true) ||
      (value.status_code === undefined &&
        value.status === undefined &&
        value.success === undefined);
    if (invalid) {
      const code =
        typeof value.code === 'string' &&
        /^[a-zA-Z0-9_.-]{1,96}$/.test(value.code) &&
        !value.code.includes(apiKey)
          ? value.code
          : 'BUSINESS';
      throw new BailianError(code, requestId);
    }
    const data = object(value.data);
    if (requestId) await options.onRequestId?.(requestId);
    return data;
  }
  function page(data: JsonObject, requestedPage: number) {
    if (integer(data.page_number, 1) !== requestedPage)
      throw new BailianError('PAGE_MISMATCH');
    return {
      rows: list(data.rows).map(row),
      total: integer(data.total_count),
      size: integer(data.page_size, 1),
    };
  }
  async function documentPage({
    indexId,
    page: number = 1,
  }: {
    indexId: string;
    page?: number;
  }) {
    return page(
      await request(`${index}index/files`, undefined, {
        index_id: text(indexId),
        page_number: String(number),
        page_size: '100',
      }),
      number,
    );
  }
  return {
    async listFiles(input: {
      categoryId: string;
      fileName?: string;
      nextToken?: string;
    }) {
      const data = await request(`${connector}listFile`, {
        categoryId: text(input.categoryId),
        ...(input.fileName ? { fileName: input.fileName } : {}),
        ...(input.nextToken ? { nextToken: input.nextToken } : {}),
        maxResult: 20,
      });
      const files = list(data.fileList).map((value) => {
        const f = object(value);
        return {
          fileId: text(f.fileId),
          name: text(f.fileName),
          status: text(f.status),
        };
      });
      if (
        typeof data.hasNext !== 'boolean' ||
        (data.hasNext && !data.nextToken)
      )
        throw new BailianError('PROTOCOL');
      return {
        files,
        nextToken: data.hasNext ? text(data.nextToken) : undefined,
      };
    },
    async lease(input: {
      categoryId: string;
      fileName: string;
      bytes: UploadBytes;
    }): Promise<UploadLease> {
      const data = await request(`${connector}applyFileUploadLease`, {
        category: text(input.categoryId),
        fileName: text(input.fileName),
        sizeBytes: String(input.bytes.byteLength),
        contentMd5: createHash('md5').update(input.bytes).digest('base64'),
        categoryType: 'UNSTRUCTURED',
      });
      const param = object(data.param);
      const url = new URL(text(param.url));
      if (
        param.method !== 'PUT' ||
        url.protocol !== 'https:' ||
        url.username ||
        url.password ||
        !url.hostname.endsWith('.aliyuncs.com')
      )
        throw new BailianError('INVALID_UPLOAD_DESTINATION');
      const headers: Record<string, string> = {};
      for (const [key, value] of Object.entries(object(param.headers))) {
        if (/^(authorization|cookie|host)$/i.test(key))
          throw new BailianError('INVALID_UPLOAD_HEADER');
        headers[key] = text(value);
      }
      return { leaseId: text(data.leaseId), url: url.toString(), headers };
    },
    async putFile({
      lease,
      bytes,
    }: {
      lease: UploadLease;
      bytes: UploadBytes;
    }) {
      let destination: URL;
      try {
        destination = new URL(lease.url);
      } catch {
        throw new BailianError('INVALID_UPLOAD_DESTINATION');
      }
      if (
        destination.protocol !== 'https:' ||
        destination.username ||
        destination.password ||
        !destination.hostname.endsWith('.aliyuncs.com') ||
        Object.keys(lease.headers).some((key) =>
          /^(authorization|cookie|host)$/i.test(key),
        )
      )
        throw new BailianError('INVALID_UPLOAD_DESTINATION');
      try {
        const response = await fetcher(lease.url, {
          method: 'PUT',
          headers: lease.headers,
          body: bytes,
          redirect: 'error',
          signal: AbortSignal.timeout(timeoutMs),
        });
        if (!response.ok)
          throw new BailianError(`UPLOAD_HTTP_${response.status}`);
      } catch (error) {
        if (error instanceof BailianError) throw error;
        throw new BailianError('UPLOAD_TRANSPORT');
      }
    },
    async registerFile(input: {
      leaseId: string;
      categoryId: string;
      tags: string[];
      originalFileUrl: string;
    }) {
      if (
        input.tags.length > 100 ||
        input.tags.some((tag) => tag.length > 32) ||
        input.tags.join('').length > 700
      )
        throw new BailianError('INVALID_TAGS');
      const data = await request(`${connector}addFile`, {
        leaseId: text(input.leaseId),
        category: text(input.categoryId),
        categoryType: 'UNSTRUCTURED',
        parser: 'AUTO_SELECT',
        tags: input.tags,
        originalFileUrl: input.originalFileUrl,
      });
      return text(data.fileId);
    },
    async createIndex(input: { name: string; fileIds: string[] }) {
      const data = await request(`${index}index/create_v2`, {
        name: text(input.name),
        description: 'Isolated CN AI-Bot demo corpus',
        structureType: 'unstructured',
        knowledgeType: 'document',
        knowledgeScene: 'basic_document_qa',
        sinkType: 'BUILT_IN',
        sourceType: 'DATA_CENTER_FILE',
        embeddingModelName: 'text-embedding-v4',
        chunkSize: 600,
        docIds: ids(input.fileIds),
        dataSources: [{ sourceType: 'DATA_CENTER_FILE' }],
      });
      return { indexId: text(data.pipelineId), jobId: text(data.ingestionId) };
    },
    async submitImport(input: { indexId: string; fileIds: string[] }) {
      const data = await request(`${index}index/job/create`, {
        indexId: text(input.indexId),
        sourceType: 'DATA_CENTER_FILE',
        docIds: ids(input.fileIds),
      });
      if (data.pipelineId !== input.indexId)
        throw new BailianError('TARGET_MISMATCH');
      return text(data.ingestionId);
    },
    async jobPage(input: { indexId: string; jobId: string; page?: number }) {
      const number = input.page ?? 1;
      const data = await request(`${index}index_job/status`, undefined, {
        index_id: text(input.indexId),
        job_id: text(input.jobId),
        page_number: String(number),
        page_size: '100',
      });
      if (
        data.id !== input.jobId ||
        !['PENDING', 'RUNNING', 'COMPLETED'].includes(
          text(data.ingestion_status),
        )
      )
        throw new BailianError('JOB_MISMATCH');
      return { ...page(data, number), status: text(data.ingestion_status) };
    },
    documentPage,
    async documents(input: { indexId: string }) {
      const rows: RemoteRow[] = [];
      const seen = new Set<string>();
      let total: number | undefined;
      for (let number = 1; number <= 10000; number++) {
        const p = await documentPage({ ...input, page: number });
        if (total !== undefined && p.total !== total)
          throw new BailianError('UNSTABLE_PAGINATION');
        total = p.total;
        for (const r of p.rows) {
          if (seen.has(r.documentId))
            throw new BailianError('DUPLICATE_DOCUMENT');
          seen.add(r.documentId);
          rows.push(r);
        }
        if (rows.length === total) return rows;
        if (!p.rows.length || rows.length > total)
          throw new BailianError('INCOMPLETE_PAGINATION');
      }
      throw new BailianError('PAGE_LIMIT');
    },
    async completedJob(input: {
      indexId: string;
      jobId: string;
      fileIds: string[];
    }): Promise<RemoteRow[] | null> {
      ids(input.fileIds);
      const rows: RemoteRow[] = [];
      const seen = new Set<string>();
      let total: number | undefined;
      for (let number = 1; number <= 10000; number++) {
        const data = await request(`${index}index_job/status`, undefined, {
          index_id: text(input.indexId),
          job_id: text(input.jobId),
          page_number: String(number),
          page_size: '100',
        });
        if (data.id !== input.jobId) throw new BailianError('JOB_MISMATCH');
        if (
          ['PENDING', 'RUNNING'].includes(String(data.ingestion_status)) &&
          number === 1
        )
          return null;
        if (data.ingestion_status !== 'COMPLETED')
          throw new BailianError('JOB_NOT_COMPLETED');
        const p = page(data, number);
        if (total !== undefined && total !== p.total)
          throw new BailianError('UNSTABLE_PAGINATION');
        total = p.total;
        for (const r of p.rows) {
          if (
            seen.has(r.documentId) ||
            r.jobId !== input.jobId ||
            r.code !== 'FINISH' ||
            r.status !== 'FINISH'
          )
            throw new BailianError('DOCUMENT_NOT_FINISHED');
          seen.add(r.documentId);
          rows.push(r);
        }
        if (rows.length === total) {
          if (
            seen.size !== input.fileIds.length ||
            input.fileIds.some((id) => !seen.has(id))
          )
            throw new BailianError('UNVERIFIED_FILE_DOCUMENT_MAPPING');
          return rows;
        }
        if (!p.rows.length || rows.length > total)
          throw new BailianError('INCOMPLETE_PAGINATION');
      }
      throw new BailianError('PAGE_LIMIT');
    },
    async deleteDocuments(input: { indexId: string; documentIds: string[] }) {
      const data = await request(`${index}index/delete_file`, {
        index_id: text(input.indexId),
        doc_ids: ids(input.documentIds),
      });
      return list(data.deleted).map(text);
    },
  };
}
export type BailianClient = ReturnType<typeof createBailianClient>;
