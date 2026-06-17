import type { TOCItemType } from 'fumadocs-core/toc';
import type React from 'react';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { getOverviewMDXComponents } from '@/components/docs-overview/mdx-components';
import { getMDXComponents } from '@/components/mdx';

const STATIC_MDX_INLINE_MAX_CHARS = 20_000;

type ResolvedMdxPageData = {
  body?: React.ComponentType<{ components?: object }>;
  structuredData?: {
    contents: unknown[];
    headings: unknown[];
  };
  toc?: TOCItemType[];
};

type RenderablePage = {
  data: {
    body?: React.ComponentType<{ components?: object }>;
    getText?: (kind: 'processed') => Promise<string>;
    load?: () => Promise<ResolvedMdxPageData>;
    structuredData?: {
      contents: unknown[];
      headings: unknown[];
    };
    toc?: TOCItemType[];
  };
  path: string;
};

export async function buildMdxBodyPayload(page: RenderablePage) {
  const html = await renderStaticMdxHtml(page.path, page);

  return {
    contentPath: page.path,
    ...(html ? { html } : {}),
    kind: 'mdx' as const,
  };
}

export async function buildStaticDocsIndexMdxBodyPayload(contentPath: string) {
  return {
    contentPath,
    kind: 'mdx' as const,
  };
}

async function renderStaticMdxHtml(contentPath: string, page: RenderablePage) {
  if (!(await shouldInlineStaticMdxHtml(contentPath, page))) {
    return null;
  }

  const pageData = await resolveMdxPageData(page);

  if (!pageData?.body) {
    return null;
  }

  return renderToStaticMarkup(
    createElement(pageData.body, {
      components: getMDXComponents(getOverviewMDXComponents(), {
        contentPath,
        staticRender: true,
      }),
    }),
  );
}

async function shouldInlineStaticMdxHtml(
  contentPath: string,
  page: RenderablePage,
) {
  if (
    !contentPath.includes('/api-reference/') ||
    contentPath.includes('/api-reference/rtc/android/') ||
    !hasRenderableMdxBody(page)
  ) {
    return false;
  }

  const processedText = await readProcessedText(page);

  if (processedText.length > STATIC_MDX_INLINE_MAX_CHARS) {
    return false;
  }

  if (/\<Tabs(?:\s|>)/.test(processedText)) {
    return false;
  }

  return true;
}

async function readProcessedText(page: RenderablePage) {
  try {
    if (
      !('getText' in page.data) ||
      typeof page.data.getText !== 'function'
    ) {
      return '';
    }

    return await page.data.getText('processed');
  } catch {
    return '';
  }
}

function isRenderableMdxPage(
  page: RenderablePage,
): page is RenderablePage & {
  data: RenderablePage['data'] & {
    body: React.ComponentType<{ components?: object }>;
  };
} {
  return 'body' in page.data && typeof page.data.body === 'function';
}

function hasLazyMdxPageData(
  page: RenderablePage,
): page is RenderablePage & {
  data: {
    load: () => Promise<ResolvedMdxPageData>;
  };
} {
  return 'load' in page.data && typeof page.data.load === 'function';
}

function hasRenderableMdxBody(page: RenderablePage) {
  return isRenderableMdxPage(page) || hasLazyMdxPageData(page);
}

async function resolveMdxPageData(page: RenderablePage) {
  if (isRenderableMdxPage(page)) {
    return {
      body: page.data.body,
      structuredData:
        'structuredData' in page.data &&
        typeof page.data.structuredData !== 'function'
          ? page.data.structuredData
          : undefined,
      toc:
        'toc' in page.data && Array.isArray(page.data.toc)
          ? page.data.toc
          : undefined,
    } satisfies ResolvedMdxPageData;
  }

  if (!hasLazyMdxPageData(page)) {
    return null;
  }

  try {
    return await page.data.load();
  } catch {
    return null;
  }
}
