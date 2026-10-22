import type { Node as EstreeNode, Expression } from 'estree';
import { remarkGfm } from 'fumadocs-core/mdx-plugins/remark-gfm';
import { createStringifier } from 'fumadocs-core/mdx-plugins/stringifier';
import GithubSlugger from 'github-slugger';
import type { Code, Nodes, PhrasingContent, Root, RootContent } from 'mdast';
import { gfmToMarkdown } from 'mdast-util-gfm';
import type { MdxJsxFlowElement, MdxJsxTextElement } from 'mdast-util-mdx-jsx';
import {
  defaultHandlers,
  type Handle,
  type Options,
  toMarkdown,
} from 'mdast-util-to-markdown';
import remarkDirective from 'remark-directive';
import remarkMdx from 'remark-mdx';
import remarkParse from 'remark-parse';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';
import { VFile } from 'vfile';

type Element = MdxJsxFlowElement | MdxJsxTextElement;
type MarkdownWriter = ReturnType<typeof createMarkdownWriter>;
const parser = unified()
  .use(remarkParse)
  .use(remarkMdx)
  .use(remarkDirective)
  .use(remarkGfm);
const tabRoots = new Set(['Tabs', 'CodeBlockTabs']);
const tabLists = new Set(['TabsList', 'CodeBlockTabsList']);
const tabTriggers = new Set(['TabsTrigger', 'CodeBlockTabsTrigger']);
const tabPanels = new Set(['TabsContent', 'Tab', 'CodeBlockTab']);

/** Convert the export AST, retaining code values and Markdown container structure. */
export function toDocsMarkdown(markdown: string): string {
  const file = new VFile(normalizeHtml(markdown));
  const tree = parser.parse(file);
  const s = createMarkdownWriter();
  const slots = collectSlots(tree);

  function walk(
    node: Nodes,
    labels = new Map<Element, string>(),
    inTable = false,
  ) {
    if (node.type === 'code') {
      s.replace(node, () => renderCode(node));
      return;
    }
    if (node.type === 'mdxjsEsm') {
      s.replace(node, '');
      return;
    }
    if (node.type === 'textDirective' || node.type === 'leafDirective') {
      // Colons in authored prose can be parsed as directives; retain that prose.
      s.replace(
        node,
        String(file.value).slice(
          node.position?.start.offset,
          node.position?.end.offset,
        ),
      );
      return;
    }
    if (
      node.type === 'mdxFlowExpression' ||
      node.type === 'mdxTextExpression'
    ) {
      const value = expressionValue(node.data?.estree?.body[0]);
      s.replace(
        node,
        value === undefined
          ? node.value.trim().startsWith('/*')
            ? ''
            : `\`${node.value}\``
          : String(value),
      );
      return;
    }
    if (
      (node.type === 'link' || node.type === 'image') &&
      /[()]/.test(node.url)
    ) {
      s.replace(
        node,
        () =>
          `${node.type === 'image' ? '!' : ''}${link(node.type === 'image' ? (node.alt ?? '') : s.inner(node), node.url)}`,
      );
    }
    const element = isElement(node) ? node : undefined;
    if (element && tabRoots.has(element.name ?? '')) {
      labels = collectLabels(element, s);
    }
    if ('children' in node) {
      for (const child of node.children)
        walk(
          child,
          labels,
          inTable || node.type === 'tableCell' || element?.name === 'table',
        );
    }
    if (element) {
      const panelLabel = labels.get(element);
      s.replace(element, () =>
        renderElement(element, s, panelLabel, slots.get(element), inTable),
      );
    } else if (node.type === 'containerDirective') {
      s.replace(node, () => {
        const title = node.children.find(
          (child) => child.type === 'paragraph' && child.data?.directiveLabel,
        );
        const body = node.children
          .filter((child) => child !== title)
          .map((child) => s.stringify(child))
          .join('\n\n');
        return quote(
          [`**${calloutLabel(node.name, title ? s.inner(title) : '')}**`, body]
            .filter(Boolean)
            .join('\n\n'),
        );
      });
    }
  }

  walk(tree);
  // Joining top-level blocks removes empty component scaffolding, without editing code.
  return `${tree.children
    .map((node) => s.stringify(node).trim())
    .filter(Boolean)
    .join('\n\n')}\n`;
}

