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

  const selectedPlatform =
    payload.body.platformTabs.initialPlatform ??
    payload.body.platformTabs.defaultPlatform ??
    payload.body.canonicalPlatform;
  const selectedPanel = payload.body.panels.find(
    (panel) => panel.platform === selectedPlatform,
  );

  await Promise.all([
    preloadDocsContent(payload.body.contentPath),
    ...(selectedPanel ? [preloadDocsContent(selectedPanel.contentPath)] : []),
  ]);
}
