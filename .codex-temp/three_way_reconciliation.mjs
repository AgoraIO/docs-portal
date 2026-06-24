import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { execFileSync } from 'node:child_process';

const repoRoot = process.cwd();
const sourceRoot = '/Users/yangyixuan/Documents/GitHub/doc-source-private';
const docsRoot = path.join(repoRoot, 'content/docs/en');
const openApiRoot = path.join(repoRoot, 'content/openapi');
const sitemapPath = path.join('/private/tmp', 'agora-docs-sitemap.xml');

const includeProducts = new Set(
  (process.env.PRODUCTS ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean),
);

const legacyComponentPattern =
  /<(?:Vg|Vpd|Vpl|Tabs|TabItem|PlatformWrapper|ProductWrapper|PlatformFilter|Admonition|ProductOverview|QuickStartCard|RecommendCard|HotArticleCard|LinkCardV2|RestfulRender|OpenapiRender|ApiSectionCard|OverloadMethodCollapse|OverloadMethodCollapsePanel)\b|@site\/src\/components|@docs\/shared|from\s+['"]@docusaurus\//;

const frontmatterRequired = ['title', 'description'];

function listFiles(root, predicate) {
  const out = [];
  if (!fs.existsSync(root)) return out;
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules' || entry.name === 'dist') {
      continue;
    }
    const full = path.join(root, entry.name);
    if (entry.isDirectory()) {
      out.push(...listFiles(full, predicate));
      continue;
    }
    if (predicate(full)) out.push(full);
  }
  return out.sort();
}

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function rel(root, file) {
  return path.relative(root, file).split(path.sep).join('/');
}

function withoutExt(file) {
  return file.replace(/\.(mdx?|ya?ml|json)$/i, '');
}

function routeFromTargetRel(targetRel) {
  const noExt = withoutExt(targetRel);
  return noExt.endsWith('/index') ? noExt.slice(0, -'/index'.length) : noExt;
}

function titleize(slug) {
  return slug
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();
}

function parseFrontmatter(markdown) {
  if (!markdown.startsWith('---\n')) return null;
  const end = markdown.indexOf('\n---', 4);
  if (end === -1) return null;
  const raw = markdown.slice(4, end);
  const fields = {};
  for (const line of raw.split(/\r?\n/)) {
    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!match) continue;
    fields[match[1]] = match[2].trim();
  }
  return fields;
}

function parseCategory(file) {
  try {
    const parsed = JSON.parse(read(file));
    const label = parsed.label ?? parsed.title;
    const position = Number.isFinite(parsed.position) ? parsed.position : null;
    return { label, position };
  } catch {
    return { label: null, position: null };
  }
}

function parseMeta(file) {
  try {
    const parsed = JSON.parse(read(file));
    return {
      title: parsed.title ?? null,
      pages: Array.isArray(parsed.pages) ? parsed.pages : [],
    };
  } catch {
    return { title: null, pages: [] };
  }
}

function normalizeSlugForCompare(value) {
  return value
    .toLowerCase()
    .replace(/\.mdx?$/g, '')
    .replace(/index$/g, 'overview')
    .replace(/product-overview/g, 'index')
    .replace(/overview/g, 'index')
    .replace(/develop/g, 'build')
    .replace(/best-practice/g, 'best-practices')
    .replace(/rest-api/g, 'api-ref')
    .replace(/restful-api/g, 'api-ref')
    .replace(/realtime/g, 'real-time')
    .replace(/speech-to-text/g, 'stt')
    .replace(/real-time-stt/g, 'stt')
    .replace(/conversational-ai/g, 'ai')
    .replace(/open-ai-integration/g, 'openai-realtime')
    .replace(/convo-ai-device-kit/g, 'device-kit')
    .replace(/[^a-z0-9]+/g, '');
}

