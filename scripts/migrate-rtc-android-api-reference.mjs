import fs from 'node:fs/promises';
import path from 'node:path';

const repoRoot = process.cwd();
const sourceDir =
  '/Users/yangyixuan/Documents/GitHub/shengwang-doc-source/html-docs/rtc/Android/API';
const tocPath = path.join(sourceDir, 'toc_metadata.html');

const OUTPUTS = [
  {
    locale: 'zh-CN',
    rootIndex: `---
title: Android API 参考
description: RTC Android 客户端 API 参考。
---

本目录迁移自 RTC Android 旧版 API 参考，保留原有专题分组、稳定锚点和对象页跳转。`,
    targetBasePath: '/zh-CN/api-reference/rtc/android',
    targetRoot: path.join(
      repoRoot,
      'content/docs/zh-CN/api-reference/rtc/android',
    ),
  },
  {
    locale: 'en',
    rootIndex: `---
title: Android API 参考
description: RTC Android client API reference.
---

This directory contains the migrated RTC Android API reference. Content is currently kept in Chinese.`,
    targetBasePath: '/en/api-reference/rtc/android',
    targetRoot: path.join(repoRoot, 'content/docs/en/api-reference/rtc/android'),
  },
];

const PAGE_SLUG_OVERRIDES = new Map([
  ['rtc_api_overview.html', 'overview'],
  ['rtc_interface_class.html', 'full-sdk-api-list'],
  ['rtc_lite_api.html', 'lite-sdk-api-list'],
  ['rtc_api_sunset.html', 'api-sunset'],
  ['toc_publishnsubscribe.html', 'publish-and-subscribe'],
  ['toc_recording.html', 'recording'],
  ['toc_extension.html', 'extensions'],
  ['toc_network.html', 'network-and-other'],
]);

const FOLDER_SLUG_OVERRIDES = new Map([
  ['toc_audio.html', 'audio'],
  ['toc_audio_prenpost.html', 'pre-and-post-processing'],
  ['toc_video.html', 'video'],
  ['toc_video_prenpro.html', 'pre-and-post-processing'],
  ['toc_play.html', 'playback'],
  ['toc_mediaplayer.html', 'media-player'],
  ['toc_cloud_media_relay.html', 'cloud-media-relay'],
  ['toc_metadata.html', 'metadata'],
  ['toc_device_management.html', 'device-management'],
  ['rtc_api_data_type.html', 'class-and-enum'],
]);

const CLASS_ENUM_SECTIONS = [
  {
    bucket: 'classes',
    prefix: 'class_',
    title: 'Class',
  },
  {
    bucket: 'enums',
    prefix: 'enum_',
    title: 'Enum',
  },
  {
    bucket: 'standalone-apis',
    prefix: 'api_',
    title: '独立 API',
  },
];

async function main() {
  globalThis.File ??= class File {};
  const cheerio = await import('cheerio');

  const tocHtml = await fs.readFile(tocPath, 'utf8');
  const toc$ = cheerio.load(tocHtml);
  const fileNames = (await fs.readdir(sourceDir))
    .filter((name) => name.endsWith('.html'))
    .sort();

  const tocNodes = parseTocTree(toc$);
  attachClassEnumSections(tocNodes, fileNames);

  const sourceToRoute = new Map();
  assignRoutes(tocNodes, [], sourceToRoute);

  const pageTitleBySource = new Map();
  const pageDescriptionBySource = new Map();

  for (const name of fileNames) {
    const html = await fs.readFile(path.join(sourceDir, name), 'utf8');
    const $ = cheerio.load(html);
    const title = readTitle($) || stripHtml(name);
    const description = readDescription($);
    pageTitleBySource.set(name, title);
    if (description) {
      pageDescriptionBySource.set(name, description);
    }
  }

  for (const output of OUTPUTS) {
    await fs.rm(output.targetRoot, { force: true, recursive: true });
    await fs.mkdir(output.targetRoot, { recursive: true });
    await writeFile(path.join(output.targetRoot, 'index.mdx'), output.rootIndex);

    await writeTree(
      output,
      tocNodes,
      pageTitleBySource,
      pageDescriptionBySource,
      sourceToRoute,
      cheerio,
    );
  }
}

function parseTocTree($) {
  const rootList = $('nav.toc > ul > li > ul').first();
  return parseList($, rootList);
}

