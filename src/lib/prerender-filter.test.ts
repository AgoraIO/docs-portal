import { describe, expect, it } from 'vitest';
import { getConversationalAiPrerenderPaths } from './openapi/conversational-ai';
import { shouldPrerenderRoute } from './prerender-filter';

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
    expect(getConversationalAiPrerenderPaths()).toContain(
      '/en/api-reference/conversational-ai/rest-api/agent/join',
    );
    expect(getConversationalAiPrerenderPaths()).toContain(
      '/zh-CN/api-reference/conversational-ai/rest-api/agent/join',
    );
  });
});
