import { describe, expect, it } from 'vitest';
import { getOpenApiPrerenderPaths } from './openapi/lanes';
import { shouldPrerenderRoute } from './prerender-filter';
import { createDocsPrerenderPaths } from './prerender-pages';

describe('shouldPrerenderRoute', () => {
  it('keeps ordinary docs pages in the crawler output', () => {
    expect(shouldPrerenderRoute('/en/introduction/about-agora')).toBe(true);
    expect(shouldPrerenderRoute('/zh-CN/ai/quick-start')).toBe(true);
  });

  it('excludes raw markdown routes discovered from page utility links', () => {
    expect(
      shouldPrerenderRoute('/llms.mdx/docs/en/introduction/about-agora.mdx'),
    ).toBe(false);
  });

  it('includes openapi endpoint canonical routes for static generation', () => {
    expect(getOpenApiPrerenderPaths()).toContain(
      '/en/api-reference/conversational-ai/rest-api/agent/join',
    );
    expect(getOpenApiPrerenderPaths()).toContain(
      '/zh-CN/api-reference/conversational-ai/rest-api/agent/join',
    );
  });

  it('seeds canonical source pages instead of relying on crawled links', () => {
    const paths = createDocsPrerenderPaths({
      openApiPaths: ['/en/api-reference/conversational-ai/rest-api/agent/join'],
      pages: [
        { url: '/zh-CN/ai/domain-overview' },
        { url: '/en/introduction/about-agora' },
      ],
    });

    expect(paths).toEqual([
      '/',
      '/en/api-reference/conversational-ai/rest-api/agent/join',
      '/en/introduction/about-agora',
      '/zh-CN/ai/domain-overview',
    ]);
    expect(paths).toContain('/en/introduction/about-agora');
    expect(paths).toContain('/zh-CN/ai/domain-overview');
    expect(paths).toContain(
      '/en/api-reference/conversational-ai/rest-api/agent/join',
    );
  });
});
