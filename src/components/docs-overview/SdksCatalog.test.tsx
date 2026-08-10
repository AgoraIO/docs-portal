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
  it('uses a responsive card grid for the full catalog', () => {
    const { container } = render(<SdksCatalog locale="zh-CN" />);

    const catalog = container.querySelector('[data-sdk-download-catalog]');
    expect(catalog).toHaveAttribute('data-layout', 'catalog');
    expect(catalog).toHaveClass('grid', 'md:grid-cols-2');

    const videoCard = screen.getByRole('article', { name: '视频 SDK' });
    expect(videoCard).toHaveClass('bg-card', 'shadow-sm');
  });

  it('keeps a filtered product embed full width without a redundant summary', () => {
    const { container } = render(
      <SdksCatalog locale="zh-CN" platform="android" product="video" />,
    );

    const catalog = container.querySelector('[data-sdk-download-catalog]');
    expect(catalog).toHaveAttribute('data-layout', 'embedded');
    expect(catalog).not.toHaveClass('md:grid-cols-2');
    expect(screen.queryByText('正在显示 视频 SDK')).not.toBeInTheDocument();
  });

  it('preserves the English embedded summary and spacing', () => {
    const { container } = render(
      <SdksCatalog platform="linux" product="signaling" />,
    );

    const catalog = container.querySelector('[data-sdk-download-catalog]');
    expect(catalog).toHaveClass('gap-3');
    expect(screen.getByText('Showing SDKs for Signaling SDK')).toBeVisible();
  });

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
    expect(
      within(videoCard).getByRole('tab', { name: 'Android' }),
    ).not.toHaveClass('shrink-0');

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
      within(videoCard).getByText('npm i agora-rtc-sdk-ng@4.24.6'),
    ).toBeVisible();
    expect(within(videoCard).getByRole('tab', { name: 'Web' })).toHaveAttribute(
      'aria-selected',
      'true',
    );

    const voiceCard = screen.getByRole('article', { name: 'Voice SDK' });

    fireEvent.click(within(voiceCard).getByRole('tab', { name: 'Web' }));

    expect(
      within(voiceCard).getByText('npm i agora-rtc-sdk-ng@4.24.6'),
    ).toBeVisible();
  });

  it('keeps long install commands horizontally inspectable with mobile-sized controls', async () => {
    render(<SdksCatalog locale="zh-CN" />);

    const agentsCard = screen.getByRole('article', {
      name: '对话式 AI 引擎 SDK',
    });
    const typescriptTab = within(agentsCard).getByRole('tab', {
      name: 'TypeScript',
    });

    fireEvent.click(typescriptTab);

    const command = within(agentsCard).getByText('npm i agora-agents@2.3.1');
    const copyButton = within(agentsCard).getByRole('button', {
      name: '复制集成命令',
    });
    const scrollRegion = within(agentsCard).getByRole('region', {
      name: '可横向滚动的集成命令',
    });

    Object.defineProperties(scrollRegion, {
      clientWidth: { configurable: true, value: 160 },
      scrollWidth: { configurable: true, value: 260 },
    });
    fireEvent(window, new Event('resize'));

    expect(command).not.toHaveClass('truncate');
    expect(command).toHaveClass('whitespace-nowrap');
    expect(command).not.toHaveClass('break-all');
    expect(scrollRegion).toHaveClass('overflow-x-auto');
    await waitFor(() => {
      expect(scrollRegion).toHaveAttribute('tabindex', '0');
    });
    expect(scrollRegion).toHaveAccessibleDescription(
      '命令超出当前宽度，可横向滚动查看完整内容。',
    );
    expect(scrollRegion.parentElement).toHaveAttribute(
      'data-command-overflow',
      'true',
    );
    expect(scrollRegion.parentElement).toHaveAttribute(
      'data-command-scroll-end',
      'false',
    );
    const overflowCue = scrollRegion.parentElement?.querySelector(
      '[aria-hidden="true"]',
    );
    expect(overflowCue).toHaveClass('opacity-100');

    scrollRegion.scrollLeft = 100;
    fireEvent.scroll(scrollRegion);

    await waitFor(() => {
      expect(scrollRegion.parentElement).toHaveAttribute(
        'data-command-scroll-end',
        'true',
      );
    });
    expect(overflowCue).toHaveClass('opacity-0');
    expect(typescriptTab).toHaveClass('min-h-11');
    expect(copyButton).toHaveClass('min-h-11', 'min-w-11');
    expect(
      within(agentsCard).getByRole('tablist', {
        name: '对话式 AI 引擎 SDK 平台',
      }),
    ).toHaveClass('overflow-x-auto');

    const packageManager = within(agentsCard).getByRole('link', {
      name: '包管理器 ↗',
    });
    expect(packageManager).toHaveClass('min-h-11');
  });

  it('only exposes the latest SDK version for download', () => {
    render(<SdksCatalog />);

    const voiceCard = screen.getByRole('article', { name: 'Voice SDK' });

    expect(
      within(voiceCard).getByText(
        "implementation 'io.agora.rtc:voice-sdk:4.6.3'",
      ),
    ).toBeVisible();
    expect(within(voiceCard).queryByRole('combobox')).not.toBeInTheDocument();
    expect(
      within(voiceCard).queryByText(
        "implementation 'io.agora.rtc:voice-sdk:4.6.2'",
      ),
    ).not.toBeInTheDocument();
  });

  it('keeps current package variants without exposing previous versions', () => {
    render(<SdksCatalog />);

    const videoCard = screen.getByRole('article', { name: 'Video SDK' });
    const select = within(videoCard).getByRole('combobox', {
      name: 'Video SDK version',
    }) as HTMLSelectElement;
    const optionLabels = Array.from(select.options).map(
      (option) => option.textContent,
    );

    expect(optionLabels).toEqual(['v4.6.3 - Latest', 'v4.6.3 Lite - Latest']);

    fireEvent.change(select, { target: { value: '1' } });

    expect(
      within(videoCard).getByText(
        "implementation 'io.agora.rtc:lite-sdk:4.6.3'",
      ),
    ).toBeVisible();
  });

  it('does not append Previous to older SDK version options', () => {
    render(<SdksCatalog />);

    const voiceCard = screen.getByRole('article', { name: 'Voice SDK' });
    expect(within(voiceCard).queryByRole('combobox')).not.toBeInTheDocument();
    expect(within(voiceCard).queryByText(/Previous/)).not.toBeInTheDocument();
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
      'https://download.agora.io/sdk/release/AgoraChat1_4_0.zip',
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
      '/zh-CN/reference/sdks?product=signaling&platform=harmonyos',
    );

    render(<SdksCatalog locale="zh-CN" />);

    expect(screen.getByText('正在显示 实时消息 SDK')).toBeVisible();
    expect(screen.getByRole('link', { name: '查看全部 SDK' })).toHaveAttribute(
      'href',
      '/zh-CN/reference/sdks',
    );

    const signalingCard = screen.getByRole('article', {
      name: '实时消息 SDK',
    });
    expect(
      within(signalingCard).getByRole('tab', { name: 'HarmonyOS' }),
    ).toHaveAttribute('aria-selected', 'true');
    expect(
      within(signalingCard).getByRole('link', { name: '下载 SDK' }),
    ).toHaveAttribute(
      'href',
      'https://download.shengwang.cn/rtm2/release/RTM_ArkTS_SDK_for_HarmonyOS_v2.3.0.zip',
    );
  });

  it('uses prop filters for zh-CN product download pages', () => {
    render(<SdksCatalog locale="zh-CN" platform="linux" product="signaling" />);

    expect(screen.queryByText('正在显示 实时消息 SDK')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('article', { name: '视频 SDK' }),
    ).not.toBeInTheDocument();

    const signalingCard = screen.getByRole('article', {
      name: '实时消息 SDK',
    });
    expect(
      within(signalingCard).getByRole('tab', { name: 'Linux' }),
    ).toHaveAttribute('aria-selected', 'true');
    expect(
      within(signalingCard).getByRole('link', { name: '下载 SDK' }),
    ).toHaveAttribute(
      'href',
      'https://download.shengwang.cn/rtm2/release/RTM_C%2B%2B_SDK_for_Linux_v2.3.0.zip',
    );
    expect(
      within(signalingCard).getByText('9a8ee5f8deda76e23eea80f5b3c5a453'),
    ).toBeVisible();
  });

  it('renders flexible classroom solution SDKs in the zh-CN catalog', () => {
    render(
      <SdksCatalog
        locale="zh-CN"
        platform="android"
        product="flexible-classroom"
      />,
    );

    expect(screen.queryByText('正在显示 灵动课堂 SDK')).not.toBeInTheDocument();
    expect(screen.getByRole('article', { name: '灵动课堂 SDK' })).toBeVisible();
    expect(
      screen.queryByRole('article', { name: '云课堂 SDK' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('article', { name: '灵动监考 SDK' }),
    ).not.toBeInTheDocument();
  });

  it('renders meeting SDKs in the zh-CN catalog', () => {
    render(
      <SdksCatalog locale="zh-CN" platform="electron" product="meeting" />,
    );

    expect(
      screen.queryByText('正在显示 智能云会议引擎 SDK'),
    ).not.toBeInTheDocument();
    const meetingCard = screen.getByRole('article', {
      name: '智能云会议引擎 SDK',
    });
    expect(
      within(meetingCard).getByText('npm i fcr-ui-scene@3.1.0'),
    ).toBeVisible();
  });

  it('does not expose a superseded zh-CN SDK marked as latest', () => {
    render(
      <SdksCatalog locale="zh-CN" platform="flutter" product="signaling" />,
    );

    const signalingCard = screen.getByRole('article', {
      name: '实时消息 SDK',
    });

    expect(
      within(signalingCard).getByText('flutter pub add agora_rtm:2.2.6'),
    ).toBeVisible();
    expect(
      within(signalingCard).queryByRole('combobox'),
    ).not.toBeInTheDocument();
    expect(
      within(signalingCard).queryByText('flutter pub add agora_rtm:2.2.5'),
    ).not.toBeInTheDocument();
  });

  it('uses the current Flutter Signaling package in the English catalog', () => {
    render(<SdksCatalog platform="flutter" product="signaling" />);

    const signalingCard = screen.getByRole('article', {
      name: 'Signaling SDK',
    });

    expect(
      within(signalingCard).getByText('flutter pub add agora_rtm:2.2.6'),
    ).toBeVisible();
    expect(
      within(signalingCard).queryByRole('combobox'),
    ).not.toBeInTheDocument();
    expect(
      within(signalingCard).queryByText('flutter pub add agora_rtm:2.2.5'),
    ).not.toBeInTheDocument();
  });

  it('uses the current Web Voice package in the zh-CN catalog', () => {
    render(<SdksCatalog locale="zh-CN" platform="web" product="voice" />);

    const voiceCard = screen.getByRole('article', { name: '语音 SDK' });

    expect(
      within(voiceCard).getByText('npm i agora-rtc-sdk-ng@4.24.6'),
    ).toBeVisible();
    expect(
      within(voiceCard).getByRole('link', { name: '下载 SDK' }),
    ).toHaveAttribute(
      'href',
      'https://download.agora.io/sdk/release/Agora_Web_SDK_v4_24_6_FULL.zip',
    );
    expect(
      within(voiceCard).getByRole('link', { name: '包管理器 ↗' }),
    ).toHaveAttribute(
      'href',
      'https://www.npmjs.com/package/agora-rtc-sdk-ng/v/4.24.6',
    );
    expect(within(voiceCard).queryByRole('combobox')).not.toBeInTheDocument();
    expect(
      within(voiceCard).queryByText('npm i agora-rtc-sdk-ng@4.24.3'),
    ).not.toBeInTheDocument();
  });

  it('localizes zh-CN package variant and language labels', () => {
    render(<SdksCatalog locale="zh-CN" />);

    const videoOptions = within(
      screen.getByRole('article', { name: '视频 SDK' }),
    )
      .getAllByRole('option')
      .map((option) => option.textContent);
    expect(videoOptions).toEqual([
      'v4.6.3 完整版 - 最新',
      'v4.6.3 轻量版 - 最新',
    ]);

    const serverOptions = within(
      screen.getByRole('article', { name: 'RTC 服务端 SDK' }),
    )
      .getAllByRole('option')
      .map((option) => option.textContent);
    expect(serverOptions).toContain('v2.2.8 Go - 最新');
    expect(serverOptions).toContain('v2.2.4 Python - 最新');
    expect(serverOptions.join(' ')).not.toContain(' for ');
  });

  it('orders zh-CN sdk groups as ai, realtime-media, then solutions', () => {
    render(<SdksCatalog locale="zh-CN" />);

    const headings = screen
      .getAllByRole('heading', { level: 3 })
      .map((node) => node.textContent?.trim())
      .filter(Boolean);

    expect(headings.indexOf('对话式 AI 引擎 SDK')).toBeLessThan(
      headings.indexOf('语音 SDK'),
    );
    expect(headings.indexOf('语音 SDK')).toBeLessThan(
      headings.indexOf('智能云会议引擎 SDK'),
    );
    expect(headings.indexOf('智能云会议引擎 SDK')).toBeLessThan(
      headings.indexOf('灵动课堂 SDK'),
    );
  });

  it('uses canonical Chinese product names and descriptions throughout the catalog', () => {
    render(<SdksCatalog locale="zh-CN" />);

    const expectedProducts = [
      ['对话式 AI 引擎 SDK', '用于在服务端构建和运行语音智能体的 SDK'],
      [
        '语音 SDK',
        '适用于语音通话、纯音频互动直播和纯音频极速直播的实时互动 SDK',
      ],
      ['视频 SDK', '适用于音视频通话、互动直播和极速直播的实时互动 SDK'],
      ['实时消息 SDK', '提供低延时消息、信令、状态同步和频道管理能力的 SDK'],
      ['即时通讯 SDK', '适用于即时通讯场景的 SDK'],
      ['物联网 aPaaS SDK', '适用于嵌入式设备实时音视频互动的 SDK'],
      ['媒体播放器组件', '用于在客户端播放本地或在线媒体资源的组件'],
      ['互动白板 SDK', '提供可高度定制且不含默认 UI 的互动白板核心能力'],
      ['Fastboard SDK', '提供默认 UI，支持快速集成互动白板功能的 SDK'],
      [
        '智能云会议引擎 SDK',
        '用于构建多人音视频会议、会控、协作办公和 AI 会议体验的 SDK',
      ],
      [
        'RTC 服务端 SDK',
        '部署在服务端，用于向 RTC 频道发送音视频流或从频道接收音视频流',
      ],
      ['本地服务端录制 SDK', '部署在本地服务端，用于录制 RTC 频道中的音视频流'],
      ['灵动课堂 SDK', '适用于教育场景和课堂 UI 定制的 SDK'],
      ['云课堂 SDK', '提供默认课堂 UI 的场景化 SDK'],
      ['灵动监考 SDK', '适用于在线监考场景的 SDK'],
    ] as const;

    for (const [name, description] of expectedProducts) {
      expect(
        within(screen.getByRole('article', { name })).getByText(description),
      ).toBeVisible();
    }

    const catalogText = screen
      .getAllByRole('article')
      .map((article) => article.textContent)
      .join('\n');
    expect(catalogText).not.toMatch(
      /SDK for:?|Signaling SDK|Chat SDK|Mediaplayer Kit SDK|Interactive Whiteboard Fastboard|灵动会议 SDK/,
    );
  });

  it('derives zh-CN Android install commands from confirmed package versions', () => {
    window.history.replaceState(
      null,
      '',
      '/zh-CN/reference/sdks?product=video&platform=android',
    );

    render(<SdksCatalog locale="zh-CN" />);

    const videoCard = screen.getByRole('article', { name: '视频 SDK' });
    expect(
      within(videoCard).getByText(
        "implementation 'cn.shengwang.rtc:full-sdk:4.6.3'",
      ),
    ).toBeVisible();
    const downloadLink = within(videoCard).getByRole('link', {
      name: '下载 SDK',
    });
    expect(downloadLink).toHaveAttribute(
      'href',
      'https://download.shengwang.cn/sdk/release/Shengwang_Native_SDK_for_Android_v4.6.3_FULL.zip',
    );
    expect(downloadLink).toHaveClass('bg-primary', 'min-h-11');
    expect(
      within(videoCard).getByRole('combobox', { name: '视频 SDK 版本' }),
    ).toHaveClass('min-h-11');
    expect(
      within(videoCard).getByRole('link', { name: '包管理器 ↗' }),
    ).toHaveClass('min-h-11');
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
