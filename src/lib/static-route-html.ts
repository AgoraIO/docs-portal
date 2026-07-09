import { injectStaticSeoHead, type StaticSeoManifestPage } from './static-seo';

export function createStaticRouteHtml({
  allowSpaFallback = false,
  page,
  routeHtml,
  spaHtml,
}: {
  allowSpaFallback?: boolean;
  page: StaticSeoManifestPage;
  routeHtml?: string;
  spaHtml: string;
}) {
  const hasPrerenderedBody = hasPrerenderedDocsBody(routeHtml);

  if (!hasPrerenderedBody && !allowSpaFallback) {
    throw new Error(
      `Missing prerendered HTML for canonical route: ${page.url}`,
    );
  }

  const sourceHtml = hasPrerenderedBody ? (routeHtml ?? spaHtml) : spaHtml;

  return injectStaticSeoHead(sourceHtml, page);
}

function hasPrerenderedDocsBody(routeHtml?: string) {
  if (!routeHtml) {
    return false;
  }

  const bodyMarkerIndex = routeHtml.indexOf('data-static-docs-body');
  const bodyStartIndex = routeHtml.indexOf('>', bodyMarkerIndex);
  const articleEndIndex = routeHtml.indexOf('</article>', bodyMarkerIndex);

  if (
    bodyMarkerIndex < 0 ||
    bodyStartIndex < 0 ||
    articleEndIndex < bodyStartIndex
  ) {
    return false;
  }

  const bodyHtml = routeHtml.slice(bodyStartIndex + 1, articleEndIndex);

  if (bodyHtml.includes('data-testid="docs-content-skeleton"')) {
    return false;
  }

  const textContent = bodyHtml
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&(?:nbsp|#160|#xA0);/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return (
    textContent.length > 0 ||
    /<(?:audio|code|img|pre|table|video)\b/i.test(bodyHtml)
  );
}
