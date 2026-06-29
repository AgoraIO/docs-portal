import { createFileRoute, notFound } from '@tanstack/react-router';
import {
  getSourceSlugs,
  getSourceSlugsFromContentPath,
} from '@/lib/docs-routing';
import { normalizeLocale } from '@/lib/i18n/i18n-config';
import {
  buildPlatformLLMText,
  extractStructuredPlatformTabs,
} from '@/lib/platforms/processed-text';
import {
  isKnownPlatform,
  normalizePlatformKey,
  type PlatformKey,
} from '@/lib/platforms/registry';

export const Route = createFileRoute('/llms.mdx/docs/$')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const { getLLMText, source } = await import('@/lib/source');
        const { getOpenApiMarkdownByContentPath } = await import(
          '@/lib/openapi/markdown'
        );
        const splat = params._splat ?? '';
        const segments = splat.split('/').filter(Boolean);
        const locale = normalizeLocale(segments[0]);
        const platformRoute = await resolveMarkdownPlatformRoute(
          segments,
          locale,
        );
        const slugs = platformRoute
          ? getSourceSlugs({
              locale: platformRoute.locale,
              slugSegments: platformRoute.slugSegments,
              tab: platformRoute.tab,
            })
          : getSourceSlugsFromContentPath(splat);
        const page =
          platformRoute?.page ?? source.getPage(slugs, locale ?? undefined);
        const isOpenApiPage =
          page?.type === 'openapi' &&
          'getClientAPIPageProps' in page.data &&
          typeof page.data.getClientAPIPageProps === 'function';

        if (!page || isOpenApiPage) {
          const openApiMarkdown = await getOpenApiMarkdownByContentPath(
            params._splat ?? '',
          );

          if (openApiMarkdown) {
            return new Response(openApiMarkdown, {
              headers: {
                'Content-Type': 'text/markdown',
              },
            });
          }

          if (!page) {
            throw notFound();
          }
        }

        return new Response(
          platformRoute
            ? buildPlatformLLMText({
                pageTitle: page.data.title,
                pageUrl: page.url,
                platform: platformRoute.platform,
                processedText: platformRoute.processedText,
              })
            : await getLLMText(page),
          {
            headers: {
              'Content-Type': 'text/markdown',
            },
          },
        );
      },
    },
  },
});

async function resolveMarkdownPlatformRoute(
  segments: string[],
  locale: ReturnType<typeof normalizeLocale>,
) {
  const { source } = await import('@/lib/source');
  const [rawLocale, tab, ...rest] = segments;
  const fileName = rest.at(-1);

  if (!locale || rawLocale !== locale || !tab || !fileName?.endsWith('.md')) {
    return null;
  }

  const platformCandidate = fileName.replace(/\.md$/, '');

  if (!isKnownPlatform(platformCandidate)) {
    return null;
  }

  const platform = normalizePlatformKey(platformCandidate) as PlatformKey;

  const slugSegments = rest.slice(0, -1);
  const page = source.getPage(
    getSourceSlugs({
      locale,
      slugSegments,
      tab,
    }),
    locale,
  );

  if (!page || !('getText' in page.data)) {
    return null;
  }

  const processedText =
    typeof page.data.getText === 'function'
      ? await page.data.getText('processed')
      : '';
  const platformTabs = extractStructuredPlatformTabs(processedText);

  if (!platformTabs?.platforms.includes(platform)) {
    return null;
  }

  return {
    locale,
    page,
    platform,
    processedText,
    slugSegments,
    tab,
  };
}
