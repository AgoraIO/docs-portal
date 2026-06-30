import { MACHINE_READABLE_LOCALE } from './machine-readable-docs';
import { legacyDocsBannerConfig } from './shared';

type SitemapPage = {
  url: string;
};

const XML_HEADER = '<?xml version="1.0" encoding="UTF-8"?>';
const URLSET_OPEN =
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
const URLSET_CLOSE = '</urlset>';

export function getSitemapBaseUrl() {
  const configured =
    process.env.SITE_URL ??
    process.env.VITE_SITE_URL ??
    process.env.PUBLIC_SITE_URL ??
    legacyDocsBannerConfig.hrefs[MACHINE_READABLE_LOCALE];

  return configured.replace(/\/+$/, '').replace(/\/en$/, '');
}

export function getSitemapUrls({
  baseUrl = getSitemapBaseUrl(),
  openApiPages = [],
  pages,
}: {
  baseUrl?: string;
  openApiPages?: SitemapPage[];
  pages: SitemapPage[];
}) {
  return Array.from(
    new Set(
      [...pages, ...openApiPages]
        .map((page) => page.url)
        .filter((url) => url.startsWith(`/${MACHINE_READABLE_LOCALE}/`))
        .filter((url) => !url.endsWith('.md'))
        .filter((url) => !url.includes('/llms.mdx/'))
        .map((url) => `${baseUrl}${url}`),
    ),
  ).sort();
}

export function createSitemapXml(urls: string[]) {
  return [
    XML_HEADER,
    URLSET_OPEN,
    ...urls.map((url) => `  <url><loc>${escapeXml(url)}</loc></url>`),
    URLSET_CLOSE,
    '',
  ].join('\n');
}

function escapeXml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}
