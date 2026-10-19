import { afterEach, expect, it, vi } from 'vitest';
import { askDocumentQuestion } from './client';

const answer = {
  mode: 'local-demo',
  status: 'answered',
  answer: 'Token',
  citations: [
    { id: 'e1', title: 'Token', url: '/zh-CN/realtime-media/rtc/token' },
  ],
};
afterEach(() => vi.unstubAllGlobals());
it('posts to the independent endpoint and passes cancellation', async () => {
  const fetcher = vi.fn(async () => Response.json(answer));
  vi.stubGlobal('fetch', fetcher);
  const controller = new AbortController();
  expect(
    await askDocumentQuestion(
      { question: 'Token', platform: 'web' },
      controller.signal,
    ),
  ).toEqual(answer);
  expect(fetcher).toHaveBeenCalledWith(
    '/api/ai/answer',
    expect.objectContaining({
      method: 'POST',
      signal: controller.signal,
      body: JSON.stringify({ question: 'Token', platform: 'web' }),
    }),
  );
});
it('does not expose upstream errors', async () => {
  vi.stubGlobal('fetch', async () => new Response('secret', { status: 503 }));
  await expect(askDocumentQuestion({ question: 'Token' })).rejects.toThrow(
    'AI_UNAVAILABLE',
  );
});
it('rejects malformed response shapes and unsafe citation links', async () => {
  for (const result of [
    { ...answer, mode: 'unknown' },
    { ...answer, citations: [] },
    { ...answer, answer: 15 },
    { ...answer, status: 'no-evidence' },
    ...[
      'https://evil.test',
      'javascript:alert(1)',
      '//evil.test',
      '/zh-CN/%2e%2e/private',
      '/zh-CN/x%0a',
    ].map((url) => ({ ...answer, citations: [{ id: 'e1', title: 'a', url }] })),
  ]) {
    vi.stubGlobal('fetch', async () => Response.json(result));
    await expect(askDocumentQuestion({ question: 'Token' })).rejects.toThrow(
      'INVALID_RESPONSE',
    );
  }
});

it('accepts a validated Bailian response through the same endpoint', async () => {
  vi.stubGlobal('fetch', async () =>
    Response.json({ ...answer, mode: 'bailian' }),
  );
  expect((await askDocumentQuestion({ question: 'Token' })).mode).toBe(
    'bailian',
  );
});
