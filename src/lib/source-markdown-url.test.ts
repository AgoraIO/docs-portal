import { describe, expect, it } from 'vitest';
import { getPageMarkdownUrl, type PageWithSource } from './source.server';

function createPage({
  path,
  type = 'docs',
  url,
}: {
  path: string;
  type?: string;
  url: string;
}) {
  return {
    path,
    type,
    url,
  } as PageWithSource;
}

describe('getPageMarkdownUrl', () => {
  it('builds public .md URLs for regular docs pages', () => {
    const page = createPage({
      path: 'en/ai/build/shape-the-conversation/filler-words.mdx',
      url: '/en/ai/build/shape-the-conversation/filler-words',
    });

    expect(getPageMarkdownUrl(page).url).toBe(
      '/en/ai/build/shape-the-conversation/filler-words.md',
    );
  });

  it('builds public platform-specific markdown URLs', () => {
    const page = createPage({
      path: 'en/realtime-media/video/reference/supported-platforms.mdx',
      url: '/en/realtime-media/video/reference/supported-platforms',
    });

    expect(getPageMarkdownUrl(page, 'android').url).toBe(
      '/en/realtime-media/video/reference/supported-platforms/android.md',
    );
  });

  it('builds public OpenAPI markdown URLs', () => {
    const page = createPage({
      path: 'en/api-reference/api-ref/conversational-ai/join.mdx',
      type: 'openapi',
      url: '/en/api-reference/api-ref/conversational-ai/join',
    });

    expect(getPageMarkdownUrl(page).url).toBe(
      '/en/api-reference/api-ref/conversational-ai/join.md',
    );
  });
});
