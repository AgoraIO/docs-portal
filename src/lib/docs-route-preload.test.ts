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

  it('does not preload non-ai non-api MDX payload content that now stays on static HTML', async () => {
    await preloadDocsPageContent(createMdxPayload('en/introduction/about.mdx'));

    expect(mockedPreloadDocsContent).not.toHaveBeenCalled();
  });

  it('does not preload ai MDX payload content that now stays on static HTML', async () => {
    await preloadDocsPageContent(createMdxPayload('en/ai/build/custom-llm.mdx'));

    expect(mockedPreloadDocsContent).not.toHaveBeenCalled();
  });

  it('does not preload ordinary api-reference MDX payload content that now stays on static HTML', async () => {
    await preloadDocsPageContent(
      createMdxPayload(
        'en/api-reference/conversational-ai/rest-api/agent/history.mdx',
      ),
    );

    expect(mockedPreloadDocsContent).not.toHaveBeenCalled();
  });

  it('does not preload rtc android api-reference MDX payloads that now stay on static HTML', async () => {
    await preloadDocsPageContent(
      createMdxPayload('en/api-reference/rtc/android/overview/index.mdx'),
    );

    expect(mockedPreloadDocsContent).not.toHaveBeenCalled();
  });

  it('does not preload non-api-reference docs pages even if their slug contains api-reference', async () => {
    await preloadDocsPageContent(
      createMdxPayload(
        'en/realtime-media/rtc/android/reference/api-reference/index.md',
      ),
    );

    expect(mockedPreloadDocsContent).not.toHaveBeenCalled();
  });

  it('does not preload OpenAPI payloads', async () => {
    await preloadDocsPageContent(createOpenApiPayload());

    expect(mockedPreloadDocsContent).not.toHaveBeenCalled();
  });

  it('does not preload null payloads or redirects', async () => {
    await preloadDocsPageContent(null);
    await preloadDocsPageContent({ redirectUrl: '/en/introduction' });

    expect(mockedPreloadDocsContent).not.toHaveBeenCalled();
  });

  it('does not try to preload ai pages, so no rejection path is exercised there', async () => {
    const preloadError = new Error('preload failed');
    mockedPreloadDocsContent.mockRejectedValue(preloadError);

    await preloadDocsPageContent(createMdxPayload('en/ai/failing.mdx'));

    expect(mockedPreloadDocsContent).not.toHaveBeenCalled();
  });

  it('does not try to preload regular docs pages, so no rejection path is exercised there', async () => {
    const preloadError = new Error('docs preload failed');
    mockedPreloadDocsContent.mockRejectedValue(preloadError);

    await preloadDocsPageContent(createMdxPayload('en/introduction/failing.mdx'));

    expect(mockedPreloadDocsContent).not.toHaveBeenCalled();
  });

  it('does not try to preload ordinary api-reference pages, so no rejection path is exercised there', async () => {
    const preloadError = new Error('api preload failed');
    mockedPreloadDocsContent.mockRejectedValue(preloadError);

    await preloadDocsPageContent(
      createMdxPayload('en/api-reference/conversational-ai/index.mdx'),
    );

    expect(mockedPreloadDocsContent).not.toHaveBeenCalled();
  });

  it('does not try to preload rtc android api-reference pages, so no rejection path is exercised there either', async () => {
    const preloadError = new Error('rtc android preload failed');
    mockedPreloadDocsContent.mockRejectedValue(preloadError);

    await preloadDocsPageContent(
      createMdxPayload('en/api-reference/rtc/android/index.mdx'),
    );

    expect(mockedPreloadDocsContent).not.toHaveBeenCalled();
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