function parseList($, list) {
  return list
    .children('li')
    .toArray()
    .map((li) => parseItem($, $(li)))
    .filter(Boolean);
}

function parseItem($, item) {
  const anchor = item.children('a').first();
  const sourceName = anchor.length ? path.basename(anchor.attr('href')) : null;
  const title = normalizeText(
    anchor.length ? anchor.text() : item.children('span').first().text(),
  );
  const childrenList = item.children('ul').first();
  const children = childrenList.length ? parseList($, childrenList) : [];

  if (!title || !sourceName) {
    return null;
  }

  return {
    children,
    sourceName,
    title,
    type: 'page',
  };
}

function attachClassEnumSections(nodes, fileNames) {
  const index = nodes.findIndex((node) => node.sourceName === 'rtc_api_data_type.html');
  if (index === -1) {
    return;
  }

  const sectionChildren = CLASS_ENUM_SECTIONS.map((section) => ({
    bucket: section.bucket,
    children: fileNames
      .filter((name) => name.startsWith(section.prefix))
      .map((name) => ({
        children: [],
        sourceName: name,
        title: stripHtml(name),
        type: 'detail',
      })),
    sourceName: null,
    title: section.title,
    type: 'group',
  }));

  nodes[index].children = sectionChildren;
}

function assignRoutes(nodes, parentSegments, sourceToRoute) {
  for (const node of nodes) {
    if (node.type === 'group') {
      node.slug = node.bucket;
      node.routeSegments = [...parentSegments, node.slug, 'index'];
      assignRoutes(node.children, [...parentSegments, node.slug], sourceToRoute);
      continue;
    }

    const isFolder = node.children.length > 0;
    const slug = isFolder
      ? folderSlugForSource(node.sourceName)
      : pageSlugForSource(node.sourceName);

    node.slug = slug;
    node.routeSegments = isFolder
      ? [...parentSegments, slug, 'index']
      : [...parentSegments, slug];

    if (node.sourceName) {
      sourceToRoute.set(node.sourceName, node.routeSegments);
    }

    if (isFolder) {
      assignRoutes(node.children, [...parentSegments, slug], sourceToRoute);
    }
  }
}

async function writeTree(
  output,
  nodes,
  pageTitleBySource,
  pageDescriptionBySource,
  sourceToRoute,
  cheerio,
) {
  await writeJson(path.join(output.targetRoot, 'meta.json'), {
    title: 'Android API 参考',
    pages: ['index', ...nodes.map((node) => node.slug)],
  });

  for (const node of nodes) {
    await writeNode(
      output,
      node,
      pageTitleBySource,
      pageDescriptionBySource,
      sourceToRoute,
      cheerio,
    );
  }
}

async function writeNode(
  output,
  node,
  pageTitleBySource,
  pageDescriptionBySource,
  sourceToRoute,
  cheerio,
) {
  if (node.type === 'group') {
    const dir = path.join(output.targetRoot, ...node.routeSegments.slice(0, -1));
    await writeJson(path.join(dir, 'meta.json'), {
      title: node.title,
      pages: ['index', ...node.children.map((child) => child.slug)],
    });
    await writeFile(
      path.join(dir, 'index.mdx'),
      `---
title: ${escapeYaml(node.title)}
description: ${escapeYaml(`RTC Android ${node.title} 定义列表。`)}
---

本页汇总 RTC Android API 参考中的 ${node.title} 定义。`,
    );

    for (const child of node.children) {
      await writeNode(
        output,
        child,
        pageTitleBySource,
        pageDescriptionBySource,
        sourceToRoute,
        cheerio,
      );
    }
    return;
  }

  const html = await fs.readFile(path.join(sourceDir, node.sourceName), 'utf8');
  const $ = cheerio.load(html);

  if (node.children.length > 0) {
    const dir = path.join(output.targetRoot, ...node.routeSegments.slice(0, -1));
    await writeJson(path.join(dir, 'meta.json'), {
      title: pageTitleBySource.get(node.sourceName) ?? node.title,
      pages: ['index', ...node.children.map((child) => child.slug)],
    });
    await writeFile(
      path.join(dir, 'index.mdx'),
      renderPage({
        $,
        currentSource: node.sourceName,
        pageDescriptionBySource,
        pageTitleBySource,
        sourceToRoute,
        targetBasePath: output.targetBasePath,
      }),
    );

    for (const child of node.children) {
      await writeNode(
        output,
        child,
        pageTitleBySource,
        pageDescriptionBySource,
        sourceToRoute,
        cheerio,
      );
    }
    return;
  }

  const filePath = path.join(output.targetRoot, `${node.routeSegments.join('/')}.mdx`);
  await writeFile(
    filePath,
    renderPage({
      $,
      currentSource: node.sourceName,
      pageDescriptionBySource,
      pageTitleBySource,
      sourceToRoute,
      targetBasePath: output.targetBasePath,
    }),
  );
}

