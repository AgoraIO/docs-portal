import * as cheerio from 'cheerio';
import { rewriteLegacyBodyLinks } from './legacy-links.mjs';
import {
  createWarning,
  escapeMdxText,
  renderCallout,
  renderCodeFence,
  renderSimpleTable,
  renderStableAnchor,
  rewriteLegacyHref,
} from './migration-framework.mjs';

export const API_CENTER_GENERATOR_CONVERSION_OPTIONS = Object.freeze({
  appledoc: {
    rootSelector: 'main[role="main"]',
    titleSelector: 'main[role="main"] > h1.title, main[role="main"] h1',
  },
  doxygen: {
    rootSelector: '.contents',
    titleSelector: '.headertitle .title',
  },
  oxygen: {
    rootSelector: 'main > article',
    titleSelector: 'main > article > h1.title, main > article > h1',
  },
  typedoc: {
    rootSelector: '.col-content',
    titleSelector: '.tsd-page-title h1',
  },
});

function cleanText(value) {
  return String(value ?? '')
    .replace(/\u00a0/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\s*\n\s*/g, ' ')
    .trim();
}

function normalizeBlocks(value) {
  return String(value ?? '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function stripHeadingLinks(value) {
  return String(value).replace(
    /(?<!!)\[((?:[^[\]\n]|\[[^\]\n]*])*)]\((?:<[^>\n]+>|[^)\n]+)\)/g,
    '$1',
  );
}

function anchorFor(element) {
  const id = element.attr('id') ?? element.attr('name');
  return id ? renderStableAnchor(id) : '';
}

function elementName(node) {
  return node?.type === 'tag' ? node.name.toLowerCase() : '';
}

function classNames(element) {
  return new Set(
    String(element.attr('class') ?? '')
      .split(/\s+/)
      .filter(Boolean),
  );
}

function calloutType(element) {
  const classes = classNames(element);
  const hasCalloutClass = (...kinds) =>
    [...classes].some((name) => {
      const normalized = name.toLowerCase();
      return kinds.some(
        (kind) =>
          normalized === kind ||
          normalized === `alert-${kind}` ||
          normalized === `admonition-${kind}` ||
          normalized === `callout-${kind}` ||
          normalized === `${kind}-callout`,
      );
    });
  if (hasCalloutClass('danger', 'error')) return 'error';
  if (hasCalloutClass('caution', 'warn', 'warning')) return 'warning';
  if (hasCalloutClass('tip', 'success')) return 'tip';
  if (hasCalloutClass('info', 'important')) return 'info';
  if (hasCalloutClass('note', 'admonition', 'alert')) {
    return 'note';
  }
  return null;
}

function languageFromCode(element) {
  const classes = String(element.attr('class') ?? '').split(/\s+/);
  const marker = classes.find((name) => /^(?:lang|language)-/.test(name));
  return marker?.replace(/^(?:lang|language)-/, '') || 'text';
}

function selectArticle($) {
  const selectors = [
    'main > article',
    'main article',
    'main[role="main"]',
    'article',
    '.col-content',
    '.tsd-page-toolbar + .container',
    '.tsd-panel-group',
    '#content',
    '.contents',
    '.content-right',
    'body',
  ];
  for (const selector of selectors) {
    const match = $(selector).first();
    if (match.length > 0 && cleanText(match.text()).length > 0) return match;
  }
  return $('body').first();
}

