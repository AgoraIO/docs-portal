import { open } from 'node:fs/promises';
import { isAbsolute } from 'node:path';
import type { KbCorpus } from '../ai-kb/corpus';
import { parseKbCorpus } from '../ai-kb/plan';
import { createAnswerService, matchesAnswerFilters } from './answer.server';

export async function readDemoCorpus(path: string): Promise<KbCorpus> {
  if (!isAbsolute(path)) throw new Error('Absolute corpus path required');
  const file = await open(path, 'r');
  try {
    const stat = await file.stat();
    if (!stat.isFile() || stat.size > 20 * 1024 * 1024)
      throw new Error('Invalid demo corpus size');
    // One extra byte detects growth without reading an unbounded file into memory.
    const buffer = Buffer.alloc(stat.size + 1);
    let offset = 0;
    while (offset < buffer.length) {
      const { bytesRead } = await file.read(
        buffer,
        offset,
        buffer.length - offset,
        null,
      );
      if (!bytesRead) break;
      offset += bytesRead;
    }
    if (offset !== stat.size) throw new Error('Corpus changed while reading');
    return parseKbCorpus(
      JSON.parse(buffer.subarray(0, offset).toString('utf8')),
    );
  } finally {
    await file.close();
  }
}

export function createLocalDemoAnswer(value: KbCorpus) {
  if (value.documents.length > 100)
    throw new Error('Demo supports at most 100 documents');
  const corpus = parseKbCorpus(value);
  return createAnswerService({
    corpus,
    async retrieve(input, signal) {
      signal.throwIfAborted();
      const tokens =
        input.question
          .toLocaleLowerCase()
          .match(/[a-z0-9_]+|[\u3400-\u9fff]{2,}/g) ?? [];
      const terms = [...new Set(tokens)];
      return corpus.documents
        .filter((doc) => matchesAnswerFilters(doc, input))
        .map((doc) => {
          const text =
            `${doc.metadata.title}\n${doc.content}`.toLocaleLowerCase();
          const score = terms.filter((term) => text.includes(term)).length;
          const first =
            terms
              .map((term) => doc.content.toLocaleLowerCase().indexOf(term))
              .filter((i) => i >= 0)
              .sort((a, b) => a - b)[0] ?? 0;
          const start = doc.content.lastIndexOf('\n', first) + 1;
          return { doc, score, start };
        })
        .filter((item) => item.score > 0)
        .sort(
          (a, b) =>
            b.score - a.score || a.doc.sourceId.localeCompare(b.doc.sourceId),
        )
        .slice(0, 6)
        .map(({ doc, start }, i) => ({
          id: `e${i + 1}`,
          sourceId: doc.sourceId,
          text: doc.content.slice(start, start + 3000),
        }));
    },
    async generate({ evidence }, signal) {
      signal.throwIfAborted();
      return {
        markdown: `以下是本地文档摘录，未调用 AI 模型。\n\n${evidence.map((e) => e.text).join('\n\n---\n\n')}`,
        evidenceIds: evidence.map((e) => e.id),
      };
    },
  });
}
