import { describe, expect, it } from 'vitest';
import {
  isAiContentPath,
  isApiReferenceContentPath,
  isConversationalAiServerSdkApiReferenceContentPath,
  isDeferredOrdinaryApiReferenceContentPath,
  isRtcAndroidApiReferenceContentPath,
  isSidebarDeferredContentPath,
} from './docs-source-buckets';

describe('docs source buckets', () => {
  it('detects api-reference content paths by top-level section', () => {
    expect(
      isApiReferenceContentPath(
        'en/api-reference/conversational-ai/rest-api/agent/history.mdx',
      ),
    ).toBe(true);
    expect(
      isApiReferenceContentPath(
        'en/realtime-media/rtc/android/reference/api-reference/index.md',
      ),
    ).toBe(false);
  });

  it('detects ai content paths by top-level section', () => {
    expect(isAiContentPath('en/ai/build/custom-llm.mdx')).toBe(true);
    expect(isAiContentPath('zh-CN/ai/get-started/index.mdx')).toBe(true);
    expect(isAiContentPath('en/introduction/about-agora.mdx')).toBe(false);
  });

  it('detects rtc android api-reference content paths precisely', () => {
    expect(
      isRtcAndroidApiReferenceContentPath('en/api-reference/rtc/android.mdx'),
    ).toBe(true);
    expect(
      isRtcAndroidApiReferenceContentPath('zh-CN/api-reference/rtc/android.md'),
    ).toBe(true);
    expect(
      isRtcAndroidApiReferenceContentPath(
        'en/api-reference/rtc/android/overview/index.mdx',
      ),
    ).toBe(true);
    expect(
      isRtcAndroidApiReferenceContentPath(
        'zh-CN/api-reference/rtc/android/video/video-basic.mdx',
      ),
    ).toBe(true);
    expect(
      isRtcAndroidApiReferenceContentPath(
        'en/api-reference/rtc-server-sdk/java/index.mdx',
      ),
    ).toBe(false);
    expect(
      isRtcAndroidApiReferenceContentPath(
        'en/api-reference/conversational-ai/rest-api/agent/history.mdx',
      ),
    ).toBe(false);
  });

  it('detects conversational ai server sdk api-reference paths precisely', () => {
    expect(
      isConversationalAiServerSdkApiReferenceContentPath(
        'en/api-reference/conversational-ai/server-sdk/index.md',
      ),
    ).toBe(true);
    expect(
      isConversationalAiServerSdkApiReferenceContentPath(
        'en/api-reference/conversational-ai/server-sdk/go.mdx',
      ),
    ).toBe(true);
    expect(
      isConversationalAiServerSdkApiReferenceContentPath(
        'zh-CN/api-reference/conversational-ai/server-sdk/index.md',
      ),
    ).toBe(true);
    expect(
      isConversationalAiServerSdkApiReferenceContentPath(
        'en/api-reference/conversational-ai/rest-api/authentication.md',
      ),
    ).toBe(false);
    expect(
      isConversationalAiServerSdkApiReferenceContentPath(
        'en/api-reference/rtc/android/index.mdx',
      ),
    ).toBe(false);
  });

  it('detects content paths that should defer sidebar payloads', () => {
    expect(isSidebarDeferredContentPath('en/ai/release-notes.md')).toBe(true);
    expect(
      isSidebarDeferredContentPath('zh-CN/ai/best-practices/optimize-latency.mdx'),
    ).toBe(true);
    expect(
      isSidebarDeferredContentPath('en/realtime-media/rtc/index.md'),
    ).toBe(true);
    expect(
      isSidebarDeferredContentPath('en/realtime-media/rtc.md'),
    ).toBe(true);
    expect(
      isSidebarDeferredContentPath('en/realtime-media/rtc/android/index.md'),
    ).toBe(true);
    expect(
      isSidebarDeferredContentPath('zh-CN/realtime-media/rtc/macOS/audio/raw-audio-data.md'),
    ).toBe(true);
    expect(
      isSidebarDeferredContentPath('en/api-reference/rtc/android/index.mdx'),
    ).toBe(true);
    expect(
      isSidebarDeferredContentPath(
        'en/api-reference/conversational-ai/server-sdk/go.mdx',
      ),
    ).toBe(true);
    expect(
      isSidebarDeferredContentPath(
        'en/api-reference/conversational-ai/rest-api/authentication.md',
      ),
    ).toBe(true);
    expect(
      isSidebarDeferredContentPath('en/api-reference/enable-ncs/index.md'),
    ).toBe(true);
    expect(
      isSidebarDeferredContentPath('en/introduction/about-agora.mdx'),
    ).toBe(true);
    expect(
      isSidebarDeferredContentPath('en/solutions/showroom/index.mdx'),
    ).toBe(true);
  });

  it('detects ordinary api-reference mdx paths that can defer sidebar payloads', () => {
    expect(
      isDeferredOrdinaryApiReferenceContentPath(
        'en/api-reference/conversational-ai/rest-api/authentication.md',
      ),
    ).toBe(true);
    expect(
      isDeferredOrdinaryApiReferenceContentPath(
        'en/api-reference/enable-ncs/index.md',
      ),
    ).toBe(true);
    expect(
      isDeferredOrdinaryApiReferenceContentPath(
        'en/api-reference/rtc/android/index.mdx',
      ),
    ).toBe(false);
    expect(
      isDeferredOrdinaryApiReferenceContentPath(
        'en/api-reference/conversational-ai/server-sdk/go.mdx',
      ),
    ).toBe(false);
    expect(
      isDeferredOrdinaryApiReferenceContentPath(
        'en/introduction/about-agora.mdx',
      ),
    ).toBe(false);
  });
});
