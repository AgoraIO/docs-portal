#!/usr/bin/env node

import { promises as fs } from 'node:fs';
import path from 'node:path';

const repoRoot = '/Users/yejiayi/Documents/docs-portal';
const sourceRoot = '/Users/yejiayi/Documents/Doc-Source-Private/cloud-recording';
const sharedRoot = '/Users/yejiayi/Documents/Doc-Source-Private/shared';
const assetRoot = '/Users/yejiayi/Documents/Doc-Source-Private/assets/images';
const targetRoot =
  '/Users/yejiayi/Documents/docs-portal/content/docs/en/realtime-media/cloud-recording';
const stagingRoot =
  '/Users/yejiayi/Documents/docs-portal/docs/superpowers/staging/2026-06-13-cloud-recording';
const reportRoot =
  '/Users/yejiayi/Documents/docs-portal/docs/superpowers/reports';
const blockerReportPath = path.join(
  reportRoot,
  '2026-06-13-cloud-recording-migration-blockers.md',
);
const summaryPath = path.join(
  reportRoot,
  '2026-06-13-cloud-recording-migration-summary.json',
);

const globals = {
  AGORA_CONSOLE_URL: 'https://console.agora.io/v2',
  AGORA_BACKEND: 'Agora SDRTN®',
  BACKEND_NAME: 'Software-Defined Real-Time Network (SDRTN®)',
  COMPANY: 'Agora',
  CONSOLE: 'Agora Console',
  CREC: 'Cloud Recording',
  CREC_FCS:
    'https://download.agora.io/acrsdk/release/cloud_recording_tools.v3.8.0.69-202302061216-release-prod.tar.gz',
  CREC_TRANS_SCRIPT:
    'https://download.agora.io/acrsdk/release/rtsc-ha_transcoder.v1.1.9-202204180321-release-prod.tar.gz',
  NCS: 'NCS',
  NCS_LONG: 'Notifications',
  STATUS_PAGE: 'Status Page',
  VSDK: 'Video SDK',
};

const productVars = {
  CLIENT: 'app',
  NAME: 'Cloud Recording',
  PRODUCT: 'Cloud Recording',
};

