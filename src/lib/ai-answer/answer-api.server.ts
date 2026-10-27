import { isAbsolute } from 'node:path';
import type { KbCorpus } from '../ai-kb/corpus';
import { abortable, createAnswerService } from './answer.server';
import { createBailianAnswer, readAnswerBindings } from './bailian.server';
import {
  AnswerError,
  type AnswerRequest,
  parseAnswerRequest,
} from './contracts';
import { createLocalDemoAnswer, readDemoCorpus } from './local-demo.server';
import { createLocalSearchDocs } from './local-retrieval.server';
import { createQwenGenerator } from './qwen.server';

type Options = {
  env?: Record<string, string | undefined>;
  loadCorpus?: (path: string) => Promise<KbCorpus>;
  loadBindings?: (path: string) => Promise<unknown>;
  fetch?: typeof fetch;
  timeoutMs?: number;
};
const headers = {
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
};
const failure = (status: number, error: string) =>
  Response.json({ error }, { status, headers });
async function readBody(request: Request, signal: AbortSignal) {
  const limit = 16 * 1024;
  if (Number(request.headers.get('content-length')) > limit)
    throw new AnswerError('TOO_LARGE');
  if (!request.body) throw new AnswerError('INVALID_REQUEST');
  const reader = request.body.getReader();
  const decoder = new TextDecoder('utf-8', { fatal: true });
  let size = 0,
    text = '';
  const onAbort = () => {
    void reader.cancel().catch(() => {});
  };
  signal.addEventListener('abort', onAbort, { once: true });
  try {
    while (true) {
      signal.throwIfAborted();
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) {
        await reader.cancel();
        throw new AnswerError('TOO_LARGE');
      }
      text += decoder.decode(value, { stream: true });
    }
    signal.throwIfAborted();
    return parseAnswerRequest(JSON.parse(text + decoder.decode()));
  } finally {
    signal.removeEventListener('abort', onAbort);
    reader.releaseLock();
  }
}
export async function handleAnswerRequest(
  request: Request,
  options: Options = {},
): Promise<Response> {
  const timeout = new AbortController();
  const timer = setTimeout(() => timeout.abort(), options.timeoutMs ?? 15000);
  const signal = AbortSignal.any([request.signal, timeout.signal]);
  try {
    return await abortable(signal, () =>
      handleActiveRequest(request, options, signal),
    );
  } catch {
    if (request.signal.aborted) return failure(499, 'CANCELLED');
    if (timeout.signal.aborted) return failure(504, 'AI_TIMEOUT');
    return failure(503, 'AI_UNAVAILABLE');
  } finally {
    clearTimeout(timer);
  }
}

async function handleActiveRequest(
  request: Request,
  options: Options,
  signal: AbortSignal,
): Promise<Response> {
  const env = options.env ?? process.env;
  if (
    !['local-demo', 'local-kb', 'bailian'].includes(env.AI_BOT_MODE ?? '') ||
    env.NODE_ENV === 'production' ||
    !env.AI_BOT_CORPUS_PATH ||
    !isAbsolute(env.AI_BOT_CORPUS_PATH)
  )
    return failure(503, 'AI_UNAVAILABLE');
  if (
    env.AI_BOT_MODE === 'bailian' &&
    (!env.BAILIAN_API_KEY ||
      !env.AI_BOT_BAILIAN_BINDINGS_PATH ||
      !isAbsolute(env.AI_BOT_BAILIAN_BINDINGS_PATH))
  )
    return failure(503, 'AI_UNAVAILABLE');
  if (
    env.AI_BOT_MODE === 'local-kb' &&
    !(env.BAILIAN_MODEL_API_KEY || env.DASHSCOPE_API_KEY || env.BAILIAN_API_KEY)
  )
    return failure(503, 'AI_UNAVAILABLE');
  if (request.method !== 'POST') return failure(405, 'METHOD_NOT_ALLOWED');
  const origin = request.headers.get('origin');
  if (
    (origin && origin !== new URL(request.url).origin) ||
    request.headers.get('sec-fetch-site') === 'cross-site'
  )
    return failure(403, 'FORBIDDEN');
  if (
    request.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !==
    'application/json'
  )
    return failure(415, 'JSON_REQUIRED');
  if (request.signal.aborted) return failure(499, 'CANCELLED');
  let input: AnswerRequest;
  try {
    input = await readBody(request, signal);
  } catch (error) {
    if (request.signal.aborted) return failure(499, 'CANCELLED');
    return failure(
      error instanceof AnswerError && error.code === 'TOO_LARGE' ? 413 : 400,
      'INVALID_REQUEST',
    );
  }
  try {
    const corpus = await (options.loadCorpus ?? readDemoCorpus)(
      env.AI_BOT_CORPUS_PATH,
    );
    const answer =
      env.AI_BOT_MODE === 'bailian'
        ? createBailianAnswer({
            corpus,
            bindings: await (options.loadBindings ?? readAnswerBindings)(
              env.AI_BOT_BAILIAN_BINDINGS_PATH as string,
            ),
            apiKey: env.BAILIAN_API_KEY as string,
            modelApiKey: env.BAILIAN_MODEL_API_KEY,
            model: env.AI_BOT_MODEL,
            fetch: options.fetch,
          })
        : env.AI_BOT_MODE === 'local-kb'
          ? createAnswerService({
              mode: 'local-kb',
              corpus,
              retrieve: createLocalSearchDocs(corpus),
              generate: createQwenGenerator({
                apiKey: (env.BAILIAN_MODEL_API_KEY ||
                  env.DASHSCOPE_API_KEY ||
                  env.BAILIAN_API_KEY) as string,
                workspaceId: env.BAILIAN_WORKSPACE_ID,
                model: env.AI_BOT_MODEL,
                fetch: options.fetch,
              }),
            })
          : createLocalDemoAnswer(corpus);
    return Response.json(await answer(input, signal), {
      headers,
    });
  } catch (error) {
    if (request.signal.aborted) return failure(499, 'CANCELLED');
    if (error instanceof AnswerError && error.code === 'TIMEOUT')
      return failure(504, 'AI_TIMEOUT');
    return failure(503, 'AI_UNAVAILABLE');
  }
}
