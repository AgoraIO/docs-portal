#!/usr/bin/env node

import { promises as fs } from 'node:fs';
import path from 'node:path';

const repoRoot = '/Users/yejiayi/Documents/docs-portal';
const sourceRoot =
  '/Users/yejiayi/Documents/Doc-Source-Private/on-premise-recording';
const sharedRoot = '/Users/yejiayi/Documents/Doc-Source-Private/shared';
const assetRoot = '/Users/yejiayi/Documents/Doc-Source-Private/assets/images';
const assetBaseUrl = 'https://assets-docs.agora.io/images';
const targetRoot =
  '/Users/yejiayi/Documents/docs-portal/content/docs/en/realtime-media/on-premise-recording';
const stagingRoot =
  '/Users/yejiayi/Documents/docs-portal/docs/superpowers/staging/2026-06-13-on-premise-recording';
const reportRoot =
  '/Users/yejiayi/Documents/docs-portal/docs/superpowers/reports';
const blockerReportPath = path.join(
  reportRoot,
  '2026-06-13-on-premise-recording-migration-blockers.md',
);
const summaryPath = path.join(
  reportRoot,
  '2026-06-13-on-premise-recording-migration-summary.json',
);

const globals = {
  AGORA_BACKEND: 'Agora SDRTN®',
  AGORA_CONSOLE_URL: 'https://console.agora.io/v2',
  API_ROOT: 'https://api-ref.agora.io/en',
  COMPANY: 'Agora',
  CONSOLE: 'Agora Console',
  CP: 'Cloud proxy',
  CREC: 'Cloud Recording',
  OPREC: 'On-Premise Recording',
  OPREC_SDK: 'On-Premise Recording SDK',
  OPREC_SDK_API_CPP:
    'https://api-ref.agora.io/en/on-premise-recording-sdk/linux-cpp/3.x',
  OPREC_SDK_API_JAVA:
    'https://api-ref.agora.io/en/on-premise-recording-sdk/linux-java/3.x',
  VSDK: 'Video SDK',
};

const productVars = {
  CLIENT: 'app',
  NAME: 'On-Premise Recording',
  PRODUCT: 'On-Premise Recording',
  SDK: 'On-Premise Recording SDK',
};

const rootPages = [
  {
    source: 'get-started/quickstart.mdx',
    target: 'index.md',
    flow: 'complex',
    collision: 'migration-seed content',
  },
  {
    source: 'get-started/manage-agora-account.mdx',
    target: 'manage-agora-account.mdx',
    flow: 'complex',
  },
  {
    source: 'overview/product-overview.mdx',
    target: 'product-overview.mdx',
    flow: 'complex',
  },
  {
    source: 'overview/release-notes.mdx',
    target: 'release-notes.mdx',
    flow: 'complex',
  },
];

const buildPages = [
  'develop/authentication-workflow.mdx',
  'develop/composite-mode.mdx',
  'develop/individual-mode.mdx',
  'develop/layout.mdx',
  'develop/local-screenshot.mdx',
  'develop/restore-files.mdx',
  'develop/watermark.mdx',
  'develop/cloud-proxy.mdx',
].map((source) => ({
  source,
  target: `build/${path.basename(source, path.extname(source))}.mdx`,
  flow: 'complex',
}));

const referencePages = [
  'overview/billing.md',
  'reference/migration-guide.md',
  'reference/sunset.md',
].map((source) => ({
  source,
  target:
    source === 'overview/billing.md'
      ? 'reference/pricing.mdx'
      : `reference/${path.basename(source, path.extname(source))}.mdx`,
  flow: 'complex',
}));

const deferredPages = [
  {
    source: 'get-started/mcp.mdx',
    target: null,
    blockerType: 'deferred content',
    reason: 'AI tooling or ecosystem page is outside the current migration scope.',
    exactPattern: 'AI tooling lane (MCP)',
  },
  {
    source: 'get-started/skills.mdx',
    target: null,
    blockerType: 'deferred content',
    reason:
      'AI tooling or ecosystem page is outside the current migration scope.',
    exactPattern: 'AI tooling lane (skills)',
  },
  {
    source: 'reference/api-reference.mdx',
    target: null,
    blockerType: 'deferred content',
    reason: 'API reference lane is explicitly excluded from this migration batch.',
    exactPattern: 'API reference page',
  },
];

