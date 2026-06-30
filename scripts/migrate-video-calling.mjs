#!/usr/bin/env node

import { promises as fs } from 'node:fs';
import path from 'node:path';

const repoRoot = '/Users/yejiayi/Documents/docs-portal';
const sourceRoot = '/Users/yejiayi/Documents/Doc-Source-Private/video-calling';
const sharedRoot = '/Users/yejiayi/Documents/Doc-Source-Private/shared';
const assetRoot = '/Users/yejiayi/Documents/Doc-Source-Private/assets/images';
const assetBaseUrl = 'https://assets-docs.agora.io/images';
const targetRoot =
  '/Users/yejiayi/Documents/docs-portal/content/docs/en/realtime-media/video';
const stagingRoot =
  '/Users/yejiayi/Documents/docs-portal/docs/superpowers/staging/2026-06-15-video-calling';
const reportRoot =
  '/Users/yejiayi/Documents/docs-portal/docs/superpowers/reports';
const blockerReportPath = path.join(
  reportRoot,
  '2026-06-15-video-calling-migration-blockers.md',
);
const summaryPath = path.join(
  reportRoot,
  '2026-06-15-video-calling-migration-summary.json',
);

const knownPlatformKeys = new Set([
  'web',
  'javascript',
  'android',
  'ios',
  'flutter',
  'react-native',
]);

const existingSafeRootPages = [
  'product-overview',
  'manage-agora-account',
  'account-settlement',
  'subscription-packages',
];

const existingSafeReferencePages = [
  'pricing',
  'billing-policies',
  'cloud-proxy-allowed-ips',
  'cloud-proxy-migration-guide',
  'console-overview',
  'firewall',
  'glossary',
  'security',
  'service-limits',
  'status-page',
  'common-problems',
];

const globals = {
  AA: 'Agora Analytics',
  AGORA_BACKEND: 'Agora SDRTN®',
  AGORA_CONSOLE_URL: 'https://console.agora.io/v2',
  API_REF_ROOT: 'https://api-ref.agora.io/en/video-sdk',
  API_REF_WEB_ROOT: 'https://api-ref.agora.io/en/video-sdk/web/4.x',
  BACKEND_NAME: 'Software-Defined Real-Time Network (SDRTN®)',
  BS: 'Broadcast Streaming',
  COMPANY: 'Agora',
  CONSOLE: 'Agora Console',
  CP: 'Cloud proxy',
  ENGINE: 'Agora Engine',
  GET_STARTED: 'SDK quickstart',
  ILS: 'Interactive Live Streaming',
  MESS: 'Signaling',
  MESS_SDK: 'Signaling SDK',
  NCS: 'NCS',
  NCS_LONG: 'Notifications',
  RTEE_BEAUTY: 'Beauty Effect',
  RTEE_CLARITY: 'Super Clarity',
  RTEE_CM: 'Camera Movement',
  RTEE_COMPOSITOR: 'Video Compositor',
  RTEE_FC: 'Facial Capture',
  RTEE_MK: 'MetaKit',
  RTEE_NS: 'AI Noise Suppression',
  RTEE_VAD: 'Voice Activity Detection',
  RTEE_VB: 'Virtual Background',
  SCR_SHR: 'screen sharing',
  SDRTN: 'SDRTN®',
  SIG: 'Signaling',
  SPATIAL: '3D Spatial Audio',
  STATUS_PAGE: 'Status Page',
  VSDK: 'Video SDK',
  VSDK_LATEST_RELEASE: '4.1.0',
  VSDK_PREVIOUS_RELEASE: '3.7.x',
  VSDK_PREVIOUS_RELEASE_WEB: '3.x',
  VSDK_RELEASE: '4.x',
};

const productVars = {
  CLIENT: 'app',
  MEDIA: 'audio and video',
  MEDIA_DEVICES: 'camera and microphone',
  NAME: 'Video Calling',
  PATH: 'video-calling',
  PRODUCT: 'Video Calling',
  SDK: 'Video SDK',
  SDK_LITE: 'Lite SDK',
  STREAM: 'interactive live streaming or broadcast streaming',
};

