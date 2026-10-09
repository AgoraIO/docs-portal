import { describe, expect, it } from 'vitest';
import { getZhCNSdkDownloadPageHref } from './sdk-download-page-links';

describe('getZhCNSdkDownloadPageHref', () => {
  it('maps RTC products to their platform download pages', () => {
    expect(getZhCNSdkDownloadPageHref('video', 'android')).toBe(
      '/zh-CN/realtime-media/rtc/reference/downloads/android',
    );
    expect(getZhCNSdkDownloadPageHref('voice', 'react-js')).toBe(
      '/zh-CN/realtime-media/rtc/reference/downloads/react',
    );
  });

  it('maps RTM and whiteboard platform route aliases', () => {
    expect(getZhCNSdkDownloadPageHref('signaling', 'linux')).toBe(
      '/zh-CN/realtime-media/rtm/reference/downloads/linux-cpp',
    );
    expect(getZhCNSdkDownloadPageHref('whiteboard', 'web')).toBe(
      '/zh-CN/realtime-media/whiteboard/whiteboard-sdk/reference/downloads/web',
    );
    expect(getZhCNSdkDownloadPageHref('signaling', 'macos')).toBeNull();
    expect(getZhCNSdkDownloadPageHref('whiteboard', 'macos')).toBeNull();
  });

  it('uses product download indexes for server products and omits unsupported products', () => {
    expect(getZhCNSdkDownloadPageHref('server-gateway', 'linux')).toBe(
      '/zh-CN/realtime-media/rtc-server-sdk/reference/downloads',
    );
    expect(getZhCNSdkDownloadPageHref('on-premise-recording', 'linux')).toBe(
      '/zh-CN/realtime-media/local-server-recording/reference/downloads',
    );
    expect(getZhCNSdkDownloadPageHref('agents', 'python')).toBeNull();
  });

  it('maps server product variants to their exact download pages', () => {
    expect(getZhCNSdkDownloadPageHref('server-gateway', 'linux-cpp')).toBe(
      '/zh-CN/realtime-media/rtc-server-sdk/reference/downloads/linux-cpp',
    );
    expect(getZhCNSdkDownloadPageHref('server-gateway', 'python')).toBe(
      '/zh-CN/realtime-media/rtc-server-sdk/reference/downloads/python',
    );
    expect(
      getZhCNSdkDownloadPageHref('on-premise-recording', 'linux-java'),
    ).toBe(
      '/zh-CN/realtime-media/local-server-recording/reference/downloads/linux-java',
    );
  });

  it('links the Chinese Instant Messaging SDK to its dedicated site', () => {
    expect(getZhCNSdkDownloadPageHref('chat', 'android')).toBe(
      'https://im.shengwang.cn/',
    );
  });
});
