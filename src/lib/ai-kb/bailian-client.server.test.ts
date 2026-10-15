import { describe, expect, it, vi } from 'vitest';
import { createBailianClient } from './bailian-client.server';

const ok = (data: unknown) =>
  new Response(
    JSON.stringify({
      code: 'Success',
      status_code: 200,
      success: true,
      status: 'SUCCESS',
      data,
    }),
  );
function setup(responses: Response[]) {
  const requests: { url: string; init?: RequestInit }[] = [];
  const fetcher = vi.fn(
    async (url: string | URL | Request, init?: RequestInit) => {
      requests.push({ url: String(url), init });
      const response = responses.shift();
      if (!response) throw new Error('unexpected request');
      return response;
    },
  );
  return {
    client: createBailianClient({
      workspaceId: 'llm-test',
      apiKey: 'test-only-key',
      fetch: fetcher,
    }),
    requests,
  };
}
describe('Bailian KB wire protocol', () => {
  it.each([
    { code: 'InvalidParameter', status: 400 },
    { code: 'Success', status_code: 400, success: true },
    { code: 'Success', status: 200, success: false },
    { code: 'Success', status: 'FAILED' },
  ])(
    'rejects business failure and contradictory envelopes %#',
    async (envelope) => {
      const { client } = setup([
        new Response(JSON.stringify({ ...envelope, data: {} })),
      ]);
      await expect(client.listFiles({ categoryId: 'cat' })).rejects.toThrow();
    },
  );
  it('uses the connector envelope and file-name cursor convention', async () => {
    const { client, requests } = setup([
      new Response(
        JSON.stringify({
          code: 'Success',
          status: 200,
          data: { fileList: [], hasNext: false },
        }),
      ),
    ]);
    await client.listFiles({
      categoryId: 'cat',
      fileName: 'operation',
      nextToken: 'next',
    });
    expect(JSON.parse(String(requests[0].init?.body))).toEqual({
      categoryId: 'cat',
      fileName: 'operation',
      nextToken: 'next',
      maxResult: 20,
    });
    expect(requests[0].url).toBe(
      'https://llm-test.cn-beijing.maas.aliyuncs.com/api/v1/connector/dash/listFile',
    );
  });
  it('uploads exact bytes with Base64 MD5 and isolates upload credentials', async () => {
    const { client, requests } = setup([
      new Response(
        JSON.stringify({
          code: 'Success',
          status: 200,
          data: {
            leaseId: 'lease-a',
            param: {
              method: 'PUT',
              url: 'https://bucket.oss-cn-beijing.aliyuncs.com/upload?signature=secret',
              headers: {
                'Content-Type': 'text/plain',
                'x-bailian-extra': 'opaque',
              },
            },
          },
        }),
      ),
      new Response('', { status: 200 }),
    ]);
    const bytes = new TextEncoder().encode('hello');
    const lease = await client.lease({
      categoryId: 'cat',
      fileName: 'op.md',
      bytes,
    });
    await client.putFile({ lease, bytes });
    expect(JSON.parse(String(requests[0].init?.body))).toEqual({
      category: 'cat',
      fileName: 'op.md',
      sizeBytes: '5',
      contentMd5: 'XUFAKrxLKna5cZ2REBfFkg==',
      categoryType: 'UNSTRUCTURED',
    });
    expect(
      new Headers(requests[1].init?.headers).get('Authorization'),
    ).toBeNull();
    expect(requests[1].init?.redirect).toBe('error');
    expect(requests[1].init?.body).toBe(bytes);
  });
  it('registers supported metadata and returns a distinct file id', async () => {
    const { client, requests } = setup([ok({ fileId: 'file-registered' })]);
    expect(
      await client.registerFile({
        leaseId: 'lease',
        categoryId: 'cat',
        tags: ['product:rtc'],
        originalFileUrl: 'https://doc.shengwang.cn/zh-CN/ai/a',
      }),
    ).toBe('file-registered');
    expect(JSON.parse(String(requests[0].init?.body))).toEqual({
      leaseId: 'lease',
      category: 'cat',
      categoryType: 'UNSTRUCTURED',
      parser: 'AUTO_SELECT',
      tags: ['product:rtc'],
      originalFileUrl: 'https://doc.shengwang.cn/zh-CN/ai/a',
    });
  });
  it('submits only explicit file IDs and checks returned pipeline ownership', async () => {
    const { client, requests } = setup([
      ok({ pipelineId: 'kb', ingestionId: 'job' }),
      ok({ pipelineId: 'wrong', ingestionId: 'job' }),
    ]);
    expect(
      await client.submitImport({ indexId: 'kb', fileIds: ['file-a'] }),
    ).toBe('job');
    expect(JSON.parse(String(requests[0].init?.body))).toEqual({
      indexId: 'kb',
      sourceType: 'DATA_CENTER_FILE',
      docIds: ['file-a'],
    });
    await expect(
      client.submitImport({ indexId: 'kb', fileIds: ['file-b'] }),
    ).rejects.toThrow();
    await expect(
      client.submitImport({ indexId: 'kb', fileIds: [] }),
    ).rejects.toThrow();
    expect(requests).toHaveLength(2);
  });
  it('creates a document KB with explicit initial files', async () => {
    const { client, requests } = setup([
      ok({ pipelineId: 'new-kb', ingestionId: 'new-job' }),
    ]);
    expect(
      await client.createIndex({ name: 'demo', fileIds: ['file-a'] }),
    ).toEqual({ indexId: 'new-kb', jobId: 'new-job' });
    const body = JSON.parse(String(requests[0].init?.body));
    expect(body).toMatchObject({
      sourceType: 'DATA_CENTER_FILE',
      docIds: ['file-a'],
      knowledgeType: 'document',
      knowledgeScene: 'basic_document_qa',
      sinkType: 'BUILT_IN',
    });
  });
  it('paginates a completed task and requires each expected file to finish', async () => {
    const row = (id: string) => ({
      doc_id: id,
      doc_name: id,
      code: 'FINISH',
      status: 'FINISH',
      ingestion_id: 'job',
    });
    const { client, requests } = setup([
      ok({
        id: 'job',
        ingestion_status: 'COMPLETED',
        total_count: 2,
        page_number: 1,
        page_size: 1,
        rows: [row('file-a')],
      }),
      ok({
        id: 'job',
        ingestion_status: 'COMPLETED',
        total_count: 2,
        page_number: 2,
        page_size: 1,
        rows: [row('file-b')],
      }),
    ]);
    expect(
      await client.completedJob({
        indexId: 'kb',
        jobId: 'job',
        fileIds: ['file-a', 'file-b'],
      }),
    ).toHaveLength(2);
    expect(new URL(requests[1].url).searchParams.get('page_number')).toBe('2');
    expect(new URL(requests[1].url).searchParams.get('index_id')).toBe('kb');
    expect(new URL(requests[1].url).searchParams.get('job_id')).toBe('job');
  });
  it.each([
    { code: 'PARSE_FAILED', status: 'PARSE_FAILED' },
    { code: 'FINISH', status: 'PARSING' },
    { code: 'UNKNOWN', status: 'FINISH' },
  ])(
    'does not accept overall completion with a failed document %#',
    async (status) => {
      const { client } = setup([
        ok({
          id: 'job',
          ingestion_status: 'COMPLETED',
          total_count: 1,
          page_number: 1,
          page_size: 10,
          rows: [{ doc_id: 'file-a', ingestion_id: 'job', ...status }],
        }),
      ]);
      await expect(
        client.completedJob({
          indexId: 'kb',
          jobId: 'job',
          fileIds: ['file-a'],
        }),
      ).rejects.toThrow();
    },
  );
  it('rejects duplicate pages rather than looping or proving false completeness', async () => {
    const data = {
      id: 'job',
      ingestion_status: 'COMPLETED',
      total_count: 2,
      page_number: 1,
      page_size: 1,
      rows: [
        {
          doc_id: 'file-a',
          ingestion_id: 'job',
          code: 'FINISH',
          status: 'FINISH',
        },
      ],
    };
    const { client } = setup([ok(data), ok(data)]);
    await expect(
      client.completedJob({
        indexId: 'kb',
        jobId: 'job',
        fileIds: ['file-a', 'file-b'],
      }),
    ).rejects.toThrow();
  });
  it('uses snake_case delete parameters without treating an empty receipt as absence', async () => {
    const { client, requests } = setup([ok({ deleted: [] })]);
    expect(
      await client.deleteDocuments({ indexId: 'kb', documentIds: ['doc-a'] }),
    ).toEqual([]);
    expect(JSON.parse(String(requests[0].init?.body))).toEqual({
      index_id: 'kb',
      doc_ids: ['doc-a'],
    });
  });
  it.each([401, 429, 500])(
    'never retries a rejected write (%s) or logs its raw body',
    async (status) => {
      const { client, requests } = setup([
        new Response('test-only-key presigned-secret', { status }),
      ]);
      await expect(
        client.submitImport({ indexId: 'kb', fileIds: ['file-a'] }),
      ).rejects.toThrow(`HTTP_${status}`);
      expect(requests).toHaveLength(1);
    },
  );
  it('redacts invalid JSON and transport errors, including unknown write results', async () => {
    const { client } = setup([new Response('test-only-key')]);
    await expect(
      client.registerFile({
        leaseId: 'l',
        categoryId: 'c',
        tags: [],
        originalFileUrl: 'https://doc.shengwang.cn/zh-CN/ai/a',
      }),
    ).rejects.toThrow('PROTOCOL');
    const broken = createBailianClient({
      workspaceId: 'llm-test',
      apiKey: 'test-only-key',
      fetch: async () => {
        throw new Error('test-only-key https://secret');
      },
    });
    await expect(
      broken.submitImport({ indexId: 'kb', fileIds: ['a'] }),
    ).rejects.toThrow('TRANSPORT');
  });
  it('reads KB documents using the specific endpoint pagination names', async () => {
    const { client, requests } = setup([
      ok({ total_count: 0, page_number: 1, page_size: 100, rows: [] }),
    ]);
    expect(await client.documents({ indexId: 'kb' })).toEqual([]);
    expect(new URL(requests[0].url).searchParams.get('page_number')).toBe('1');
    expect(requests[0].init?.method).toBe('GET');
  });
});

