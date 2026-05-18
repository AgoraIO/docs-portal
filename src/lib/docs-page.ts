import { createServerFn } from '@tanstack/react-start';

export const getDocsTabIndex = createServerFn({ method: 'GET' })
  .inputValidator((data: { locale: string; tab: string }) => data)
  .handler(async ({ data }) => {
    const { loadDocsTabIndex } = await import('./docs-page.server');
    return loadDocsTabIndex(data.locale, data.tab);
  });

export const getDocsPagePayload = createServerFn({ method: 'GET' })
  .inputValidator(
    (data: { locale: string; slugSegments: string[]; tab: string }) => data,
  )
  .handler(async ({ data }) => {
    const { loadDocsPagePayload } = await import('./docs-page.server');
    return loadDocsPagePayload(data.locale, data.tab, data.slugSegments);
  });
