import { appDescription, appName } from './shared';
import { getSitemapBaseUrl } from './sitemap';

export type StaticSeoPage = {
  canonicalPath?: string;
  description?: string;
  markdownPath?: string;
  title?: string;
  url: string;
};

type StaticSeoMetadata = {
  canonicalUrl: string;
  description: string;
  imageUrl: string;
  markdownUrl?: string;
  title: string;
};

export type StaticSeoHead = {
  links: Array<{
    href: string;
    rel: string;
    type?: string;
  }>;
  meta: Array<
    | { title: string }
    | { content: string; name: string }
    | { content: string; property: string }
  >;
};

export type StaticSeoRouteData = {
  activePath: string;
  description?: string;
  markdownUrl?: string;
  title?: string;
};

export type StaticSeoManifestPage = StaticSeoMetadata & {
  url: string;
};

const HEAD_CLOSE = '</head>';
const META_TITLE_SEPARATOR = ' | ';
const DOCS_OG_IMAGE_BASE_URL = 'https://assets-docs.agora.io/og/';
const DOCS_OG_IMAGE_FALLBACK = `${DOCS_OG_IMAGE_BASE_URL}agora-docs-og-overview.png`;
const DOCS_OG_IMAGE_RULES = [
  {
    pathPrefixes: ['/en/ai', '/zh-CN/ai'],
    imageUrl: `${DOCS_OG_IMAGE_BASE_URL}agora-docs-og-voice-agent.png`,
  },
  {
    pathPrefixes: ['/en/realtime-media', '/zh-CN/realtime-media'],
    imageUrl: `${DOCS_OG_IMAGE_BASE_URL}agora-docs-og-realtime-media.png`,
  },
  {
    pathPrefixes: ['/en/solutions', '/zh-CN/solutions'],
    imageUrl: `${DOCS_OG_IMAGE_BASE_URL}agora-docs-og-solutions.png`,
  },
  {
    pathPrefixes: ['/en/api-reference', '/zh-CN/api-reference'],
    imageUrl: `${DOCS_OG_IMAGE_BASE_URL}agora-docs-og-reference.png`,
  },
  {
    pathPrefixes: ['/en/best-practices', '/zh-CN/best-practices'],
    imageUrl: `${DOCS_OG_IMAGE_BASE_URL}agora-docs-og-best-practices.png`,
  },
  {
    pathPrefixes: ['/en/introduction', '/zh-CN/introduction'],
    imageUrl: `${DOCS_OG_IMAGE_BASE_URL}agora-docs-og-introduction.png`,
  },
];

export function createStaticSeoManifest({
  baseUrl = getSitemapBaseUrl(),
  pages,
}: {
  baseUrl?: string;
  pages: StaticSeoPage[];
}): StaticSeoManifestPage[] {
  return pages
    .filter((page) => isDocsPageUrl(page.url))
    .map((page) => ({
      ...createStaticSeoMetadata(page, baseUrl),
      url: page.url,
    }))
    .sort((a, b) => a.url.localeCompare(b.url));
}

export function injectStaticSeoHead(
  html: string,
  page: StaticSeoPage | StaticSeoManifestPage,
) {
  const metadata = isStaticSeoManifestPage(page)
    ? page
    : createStaticSeoMetadata(page);
  const strippedHtml = stripManagedSeoTags(html);
  const seoHead = createSeoHead(metadata);

  if (!strippedHtml.includes(HEAD_CLOSE)) {
    throw new Error('Cannot inject static SEO metadata: missing </head>');
  }

  return strippedHtml.replace(HEAD_CLOSE, `${seoHead}\n${HEAD_CLOSE}`);
}

export function createStaticSeoHead(
  page: StaticSeoPage | StaticSeoManifestPage | StaticSeoMetadata,
): StaticSeoHead {
  const metadata = isStaticSeoManifestPage(page)
    ? page
    : isStaticSeoMetadata(page)
      ? page
      : createStaticSeoMetadata(page);

  return {
    links: [
      {
        rel: 'canonical',
        href: metadata.canonicalUrl,
      },
      {
        rel: 'alternate',
        type: 'text/markdown',
        href: metadata.markdownUrl ?? `${metadata.canonicalUrl}.md`,
      },
    ],
    meta: [
      {
        title: metadata.title,
      },
      {
        name: 'description',
        content: metadata.description,
      },
      {
        property: 'og:type',
        content: 'article',
      },
      {
        property: 'og:site_name',
        content: appName,
      },
      {
        property: 'og:title',
        content: metadata.title,
      },
      {
        property: 'og:description',
        content: metadata.description,
      },
      {
        property: 'og:url',
        content: metadata.canonicalUrl,
      },
      {
        property: 'og:image',
        content: metadata.imageUrl,
      },
      {
        name: 'twitter:card',
        content: 'summary_large_image',
      },
      {
        name: 'twitter:title',
        content: metadata.title,
      },
      {
        name: 'twitter:description',
        content: metadata.description,
      },
      {
        name: 'twitter:image',
        content: metadata.imageUrl,
      },
    ],
  };
}

