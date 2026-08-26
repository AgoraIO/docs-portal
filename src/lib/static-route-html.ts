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

  return prioritizeStaticRouteResources(injectStaticSeoHead(sourceHtml, page));
}

const LINK_TAG_PATTERN = /<link\b[^>]*>/gi;

function prioritizeStaticRouteResources(html: string) {
  return html.replace(LINK_TAG_PATTERN, (tag) => {
    const rel = getHtmlAttribute(tag, 'rel')?.toLowerCase();

    if (rel === 'stylesheet') {
      return setHtmlAttribute(tag, 'fetchpriority', 'high');
    }

    if (rel === 'modulepreload') {
      return setHtmlAttribute(tag, 'fetchpriority', 'low');
    }

    const href = getHtmlAttribute(tag, 'href')?.split(/[?#]/, 1)[0];
    if (
      rel === 'preload' &&
      getHtmlAttribute(tag, 'as')?.toLowerCase() === 'image' &&
      href === '/agora-logo.png'
    ) {
      return setHtmlAttribute(tag, 'fetchpriority', 'low');
    }

    return tag;
  });
}

function getHtmlAttribute(tag: string, name: string) {
  const match = tag.match(
    new RegExp(`\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i'),
  );

  return match?.[1] ?? match?.[2] ?? match?.[3];
}

function setHtmlAttribute(tag: string, name: string, value: string) {
  const attributePattern = new RegExp(
    `\\s${name}\\s*=\\s*(?:"[^"]*"|'[^']*'|[^\\s>]+)`,
    'i',
  );

  if (attributePattern.test(tag)) {
    return tag.replace(attributePattern, ` ${name}="${value}"`);
  }

  const closing = tag.endsWith('/>') ? '/>' : '>';
  return `${tag.slice(0, -closing.length).trimEnd()} ${name}="${value}"${closing}`;
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
