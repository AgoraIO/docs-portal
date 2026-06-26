import type { DocsPagePayload } from './docs-page.server';
import { preloadDocsContent } from './source.browser';

export async function preloadDocsPageContent(
  payload: DocsPagePayload | null | { redirectUrl: string } | undefined,
) {
  if (!payload || 'redirectUrl' in payload || payload.body.kind === 'openapi') {
    return;
  }

  if (payload.body.kind === 'mdx') {
    await preloadDocsContent(payload.body.contentPath);
    return;
  }

  await Promise.all([
    preloadDocsContent(payload.body.contentPath),
    ...payload.body.panels.map((panel) =>
      preloadDocsContent(panel.contentPath),
    ),
  ]);
}
