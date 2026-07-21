import { notFound } from '@tanstack/react-router';
import { withAgentDocsDirective } from './agent-docs-directive';
import {
  getSourceSlugs,
  getSourceSlugsFromContentPath,
  isSupportedDocLocale,
} from './docs-routing';
import { isMachineReadableLocale } from './machine-readable-docs';
import {
  isKnownPlatform,
  normalizePlatformKey,
  type PlatformKey,
} from './platforms/registry';

const MARKDOWN_RESPONSE_HEADERS = {
  'Content-Type': 'text/markdown',
};

export async function getPublicDocsMarkdownResponse({
  locale,
  slugSegments,
  tab,
}: {
  locale: string;
  slugSegments: string[];
  tab: string;
}) {
  const contentPath = getPublicDocsMarkdownContentPath({
    locale,
    slugSegments,
    tab,
  });

  if (!contentPath) {
    return null;
  }

  if (!isSupportedDocLocale(locale) || !isMachineReadableLocale(locale)) {
    throw notFound();
  }

  const { getLLMText, getPlatformLLMText, source } = await import(
    '@/lib/source'
  );
  const { getOpenApiMarkdownByContentPath } = await import(
    '@/lib/openapi/markdown'
  );
  const slugs = getSourceSlugsFromContentPath(contentPath);
  let page = source.getPage(slugs, locale);
  let platformMarkdown:
    | {
        platform: PlatformKey;
      }
    | undefined;

  if (!page) {
    const platformRoute = resolvePublicPlatformMarkdownRoute({
      locale,
      slugSegments,
      source,
      tab,
    });

    if (platformRoute) {
      page = platformRoute.page;
      platformMarkdown = {
        platform: platformRoute.platform,
      };
    }
  }

  const isOpenApiPage =
    page?.type === 'openapi' &&
    'getClientAPIPageProps' in page.data &&
    typeof page.data.getClientAPIPageProps === 'function';

  if (!page || isOpenApiPage) {
    const openApiMarkdown = await getOpenApiMarkdownByContentPath(contentPath);

    if (openApiMarkdown) {
      return markdownResponse(openApiMarkdown);
    }

    if (!page) {
      throw notFound();
    }
  }

  if (page && platformMarkdown) {
    const markdown = await getPlatformLLMText(page, platformMarkdown.platform);

    if (!markdown) {
      throw notFound();
    }

    return markdownResponse(markdown);
  }

  return markdownResponse(await getLLMText(page));
}

function getPublicDocsMarkdownContentPath({
  locale,
  slugSegments,
  tab,
}: {
  locale: string;
  slugSegments: string[];
  tab: string;
}) {
  if (slugSegments.length === 0) {
    if (!tab.endsWith('.md')) {
      return null;
    }

    return [locale, tab.replace(/\.md$/, ''), 'index.md'].join('/');
  }

  const fileName = slugSegments.at(-1);

  if (!fileName?.endsWith('.md')) {
    return null;
  }

  return [locale, tab, ...slugSegments].join('/');
}

function resolvePublicPlatformMarkdownRoute({
  locale,
  slugSegments,
  source,
  tab,
}: {
  locale: string;
  slugSegments: string[];
  source: Awaited<typeof import('@/lib/source')>['source'];
  tab: string;
}) {
  const fileName = slugSegments.at(-1);

  if (!fileName?.endsWith('.md')) {
    return null;
  }

  const platformCandidate = fileName.replace(/\.md$/, '');

  if (!isKnownPlatform(platformCandidate)) {
    return null;
  }

  const platform = normalizePlatformKey(platformCandidate) as PlatformKey;
  const canonicalSlugSegments = slugSegments.slice(0, -1);
  const page = source.getPage(
    getSourceSlugs({
      locale,
      slug: canonicalSlugSegments.at(-1) ?? 'index',
      slugSegments: canonicalSlugSegments,
      tab,
    }),
    locale,
  );

  return page ? { page, platform } : null;
}

function markdownResponse(markdown: string) {
  return new Response(withAgentDocsDirective(markdown), {
    headers: MARKDOWN_RESPONSE_HEADERS,
  });
}