function renderPage({
  $,
  currentSource,
  pageTitleBySource,
  pageDescriptionBySource,
  sourceToRoute,
  targetBasePath,
}) {
  const pageTitle = pageTitleBySource.get(currentSource) ?? stripHtml(currentSource);
  const description = pageDescriptionBySource.get(currentSource);
  const body = $('main > article');
  const topTitle = body.find('> h1').first();
  const sections = [];

  const topDesc = body.find('> .body > .shortdesc').first().text().trim();
  if (topDesc && topDesc !== description) {
    sections.push(topDesc);
  }

  const directSections = body.find('> .body > section').toArray();
  for (const section of directSections) {
    const rendered = renderSection(
      $,
      $(section),
      pageTitleBySource,
      sourceToRoute,
      targetBasePath,
    );
    if (rendered) {
      sections.push(rendered);
    }
  }

  const nestedArticles = body.find('> article').toArray();
  for (const article of nestedArticles) {
    const rendered = renderNestedArticle(
      $,
      $(article),
      pageTitleBySource,
      sourceToRoute,
      targetBasePath,
    );
    if (rendered) {
      sections.push(rendered);
    }
  }

  if (sections.length === 0) {
    const fallback = renderChildren(
      $,
      body.find('> .body').first(),
      pageTitleBySource,
      sourceToRoute,
      targetBasePath,
    );
    if (fallback) {
      sections.push(fallback);
    }
  }

  const frontmatter = [
    '---',
    `title: ${escapeYaml(pageTitle)}`,
    description
      ? `description: ${escapeYaml(description)}`
      : 'description: RTC Android API 参考迁移页。',
    '---',
    '',
  ];

  if (topTitle.attr('id') && topTitle.attr('id') !== 'ariaid-title1') {
    sections.unshift(`<a id="${topTitle.attr('id')}"></a>`);
  }

  return `${frontmatter.join('\n')}${sections.filter(Boolean).join('\n\n')}\n`;
}

function renderNestedArticle(
  $,
  article,
  pageTitleBySource,
  sourceToRoute,
  targetBasePath,
) {
  const id = article.attr('id');
  const heading = article.find('> h2, > h3, > h4').first();
  const level = heading.is('h2') ? '##' : heading.is('h3') ? '###' : '####';
  const title = inlineText(heading);
  const content = [];

  if (id) {
    content.push(`<a id="${id}"></a>`);
  }
  if (title) {
    content.push(`${level} ${title}`);
  }

  const shortdesc = article.find('> .body > .shortdesc').first().text().trim();
  if (shortdesc) {
    content.push(shortdesc);
  }

  for (const node of article.find('> .body > *').toArray()) {
    if ($(node).is('.shortdesc')) {
      continue;
    }
    const rendered = renderElement(
      $,
      $(node),
      pageTitleBySource,
      sourceToRoute,
      targetBasePath,
      headingDepth(level) + 1,
    );
    if (rendered) {
      content.push(rendered);
    }
  }

  for (const nested of article.find('> article').toArray()) {
    const rendered = renderNestedArticle(
      $,
      $(nested),
      pageTitleBySource,
      sourceToRoute,
      targetBasePath,
    );
    if (rendered) {
      content.push(rendered);
    }
  }

  const related = renderRelatedLinks(
    $,
    article.find('> nav.related-links').first(),
    pageTitleBySource,
    sourceToRoute,
    targetBasePath,
  );
  if (related) {
    content.push(related);
  }

  return content.join('\n\n').trim();
}