function renderElement(
  node: Element,
  s: MarkdownWriter,
  panelLabel?: string,
  slot?: { title: string; id: string; definition: boolean },
  inTable = false,
): string {
  const name = node.name ?? '';
  const body =
    node.type === 'mdxJsxFlowElement'
      ? node.children
          .map((child) => s.stringify(child).trim())
          .filter(Boolean)
          .join('\n\n')
      : s.inner(node).trim();
  const title = attribute(node, 'title') || attribute(node, 'name');
  const href = attribute(node, 'href') || attribute(node, 'url');
  if (slot)
    return slot.definition
      ? `#### ${slot.title}\n\n${body}`
      : link(slot.title, `#${slot.id}`);
  if (
    tabLists.has(name) ||
    tabTriggers.has(name) ||
    name === 'script' ||
    name === 'style'
  )
    return '';
  if (tabPanels.has(name))
    return labeled(panelLabel || title || attribute(node, 'value'), body);
  if (name === 'table') return renderHtmlTable(node, s);
  if (name === 'Callout' || name === 'CalloutContainer') {
    const hasTitle = node.children.some(
      (child) => isElement(child) && child.name === 'CalloutTitle',
    );
    const calloutBody = node.children
      .map((child) => s.stringify(child).trim())
      .filter(Boolean)
      .join('\n\n');
    return quote(
      [
        hasTitle
          ? ''
          : `**${title || capitalize(attribute(node, 'type') || 'note')}**`,
        calloutBody,
      ]
        .filter(Boolean)
        .join('\n\n'),
    );
  }
  if (name === 'CalloutTitle' || name === 'summary') return `**${body}**`;
  if (name === 'a' || name === 'Link')
    return href ? link(body || title || href, href) : body;
  if (name === 'img' || name === 'Image')
    return `!${link(attribute(node, 'alt'), attribute(node, 'src'))}`;
  if (['video', 'audio', 'iframe', 'source'].includes(name)) {
    const src = attribute(node, 'src');
    return [src ? link(title || name, src) : '', body]
      .filter(Boolean)
      .join('\n\n');
  }
  if (['strong', 'b'].includes(name)) return `**${body}**`;
  if (['em', 'i'].includes(name)) return `*${body}*`;
  if (['code', 'kbd'].includes(name)) return `\`${body}\``;
  if (name === 'br') return inTable ? '; ' : '\n';
  if (name === 'hr') return '---';
  if (name === 'blockquote') return quote(body);
  if (/^h[1-6]$/.test(name)) return `${'#'.repeat(Number(name[1]))} ${body}`;
  if (name === 'li')
    return inTable ? body : `- ${body.replaceAll('\n', '\n  ')}`;
  if (name === 'ul' || name === 'ol')
    return node.children
      .map((child) => s.stringify(child))
      .filter(Boolean)
      .join(inTable ? '; ' : '\n');
  if (name === 'Parameter') {
    const type = attribute(node, 'type');
    return labeled(
      [
        title ? `\`${title}\`` : '',
        type ? `(${type})` : '',
        attribute(node, 'required') === 'true' ? 'required' : '',
      ]
        .filter(Boolean)
        .join(' '),
      body,
    );
  }
  if (name === 'Accordion') {
    const depth = Number(attribute(node, 'headingLevel'));
    return title && depth >= 2 && depth <= 4
      ? `${'#'.repeat(Math.min(depth + 1, 4))} ${title}\n\n${body}`
      : labeled(title, body);
  }
  if (name.endsWith('Card') || name === 'Card') {
    return labeled(
      href ? link(title || href, href) : title,
      [attribute(node, 'description'), body].filter(Boolean).join('\n\n'),
    );
  }
  const data = tabRoots.has(name)
    ? ''
    : ['items', 'rows', 'plans', 'features', 'sections']
        .map((key) => renderData(staticAttribute(node, key)))
        .filter(Boolean)
        .join('\n\n');
  return labeled(
    href ? link(title || href, href) : title,
    [attribute(node, 'description'), data, body].filter(Boolean).join('\n\n'),
  );
}

