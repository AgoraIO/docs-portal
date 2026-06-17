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

  it('hydrates known heavyweight docs pages instead of requiring patched static html', () => {
    const heavyPages = [
      'en/realtime-media/video/build/ai-noise-suppression.mdx',
      'en/realtime-media/video/build/in-call-quality-monitoring.mdx',
      'en/realtime-media/video/build/play-media.mdx',
      'en/realtime-media/video/build/preload-channels.mdx',
      'en/realtime-media/video/build/receive-notifications.mdx',
      'en/realtime-media/video/build/screen-sharing.mdx',
      'en/realtime-media/video/build/use-an-extension.mdx',
      'en/realtime-media/video/build/voice-activity-detection.mdx',
      'en/realtime-media/cloud-recording/reference/common-errors.md',
      'en/realtime-media/im/agora-console/content-moderation-microsoft.md',
    ];

    for (const contentPath of heavyPages) {
      expect(shouldHydrateDocsMdxContent(contentPath)).toBe(true);
      expect(shouldPreloadDocsMdxContent(contentPath)).toBe(true);
      expect(shouldUseStaticDocsHtmlBody(contentPath)).toBe(false);
    }
  });
});