function loadHtmlPage({ html, rootSelector, titleSelector }) {
  const $ = cheerio.load(html);
  const preferredTitle = titleSelector
    ? cleanText($(titleSelector).first().text())
    : '';
  $('script, style, footer, header').remove();
  $('nav').each((_, node) => {
    const element = $(node);
    const isRelatedLinks =
      element.hasClass('related-links') || element.find('.relinfo').length > 0;
    if (!isRelatedLinks) element.remove();
  });
  const article = rootSelector ? $(rootSelector).first() : selectArticle($);
  if (article.length === 0) {
    return {
      $,
      article,
      titleNode: null,
      descriptionNode: null,
      title: '',
      description: '',
    };
  }
  const selectedTitleNode = titleSelector ? $(titleSelector).first() : null;
  const titleNode =
    selectedTitleNode?.length > 0
      ? selectedTitleNode
      : article.find('h1').first();
  const title = cleanText(
    preferredTitle || titleNode.text() || $('title').first().text(),
  );
  const titleArticle = titleNode.closest('article').get(0);
  const articleNode = article.get(0);
  const descriptionNode = article
    .find('.shortdesc, .lead, .tsd-comment-shortform')
    .filter((_, node) => {
      const nodeArticle = $(node).closest('article').get(0);
      return (nodeArticle ?? articleNode) === (titleArticle ?? articleNode);
    })
    .first();
  return {
    $,
    article,
    titleNode,
    descriptionNode,
    title,
    description: cleanText(descriptionNode.text()),
  };
}

export function extractHtmlPageMetadata(options) {
  const { article, title, description } = loadHtmlPage(options);
  return {
    found: article.length > 0,
    title,
    description,
  };
}

function createState(options) {
  return {
    ...options,
    warnings: [],
    assets: [],
    tableSlotCounter: 0,
  };
}

async function renderInlineNodes($, nodes, state) {
  const values = [];
  for (const node of nodes) values.push(await renderInlineNode($, node, state));
  return values
    .join('')
    .replace(/[ \t]+/g, ' ')
    .replace(/\s+([，。！？：；、,.!?;:)\]}>])/g, '$1')
    .trim();
}

async function renderInlineNode($, node, state) {
  if (node.type === 'text') return escapeMdxText(node.data ?? '');
  if (node.type !== 'tag') return '';
  const element = $(node);
  const name = elementName(node);
  const content = await renderInlineNodes(
    $,
    element.contents().toArray(),
    state,
  );
  if (name === 'br') return '  \n';
  if (name === 'code' || name === 'kbd') {
    const linkedCode = content.match(/^\[([^\]\n]+)\]\(([^\n]+)\)$/);
    if (linkedCode) {
      return `[\`${linkedCode[1].replace(/`/g, '\\`')}\`](${linkedCode[2]})`;
    }
    return `\`${content.replace(/`/g, '\\`')}\``;
  }
  if (name === 'strong' || name === 'b') return `**${content}**`;
  if (name === 'em' || name === 'i') return `*${content}*`;
  if (name === 'del' || name === 's') return `~~${content}~~`;
  if (name === 'a') {
    const rawHref = element.attr('href');
    if (!rawHref) {
      const stableAnchor = anchorFor(element);
      return `${stableAnchor}${content}`;
    }
    const rewritten = rewriteLegacyHref(rawHref, state);
    if (rewritten.warning) state.warnings.push(rewritten.warning);
    if (!rewritten.href) return content;
    return content ? `[${content}](${rewritten.href})` : rewritten.href;
  }
  if (name === 'img') {
    const rendered = await renderImage($, element, state);
    return rendered;
  }
  if (['script', 'style', 'svg'].includes(name)) return '';
  return content;
}

function compactImageContext(value) {
  const normalized = cleanText(value)
    .replace(/[：:。,.，;；]+$/g, '')
    .replace(/^[-*•]\s*/, '');
  if (!normalized || normalized.length > 120) return '';
  return normalized;
}

