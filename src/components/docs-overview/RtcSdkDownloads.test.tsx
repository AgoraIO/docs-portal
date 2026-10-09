import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { RtcSdkDownloads } from './RtcSdkDownloads';

describe('RtcSdkDownloads', () => {
  it('shows separate direct-download cards for the latest Android Full and Lite packages', () => {
    render(<RtcSdkDownloads platform="android" product="video" />);

    const full = screen.getByRole('article', { name: 'Android Full' });
    const lite = screen.getByRole('article', { name: 'Android Lite' });
    expect(screen.getAllByRole('article')).toHaveLength(2);

    expect(within(full).getByText('v4.6.3')).toBeVisible();
    expect(
      within(full).getByText('70cb117df069f30501ca13f5147e3a99'),
    ).toBeVisible();
    expect(within(full).getByText('io.agora.rtc2.video')).toBeVisible();
    expect(within(full).getByText('发布日期：2026 年 2 月 9 日')).toBeVisible();
    expect(
      within(full).getByRole('link', { name: '下载 Android Full' }),
    ).toHaveAttribute(
      'href',
      'https://download.shengwang.cn/sdk/release/Shengwang_Native_SDK_for_Android_v4.6.3_FULL.zip',
    );
    expect(
      within(lite).getByRole('link', { name: '下载 Android Lite' }),
    ).toHaveAttribute(
      'href',
      'https://download.shengwang.cn/sdk/release/Shengwang_Native_SDK_for_Android_v4.6.3_LITE.zip',
    );
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(screen.queryByText('历史版本')).not.toBeInTheDocument();
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
    ['react-js', 'js.svg'],
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
      expect(card?.querySelector('div.border-t img')).toHaveAttribute(
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
