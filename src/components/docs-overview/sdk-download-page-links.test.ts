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
});