function getSourceTitle(file) {
  const markdown = read(file);
  const fm = parseFrontmatter(markdown);
  let title = fm?.title?.replace(/^['"]|['"]$/g, '') ?? '';
  if (!title) {
    const heading = markdown.match(/^#\s+(.+)$/m);
    title = heading?.[1]?.trim() ?? '';
  }
  if (!title) title = titleize(path.basename(file).replace(/\.(mdx?|ya?ml)$/i, ''));
  return title;
}

function makeTargetIndex() {
  const markdownFiles = listFiles(docsRoot, (file) => /\.(md|mdx)$/i.test(file));
  const metaFiles = listFiles(docsRoot, (file) => /meta\.json$/i.test(file));
  const targets = [];
  const bySlug = new Map();
  const byTitle = new Map();
  const metaByDir = new Map();

  for (const file of metaFiles) {
    const dir = rel(docsRoot, path.dirname(file));
    metaByDir.set(dir, parseMeta(file));
  }

  for (const file of markdownFiles) {
    const targetRel = rel(docsRoot, file);
    const route = routeFromTargetRel(targetRel);
    const markdown = read(file);
    const fm = parseFrontmatter(markdown);
    const title = fm?.title?.replace(/^['"]|['"]$/g, '') ?? '';
    const item = {
      file,
      rel: targetRel,
      route,
      url: `https://docs.agora.io/en/${route}`,
      markdown,
      fm,
      title,
      routeKey: normalizeSlugForCompare(route),
      baseKey: normalizeSlugForCompare(path.basename(targetRel)),
      titleKey: normalizeSlugForCompare(title),
    };
    targets.push(item);
    pushMap(bySlug, item.baseKey, item);
    pushMap(bySlug, item.routeKey, item);
    if (item.titleKey) pushMap(byTitle, item.titleKey, item);
  }

  for (const item of getOpenApiVirtualTargets()) {
    targets.push(item);
    pushMap(bySlug, item.baseKey, item);
    pushMap(bySlug, item.routeKey, item);
    if (item.titleKey) pushMap(byTitle, item.titleKey, item);
  }

  return { targets, bySlug, byTitle, metaByDir };
}

function getOpenApiVirtualTargets() {
  const source = read(path.join(repoRoot, 'src/lib/openapi/lanes.ts'));
  const lanes = [];

  for (const lane of [
    {
      id: 'convoai',
      routePrefix: 'api-reference/api-ref/conversational-ai',
      sourcePath: 'content/openapi/conversational-ai/rest-api.en.yaml',
    },
    {
      id: 'cloud-recording-rest',
      routePrefix: 'api-reference/api-ref/cloud-recording',
      sourcePath: 'content/openapi/cloud-recording/cloud-recording.en.yaml',
    },
    {
      id: 'cloud-transcoding-rest',
      routePrefix: 'api-reference/api-ref/cloud-transcoding',
      sourcePath: 'content/openapi/cloud-transcoding/cloud-transcoding.en.yaml',
    },
    {
      id: 'speech-to-text-rest',
      routePrefix: 'api-reference/api-ref/speech-to-text',
      sourcePath: 'content/openapi/speech-to-text/v7.en.yaml',
    },
  ]) {
    const laneStart = source.indexOf(`id: '${lane.id}'`);
    if (laneStart === -1) continue;
    const nextLaneStart = source.indexOf('\n  {', laneStart + 5);
    const laneBlock = source.slice(
      laneStart,
      nextLaneStart === -1 ? source.length : nextLaneStart,
    );
    const opPattern =
      /['"]?([A-Za-z0-9_-]+)['"]?:\s*\{\s*routeLeaf:\s*'([^']+)'[\s\S]*?en:\s*'([^']+)'/g;
    for (const op of laneBlock.matchAll(opPattern)) {
      const [, operationId, routeLeaf, title] = op;
      const route = `${lane.routePrefix}/${routeLeaf}`;
      const file = path.join(repoRoot, lane.sourcePath);
      const markdown = fs.existsSync(file) ? read(file) : '';
      const targetRel = `openapi:${lane.sourcePath}#${operationId}`;
      lanes.push({
        file,
        rel: targetRel,
        route,
        url: `https://docs.agora.io/en/${route}`,
        markdown,
        fm: { title, description: `OpenAPI operation ${operationId}` },
        title,
        isOpenApi: true,
        sourcePath: lane.sourcePath,
        operationId,
        routeKey: normalizeSlugForCompare(route),
        baseKey: normalizeSlugForCompare(routeLeaf),
        titleKey: normalizeSlugForCompare(title),
      });
    }
  }

  return lanes;
}

function pushMap(map, key, value) {
  if (!key) return;
  if (!map.has(key)) map.set(key, []);
  map.get(key).push(value);
}

function getSitemapUrls() {
  let xml = '';
  if (fs.existsSync(sitemapPath)) {
    xml = read(sitemapPath);
  } else {
    try {
      xml = execFileSync('curl', ['-sS', 'https://docs.agora.io/sitemap.xml'], {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      });
      fs.writeFileSync(sitemapPath, xml);
    } catch {
      xml = '';
    }
  }
  return new Set([...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]));
}

function sourceOnlineUrl(sourceRel) {
  return `https://docs.agora.io/en/${withoutExt(sourceRel)}`;
}

function sourceProduct(sourceRel) {
  return sourceRel.split('/')[0];
}

function expectedRoutes(sourceRel) {
  const noExt = withoutExt(sourceRel);
  const parts = noExt.split('/');
  const product = parts[0];
  const rest = parts.slice(1);
  const leaf = rest[rest.length - 1];
  const routes = [];

  const add = (route) => {
    if (!route) return;
    routes.push(route.replace(/\/+/g, '/').replace(/\/$/, ''));
  };

  if (product === 'conversational-ai') {
    if (rest[0] === 'overview') {
      if (leaf === 'product-overview') add('ai/apps');
      else if (leaf === 'pricing') add('ai/apps/pricing');
      else if (leaf === 'release-notes') add('ai/apps/release-notes');
      else add(`ai/apps/reference/${leaf}`);
    } else if (rest[0] === 'develop') {
      const developMap = {
        'audio-output': 'ai/apps/build/custom-model-integration/audio-output',
        'build-server-client': 'ai/apps/build/custom-model-integration/build-server-client',
        'custom-information': 'ai/apps/build/shape-the-conversation/custom-information',
        'custom-llm': 'ai/apps/build/custom-model-integration/custom-llm',
        'debug-agent-failures': 'ai/apps/build/handle-runtime-events/debug-agent-failures',
        'event-notifications': 'ai/apps/build/handle-runtime-events/event-notifications',
        'event-types': 'ai/apps/reference/event-types',
        'filler-words': 'ai/apps/build/shape-the-conversation/filler-words',
        'get-runtime-events': 'ai/apps/build/handle-runtime-events/get-runtime-events',
        'interrupt-agent': 'ai/apps/build/shape-the-conversation/interrupt-agent',
        'monitor-agent-runtime': 'ai/apps/build/handle-runtime-events/monitor-agent-runtime',
        presets: 'ai/apps/build/custom-model-integration/presets',
        'retrieve-session-history': 'ai/apps/build/handle-runtime-events/retrieve-session-history',
        'send-multimodal-messages': 'ai/apps/build/send-multimodal-messages',
        'short-term-memory': 'ai/apps/build/shape-the-conversation/short-term-memory',
        'start-stop-agent': 'ai/apps/build/start-stop-agent',
        transcripts: 'ai/apps/build/transcripts',
        webhooks: 'ai/apps/build/handle-runtime-events/webhooks',
      };
      if (developMap[leaf]) add(developMap[leaf]);
      else add(`ai/apps/build/${leaf}`);
    } else if (rest[0] === 'studio') {
      if (leaf === 'overview') add('ai/studio');
      else add(`ai/studio/${rest.slice(1).join('/')}`);
    } else if (rest[0] === 'rest-api') {
      if (leaf === 'restful-authentication') add('api-reference/api-ref/conversational-ai/authentication');
      else if (leaf === 'reference') add('api-reference/api-ref/conversational-ai');
      else add(`api-reference/api-ref/conversational-ai/${leaf}`);
    } else if (rest[0] === 'get-started') {
      add(`ai/apps/get-started/${leaf}`);
    } else if (rest[0] === 'best-practices') {
      if (leaf === 'cloud-recording') add('ai/apps/build/record-agent-conversation');
      else if (leaf === 'filler-words') add('ai/apps/build/shape-the-conversation/filler-words');
      else if (leaf === 'audio-setup') add('ai/apps/build/harden-and-optimize/audio-setup');
      else if (leaf === 'optimize-latency') add('ai/apps/build/harden-and-optimize/optimize-latency');
      else if (leaf === 'regional-restrictions') add('ai/apps/build/harden-and-optimize/regional-restrictions');
      else add(`ai/apps/build/harden-and-optimize/${leaf}`);
    } else if (rest[0] === 'reference') {
      if (leaf === 'enable-conversational-ai') add('ai/apps/reference/enable-conversational-ai');
      else if (rest[1] === 'toolkot') add(`ai/apps/build/${leaf}`);
      else if (rest[1] === 'sdk') {
        if (leaf === 'go') add('api-reference/recipes/golang-quickstart');
        else if (leaf === 'python') add('api-reference/recipes/python-quickstart');
        else if (leaf === 'typescript') add('api-reference/recipes/nextjs-quickstart');
        else add(`api-reference/recipes/${leaf}`);
      }
      else add(`ai/apps/reference/${leaf}`);
    } else if (rest[0] === 'models') {
      const category = rest[1];
      if (leaf === 'overview') add(`ai/apps/models/${category}`);
      else add(`ai/apps/models/${category}/${leaf}`);
    }
  } else if (product === 'open-ai-integration') {
    if (rest[0] === 'overview') {
      if (leaf === 'product-overview') add('ai/openai-realtime');
      else add(`ai/openai-realtime/overview/${leaf}`);
    } else if (rest[0] === 'get-started') {
      add(`ai/openai-realtime/get-started/${leaf}`);
    } else if (rest[0] === 'reference') {
      add(`ai/openai-realtime/reference/${leaf}`);
    }
  } else if (product === 'real-time-stt') {
    if (rest[0] === 'overview') {
      if (leaf === 'product-overview') add('realtime-media/speech-to-text');
      else add(`realtime-media/speech-to-text/reference/${leaf}`);
    } else if (rest[0] === 'develop') {
      if (leaf === 'api-callback-service') add('realtime-media/speech-to-text/reference/api-callback-service');
      else if (leaf === 'supported-languages') add('realtime-media/speech-to-text/reference/supported-languages');
      else add(`realtime-media/speech-to-text/build/${leaf}`);
    } else if (rest[0] === 'best-practice') {
      if (leaf === 'enable-service') add('realtime-media/speech-to-text/build/enable-service');
      else if (leaf === 'optimize-quality') add('realtime-media/speech-to-text/build/optimize-quality');
    } else if (rest[0] === 'reference') {
      if (leaf === 'manage-agora-account') add('realtime-media/speech-to-text/reference/manage-agora-account');
      else add(`realtime-media/speech-to-text/reference/${leaf}`);
    } else if (rest[0] === 'get-started') {
      if (leaf === 'manage-agora-account') add('realtime-media/speech-to-text/reference/manage-agora-account');
      else if (leaf === 'quickstart') add('realtime-media/speech-to-text/get-started/quickstart');
      else add(`realtime-media/speech-to-text/get-started/${leaf}`);
    } else if (rest[0] === 'rest-api') {
      if (leaf === 'restful-authentication') add('api-reference/api-ref/speech-to-text/authentication');
      else if (rest[1] === 'v5.x') add(`realtime-media/speech-to-text/reference/rest-api-v5/${leaf}`);
      else if (rest[1] === 'v6.x') add(`realtime-media/speech-to-text/reference/rest-api-v6/${leaf}`);
      else if (rest[1] === 'v7.x') add(`api-reference/api-ref/speech-to-text/${leaf}`);
      else add('api-reference/api-ref/speech-to-text');
    }
  } else if (product === 'convo-ai-device-kit') {
    if (rest[0] === 'overview') {
      if (leaf === 'product-overview') add('ai/device-kit');
      else if (leaf === 'architecture') add('ai/device-kit/build/architecture-overview');
      else add(`ai/device-kit/reference/${leaf}`);
    } else if (rest[0] === 'get-started') {
      if (leaf === 'quickstart') add('ai/device-kit/start-here/quickstart');
      else if (leaf === 'enable-services') add('ai/device-kit/reference/enable-services');
      else add(`ai/device-kit/build/${leaf}`);
    } else if (rest[0] === 'reference') {
      add(`ai/device-kit/reference/${leaf}`);
    }
  } else {
    const topMap = {
      'video-calling': 'realtime-media/video',
      'voice-calling': 'realtime-media/voice',
      'interactive-live-streaming': 'solutions/interactive-live-streaming',
      'broadcast-streaming': 'realtime-media/broadcast-streaming',
      'cloud-recording': 'realtime-media/cloud-recording',
      'cloud-transcoding': 'realtime-media/transcoding',
      'interactive-whiteboard': 'realtime-media/whiteboard',
      signaling: 'realtime-media/rtm',
      'agora-chat': 'realtime-media/im',
      'media-gateway': 'realtime-media/rtmp-gateway',
      'media-pull': 'realtime-media/media-pull',
      'media-push': 'realtime-media/media-push',
      'server-gateway': 'realtime-media/rtc-server-sdk',
      'on-premise-recording': 'realtime-media/on-premise-recording',
      'extensions-marketplace': 'realtime-media/marketplace',
      iot: 'solutions/iot',
      'agora-analytics': 'solutions/agora-analytics',
      'flexible-classroom': 'solutions/flexible-classroom',
    };
    const mapped = topMap[product];
    if (mapped) {
      const mappedRest = rest
        .map((part) =>
          part
            .replace(/^overview$/, '')
            .replace(/^develop$/, 'build')
            .replace(/^best-practice$/, 'best-practices')
            .replace(/^product-overview$/, 'index'),
        )
        .filter(Boolean);
      add([mapped, ...mappedRest].join('/'));
    }
  }

  return [...new Set(routes)];
}

function sourceToTarget(sourceFile, targetIndex) {
  const sourceRel = rel(sourceRoot, sourceFile);
  const product = sourceProduct(sourceRel);
  const routes = expectedRoutes(sourceRel);
  for (const route of routes) {
    const direct = targetIndex.targets.find((item) => item.route === route);
    if (direct) return { target: direct, route, match: 'explicit-route' };
  }

  const sourceTitle = getSourceTitle(sourceFile);
  const titleKey = normalizeSlugForCompare(sourceTitle);
  const leafKey = normalizeSlugForCompare(path.basename(sourceRel));
  const productKey = normalizeSlugForCompare(product);
  const routeKeys = routes.map(normalizeSlugForCompare);
  const candidates = [
    ...(targetIndex.byTitle.get(titleKey) ?? []),
    ...(targetIndex.bySlug.get(leafKey) ?? []),
  ].filter((item, index, arr) => arr.indexOf(item) === index);

  const scored = candidates
    .map((item) => {
      let score = 0;
      if (item.titleKey === titleKey) score += 6;
      if (item.baseKey === leafKey) score += 4;
      if (routeKeys.some((key) => item.routeKey.includes(key) || key.includes(item.routeKey))) score += 6;
      if (item.routeKey.includes(productKey)) score += 2;
      if (product === 'real-time-stt' && item.route.includes('speech-to-text')) score += 3;
      if (product === 'open-ai-integration' && item.route.includes('openai-realtime')) score += 3;
      if (product === 'conversational-ai' && item.route.includes('ai')) score += 2;
      return { item, score };
    })
    .sort((a, b) => b.score - a.score);

  if (scored[0]?.score >= 7) {
    return { target: scored[0].item, route: scored[0].item.route, match: 'fuzzy' };
  }

  return { target: null, route: routes[0] ?? '', match: 'missing' };
}

function hasMetaEntry(target, targetIndex) {
  if (!target) return false;
  if (target.isOpenApi) {
    const parent = path.posix.dirname(target.route);
    const parentMeta = targetIndex.metaByDir.get(parent);
    if (!parentMeta) return false;
    return parentMeta.pages.includes(path.posix.basename(target.route));
  }
  const dir = path.dirname(target.rel).split(path.sep).join('/');
  const basename = path.basename(target.rel).replace(/\.(md|mdx)$/i, '');
  const entry = basename === 'index' ? 'index' : basename;
  const meta = targetIndex.metaByDir.get(dir);
  const relativeRoute = target.rel.replace(/\.(md|mdx)$/i, '').replace(/\/index$/, '');
  const routeParts = relativeRoute.split('/');
  const pageListedIn = (metaDir, pageEntry) => {
    if (pageEntry === entry || pageEntry === `...${entry}`) return true;
    const metaPrefix = metaDir ? `${metaDir}/` : '';
    const fromMeta = `${metaPrefix}${pageEntry}`.replace(/\/index$/, '');
    return fromMeta === relativeRoute || `${fromMeta}/index` === relativeRoute;
  };
  if (!meta) {
    for (let i = routeParts.length - 1; i >= 0; i -= 1) {
      const ancestor = routeParts.slice(0, i).join('/');
      const ancestorMeta = targetIndex.metaByDir.get(ancestor);
      if (!ancestorMeta) continue;
      if (ancestorMeta.pages.some((page) => typeof page === 'string' && pageListedIn(ancestor, page))) {
        return true;
      }
    }
    return false;
  }
  if (meta.pages.length === 0) return true;
  return meta.pages.some((page) => {
    if (typeof page === 'string') return pageListedIn(dir, page);
    return false;
  });
}

function getTargetFrontmatterScore(target) {
  if (!target || !target.fm) return 0;
  return frontmatterRequired.every((key) => {
    const value = target.fm?.[key];
    return value && value !== "''" && value !== '""';
  })
    ? 1
    : 0;
}

function getLegacyScore(target) {
  if (!target) return 0;
  return legacyComponentPattern.test(target.markdown) ? 0 : 1;
}

function getYamlScore(sourceFile) {
  const sourceRel = rel(sourceRoot, sourceFile);
  const product = sourceProduct(sourceRel);
  const sourceDir = path.dirname(sourceFile);
  const sourceYaml = listFiles(sourceDir, (file) => /\.(yaml|yml)$/i.test(file));
  if (sourceYaml.length === 0) return 1;

  if (product === 'conversational-ai') {
    return fs.existsSync(path.join(openApiRoot, 'conversational-ai/rest-api.en.yaml')) ? 1 : 0;
  }
  if (product === 'real-time-stt') {
    return fs.existsSync(path.join(openApiRoot, 'speech-to-text/v7.en.yaml')) ? 1 : 0;
  }
  return 0;
}

function cleanHref(href) {
  return href
    .replace(/^<|>$/g, '')
    .split(/\s+/)[0]
    .replace(/^['"]|['"]$/g, '');
}

function splitHref(href) {
  const [withoutHash, hash = ''] = href.split('#');
  const [pathname, query = ''] = withoutHash.split('?');
  return { pathname, query, hash };
}

function extractLinks(markdown) {
  const links = [];
  const markdownLinkPattern = /(!?)\[[^\]\n]*\]\(([^)\n]+)\)/g;
  const htmlHrefPattern = /\bhref\s*=\s*(?:"([^"]*)"|'([^']*)')/gi;
  for (const match of markdown.matchAll(markdownLinkPattern)) {
    if (match[1] === '!') continue;
    links.push(cleanHref(match[2]));
  }
  for (const match of markdown.matchAll(htmlHrefPattern)) {
    links.push(cleanHref(match[1] ?? match[2] ?? ''));
  }
  return links.filter(Boolean);
}

function routeSet(targetIndex) {
  return new Set(targetIndex.targets.map((item) => item.route));
}

function linkScore(target, targetIndex) {
  if (!target) return { score: 0, missing: [] };
  if (target.isOpenApi) return { score: 1, missing: [] };
  const routes = routeSet(targetIndex);
  const missing = [];
  const links = extractLinks(target.markdown);
  for (const href of links) {
    if (
      href.startsWith('#') ||
      href.startsWith('mailto:') ||
      /^[a-z][a-z0-9+.-]*:/i.test(href) ||
      href.startsWith('//')
    ) {
      continue;
    }
    if (href.startsWith('/')) {
      if (
        href.startsWith('/images/') ||
        href.startsWith('/img/') ||
        href.startsWith('/openapi/') ||
        href.startsWith('/llms') ||
        href.startsWith('/api/')
      ) {
        continue;
      }
      const parsed = splitHref(href);
      const route = parsed.pathname.replace(/^\/en\//, '').replace(/^\//, '').replace(/\/$/, '');
      if (!routes.has(route)) missing.push(href);
      continue;
    }
    const parsed = splitHref(href);
    if (!parsed.pathname || !/\.(md|mdx)?$/i.test(parsed.pathname) && !parsed.pathname.includes('/')) {
      continue;
    }
    if (/\.(png|jpe?g|gif|svg|webp|zip|pdf)$/i.test(parsed.pathname)) {
      continue;
    }
    const targetPath = target.rel.replace(/\.(md|mdx)$/i, '');
    const baseRoute = path.posix.dirname(targetPath);
    const route = path.posix
      .normalize(path.posix.join(baseRoute, parsed.pathname))
      .replace(/\.(md|mdx)$/i, '')
      .replace(/\/index$/, '')
      .replace(/^\.\//, '');
    if (!routes.has(route)) missing.push(href);
  }
  return { score: missing.length === 0 ? 1 : 0, missing: missing.slice(0, 3) };
}

function onlineScore(onlineUrl, sitemapUrls) {
  if (sitemapUrls.has(onlineUrl)) return 1;
  if (sitemapUrls.has(`${onlineUrl}/`)) return 1;
  return 0;
}

function risk(scores) {
  if (!scores.jsx || !scores.targetExists) return '高';
  if (!scores.frontmatter || !scores.meta) return '中';
  if (!scores.links) return '低';
  return '低';
}

function summarizeNote({ target, match, online, linkResult, scores, sourceRel }) {
  const notes = [];
  if (!scores.targetExists) notes.push('docs-portal 未找到可匹配页面');
  if (!online) notes.push('线上 sitemap 未收录旧路径');
  if (target && match === 'fuzzy') notes.push('目标页为模糊匹配');
  if (!scores.frontmatter) notes.push('frontmatter 缺 title/description');
  if (!scores.meta) notes.push('meta.json 未收录或缺失');
  if (!scores.links && linkResult.missing?.length) notes.push(`断链: ${linkResult.missing.join(', ')}`);
  if (!scores.yaml) notes.push('源侧 YAML/OpenAPI 未在目标 OpenAPI 源中确认');
  if (!scores.jsx && target) notes.push('残留 JSX/旧组件');
  if (!target && sourceRel.includes('/rest-api/')) notes.push('REST 源页可能需要 OpenAPI route/operation 映射');
  return notes.join('；');
}

function main() {
  const targetIndex = makeTargetIndex();
  const sitemapUrls = getSitemapUrls();
  const sourceFiles = listFiles(sourceRoot, (file) => /\.(md|mdx)$/i.test(file)).filter((file) => {
    const sourceRel = rel(sourceRoot, file);
    if (sourceRel.startsWith('shared/')) return false;
    if (sourceRel.startsWith('assets/')) return false;
    const product = sourceProduct(sourceRel);
    if (includeProducts.size > 0 && !includeProducts.has(product)) return false;
    return !sourceRel.startsWith('.') && !sourceRel.startsWith('scripts/');
  });

  const rows = [];
  for (const sourceFile of sourceFiles) {
    const sourceRel = rel(sourceRoot, sourceFile);
    const product = sourceProduct(sourceRel);
    const { target, route, match } = sourceToTarget(sourceFile, targetIndex);
    const onlineUrl = sourceOnlineUrl(sourceRel);
    const online = onlineScore(onlineUrl, sitemapUrls);
    const linkResult = linkScore(target, targetIndex);
    const scores = {
      targetExists: target ? 1 : 0,
      frontmatter: getTargetFrontmatterScore(target),
      meta: target ? (hasMetaEntry(target, targetIndex) ? 1 : 0) : 0,
      links: linkResult.score,
      yaml: getYamlScore(sourceFile),
      jsx: getLegacyScore(target),
    };
    const gateScores = {
      frontmatter: scores.frontmatter,
      meta: scores.meta,
      links: scores.links,
      yaml: scores.yaml,
      jsx: scores.jsx,
    };
    const failed = Object.values(gateScores).some((score) => score === 0);
    if (!failed) continue;

    rows.push({
      product,
      article: getSourceTitle(sourceFile),
      docsPortalPath: target ? target.rel : route ? `未找到（期望 ${route}）` : '未找到',
      onlinePath: onlineUrl,
      sourcePath: sourceFile,
      gates: `${gateScores.frontmatter}/${gateScores.meta}/${gateScores.links}/${gateScores.yaml}/${gateScores.jsx}`,
      risk: risk(scores),
      note: summarizeNote({
        target,
        match,
        online,
        linkResult,
        scores,
        sourceRel,
      }),
    });
  }

  rows.sort((a, b) => {
    const riskOrder = { 高: 0, 中: 1, 低: 2 };
    return (
      riskOrder[a.risk] - riskOrder[b.risk] ||
      a.product.localeCompare(b.product) ||
      a.sourcePath.localeCompare(b.sourcePath)
    );
  });

  const summary = rows.reduce(
    (acc, row) => {
      acc.total += 1;
      acc.byRisk[row.risk] = (acc.byRisk[row.risk] ?? 0) + 1;
      acc.byProduct[row.product] = (acc.byProduct[row.product] ?? 0) + 1;
      return acc;
    },
    { total: 0, byRisk: {}, byProduct: {} },
  );

  console.log(JSON.stringify({ summary, rows }, null, 2));
}

main();