const platformVars = {
  CLIENT: 'app',
  NAME: 'Web',
  PATH: 'web',
  RTC_CONNECTION: 'RtcConnection',
  RTC_ENGINE: 'RtcEngine',
  RTC_ENGINE_EX: 'RtcEngineEx',
};

const rootPages = [
  {
    source: 'overview/product-overview.mdx',
    target: 'product-overview.mdx',
    flow: 'complex',
  },
  {
    source: 'get-started/manage-agora-account.mdx',
    target: 'manage-agora-account.mdx',
    flow: 'complex',
  },
  {
    source: 'overview/account-settlement.mdx',
    target: 'account-settlement.mdx',
    flow: 'complex',
  },
  {
    source: 'overview/subscription-packages.mdx',
    target: 'subscription-packages.mdx',
    flow: 'complex',
  },
];

const buildPages = [
  {
    source: 'token-authentication/deploy-token-server.mdx',
    target: 'build/deploy-token-server.mdx',
    flow: 'complex',
  },
  {
    source: 'token-authentication/integrate-token-generation.mdx',
    target: 'build/integrate-token-generation.mdx',
    flow: 'complex',
  },
  {
    source: 'overview/core-concepts.mdx',
    target: 'core-concepts.mdx',
    flow: 'complex',
  },
];

const referencePages = [
  ['overview/pricing.mdx', 'reference/pricing.mdx'],
  ['reference/billing-policies.mdx', 'reference/billing-policies.mdx'],
  ['reference/cloud-proxy-allowed-ips.mdx', 'reference/cloud-proxy-allowed-ips.mdx'],
  ['reference/cloud-proxy-migration-guide.mdx', 'reference/cloud-proxy-migration-guide.mdx'],
  ['reference/console-overview.mdx', 'reference/console-overview.mdx'],
  ['reference/firewall.mdx', 'reference/firewall.mdx'],
  ['reference/glossary.mdx', 'reference/glossary.mdx'],
  ['reference/security.mdx', 'reference/security.mdx'],
  ['reference/service-limits.mdx', 'reference/service-limits.mdx'],
  ['reference/status-page.mdx', 'reference/status-page.mdx'],
  ['troubleshooting/common-problems.mdx', 'reference/common-problems.mdx'],
].map(([source, target]) => ({
  source,
  target,
  flow: 'complex',
}));

