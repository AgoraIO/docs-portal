import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { beforeEach, describe, expect, it } from 'vitest';
import { SdksCatalog } from './SdksCatalog';

beforeEach(() => {
  window.history.replaceState(null, '', '/en/api-reference/sdks');
});

describe('SdksCatalog', () => {
  it('lists each product once with platform tabs and a default install command', () => {
    render(<SdksCatalog />);

    // Product appears exactly once even though it spans many platforms.
    const videoCard = screen.getByRole('article', { name: 'Video SDK' });

    // Default platform (Android, first in canonical order) → Gradle command.
    expect(
      within(videoCard).getByText(
        "implementation 'io.agora.rtc:full-sdk:4.6.3'",
      ),
    ).toBeVisible();
    expect(
      within(videoCard).getByRole('tab', { name: 'Android' }),
    ).toHaveAttribute('aria-selected', 'true');
    // Tabs list other platforms this product supports.
    expect(
      within(videoCard).getByRole('tab', { name: 'Web' }),
    ).toBeInTheDocument();

    // No global platform picker remains.
    expect(
      screen.queryByRole('heading', { name: 'Platforms' }),
    ).not.toBeInTheDocument();
  });

  it('switches the install command when the platform tab changes', () => {
    render(<SdksCatalog />);

    const videoCard = screen.getByRole('article', { name: 'Video SDK' });

    fireEvent.click(within(videoCard).getByRole('tab', { name: 'Web' }));

    expect(
      within(videoCard).getByText('npm i agora-rtc-sdk-ng@4.24.5'),
    ).toBeVisible();
    expect(within(videoCard).getByRole('tab', { name: 'Web' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  it('updates the command when the version changes', () => {
    render(<SdksCatalog />);

    const voiceCard = screen.getByRole('article', { name: 'Voice SDK' });
    const select = within(voiceCard).getByRole('combobox', {
      name: 'Voice SDK version',
    });

    fireEvent.change(select, { target: { value: '1' } });

    expect(
      within(voiceCard).getByText(
        "implementation 'io.agora.rtc:voice-sdk:4.6.2'",
      ),
    ).toBeVisible();
  });

  it('falls back to a download button when the platform has no derivable command', () => {
    render(<SdksCatalog />);

    const chatCard = screen.getByRole('article', { name: 'Chat SDK' });

    fireEvent.click(within(chatCard).getByRole('tab', { name: 'iOS' }));

    expect(
      within(chatCard).queryByRole('button', { name: /copy/i }),
    ).not.toBeInTheDocument();
    expect(
      within(chatCard).getByRole('link', { name: /download sdk/i }),
    ).toHaveAttribute(
      'href',
      'https://download.agora.io/sdk/release/AgoraChat1_3_1.xcframework.zip',
    );
  });

  it('renders a product icon in each card', () => {
    render(<SdksCatalog />);

    const videoCard = screen.getByRole('article', { name: 'Video SDK' });
    expect(videoCard.querySelector('svg')).toBeTruthy();
  });

  it('lists the Agora Agents SDK with TypeScript, Python, and Go tabs', () => {
    render(<SdksCatalog />);

    const agentsCard = screen.getByRole('article', {
      name: 'Agora Agents SDK',
    });

    // Default tab is Python → pip install command.
    expect(
      within(agentsCard).getByRole('tab', { name: 'Python' }),
    ).toHaveAttribute('aria-selected', 'true');
    expect(
      within(agentsCard).getByText('pip install agora-agents'),
    ).toBeVisible();

    // TypeScript and Go tabs are present.
    expect(
      within(agentsCard).getByRole('tab', { name: 'TypeScript' }),
    ).toBeInTheDocument();
    expect(
      within(agentsCard).getByRole('tab', { name: 'Go' }),
    ).toBeInTheDocument();

    // Switching to TypeScript shows the npm command.
    fireEvent.click(
      within(agentsCard).getByRole('tab', { name: 'TypeScript' }),
    );
    expect(
      within(agentsCard).getByText('npm i agora-agents@2.3.1'),
    ).toBeVisible();

    // Switching to Go shows the go get command.
    fireEvent.click(within(agentsCard).getByRole('tab', { name: 'Go' }));
    expect(
      within(agentsCard).getByText(
        'go get github.com/AgoraIO/agora-agents-go/v2@v2.3.1',
      ),
    ).toBeVisible();
  });

  it('filters to the product requested by the query string', () => {
    window.history.replaceState(
      null,
      '',
      '/en/api-reference/sdks?product=voice',
    );

    render(<SdksCatalog />);

    expect(screen.getByText('Showing SDKs for Voice SDK')).toBeVisible();
    expect(
      screen.getByRole('link', { name: /show all sdks/i }),
    ).toHaveAttribute('href', '/en/api-reference/sdks');
    expect(screen.getByRole('article', { name: 'Voice SDK' })).toBeVisible();
    expect(
      screen.queryByRole('article', { name: 'Video SDK' }),
    ).not.toBeInTheDocument();
  });

  it('preselects the requested platform for a product-specific SDK link', () => {
    window.history.replaceState(
      null,
      '',
      '/en/api-reference/sdks?product=voice&platform=unity',
    );

    render(<SdksCatalog />);

    const voiceCard = screen.getByRole('article', { name: 'Voice SDK' });
    expect(
      within(voiceCard).getByRole('tab', { name: 'Unity' }),
    ).toHaveAttribute('aria-selected', 'true');
    expect(
      within(voiceCard).getByRole('tab', { name: 'Android' }),
    ).toHaveAttribute('aria-selected', 'false');
  });

  it('uses a platform-only query to show SDKs available on that platform', () => {
    window.history.replaceState(
      null,
      '',
      '/en/api-reference/sdks?platform=unity',
    );

    render(<SdksCatalog />);

    const voiceCard = screen.getByRole('article', { name: 'Voice SDK' });
    expect(screen.getByText('Showing SDKs for Unity')).toBeVisible();
    expect(
      within(voiceCard).getByRole('tab', { name: 'Unity' }),
    ).toHaveAttribute('aria-selected', 'true');
    expect(
      screen.queryByRole('article', { name: 'Agora Agents SDK' }),
    ).not.toBeInTheDocument();
  });

  it('updates product and platform filters when search params change after mount', async () => {
    render(<SdksCatalog />);

    expect(screen.getByRole('article', { name: 'Video SDK' })).toBeVisible();

    act(() => {
      window.history.pushState(
        null,
        '',
        '/en/api-reference/sdks?product=voice&platform=unity',
      );
    });

    await waitFor(() => {
      expect(screen.getByText('Showing SDKs for Voice SDK')).toBeVisible();
    });

    const voiceCard = screen.getByRole('article', { name: 'Voice SDK' });
    expect(
      screen.queryByRole('article', { name: 'Video SDK' }),
    ).not.toBeInTheDocument();
    expect(
      within(voiceCard).getByRole('tab', { name: 'Unity' }),
    ).toHaveAttribute('aria-selected', 'true');
  });

  it('renders the unfiltered static catalog on the server', () => {
    window.history.replaceState(
      null,
      '',
      '/en/api-reference/sdks?product=voice&platform=unity',
    );

    const html = renderToString(<SdksCatalog />);

    expect(html).not.toContain('Showing SDKs for Voice SDK');
    expect(html).toContain('Voice SDK');
    expect(html).toContain('Video SDK');
  });

  it('groups whiteboard and fastboard SDKs for the whiteboard product query', () => {
    window.history.replaceState(
      null,
      '',
      '/en/api-reference/sdks?product=whiteboard',
    );

    render(<SdksCatalog />);

    expect(screen.getByText('Showing SDKs for Whiteboard SDKs')).toBeVisible();
    expect(
      screen.getByRole('article', { name: 'Interactive Whiteboard SDK' }),
    ).toBeVisible();
    expect(
      screen.getByRole('article', { name: 'Interactive Whiteboard Fastboard' }),
    ).toBeVisible();
    expect(
      screen.queryByRole('article', { name: 'Voice SDK' }),
    ).not.toBeInTheDocument();
  });

  it('renders the zh-CN catalog with localized links and filters', () => {
    window.history.replaceState(
      null,
      '',
      '/zh-CN/api-reference/sdks?product=signaling&platform=harmonyos',
    );

    render(<SdksCatalog locale="zh-CN" />);

    expect(screen.getByText('正在显示 Signaling SDK')).toBeVisible();
    expect(screen.getByRole('link', { name: '查看全部 SDK' })).toHaveAttribute(
      'href',
      '/zh-CN/api-reference/sdks',
    );

    const signalingCard = screen.getByRole('article', {
      name: 'Signaling SDK',
    });
    expect(
      within(signalingCard).getByRole('tab', { name: 'HarmonyOS' }),
    ).toHaveAttribute('aria-selected', 'true');
    expect(
      within(signalingCard).getByRole('link', { name: '下载 SDK' }),
    ).toHaveAttribute(
      'href',
      'https://download.shengwang.cn/rtm2/release/RTM_ArkTS_SDK_for_HarmonyOS_v2.2.8.zip',
    );
  });

  it('uses prop filters for zh-CN product download pages', () => {
    render(<SdksCatalog locale="zh-CN" platform="linux" product="signaling" />);

    expect(screen.getByText('正在显示 Signaling SDK')).toBeVisible();
    expect(
      screen.queryByRole('article', { name: '视频 SDK' }),
    ).not.toBeInTheDocument();

    const signalingCard = screen.getByRole('article', {
      name: 'Signaling SDK',
    });
    expect(
      within(signalingCard).getByRole('tab', { name: 'Linux' }),
    ).toHaveAttribute('aria-selected', 'true');
    expect(
      within(signalingCard).getByRole('link', { name: '下载 SDK' }),
    ).toHaveAttribute(
      'href',
      'https://download.shengwang.cn/rtm2/release/RTM_C%2B%2B_SDK_for_Linux_v2.2.8.zip',
    );
    expect(
      within(signalingCard).getByText('f88b55a96cd975494d9592ba3ffe08d8'),
    ).toBeVisible();
  });

  it('derives zh-CN Android install commands from confirmed package versions', () => {
    window.history.replaceState(
      null,
      '',
      '/zh-CN/api-reference/sdks?product=video&platform=android',
    );

    render(<SdksCatalog locale="zh-CN" />);

    const videoCard = screen.getByRole('article', { name: '视频 SDK' });
    expect(
      within(videoCard).getByText(
        "implementation 'cn.shengwang.rtc:full-sdk:4.6.3'",
      ),
    ).toBeVisible();
    expect(
      within(videoCard).getByRole('link', { name: '直接下载' }),
    ).toHaveAttribute(
      'href',
      'https://download.shengwang.cn/sdk/release/Shengwang_Native_SDK_for_Android_v4.6.3_FULL.zip',
    );
  });

  it('ignores invalid product and platform query values', () => {
    window.history.replaceState(
      null,
      '',
      '/en/api-reference/sdks?product=unknown&platform=not-a-platform',
    );

    render(<SdksCatalog />);

    const videoCard = screen.getByRole('article', { name: 'Video SDK' });
    expect(screen.queryByText(/showing sdks for/i)).not.toBeInTheDocument();
    expect(
      within(videoCard).getByRole('tab', { name: 'Android' }),
    ).toHaveAttribute('aria-selected', 'true');
  });
});
