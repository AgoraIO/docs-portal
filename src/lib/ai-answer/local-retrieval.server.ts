import type { KbCorpus } from '../ai-kb/corpus';
import { previewKbCorpus } from '../ai-kb/preview';
import { type AnswerDependencies, matchesAnswerFilters } from './answer.server';
import { AnswerError } from './contracts';
import { pickMarkdownExcerpt } from './excerpt.server';

const ignored = new Set([
  '怎么',
  '如何',
  '什么',
  '为什么',
  '请问',
  '应该',
  '可以',
  '需要',
  '使用',
  '进行',
  '一个',
  '这个',
  '那个',
  '是否',
  '哪些',
  '一下',
  '时候',
  'the',
  'a',
  'is',
  'to',
  'how',
  'what',
  'do',
  'i',
]);
const segmenter = new Intl.Segmenter('zh-CN', { granularity: 'word' });
function terms(text: string): string[] {
  return [
    ...new Set(
      [...segmenter.segment(text.toLowerCase())]
        .filter((s) => s.isWordLike)
        .map((s) => s.segment)
        .filter((s) => !ignored.has(s) && (s.length > 1 || /[a-z0-9]/.test(s))),
    ),
  ];
}

/** Small-demo lexical retrieval over the same MDX chunks as the preview. No embedding service. */
export function createLocalSearchDocs(
  corpus: KbCorpus,
): AnswerDependencies['retrieve'] {
  if (corpus.documents.length > 100) throw new AnswerError('AI_CONFIG');
  // Derive from validated corpus; never trust a stale preview alongside newer content.
  const preview = previewKbCorpus(corpus);
  if (!preview.ready) throw new AnswerError('AI_CONFIG');
  const documents = new Map(corpus.documents.map((doc) => [doc.sourceId, doc]));
  const rows = preview.chunks.map((chunk) => ({
    chunk,
    tokens: terms(chunk.content),
    title: terms([chunk.metadata.title, ...chunk.headingPath].join(' ')),
  }));
  const frequencies = new Map<string, number>();
  for (const row of rows)
    for (const term of row.tokens)
      frequencies.set(term, (frequencies.get(term) ?? 0) + 1);
  const average =
    rows.reduce((sum, row) => sum + row.tokens.length, 0) / (rows.length || 1);
  return async (input, signal) => {
    signal.throwIfAborted();
    const query = terms(input.question);
    const selected = rows
      .filter(({ chunk }) => {
        const doc = documents.get(chunk.sourceId);
        return doc !== undefined && matchesAnswerFilters(doc, input);
      })
      .map(({ chunk, tokens, title }) => {
        let score = 0;
        for (const term of query) {
          if (!tokens.includes(term)) continue;
          const rarity = Math.log(
            1 + (rows.length + 1) / ((frequencies.get(term) ?? 0) + 1),
          );
          score += rarity / (0.5 + (0.5 * tokens.length) / (average || 1));
          if (title.includes(term)) score += rarity * 2;
          if (chunk.metadata.platforms.includes(term)) score += rarity * 3;
        }
        return { chunk, score };
      })
      .filter(({ score }) => score > 0)
      .sort(
        (a, b) => b.score - a.score || a.chunk.id.localeCompare(b.chunk.id),
      );
    const counts = new Map<string, number>();
    const evidence = [];
    for (const { chunk } of selected) {
      if ((counts.get(chunk.sourceId) ?? 0) >= 2) continue;
      const text = pickMarkdownExcerpt(chunk.content, query);
      if (!text || !query.some((term) => terms(text).includes(term))) continue;
      counts.set(chunk.sourceId, (counts.get(chunk.sourceId) ?? 0) + 1);
      evidence.push({
        id: chunk.id,
        sourceId: chunk.sourceId,
        text,
        sectionUrl: chunk.citationUrl,
      });
      if (evidence.length === 6) break;
    }
    return evidence;
  };
}
