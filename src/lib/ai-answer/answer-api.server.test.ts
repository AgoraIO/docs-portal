// @vitest-environment node
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, expect, it, vi } from 'vitest';
import { createKbDocument, type KbCorpus } from '../ai-kb/corpus';
import { handleAnswerRequest } from './answer-api.server';
import { createLocalDemoAnswer } from './local-demo.server';

const doc = createKbDocument({
  content: '# Token\n\nToken 需要由服务端生成。',
  metadata: {
    url: '/zh-CN/realtime-media/rtc/token/web',
    canonicalUrl: '/zh-CN/realtime-media/rtc/token',
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
  scope: 'demo',
  revision: 'fixture',
  complete: true,
  documents: [doc],
};
const env = {
  AI_BOT_MODE: 'local-demo',
  AI_BOT_CORPUS_PATH: '/test/corpus.json',
  NODE_ENV: 'development',
};
const opts = { env, loadCorpus: async () => corpus };
const req = (
  body: unknown = { question: 'Token' },
  headers: HeadersInit = {},
  signal?: AbortSignal,
) => {
  const merged = new Headers(headers);
  if (!merged.has('Content-Type'))
    merged.set('Content-Type', 'application/json');
  return new Request('http://localhost/api/ai/answer', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: merged,
    signal,
  });
};
const dirs: string[] = [];
afterEach(async () => {
  await Promise.all(
    dirs.splice(0).map((d) => rm(d, { recursive: true, force: true })),
  );
});
it('defaults to disabled and never loads corpus in production', async () => {
  const loadCorpus = vi.fn(async () => corpus);
  expect(
    (await handleAnswerRequest(req(), { env: {}, loadCorpus })).status,
  ).toBe(503);
  expect(
    (
      await handleAnswerRequest(req(), {
        env: { ...env, NODE_ENV: 'production' },
        loadCorpus,
      })
    ).status,
  ).toBe(503);
  expect(loadCorpus).not.toHaveBeenCalled();
});
it('returns an explicitly local excerpt and no-store through real HTTP objects', async () => {
  const response = await handleAnswerRequest(req(), opts);
  expect(response.status).toBe(200);
  expect(response.headers.get('cache-control')).toBe('no-store');
  expect(await response.json()).toMatchObject({
    mode: 'local-demo',
    status: 'answered',
    answer: expect.stringContaining('Token 需要由服务端生成'),
    citations: [{ url: doc.sourceId }],
  });
});
it('reads a local corpus from disk without altering its bytes', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'ai-local-'));
  dirs.push(directory);
  const path = join(directory, 'corpus.json');
  const text = JSON.stringify(corpus);
  await writeFile(path, text);
  expect(
    (
      await handleAnswerRequest(req(), {
        env: { ...env, AI_BOT_CORPUS_PATH: path },
      })
    ).status,
  ).toBe(200);
  expect(await readFile(path, 'utf8')).toBe(text);
});
it('does not return arbitrary documents for an unrelated question', async () => {
  expect(
    await (
      await handleAnswerRequest(req({ question: '完全不相关的内容' }), opts)
    ).json(),
  ).toMatchObject({ status: 'no-evidence', citations: [] });
});
it('applies filters before choosing excerpts', async () => {
  const answer = createLocalDemoAnswer(corpus);
  expect(
    (await answer({ question: 'Token', platform: 'android' })).status,
  ).toBe('no-evidence');
});
it('rejects cross-origin and cross-site browser requests before reading corpus', async () => {
  for (const headers of [
    new Headers({ Origin: 'https://evil.test' }),
    new Headers({ 'Sec-Fetch-Site': 'cross-site' }),
  ])
    expect(
      (await handleAnswerRequest(req(undefined, headers), opts)).status,
    ).toBe(403);
});
it('rejects malformed JSON, unsupported media types, fields and oversized body', async () => {
  expect(
    (
      await handleAnswerRequest(
        new Request('http://localhost/api/ai/answer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: '{',
        }),
        opts,
      )
    ).status,
  ).toBe(400);
  expect(
    (await handleAnswerRequest(req({}, { 'Content-Type': 'text/plain' }), opts))
      .status,
  ).toBe(415);
  expect(
    (
      await handleAnswerRequest(
        req({ question: 'x', apiKey: 'not-allowed' }),
        opts,
      )
    ).status,
  ).toBe(400);
  expect(
    (await handleAnswerRequest(req({ question: 'x'.repeat(17000) }), opts))
      .status,
  ).toBe(413);
});
it('enforces body limit even without a content-length header', async () => {
  const body = new ReadableStream({
    start(c) {
      c.enqueue(new TextEncoder().encode('x'.repeat(17000)));
      c.close();
    },
  });
  const request = new Request('http://localhost/api/ai/answer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    duplex: 'half',
  } as RequestInit);
  expect((await handleAnswerRequest(request, opts)).status).toBe(413);
});
it('sanitizes internal errors and rejects missing paths or oversized sample sets', async () => {
  const response = await handleAnswerRequest(req(), {
    env,
    loadCorpus: async () => {
      throw new Error('secret credential /private/file');
    },
  });
  expect(response.status).toBe(503);
  expect(await response.text()).not.toContain('secret');
  expect(
    (
      await handleAnswerRequest(req(), {
        env: { ...env, AI_BOT_CORPUS_PATH: 'relative.json' },
      })
    ).status,
  ).toBe(503);
  expect(
    (
      await handleAnswerRequest(req(), {
        env,
        loadCorpus: async () => ({
          ...corpus,
          documents: Array(101).fill(doc),
        }),
      })
    ).status,
  ).toBe(503);
});
it('honors an already cancelled request without producing an answer', async () => {
  const controller = new AbortController();
  controller.abort();
  expect(
    (await handleAnswerRequest(req(undefined, {}, controller.signal), opts))
      .status,
  ).toBe(499);
});
it('bounds slow request streams and slow corpus loading with a total deadline', async () => {
  const body = new ReadableStream({ start() {} });
  const request = new Request('http://localhost/api/ai/answer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    duplex: 'half',
  } as RequestInit);
  expect(
    (await handleAnswerRequest(request, { ...opts, timeoutMs: 10 })).status,
  ).toBe(504);
  expect(
    (
      await handleAnswerRequest(req(), {
        env,
        loadCorpus: () => new Promise(() => {}),
        timeoutMs: 10,
      })
    ).status,
  ).toBe(504);
});
