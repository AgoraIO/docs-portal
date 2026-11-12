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

const calloutNames = new Set([
  'note',
  'info',
  'tip',
  'caution',
  'warning',
  'error',
  'success',
]);

// A comment tag already supplies a notice frame. Preserve nested notice content
// and its label without creating another frame inside it.
function flattenCallouts(markdown) {
  const edits = [];
  function visit(node) {
    if (node.type === 'containerDirective' && calloutNames.has(node.name)) {
      const label = node.children.find((child) => child.data?.directiveLabel);
      const children = node.children.filter(
        (child) => !child.data?.directiveLabel,
      );
      const body = children.length
        ? flattenCallouts(
            markdown.slice(
              children[0].position.start.offset,
              children.at(-1).position.end.offset,
            ),
          )
        : '';
      edits.push({
        start: node.position.start.offset,
        end: node.position.end.offset,
        replacement: [label && `**${text(label)}**`, body]
          .filter(Boolean)
          .join('\n\n'),
      });
      return;
    }
    for (const child of node.children ?? []) visit(child);
  }
  visit(parser.parse(markdown));
  for (const edit of edits.reverse())
    markdown =
      markdown.slice(0, edit.start) +
      edit.replacement +
      markdown.slice(edit.end);
  return markdown;
}

function isDestinationAnchor(node) {
  return (
    node.name === 'a' &&
    !node.children?.length &&
    node.attributes?.some((attribute) =>
      ['id', 'name'].includes(attribute.name),
    ) &&
    !node.attributes?.some((attribute) => attribute.name === 'href')
  );
}

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
  const migration = frontmatter && load(frontmatter[1])?._migration;
  if (migration?.generator !== 'typedoc') return [];
  // The legacy API parser explicitly mapped HTML TypeDoc quotations to
  // caution notices. Apply that source contract only to its migrated lane.
  const legacyNotices =
    migration.type === 'generated-html' &&
    migration.sourcePath?.startsWith('html-docs/');
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
    let consumedThrough = -1;
    for (const [index, node] of nodes.entries()) {
      if (index <= consumedThrough) continue;
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
        const notice =
          typedocNotice(unquoted) ??
          (legacyNotices
            ? {
                type: 'caution',
                title: '注意',
                separator: '：',
                body: unquoted,
              }
            : null);
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
      if (
        legacyNotices &&
        node.type === 'heading' &&
        node.depth >= 3 &&
        text(node).trim().toLowerCase() === 'deprecated'
      ) {
        let end = index + 1;
        while (
          end < nodes.length &&
          nodes[end].type !== 'heading' &&
          !['ApiSignature', 'ParameterList', 'ApiReturns'].includes(
            nodes[end].name,
          )
        )
          end++;
        while (end > index + 1 && isDestinationAnchor(nodes[end - 1])) end--;
        if (end > index + 1) {
          const [, stop] = range(nodes[end - 1]);
          const content = flattenCallouts(
            source.slice(range(nodes[index + 1])[0], stop).trim(),
          );
          const id = getTableOfContents(body.slice(0, node.position.end.offset))
            .at(-1)
            ?.url.slice(1);
          const alias =
            id && !source.includes(`<a id="${id}">`)
              ? `<a id=${JSON.stringify(id)}></a>\n\n`
              : '';
          add(
            'unstructured-typedoc-deprecation',
            text(node),
            node,
            nodes[end - 1],
            `${alias}:::warning[${text(node)}]\n${content}\n:::`,
          );
          consumedThrough = end - 1;
          continue;
        }
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
