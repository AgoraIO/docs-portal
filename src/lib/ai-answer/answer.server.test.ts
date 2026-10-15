// @vitest-environment node
import { expect, it, vi } from 'vitest';
import { createKbDocument, type KbCorpus } from '../ai-kb/corpus';
import { createAnswerService } from './answer.server';

const web = createKbDocument({
  content:
    '# Token\n\n使用 Token 加入频道。\n\n```ts\n  joinChannel(token);\n```',
  metadata: {
    url: '/zh-CN/realtime-media/rtc/token/web',
    canonicalUrl: '/zh-CN/realtime-media/rtc/token',
    title: 'Token',
    locale: 'zh-CN',
    products: ['rtc'],
    platforms: ['web'],
    version: '4',
    docType: 'docs',
    sections: [
      {
        title: '加入',
        url: '/zh-CN/realtime-media/rtc/token/web#join',
        headingPath: ['Token', '加入'],
      },
    ],
  },
});
const android = createKbDocument({
  content: 'Android Token',
  metadata: {
    ...web.metadata,
    url: '/zh-CN/realtime-media/rtc/token/android',
    platforms: ['android'],
    sections: [],
  },
});
const corpus: KbCorpus = {
  schema: 1,
  scope: 'test',
  revision: 'test',
  complete: true,
  documents: [web, android],
};
const evidence = {
  id: 'e1',
  sourceId: web.sourceId,
  text: web.content,
  sectionUrl: web.metadata.sections[0].url,
};
function setup(
  overrides: Partial<Parameters<typeof createAnswerService>[0]> = {},
) {
  const retrieve = vi.fn(async () => [evidence]);
  const generate = vi.fn(async () => ({
    markdown: '使用 Token。\n\n```ts\n  joinChannel(token);\n```',
    evidenceIds: ['e1'],
  }));
  return {
    retrieve,
    generate,
    answer: createAnswerService({ corpus, retrieve, generate, ...overrides }),
  };
}
it('maps citations from trusted metadata and preserves code', async () => {
  const { answer } = setup();
  const result = await answer({ question: 'Token', platform: 'web' });
  expect(result.status).toBe('answered');
  expect(result.answer).toContain('  joinChannel(token);');
  expect(result.citations).toEqual([
    { id: 'e1', title: 'Token · 加入', url: evidence.sectionUrl },
  ]);
});
it('does not generate from unknown, fabricated or mismatched evidence', async () => {
  for (const hit of [
    { ...evidence, sourceId: 'missing' },
    { ...evidence, text: 'fabricated' },
    { ...evidence, sourceId: android.sourceId, text: android.content },
  ]) {
    const { answer, generate } = setup({ retrieve: async () => [hit] });
    expect(await answer({ question: 'Token', platform: 'web' })).toMatchObject({
      status: 'no-evidence',
      citations: [],
    });
    expect(generate).not.toHaveBeenCalled();
  }
});
it('enforces product, version and document type before generation', async () => {
  for (const filters of [
    { product: 'chat' },
    { version: '5' },
    { type: 'openapi' as const },
  ]) {
    const { answer, generate } = setup();
    expect((await answer({ question: 'Token', ...filters })).status).toBe(
      'no-evidence',
    );
    expect(generate).not.toHaveBeenCalled();
  }
});
it('falls back to page when retrieved section is not in metadata', async () => {
  const { answer } = setup({
    retrieve: async () => [{ ...evidence, sectionUrl: 'https://evil.test' }],
  });
  expect((await answer({ question: 'Token' })).citations[0].url).toBe(
    web.sourceId,
  );
});
it('rejects unknown or missing generated citation IDs and empty output', async () => {
  for (const output of [
    { markdown: 'answer', evidenceIds: ['other'] },
    { markdown: 'answer', evidenceIds: [] },
    { markdown: '', evidenceIds: ['e1'] },
  ]) {
    await expect(
      setup({ generate: async () => output }).answer({ question: 'Token' }),
    ).rejects.toMatchObject({ code: 'INVALID_ANSWER' });
  }
});
it('rejects conflicting evidence IDs instead of attaching a wrong source', async () => {
  await expect(
    setup({
      retrieve: async () => [
        evidence,
        { ...evidence, sourceId: android.sourceId, text: android.content },
      ],
    }).answer({ question: 'Token' }),
  ).rejects.toMatchObject({ code: 'INVALID_EVIDENCE' });
});
it('bounds evidence count and context while keeping the source text', async () => {
  const large = createKbDocument({
    content: 'x'.repeat(10000),
    metadata: web.metadata,
  });
  const generate = vi.fn(async () => ({
    markdown: 'answer',
    evidenceIds: ['0'],
  }));
  const answer = createAnswerService({
    corpus: { ...corpus, documents: [large] },
    retrieve: async () =>
      Array.from({ length: 20 }, (_, i) => ({
        id: String(i),
        sourceId: large.sourceId,
        text: large.content,
      })),
    generate,
  });
  await answer({ question: 'x' });
  expect(generate.mock.calls[0][0].evidence).toHaveLength(6);
  expect(generate.mock.calls[0][0].evidence[0].text).toHaveLength(3000);
});
it('times out even when an adapter ignores its signal', async () => {
  const { answer } = setup({
    timeoutMs: 10,
    retrieve: () => new Promise(() => {}),
  });
  await expect(answer({ question: 'Token' })).rejects.toMatchObject({
    code: 'TIMEOUT',
  });
});
it('stops after cancellation and does not call generation', async () => {
  const controller = new AbortController();
  const { answer, generate } = setup({ retrieve: () => new Promise(() => {}) });
  const pending = answer({ question: 'Token' }, controller.signal);
  controller.abort();
  await expect(pending).rejects.toMatchObject({ code: 'CANCELLED' });
  expect(generate).not.toHaveBeenCalled();
});
it('rejects invalid questions and filters', async () => {
  for (const input of [
    { question: '' },
    { question: 'x'.repeat(2001) },
    { question: 'x', platform: 'made-up' },
    { question: 'x', extra: 'ignored' },
  ]) {
    await expect(setup().answer(input)).rejects.toMatchObject({
      code: 'INVALID_REQUEST',
    });
  }
});