const rootPages = [
  {
    source: 'get-started/getstarted.md',
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
    source: 'get-started/middleware-quickstart.mdx',
    target: 'middleware-quickstart.mdx',
    flow: 'complex',
  },
  {
    source: 'overview/product-overview.mdx',
    target: 'product-overview.mdx',
    flow: 'complex',
  },
  {
    source: 'overview/core-concepts.mdx',
    target: 'core-concepts.mdx',
    flow: 'complex',
  },
  {
    source: 'overview/pricing.md',
    target: 'pricing.mdx',
    flow: 'complex',
  },
  {
    source: 'overview/pricing-webpage-recording.md',
    target: 'pricing-webpage-recording.mdx',
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
  'develop/composite-mode.md',
  'develop/convert-format.md',
  'develop/individual-mode.md',
  'develop/individual-nontranscoding.md',
  'develop/integrate-token-generation.mdx',
  'develop/layout.md',
  'develop/manage-files.md',
  'develop/merge-files.md',
  'develop/online-play.md',
  'develop/playback.md',
  'develop/receive-notifications.mdx',
  'develop/recording-video-profile.md',
  'develop/screen-capture.md',
  'develop/subscription.md',
  'develop/webpage-load-timeout.md',
  'develop/webpage-mode.md',
  'best-practices/integration-best-practices.md',
  'best-practices/webpage-best-practices.md',
].map((source) => ({
  source,
  target: `build/${path.basename(source, path.extname(source))}.mdx`,
  flow: 'complex',
  collision:
    path.basename(source).startsWith('placeholder') ? 'placeholder' : undefined,
}));

const referencePages = [
  'reference/billing-policies.mdx',
  'reference/common-errors.md',
  'reference/firewall.mdx',
  'reference/glossary.mdx',
  'reference/region-vendor.mdx',
  'reference/security.mdx',
  'reference/status-page.mdx',
  'reference/stream-mode.mdx',
].map((source) => ({
  source,
  target: `reference/${path.basename(source, path.extname(source))}.mdx`,
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
    source: 'reference/rest-api-overview.md',
    target: null,
    blockerType: 'deferred content',
    reason: 'REST/API lane is explicitly excluded from this migration batch.',
    exactPattern: 'REST callback reference page',
  },
  {
    source: 'reference/restful-api.mdx',
    target: null,
    blockerType: 'deferred content',
    reason: 'REST/API lane is explicitly excluded from this migration batch.',
    exactPattern: 'RESTful API reference page',
  },
  {
    source: 'reference/restful-authentication.mdx',
    target: null,
    blockerType: 'deferred content',
    reason: 'REST/API lane is explicitly excluded from this migration batch.',
    exactPattern: 'REST authentication reference page',
  },
];

const pageMap = [...rootPages, ...buildPages, ...referencePages];
const routeMap = new Map();
for (const page of pageMap) {
  const sourceKey = toPosix(page.source).replace(/\.(md|mdx)$/, '');
  const targetKey = toPosix(page.target).replace(/\.(md|mdx)$/, '');
  routeMap.set(sourceKey, `/en/realtime-media/cloud-recording/${targetKey}`);
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

function resolveSharedImport(specifier, currentFile) {
  if (specifier.startsWith('@docs/shared/')) {
    return path.join(sharedRoot, specifier.replace('@docs/shared/', ''));
  }
  if (specifier.startsWith('./') || specifier.startsWith('../')) {
    return path.resolve(path.dirname(currentFile), specifier);
  }
  return null;
}

function parseImports(raw) {
  const imports = [];
  const importPattern = /^import\s+([A-Za-z0-9_]+)\s+from\s+['"](.+?)['"];?\s*$/gm;
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
    value = transformVariables(value);
    value = transformCodeBlocks(value);
    value = transformLinks(value);
    value = transformAnchors(value);
    value = transformProductOverview(value);
    value = transformTabs(value);
    value = transformAdmonitions(value);
    value = transformDetails(value);
    value = transformHtmlLists(value);
    value = transformInlineHtml(value);
    value = normalizeWhitespace(value);
  }
  return value.trim() + '\n';
}

function transformComments(value) {
  return value.replace(/\{\/\*[\s\S]*?\*\/\}/g, '');
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
        const raw = productMatch[1] ?? productMatch[2] ?? '';
        const list = raw
          .split(',')
          .map((item) => item.replace(/['"\s]/g, ''))
          .filter(Boolean);
        return list.includes('cloud-recording') ? body : '';
      }

      if (notAllowedMatch) {
        const raw = notAllowedMatch[1] ?? notAllowedMatch[2] ?? '';
        const list = raw
          .split(',')
          .map((item) => item.replace(/['"\s]/g, ''))
          .filter(Boolean);
        return list.includes('cloud-recording') ? '' : body;
      }

      return body;
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

function transformCodeBlocks(value) {
  return value.replace(
    /<CodeBlock\s+language=['"]([^'"]+)['"][^>]*>\s*\{`([\s\S]*?)`\}\s*<\/CodeBlock>/g,
    (_, language, body) => {
      return `\n\`\`\`${language}\n${body.trim()}\n\`\`\`\n`;
    },
  );
}

function resolveGlobalLink(target) {
  let resolved = target;
  for (const [key, replacement] of Object.entries(globals)) {
    resolved = resolved.replaceAll(`{{Global.${key}}}`, replacement);
    resolved = resolved.replaceAll(`{{global.${key}}}`, replacement);
  }
  return resolved;
}

function transformLinks(value) {
  value = value.replace(
    /<Link(?:\s+target=['"][^'"]+['"])?\s+to=['"]([^'"]+)['"]>([\s\S]*?)<\/Link>/g,
    (_, target, text) => `[${collapseInline(text)}](${resolveGlobalLink(target)})`,
  );
  value = value.replace(
    /<a\s+href=['"]([^'"]+)['"]>([\s\S]*?)<\/a>/g,
    (_, target, text) => `[${collapseInline(text)}](${resolveGlobalLink(target)})`,
  );
  return value;
}

function transformAnchors(value) {
  value = value.replace(
    /^(#{1,6})\s*<a\s+name=['"]([^'"]+)['"]><\/a>\s*(.+)$/gm,
    (_, hashes, id, title) => `${hashes} ${title.trim()} {#${id}}`,
  );
  value = value.replace(
    /<a\s+name=['"]([^'"]+)['"]><\/a>\s*\n(#{1,6})\s+(.+)/g,
    (_, id, hashes, title) => `${hashes} ${title.trim()} {#${id}}`,
  );
  value = value.replace(
    /<a\s+href=['"]([^'"]+)['"]><\/a>\s*\n(#{1,6})\s+(.+)/g,
    (_, id, hashes, title) => `${hashes} ${title.trim()} {#${id}}`,
  );
  value = value.replace(/<a\s+name=['"][^'"]+['"]><\/a>\s*/g, '');
  return value;
}

function transformProductOverview(value) {
  return value.replace(
    /<ProductOverview[\s\S]*?title="([^"]+)"[\s\S]*?img="([^"]+)"[\s\S]*?productFeatures=\{\[([\s\S]*?)\]\}[\s\S]*?>([\s\S]*?)<\/ProductOverview>/g,
    (_, title, image, featuresBlock, body) => {
      const features = [...featuresBlock.matchAll(/title:\s*"([^"]+)"[\s\S]*?content:\s*"([^"]+)"/g)]
        .map((item) => `- **${item[1]}**: ${item[2]}`)
        .join('\n');
      return [
        `## ${title}`,
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
    const items = [...body.matchAll(/<TabItem\s+value="([^"]+)"\s+label="([^"]+)"([^>]*)>([\s\S]*?)<\/TabItem>/g)];
    if (items.length === 0) {
      return body;
    }
    const defaultValue =
      items.find((item) => item[3].includes('default'))?.[1] ?? items[0][1];
    const list = items
      .map(
        (item) =>
          `  <TabsTrigger value="${item[1]}">${item[2]}</TabsTrigger>`,
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

function admonitionType(type) {
  if (type === 'caution') return 'warning';
  if (type === 'danger') return 'danger';
  return type || 'info';
}

function transformAdmonitions(value) {
  return value.replace(
    /<Admonition(?:\s+type\s*=\s*['"]([^'"]+)['"])?(?:\s+title\s*=\s*['"]([^'"]+)['"])?\s*>([\s\S]*?)<\/Admonition>/g,
    (_, type = 'info', title = '', body) => {
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
        '<Accordions>',
        `  <Accordion title=${JSON.stringify(collapseInline(summary))}>`,
        indentBlock(collapseBlock(body), 4),
        '  </Accordion>',
        '</Accordions>',
      ].join('\n');
    },
  );
}

function transformHtmlLists(value) {
  return value
    .replace(/<ul>\s*((?:<li>[\s\S]*?<\/li>\s*)+)<\/ul>/g, (_, items) => {
      return items
        .match(/<li>[\s\S]*?<\/li>/g)
        ?.map((item) => `- ${collapseInline(item.replace(/<\/?li>/g, ''))}`)
        .join('\n') ?? '';
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

function transformInlineHtml(value) {
  return value
    .replace(/<sup>(.*?)<\/sup>/g, '$1')
    .replace(/<\/?b>/g, '**')
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
  return value
    .replace(/\n{3,}/g, '\n\n')
    .trim();
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

function targetRouteFor(sourcePath) {
  const key = toPosix(sourcePath).replace(/\.(md|mdx)$/, '');
  return routeMap.get(key);
}

function resolveMarkdownLink(target, currentSource) {
  const expanded = resolveGlobalLink(target);
  if (expanded === '#update') {
    return '/en/api-reference/cloud-recording/restful#update';
  }
  if (expanded === '#update-video-layout' || expanded === '#updateLayout') {
    return '/en/api-reference/cloud-recording/restful#updatelayout';
  }
  if (
    expanded.startsWith('http://') ||
    expanded.startsWith('https://') ||
    expanded.startsWith('mailto:') ||
    expanded.startsWith('#')
  ) {
    return expanded;
  }

  const absolute =
    expanded.startsWith('/')
      ? expanded
      : toPosix(path.normalize(path.join(path.dirname(currentSource), expanded)));
  const noExt = absolute.replace(/\.(md|mdx)$/, '');

  if (routeMap.has(noExt.replace(/^\//, ''))) {
    return routeMap.get(noExt.replace(/^\//, ''));
  }

  if (noExt.endsWith('reference/restful-api')) {
    return '/en/api-reference/cloud-recording/restful';
  }
  if (noExt.includes('reference/restful-api#')) {
    return `/en/api-reference/cloud-recording/restful#${noExt.split('#')[1]}`;
  }

  if (absolute.startsWith('/cloud-recording/')) {
    return absolute;
  }

  return expanded;
}

function rewriteMarkdownLinks(value, currentSource) {
  return value.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, text, target) => {
    return `[${text}](${resolveMarkdownLink(target, currentSource)})`;
  });
}

function collectImageRefs(value) {
  const refs = new Set();
  for (const match of value.matchAll(/!\[[^\]]*]\((\/images\/[^)]+)\)/g)) {
    refs.add(match[1]);
  }
  return [...refs].sort();
}

async function syncImage(ref) {
  const relative = ref.replace(/^\/images\//, '');
  const source = path.join(assetRoot, relative);
  const target = path.join(repoRoot, 'public/images', relative);
  if (await exists(target)) {
    return { ref, status: 'verified-existing' };
  }
  if (!(await exists(source))) {
    return { ref, status: 'local-missing-image-kept' };
  }
  await ensureDir(path.dirname(target));
  await fs.copyFile(source, target);
  return { ref, status: 'synced' };
}

function findFatalPatterns(value) {
  const patterns = [];
  const scanValue = value.replace(/```[\s\S]*?```/g, '');
  const checks = [
    /<V(?:g|pd|pl)\b/,
    /<ProductWrapper\b/,
    /<Admonition\b/,
    /<TabItem\b/,
    /<CodeBlock\b/,
    /<Link\b/,
    /<details\b/,
    /<summary\b/,
    /<ProductOverview\b/,
    /<Image\b/,
    /<a\s+(?:name|href)=/,
    /^import\s/m,
    /^export\s/m,
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
      title: 'Cloud Recording',
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

async function migratePage(page, blockers, promoted, staged) {
  const sourceFile = path.join(sourceRoot, page.source);
  const targetFile = path.join(targetRoot, page.target);
  const stagingFile = path.join(stagingRoot, page.target);
  const expanded = await expandFile(sourceFile);
  let frontmatter = {
    title: stripWrappingQuotes(expanded.frontmatter.title ?? ''),
    description: stripWrappingQuotes(expanded.frontmatter.description ?? ''),
  };
  let body = expanded.body;
  body = rewriteMarkdownLinks(body, page.source);

  const images = collectImageRefs(body);
  const imageStatuses = [];
  for (const image of images) {
    imageStatuses.push(await syncImage(image));
  }

  const stagingContent = `${serializeFrontmatter(frontmatter)}${body}`;
  await writeFile(stagingFile, stagingContent);

  const fatalPatterns = findFatalPatterns(stagingContent);
  if (fatalPatterns.length > 0) {
    blockers.push({
      source: page.source,
      target: page.target,
      flow: page.flow,
      blockerType: 'deferred content',
      exactPattern: fatalPatterns.join(', '),
      attemptedAdaptation:
        'Expanded shared imports, variables, admonitions, tabs, details, links, anchors, and image references, then staged output for verification.',
      completedAttempts:
        'audit, classify, expand, extract, normalize, stage, page-verify',
      reason:
        'Normalized staging output still contains legacy runtime syntax or unresolved compatibility residue.',
    });
    staged.push(page.target);
    return;
  }

  await writeFile(targetFile, stagingContent);
  promoted.push({
    source: page.source,
    target: page.target,
    imageStatuses,
    collision: page.collision ?? null,
  });
}

function blockersToMarkdown(blockers) {
  const lines = [
    '# Cloud Recording migration blockers',
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
      lines.push('- Next missing rule, tool, or compatibility contract: None in this batch; keep item deferred until the excluded lane or missing compatibility rule is in scope.');
      lines.push('');
    }
  }

  lines.push('## Repository anomaly', '', 'None.', '');
  return lines.join('\n');
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

  for (const page of pageMap) {
    await migratePage(page, blockers, promoted, staged);
  }

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
    stagedOnly: staged,
    blockers,
    metaUpdates: [
      'content/docs/en/realtime-media/cloud-recording/meta.json',
      'content/docs/en/realtime-media/cloud-recording/build/meta.json',
      'content/docs/en/realtime-media/cloud-recording/reference/meta.json',
    ],
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
