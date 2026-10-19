import remarkParse from 'remark-parse';
import { unified } from 'unified';

// Return an exact substring: provenance checks remain valid after selection.
// Never truncate a fenced code/list/quote block to satisfy the context budget.
export function pickMarkdownExcerpt(
  content: string,
  terms: string[] = [],
  limit = 3000,
): string | null {
  if (content.length <= limit) return content;
  const blocks = unified()
    .use(remarkParse)
    .parse(content)
    .children.map((node) => {
      const start = node.position?.start.offset;
      const end = node.position?.end.offset;
      if (
        start === undefined ||
        end === undefined ||
        node.type === 'heading' ||
        node.type === 'html' ||
        node.type === 'definition'
      )
        return null;
      const raw = content.slice(start, end);
      if (raw.length > limit && node.type !== 'paragraph') return null;
      const text = raw.slice(0, limit);
      return {
        text,
        score: terms.filter((term) => text.toLocaleLowerCase().includes(term))
          .length,
      };
    })
    .filter((item): item is { text: string; score: number } => item !== null);
  return blocks.sort((a, b) => b.score - a.score)[0]?.text ?? null;
}
