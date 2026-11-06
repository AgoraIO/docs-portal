import { getTableOfContents } from 'fumadocs-core/content/toc';
import { load } from 'js-yaml';
import remarkDirective from 'remark-directive';
import remarkGfm from 'remark-gfm';
import remarkMdx from 'remark-mdx';
import remarkParse from 'remark-parse';
import { unified } from 'unified';

const parser = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkMdx)
  .use(remarkDirective);
const modifiers = new Set([
  'Optional',
  'Readonly',
  'Static',
  'Abstract',
  'Protected',
  'Private',
  'Public',
]);
const text = (node) =>
  node.type === 'text' || node.type === 'inlineCode'
    ? node.value
    : (node.children ?? []).map(text).join('');

// These are explicit source labels, not severity inferred from the notice body.
export function typedocNotice(markdown) {
  const match = markdown.match(
    /^(\*\*|__|\*|_)?(注意事项|注意|Notes?|Warning|警告|Tip|提示)([:：])\1[ \t]*/i,
  );
  if (!match) return null;
  const title = match[2];
  const type = /^(warning|警告)$/i.test(title)
    ? 'warning'
    : /^(tip|提示)$/i.test(title)
      ? 'tip'
      : 'note';
  return {
    title,
    type,
    separator: match[3],
    body: markdown.slice(match[0].length).trim(),
  };
}

// Read-only, provenance-scoped edits. The caller chooses whether to apply them.
export function planTypeDocStructure(source) {
  const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!frontmatter || load(frontmatter[1])?._migration?.generator !== 'typedoc')
    return [];
  const offset = frontmatter[0].length;
  const lineOffset = frontmatter[0].split('\n').length - 1;
  const body = source.slice(offset);
  const root = parser.parse(body);
  const changes = [];
  const range = (node) => [
    offset + node.position.start.offset,
    offset + node.position.end.offset,
  ];
  const add = (rule, title, first, last, replacement) => {
    const [start] = range(first),
      [, end] = range(last);
    changes.push({
      rule,
      title,
      line: lineOffset + first.position.start.line,
      start,
      end,
      replacement,
    });
  };
  const memberGroup = (title) =>
    /(?:^|\s)properties$/i.test(title ?? '') ||
    ['type aliases', 'variables', 'enumeration members'].includes(
      title?.toLowerCase(),
    );
  function visit(parent, group, inCallout = false) {
    const nestedInCallout = inCallout || parent.type === 'containerDirective';
    const nodes = parent.children ?? [];
    for (const [index, node] of nodes.entries()) {
      if (node.type === 'heading' && node.depth === 2)
        group = text(node).trim();
      if (node.type === 'blockquote') {
        const [start, end] = range(node);
        const indent = ' '.repeat(node.position.start.column - 1);
        const unquoted = source
          .slice(start, end)
          .split('\n')
          .map((line, index) => {
            const relative =
              index > 0 && line.startsWith(indent)
                ? line.slice(indent.length)
                : line;
            return relative.replace(/^> ?/, '');
          })
          .join('\n');
        const notice = typedocNotice(unquoted);
        if (notice) {
          const markdown = nestedInCallout
            ? `**${notice.title}${notice.separator}**\n\n${notice.body}`
            : `:::${notice.type}[${notice.title}]\n${notice.body}\n:::`;
          add(
            'quoted-typedoc-notice',
            notice.title,
            node,
            node,
            markdown
              .split('\n')
              .map((line, index) => (index && line ? indent + line : line))
              .join('\n'),
          );
        }
        continue;
      }
      const signature = nodes[index + 1];
      if (
        node.type === 'heading' &&
        node.depth === 3 &&
        memberGroup(group) &&
        signature?.type === 'paragraph'
      ) {
        const words = text(node).trim().split(/\s+/),
          labels = [];
        while (modifiers.has(words[0])) labels.push(words.shift());
        const name = words.join(' ');
        if (name && text(signature).startsWith(`${name}:`)) {
          const [headingStart, headingEnd] = range(node),
            [signatureStart, signatureEnd] = range(signature);
          const oldHeading = source.slice(headingStart, headingEnd);
          let title = oldHeading.replace(/^#{1,6}\s+/, '');
          for (const label of labels)
            title = title.replace(new RegExp(`^${label}\\s+`), '');
          const heading = `${'#'.repeat(node.depth)} ${title}`;
          const oldId = getTableOfContents(oldHeading)[0]?.url.slice(1);
          const newId = getTableOfContents(heading)[0]?.url.slice(1);
          const alias =
            oldId && oldId !== newId && !source.includes(`<a id="${oldId}">`)
              ? `<a id=${JSON.stringify(oldId)}></a>\n\n`
              : '';
          const metadata = labels.length
            ? ` labels=${JSON.stringify(labels.join(' '))}`
            : '';
          const replacement = `${alias}${heading}${source.slice(headingEnd, signatureStart)}<ApiSignature${metadata}>\n\n${source.slice(signatureStart, signatureEnd)}\n\n</ApiSignature>`;
          add(
            'unstructured-typedoc-property',
            name,
            node,
            signature,
            replacement,
          );
        }
      }
      if (node.type !== 'code') visit(node, group, nestedInCallout);
    }
  }
  visit(root);
  return changes.sort((a, b) => a.start - b.start);
}