function contextualImageAlt($, element, state, fallbackAlt = '') {
  const sourceAlt = cleanText(element.attr('alt') || element.attr('title'));
  if (sourceAlt && !/^[-–—]$/.test(sourceAlt)) {
    return { alt: sourceAlt, synthesized: false };
  }

  const source = element.attr('src') ?? '';
  const fileName = source.split(/[?#]/, 1)[0].split('/').at(-1)?.toLowerCase();
  if (fileName === 'closed.png') {
    return { alt: '展开继承成员', synthesized: true };
  }
  if (fileName === 'open.png') {
    return { alt: '收起继承成员', synthesized: true };
  }

  const row = element.closest('tr');
  const cell = element.closest('th, td');
  const rowContext = row.length
    ? row
        .children('th, td')
        .toArray()
        .filter((node) => node !== cell.get(0))
        .map((node) => compactImageContext($(node).text()))
        .find(Boolean)
    : '';
  const priorContext = element
    .parentsUntil('body')
    .addBack()
    .toArray()
    .map((node) =>
      compactImageContext(
        $(node)
          .prevAll('p, h1, h2, h3, h4, h5, h6, figcaption, .caption')
          .first()
          .text(),
      ),
    )
    .find(Boolean);
  const context = [fallbackAlt, rowContext, priorContext]
    .map(compactImageContext)
    .find(Boolean);
  if (context) {
    return {
      alt: /^\d+(?:-\d+)?$/.test(context) ? `${context} 人布局示意` : context,
      synthesized: true,
    };
  }

  return {
    alt: state.pageTitle ? `${state.pageTitle} 图示` : '源页面图示',
    synthesized: true,
  };
}

async function renderImage($, element, state, fallbackAlt = '') {
  const source = element.attr('src');
  if (!source) return '';
  const { alt, synthesized } = contextualImageAlt(
    $,
    element,
    state,
    fallbackAlt,
  );
  if (synthesized) {
    state.warnings.push(
      createWarning(
        'missing-source-text',
        `The source image ${source} has no meaningful alt or title text; the converter used contextual alt text "${alt}".`,
        { alt, source },
      ),
    );
  }
  if (!state.onAsset) {
    state.warnings.push(
      createWarning(
        'asset-missing',
        `No asset handler is configured for ${source}.`,
      ),
    );
    return `![${escapeMdxText(alt)}](${source})`;
  }
  try {
    const target = await state.onAsset({
      source,
      alt,
      sourceUrl: state.sourceUrl,
      sourcePath: state.sourcePath,
    });
    state.assets.push({ source, target });
    return `![${escapeMdxText(alt)}](${target})`;
  } catch (error) {
    state.warnings.push(
      createWarning('asset-missing', `${source}: ${error.message}`),
    );
    return `![${escapeMdxText(alt)}](${source})`;
  }
}

function indentBlock(value, count) {
  const indent = ' '.repeat(count);
  return String(value)
    .split('\n')
    .map((line) => (line ? `${indent}${line}` : ''))
    .join('\n');
}

async function renderList($, element, state, ordered) {
  const items = [];
  const children = element.children('li').toArray();
  for (const [index, node] of children.entries()) {
    const item = $(node);
    const marker = ordered ? `${index + 1}.` : '-';
    const continuation = marker.length + 1;
    const blocks = [];
    let inline = '';
    for (const child of item.contents().toArray()) {
      const name = elementName(child);
      if (name === 'ul' || name === 'ol') {
        if (inline.trim()) {
          blocks.push(inline.trim());
          inline = '';
        }
        blocks.push(await renderList($, $(child), state, name === 'ol'));
      } else if (
        [
          'blockquote',
          'div',
          'dl',
          'figure',
          'img',
          'p',
          'pre',
          'table',
        ].includes(name)
      ) {
        if (inline.trim()) {
          blocks.push(inline.trim());
          inline = '';
        }
        blocks.push(await renderBlockNode($, child, state));
      } else {
        inline += await renderInlineNode($, child, state);
      }
    }
    if (inline.trim()) blocks.push(inline.trim());
    const [first = '', ...rest] = blocks.filter(Boolean);
    let rendered = `${marker} ${first}`;
    if (rest.length > 0) {
      rendered += `\n\n${rest.map((block) => indentBlock(block, continuation)).join('\n\n')}`;
    }
    items.push(rendered.trimEnd());
  }
  return items.join('\n');
}

async function renderTable($, table, state) {
  const rows = table.find('> thead > tr, > tbody > tr, > tr').toArray();
  if (rows.length === 0) return '';
  const values = [];
  const definitions = [];
  let width = 0;
  for (const [rowIndex, row] of rows.entries()) {
    const cells = $(row).children('th, td').toArray();
    const renderedCells = [];
    for (const cell of cells) {
      const element = $(cell);
      const span = Math.max(
        1,
        Number.parseInt(element.attr('colspan') ?? '1', 10) || 1,
      );
      const rich =
        rowIndex > 0 &&
        element.find(
          'table, ul, ol, pre, blockquote, img, div, section, p, dl, figure, [id], a[name]',
        ).length > 0;
      if (!rich) {
        renderedCells.push(
          cleanText(
            await renderInlineNodes($, element.contents().toArray(), state),
          ),
        );
        renderedCells.push(...Array.from({ length: span - 1 }, () => ''));
        continue;
      }
      const body = await renderChildren($, element, state);
      if (!body) {
        renderedCells.push('');
        continue;
      }
      const slotName = `api-center-table-${state.tableSlotCounter++}`;
      renderedCells.push(`<Slot name="${slotName}" />`);
      renderedCells.push(...Array.from({ length: span - 1 }, () => ''));
      definitions.push(`<Slot for="${slotName}">\n\n${body}\n\n</Slot>`);
    }
    width = Math.max(width, renderedCells.length);
    values.push(renderedCells);
  }
  const normalized = values.map((row) => [
    ...row,
    ...Array.from({ length: width - row.length }, () => ''),
  ]);
  const headerRow = normalized.shift();
  return [renderSimpleTable(headerRow, normalized), ...definitions]
    .filter(Boolean)
    .join('\n\n');
}

async function renderDefinitionList($, list, state) {
  const blocks = [];
  let term = null;
  let termHasLink = false;
  for (const child of list.children('dt, dd').toArray()) {
    if (elementName(child) === 'dt') {
      const renderedTerm = cleanText(
        await renderInlineNodes($, $(child).contents().toArray(), state),
      );
      termHasLink = /(?<!!)\[[^\]]+]\([^)]+\)/.test(renderedTerm);
      term = termHasLink ? renderedTerm : stripHeadingLinks(renderedTerm);
    } else {
      const body = await renderChildren($, $(child), state);
      if (term) {
        blocks.push(
          `${termHasLink ? `**${term}**` : `### ${term}`}\n\n${body}`,
        );
      } else if (body) blocks.push(body);
      term = null;
      termHasLink = false;
    }
  }
  return blocks.join('\n\n');
}