function renderHtmlTable(node: Element, s: MarkdownWriter) {
  const rows: Element[] = [];
  function collect(parent: Nodes) {
    if (!('children' in parent)) return;
    for (const child of parent.children) {
      if (isElement(child) && child.name === 'tr') rows.push(child);
      else collect(child);
    }
  }
  collect(node);
  const spans = new Map<number, { text: string; remaining: number }>();
  const grid = rows.map((row) => {
    const cells: string[] = [];
    for (const [index, span] of spans) {
      cells[index] = span.text;
      if (--span.remaining === 0) spans.delete(index);
    }
    let column = 0;
    const elements = row.children.filter(
      (child): child is Element =>
        isElement(child) && (child.name === 'td' || child.name === 'th'),
    );
    for (const cell of elements) {
      while (cells[column] !== undefined) column++;
      const text = s.inner(cell).replaceAll('\n', '; ').replaceAll('|', '\\|');
      const colspan = Math.max(
        1,
        Number(attribute(cell, 'colSpan') || attribute(cell, 'colspan')) || 1,
      );
      const rowspan = Math.max(
        1,
        Number(attribute(cell, 'rowSpan') || attribute(cell, 'rowspan')) || 1,
      );
      for (let i = 0; i < colspan; i++) {
        cells[column] = text;
        if (rowspan > 1) spans.set(column, { text, remaining: rowspan - 1 });
        column++;
      }
    }
    return {
      cells,
      header:
        elements.length > 0 && elements.every((cell) => cell.name === 'th'),
    };
  });
  if (!grid.length) return s.inner(node);
  const width = Math.max(...grid.map((row) => row.cells.length));
  const firstData = grid.findIndex((row) => !row.header);
  const headerCount = firstData < 0 ? 1 : firstData;
  const headers = Array.from({ length: width }, (_, column) =>
    [
      ...new Set(
        grid
          .slice(0, headerCount)
          .map((row) => row.cells[column])
          .filter(Boolean),
      ),
    ].join(' / '),
  );
  const formatRow = (cells: string[]) =>
    `| ${Array.from({ length: width }, (_, column) => cells[column] ?? '').join(' | ')} |`;
  return [
    formatRow(headers),
    formatRow(headers.map(() => '---')),
    ...grid.slice(headerCount).map((row) => formatRow(row.cells)),
  ].join('\n');
}

function collectLabels(node: Element, s: MarkdownWriter) {
  const values = new Map<string, string>();
  const panels: Element[] = [];
  const items = staticAttribute(node, 'items');
  function walk(parent: Nodes) {
    if (!('children' in parent)) return;
    for (const child of parent.children) {
      if (isElement(child)) {
        if (tabRoots.has(child.name ?? '')) continue;
        if (tabTriggers.has(child.name ?? ''))
          values.set(attribute(child, 'value'), s.inner(child).trim());
        if (tabPanels.has(child.name ?? '')) panels.push(child);
      }
      walk(child);
    }
  }
  walk(node);
  return new Map(
    panels.map((panel, index) => [
      panel,
      values.get(attribute(panel, 'value')) ||
        (Array.isArray(items) && typeof items[index] === 'string'
          ? items[index]
          : ''),
    ]),
  );
}

function isElement(node: Nodes): node is Element {
  return node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement';
}