export function createDocsRouteSeoHead(loaderData: StaticSeoRouteData) {
  return createStaticSeoHead({
    description: loaderData.description,
    markdownPath: loaderData.markdownUrl,
    title: loaderData.title,
    url: loaderData.activePath,
  });
}

export function getDocsOgImageUrl(url: string) {
  const pathname = normalizePathname(url);
  const matchedRule = DOCS_OG_IMAGE_RULES.find((rule) =>
    rule.pathPrefixes.some(
      (pathPrefix) =>
        pathname === pathPrefix || pathname.startsWith(`${pathPrefix}/`),
    ),
  );

  return matchedRule?.imageUrl ?? DOCS_OG_IMAGE_FALLBACK;
}

function createStaticSeoMetadata(
  page: StaticSeoPage,
  baseUrl = getSitemapBaseUrl(),
): StaticSeoMetadata {
  const title = normalizeText(page.title) ?? appName;
  const description = normalizeText(page.description) ?? appDescription;
  const canonicalUrl = `${baseUrl}${normalizePathname(page.canonicalPath ?? page.url)}`;
  const markdownUrl = page.markdownPath
    ? `${baseUrl}${normalizePathname(page.markdownPath)}`
    : `${canonicalUrl}.md`;
  const imageUrl = getDocsOgImageUrl(page.url);

  return {
    canonicalUrl,
    description,
    imageUrl,
    markdownUrl,
    title:
      title === appName ? appName : `${title}${META_TITLE_SEPARATOR}${appName}`,
  };
}

function isStaticSeoManifestPage(
  page: StaticSeoPage | StaticSeoManifestPage | StaticSeoMetadata,
): page is StaticSeoManifestPage {
  return (
    'canonicalUrl' in page &&
    typeof page.canonicalUrl === 'string' &&
    'imageUrl' in page &&
    typeof page.imageUrl === 'string'
  );
}

function isStaticSeoMetadata(
  page: StaticSeoPage | StaticSeoManifestPage | StaticSeoMetadata,
): page is StaticSeoMetadata {
  return (
    'canonicalUrl' in page &&
    typeof page.canonicalUrl === 'string' &&
    'imageUrl' in page &&
    typeof page.imageUrl === 'string' &&
    !('url' in page)
  );
}

function createSeoHead(metadata: StaticSeoMetadata) {
  const head = createStaticSeoHead(metadata);

  return [
    ...head.meta.map((entry) => {
      if ('title' in entry) {
        return `    <title>${escapeHtml(entry.title)}</title>`;
      }

      if ('property' in entry) {
        return `    <meta property="${escapeHtml(entry.property)}" content="${escapeHtml(entry.content)}">`;
      }

      return `    <meta name="${escapeHtml(entry.name)}" content="${escapeHtml(entry.content)}">`;
    }),
    ...head.links.map((entry) => {
      const type = entry.type ? ` type="${escapeHtml(entry.type)}"` : '';

      return `    <link rel="${escapeHtml(entry.rel)}"${type} href="${escapeHtml(entry.href)}">`;
    }),
  ].join('\n');
}

function stripManagedSeoTags(html: string) {
  return html
    .replace(/<title>[\s\S]*?<\/title>\s*/gi, '')
    .replace(/<meta\s+name=["']description["'][^>]*>\s*/gi, '')
    .replace(/<link\s+rel=["']canonical["'][^>]*>\s*/gi, '')
    .replace(
      /<link\b(?=[^>]*\brel=["']alternate["'])(?=[^>]*\btype=["']text\/markdown["'])[^>]*>\s*/gi,
      '',
    )
    .replace(/<meta\s+property=["']og:[^"']+["'][^>]*>\s*/gi, '')
    .replace(/<meta\s+name=["']twitter:[^"']+["'][^>]*>\s*/gi, '');
}

function isDocsPageUrl(url: string) {
  return /^\/(?:en|zh-CN)\//.test(url) && !url.endsWith('.md');
}

function normalizePathname(url: string) {
  const pathname = url.startsWith('/') ? url : `/${url}`;
  return pathname === '/' ? pathname : pathname.replace(/\/+$/, '');
}

function normalizeText(value?: string) {
  const normalized = value?.replace(/\s+/g, ' ').trim();
  return normalized || undefined;
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}