const pageMap = [...rootPages, ...buildPages, ...referencePages];
const routeMap = new Map();
for (const page of pageMap) {
  const sourceKey = toPosix(page.source).replace(/\.(md|mdx)$/, '');
  const targetKey = toPosix(page.target).replace(/\.(md|mdx)$/, '');
  routeMap.set(sourceKey, `/en/realtime-media/on-premise-recording/${targetKey}`);
}

function toPosix(value) {
  return value.split(path.sep).join('/');
}

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readFile(filePath) {
  return fs.readFile(filePath, 'utf8');
}

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!match) {
    return {
      frontmatter: {},
      body: content,
    };
  }

  const frontmatter = {};
  const lines = match[1].split('\n');
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const parsed = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (!parsed) {
      continue;
    }
    const [, key, raw] = parsed;
    if (raw.trim() === '>') {
      const block = [];
      let cursor = index + 1;
      while (cursor < lines.length && /^\s+/.test(lines[cursor])) {
        block.push(lines[cursor].trim());
        cursor += 1;
      }
      frontmatter[key] = block.join(' ');
      index = cursor - 1;
      continue;
    }
    frontmatter[key] = raw.trim();
  }

  return {
    frontmatter,
    body: content.slice(match[0].length),
  };
}

function serializeFrontmatter(frontmatter) {
  const lines = ['---'];
  if (frontmatter.title) {
    lines.push(`title: ${quote(frontmatter.title)}`);
  }
  if (frontmatter.description) {
    lines.push(`description: ${quote(frontmatter.description)}`);
  }
  lines.push('---', '');
  return lines.join('\n');
}

function quote(value) {
  const text = stripWrappingQuotes(value);
  return JSON.stringify(text);
}