function staticAttribute(node: Element, name: string): unknown {
  const attr = node.attributes.find(
    (attr) => attr.type === 'mdxJsxAttribute' && attr.name === name,
  );
  if (attr?.type !== 'mdxJsxAttribute') return undefined;
  if (attr.value === null) return true;
  if (typeof attr.value === 'string') return attr.value;
  return expressionValue(attr.value?.data?.estree?.body[0]);
}

function attribute(node: Element, name: string): string {
  const value = staticAttribute(node, name);
  return typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
    ? String(value)
    : '';
}

function expressionValue(node?: EstreeNode): unknown {
  if (node?.type === 'ExpressionStatement')
    return literalValue(node.expression);
  return undefined;
}

// Read literals only. Documentation expressions must never execute during export.
function literalValue(node: Expression): unknown {
  if (node.type === 'Literal') return node.value;
  if (node.type === 'TemplateLiteral' && node.expressions.length === 0)
    return node.quasis[0]?.value.cooked;
  if (node.type === 'ArrayExpression')
    return node.elements.map((item) =>
      item && item.type !== 'SpreadElement' ? literalValue(item) : undefined,
    );
  if (node.type === 'ObjectExpression') {
    return Object.fromEntries(
      node.properties.flatMap((property) => {
        if (property.type !== 'Property' || property.computed) return [];
        const key =
          property.key.type === 'Identifier'
            ? property.key.name
            : property.key.type === 'Literal'
              ? String(property.key.value)
              : undefined;
        if (
          !key ||
          ![
            'Literal',
            'ObjectExpression',
            'ArrayExpression',
            'TemplateLiteral',
          ].includes(property.value.type)
        )
          return [];
        return [[key, literalValue(property.value as Expression)]];
      }),
    );
  }
  return undefined;
}

function renderData(value: unknown): string {
  if (typeof value === 'string' || typeof value === 'number')
    return String(value);
  if (Array.isArray(value))
    return value
      .map((item) => renderData(item))
      .filter(Boolean)
      .map((text) => `- ${text.replaceAll('\n', '\n  ')}`)
      .join('\n');
  if (value && typeof value === 'object') {
    const fields = value as Record<string, unknown>;
    const title = renderData(fields.title ?? fields.name ?? fields.label);
    const href = renderData(fields.href ?? fields.url);
    const details = Object.entries(fields)
      .filter(
        ([key]) =>
          ![
            'title',
            'name',
            'label',
            'href',
            'url',
            'icon',
            'accent',
            'variant',
            'className',
          ].includes(key),
      )
      .map(([, item]) => renderData(item))
      .filter(Boolean)
      .join('\n\n');
    return labeled(href ? link(title || href, href) : title, details);
  }
  return '';
}

function labeled(label: string, body: string) {
  return [label ? `**${label}**` : '', body].filter(Boolean).join('\n\n');
}

function quote(body: string) {
  return body
    .split('\n')
    .map((line) => (line ? `> ${line}` : '>'))
    .join('\n');
}

function link(label: string, href: string) {
  return `[${label.replaceAll(']', '\\]')}](${href.replaceAll('(', '%28').replaceAll(')', '%29')})`;
}

