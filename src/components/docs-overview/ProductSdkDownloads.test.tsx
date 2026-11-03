import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ProductSdkDownloads } from './ProductSdkDownloads';

describe('ProductSdkDownloads', () => {
  it('uses the shared Apple package for the legacy Swift entry', () => {
    render(<ProductSdkDownloads platform="swift" product="signaling" />);
    const card = screen.getByRole('article', { name: 'Swift 实时消息 SDK' });
    expect(
      within(card).getByRole('link', { name: '下载 Swift 实时消息 SDK' }),
    ).toHaveAttribute(
      'href',
      'https://download.shengwang.cn/rtm2/release/RTM_OC_SDK_v2.3.0.zip',
    );
    expect(card.querySelector('img')).toHaveAttribute(
      'src',
      '/img/platforms/swift.svg',
    );
  });

  it('retains both operating-system downloads on the C++ RTM page', () => {
    render(<ProductSdkDownloads platform="cpp" product="signaling" />);
    expect(screen.getAllByRole('article')).toHaveLength(2);
    for (const os of ['Windows', 'Linux']) {
      expect(
        screen.getByRole('link', { name: `下载 ${os} C++ 实时消息 SDK` }),
      ).toHaveAttribute(
        'href',
        `https://download.shengwang.cn/rtm2/release/RTM_C%2B%2B_SDK_for_${os}_v2.3.0.zip`,
      );
    }
  });

  it('retains the pinned historical Web RTM package and metadata', () => {
    render(
      <ProductSdkDownloads
        platform="web"
        product="signaling"
        versionIds={['2.2.4-rtm-sdk-web']}
      />,
    );
    const card = screen.getByRole('article', {
      name: 'JavaScript 实时消息 SDK',
    });
    expect(within(card).getByText('v2.2.4')).toBeVisible();
    expect(
      within(card).getByText('6043262f5e5999a06e12d83c3c40a943'),
    ).toBeVisible();
    expect(
      within(card).getByText('发布日期：2026 年 4 月 13 日'),
    ).toBeVisible();
    expect(
      within(card).getByRole('link', { name: '下载 JavaScript 实时消息 SDK' }),
    ).toHaveAttribute(
      'href',
      'https://download.agora.io/rtm2/release/Agora_RTM_JavaScript_SDK_for_Web_v2.2.4.zip',
    );
  });

  it('shows Web RTM 2.3.0 with its source checksum and release date', () => {
    render(<ProductSdkDownloads platform="web" product="signaling" />);
    const card = screen.getByRole('article', {
      name: 'JavaScript 实时消息 SDK',
    });
    expect(within(card).getByText('v2.3.0')).toBeVisible();
    expect(
      within(card).getByText('13f63c0322c49b1edd3f7a0e2c8c89fc'),
    ).toBeVisible();
    expect(
      within(card).getByText('发布日期：2026 年 8 月 10 日'),
    ).toBeVisible();
    expect(
      within(card).getByRole('link', { name: '下载 JavaScript 实时消息 SDK' }),
    ).toHaveAttribute(
      'href',
      'https://download.agora.io/rtm2/release/Agora_RTM_JavaScript_SDK_for_Web_v2.3.0.zip',
    );
    expect(screen.queryByText('v2.2.4')).not.toBeInTheDocument();
  });

  it.each([
    ['android', '1.7.2-fastboard-android', '1.7.2'],
    ['web', '1.1.0-interactive-whiteboard-web', '1.1.0'],
  ])(
    'offers the latest Fastboard %s release without a stale download',
    (platform, id, version) => {
      render(
        <ProductSdkDownloads
          product="fastboard"
          platform={platform}
          versionIds={[id]}
        />,
      );
      expect(screen.getAllByRole('article')).toHaveLength(1);
      expect(screen.getByText(`v${version}`)).toBeVisible();
      expect(screen.getByText('发布日期：2025 年 7 月 11 日')).toBeVisible();
      const link = screen.getByRole('link', { name: /^获取 / });
      expect(link.getAttribute('href')).toContain(version);
    },
  );

  it('pins Fastboard without losing metadata from duplicate catalog records', () => {
    render(
      <ProductSdkDownloads
        product="fastboard"
        platform="android"
        versionIds={['1.6.2-fastboard-android']}
      />,
    );
    const card = screen.getByRole('article', { name: 'Android Fastboard SDK' });
    expect(screen.getAllByRole('article')).toHaveLength(1);
    expect(within(card).getByText('v1.6.2')).toBeVisible();
    expect(
      within(card).getByText('92a2240199faa74dc2bea46830623404'),
    ).toBeVisible();
    expect(
      within(card).getByText('发布日期：2024 年 9 月 14 日'),
    ).toBeVisible();
    expect(
      within(card).getByRole('link', { name: '下载 Android Fastboard SDK' }),
    ).toHaveAttribute(
      'href',
      'https://github.com/netless-io/fastboard-android/archive/refs/tags/1.6.2.zip',
    );
    expect(screen.queryByText('v1.7.2')).not.toBeInTheDocument();
  });

  it.each([
    [
      'android',
      'video',
      '4.4.1-video-sdk-android-full',
      '4.4.1',
      '4d4fcfebad97ca79ff0420ed76d1caa9',
    ],
    [
      'android',
      'voice',
      '4.4.1-voice-sdk-android',
      '4.4.1',
      '3e0982995f94b9b9247aa928b40f2ae7',
    ],
    [
      'ios',
      'video',
      '4.4.0-video-sdk-ios-full',
      '4.4.0',
      'f13c0f11a91f9305f4af393e2945f0b4',
    ],
    [
      'ios',
      'voice',
      '4.4.0-voice-sdk-ios',
      '4.4.0',
      '5eeb612aed506daed4bd3c2cc2ee8c77',
    ],
  ])(
    'keeps the KTV %s %s compatible package and checksum',
    (platform, product, id, version, md5) => {
      render(
        <ProductSdkDownloads
          platform={platform}
          product={product}
          versionIds={[id]}
        />,
      );
      expect(screen.getAllByRole('article')).toHaveLength(1);
      expect(screen.getByText(`v${version}`)).toBeVisible();
      expect(screen.getByText(md5)).toBeVisible();
      expect(screen.getByText('包体积：')).toBeVisible();
      const download = screen.getByRole('link', { name: /^下载 / });
      expect(download.getAttribute('href')).toContain(`v${version}_`);
      expect(screen.queryByText(/v4\.6\.[23]/)).not.toBeInTheDocument();
    },
  );

  it('rejects a missing pinned release instead of falling back to latest', () => {
    expect(() =>
      render(
        <ProductSdkDownloads
          platform="android"
          product="video"
          versionIds={['not-a-release']}
        />,
      ),
    ).toThrow('Unknown SDK download version');
  });

  it('retains all 18 RTSA C architecture packages and release dates', () => {
    render(<ProductSdkDownloads product="rtsa" platform="c" />);
    const cards = screen.getAllByRole('article');
    expect(cards).toHaveLength(18);
    expect(screen.getAllByText('v1.10.1')).toHaveLength(18);
    expect(screen.getAllByText('发布日期：2026 年 9 月 4 日')).toHaveLength(18);
    expect(screen.getAllByRole('link', { name: /^下载 / })).toHaveLength(18);
    for (const card of cards) {
      expect(within(card).getByRole('link').getAttribute('href')).toMatch(
        /-v1\.10\.1-[\d_]+-\d+\.tgz$/,
      );
    }
    expect(screen.queryByText('v1.9.2')).not.toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('shows only the current RTM Android download with RTC-style metadata', () => {
    render(<ProductSdkDownloads platform="android" product="signaling" />);

    const card = screen.getByRole('article', {
      name: 'Java 实时消息 SDK',
    });
    expect(card).toHaveClass('bg-background');
    expect(within(card).getByText('v2.3.0')).toBeVisible();
    expect(
      within(card).getByRole('link', { name: '下载 Java 实时消息 SDK' }),
    ).toHaveAttribute(
      'href',
      'https://download.shengwang.cn/rtm2/release/RTM_JAVA_SDK_for_Android_v2.3.0.zip',
    );
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(screen.queryByText('历史版本')).not.toBeInTheDocument();
  });

  it('retains restored historical whiteboard ZIP metadata when explicitly requested', () => {
    render(
      <ProductSdkDownloads
        platform="android"
        product="whiteboard-sdk"
        versionIds={['2.16.100-interactive-whiteboard-android']}
      />,
    );
    expect(
      screen.getByRole('link', { name: '下载 Android 互动白板 SDK' }),
    ).toHaveAttribute(
      'href',
      'https://github.com/netless-io/whiteboard-android/archive/refs/tags/2.16.100.zip',
    );
    expect(screen.getByText('ecf0c9d1f35124d93264dc46810d3e28')).toBeVisible();
    expect(screen.getByText('com.herewhite.sdk')).toBeVisible();
    expect(screen.getByText('发布日期：2025 年 4 月 7 日')).toBeVisible();
  });

  it('uses the current Whiteboard Web package-manager release', () => {
    render(<ProductSdkDownloads platform="web" product="whiteboard-sdk" />);
    expect(
      screen.getByRole('link', { name: '获取 Web 互动白板 SDK' }),
    ).toHaveAttribute(
      'href',
      'https://www.npmjs.com/package/white-web-sdk/v/2.16.59',
    );
  });

  it('uses package-manager links for SDKs without ZIP downloads', () => {
    render(<ProductSdkDownloads platform="flutter" product="signaling" />);
    expect(
      screen.getByRole('link', { name: '获取 Flutter 实时消息 SDK' }),
    ).toHaveAttribute(
      'href',
      'https://pub.dev/packages/agora_rtm/versions/2.2.6',
    );
  });

  it('keeps both current C++ architectures and excludes Java and older packages', () => {
    render(
      <ProductSdkDownloads
        platform="linux"
        product="server-gateway"
        versionIdPrefixes={['server-gateway-cpp']}
      />,
    );

    const cards = screen.getAllByRole('article');
    expect(cards).toHaveLength(2);
    expect(
      screen.getByRole('article', { name: 'Linux RTC 服务端 SDK C++ x86-64' }),
    ).toBeVisible();
    expect(
      screen.getByRole('article', { name: 'Linux RTC 服务端 SDK C++ arm64' }),
    ).toBeVisible();
    expect(screen.queryByText(/Java/)).not.toBeInTheDocument();
    expect(screen.queryByText('v4.4.30')).not.toBeInTheDocument();
  });

  it('renders each SDK when one solution page has both video and voice', () => {
    render(
      <>
        <ProductSdkDownloads platform="ios" product="video" />
        <ProductSdkDownloads platform="ios" product="voice" />
      </>,
    );
    expect(screen.getAllByRole('article').length).toBeGreaterThanOrEqual(2);
    expect(
      screen.getByRole('region', { name: 'iOS 视频 SDK 下载' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('region', { name: 'iOS 语音 SDK 下载' }),
    ).toBeInTheDocument();
  });

  it.each([
    ['android', 'fastboard'],
    ['web', 'whiteboard-sdk'],
    ['ios', 'meeting'],
    ['electron', 'meeting'],
    ['linux', 'on-premise-recording'],
    ['flutter', 'signaling'],
    ['ios', 'voice'],
  ])('has a current card for %s %s', (platform, product) => {
    render(<ProductSdkDownloads platform={platform} product={product} />);
    expect(screen.getAllByRole('article').length).toBeGreaterThan(0);
  });

  it.each([
    ['go-server-gateway', 'Go'],
    ['python-server-gateway', 'Python'],
    ['server-gateway-java', 'Java'],
  ])(
    'keeps the server SDK %s download on its language page',
    (prefix, name) => {
      render(
        <ProductSdkDownloads
          platform="linux"
          product="server-gateway"
          versionIdPrefixes={[prefix]}
        />,
      );
      expect(
        screen.getByRole('article', { name: new RegExp(name) }),
      ).toBeVisible();
    },
  );
});
