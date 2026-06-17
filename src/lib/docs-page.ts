import { createServerFn } from '@tanstack/react-start';

export const getDocsTabIndex = createServerFn({ method: 'GET' })
  .inputValidator((data: { locale: string; tab: string }) => data)
  .handler(async ({ data }) => {
    const { loadDocsTabIndex } = await import('./docs-page.server');
    return loadDocsTabIndex(data.locale, data.tab);
  });

export const getDocsPagePayload = createServerFn({ method: 'GET' })
  .inputValidator(
    (data: {
      includeSidebar?: boolean;
      locale: string;
      slugSegments: string[];
      tab: string;
    }) => data,
  )
  .handler(async ({ data }) => {
    const { loadDocsPagePayload } = await import('./docs-page.server');
    return loadDocsPagePayload(
      data.locale,
      data.tab,
      data.slugSegments,
      data.includeSidebar,
    );
  });

export const getDocsSearchIndex = createServerFn({ method: 'GET' })
  .handler(async () => {
    const { loadDocsSearchIndex } = await import('./docs-page.server');
    return loadDocsSearchIndex();
  });

export const getDocsPageToc = createServerFn({ method: 'GET' })
  .inputValidator((data: { contentPath: string }) => data)
  .handler(async ({ data }) => {
    const { loadDocsPageToc } = await import('./docs-page.server');
    return loadDocsPageToc(data.contentPath);
  });