function calloutLabel(type: string, title: string) {
  return title &&
    /^(?:note|info|tip|caution|warning|error|success)$/i.test(title)
    ? title
    : [capitalize(type), title].filter(Boolean).join(': ');
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function collectSlots(tree: Root) {
  const elements: Element[] = [];
  visit(tree, (node) => {
    if (isElement(node) && node.name === 'Slot') elements.push(node);
  });
  const slugger = new GithubSlugger();
  const slots = new Map<
    Element,
    { title: string; id: string; definition: boolean }
  >();
  for (const node of elements) {
    const name = attribute(node, 'for');
    if (!name) continue;
    const title = `${name} details`;
    const id = slugger.slug(title);
    slots.set(node, { title, id, definition: true });
    for (const placeholder of elements) {
      if (
        slots.has(placeholder) ||
        attribute(placeholder, 'name') !== name ||
        (placeholder.position?.start.offset ?? 0) >
          (node.position?.start.offset ?? 0)
      )
        continue;
      slots.set(placeholder, { title, id, definition: false });
    }
  }
  return slots;
}

// Markdown-authored pages may contain HTML comments and void tags. The Markdown
// parser identifies them without touching code spans or fenced code examples.
function normalizeHtml(markdown: string) {
  const tree = unified().use(remarkParse).parse(markdown);
  const file = new VFile(markdown);
  const s = createStringifier(file);
  visit(tree, 'html', (node) => {
    if (node.value.startsWith('<!--'))
      s.replace(node, node.value.replace(/<!--[\s\S]*?-->/g, ''));
    else if (
      /^<(?:br|hr|img|input|source|track|wbr)\b[^>]*>(?![\s\S])/i.test(
        node.value,
      ) &&
      !/\/\s*>$/.test(node.value)
    ) {
      s.replace(node, node.value.replace(/>$/, ' />'));
    }
  });
  return s.stringify(tree);
}

function renderCode(node: Code) {
  const runs = node.value.match(/`+/g) ?? [];
  const fence = '`'.repeat(Math.max(3, ...runs.map((run) => run.length + 1)));
  const tab = /\btab=(?:"([^"]*)"|'([^']*)')/.exec(node.meta ?? '');
  const meta = (node.meta ?? '')
    .replace(/\btab(?:Group)?=(?:"[^"]*"|'[^']*')\s*/g, '')
    .trim();
  const code = `${fence}${node.lang ?? ''}${meta ? ` ${meta}` : ''}\n${node.value}\n${fence}\n`;
  return tab ? labeled(tab[1] ?? tab[2], code) : code;
}

function createMarkdownWriter() {
  const replacements = new Map<Nodes, string | (() => string)>();
  const options: Options = {
    extensions: [gfmToMarkdown()],
    handlers: {},
    bullet: '-',
  };
  const customTypes = [
    'mdxJsxFlowElement',
    'mdxJsxTextElement',
    'mdxjsEsm',
    'mdxFlowExpression',
    'mdxTextExpression',
    'containerDirective',
    'textDirective',
    'leafDirective',
  ];
  for (const type of new Set([
    ...Object.keys(defaultHandlers),
    ...customTypes,
  ])) {
    const fallback = defaultHandlers[type as keyof typeof defaultHandlers];
    const handler: Handle = (node, parent, state, info) => {
      const replacement = replacements.get(node);
      if (replacement !== undefined)
        return typeof replacement === 'string' ? replacement : replacement();
      return fallback ? fallback(node, parent, state, info) : '';
    };
    if (fallback) Object.assign(handler, fallback);
    Object.assign(options.handlers ?? {}, { [type]: handler });
  }
  function stringify(node: Nodes): string {
    const root: Root =
      node.type === 'root'
        ? node
        : { type: 'root', children: [node as RootContent] };
    return toMarkdown(root, options).trimEnd();
  }
  function inner(node: Nodes): string {
    if (!('children' in node)) return '';
    const phrasing = node.children.every((child) =>
      [
        'text',
        'inlineCode',
        'strong',
        'emphasis',
        'delete',
        'link',
        'linkReference',
        'image',
        'imageReference',
        'break',
        'mdxJsxTextElement',
        'mdxTextExpression',
        'footnoteReference',
      ].includes(child.type),
    );
    const root: Root = {
      type: 'root',
      children: phrasing
        ? [{ type: 'paragraph', children: node.children as PhrasingContent[] }]
        : (node.children as RootContent[]),
    };
    return stringify(root);
  }
  return {
    stringify,
    inner,
    replace(node: Nodes, value: string | (() => string)) {
      replacements.set(node, value);
    },
  };
}
