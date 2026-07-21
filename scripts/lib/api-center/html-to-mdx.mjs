import * as cheerio from 'cheerio';
import { getTableOfContents } from 'fumadocs-core/content/toc';
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

function renderNoTocHeadings(body) {
  if (!body.includes('[!toc]')) return body;

  const headingSource = body.replace(/ \[!toc\](?=\s*$)/gm, '');
  const toc = getTableOfContents(headingSource);
  let headingIndex = 0;

  return body
    .split('\n')
    .map((line) => {
      const heading = line.match(/^(#{1,6}) (.+) \[!toc\]$/);
      if (!/^#{1,6} /.test(line)) return line;
      const item = toc[headingIndex];
      headingIndex += 1;
      if (!heading || !item?.url?.startsWith('#')) {
        return line;
      }
      const level = heading[1].length;
      const title = escapeMdxText(heading[2]);
      const id = JSON.stringify(item.url.slice(1));
      return `<h${level} data-toc-hidden="true" id={${id}}>${title}</h${level}>`;
    })
    .join('\n');
}

function isSinceDefinitionTerm(value) {
  const normalized = cleanText(stripHeadingLinks(value)).toLowerCase();
  return normalized === '自从' || normalized === 'since';
}

function containsTypeDocSinceDefinitionTerm($, element) {
  return element
    .find('dl.tsd-comment-tags > dt')
    .toArray()
    .some((term) => isSinceDefinitionTerm($(term).text()));
}

export function detailedDescriptionTitleMode(element) {
  const id = String(element.attr('id') ?? element.attr('name') ?? '');
  const deliveryTarget = String(
    element.attr('data-deliveryTarget') ?? '',
  ).toLowerCase();
  const isDetailedDescription =
    id.endsWith('__detailed_desc') || deliveryTarget === 'details';
  if (!isDetailedDescription) return null;

  const otherProperties = String(element.attr('data-otherprops') ?? '')
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
  if (otherProperties.includes('no-title')) return 'suppressed';
  if (element.children('h1, h2, h3, h4, h5, h6').length > 0) {
    return 'explicit';
  }
  return cleanText(element.text()) ? 'implicit' : null;
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
  const classes = new Set(
    [...classNames(element)].map((className) => className.toLowerCase()),
  );
  const hasClass = (...names) => names.some((name) => classes.has(name));
  const hasCalloutClass = (...kinds) =>
    [...classes].some((name) => {
      return kinds.some(
        (kind) =>
          name === kind ||
          name === `alert-${kind}` ||
          name === `admonition-${kind}` ||
          name === `callout-${kind}` ||
          name === `${kind}-callout`,
      );
    });
  const isAlert =
    hasClass('alert') || [...classes].some((name) => name.startsWith('alert-'));

  if (hasCalloutClass('danger', 'error')) return 'error';
  if (
    hasCalloutClass('attention', 'caution') ||
    (isAlert && hasCalloutClass('warn', 'warning'))
  ) {
    return 'caution';
  }
  if (hasCalloutClass('warn', 'warning')) return 'warning';
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

function renderCodeSpan(value) {
  const content = String(value ?? '').replace(/\s*\r?\n\s*/g, ' ');
  const longestBacktickRun = Math.max(
    0,
    ...[...content.matchAll(/`+/g)].map((match) => match[0].length),
  );
  const fence = '`'.repeat(longestBacktickRun + 1);
  const padding = content.startsWith('`') || content.endsWith('`') ? ' ' : '';
  return `${fence}${padding}${content}${padding}${fence}`;
}

function hasExplicitCodeLineBreak(element) {
  return element.find('br').length > 0;
}

function normalizeMultilineCode(value) {
  return String(value ?? '')
    .split(/\r?\n/)
    .map((line) => {
      const withoutLayoutWhitespace = line.replace(/^[ \t]+|[ \t]+$/g, '');
      const nonBreakingIndent =
        withoutLayoutWhitespace.match(/^\u00a0+/)?.[0].length ?? 0;
      return `${' '.repeat(nonBreakingIndent)}${withoutLayoutWhitespace
        .slice(nonBreakingIndent)
        .trimStart()
        .replace(/\u00a0/g, ' ')}`;
    })
    .filter(Boolean)
    .join('\n');
}

function inlineCodeElement($, node) {
  if (node?.type !== 'tag') return null;
  const name = elementName(node);
  return name === 'code' || name === 'kbd' ? $(node) : null;
}

function legacySplitCodeIdentifier(node) {
  if (node?.type !== 'text') return null;
  const value = node.data ?? '';
  if (value !== value.trim()) return null;
  return /^[\p{Letter}\p{Number}_$]+$/u.test(value) ? value : null;
}

function consumeLegacySplitCodeRun($, nodes, startIndex) {
  const opening = inlineCodeElement($, nodes[startIndex]);
  if (!opening || cleanText(opening.text())) return null;

  const identifier = legacySplitCodeIdentifier(nodes[startIndex + 1]);
  if (!identifier) return null;
  let content = identifier;
  let cursor = startIndex + 2;
  let codeChunks = 0;
  while (cursor < nodes.length) {
    const code = inlineCodeElement($, nodes[cursor]);
    if (!code || !cleanText(code.text())) break;
    content += code.text().replace(/[ \t]+/g, ' ');
    codeChunks += 1;
    cursor += 1;

    const nextIdentifier = legacySplitCodeIdentifier(nodes[cursor]);
    if (!nextIdentifier || !inlineCodeElement($, nodes[cursor + 1])) break;
    content += nextIdentifier;
    cursor += 1;
  }
  if (codeChunks === 0) return null;
  return {
    nextIndex: cursor,
    value: renderCodeSpan(content.replace(/[ \t]+/g, ' ').trim()),
  };
}

function tightenInlinePunctuation(value) {
  const source = String(value);
  let normalized = '';
  let cursor = 0;
  const tighten = (segment) =>
    segment.replace(/\s+([，。！？：；、,.!?;:)\]}>])/g, '$1');
  while (cursor < source.length) {
    const start = source.indexOf('`', cursor);
    if (start < 0) {
      normalized += tighten(source.slice(cursor));
      break;
    }
    let fenceEnd = start + 1;
    while (source[fenceEnd] === '`') fenceEnd += 1;
    const fence = source.slice(start, fenceEnd);
    const end = source.indexOf(fence, fenceEnd);
    if (end < 0) {
      normalized += tighten(source.slice(cursor));
      break;
    }
    normalized += tighten(source.slice(cursor, start));
    normalized += source.slice(start, end + fence.length);
    cursor = end + fence.length;
  }
  return normalized;
}

async function renderInlineNodes($, nodes, state, options = {}) {
  const values = [];
  for (let index = 0; index < nodes.length; index += 1) {
    const legacySplitCode = options.rawText
      ? null
      : consumeLegacySplitCodeRun($, nodes, index);
    if (legacySplitCode) {
      values.push(legacySplitCode.value);
      index = legacySplitCode.nextIndex - 1;
      continue;
    }
    values.push(await renderInlineNode($, nodes[index], state, options));
  }
  const normalizedWhitespace = values.join('').replace(/[ \t]+/g, ' ');
  if (options.rawText) return normalizedWhitespace.trim();
  return tightenInlinePunctuation(normalizedWhitespace).trim();
}

async function renderInlineNode($, node, state, options = {}) {
  if (node.type === 'text') {
    return options.rawText ? (node.data ?? '') : escapeMdxText(node.data ?? '');
  }
  if (node.type !== 'tag') return '';
  const element = $(node);
  const name = elementName(node);
  if (name === 'code' || name === 'kbd') {
    const codeContent = await renderInlineNodes(
      $,
      element.contents().toArray(),
      state,
      { rawText: true },
    );
    const linkedCode = codeContent.match(/^\[([^\]\n]+)\]\(([^\n]+)\)$/);
    if (linkedCode) {
      return `[${renderCodeSpan(linkedCode[1])}](${linkedCode[2]})`;
    }
    return renderCodeSpan(codeContent);
  }
  const content = await renderInlineNodes(
    $,
    element.contents().toArray(),
    state,
    options,
  );
  if (name === 'br') return '  \n';
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

async function renderUnwrappedListItems($, element, state) {
  const blocks = [];
  for (const item of element.children('li').toArray()) {
    const body = await renderChildren($, $(item), state);
    if (body) blocks.push(body);
  }
  return blocks.join('\n\n');
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
  const listIsSince = classNames(list).has('since');
  const listIsTypeDocCommentTags = list.hasClass('tsd-comment-tags');
  const listIsDoxygenMemberDetail = list.closest('.memdoc').length > 0;
  const listIsDoxygenNote = listIsDoxygenMemberDetail && list.hasClass('note');
  const listIsDoxygenParams =
    listIsDoxygenMemberDetail && list.hasClass('params');
  const listIsDoxygenReturn =
    listIsDoxygenMemberDetail && list.hasClass('return');
  let term = null;
  let termHasLink = false;
  let termIsSince = false;
  for (const child of list.children('dt, dd').toArray()) {
    if (elementName(child) === 'dt') {
      const renderedTerm = cleanText(
        await renderInlineNodes($, $(child).contents().toArray(), state),
      );
      termHasLink =
        $(child).find('a').length > 0 ||
        /(?<!!)\[[^\]]+]\([^)]+\)/.test(renderedTerm);
      term = termHasLink ? renderedTerm : stripHeadingLinks(renderedTerm);
      termIsSince =
        listIsSince ||
        (listIsTypeDocCommentTags && isSinceDefinitionTerm(renderedTerm));
    } else {
      const body = await renderChildren($, $(child), state);
      if (term) {
        if (termIsSince || listIsDoxygenNote) {
          blocks.push(renderCallout({ type: 'info', title: term, body }));
        } else if (listIsDoxygenParams || listIsDoxygenReturn) {
          const title = listIsDoxygenReturn ? '返回值' : term;
          blocks.push(`#### ${title} [!toc]\n\n${body}`);
        } else {
          blocks.push(
            `${termHasLink ? `**${term}**` : `### ${term}`}\n\n${body}`,
          );
        }
      } else if (body) blocks.push(body);
      term = null;
      termHasLink = false;
      termIsSince = false;
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
    const isMultilineCode =
      name === 'code' && hasExplicitCodeLineBreak($(child));
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
      ].includes(name) ||
      isHeadingAnchor ||
      isMultilineCode;
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
  const isTypeDocSectionLabel =
    name === 'h4' &&
    [
      'tsd-parameters-title',
      'tsd-returns-title',
      'tsd-type-parameters-title',
    ].some((className) => element.hasClass(className));
  if (isTypeDocSectionLabel) {
    const label = cleanText(
      await renderInlineNodes($, element.contents().toArray(), state),
    );
    return [anchor, label].filter(Boolean).join('\n\n');
  }
  const isDoxygenMemberTitle = name === 'h2' && element.hasClass('memtitle');
  if (isDoxygenMemberTitle) {
    element.children('.permalink').remove();
    const title = cleanText(
      stripHeadingLinks(
        await renderInlineNodes($, element.contents().toArray(), state),
      ),
    );
    return [anchor, title ? `### ${title}` : ''].filter(Boolean).join('\n\n');
  }
  const isDoxygenHiddenGroupTitle =
    name === 'h2' &&
    element.hasClass('groupheader') &&
    (element.attr('id') === 'header-details' ||
      cleanText(element.text()) === '枚举类型说明');
  if (isDoxygenHiddenGroupTitle) {
    return anchor;
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
  if (name === 'code' && hasExplicitCodeLineBreak(element)) {
    const source = normalizeMultilineCode(
      await renderInlineNodes($, element.contents().toArray(), state, {
        rawText: true,
      }),
    );
    return [anchor, renderCodeFence(source, languageFromCode(element))]
      .filter(Boolean)
      .join('\n\n');
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
    const body =
      element.hasClass('tsd-descriptions') &&
      containsTypeDocSinceDefinitionTerm($, element)
        ? await renderUnwrappedListItems($, element, state)
        : await renderList($, element, state, name === 'ol');
    return [anchor, body].filter(Boolean).join('\n\n');
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
  const implicitDetailHeading =
    name === 'section' && detailedDescriptionTitleMode(element) === 'implicit'
      ? '### 详情'
      : '';
  return [
    anchor,
    implicitDetailHeading,
    await renderChildren($, element, state),
  ]
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
  article.children('table.memberdecls').remove();
  article
    .children('.textblock, p')
    .filter((_, node) => {
      const element = $(node);
      const text = cleanText(element.text());
      const sourceLink = element.find('a[href*="_source.html"]').length > 0;
      const includeOnly =
        text.startsWith('#include') &&
        element.find('code').length > 0 &&
        element.find('p').length === 0;
      return sourceLink || includeOnly;
    })
    .remove();
  const titleElement = titleNode.get(0);
  const titleIsInsideArticle =
    titleElement &&
    (article.get(0) === titleElement ||
      article.find('*').toArray().includes(titleElement));
  if (titleIsInsideArticle) titleNode.remove();
  if (description) descriptionNode.remove();
  const renderedBody = renderNoTocHeadings(
    await renderChildren($, article, state),
  );
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
