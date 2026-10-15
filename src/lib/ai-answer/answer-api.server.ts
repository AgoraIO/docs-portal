import { isAbsolute } from 'node:path';
import type { KbCorpus } from '../ai-kb/corpus';
import {
  AnswerError,
  type AnswerRequest,
  parseAnswerRequest,
} from './contracts';
import { createLocalDemoAnswer, readDemoCorpus } from './local-demo.server';

type Options = {
  env?: Record<string, string | undefined>;
  loadCorpus?: (path: string) => Promise<KbCorpus>;
};
const headers = {
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
};
const failure = (status: number, error: string) =>
  Response.json({ error }, { status, headers });
async function readBody(request: Request) {
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
  request.signal.addEventListener('abort', onAbort, { once: true });
  try {
    while (true) {
      request.signal.throwIfAborted();
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) {
        await reader.cancel();
        throw new AnswerError('TOO_LARGE');
      }
      text += decoder.decode(value, { stream: true });
    }
    request.signal.throwIfAborted();
    return parseAnswerRequest(JSON.parse(text + decoder.decode()));
  } finally {
    request.signal.removeEventListener('abort', onAbort);
    reader.releaseLock();
  }
}
export async function handleAnswerRequest(
  request: Request,
  options: Options = {},
): Promise<Response> {
  const env = options.env ?? process.env;
  if (
    env.AI_BOT_MODE !== 'local-demo' ||
    env.NODE_ENV === 'production' ||
    !env.AI_BOT_CORPUS_PATH ||
    !isAbsolute(env.AI_BOT_CORPUS_PATH)
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
    input = await readBody(request);
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
    return Response.json(
      await createLocalDemoAnswer(corpus)(input, request.signal),
      { headers },
    );
  } catch (error) {
    if (request.signal.aborted) return failure(499, 'CANCELLED');
    if (error instanceof AnswerError && error.code === 'TIMEOUT')
      return failure(504, 'AI_TIMEOUT');
    return failure(503, 'AI_UNAVAILABLE');
  }
}
