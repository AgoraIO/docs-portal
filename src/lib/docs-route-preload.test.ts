import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { DocsPagePayload } from './docs-page.server';
import { preloadDocsPageContent } from './docs-route-preload';
import { preloadDocsContent } from './source.browser';

vi.mock('./source.browser', () => ({
  preloadDocsContent: vi.fn(),
}));

const mockedPreloadDocsContent = preloadDocsContent as unknown as ReturnType<
  typeof vi.fn
>;

describe('preloadDocsPageContent', () => {
  beforeEach(() => {
    mockedPreloadDocsContent.mockReset();
    mockedPreloadDocsContent.mockResolvedValue(undefined);
  });

  it('preloads MDX payload content once by content path', async () => {
    await preloadDocsPageContent(createMdxPayload('docs/en/about.mdx'));

    expect(mockedPreloadDocsContent).toHaveBeenCalledTimes(1);
    expect(mockedPreloadDocsContent).toHaveBeenCalledWith('docs/en/about.mdx');
  });

  it('does not preload OpenAPI payloads', async () => {
    await preloadDocsPageContent(createOpenApiPayload());

    expect(mockedPreloadDocsContent).not.toHaveBeenCalled();
  });

  it('preloads platform group index and panel content paths', async () => {
    await preloadDocsPageContent(
      createPayload({
        body: {
          canonicalPlatform: 'ios',
          contentPath: 'docs/en/platform-split/index.mdx',
          kind: 'platform-group',
          panels: [
            {
              contentPath: 'docs/en/platform-split/ios.mdx',
              platform: 'ios',
            },
            {
              contentPath: 'docs/en/platform-split/android.mdx',
              platform: 'android',
            },
          ],
          platformTabs: {
            canonicalPlatform: 'ios',
            platforms: '["ios","android"]',
          },
          platforms: ['ios', 'android'],
        },
      }),
    );

    expect(mockedPreloadDocsContent).toHaveBeenCalledTimes(3);
    expect(mockedPreloadDocsContent).toHaveBeenNthCalledWith(
      1,
      'docs/en/platform-split/index.mdx',
    );
    expect(mockedPreloadDocsContent).toHaveBeenNthCalledWith(
      2,
      'docs/en/platform-split/ios.mdx',
    );
    expect(mockedPreloadDocsContent).toHaveBeenNthCalledWith(
      3,
      'docs/en/platform-split/android.mdx',
    );
  });

  it('does not preload null payloads or redirects', async () => {
    await preloadDocsPageContent(null);
    await preloadDocsPageContent({ redirectUrl: '/en/introduction' });

    expect(mockedPreloadDocsContent).not.toHaveBeenCalled();
  });

  it('does not swallow MDX preload rejections', async () => {
    const preloadError = new Error('preload failed');
    mockedPreloadDocsContent.mockRejectedValue(preloadError);

    await expect(
      preloadDocsPageContent(createMdxPayload('docs/en/failing.mdx')),
    ).rejects.toBe(preloadError);
  });
});

function createMdxPayload(contentPath: string): DocsPagePayload {
  return createPayload({
    body: {
      contentPath,
      kind: 'mdx',
    },
  });
}

function createOpenApiPayload(): DocsPagePayload {
  return createPayload({
    body: {
      kind: 'openapi',
      pageProps: {} as DocsPagePayload['body'] extends {
        kind: 'openapi';
        pageProps: infer PageProps;
      }
        ? PageProps
        : never,
    },
  });
}

function createPayload(
  overrides: Pick<DocsPagePayload, 'body'>,
): DocsPagePayload {
  return {
    activePath: '/en/introduction/about',
    activeTab: 'introduction',
    body: overrides.body,
    breadcrumb: [],
    contentPath: 'docs/en/about.mdx',
    description: undefined,
    hideToc: false,
    layoutMode: overrides.body.kind === 'openapi' ? 'openapi' : 'docs',
    localeLinks: [],
    markdownUrl: '/llms.mdx/docs/en/about.mdx',
    navigation: {
      next: undefined,
      previous: undefined,
    },
    sidebar: [],
    sidebarHeader: undefined,
    slug: 'about',
    tabs: [],
    title: 'About',
    toc: [],
  };
}