it('does not echo credentials disguised as a request ID', async () => {
  const { client } = setup([
    new Response(
      JSON.stringify({
        code: 'Failure',
        status: 400,
        request_id: 'test-only-key',
      }),
    ),
  ]);
  await expect(client.listFiles({ categoryId: 'c' })).rejects.not.toThrow(
    'test-only-key',
  );
});
it('validates an upload lease again at the public upload boundary', async () => {
  const { client, requests } = setup([new Response('')]);
  await expect(
    client.putFile({
      lease: { leaseId: 'l', url: 'https://evil.example/upload', headers: {} },
      bytes: new TextEncoder().encode('x'),
    }),
  ).rejects.toThrow('INVALID_UPLOAD');
  expect(requests).toHaveLength(0);
});
it('aborts a stalled request without exposing transport details', async () => {
  const client = createBailianClient({
    workspaceId: 'llm-test',
    apiKey: 'test-only-key',
    timeoutMs: 5,
    fetch: async (_url, init) =>
      new Promise((_resolve, reject) =>
        init?.signal?.addEventListener('abort', () =>
          reject(new Error('test-only-key')),
        ),
      ),
  });
  await expect(client.listFiles({ categoryId: 'c' })).rejects.toThrow(
    'TRANSPORT',
  );
});
it('passes a sanitized successful request ID to durable evidence collection', async () => {
  const evidence: string[] = [];
  const client = createBailianClient({
    workspaceId: 'llm-test',
    apiKey: 'test-only-key',
    onRequestId: async (id) => {
      evidence.push(id);
    },
    fetch: async () =>
      new Response(
        JSON.stringify({
          code: 'Success',
          status: 200,
          request_id: 'request-success',
          data: { fileList: [], hasNext: false },
        }),
      ),
  });
  await client.listFiles({ categoryId: 'cat' });
  expect(evidence).toEqual(['request-success']);
});