function renderSection(
  $,
  section,
  pageTitleBySource,
  sourceToRoute,
  targetBasePath,
  depth = 2,
) {
  const id = section.attr('id');
  const heading = section.find('> h2, > h3, > h4').first();
  const title = inlineText(heading);
  const parts = [];

  if (id) {
    parts.push(`<a id="${id}"></a>`);
  }
  if (title) {
    parts.push(`${'#'.repeat(depth)} ${title}`);
  }

  const directList = section.find('> ul').first();
  if (
    directList.length > 0 &&
    directList.find('> li > a').length > 0 &&
    directList.siblings().filter('ul').length === 0
  ) {
    const renderedList = renderList(
      $,
      directList,
      pageTitleBySource,
      sourceToRoute,
      targetBasePath,
      false,
      { preferInlineOnly: true },
    );
    if (renderedList) {
      parts.push(renderedList);
    }
    return parts.join('\n\n').trim();
  }

  const rendered = renderChildren(
    $,
    section,
    pageTitleBySource,
    sourceToRoute,
    targetBasePath,
    depth,
  );
  if (rendered) {
    parts.push(rendered);
  }

  return parts.join('\n\n').trim();
}

function renderChildren(
  $,
  parent,
  pageTitleBySource,
  sourceToRoute,
  targetBasePath,
  depth = 2,
) {
  const parts = [];
  let inlineParts = [];

  const flushInline = () => {
    if (inlineParts.length === 0) {
      return;
    }
    parts.push(normalizeInlineFlow(inlineParts.join(' ')));
    inlineParts = [];
  };

  for (const node of parent.contents().toArray()) {
    if (node.type === 'text') {
      const text = escapeInlineText(normalizeText($(node).text()));
      if (text) {
        inlineParts.push(text);
      }
      continue;
    }

    const element = $(node);
    if (
      element.is('h1, h2, h3, h4, h5, h6') ||
      element.is('.shortdesc') ||
      element.is('nav.related-links')
    ) {
      continue;
    }

    if (isInlineElement(element)) {
      const rendered = renderInlineElement(
        $,
        element,
        pageTitleBySource,
        sourceToRoute,
        targetBasePath,
      );
      if (rendered) {
        inlineParts.push(rendered);
      }
      continue;
    }

    flushInline();

    const rendered = renderElement(
      $,
      element,
      pageTitleBySource,
      sourceToRoute,
      targetBasePath,
      depth,
    );
    if (rendered) {
      parts.push(rendered);
    }
  }

  flushInline();

  return parts.join('\n\n').trim();
}

function renderElement(
  $,
  element,
  pageTitleBySource,
  sourceToRoute,
  targetBasePath,
  depth = 2,
) {
  if (
    element.is('div') &&
    element.find('> ul, > ol, > table, > dl, > pre, > div.note, > section').length > 0
  ) {
    return renderChildren(
      $,
      element,
      pageTitleBySource,
      sourceToRoute,
      targetBasePath,
      depth,
    );
  }

  if (element.is('p')) {
    return inlineChildren(
      $,
      element,
      pageTitleBySource,
      sourceToRoute,
      targetBasePath,
    );
  }

  if (element.is('ul')) {
    return renderList(
      $,
      element,
      pageTitleBySource,
      sourceToRoute,
      targetBasePath,
      false,
    );
  }

  if (element.is('ol')) {
    return renderList(
      $,
      element,
      pageTitleBySource,
      sourceToRoute,
      targetBasePath,
      true,
    );
  }

  if (element.is('section')) {
    const heading = element.find('> h2, > h3, > h4').first();
    const childDepth = heading.is('h4') ? 4 : heading.is('h3') ? 3 : 2;
    return renderSection(
      $,
      element,
      pageTitleBySource,
      sourceToRoute,
      targetBasePath,
      Math.max(depth, childDepth),
    );
  }

  if (element.is('pre')) {
    return renderCodeBlock(element);
  }

  if (element.is('div.note')) {
    return renderNote(
      $,
      element,
      pageTitleBySource,
      sourceToRoute,
      targetBasePath,
    );
  }

  if (element.is('div.codeblock')) {
    return renderCodeBlock(element.find('pre').first());
  }

  if (element.is('table')) {
    return renderTable(
      $,
      element,
      pageTitleBySource,
      sourceToRoute,
      targetBasePath,
    );
  }

  if (element.is('dl')) {
    return renderDefinitionList(
      $,
      element,
      pageTitleBySource,
      sourceToRoute,
      targetBasePath,
      depth + 1,
    );
  }

  if (element.is('article')) {
    return renderNestedArticle(
      $,
      element,
      pageTitleBySource,
      sourceToRoute,
      targetBasePath,
    );
  }

  if (element.is('nav.related-links')) {
    return renderRelatedLinks(
      $,
      element,
      pageTitleBySource,
      sourceToRoute,
      targetBasePath,
    );
  }

  const text = inlineChildren(
    $,
    element,
    pageTitleBySource,
    sourceToRoute,
    targetBasePath,
  );
  return text || '';
}