const unresolvedComplexPages = [
  'get-started/get-started-sdk.mdx',
  'token-authentication/authentication-workflow.mdx',
  'get-started/compile-run-sample-project.mdx',
  'get-started/volume-control-and-mute.mdx',
  'advanced-features/cloud-proxy.mdx',
  'enhance-call-quality/configure-audio-encoding.mdx',
  'enhance-call-quality/configure-video-encoding.mdx',
  'enhance-call-quality/connection-status-management.mdx',
  'enhance-call-quality/in-call-quality-monitoring.mdx',
  'enhance-call-quality/pre-call-tests.mdx',
  'enhance-call-quality/video-transmission-optimization.mdx',
  'best-practices/app-size-optimization.mdx',
  'best-practices/autoplay.mdx',
  'best-practices/best-practices-sound-quality.mdx',
  'best-practices/optimize-frame-rendering.mdx',
  'best-practices/optimize-multihost-video.mdx',
  'best-practices/preload-channels.mdx',
  'best-practices/prevent-stream-bombing.mdx',
  'token-authentication/middleware-token-server.mdx',
  'advanced-features/ai-noise-suppression.mdx',
  'advanced-features/alpha-transparency-effect.mdx',
  'advanced-features/audio-mixing-and-sound-effects.mdx',
  'advanced-features/audio-strength-stream-selection.mdx',
  'advanced-features/beauty-effect.mdx',
  'advanced-features/camera-movement.mdx',
  'advanced-features/custom-audio.mdx',
  'advanced-features/custom-video.mdx',
  'advanced-features/end-to-end-encryption.mdx',
  'advanced-features/face-capture.mdx',
  'advanced-features/geofencing.mdx',
  'advanced-features/join-multiple-channels.mdx',
  'advanced-features/media-stream-encryption.mdx',
  'advanced-features/media-stream-fallback.mdx',
  'advanced-features/metakit.mdx',
  'advanced-features/multipath-transmission.mdx',
  'advanced-features/picture-in-picture.mdx',
  'advanced-features/play-media.mdx',
  'advanced-features/raw-video-processing.mdx',
  'advanced-features/receive-notifications.mdx',
  'advanced-features/screen-sharing.mdx',
  'advanced-features/screenshot-upload.mdx',
  'advanced-features/set-audio-route.mdx',
  'advanced-features/simulcasting.mdx',
  'advanced-features/spatial-audio.mdx',
  'advanced-features/stream-raw-audio.mdx',
  'advanced-features/super-clarity.mdx',
  'advanced-features/use-an-extension.mdx',
  'advanced-features/video-compositor.mdx',
  'advanced-features/virtual-background.mdx',
  'advanced-features/voice-activity-detection.mdx',
  'advanced-features/voice-effects.mdx',
  'advanced-features/watermark.mdx',
  'overview/pricing-legacy.mdx',
  'overview/supported-platforms.mdx',
  'overview/release-notes.mdx',
  'reference/migration-guide.mdx',
  'troubleshooting/error-codes.mdx',
  'reference/api-sunset.mdx',
  'reference/magic-leap.mdx',
];

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
    reason: 'AI tooling or ecosystem page is outside the current migration scope.',
    exactPattern: 'AI tooling lane (skills)',
  },
  {
    source: 'channel-management-api/overview.mdx',
    target: null,
    blockerType: 'deferred content',
    reason: 'REST/API lane is explicitly excluded from this migration batch.',
    exactPattern: 'REST/API overview lane',
  },
  {
    source: 'channel-management-api',
    target: null,
    blockerType: 'deferred content',
    reason: 'REST/API lane is explicitly excluded from this migration batch.',
    exactPattern: 'channel-management-api/**',
  },
  ...unresolvedComplexPages.map((source) => ({
    source,
    target: null,
    blockerType: 'deferred content',
    reason:
      'Complex page still fails target MDX compatibility after mandatory attempts, mainly due to platform-wrapper normalization, unsupported platform keys, or nested tabs/accordion structures.',
    exactPattern: 'complex-page compatibility residue',
  })),
];

