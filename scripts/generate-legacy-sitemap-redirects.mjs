import fs from 'node:fs';
import path from 'node:path';

const SITEMAP_PATH = 'src/lib/legacy-sitemap/sitemap.xml';
const INVENTORY_PATH = 'src/lib/legacy-sitemap/new-docs-inventory.json';
const REDIRECTS_PATH = 'src/lib/legacy-sitemap/redirects.json';
const REVIEW_REPORT_PATH = 'src/lib/legacy-sitemap/review-report.json';
const SNAPSHOT_DOWNLOADED_AT = '2026-06-29';

const PRODUCT_MAPPINGS = {
  'agora-analytics': {
    base: '/en/solutions/agora-analytics',
    fallback: '/en/solutions/agora-analytics/product-overview',
  },
  'agora-chat': {
    base: '/en/realtime-media/im',
    fallback: '/en/realtime-media/im',
  },
  'broadcast-streaming': {
    base: '/en/realtime-media/broadcast-streaming',
    fallback: '/en/realtime-media/broadcast-streaming',
  },
  'cloud-recording': {
    base: '/en/realtime-media/cloud-recording',
    fallback: '/en/realtime-media/cloud-recording',
  },
  'cloud-transcoding': {
    base: '/en/realtime-media/transcoding',
    fallback: '/en/realtime-media/transcoding',
  },
  'conversational-ai': {
    base: '/en/ai',
    fallback: '/en/ai',
  },
  'convo-ai-device-kit': {
    base: '/en/ai/device-kit',
    fallback: '/en/ai/device-kit/start-here/quickstart',
  },
  'extensions-marketplace': {
    base: '/en/realtime-media/marketplace',
    fallback: '/en/realtime-media/marketplace',
  },
  'flexible-classroom': {
    base: '/en/solutions/flexible-classroom',
    fallback: '/en/solutions/flexible-classroom/product-overview',
  },
  'interactive-live-streaming': {
    base: '/en/solutions/interactive-live-streaming',
    fallback: '/en/solutions/interactive-live-streaming/product-overview',
  },
  'interactive-whiteboard': {
    base: '/en/realtime-media/whiteboard',
    fallback: '/en/realtime-media/whiteboard',
  },
  iot: {
    base: '/en/solutions/iot',
    fallback: '/en/solutions/iot/product-overview',
  },
  'media-gateway': {
    base: '/en/realtime-media/rtmp-gateway',
    fallback: '/en/realtime-media/rtmp-gateway',
  },
  'media-pull': {
    base: '/en/realtime-media/media-pull',
    fallback: '/en/realtime-media/media-pull',
  },
  'media-push': {
    base: '/en/realtime-media/media-push',
    fallback: '/en/realtime-media/media-push',
  },
  'on-premise-recording': {
    base: '/en/realtime-media/on-premise-recording',
    fallback: '/en/realtime-media/on-premise-recording',
  },
  'open-ai-integration': {
    base: '/en/ai/reference',
    fallback: '/en/ai/reference/openai-realtime-integration',
  },
  'real-time-stt': {
    base: '/en/realtime-media/speech-to-text',
    fallback: '/en/realtime-media/speech-to-text',
  },
  'server-gateway': {
    base: '/en/realtime-media/rtc-server-sdk',
    fallback: '/en/realtime-media/rtc-server-sdk',
  },
  signaling: {
    base: '/en/realtime-media/rtm',
    fallback: '/en/realtime-media/rtm',
  },
  'ten-agent': {
    base: '/en/ai/ten-agent',
    fallback: '/en/ai/ten-agent/project-overview',
  },
  'ten-framework': {
    base: '/en/ai/ten-agent',
    fallback: '/en/ai/ten-agent/project-overview',
  },
  'video-calling': {
    base: '/en/realtime-media/video',
    fallback: '/en/realtime-media/video',
  },
  'voice-calling': {
    base: '/en/realtime-media/voice',
    fallback: '/en/realtime-media/voice',
  },
};

const RENAMED_LEAVES = new Map([
  ['product-overview', ['product-overview', 'overview']],
  ['quickstart', ['quickstart', 'get-started-sdk', 'quick-start']],
  ['get-started-sdk', ['get-started-sdk', 'quickstart', 'quick-start']],
  ['pricing', ['pricing', 'billing-policies']],
  ['authentication', ['authentication', 'restful-authentication']],
]);

const inventory = buildInventory();
writeJson(INVENTORY_PATH, {
  generatedAt: SNAPSHOT_DOWNLOADED_AT,
  routes: inventory,
});

const generated = buildRedirects(inventory);
writeJson(REDIRECTS_PATH, generated.redirects);
writeJson(REVIEW_REPORT_PATH, generated.reviewReport);

console.log(generated.reviewReport.summary);

