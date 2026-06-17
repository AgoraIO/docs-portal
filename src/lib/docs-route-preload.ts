import type { DocsPagePayload } from './docs-page.server';
import { shouldPreloadDocsMdxContent } from '@/components/docs-shell/docs-content-hydration';
import { preloadDocsContent } from './source.browser';

export async function preloadDocsPageContent(
  payload: DocsPagePayload | null | { redirectUrl: string } | undefined,
) {
  if (!payload || 'redirectUrl' in payload || payload.body.kind !== 'mdx') {
    return;
  }

  if (!shouldPreloadDocsMdxContent(payload.body.contentPath)) {
    return;
  }

  await preloadDocsContent(payload.body.contentPath);
}
