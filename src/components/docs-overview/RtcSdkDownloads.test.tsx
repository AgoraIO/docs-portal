import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { RtcSdkDownloads } from './RtcSdkDownloads';

describe('RtcSdkDownloads', () => {
  it.each([
    [
      'flutter',
      'Flutter',
      '6.6.4（对应 Native v4.6.4）',
      'https://pub.dev/packages/shengwang_rtc_engine/versions/6.6.4',
    ],
    [
      'react-native',
      'React Native',
      '4.6.4',
      'https://www.npmjs.com/package/react-native-shengwang/v/4.6.4',
    ],
  ])(
    'shows the current #2084 %s video package',
    (platform, label, version, url) => {
      render(<RtcSdkDownloads platform={platform} product="video" />);
      const card = screen.getByRole('article', { name: `${label} 视频 SDK` });
      expect(screen.getAllByRole('article')).toHaveLength(1);
      expect(within(card).getByText(`v${version}`)).toBeVisible();
      expect(
        within(card).getByText('发布日期：2026 年 8 月 31 日'),
      ).toBeVisible();
      expect(
        within(card).getByRole('link', { name: `获取 ${label} 视频 SDK` }),
      ).toHaveAttribute('href', url);
    },
  );

  it('shows separate direct-download cards for the latest Android Full and Lite packages', () => {
    render(<RtcSdkDownloads platform="android" product="video" />);

    const full = screen.getByRole('article', { name: 'Android Full' });
    const lite = screen.getByRole('article', { name: 'Android Lite' });
    expect(screen.getAllByRole('article')).toHaveLength(2);

    expect(within(full).getByText('v4.7.0')).toBeVisible();
    expect(
      within(full).getByText('867fb78c2eb1ec8ff02ba073a1fd2e1d'),
    ).toBeVisible();
    expect(within(full).getByText('io.agora.rtc2.video')).toBeVisible();
    expect(
      within(full).getByText(
        'armeabi-v7a 16.55 MB；arm64-v8a 17.17 MB；x86 17.81 MB；x86_64 17.44 MB',
      ),
    ).toBeVisible();
    expect(
      within(full).getByText('发布日期：2026 年 9 月 22 日'),
    ).toBeVisible();
    expect(
      within(full).getByRole('link', { name: '下载 Android Full' }),
    ).toHaveAttribute(
      'href',
      'https://download.shengwang.cn/sdk/release/Shengwang_Native_SDK_for_Android_v4.7.0_FULL.zip',
    );
    expect(
      within(lite).getByRole('link', { name: '下载 Android Lite' }),
    ).toHaveAttribute(
      'href',
      'https://download.shengwang.cn/sdk/release/Shengwang_Native_SDK_for_Android_v4.7.0_LITE.zip',
    );
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(screen.queryByText('历史版本')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: '包管理器' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: /4\.6\.2/ }),
    ).not.toBeInTheDocument();
  });

  it('uses the same data for the audio variant without showing video packages', () => {
    render(<RtcSdkDownloads platform="android" product="voice" />);

    expect(
      screen.getByRole('article', { name: 'Android 音频 SDK' }),
    ).toBeVisible();
    expect(
      screen.queryByRole('article', { name: 'Android Full' }),
    ).not.toBeInTheDocument();
  });

  it('shows the Native 4.7.0 iOS variants and release metadata', () => {
    render(<RtcSdkDownloads platform="ios" product="video" />);

    const full = screen.getByRole('article', { name: 'iOS Full' });
    const lite = screen.getByRole('article', { name: 'iOS Lite' });
    expect(within(full).getByText('v4.7.0')).toBeVisible();
    expect(
      within(full).getByText('044dafd641e8d44b9e2583c5481aeaa8'),
    ).toBeVisible();
    expect(
      within(lite).getByText('c29b295befc44fe4ab5023e166e93e41'),
    ).toBeVisible();
    expect(within(full).getByText('31.69 MB')).toBeVisible();
    expect(within(lite).getByText('14.97 MB')).toBeVisible();
    expect(
      within(full).getByText('发布日期：2026 年 9 月 22 日'),
    ).toBeVisible();
  });

  it('shows the Native 4.7.0 macOS and Windows packages', () => {
    render(<RtcSdkDownloads platform="macos" product="video" />);
    expect(
      screen.getByRole('article', { name: 'macOS 视频 SDK' }),
    ).toBeVisible();
    expect(screen.getByText('v4.7.0')).toBeVisible();

    render(<RtcSdkDownloads platform="windows" product="video" />);
    expect(
      screen.getByRole('article', { name: 'Windows 视频 SDK' }),
    ).toBeVisible();
    expect(screen.getAllByText('v4.7.0')).toHaveLength(2);
  });

  it('shows the standard Electron SDK and the current UnionTech edition without historical versions', () => {
    render(<RtcSdkDownloads platform="electron" product="video" />);

    const standard = screen.getByRole('article', {
      name: 'Electron 视频 SDK',
    });
    const unionTech = screen.getByRole('article', {
      name: 'Electron for 统信 OS',
    });
    expect(screen.getAllByRole('article')).toHaveLength(2);
    expect(within(standard).getByText('v4.6.2')).toBeVisible();
    expect(
      within(standard).getByRole('link', { name: '获取 Electron 视频 SDK' }),
    ).toHaveAttribute(
      'href',
      'https://www.npmjs.com/package/shengwang-electron-sdk/v/4.6.2',
    );
    expect(
      within(unionTech).getByText('v4.5.40-rc.2（统信 OS 专版）'),
    ).toBeVisible();
    expect(
      within(unionTech).getByRole('link', {
        name: '获取 Electron for 统信 OS',
      }),
    ).toHaveAttribute(
      'href',
      'https://www.npmjs.com/package/agora-electron-sdk/v/4.5.40-rc.2',
    );
    expect(
      within(unionTech).getByText('发布日期：2025 年 9 月 30 日'),
    ).toBeVisible();
    expect(
      screen.queryByRole('link', { name: /4\.5\.2/ }),
    ).not.toBeInTheDocument();
  });

  it.each([
    ['android', 'android.svg'],
    ['ios', 'ios.svg'],
    ['web', 'js.svg'],
    ['react-js', 'react-native.svg'],
    ['unreal-engine', 'unreal-engine.svg'],
    ['windows', 'windows.svg'],
  ])(
    'uses the API reference icon and neutral card surface for %s',
    (platform, icon) => {
      const { container } = render(
        <RtcSdkDownloads platform={platform} product="video" />,
      );
      const card = container.querySelector('article');

      expect(card).toHaveClass('bg-background');
      expect(card).not.toHaveClass('bg-sky-50/50');
      expect(card?.querySelector('img')).toHaveAttribute(
        'src',
        icon === 'windows.svg'
          ? 'https://doc.shengwang.cn/img/platforms/windows.svg'
          : `https://assets-docs.agora.io/images/api-reference/platforms/${icon}`,
      );
    },
  );

  it.each([
    ['android', 'voice'],
    ['android', 'video'],
    ['ios', 'voice'],
    ['ios', 'video'],
    ['harmonyos', 'voice'],
    ['harmonyos', 'video'],
    ['unity', 'voice'],
    ['unity', 'video'],
    ['unreal-engine', 'voice'],
    ['unreal-engine', 'video'],
    ...[
      'macos',
      'windows',
      'web',
      'react-js',
      'flutter',
      'react-native',
      'electron',
      'mini-program',
    ].map((platform): [string, 'video'] => [platform, 'video']),
  ] as const)('has an SDK entry for %s %s', (platform, product) => {
    const { container } = render(
      <RtcSdkDownloads platform={platform} product={product} />,
    );
    expect(container.querySelector('article')).toBeInTheDocument();
  });
});