function renderDefinitionList(
  $,
  dl,
  pageTitleBySource,
  sourceToRoute,
  targetBasePath,
  depth = 3,
) {
  const rows = [];
  const children = dl.children().toArray();
  let currentTerm = '';

  for (const child of children) {
    const node = $(child);
    if (node.is('dt')) {
      currentTerm = inlineChildren(
        $,
        node,
        pageTitleBySource,
        sourceToRoute,
        targetBasePath,
      );
      continue;
    }
    if (node.is('dd')) {
      const value = renderChildren(
        $,
        node,
        pageTitleBySource,
        sourceToRoute,
        targetBasePath,
        depth + 1,
      );
      if (currentTerm) {
        rows.push(`${'#'.repeat(depth)} \`${currentTerm}\``);
        if (value) {
          rows.push(value);
        }
      } else if (value) {
        rows.push(value);
      }
      currentTerm = '';
    }
  }

  return rows.join('\n\n');
}

function renderTable($, table, pageTitleBySource, sourceToRoute, targetBasePath) {
  const rows = table.find('> thead > tr, > tbody > tr, > tr').toArray();
  if (rows.length === 0) {
    return '';
  }

  const matrix = rows.map((row) =>
    $(row)
      .find('> th, > td')
      .toArray()
      .map((cell) =>
        inlineChildren(
          $,
          $(cell),
          pageTitleBySource,
          sourceToRoute,
          targetBasePath,
        )
          .replace(/\n+/g, '<br />')
          .replace(/\|/g, '\\|')
          .trim(),
      ),
  );

  const width = Math.max(...matrix.map((row) => row.length));
  const normalized = matrix.map((row) => {
    const cells = [...row];
    while (cells.length < width) {
      cells.push('');
    }
    return cells;
  });

  const header = normalized[0];
  const divider = new Array(width).fill('---');
  const lines = [
    `| ${header.join(' | ')} |`,
    `| ${divider.join(' | ')} |`,
  ];

  for (const row of normalized.slice(1)) {
    lines.push(`| ${row.join(' | ')} |`);
  }

  return lines.join('\n');
}

function renderNote(
  $,
  note,
  pageTitleBySource,
  sourceToRoute,
  targetBasePath,
) {
  const className = note.attr('class') ?? '';
  const type = className.includes('attention')
    ? 'warning'
    : className.includes('caution')
      ? 'warning'
      : className.includes('danger')
        ? 'error'
        : 'info';
  const title = note.find('> .note__title').first().text().trim().replace(/：$/, '');
  const bodyParts = [];
  let inlineParts = [];

  const flushInline = () => {
    if (inlineParts.length === 0) {
      return;
    }
    bodyParts.push(normalizeInlineFlow(inlineParts.join(' ')));
    inlineParts = [];
  };

  for (const child of note.contents().toArray()) {
    const element = $(child);
    if (element.is('.note__title')) {
      continue;
    }
    if (child.type === 'text') {
      const text = normalizeText($(child).text());
      if (text) {
        inlineParts.push(text);
      }
      continue;
    }
    if (isInlineElement(element)) {
      const rendered = renderInlineElement(
        $,
        element,
        pageTitleBySource,
        sourceToRoute,
        targetBasePath,
      );
      if (rendered) {
        inlineParts.push(rendered);
      }
      continue;
    }
    flushInline();
    const rendered = renderElement(
      $,
      element,
      pageTitleBySource,
      sourceToRoute,
      targetBasePath,
    );
    if (rendered) {
      bodyParts.push(rendered);
    }
  }
  flushInline();

  const label = title || undefined;
  return `:::${type}${label ? `[${label}]` : ''}\n${bodyParts.join('\n\n')}\n:::`;
}

