import { describe, expect, it } from 'vitest';
import { normalizeDocsHref } from './docs-link-normalize';

describe('normalizeDocsHref', () => {
  it('resolves relative markdown links from the source content path', () => {
    expect(
      normalizeDocsHref('get-started/quickstart.md', {
        contentPath: 'en/ai/index.md',
      }),
    ).toEqual({ href: '/en/ai/get-started/quickstart', kind: 'internal-doc' });
  });

  it('collapses index.md targets to their directory route', () => {
    expect(
      normalizeDocsHref('studio/index.md', {
        contentPath: 'en/ai/index.md',
      }),
    ).toEqual({ href: '/en/ai/studio', kind: 'internal-doc' });
  });

  it('resolves parent traversal and preserves search and hash', () => {
    expect(
      normalizeDocsHref(
        '../api-reference/conversational-ai/rest-api/index.md?view=all#start',
        { contentPath: 'en/ai/index.md' },
      ),
    ).toEqual({
      href: '/en/api-reference/api-ref/conversational-ai?view=all#start',
      kind: 'internal-doc',
    });
  });

  it('leaves non-doc links unchanged', () => {
    expect(
      normalizeDocsHref('#overview', { contentPath: 'en/ai/index.md' }),
    ).toEqual({ href: '#overview', kind: 'hash' });

    expect(
      normalizeDocsHref('https://example.com/page.md', {
        contentPath: 'en/ai/index.md',
      }),
    ).toEqual({ href: 'https://example.com/page.md', kind: 'external' });

    expect(
      normalizeDocsHref('./diagram.png', { contentPath: 'en/ai/index.md' }),
    ).toEqual({ href: './diagram.png', kind: 'relative-asset' });
  });

  it('scopes generated RTC Android API links to the active version', () => {
    expect(
      normalizeDocsHref(
        '/zh-CN/api-reference/rtc/android/video/video-custom-capturenrendering#api_irtcengine_createcustomvideotrack',
        {
          contentPath:
            'zh-CN/api-reference/rtc/android/4.6.0/full-sdk-api-list.mdx',
        },
      ),
    ).toEqual({
      href: '/zh-CN/api-reference/rtc/android/4.6.0/video/video-custom-capturenrendering#api_irtcengine_createcustomvideotrack',
      kind: 'root',
    });

    expect(
      normalizeDocsHref(
        '/en/api-reference/rtc/android/audio/audio-custom-capturenrendering?view=all#api_irtcengine_createcustomaudiotrack',
        {
          contentPath: 'en/api-reference/rtc/android/4.6.0/overview.mdx',
        },
      ),
    ).toEqual({
      href: '/en/api-reference/rtc/android/4.6.0/audio/audio-custom-capturenrendering?view=all#api_irtcengine_createcustomaudiotrack',
      kind: 'root',
    });
  });

  it('keeps current RTC Android API links on the default version URL', () => {
    expect(
      normalizeDocsHref(
        '/en/api-reference/rtc/android/audio/audio-custom-capturenrendering',
        {
          contentPath: 'en/api-reference/rtc/android/(current)/overview.mdx',
        },
      ),
    ).toEqual({
      href: '/en/api-reference/rtc/android/audio/audio-custom-capturenrendering',
      kind: 'root',
    });
  });

  it('does not treat the RTC Android index page as a version scope', () => {
    expect(
      normalizeDocsHref('/en/api-reference/rtc/android/overview', {
        contentPath: 'en/api-reference/rtc/android/index.mdx',
      }),
    ).toEqual({
      href: '/en/api-reference/rtc/android/overview',
      kind: 'root',
    });
  });

  it('normalizes legacy Conversational AI root links', () => {
    expect(
      normalizeDocsHref('/zh-CN/operations/start-agent#llm-max_history'),
    ).toEqual({
      href: '/zh-CN/api-reference/api-ref/conversational-ai/join#llm-max_history',
      kind: 'root',
    });

    expect(normalizeDocsHref('/en/operations/stop-agent')).toEqual({
      href: '/en/api-reference/api-ref/conversational-ai/leave',
      kind: 'root',
    });

    expect(
      normalizeDocsHref('/zh-CN/user-guides/realtime-sub#api-参考'),
    ).toEqual({
      href: '/zh-CN/ai/realtime-sub#api-参考',
      kind: 'root',
    });

    expect(normalizeDocsHref('/zh-CN/get-started/enable-service')).toEqual({
      href: '/zh-CN/ai/enable-service',
      kind: 'root',
    });
  });

  it('normalizes legacy paths produced from relative markdown links', () => {
    expect(
      normalizeDocsHref('../get-started/enable-service.md#获取临时-token', {
        contentPath: 'zh-CN/api-reference/enable-ncs.mdx',
      }),
    ).toEqual({
      href: '/zh-CN/ai/enable-service#获取临时-token',
      kind: 'internal-doc',
    });

    expect(
      normalizeDocsHref('../operations/start-agent.md#llm-max_history', {
        contentPath: 'en/api-reference/ncs-events.mdx',
      }),
    ).toEqual({
      href: '/en/api-reference/api-ref/conversational-ai/join#llm-max_history',
      kind: 'internal-doc',
    });
  });

  it('normalizes legacy Conversational AI REST API links', () => {
    expect(
      normalizeDocsHref(
        '/en/api-reference/conversational-ai/rest-api/agent/join#properties-llm',
      ),
    ).toEqual({
      href: '/en/api-reference/api-ref/conversational-ai/join#properties-llm',
      kind: 'root',
    });

    expect(
      normalizeDocsHref(
        '../../api-reference/conversational-ai/rest-api/agent/turns.md?page=2',
        { contentPath: 'en/ai/build/start-stop-agent.mdx' },
      ),
    ).toEqual({
      href: '/en/api-reference/api-ref/conversational-ai/turns?page=2',
      kind: 'internal-doc',
    });
  });

  it('normalizes legacy absolute docs links from imported content', () => {
    expect(
      normalizeDocsHref('/doc/convoai/restful/webhook/ncs-events'),
    ).toEqual({
      href: '/zh-CN/api-reference/ncs-events',
      kind: 'root',
    });

    expect(normalizeDocsHref('/en/ai/openai-realtime')).toEqual({
      href: '/en/ai/reference/openai-realtime-integration',
      kind: 'root',
    });
  });
});
