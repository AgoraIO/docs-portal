import type { DocsPagePayload } from './docs-page.server';
import { preloadDocsContent } from './source.browser';

export async function preloadDocsPageContent(
  payload: DocsPagePayload | null | { redirectUrl: string } | undefined,
) {
  if (!payload || 'redirectUrl' in payload || payload.body.kind !== 'mdx') {
    return;
  }

  await preloadDocsContent(payload.body.contentPath);
}
