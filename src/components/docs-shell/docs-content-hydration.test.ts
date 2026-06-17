import { describe, expect, it } from 'vitest';
import {
  shouldPreloadDocsMdxContent,
  shouldHydrateDocsMdxContent,
  shouldUseStaticDocsHtmlBody,
} from './docs-content-hydration';

describe('docs-content-hydration', () => {
  it('keeps ordinary docs pages on the static HTML path', () => {
    expect(
      shouldHydrateDocsMdxContent('en/introduction/about-agora.mdx'),
    ).toBe(false);
    expect(
      shouldPreloadDocsMdxContent('en/introduction/about-agora.mdx'),
    ).toBe(false);
    expect(
      shouldUseStaticDocsHtmlBody('en/introduction/about-agora.mdx'),
    ).toBe(true);
  });

  it('keeps AI docs pages on the static HTML path', () => {
    expect(shouldHydrateDocsMdxContent('en/ai/build/custom-llm.mdx')).toBe(
      false,
    );
    expect(shouldPreloadDocsMdxContent('en/ai/build/custom-llm.mdx')).toBe(
      false,
    );
    expect(shouldUseStaticDocsHtmlBody('en/ai/build/custom-llm.mdx')).toBe(
      true,
    );
  });

  it('keeps ordinary api reference docs on the static HTML path', () => {
    expect(
      shouldHydrateDocsMdxContent(
        'en/api-reference/conversational-ai/rest-api/agent/history.mdx',
      ),
    ).toBe(false);
    expect(
      shouldPreloadDocsMdxContent(
        'en/api-reference/conversational-ai/rest-api/agent/history.mdx',
      ),
    ).toBe(false);
    expect(
      shouldUseStaticDocsHtmlBody(
        'en/api-reference/conversational-ai/rest-api/agent/history.mdx',
      ),
    ).toBe(true);
  });

  it('keeps rtc android api reference docs on the static HTML path', () => {
    expect(
      shouldHydrateDocsMdxContent(
        'en/api-reference/rtc/android/overview/index.mdx',
      ),
    ).toBe(false);
    expect(
      shouldPreloadDocsMdxContent(
        'en/api-reference/rtc/android/overview/index.mdx',
      ),
    ).toBe(false);
    expect(
      shouldUseStaticDocsHtmlBody(
        'en/api-reference/rtc/android/overview/index.mdx',
      ),
    ).toBe(true);
  });
});
