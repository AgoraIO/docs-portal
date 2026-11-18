import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path: string) =>
  readFileSync(`content/docs/zh-CN/${path}`, 'utf8');

describe('Chinese product download detail parity', () => {
  it.each(
    ['whiteboard-sdk', 'fastboard-sdk'].flatMap((product) =>
      ['android', 'ios', 'web'].map((platform) => [product, platform]),
    ),
  )(
    'retains the legacy Web Demo and QR code for %s/%s',
    (product, platform) => {
      const page = read(
        `realtime-media/whiteboard/${product}/reference/downloads/${platform}.mdx`,
      );
      expect(page).toContain('href: "https://demo.whiteboard.agora.io/"');
      expect(page).toContain(
        'coverSrc: "https://web-cdn.agora.io/docs-portal/img/landing-page/demo/whiteboard-demo.png"',
      );
      expect(page).toContain(
        'qrSrc: "https://web-cdn.agora.io/docs-portal/img/whiteboard/web-demo-qr.png"',
      );
      expect(page).toContain('qrExpanded: true');
    },
  );

  it.each([
    [
      'chatroom/sdk',
      'android',
      'https://web-cdn.agora.io/docs-files/1688623597225',
    ],
    [
      'chatroom/sdk',
      'ios',
      'https://web-cdn.agora.io/docs-files/1685428598975',
    ],
    ['chatroom/uikit', 'android', '/img/chatroom/chatroom-uikit-and.png'],
    ['chatroom/uikit', 'ios', '/img/chatroom/chatroom-uikit-ios.png'],
    [
      'online-ktv/ktv-scenario',
      'android',
      'https://web-cdn.agora.io/docs-files/1688623597225',
    ],
    [
      'online-ktv/ktv-scenario',
      'ios',
      'https://web-cdn.agora.io/docs-files/1685428598975',
    ],
  ])(
    'keeps the %s/%s QR code expanded as on the old site',
    (product, platform, qr) => {
      const page = read(
        `solutions/${product}/reference/downloads/${platform}.mdx`,
      );
      expect(page).toContain(qr);
      expect(page).toContain('qrExpanded: true');
    },
  );

  it.each(['android', 'ios'])(
    'routes %s chatroom IM downloads to the dedicated site',
    (platform) => {
      const page = read(
        `solutions/chatroom/sdk/reference/downloads/${platform}.mdx`,
      );
      expect(page).toContain('href: "https://im.shengwang.cn/"');
      expect(page).not.toContain('/reference/sdks?product=chat');
    },
  );

  it('loads React and ReactDOM before the RTC React CDN bundle', () => {
    const page = read('realtime-media/rtc/reference/downloads/react.mdx');
    const react = page.indexOf(
      'https://unpkg.com/react@18/umd/react.development.js',
    );
    const reactDom = page.indexOf(
      'https://unpkg.com/react-dom@18/umd/react-dom.development.js',
    );
    const sdk = page.indexOf(
      'https://download.agora.io/sdk/release/agora-rtc-react.2.5.1.js',
    );
    expect(react).toBeGreaterThan(-1);
    expect(reactDom).toBeGreaterThan(react);
    expect(sdk).toBeGreaterThan(reactDom);
  });

  it.each(['smart-camera', 'smart-doorbell'])(
    'states the existing client RTM requirement for %s',
    (product) => {
      expect(read(`solutions/${product}/reference/downloads.mdx`)).toContain(
        '客户端示例使用 RTM 1.x',
      );
    },
  );

  it('retains the KTV SDK identity and privacy references for both SDK types', () => {
    const page = read(
      'solutions/online-ktv/online-ktv-sdk/reference/downloads/index.mdx',
    );
    expect(page).toContain('SDK 名称：视频 SDK、音频 SDK');
    expect(page).toContain('/security/sdk-compliance/video-sdk');
    expect(page).toContain('/security/sdk-compliance/voice-sdk');
    expect(page).toContain('https://www.shengwang.cn/SDK-privacy-policy/');
  });
});