function renderCodeBlock(pre) {
  if (!pre || pre.length === 0) {
    return '';
  }
  const classAttr = pre.attr('class') ?? '';
  const lang =
    classAttr.match(/language-([a-z0-9+-]+)/i)?.[1]?.toLowerCase() ?? 'text';
  const code = decodeHtml(pre.text()).trimEnd();
  return `\`\`\`${lang}\n${code}\n\`\`\``;
}

function renderRelatedLinks(
  $,
  nav,
  pageTitleBySource,
  sourceToRoute,
  targetBasePath,
) {
  if (!nav || nav.length === 0) {
    return '';
  }
  const title = nav.find('strong').first().text().trim();
  const items = nav.find('li > a').toArray();
  if (items.length === 0) {
    return '';
  }

  const lines = title ? [`### ${title}`] : [];
  for (const anchor of items) {
    const link = renderAnchor(
      $(anchor),
      pageTitleBySource,
      sourceToRoute,
      targetBasePath,
    );
    if (link) {
      lines.push(`- ${link}`);
    }
  }
  return lines.join('\n');
}

function renderList(
  $,
  list,
  pageTitleBySource,
  sourceToRoute,
  targetBasePath,
  ordered,
  options = {},
) {
  const items = [];
  let index = 1;
  for (const li of list.find('> li').toArray()) {
    const inlineParts = [];
    const blockParts = [];
    for (const child of $(li).contents().toArray()) {
      const element = $(child);
      if (child.type === 'text') {
        const text = escapeInlineText(normalizeText($(child).text()));
        if (text) {
          inlineParts.push(text);
        }
        continue;
      }
      let rendered = '';
      if (options.preferInlineOnly && !element.is('ul, ol')) {
        rendered = element.is('a')
          ? renderAnchor(
              element,
              pageTitleBySource,
              sourceToRoute,
              targetBasePath,
            )
          : inlineChildren(
              $,
              element,
              pageTitleBySource,
              sourceToRoute,
              targetBasePath,
            );
      } else {
        rendered = element.is('ul, ol')
          ? renderList(
              $,
              element,
              pageTitleBySource,
              sourceToRoute,
              targetBasePath,
              element.is('ol'),
              options,
            )
          : renderElement(
              $,
              element,
              pageTitleBySource,
              sourceToRoute,
              targetBasePath,
            );
      }
      if (rendered) {
        if (element.is('ul, ol')) {
          blockParts.push(rendered);
        } else {
          inlineParts.push(rendered);
        }
      }
    }
    const inlineContent = normalizeInlineFlow(inlineParts.join(' '));
    if (!inlineContent && blockParts.length === 0) {
      continue;
    }
    const marker = ordered ? `${index}.` : '-';
    if (blockParts.length === 0) {
      items.push(`${marker} ${inlineContent}`);
    } else {
      const nested = blockParts
        .map((part) =>
          part
            .split('\n')
            .map((line) => (line ? `  ${line}` : line))
            .join('\n'),
        )
        .join('\n');
      items.push([`${marker} ${inlineContent}`.trim(), nested].join('\n'));
    }
    index += 1;
  }
  return items.join('\n');
}

function renderInlineElement(
  $,
  element,
  pageTitleBySource,
  sourceToRoute,
  targetBasePath,
) {
  if (element.is('a')) {
    return renderAnchor(
      element,
      pageTitleBySource,
      sourceToRoute,
      targetBasePath,
    );
  }
  if (element.is('code')) {
    return `\`${decodeHtml(element.text()).trim()}\``;
  }
  if (element.is('strong, b')) {
    const text = inlineChildren(
      $,
      element,
      pageTitleBySource,
      sourceToRoute,
      targetBasePath,
    );
    return text ? `**${text}**` : '';
  }
  if (element.is('em, i')) {
    const text = inlineChildren(
      $,
      element,
      pageTitleBySource,
      sourceToRoute,
      targetBasePath,
    );
    return text ? `*${text}*` : '';
  }
  if (element.is('br')) {
    return '<br />';
  }

  return inlineChildren(
    $,
    element,
    pageTitleBySource,
    sourceToRoute,
    targetBasePath,
  );
}