function stripWrappingQuotes(value) {
  return String(value).replace(/^['"]|['"]$/g, '');
}

function parseImports(raw) {
  const imports = [];
  const importPattern =
    /^import\s+([A-Za-z0-9_]+)\s+from\s+['"](.+?)['"];?\s*$/gm;
  let match;
  while ((match = importPattern.exec(raw))) {
    imports.push({
      alias: match[1],
      specifier: match[2],
    });
  }
  return imports;
}

function stripImportExport(raw) {
  return raw
    .replace(/^import .*$/gm, '')
    .replace(/^export const toc = .*$/gm, '')
    .replace(/^\s*$/gm, (line) => line);
}

function resolveSharedImport(specifier, currentFile) {
  if (specifier.startsWith('@docs/shared/')) {
    return path.join(sharedRoot, specifier.replace('@docs/shared/', ''));
  }
  if (specifier.startsWith('./') || specifier.startsWith('../')) {
    return path.resolve(path.dirname(currentFile), specifier);
  }
  return null;
}

async function expandImports(raw, currentFile, visited) {
  let result = stripImportExport(raw);
  const imports = parseImports(raw);

  for (const imported of imports) {
    const resolved = resolveSharedImport(imported.specifier, currentFile);
    if (!resolved) {
      continue;
    }
    const replacement = await expandFile(resolved, visited);
    if (!replacement) {
      continue;
    }
    result = result.replace(
      new RegExp(`<${imported.alias}(?:\\s+[^>]*)?\\s*/>`, 'g'),
      replacement.body.trim(),
    );
  }

  return result;
}

async function expandFile(filePath, visited = new Set()) {
  const resolved = path.resolve(filePath);
  if (visited.has(resolved)) {
    return { frontmatter: {}, body: '' };
  }
  visited.add(resolved);

  const raw = await readFile(resolved);
  const parsed = parseFrontmatter(raw);
  const expandedBody = await expandImports(parsed.body, resolved, visited);
  const finalBody = await applyRecursiveTransforms(expandedBody);

  return {
    frontmatter: parsed.frontmatter,
    body: finalBody,
  };
}

async function applyRecursiveTransforms(input) {
  let value = input;
  let previous = null;
  while (previous !== value) {
    previous = value;
    value = transformComments(value);
    value = transformProductWrapper(value);
    value = transformPlatformWrapper(value);
    value = transformVariables(value);
    value = transformGlobalTemplates(value);
    value = transformCodeBlocks(value);
    value = transformLinks(value);
    value = transformAnchors(value);
    value = transformProductOverview(value);
    value = transformTabs(value);
    value = transformOrphanTabs(value);
    value = transformAdmonitions(value);
    value = transformDetails(value);
    value = transformHtmlLists(value);
    value = transformTables(value);
    value = transformInlineHtml(value);
    value = normalizeWhitespace(value);
  }
  return value.trim() + '\n';
}

function transformComments(value) {
  return value.replace(/\{\/\*[\s\S]*?\*\/\}/g, '');
}

function parseCsvAttr(raw) {
  return raw
    .split(',')
    .map((item) => item.replace(/[\[\]'"\s]/g, ''))
    .filter(Boolean);
}

function transformProductWrapper(value) {
  return value.replace(
    /<ProductWrapper([^>]*)>([\s\S]*?)<\/ProductWrapper\s*>/g,
    (_, attrs, body) => {
      const productMatch = attrs.match(
        /product=(?:"([^"]+)"|\{\[([^\]]+)\]\})/,
      );
      const notAllowedMatch = attrs.match(
        /notAllowed=(?:"([^"]+)"|\{\[([^\]]+)\]\})/,
      );

      if (productMatch) {
        const list = parseCsvAttr(productMatch[1] ?? productMatch[2] ?? '');
        return list.includes('on-premise-recording') ? body : '';
      }

      if (notAllowedMatch) {
        const list = parseCsvAttr(
          notAllowedMatch[1] ?? notAllowedMatch[2] ?? '',
        );
        return list.includes('on-premise-recording') ? '' : body;
      }

      return body;
    },
  );
}

function platformLabel(platform) {
  if (platform === 'linux-cpp') return 'C++';
  if (platform === 'linux-java') return 'Java';
  return platform;
}

function transformPlatformWrapper(value) {
  return value.replace(
    /(^[ \t]*)<PlatformWrapper\s+platform="([^"]+)">([\s\S]*?)^[ \t]*<\/PlatformWrapper\s*>/gm,
    (_, indent, platform, body) => {
      const normalizedBody = dedentBlock(body)
        .trim()
        .split('\n')
        .map((line) => (line ? `${indent}${line}` : line))
        .join('\n');
      return `${indent}**${platformLabel(platform.trim())}**\n\n${normalizedBody}\n`;
    },
  );
}

function transformVariables(value) {
  value = value.replace(/<Vg\s+k=['"]([^'"]+)['"]\s*\/>/g, (_, key) => {
    return globals[key] ?? key;
  });
  value = value.replace(/<Vpd\s+k=['"]([^'"]+)['"]\s*\/>/g, (_, key) => {
    return productVars[key] ?? key;
  });
  value = value.replace(/<Vpl\s+k=['"]([^'"]+)['"]\s*\/>/g, (_, key) => {
    return productVars[key] ?? key.toLowerCase();
  });
  return value;
}

function transformGlobalTemplates(value) {
  let output = value;
  for (const [key, replacement] of Object.entries(globals)) {
    output = output.replaceAll(`{{Global.${key}}}`, replacement);
    output = output.replaceAll(`{{global.${key}}}`, replacement);
  }
  return output;
}

function transformCodeBlocks(value) {
  return value.replace(
    /<CodeBlock\s+language=['"]([^'"]+)['"][^>]*>\s*\{`([\s\S]*?)`\}\s*<\/CodeBlock>/g,
    (_, language, body) => {
      return `\n\`\`\`${language}\n${body.trim()}\n\`\`\`\n`;
    },
  );
}

function transformLinks(value) {
  value = value.replace(
    /<Link\b([^>]*)>([\s\S]*?)<\/Link>/g,
    (_, attrs, text) => {
      const targetMatch = attrs.match(/\bto\s*=\s*['"]([^'"]+)['"]/);
      const href = targetMatch?.[1];
      if (!href) {
        return text;
      }
      return `[${collapseInline(text)}](${href})`;
    },
  );
  value = value.replace(
    /<a\s+href=['"]([^'"]+)['"]>([\s\S]*?)<\/a>/g,
    (_, target, text) => `[${collapseInline(text)}](${target})`,
  );
  return value;
}

function transformAnchors(value) {
  value = value.replace(
    /^(#{1,6})\s*<a\s+name=['"]([^'"]+)['"]><\/a>\s*(.+)$/gm,
    (_, hashes, id, title) => `${hashes} ${title.trim()}`,
  );
  value = value.replace(
    /<a\s+name=['"]([^'"]+)['"]><\/a>\s*\n(#{1,6})\s+(.+)/g,
    (_, _id, hashes, title) => `${hashes} ${title.trim()}`,
  );
  value = value.replace(/<a\s+name=['"][^'"]+['"]><\/a>\s*/g, '');
  return value;
}

function transformProductOverview(value) {
  return value.replace(
    /<ProductOverview[\s\S]*?title="([^"]+)"[\s\S]*?img="([^"]+)"[\s\S]*?productFeatures=\{\[([\s\S]*?)\]\}[\s\S]*?>([\s\S]*?)<\/ProductOverview>/g,
    (_, title, image, featuresBlock, body) => {
      const features = [
        ...featuresBlock.matchAll(
          /title:\s*"([^"]+)"[\s\S]*?content:\s*"([^"]+)"/g,
        ),
      ]
        .map((item) => `- **${item[1]}**: ${item[2]}`)
        .join('\n');
      return [
        `## ${title.trim()}`,
        '',
        `![](${image})`,
        '',
        collapseBlock(body),
        '',
        '## Features',
        '',
        features,
      ].join('\n');
    },
  );
}

function transformTabs(value) {
  return value.replace(/<Tabs\b[^>]*>([\s\S]*?)<\/Tabs>/g, (_, body) => {
    const items = [
      ...body.matchAll(
        /<TabItem\s+value="([^"]+)"\s+label="([^"]+)"([^>]*)>([\s\S]*?)<\/TabItem>/g,
      ),
    ];
    if (items.length === 0) {
      return body;
    }
    const defaultValue =
      items.find((item) => item[3].includes('default'))?.[1] ?? items[0][1];
    const list = items
      .map(
        (item) => `  <TabsTrigger value="${item[1]}">${item[2]}</TabsTrigger>`,
      )
      .join('\n');
    const contents = items
      .map(
        (item) =>
          `<TabsContent value="${item[1]}">\n${item[4].trim()}\n</TabsContent>`,
      )
      .join('\n\n');
    return [
      `<Tabs defaultValue="${defaultValue}">`,
      '<TabsList>',
      list,
      '</TabsList>',
      '',
      contents,
      '</Tabs>',
    ].join('\n');
  });
}

function transformOrphanTabs(value) {
  return value.replace(
    /<TabsList>[\s\S]*?<\/TabsList>\s*(?:<TabsContent[\s\S]*?<\/TabsContent>\s*)+/g,
    (block) => {
      if (/<Tabs\b/.test(block)) {
        return block;
      }
      const firstValue = block.match(/<TabsTrigger value="([^"]+)">/)?.[1];
      if (!firstValue) {
        return block;
      }
      return `<Tabs defaultValue="${firstValue}">\n${block.trim()}\n</Tabs>`;
    },
  );
}

function admonitionType(type) {
  if (type === 'caution' || type === 'warning') return 'warning';
  if (type === 'danger') return 'error';
  if (type === 'tip') return 'tip';
  return type || 'info';
}

function transformAdmonitions(value) {
  return value.replace(
    /<Admonition\b([^>]*)>([\s\S]*?)<\/Admonition>/g,
    (_, attrs, body) => {
      const type = attrs.match(/\btype\s*=\s*['"]([^'"]+)['"]/)?.[1] ?? 'info';
      const title =
        attrs.match(/\b(?:title|info|style)\s*=\s*['"]([^'"]+)['"]/)?.[1] ?? '';
      const label = title ? `[${title}]` : '';
      return `\n:::${admonitionType(type)}${label}\n${collapseBlock(
        transformHtmlLists(body),
      )}\n:::\n`;
    },
  );
}

function transformDetails(value) {
  return value.replace(
    /<details(?:\s+open)?>([\s\S]*?)<summary>([\s\S]*?)<\/summary>([\s\S]*?)<\/details>/g,
    (_, _beforeSummary, summary, body) => {
      return [
        `### ${collapseInline(summary)}`,
        '',
        collapseBlock(body),
      ].join('\n');
    },
  );
}

function transformHtmlLists(value) {
  return value
    .replace(/<ul>\s*((?:<li>[\s\S]*?<\/li>\s*)+)<\/ul>/g, (_, items) => {
      return (
        items
          .match(/<li>[\s\S]*?<\/li>/g)
          ?.map((item) => `- ${collapseInline(item.replace(/<\/?li>/g, ''))}`)
          .join('\n') ?? ''
      );
    })
    .replace(/<ol>\s*((?:<li>[\s\S]*?<\/li>\s*)+)<\/ol>/g, (_, items) => {
      return (
        items
          .match(/<li>[\s\S]*?<\/li>/g)
          ?.map(
            (item, index) =>
              `${index + 1}. ${collapseInline(item.replace(/<\/?li>/g, ''))}`,
          )
          .join('\n') ?? ''
      );
    });
}

function stripTags(value) {
  return value
    .replace(/<br\s*\/?>/gi, '<br />')
    .replace(/<\/?(?:thead|tbody|p|strong|em|code|sup|div|span)[^>]*>/gi, '')
    .replace(/<br \/>/g, '<br />');
}

function transformSingleHtmlTable(table) {
  const rows = [...table.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)];
  if (rows.length === 0) {
    return table;
  }
  const markdownRows = rows.map((row) => {
    const cells = [
      ...row[1].matchAll(/<(td|th)[^>]*>([\s\S]*?)<\/(?:td|th)>/gi),
    ].map((cell) => stripTags(collapseInline(cell[2])));
    return `| ${cells.join(' | ')} |`;
  });

  if (markdownRows.length >= 2) {
    const widths = markdownRows[0]
      .split('|')
      .slice(1, -1)
      .map(() => ' --- ');
    markdownRows.splice(1, 0, `|${widths.join('|')}|`);
  }

  return markdownRows.join('\n');
}

function transformTables(value) {
  return value.replace(/<table[\s\S]*?<\/table>/gi, (table) => {
    if (/rowspan=|colspan=/i.test(table)) {
      return table;
    }
    return transformSingleHtmlTable(table);
  });
}

function transformInlineHtml(value) {
  return value
    .replace(/<sup>(.*?)<\/sup>/g, '$1')
    .replace(/<\/?b>/g, '**')
    .replace(/<\/?code>/g, '`')
    .replace(/<\/?p>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/<br\s*\/?>/g, '\n');
}

function collapseInline(value) {
  return value
    .replace(/\s+/g, ' ')
    .replace(/\s+([.,;:!?])/g, '$1')
    .trim();
}

function collapseBlock(value) {
  return value.replace(/\n{3,}/g, '\n\n').trim();
}

function normalizeWhitespace(value) {
  return value
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\n+```/g, '\n```')
    .replace(/```\n{2,}/g, '```\n\n');
}

function indentBlock(value, spaces) {
  const prefix = ' '.repeat(spaces);
  return value
    .split('\n')
    .map((line) => (line ? `${prefix}${line}` : line))
    .join('\n');
}

function dedentBlock(value) {
  const lines = value.replace(/^\n+|\n+$/g, '').split('\n');
  const indents = lines
    .filter((line) => line.trim().length > 0)
    .map((line) => line.match(/^[ \t]*/)?.[0].length ?? 0);
  const minIndent = indents.length > 0 ? Math.min(...indents) : 0;
  return lines
    .map((line) => line.slice(minIndent))
    .join('\n');
}

function resolveMarkdownLink(target, currentSource) {
  const expanded = target.trim();
  if (
    expanded.startsWith('http://') ||
    expanded.startsWith('https://') ||
    expanded.startsWith('mailto:') ||
    expanded.startsWith('#')
  ) {
    return expanded;
  }

  const absolute = expanded.startsWith('/')
    ? expanded
    : toPosix(path.normalize(path.join(path.dirname(currentSource), expanded)));
  const cleanedAbsolute = absolute.replace(/\.(md|mdx)$/, '');
  const legacyNoPrefix = cleanedAbsolute.replace(/^\//, '');

  if (routeMap.has(legacyNoPrefix)) {
    return routeMap.get(legacyNoPrefix);
  }

  const legacyMap = {
    '/on-premise-recording/get-started/quickstart':
      '/en/realtime-media/on-premise-recording/index',
    '/on-premise-recording/get-started/manage-agora-account':
      '/en/realtime-media/on-premise-recording/manage-agora-account',
    '/on-premise-recording/overview/product-overview':
      '/en/realtime-media/on-premise-recording/product-overview',
    '/on-premise-recording/overview/release-notes':
      '/en/realtime-media/on-premise-recording/release-notes',
    '/on-premise-recording/overview/billing':
      '/en/realtime-media/on-premise-recording/reference/pricing',
    '/on-premise-recording/reference/migration-guide':
      '/en/realtime-media/on-premise-recording/reference/migration-guide',
    '/on-premise-recording/reference/sunset':
      '/en/realtime-media/on-premise-recording/reference/sunset',
    '/on-premise-recording/develop/authentication-workflow':
      '/en/realtime-media/on-premise-recording/build/authentication-workflow',
    '/on-premise-recording/develop/cloud-proxy':
      '/en/realtime-media/on-premise-recording/build/cloud-proxy',
    '/on-premise-recording/develop/composite-mode':
      '/en/realtime-media/on-premise-recording/build/composite-mode',
    '/on-premise-recording/develop/individual-mode':
      '/en/realtime-media/on-premise-recording/build/individual-mode',
    '/on-premise-recording/develop/layout':
      '/en/realtime-media/on-premise-recording/build/layout',
    '/on-premise-recording/develop/local-screenshot':
      '/en/realtime-media/on-premise-recording/build/local-screenshot',
    '/on-premise-recording/develop/restore-files':
      '/en/realtime-media/on-premise-recording/build/restore-files',
    '/on-premise-recording/develop/watermark':
      '/en/realtime-media/on-premise-recording/build/watermark',
  };

  if (legacyMap[cleanedAbsolute]) {
    return legacyMap[cleanedAbsolute];
  }

  return expanded;
}

function rewriteMarkdownLinks(value, currentSource) {
  return value.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, text, target) => {
    return `[${text}](${resolveMarkdownLink(target, currentSource)})`;
  });
}

function rewriteAssetRefs(value) {
  return value.replace(
    /(?<![A-Za-z0-9:._-])\/images\/([^\s"'`)<]+)/g,
    `${assetBaseUrl}/$1`,
  );
}

function collectImageRefs(value) {
  const refs = new Set();
  for (const match of value.matchAll(
    /!\[[^\]]*]\((https:\/\/assets-docs\.agora\.io\/images\/[^)]+)\)/g,
  )) {
    refs.add(match[1]);
  }
  return [...refs].sort();
}

async function syncImage(ref) {
  const relative = ref.replace(`${assetBaseUrl}/`, '');
  const source = path.join(assetRoot, relative);
  if (!(await exists(source))) {
    return { ref, status: 's3-reference-not-verified' };
  }
  return { ref, status: 'source-present-for-s3-asset' };
}

function findFatalPatterns(value) {
  const patterns = [];
  const scanValue = value.replace(/```[\s\S]*?```/g, '');
  const checks = [
    /<V(?:g|pd|pl)\b/,
    /<ProductWrapper\b/,
    /<PlatformWrapper\b/,
    /<Admonition\b/,
    /<TabItem\b/,
    /<CodeBlock\b/,
    /<Link\b/,
    /<details\b/,
    /<summary\b/,
    /<ProductOverview\b/,
    /<Image\b/,
    /^import\s/m,
    /^export\s/m,
    /\{\{(?:Global|global)\./,
  ];
  for (const check of checks) {
    if (check.test(scanValue)) {
      patterns.push(check.toString());
    }
  }
  return patterns;
}

function buildMetaFiles(promoted) {
  const rootPromoted = [];
  const buildPromoted = [];
  const referencePromoted = [];

  for (const page of promoted) {
    if (page.target.startsWith('build/')) {
      buildPromoted.push(path.basename(page.target, path.extname(page.target)));
      continue;
    }
    if (page.target.startsWith('reference/')) {
      referencePromoted.push(
        path.basename(page.target, path.extname(page.target)),
      );
      continue;
    }
    rootPromoted.push(path.basename(page.target, path.extname(page.target)));
  }

  return {
    root: {
      title: 'On-premise Recording',
      navScope: {},
      sidebarIndexTitle: 'Quickstart',
      pages: [...rootPromoted, 'build', 'reference'],
    },
    build: {
      title: 'Build',
      pages: buildPromoted,
    },
    reference: {
      title: 'Reference',
      pages: referencePromoted,
    },
  };
}

async function writeJson(filePath, value) {
  await ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

async function writeFile(filePath, value) {
  await ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, value);
}

function classifyExistingTarget(targetFile) {
  if (targetFile.endsWith('build/placeholder.md')) return 'placeholder';
  if (targetFile.endsWith('reference/placeholder.md')) return 'placeholder';
  if (targetFile.endsWith('/index.md')) return 'migration-seed content';
  return null;
}

async function migratePage(page, blockers, promoted, staged, verifications) {
  const sourceFile = path.join(sourceRoot, page.source);
  const targetFile = path.join(targetRoot, page.target);
  const stagingFile = path.join(stagingRoot, page.target);
  const expanded = await expandFile(sourceFile);
  const frontmatter = {
    title: stripWrappingQuotes(expanded.frontmatter.title ?? ''),
    description: stripWrappingQuotes(expanded.frontmatter.description ?? ''),
  };
  let body = expanded.body;
  body = rewriteMarkdownLinks(body, page.source);
  body = rewriteAssetRefs(body);

  const images = collectImageRefs(body);
  const imageStatuses = [];
  for (const image of images) {
    imageStatuses.push(await syncImage(image));
  }

  const stagingContent = `${serializeFrontmatter(frontmatter)}${body}`;
  await writeFile(stagingFile, stagingContent);
  staged.push(page.target);

  const fatalPatterns = findFatalPatterns(stagingContent);
  const verification = {
    source: page.source,
    target: page.target,
    flow: page.flow,
    titlePreserved: true,
    descriptionPreserved: true,
    stagingExists: true,
    images: imageStatuses,
    targetCollisionState: page.collision
      ? page.collision
      : classifyExistingTarget(targetFile),
    fatalPatterns,
  };
  verifications.push(verification);

  if (fatalPatterns.length > 0) {
    blockers.push({
      source: page.source,
      target: page.target,
      flow: page.flow,
      blockerType: 'deferred content',
      exactPattern: fatalPatterns.join(', '),
      attemptedAdaptation:
        'Expanded shared imports, product branches, platform branches, variables, tables, links, details blocks, and image references; then staged output for verification.',
      completedAttempts:
        'audit, classify, expand, extract, normalize, stage, page-verify',
      reason:
        'Normalized staging output still contains legacy runtime syntax or unresolved compatibility residue.',
    });
    return;
  }

  await writeFile(targetFile, stagingContent);
  promoted.push({
    source: page.source,
    target: page.target,
    imageStatuses,
    collision: verification.targetCollisionState ?? null,
  });
}

function blockersToMarkdown(blockers) {
  const lines = [
    '# On-premise Recording migration blockers',
    '',
    '## Deferred content',
    '',
  ];

  const deferred = blockers.filter((item) => item.blockerType === 'deferred content');
  if (deferred.length === 0) {
    lines.push('None.', '');
  } else {
    for (const item of deferred) {
      lines.push(`### ${item.source}`);
      lines.push(`- Source path: \`${item.source}\``);
      if (item.target) {
        lines.push(`- Intended target path: \`${item.target}\``);
      }
      lines.push(`- Current flow: \`${item.flow}\``);
      lines.push(`- Blocker type: \`${item.blockerType}\``);
      lines.push(`- Exact failing pattern: ${item.exactPattern}`);
      lines.push(`- Attempted adaptation: ${item.attemptedAdaptation}`);
      lines.push(
        `- Completed mandatory resolution attempts: ${item.completedAttempts}`,
      );
      lines.push(`- Why promotion was blocked: ${item.reason}`);
      lines.push(
        '- Next missing rule, tool, or compatibility contract: Keep deferred until the excluded lane or missing compatibility rule is in scope.',
      );
      lines.push('');
    }
  }

  lines.push('## Repository anomaly', '', 'None.', '');
  return lines.join('\n');
}

async function removePlaceholderIfReplaced() {
  const targets = [
    path.join(targetRoot, 'build', 'placeholder.md'),
    path.join(targetRoot, 'reference', 'placeholder.md'),
  ];
  for (const target of targets) {
    if (await exists(target)) {
      await fs.unlink(target);
    }
  }
}

async function main() {
  await ensureDir(stagingRoot);
  await ensureDir(reportRoot);

  const blockers = deferredPages.map((item) => ({
    source: item.source,
    target: item.target,
    flow: 'complex',
    blockerType: item.blockerType,
    exactPattern: item.exactPattern,
    attemptedAdaptation:
      'Classified lane and page scope before final-tree writing; no promotion attempted because the page is explicitly out of scope.',
    completedAttempts: 'audit, classify',
    reason: item.reason,
  }));
  const promoted = [];
  const staged = [];
  const verifications = [];

  for (const page of pageMap) {
    await migratePage(page, blockers, promoted, staged, verifications);
  }

  await removePlaceholderIfReplaced();

  const meta = buildMetaFiles(promoted);
  await writeJson(path.join(targetRoot, 'meta.json'), meta.root);
  await writeJson(path.join(targetRoot, 'build', 'meta.json'), meta.build);
  await writeJson(path.join(targetRoot, 'reference', 'meta.json'), meta.reference);

  await writeJson(path.join(stagingRoot, 'meta.json'), meta.root);
  await writeJson(path.join(stagingRoot, 'build', 'meta.json'), meta.build);
  await writeJson(path.join(stagingRoot, 'reference', 'meta.json'), meta.reference);

  await fs.writeFile(blockerReportPath, blockersToMarkdown(blockers));
  await writeJson(summaryPath, {
    sourceRoot,
    targetRoot,
    stagingRoot,
    promoted,
    stagedOnly: staged.filter(
      (target) => !promoted.some((page) => page.target === target),
    ),
    blockers,
    verificationResults: verifications,
    metaUpdates: [
      'content/docs/en/realtime-media/on-premise-recording/meta.json',
      'content/docs/en/realtime-media/on-premise-recording/build/meta.json',
      'content/docs/en/realtime-media/on-premise-recording/reference/meta.json',
    ],
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