async function renderRelatedLinks($, element, state) {
  const containers = element
    .find('.linklist')
    .filter(
      (_, node) =>
        $(node).children('strong, b').length > 0 &&
        $(node).parents('.linklist').length === 0,
    )
    .toArray();
  const blocks = [];
  for (const node of containers.length > 0 ? containers : [element.get(0)]) {
    const container = $(node);
    const titleNode = container.children('strong, b').first();
    const title = cleanText(titleNode.text());
    if (titleNode.length > 0) titleNode.remove();
    container.children('br').first().remove();
    const body = await renderChildren($, container, state);
    blocks.push(
      [title ? `### ${escapeMdxText(title)}` : '', body]
        .filter(Boolean)
        .join('\n\n'),
    );
  }
  return blocks.filter(Boolean).join('\n\n');
}

async function renderChildren($, element, state) {
  const blocks = [];
  let inline = '';
  for (const child of element.contents().toArray()) {
    const name = elementName(child);
    const isHeadingAnchor =
      name === 'a' && $(child).children('h1, h2, h3, h4, h5, h6').length > 0;
    const isBlock =
      [
        'article',
        'aside',
        'blockquote',
        'details',
        'div',
        'dl',
        'figure',
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'hr',
        'iframe',
        'img',
        'nav',
        'object',
        'ol',
        'p',
        'pre',
        'section',
        'table',
        'ul',
        'video',
      ].includes(name) || isHeadingAnchor;
    if (isBlock) {
      if (inline.trim()) {
        blocks.push(inline.trim());
        inline = '';
      }
      const block = await renderBlockNode($, child, state);
      if (block) blocks.push(block);
    } else {
      inline += await renderInlineNode($, child, state);
    }
  }
  if (inline.trim()) blocks.push(inline.trim());
  return normalizeBlocks(blocks.filter(Boolean).join('\n\n'));
}

