import { notFound } from '@tanstack/react-router';
import {
  getSourceSlugsFromContentPath,
  isSupportedDocLocale,
} from './docs-routing';

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

  if (!isSupportedDocLocale(locale)) {
    throw notFound();
  }

  const { getLLMText, source } = await import('@/lib/source');
  const { getOpenApiMarkdownByContentPath } = await import(
    '@/lib/openapi/markdown'
  );
  const slugs = getSourceSlugsFromContentPath(contentPath);
  const page = source.getPage(slugs, locale);
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

function markdownResponse(markdown: string) {
  return new Response(markdown, {
    headers: MARKDOWN_RESPONSE_HEADERS,
  });
}
