import { describe, expect, it, vi } from 'vitest';
import { createKbDocument, type KbCorpus } from '../ai-kb/corpus';
import { createBailianAnswer } from './bailian.server';

const doc = createKbDocument({
  content: '# Token\n\nToken 由服务端生成。',
  metadata: {
    url: '/zh-CN/ai/token/web',
    canonicalUrl: '/zh-CN/ai/token',
    title: 'Token',
    locale: 'zh-CN',
    products: ['rtc'],
    platforms: ['web'],
    docType: 'docs',
    sections: [],
  },
});
const corpus: KbCorpus = {
  schema: 1,
  scope: 'sample',
  revision: 'r1',
  complete: true,
  documents: [doc],
};
const bindings = {
  schema: 1,
  scope: 'sample',
  workspaceId: 'llm-test',
  indexId: 'kb-1',
  agentId: 'aid-test',
  documents: [
    { sourceId: doc.sourceId, hash: doc.hash, documentId: 'remote-1' },
  ],
};
const node = {
  text: '文档名: Token\n正文: Token 由服务端生成。',
  metadata: {
    doc_id: 'remote-1',
    pipeline_id: 'kb-1',
    workspace_id: 'llm-test',
    content: 'Token 由服务端生成。',
    doc_url: 'https://evil.test',
  },
};
const ok = (nodes: unknown[]) =>
  new Response(
    JSON.stringify({
      code: 'Success',
      status_code: 200,
      status: 'SUCCESS',
      success: true,
      data: { nodes },
    }),
  );
const model = (
  body: unknown = { markdown: 'Token 由服务端生成。', evidenceIds: ['e1'] },
) =>
  new Response(
    JSON.stringify({
      choices: [
        { finish_reason: 'stop', message: { content: JSON.stringify(body) } },
      ],
    }),
  );
function setup(responses: Response[], b: unknown = bindings) {
  const fetcher = vi.fn(async () => {
    const response = responses.shift();
    if (!response) throw new Error('unexpected request');
    return response;
  });
  return {
    fetcher,
    answer: () =>
      createBailianAnswer({
        corpus,
        bindings: b,
        apiKey: 'TEST-SECRET',
        model: 'qwen-plus',
        fetch: fetcher,
      }),
  };
}
describe('Bailian answer adapter', () => {
  it('retrieves real content by bound doc ID then generates JSON with source-controlled citations', async () => {
    const { answer, fetcher } = setup([ok([node]), model()]);
    const result = await answer()({ question: 'Token', platform: 'web' });
    expect(result).toMatchObject({
      mode: 'bailian',
      status: 'answered',
      citations: [{ id: 'e1', url: doc.sourceId }],
    });
    const calls = fetcher.mock.calls as unknown as [string, RequestInit][];
    expect(calls[0][0]).toBe(
      'https://llm-test.cn-beijing.maas.aliyuncs.com/api/v1/indices/knowledge/search',
    );
    expect(JSON.parse(calls[0][1].body as string)).toEqual({
      agent_id: 'aid-test',
      query: 'Token',
      kb_search_configs: [{ id: 'kb-1' }],
    });
    expect(calls[1][0]).toBe(
      'https://llm-test.cn-beijing.maas.aliyuncs.com/compatible-mode/v1/chat/completions',
    );
    expect(JSON.parse(calls[1][1].body as string)).toMatchObject({
      model: 'qwen-plus',
      stream: false,
      response_format: { type: 'json_object' },
    });
    expect(
      calls.every(
        (c) => c[1].redirect === 'error' && c[1].signal instanceof AbortSignal,
      ),
    ).toBe(true);
    expect(JSON.stringify(result)).not.toContain('TEST-SECRET');
  });
  it.each([
    { ...node, metadata: { ...node.metadata, doc_id: 'unmanaged' } },
    { ...node, metadata: { ...node.metadata, pipeline_id: 'other' } },
    { ...node, metadata: { ...node.metadata, workspace_id: 'other' } },
    {
      ...node,
      metadata: { ...node.metadata, content: 'not in original document' },
    },
  ])(
    'never generates for unbound, foreign or changed evidence %#',
    async (n) => {
      const { answer, fetcher } = setup([ok([n])]);
      expect((await answer()({ question: 'Token' })).status).toBe(
        'no-evidence',
      );
      expect(fetcher).toHaveBeenCalledTimes(1);
    },
  );
  it('locally enforces platform even when remote search returns another platform', async () => {
    const { answer, fetcher } = setup([ok([node])]);
    expect(
      (await answer()({ question: 'Token', platform: 'android' })).status,
    ).toBe('no-evidence');
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
  it.each([
    { ...bindings, scope: 'wrong' },
    { ...bindings, workspaceId: 'https://evil.test' },
    {
      ...bindings,
      documents: [{ ...bindings.documents[0], hash: '0'.repeat(64) }],
    },
    { ...bindings, documents: [] },
  ])('rejects invalid binding before network %#', async (b) => {
    const { answer, fetcher } = setup([], b);
    expect(answer).toThrow();
    expect(fetcher).not.toHaveBeenCalled();
  });
  it.each([
    new Response(
      JSON.stringify({
        success: false,
        code: 'Success',
        data: { nodes: [node] },
      }),
    ),
    new Response('TEST-SECRET', { status: 401 }),
    new Response(
      JSON.stringify({
        success: true,
        code: 'Success',
        status_code: 200,
        status: 'SUCCESS',
        data: {},
      }),
    ),
  ])(
    'rejects failures without exposing upstream bodies %#',
    async (response) => {
      const { answer, fetcher } = setup([response]);
      await expect(answer()({ question: 'Token' })).rejects.toThrow(
        'AI_UPSTREAM',
      );
      expect(fetcher).toHaveBeenCalledTimes(1);
    },
  );
  it.each([
    model({ markdown: 'Invented', evidenceIds: ['unknown'] }),
    model({ markdown: 'TEST-SECRET', evidenceIds: ['e1'] }),
  ])(
    'rejects unknown citations and accidental credential echoes %#',
    async (response) => {
      const { answer } = setup([ok([node]), response]);
      await expect(answer()({ question: 'Token' })).rejects.toThrow();
    },
  );
  it('aborts before any network call when caller has cancelled', async () => {
    const { answer, fetcher } = setup([]);
    const c = new AbortController();
    c.abort();
    await expect(answer()({ question: 'Token' }, c.signal)).rejects.toThrow();
    expect(fetcher).not.toHaveBeenCalled();
  });
});

it('bounds upstream bodies and cancels a stalled response body', async () => {
  const oversized = setup([new Response('x'.repeat(2 * 1024 * 1024 + 1))]);
  await expect(oversized.answer()({ question: 'Token' })).rejects.toThrow(
    'AI_UPSTREAM',
  );
  const cancel = vi.fn();
  const stalled = setup([new Response(new ReadableStream({ cancel }))]);
  const controller = new AbortController();
  const pending = stalled.answer()({ question: 'Token' }, controller.signal);
  await vi.waitFor(() => expect(stalled.fetcher).toHaveBeenCalledTimes(1));
  controller.abort();
  await expect(pending).rejects.toThrow('CANCELLED');
  await vi.waitFor(() => expect(cancel).toHaveBeenCalled());
});