async function renderBlockNode($, node, state) {
  if (node.type === 'text') return escapeMdxText(cleanText(node.data));
  if (node.type !== 'tag') return '';
  const element = $(node);
  const name = elementName(node);
  const anchor = anchorFor(element);
  if (name === 'nav') {
    const isRelatedLinks =
      element.hasClass('related-links') || element.find('.relinfo').length > 0;
    if (!isRelatedLinks) return '';
    return [anchor, await renderRelatedLinks($, element, state)]
      .filter(Boolean)
      .join('\n\n');
  }
  if (['script', 'style', 'footer'].includes(name)) return '';
  if (['iframe', 'object', 'video'].includes(name)) {
    state.warnings.push(
      createWarning(
        'unsupported-html-structure',
        `Unsupported embedded <${name}> content was omitted.`,
      ),
    );
    return anchor;
  }
  const detectedCallout = calloutType(element);
  if (detectedCallout && ['aside', 'div', 'section'].includes(name)) {
    const titleNode = element
      .find('> .admonition-heading, > .title, > strong:first-child')
      .first();
    const title = cleanText(titleNode.text());
    if (titleNode.length > 0) titleNode.remove();
    const body = await renderChildren($, element, state);
    return [anchor, renderCallout({ type: detectedCallout, title, body })]
      .filter(Boolean)
      .join('\n\n');
  }
  if (/^h[1-6]$/.test(name)) {
    const level = Number(name.slice(1));
    const nestedAnchors = element
      .find('a[id], a[name]')
      .toArray()
      .map((node) => anchorFor($(node)))
      .filter(Boolean);
    const title = cleanText(
      stripHeadingLinks(
        (
          await renderInlineNodes($, element.contents().toArray(), state)
        ).replace(/<a id=(?:"[^"]*"|'[^']*')><\/a>/g, ''),
      ),
    );
    return [anchor, ...nestedAnchors, `${'#'.repeat(level)} ${title}`]
      .filter(Boolean)
      .join('\n\n');
  }
  if (name === 'p') {
    if (element.find('img').length > 0) {
      return [anchor, await renderChildren($, element, state)]
        .filter(Boolean)
        .join('\n\n');
    }
    const body = await renderInlineNodes(
      $,
      element.contents().toArray(),
      state,
    );
    return [anchor, body].filter(Boolean).join('\n\n');
  }
  if (name === 'pre') {
    const code = element.find('code').first();
    const source = (code.length > 0 ? code : element).text();
    if (!source.trim()) {
      state.warnings.push(
        createWarning(
          'empty-source-code',
          'The legacy source code block is empty; its stable anchor was preserved and the empty fence was omitted.',
        ),
      );
      return anchor;
    }
    return [anchor, renderCodeFence(source, languageFromCode(code))]
      .filter(Boolean)
      .join('\n\n');
  }
  if (name === 'ul' || name === 'ol') {
    return [anchor, await renderList($, element, state, name === 'ol')]
      .filter(Boolean)
      .join('\n\n');
  }
  if (name === 'table') {
    return [anchor, await renderTable($, element, state)]
      .filter(Boolean)
      .join('\n\n');
  }
  if (name === 'dl') {
    return [anchor, await renderDefinitionList($, element, state)]
      .filter(Boolean)
      .join('\n\n');
  }
  if (name === 'blockquote') {
    const content = await renderChildren($, element, state);
    const quote = content
      .split('\n')
      .map((line) => `> ${line}`.trimEnd())
      .join('\n');
    return [anchor, quote].filter(Boolean).join('\n\n');
  }
  if (name === 'hr') return '---';
  if (name === 'img') {
    return [anchor, await renderImage($, element, state)]
      .filter(Boolean)
      .join('\n\n');
  }
  if (name === 'figure') {
    const image = element.find('img').first();
    const caption = cleanText(element.find('figcaption').first().text());
    const rendered =
      image.length > 0 ? await renderImage($, image, state, caption) : '';
    return [anchor, rendered, caption ? `_${escapeMdxText(caption)}_` : '']
      .filter(Boolean)
      .join('\n\n');
  }
  if (name === 'details') {
    const summary = cleanText(element.children('summary').first().text());
    element.children('summary').first().remove();
    const content = await renderChildren($, element, state);
    return [anchor, summary ? `### ${escapeMdxText(summary)}` : '', content]
      .filter(Boolean)
      .join('\n\n');
  }
  return [anchor, await renderChildren($, element, state)]
    .filter(Boolean)
    .join('\n\n');
}

/**
 * @param {object} options
 * @param {string} options.html
 * @param {string} options.sourceUrl
 * @param {string} options.sourcePath
 * @param {Map<string, string>} [options.routeMap]
 * @param {Map<string, string>} [options.fragmentMap]
 * @param {(args: { source: string, sourceUrl: string }) => Promise<string> | string} [options.onAsset]
 * @param {string} [options.rootSelector]
 * @param {string} [options.titleSelector]
 */
export async function convertHtmlToMdx({
  html,
  sourceUrl,
  sourcePath,
  routeMap = new Map(),
  fragmentMap = new Map(),
  onAsset,
  rootSelector,
  titleSelector,
}) {
  const { $, article, titleNode, descriptionNode, title, description } =
    loadHtmlPage({ html, rootSelector, titleSelector });
  if (article.length === 0) {
    return {
      title: '',
      description: '',
      body: '',
      fragments: [],
      assets: [],
      warnings: [
        createWarning(
          'unsupported-html-structure',
          `No article body found in ${sourcePath}.`,
        ),
      ],
    };
  }
  const state = createState({
    sourceUrl,
    sourcePath,
    routeMap,
    fragmentMap,
    onAsset,
  });
  state.pageTitle = title;
  const fragments = [];
  article.find('[id], a[name]').each((_, node) => {
    const element = $(node);
    const value = element.attr('id') ?? element.attr('name');
    if (value && !fragments.includes(value)) fragments.push(value);
  });
  const titleElement = titleNode.get(0);
  const titleIsInsideArticle =
    titleElement &&
    (article.get(0) === titleElement ||
      article.find('*').toArray().includes(titleElement));
  if (titleIsInsideArticle) titleNode.remove();
  if (description) descriptionNode.remove();
  const renderedBody = await renderChildren($, article, state);
  const normalizedLinks = rewriteLegacyBodyLinks(renderedBody, {
    routeMap,
    sourcePath,
    sourceUrl,
  });
  for (const change of normalizedLinks.changes) {
    if (change.action !== 'rendered-as-text') continue;
    state.warnings.push(
      createWarning(
        'unresolved-link',
        `No local API Center target was found for ${change.href}.`,
        { href: change.href },
      ),
    );
  }
  for (const unresolved of normalizedLinks.unresolved) {
    state.warnings.push(
      createWarning(
        'unresolved-link',
        `No local API Center target was found for ${unresolved.href}.`,
        { href: unresolved.href },
      ),
    );
  }
  return {
    title,
    description,
    body: normalizedLinks.source,
    fragments,
    assets: state.assets,
    warnings: state.warnings,
    sourceTextLength: cleanText(article.text()).length,
  };
}
