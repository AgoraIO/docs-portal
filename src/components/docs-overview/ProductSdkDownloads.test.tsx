import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ProductSdkDownloads } from './ProductSdkDownloads';

describe('ProductSdkDownloads', () => {
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
