import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ProductSdkDownloads } from './ProductSdkDownloads';

describe('ProductSdkDownloads', () => {
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
      const link = screen.getByRole('link');
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
      name: 'Android 实时消息 SDK',
    });
    expect(card).toHaveClass('bg-background');
    expect(within(card).getByText('v2.3.0')).toBeVisible();
    expect(
      within(card).getByRole('link', { name: '下载 Android 实时消息 SDK' }),
    ).toHaveAttribute(
      'href',
      'https://download.shengwang.cn/rtm2/release/RTM_JAVA_SDK_for_Android_v2.3.0.zip',
    );
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(screen.queryByText('历史版本')).not.toBeInTheDocument();
  });

  it('uses package-manager links for SDKs without ZIP downloads', () => {
    render(<ProductSdkDownloads platform="android" product="whiteboard-sdk" />);
    expect(
      screen.getByRole('link', { name: '获取 Android 互动白板 SDK' }),
    ).toHaveAttribute(
      'href',
      'https://github.com/netless-io/whiteboard-android/releases/tag/2.16.100',
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
    ['web', 'flexible-classroom'],
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
