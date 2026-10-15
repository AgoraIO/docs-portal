import type { KbCorpus, KbDocument } from '../ai-kb/corpus';
import { parseKbCorpus } from '../ai-kb/plan';
import {
  AnswerError,
  type AnswerRequest,
  type AnswerResponse,
  type Citation,
  isSafeCitationUrl,
  parseAnswerRequest,
} from './contracts';
import { pickMarkdownExcerpt } from './excerpt.server';

export type Evidence = {
  id: string;
  sourceId: string;
  text: string;
  sectionUrl?: string;
};
export type GenerateInput = { question: string; evidence: Evidence[] };
export type GeneratedAnswer = { markdown: string; evidenceIds: string[] };
export type AnswerDependencies = {
  mode?: AnswerResponse['mode'];
  corpus: KbCorpus;
  retrieve: (input: AnswerRequest, signal: AbortSignal) => Promise<Evidence[]>;
  generate: (
    input: GenerateInput,
    signal: AbortSignal,
  ) => Promise<GeneratedAnswer>;
  timeoutMs?: number;
};
export function matchesAnswerFilters(doc: KbDocument, input: AnswerRequest) {
  const m = doc.metadata;
  return (
    (!input.product || m.products.includes(input.product)) &&
    (!input.platform || m.platforms.includes(input.platform)) &&
    (!input.version || m.version === input.version) &&
    (!input.type || input.type === 'all' || m.docType === input.type)
  );
}

// Enforce cancellation even if a future upstream adapter ignores AbortSignal.
export async function abortable<T>(
  signal: AbortSignal,
  work: () => Promise<T>,
): Promise<T> {
  signal.throwIfAborted();
  let onAbort: () => void = () => {};
  const aborted = new Promise<never>((_, reject) => {
    onAbort = () => reject(signal.reason);
    signal.addEventListener('abort', onAbort, { once: true });
  });
  try {
    return await Promise.race([
      aborted,
      Promise.resolve().then(() => {
        signal.throwIfAborted();
        return work();
      }),
    ]);
  } finally {
    signal.removeEventListener('abort', onAbort);
  }
}

export function createAnswerService(deps: AnswerDependencies) {
  const corpus = parseKbCorpus(deps.corpus);
  const sources = new Map(corpus.documents.map((d) => [d.sourceId, d]));
  return async (
    raw: unknown,
    external?: AbortSignal,
  ): Promise<AnswerResponse> => {
    const input = parseAnswerRequest(raw);
    const timer = new AbortController();
    const timeout = setTimeout(
      () => timer.abort(new AnswerError('TIMEOUT')),
      deps.timeoutMs ?? 15000,
    );
    const signal = external
      ? AbortSignal.any([external, timer.signal])
      : timer.signal;
    const empty: AnswerResponse = {
      mode: deps.mode ?? 'local-demo',
      status: 'no-evidence',
      answer: '当前文档中没有找到足够依据，请调整问题或筛选条件。',
      citations: [],
    };
    try {
      const rawHits = await abortable(signal, () =>
        deps.retrieve(input, signal),
      );
      if (!Array.isArray(rawHits)) throw new AnswerError('INVALID_EVIDENCE');
      const evidence: Evidence[] = [];
      const citations = new Map<string, Citation>();
      const seen = new Map<string, string>();
      for (const hit of rawHits.slice(0, 100)) {
        if (
          !hit ||
          typeof hit.id !== 'string' ||
          !/^[\w-]{1,100}$/.test(hit.id) ||
          typeof hit.text !== 'string' ||
          !hit.text.trim()
        )
          continue;
        const doc = sources.get(hit.sourceId);
        if (
          !doc ||
          !matchesAnswerFilters(doc, input) ||
          !doc.content.includes(hit.text)
        )
          continue;
        const identity = JSON.stringify([
          hit.sourceId,
          hit.text,
          hit.sectionUrl,
        ]);
        if (seen.has(hit.id)) {
          if (seen.get(hit.id) !== identity)
            throw new AnswerError('INVALID_EVIDENCE');
          continue;
        }
        seen.set(hit.id, identity);
        const section = doc.metadata.sections.find(
          (s) => s.url === hit.sectionUrl && isSafeCitationUrl(s.url),
        );
        const url = section?.url ?? doc.metadata.url;
        if (!isSafeCitationUrl(url)) continue;
        if (evidence.length >= 6) continue;
        const excerpt = pickMarkdownExcerpt(hit.text);
        if (excerpt === null) continue;
        evidence.push({ ...hit, text: excerpt });
        citations.set(hit.id, {
          id: hit.id,
          title: section
            ? `${doc.metadata.title} · ${section.title}`
            : doc.metadata.title,
          url,
        });
      }
      if (!evidence.length) return empty;
      const output = await abortable(signal, () =>
        deps.generate({ question: input.question, evidence }, signal),
      );
      if (
        !output ||
        typeof output.markdown !== 'string' ||
        !output.markdown.trim() ||
        output.markdown.length > 24000 ||
        !Array.isArray(output.evidenceIds) ||
        !output.evidenceIds.length ||
        output.evidenceIds.some((id) => !citations.has(id))
      )
        throw new AnswerError('INVALID_ANSWER');
      return {
        mode: deps.mode ?? 'local-demo',
        status: 'answered',
        answer: output.markdown,
        citations: [...new Set(output.evidenceIds)].map(
          (id) => citations.get(id) as Citation,
        ),
      };
    } catch (error) {
      if (external?.aborted) throw new AnswerError('CANCELLED');
      if (timer.signal.aborted) throw new AnswerError('TIMEOUT');
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  };
}