const pageMap = [...rootPages, ...buildPages, ...referencePages];
const deferredSeedPages = deferredPages.filter(
  (item) => !pageMap.some((page) => page.source === item.source),
);
const routeMap = new Map();
for (const page of pageMap) {
  const sourceKey = toPosix(page.source).replace(/\.(md|mdx)$/, '');
  const targetKey = toPosix(page.target).replace(/\.(md|mdx)$/, '');
  routeMap.set(sourceKey, `/en/realtime-media/video/${targetKey}`);
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
    return { frontmatter: {}, body: content };
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

function stripWrappingQuotes(value) {
  return String(value ?? '').replace(/^['"]|['"]$/g, '');
}

function serializeFrontmatter(frontmatter) {
  const lines = ['---'];
  if (frontmatter.title) {
    lines.push(`title: ${JSON.stringify(stripWrappingQuotes(frontmatter.title))}`);
  }
  if (frontmatter.description) {
    lines.push(
      `description: ${JSON.stringify(stripWrappingQuotes(frontmatter.description))}`,
    );
  }
  lines.push('---', '');
  return lines.join('\n');
}

function parseImports(raw) {
  const imports = [];
  const importPattern =
    /^import\s+(?:\*\s+as\s+)?([A-Za-z0-9_]+)\s+from\s+['"](.+?)['"];?\s*$/gm;
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
    value = transformPlatformWrappers(value);
    value = transformHtmlLists(value);
    value = transformInlineHtml(value);
    value = normalizeWhitespace(value);
  }
  return value.trim() + '\n';
}

function transformComments(value) {
  return value.replace(/\{\/\*[\s\S]*?\*\/\}/g, '');
}

function normalizeProductSet(raw) {
  return raw
    .replace(/^\[|\]$/g, '')
    .split(',')
    .map((item) => item.replace(/['"\s{}]/g, ''))
    .filter(Boolean);
}

function shouldKeepByProduct(attrs) {
  const productMatch = attrs.match(
    /product\s*=\s*(?:"([^"]+)"|'([^']+)'|\{\[([^\]]+)\]\}|\{\s*"([^"]+)"\s*\}|\{\s*'([^']+)'\s*\})/,
  );
  const notAllowedMatch = attrs.match(
    /notAllowed\s*=\s*(?:"([^"]+)"|'([^']+)'|\{\[([^\]]+)\]\}|\{\s*"([^"]+)"\s*\}|\{\s*'([^']+)'\s*\})/,
  );

  if (productMatch) {
    const raw =
      productMatch[1] ??
      productMatch[2] ??
      productMatch[3] ??
      productMatch[4] ??
      productMatch[5] ??
      '';
    return normalizeProductSet(raw).includes('video-calling');
  }

  if (notAllowedMatch) {
    const raw =
      notAllowedMatch[1] ??
      notAllowedMatch[2] ??
      notAllowedMatch[3] ??
      notAllowedMatch[4] ??
      notAllowedMatch[5] ??
      '';
    return !normalizeProductSet(raw).includes('video-calling');
  }

  return true;
}

function transformProductWrapper(value) {
  return value.replace(
    /<ProductWrapper([^>]*)>([\s\S]*?)<\/ProductWrapper\s*>/g,
    (_, attrs, body) => (shouldKeepByProduct(attrs) ? body : ''),
  );
}

function transformVariables(value) {
  value = value.replace(
    /<Vg\s+k\s*=\s*['"]([^'"]+)['"](?:\s+[^>]*)?\s*\/>/g,
    (_, key) => globals[key] ?? key,
  );
  value = value.replace(
    /<Vpd\s+k\s*=\s*['"]([^'"]+)['"](?:\s+[^>]*)?\s*\/>/g,
    (_, key) => productVars[key] ?? key,
  );
  value = value.replace(
    /<Vpl\s+k\s*=\s*['"]([^'"]+)['"](?:\s+[^>]*)?\s*\/>/g,
    (_, key) => {
      if (platformVars[key]) return platformVars[key];
      if (productVars[key]) return String(productVars[key]).toLowerCase();
      return key.toLowerCase();
    },
  );
  return value;
}

function transformCodeBlocks(value) {
  return value.replace(
    /<CodeBlock\s+language=['"]([^'"]+)['"][^>]*>\s*\{`([\s\S]*?)`\}\s*<\/CodeBlock>/g,
    (_, language, body) => `\n\`\`\`${language}\n${body.trim()}\n\`\`\`\n`,
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
    /<Link(?:\s+[^>]*)?\s+target=['"]_blank['"]\s+to=['"]([^'"]+)['"]>([\s\S]*?)<\/Link>/g,
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
  value = value.replace(/<a\s+name=['"][^'"]+['"]><\/a>\s*/g, '');
  value = value.replace(/<a\s+href=['"]([^'"]+)['"]><\/a>\s*/g, '');
  return value;
}

function transformProductOverview(value) {
  return value.replace(
    /<ProductOverview[\s\S]*?title="([^"]+)"[\s\S]*?img="([^"]+)"[\s\S]*?quickStartLink="([^"]+)"[\s\S]*?authenticationLink="([^"]+)"[\s\S]*?apiReferenceLink="([^"]+)"[\s\S]*?samplesLink="([^"]+)"[\s\S]*?productFeatures=\{\[([\s\S]*?)\]\}[\s\S]*?>([\s\S]*?)<\/ProductOverview>/g,
    (_, title, image, quickStartLink, authenticationLink, apiReferenceLink, samplesLink, featuresBlock, body) => {
      const features = [
        ...featuresBlock.matchAll(
          /title:\s*"([^"]+)"[\s\S]*?content:\s*"([^"]+)"/g,
        ),
      ]
        .map((item) => `- **${item[1]}** - ${item[2]}`)
        .join('\n');

      return [
        `![${title}](${image})`,
        '',
        collapseBlock(body),
        '',
        '## Start building with',
        '',
        `- [SDK quickstart](${quickStartLink})`,
        `- [Authentication](${authenticationLink})`,
        `- [API reference](${apiReferenceLink})`,
        `- [Samples](${samplesLink})`,
        '',
        '## Product Features',
        '',
        features,
      ].join('\n');
    },
  );
}

function transformTabs(value) {
  value = value.replace(/<Tabs\b([^>]*)>([\s\S]*?)<\/Tabs>/g, (_, attrs, body) => {
    const groupIdMatch = attrs.match(/groupId=['"]([^'"]+)['"]/);
    const items = [
      ...body.matchAll(
        /<TabItem\s+value=['"]([^'"]+)['"]\s+label=['"]([^'"]+)['"]([^>]*)>([\s\S]*?)<\/TabItem>/g,
      ),
    ];
    if (items.length === 0) {
      return body;
    }
    const defaultValue =
      items.find((item) => item[3].includes('default'))?.[1] ?? items[0][1];
    const triggerTag = groupIdMatch ? 'TabsTrigger' : 'CodeBlockTabsTrigger';
    const listTag = groupIdMatch ? 'TabsList' : 'CodeBlockTabsList';
    const contentTag = groupIdMatch ? 'TabsContent' : 'CodeBlockTab';
    const rootTag = groupIdMatch ? 'Tabs' : 'CodeBlockTabs';
    const rootAttrs = groupIdMatch
      ? ` defaultValue="${defaultValue}" groupId="${groupIdMatch[1]}" persist`
      : ` defaultValue="${defaultValue}"`;
    const list = items
      .map((item) => `  <${triggerTag} value="${item[1]}">${item[2]}</${triggerTag}>`)
      .join('\n');
    const contents = items
      .map(
        (item) =>
          `<${contentTag} value="${item[1]}">\n${item[4].trim()}\n</${contentTag}>`,
      )
      .join('\n\n');
    return [
      `<${rootTag}${rootAttrs}>`,
      `<${listTag}>`,
      list,
      `</${listTag}>`,
      '',
      contents,
      `</${rootTag}>`,
    ].join('\n');
  });

  value = value.replace(
    /(<TabsList>[\s\S]*?<\/TabsList>\s*(?:<TabsContent[\s\S]*?<\/TabsContent>\s*)+)/g,
    (_, body) => `<Tabs defaultValue="tab1">\n${body.trim()}\n</Tabs>`,
  );

  return value;
}

function admonitionType(type) {
  if (type === 'caution') return 'warning';
  if (type === 'danger') return 'error';
  return type || 'info';
}

function normalizeImmediateDuplicateTabs(value) {
  let next = value;
  let previous = null;

  while (previous !== next) {
    previous = next;
    next = next.replace(
      /<Tabs([^>]*)>\s*<Tabs\1>\s*([\s\S]*?)\s*<\/Tabs>\s*<\/Tabs>/g,
      '<Tabs$1>\n$2\n</Tabs>',
    );
    next = next.replace(
      /<CodeBlockTabs([^>]*)>\s*<CodeBlockTabs\1>\s*([\s\S]*?)\s*<\/CodeBlockTabs>\s*<\/CodeBlockTabs>/g,
      '<CodeBlockTabs$1>\n$2\n</CodeBlockTabs>',
    );
  }

  return next;
}

function transformAdmonitions(value) {
  return value.replace(
    /<Admonition(?=[^>]*>)([^>]*)>([\s\S]*?)<\/Admonition>/g,
    (_, attrs = '', body) => {
      const type =
        attrs.match(/\btype\s*=\s*['"]([^'"]+)['"]/)?.[1] ?? 'info';
      const title =
        attrs.match(/\btitle\s*=\s*['"]([^'"]+)['"]/)?.[1] ?? '';
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

function splitPlatformList(raw) {
  return raw
    .replace(/^\[|\]$/g, '')
    .split(',')
    .map((item) => item.replace(/['"\s{}]/g, ''))
    .filter(Boolean);
}

function transformPlatformWrappers(value) {
  return value.replace(
    /<PlatformWrapper([^>]*)>([\s\S]*?)<\/PlatformWrapper\s*>/g,
    (_, attrs, body) => {
      const platformMatch = attrs.match(
        /platform\s*=\s*(?:"([^"]+)"|'([^']+)'|\{\[([^\]]+)\]\}|\{\s*"([^"]+)"\s*\}|\{\s*'([^']+)'\s*\})/,
      );
      const notAllowedMatch = attrs.match(
        /notAllowed\s*=\s*(?:"([^"]+)"|'([^']+)'|\{\[([^\]]+)\]\}|\{\s*"([^"]+)"\s*\}|\{\s*'([^']+)'\s*\})/,
      );

      if (platformMatch) {
        const raw =
          platformMatch[1] ??
          platformMatch[2] ??
          platformMatch[3] ??
          platformMatch[4] ??
          platformMatch[5] ??
          '';
        const platforms = splitPlatformList(raw);
        if (platforms.length === 0) {
          return body;
        }
        return platforms
          .map(
            (platform) =>
              `<PlatformStructured platform="${platform}">\n${body.trim()}\n</PlatformStructured>`,
          )
          .join('\n\n');
      }

      if (notAllowedMatch) {
        return body;
      }

      return body;
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

function normalizePlatformKey(platform) {
  if (platform === 'react-js') return 'javascript';
  return platform;
}

function normalizePlatformStructuredKeys(value) {
  return value.replace(
    /<PlatformStructured\s+platform="([^"]+)">/g,
    (_, platform) =>
      `<PlatformStructured platform="${normalizePlatformKey(platform)}">`,
  );
}

function getUnknownPlatformKeys(value) {
  const unknown = new Set();
  for (const match of value.matchAll(/platform="([^"]+)"/g)) {
    const platform = normalizePlatformKey(match[1]);
    if (!knownPlatformKeys.has(platform)) {
      unknown.add(platform);
    }
  }
  return [...unknown].sort();
}

function hasSinglePlatformRun(value) {
  const matches = [...value.matchAll(/<PlatformStructured\s+platform="([^"]+)">/g)];
  return matches.length === 1;
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

function resolveMarkdownLink(target, currentSource) {
  const expanded = resolveGlobalLink(target);
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
  const noExt = absolute.replace(/\.(md|mdx)$/, '');
  const key = noExt.replace(/^\/+/, '');

  if (routeMap.has(key)) {
    return routeMap.get(key);
  }

  if (key.startsWith('video-calling/')) {
    const local = key.replace(/^video-calling\//, '');
    if (routeMap.has(local)) return routeMap.get(local);
  }

  if (key === 'api-reference') {
    return '../../api-reference/rtc/index.md';
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
  ];
  for (const check of checks) {
    if (check.test(scanValue)) {
      patterns.push(check.toString());
    }
  }
  for (const platform of getUnknownPlatformKeys(scanValue)) {
    patterns.push(`unknown-platform:${platform}`);
  }
  if (hasSinglePlatformRun(scanValue)) {
    patterns.push('single-platform-structured-run');
  }
  return patterns;
}

function classifyExistingTarget(raw) {
  if (raw.includes('Placeholder page')) return 'placeholder';
  if (raw.includes('RTM owns the messaging')) return 'migration-seed content';
  return 'unknown existing content';
}

function buildMetaFiles(promoted) {
  const rootPromoted = new Set(existingSafeRootPages);
  const buildPromoted = new Set();
  const referencePromoted = new Set(existingSafeReferencePages);

  for (const page of promoted) {
    if (page.target.startsWith('build/')) {
      buildPromoted.add(path.basename(page.target, path.extname(page.target)));
      continue;
    }
    if (page.target.startsWith('reference/')) {
      referencePromoted.add(path.basename(page.target, path.extname(page.target)));
      continue;
    }
    rootPromoted.add(path.basename(page.target, path.extname(page.target)));
  }

  const orderedRootPages = [
    'product-overview',
    'core-concepts',
    'manage-agora-account',
    'account-settlement',
    'subscription-packages',
  ].filter((page) => rootPromoted.has(page));

  return {
    root: {
      title: 'Video Calling',
      navScope: {},
      sidebarIndexTitle: 'Quickstart',
      pages: [...orderedRootPages, 'build', 'reference'],
    },
    build: {
      title: 'Build',
      pages: [...buildPromoted],
    },
    reference: {
      title: 'Reference',
      pages: [...referencePromoted],
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
  const frontmatter = {
    title: stripWrappingQuotes(expanded.frontmatter.title ?? ''),
    description: stripWrappingQuotes(expanded.frontmatter.description ?? ''),
  };
  let body = rewriteMarkdownLinks(expanded.body, page.source);
  body = rewriteAssetRefs(body);
  body = normalizeImmediateDuplicateTabs(body);
  body = normalizePlatformStructuredKeys(body);

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
        'Expanded shared imports, product wrappers, variables, tabs, admonitions, details, links, and image references, then staged output for verification.',
      completedAttempts:
        'audit, classify, expand, extract, normalize, stage, page-verify',
      reason:
        'Normalized staging output still contains legacy runtime syntax or unresolved compatibility residue.',
    });
    staged.push(page.target);
    return;
  }

  const existing = (await exists(targetFile)) ? await readFile(targetFile) : null;
  if (existing) {
    const classification = classifyExistingTarget(existing);
    if (
      classification === 'unknown existing content' ||
      classification === 'authoritative hand-authored content' ||
      classification === 'mixed existing content'
    ) {
      blockers.push({
        source: page.source,
        target: page.target,
        flow: page.flow,
        blockerType: 'repository anomaly',
        exactPattern: `existing target classified as ${classification}`,
        attemptedAdaptation:
          'Inspected existing target content before promotion and staged migrated output.',
        completedAttempts:
          'audit, classify, expand, extract, normalize, stage, page-verify',
        reason:
          'Unknown or authoritative existing target content must not be overwritten in this batch.',
      });
      staged.push(page.target);
      return;
    }
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
  const lines = ['# Video Calling migration blockers', '', '## Deferred content', ''];

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
        '- Next missing rule, tool, or compatibility contract: keep deferred until the excluded lane or missing normalization rule is in scope.',
      );
      lines.push('');
    }
  }

  lines.push('## Repository anomaly', '');
  const anomalies = blockers.filter((item) => item.blockerType === 'repository anomaly');
  if (anomalies.length === 0) {
    lines.push('None.', '');
  } else {
    for (const item of anomalies) {
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
        '- Next missing rule, tool, or compatibility contract: manual merge review or an explicit overwrite decision.',
      );
      lines.push('');
    }
  }

  return lines.join('\n');
}

async function main() {
  await ensureDir(stagingRoot);
  await ensureDir(reportRoot);

  const blockers = deferredSeedPages.map((item) => ({
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
      'content/docs/en/realtime-media/video/meta.json',
      'content/docs/en/realtime-media/video/build/meta.json',
      'content/docs/en/realtime-media/video/reference/meta.json',
    ],
  });
}

if (import.meta.main) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}

export {
  findFatalPatterns,
  getUnknownPlatformKeys,
  normalizeImmediateDuplicateTabs,
  transformAdmonitions,
};
