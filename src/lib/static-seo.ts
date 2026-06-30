import { appDescription, appName, docsImageRoute } from './shared';
import { getSitemapBaseUrl } from './sitemap';

export type StaticSeoPage = {
  description?: string;
  title?: string;
  url: string;
};

type StaticSeoMetadata = {
  canonicalUrl: string;
  description: string;
  imageUrl: string;
  title: string;
};

export type StaticSeoHead = {
  links: Array<{
    href: string;
    rel: string;
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
  title?: string;
};

export type StaticSeoManifestPage = StaticSeoMetadata & {
  url: string;
};

const HEAD_CLOSE = '</head>';
const META_TITLE_SEPARATOR = ' | ';

export function createRobotsTxt({
  baseUrl = getSitemapBaseUrl(),
}: {
  baseUrl?: string;
} = {}) {
  return [
    'User-agent: *',
    'Allow: /',
    `Sitemap: ${baseUrl}/sitemap.xml`,
    '',
  ].join('\n');
}

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
    title: loaderData.title,
    url: loaderData.activePath,
  });
}

function createStaticSeoMetadata(
  page: StaticSeoPage,
  baseUrl = getSitemapBaseUrl(),
): StaticSeoMetadata {
  const title = normalizeText(page.title) ?? appName;
  const description = normalizeText(page.description) ?? appDescription;
  const canonicalUrl = `${baseUrl}${normalizePathname(page.url)}`;
  const imageUrl = createAbsoluteUrl(docsImageRoute, baseUrl);

  return {
    canonicalUrl,
    description,
    imageUrl,
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
    ...head.links.map(
      (entry) =>
        `    <link rel="${escapeHtml(entry.rel)}" href="${escapeHtml(entry.href)}">`,
    ),
  ].join('\n');
}

function stripManagedSeoTags(html: string) {
  return html
    .replace(/<title>[\s\S]*?<\/title>\s*/gi, '')
    .replace(/<meta\s+name=["']description["'][^>]*>\s*/gi, '')
    .replace(/<link\s+rel=["']canonical["'][^>]*>\s*/gi, '')
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

function createAbsoluteUrl(url: string, baseUrl: string) {
  return /^https?:\/\//.test(url) ? url : `${baseUrl}${normalizePathname(url)}`;
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