function buildInventory() {
  const files = [];
  walk('content/docs/en', files);

  return files.sort().map((file) => {
    const text = fs.readFileSync(file, 'utf8');
    const routePath = routeFromFile(file);
    const segments = routePath.split('/').filter(Boolean);
    const [, tab, productOrSection, section] = segments;
    const title = titleFrom(text, file);
    const headings = headingsFrom(text);
    const body = stripFrontmatter(text)
      .replace(/```[\s\S]*?```/g, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    return {
      routePath,
      title,
      headings,
      product: productOrSection || tab || '',
      section: section || '',
      sourceFilePath: file,
      slugSegments: segments.slice(1),
      leafSlug: segments.at(-1) || '',
      searchText:
        `${routePath} ${title} ${headings.join(' ')} ${body.slice(0, 2000)}`.toLowerCase(),
    };
  });
}

function buildRedirects(routes) {
  const xml = fs.readFileSync(SITEMAP_PATH, 'utf8');
  const legacyUrls = Array.from(
    xml.matchAll(/<loc>([^<]+)<\/loc>/g),
    (match) => match[1],
  );
  const routeSet = new Set(routes.map((route) => route.routePath));
  const summary = {
    totalLegacyUrls: legacyUrls.length,
    native: 0,
    exactPath: 0,
    exactSlug: 0,
    renamedPage: 0,
    semanticPageMatch: 0,
    productFallback: 0,
    unavailable: 0,
    broken: 0,
  };
  const rules = [];
  const reviewItems = [];

  for (const href of legacyUrls) {
    const info = legacyInfo(href);

    if (routeSet.has(info.legacyPath)) {
      summary.native += 1;
      continue;
    }

    const candidates = candidateRoutes(routes, info.product);
    const match =
      exactTarget(info, routeSet) ||
      leafTarget(info, candidates) ||
      fallback(info, candidates);
    const summaryKey = {
      'exact-path': 'exactPath',
      'exact-slug': 'exactSlug',
      'renamed-page': 'renamedPage',
      'semantic-page-match': 'semanticPageMatch',
      'product-fallback': 'productFallback',
      unavailable: 'unavailable',
    }[match.type];
    const confidence =
      match.type === 'product-fallback' || match.type === 'unavailable'
        ? 'low'
        : match.type === 'semantic-page-match'
          ? 'medium'
          : 'high';

    summary[summaryKey] += 1;
    rules.push({
      legacyUrl: info.href,
      legacyPath: info.legacyPath,
      ...(info.legacySearch ? { legacySearch: info.legacySearch } : {}),
      target: match.target,
      type: match.type,
      confidence,
      evidence: match.evidence,
      preserveSearch: true,
    });

    if (
      match.type === 'product-fallback' ||
      match.type === 'unavailable' ||
      confidence !== 'high'
    ) {
      reviewItems.push({
        legacyUrl: info.href,
        appliedTarget: match.target,
        appliedRuleType: match.type,
        confidence,
        reviewPriority:
          match.type === 'product-fallback' || match.type === 'unavailable'
            ? 'high'
            : 'medium',
        reason: match.evidence[0],
        candidates: match.candidates || [],
      });
    }
  }

  return {
    redirects: {
      sourceSitemapUrl: 'https://docs.agora.io/sitemap.xml',
      snapshotPath: SITEMAP_PATH,
      snapshotDownloadedAt: SNAPSHOT_DOWNLOADED_AT,
      rules,
    },
    reviewReport: {
      summary,
      items: reviewItems,
    },
  };
}

function exactTarget(info, routeSet) {
  const mapping = PRODUCT_MAPPINGS[info.product];
  if (!mapping) {
    return null;
  }

  const suffix = info.rest.join('/');
  const direct = `${mapping.base}/${suffix}`.replace(/\/$/, '');

  return routeSet.has(direct)
    ? {
        target: direct,
        type: 'exact-path',
        evidence: [
          `legacy path suffix ${suffix} exists under migrated product area ${mapping.base}`,
        ],
      }
    : null;
}

function leafTarget(info, candidates) {
  const exact = candidates.filter((route) => route.leafSlug === info.leaf);
  if (exact.length === 1) {
    return {
      target: exact[0].routePath,
      type: 'exact-slug',
      evidence: [
        `target leaf slug ${info.leaf} matches legacy leaf slug`,
        `legacy product ${info.product} maps to ${PRODUCT_MAPPINGS[info.product].base}`,
      ],
    };
  }

  if (exact.length > 1) {
    return bestByContext(info, exact, 'exact-slug');
  }

  const renamedLeaf = Array.from(RENAMED_LEAVES.entries())
    .filter(([, aliases]) => aliases.includes(info.leaf))
    .map(([canonical]) => canonical);
  const renamed = candidates.filter((route) =>
    renamedLeaf.includes(route.leafSlug),
  );

  if (renamed.length === 1) {
    return {
      target: renamed[0].routePath,
      type: 'renamed-page',
      evidence: [
        `legacy leaf slug ${info.leaf} maps to target leaf slug ${renamed[0].leafSlug}`,
        `legacy product ${info.product} maps to ${PRODUCT_MAPPINGS[info.product].base}`,
      ],
    };
  }

  if (renamed.length > 1) {
    return bestByContext(info, renamed, 'renamed-page');
  }

  const close = candidates
    .map((route) => ({
      route,
      score: overlapScore(
        [...info.rest, info.leaf].join(' '),
        `${route.routePath} ${route.title} ${route.headings.join(' ')}`,
      ),
    }))
    .sort((a, b) => b.score - a.score);

  if (
    close[0]?.score >= 0.48 &&
    close[0].score - (close[1]?.score ?? 0) >= 0.12
  ) {
    return {
      target: close[0].route.routePath,
      type: 'semantic-page-match',
      evidence: [
        `legacy path words overlap target title/headings with score ${close[0].score.toFixed(2)}`,
        `target title: ${close[0].route.title}`,
      ],
    };
  }

  return null;
}

function fallback(info, candidates) {
  const mapping = PRODUCT_MAPPINGS[info.product];
  if (!mapping) {
    return {
      target: '/en/introduction',
      type: 'unavailable',
      evidence: [`no product mapping configured for ${info.product}`],
      candidates: [],
    };
  }

  return {
    target: mapping.fallback,
    type: 'product-fallback',
    evidence: [
      'no high-confidence article-level target found',
      `legacy product ${info.product} maps to fallback ${mapping.fallback}`,
    ],
    candidates: candidates
      .map((route) => ({
        target: route.routePath,
        confidence: 'medium',
        evidence: [
          `candidate score ${overlapScore(
            info.rest.join(' '),
            `${route.routePath} ${route.title} ${route.headings.join(' ')}`,
          ).toFixed(2)}`,
          `target title: ${route.title}`,
        ],
      }))
      .slice(0, 5),
  };
}

function candidateRoutes(routes, product) {
  const mapping = PRODUCT_MAPPINGS[product];

  return mapping
    ? routes.filter(
        (route) =>
          route.routePath === mapping.fallback ||
          route.routePath.startsWith(`${mapping.base}/`),
      )
    : [];
}

function legacyInfo(href) {
  const url = new URL(href);
  const [locale, product, ...rest] = url.pathname.split('/').filter(Boolean);

  return {
    href,
    legacyPath: url.pathname,
    legacySearch: url.search,
    locale,
    product,
    rest,
    leaf: rest.at(-1) || product,
  };
}

function routeFromFile(file) {
  const relative = file
    .replace(/^content\/docs\//, '')
    .replace(/\.(md|mdx)$/, '')
    .replace(/\/index$/, '');

  return `/${relative}`;
}

function walk(directory, files) {
  for (const entry of fs.readdirSync(directory)) {
    const fullPath = path.join(directory, entry);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      walk(fullPath, files);
    } else if (/\.(md|mdx)$/.test(entry)) {
      files.push(fullPath);
    }
  }
}

function titleFrom(text, file) {
  const frontmatter = text.match(/^---\n([\s\S]*?)\n---/);
  if (frontmatter) {
    const title = frontmatter[1].match(/^title:\s*["']?(.+?)["']?\s*$/m);
    if (title) {
      return title[1].replace(/^['"]|['"]$/g, '').trim();
    }
  }

  return (
    text.match(/^#\s+(.+)$/m)?.[1]?.trim() ??
    path.basename(file).replace(/\.(md|mdx)$/, '')
  );
}

function headingsFrom(text) {
  return Array.from(text.matchAll(/^#{2,4}\s+(.+)$/gm), (match) =>
    match[1].replace(/[#`*_]/g, '').trim(),
  ).slice(0, 20);
}

function stripFrontmatter(text) {
  return text.replace(/^---\n[\s\S]*?\n---\n?/, '');
}

function words(value) {
  return new Set(
    value
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter(
        (word) =>
          word.length > 1 &&
          !['en', 'api', 'sdk', 'rest', 'and', 'the', 'with', 'for'].includes(
            word,
          ),
      ),
  );
}

function overlapScore(a, b) {
  const aWords = words(a);
  const bWords = words(b);
  if (aWords.size === 0 || bWords.size === 0) {
    return 0;
  }

  let intersection = 0;
  for (const word of aWords) {
    if (bWords.has(word)) {
      intersection += 1;
    }
  }

  return intersection / Math.max(aWords.size, bWords.size);
}

function bestByContext(info, routes, type) {
  const ranked = routes
    .map((route) => ({
      route,
      score: overlapScore(
        info.rest.join(' '),
        `${route.routePath} ${route.title} ${route.headings.join(' ')}`,
      ),
    }))
    .sort((a, b) => b.score - a.score);

  return ranked[0]
    ? {
        target: ranked[0].route.routePath,
        type,
        evidence: [
          `selected best contextual match among ${routes.length} same-slug candidates`,
          `target title: ${ranked[0].route.title}`,
        ],
      }
    : null;
}

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}
