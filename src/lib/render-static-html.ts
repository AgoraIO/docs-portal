import type { ReactNode } from 'react';
import { type PrerenderOptions, prerender } from 'react-dom/static';

/** Resolve every Suspense boundary before TanStack adds its hydration scripts. */
export async function renderStaticHtml(
  children: ReactNode,
  options?: PrerenderOptions,
) {
  const { prelude } = await prerender(children, {
    ...options,
    // React otherwise keeps large completed boundaries in streaming segments.
    progressiveChunkSize: Number.POSITIVE_INFINITY,
  });
  const html = await new Response(prelude).text();
  // renderSsrHtmlResponse supplies the document declaration.
  return html.replace(/^<!DOCTYPE html>/i, '');
}
