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
      'en/realtime-media/broadcast-streaming/build/ai-noise-suppression.mdx',
      'en/realtime-media/broadcast-streaming/build/in-call-quality-monitoring.mdx',
      'en/realtime-media/broadcast-streaming/build/play-media.mdx',
      'en/realtime-media/broadcast-streaming/build/preload-channels.mdx',
      'en/realtime-media/broadcast-streaming/build/screen-sharing.mdx',
      'en/realtime-media/broadcast-streaming/build/use-an-extension.mdx',
      'en/realtime-media/broadcast-streaming/build/voice-activity-detection.mdx',
      'en/realtime-media/cloud-recording/build/receive-notifications.mdx',
      'en/realtime-media/cloud-recording/reference/common-errors.md',
      'en/realtime-media/im/client-api/chat-group/manage-group-member-attributes.mdx',
      'en/realtime-media/im/client-api/chat-room/manage-chatroom-members.mdx',
      'en/realtime-media/im/agora-console/content-moderation-microsoft.md',
      // Newly added heavyweight pages that failed verifyPatchedStaticHtml.
      'en/realtime-media/im/client-api/messages/manage-messages.md',
      'en/realtime-media/im/client-api/messages/send-receive-messages.md',
      'en/realtime-media/im/client-api/messages/translate-messages.md',
      'en/realtime-media/im/client-api/presence.md',
      'en/realtime-media/im/client-api/reaction.md',
      'en/realtime-media/im/client-api/threading/thread-management.md',
      'en/realtime-media/im/client-api/threading/thread-messages.md',
      'en/realtime-media/im/client-api/user-attributes.md',
      'en/realtime-media/im/reference/access-token-2.md',
      'en/realtime-media/media-pull/reference/restful-api.md',
      'en/realtime-media/media-push/build/restful-api.md',
      'en/realtime-media/rtc-server-sdk/build/stringuid.md',
      'en/solutions/interactive-live-streaming/build/virtual-background.mdx',
    ];

    for (const contentPath of heavyPages) {
      expect(shouldHydrateDocsMdxContent(contentPath)).toBe(true);
      expect(shouldPreloadDocsMdxContent(contentPath)).toBe(true);
      expect(shouldUseStaticDocsHtmlBody(contentPath)).toBe(false);
    }
  });

  it('applies suffix-based hydration across every IA tab that shares a heavy page', () => {
    // The same `/build/*` suffix appears under multiple product tabs. All copies
    // must hydrate, not just the broadcast-streaming one, so the static build
    // verifier exempts every tab's emitted HTML.
    const tabs = [
      'en/realtime-media/video/build/play-media.mdx',
      'en/realtime-media/voice/build/in-call-quality-monitoring.mdx',
      'en/solutions/interactive-live-streaming/build/preload-channels.mdx',
    ];

    for (const contentPath of tabs) {
      expect(shouldHydrateDocsMdxContent(contentPath)).toBe(true);
    }
  });
});