function inlineChildren(
  $,
  node,
  pageTitleBySource,
  sourceToRoute,
  targetBasePath,
) {
  const parts = [];
  for (const child of node.contents().toArray()) {
    if (child.type === 'text') {
      const text = escapeInlineText(normalizeText($(child).text()));
      if (text) {
        parts.push(text);
      }
      continue;
    }

    const element = $(child);
    const text = renderInlineElement(
      $,
      element,
      pageTitleBySource,
      sourceToRoute,
      targetBasePath,
    );
    if (text) {
      parts.push(text);
    }
  }

  return normalizeInlineFlow(parts.join(' '));
}

function renderAnchor(anchor, pageTitleBySource, sourceToRoute, targetBasePath) {
  const href = anchor.attr('href')?.trim() ?? '';
  const label = inlineText(anchor) || href;
  if (!href) {
    return label;
  }

  if (href.startsWith('http://') || href.startsWith('https://')) {
    return `[${label}](${href})`;
  }

  const [filePart, hashPart] = href.split('#');
  if (!filePart) {
    return `[${label}](#${hashPart})`;
  }

  const sourceName = path.basename(filePart);
  const routeSegments = sourceToRoute.get(sourceName);
  if (!routeSegments) {
    return `[${label}](${href})`;
  }

  return `[${label}](${routeSegmentsToDocPath(routeSegments, targetBasePath)}${
    hashPart ? `#${hashPart}` : ''
  })`;
}

function routeSegmentsToDocPath(routeSegments, targetBasePath) {
  const clean = [...routeSegments];
  if (clean.at(-1) === 'index') {
    clean.pop();
  }
  return clean.length === 0
    ? targetBasePath
    : `${targetBasePath}/${clean.join('/')}`;
}

function readTitle($) {
  return normalizeText(
    $('main > article > h1, main > article article > h1, main > article article > h2')
      .first()
      .text(),
  );
}

function readDescription($) {
  const desc = $('main > article > .body > .shortdesc').first().text().trim();
  if (desc) {
    return normalizeText(desc);
  }
  const metaDesc = $('meta[name="description"]').attr('content');
  return metaDesc ? normalizeText(metaDesc) : '';
}

function folderSlugForSource(sourceName) {
  return (
    FOLDER_SLUG_OVERRIDES.get(sourceName) ??
    toKebab(stripHtml(sourceName).replace(/^toc_/, ''))
  );
}

function pageSlugForSource(sourceName) {
  return (
    PAGE_SLUG_OVERRIDES.get(sourceName) ??
    toKebab(stripHtml(sourceName).replace(/^toc_/, ''))
  );
}

function headingDepth(level) {
  return level.length;
}

function stripHtml(name) {
  return name.replace(/\.html$/, '');
}

function toKebab(value) {
  return value
    .replace(/_/g, '-')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[^a-zA-Z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

function normalizeText(value) {
  return decodeHtml(value).replace(/\s+/g, ' ').trim();
}

function normalizeInline(value) {
  return value
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

function normalizeInlineFlow(value) {
  return normalizeInline(value)
    .replace(/\s+([，。！？：；、,.!?;:)\]}>])/g, '$1')
    .replace(/([([{<【（《])\s+/g, '$1')
    .replace(/` ([，。！？：；、,.!?;:])/g, '`$1')
    .replace(/\[([^\]]+)\]\(([^)]+)\)\s+([，。！？：；、,.!?;:])/g, '[$1]($2)$3')
    .replace(/([。！？；：])\[/g, '$1 [')
    .replace(/([A-Za-z0-9`）】》])\[/g, '$1 [')
    .replace(/`([^`]+)`\s+([A-Za-z0-9_]+)/g, '`$1` $2');
}

function isInlineElement(element) {
  return element.is(
    'a, span, code, strong, b, em, i, br, sub, sup, small, mark, s, u',
  );
}

function inlineText(node) {
  return escapeInlineText(normalizeInline(decodeHtml(node.text())));
}

function decodeHtml(value) {
  return value
    .replace(/\u00a0/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

function escapeInlineText(value) {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\{/g, '\\{')
    .replace(/\}/g, '\\}');
}

function escapeYaml(value) {
  return `"${String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

async function writeJson(filePath, data) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

async function writeFile(filePath, contents) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, contents, 'utf8');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
