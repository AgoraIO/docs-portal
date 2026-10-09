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

function openProductCard(name: string) {
  const card = screen.getByRole('article', { name });
  const details = card.querySelector('details');

  if (details && !details.open) {
    fireEvent.click(details.querySelector('summary') as HTMLElement);
  }

  return card;
}

describe('SdksCatalog', () => {
  it('does not render product or platform filters on the full Chinese catalog', () => {
    render(<SdksCatalog locale="zh-CN" />);

    expect(
      screen.queryByRole('combobox', { name: '产品' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('combobox', { name: '平台' }),
    ).not.toBeInTheDocument();
  });

  it('keeps URL product filters working without rendering filter controls', () => {
    window.history.replaceState(
      null,
      '',
      '/zh-CN/reference/sdks?product=video',
    );
    render(<SdksCatalog locale="zh-CN" />);

    expect(screen.getByRole('article', { name: '视频 SDK' })).toBeVisible();
    expect(
      screen.queryByRole('article', { name: '语音 SDK' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('combobox', { name: '产品' }),
    ).not.toBeInTheDocument();
  });

  it('uses a platform select for every product and no platform tablist', () => {
    const { container } = render(<SdksCatalog locale="zh-CN" />);

    expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
    expect(container.querySelectorAll('select[id$="-platform"]')).toHaveLength(
      16,
    );
  });

  it('does not show an install-tool badge beside Chinese platform selectors', () => {
    render(<SdksCatalog locale="zh-CN" />);

    const voiceCard = openProductCard('语音 SDK');
    expect(within(voiceCard).queryByText('Gradle')).not.toBeInTheDocument();
  });

  it('shows download-card metadata in Chinese overview products', () => {
    render(<SdksCatalog locale="zh-CN" />);

    const voiceCard = openProductCard('语音 SDK');
    const downloadCard = within(voiceCard).getByRole('article', {
      name: 'Android 音频 SDK',
    });
    expect(within(downloadCard).getByText('io.agora.rtc2.voice')).toBeVisible();
    expect(
      within(downloadCard).getByText('2801dfea3c96a32e6aaaa354d819ec71'),
    ).toBeVisible();
    expect(
      within(downloadCard).getByText('发布日期：2026 年 2 月 9 日'),
    ).toBeVisible();
  });

  it('uses download-page cards in Chinese overview products', () => {
    render(<SdksCatalog locale="zh-CN" />);

    const videoCard = openProductCard('视频 SDK');
    expect(
      within(videoCard).getByRole('article', { name: 'Android Full' }),
    ).toBeVisible();
    expect(
      within(videoCard).getByRole('combobox', { name: '视频 SDK 平台' }),
    ).toHaveValue('android');
    expect(
      within(videoCard).getByRole('link', { name: '查看下载页 ↗' }),
    ).toHaveAttribute(
      'href',
      '/zh-CN/realtime-media/rtc/reference/downloads/android',
    );
    expect(
      within(videoCard).queryByText(
        "implementation 'cn.shengwang.rtc:full-sdk:4.6.3'",
      ),
    ).not.toBeInTheDocument();
  });

  it('updates overview download cards and page links when the platform changes', () => {
    render(<SdksCatalog locale="zh-CN" />);

    const videoCard = openProductCard('视频 SDK');
    fireEvent.change(
      within(videoCard).getByRole('combobox', { name: '视频 SDK 平台' }),
      { target: { value: 'ios' } },
    );

    expect(
      within(videoCard).getByRole('article', { name: 'iOS Full' }),
    ).toBeVisible();
    expect(
      within(videoCard).getByRole('link', { name: '查看下载页 ↗' }),
    ).toHaveAttribute(
      'href',
      '/zh-CN/realtime-media/rtc/reference/downloads/ios',
    );
  });

  it('does not show a download-page link when a product has no dedicated page', () => {
    render(<SdksCatalog locale="zh-CN" />);

    const agentsCard = screen.getByRole('article', {
      name: 'Agora Agents SDK',
    });
    expect(
      within(agentsCard).queryByRole('link', { name: '查看下载页 ↗' }),
    ).not.toBeInTheDocument();
  });

  it('separates Agora Agents SDK from the conversational AI client toolkit', () => {
    render(<SdksCatalog locale="zh-CN" />);

    expect(
      screen.getByRole('article', { name: 'Agora Agents SDK' }),
    ).toBeVisible();
    const clientToolkit = openProductCard('客户端组件 SDK');
    const platform = within(clientToolkit).getByRole('combobox', {
      name: '客户端组件 SDK 平台',
    });

    expect(platform).toHaveValue('android');
    expect(
      within(platform).getByRole('option', { name: 'iOS' }),
    ).toBeInTheDocument();
    expect(
      within(platform).getByRole('option', { name: 'Web' }),
    ).toBeInTheDocument();
    expect(
      within(clientToolkit).getByText(
        "implementation 'io.agora.agents:agora-agent-client-toolkit:2.9.0'",
      ),
    ).toBeVisible();
  });

  it('renders SDK products under API reference capability headings', () => {
    render(<SdksCatalog locale="zh-CN" />);

    expect(
      screen.getByRole('heading', { name: '对话式 AI 引擎' }),
    ).toBeVisible();
    expect(
      screen.getByRole('heading', { name: '实时互动基础能力' }),
    ).toBeVisible();
    expect(
      screen.getByRole('heading', { name: '扩展能力与生态' }),
    ).toBeVisible();
    expect(screen.getByRole('heading', { name: '教育' })).toBeVisible();
    expect(screen.getByRole('heading', { name: '智能硬件' })).toBeVisible();
    expect(
      screen.queryByRole('heading', { name: '监控与分析' }),
    ).not.toBeInTheDocument();
  });

  it('keeps all Chinese SDK products collapsed by default', () => {
    const { container } = render(<SdksCatalog locale="zh-CN" />);

    expect(
      container.querySelectorAll(
        '[data-sdk-download-product-id] > details[open]',
      ),
    ).toHaveLength(0);
    expect(
      container.querySelectorAll('[data-sdk-download-product-id] > details'),
    ).toHaveLength(16);
  });

  it('does not show product or platform counts in the Chinese catalog', () => {
    render(<SdksCatalog locale="zh-CN" />);

    expect(screen.queryByText(/\d+ 个产品/)).not.toBeInTheDocument();
    expect(screen.queryByText(/\d+ 个平台/)).not.toBeInTheDocument();
  });

  it('uses capability groups for the full catalog', () => {
    const { container } = render(<SdksCatalog locale="zh-CN" />);

    const catalog = container.querySelector('[data-sdk-download-catalog]');
    expect(catalog).toHaveAttribute('data-layout', 'catalog');
    expect(catalog).toHaveClass('flex', 'flex-col');

    const videoCard = screen.getByRole('article', { name: '视频 SDK' });
    expect(videoCard).toHaveAttribute('data-sdk-download-product-id', 'video');
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

  it('lists each product once with a platform select and a default install command', () => {
    render(<SdksCatalog />);

    // Product appears exactly once even though it spans many platforms.
    const videoCard = openProductCard('Video SDK');

    // Default platform (Android, first in canonical order) → Gradle command.
    expect(
      within(videoCard).getByText(
        "implementation 'io.agora.rtc:full-sdk:4.6.3'",
      ),
    ).toBeVisible();
    const platformSelect = within(videoCard).getByRole('combobox', {
      name: 'Video SDK platform',
    });
    expect(platformSelect).toHaveValue('android');
    expect(
      within(platformSelect).getByRole('option', { name: 'Web' }),
    ).toBeInTheDocument();

    // No global platform picker remains.
    expect(
      screen.queryByRole('heading', { name: 'Platforms' }),
    ).not.toBeInTheDocument();
  });

  it('switches the install command when the platform select changes', () => {
    render(<SdksCatalog />);

    const videoCard = openProductCard('Video SDK');

    fireEvent.change(
      within(videoCard).getByRole('combobox', { name: 'Video SDK platform' }),
      { target: { value: 'web' } },
    );

    expect(
      within(videoCard).getByText('npm i agora-rtc-sdk-ng@4.24.6'),
    ).toBeVisible();
    expect(
      within(videoCard).getByRole('combobox', { name: 'Video SDK platform' }),
    ).toHaveValue('web');

    const voiceCard = openProductCard('Voice SDK');

    fireEvent.change(
      within(voiceCard).getByRole('combobox', { name: 'Voice SDK platform' }),
      { target: { value: 'web' } },
    );

    expect(
      within(voiceCard).getByText('npm i agora-rtc-sdk-ng@4.24.6'),
    ).toBeVisible();
  });

  it('keeps long install commands horizontally inspectable with mobile-sized controls', async () => {
    render(<SdksCatalog locale="zh-CN" />);

    const agentsCard = openProductCard('Agora Agents SDK');
    const typescriptPlatform = within(agentsCard).getByRole('combobox', {
      name: 'Agora Agents SDK 平台',
    });

    fireEvent.change(typescriptPlatform, { target: { value: 'typescript' } });

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
    expect(typescriptPlatform).toHaveClass('min-h-11');
    expect(copyButton).toHaveClass('min-h-11', 'min-w-11');
    const packageManager = within(agentsCard).getByRole('link', {
      name: '包管理器 ↗',
    });
    expect(packageManager).toHaveClass('min-h-11');
  });

  it('only exposes the latest SDK version for download', () => {
    render(<SdksCatalog />);

    const voiceCard = openProductCard('Voice SDK');

    expect(
      within(voiceCard).getByText(
        "implementation 'io.agora.rtc:voice-sdk:4.6.3'",
      ),
    ).toBeVisible();
    expect(
      within(voiceCard).queryByRole('combobox', { name: /版本/ }),
    ).not.toBeInTheDocument();
    expect(
      within(voiceCard).queryByText(
        "implementation 'io.agora.rtc:voice-sdk:4.6.2'",
      ),
    ).not.toBeInTheDocument();
  });

  it('keeps current package variants without exposing previous versions', () => {
    render(<SdksCatalog />);

    const videoCard = openProductCard('Video SDK');
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
    expect(
      within(voiceCard).queryByRole('combobox', { name: /version$/i }),
    ).not.toBeInTheDocument();
    expect(within(voiceCard).queryByText(/Previous/)).not.toBeInTheDocument();
  });

  it('falls back to a download button when the platform has no derivable command', () => {
    render(<SdksCatalog />);

    const chatCard = openProductCard('Chat SDK');

    fireEvent.change(
      within(chatCard).getByRole('combobox', { name: 'Chat SDK platform' }),
      { target: { value: 'ios' } },
    );

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

  it('lists the Agora Agents SDK with TypeScript, Python, and Go platforms', () => {
    render(<SdksCatalog />);

    const agentsCard = openProductCard('Agora Agents SDK');

    // Default platform is Python → pip install command.
    expect(
      within(agentsCard).getByRole('combobox', {
        name: 'Agora Agents SDK platform',
      }),
    ).toHaveValue('python');
    expect(
      within(agentsCard).getByText('pip install agora-agents'),
    ).toBeVisible();

    const platformSelect = within(agentsCard).getByRole('combobox', {
      name: 'Agora Agents SDK platform',
    });
    expect(
      within(platformSelect).getByRole('option', { name: 'TypeScript' }),
    ).toBeInTheDocument();
    expect(
      within(platformSelect).getByRole('option', { name: 'Go' }),
    ).toBeInTheDocument();

    // Switching to TypeScript shows the npm command.
    fireEvent.change(platformSelect, { target: { value: 'typescript' } });
    expect(
      within(agentsCard).getByText('npm i agora-agents@2.3.1'),
    ).toBeVisible();

    // Switching to Go shows the go get command.
    fireEvent.change(platformSelect, { target: { value: 'go' } });
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
      within(voiceCard).getByRole('combobox', { name: 'Voice SDK platform' }),
    ).toHaveValue('unity');
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
      within(voiceCard).getByRole('combobox', { name: 'Voice SDK platform' }),
    ).toHaveValue('unity');
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
      within(voiceCard).getByRole('combobox', { name: 'Voice SDK platform' }),
    ).toHaveValue('unity');
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

    const signalingCard = openProductCard('实时消息 SDK');
    expect(
      within(signalingCard).getByRole('combobox', {
        name: '实时消息 SDK 平台',
      }),
    ).toHaveValue('harmonyos');
    const downloadCard = within(signalingCard).getByRole('article', {
      name: 'HarmonyOS 实时消息 SDK',
    });
    expect(
      within(downloadCard).getByRole('link', {
        name: '下载 HarmonyOS 实时消息 SDK',
      }),
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

    const signalingCard = openProductCard('实时消息 SDK');
    expect(
      within(signalingCard).getByRole('combobox', {
        name: '实时消息 SDK 平台',
      }),
    ).toHaveValue('linux');
    const downloadCard = within(signalingCard).getByRole('article', {
      name: 'Linux 实时消息 SDK C++',
    });
    expect(
      within(downloadCard).getByRole('link', {
        name: '下载 Linux 实时消息 SDK C++',
      }),
    ).toHaveAttribute(
      'href',
      'https://download.shengwang.cn/rtm2/release/RTM_C%2B%2B_SDK_for_Linux_v2.3.0.zip',
    );
    expect(
      within(downloadCard).getByText('9a8ee5f8deda76e23eea80f5b3c5a453'),
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
    const meetingCard = openProductCard('智能云会议引擎 SDK');
    expect(
      within(meetingCard).getByText('npm i fcr-ui-scene@3.1.0'),
    ).toBeVisible();
  });

  it('does not expose a superseded zh-CN SDK marked as latest', () => {
    render(
      <SdksCatalog locale="zh-CN" platform="flutter" product="signaling" />,
    );

    const signalingCard = openProductCard('实时消息 SDK');

    expect(
      within(signalingCard).getByRole('article', {
        name: 'Flutter 实时消息 SDK',
      }),
    ).toBeVisible();
    expect(
      within(signalingCard).queryByRole('combobox', { name: /版本/ }),
    ).not.toBeInTheDocument();
    expect(
      within(signalingCard).queryByText('flutter pub add agora_rtm:2.2.5'),
    ).not.toBeInTheDocument();
  });

  it('uses the current Flutter Signaling package in the English catalog', () => {
    render(<SdksCatalog platform="flutter" product="signaling" />);

    const signalingCard = openProductCard('Signaling SDK');

    expect(
      within(signalingCard).getByText('flutter pub add agora_rtm:2.2.6'),
    ).toBeVisible();
    expect(
      within(signalingCard).queryByRole('combobox', { name: /version$/i }),
    ).not.toBeInTheDocument();
    expect(
      within(signalingCard).queryByText('flutter pub add agora_rtm:2.2.5'),
    ).not.toBeInTheDocument();
  });

  it('uses the current Web Voice package in the zh-CN catalog', () => {
    render(<SdksCatalog locale="zh-CN" platform="web" product="voice" />);

    const voiceCard = openProductCard('语音 SDK');

    const downloadCard = within(voiceCard).getByRole('article', {
      name: 'Web 音频 SDK',
    });
    expect(within(downloadCard).getByText('v4.24.6')).toBeVisible();
    expect(
      within(downloadCard).getByRole('link', { name: '下载 Web 音频 SDK' }),
    ).toHaveAttribute(
      'href',
      'https://download.agora.io/sdk/release/Agora_Web_SDK_v4_24_6_FULL.zip',
    );
    expect(
      within(downloadCard).getByRole('link', { name: '包管理器' }),
    ).toHaveAttribute(
      'href',
      'https://www.npmjs.com/package/agora-rtc-sdk-ng/v/4.24.6',
    );
    expect(
      within(voiceCard).queryByRole('combobox', { name: /版本/ }),
    ).not.toBeInTheDocument();
    expect(
      within(downloadCard).queryByText('npm i agora-rtc-sdk-ng@4.24.3'),
    ).not.toBeInTheDocument();
  });

  it('localizes zh-CN package variant and language labels', () => {
    render(<SdksCatalog locale="zh-CN" />);

    const videoCard = openProductCard('视频 SDK');
    expect(
      within(videoCard).getByRole('article', { name: 'Android Full' }),
    ).toBeVisible();
    expect(
      within(videoCard).getByRole('article', { name: 'Android Lite' }),
    ).toBeVisible();

    const serverCard = openProductCard('RTC 服务端 SDK');
    const serverPlatform = within(serverCard).getByRole('combobox', {
      name: 'RTC 服务端 SDK 平台',
    });
    fireEvent.change(serverPlatform, { target: { value: 'go' } });
    expect(
      within(serverCard).getByRole('article', {
        name: 'Linux RTC 服务端 SDK for Go',
      }),
    ).toBeVisible();
    fireEvent.change(serverPlatform, { target: { value: 'python' } });
    expect(
      within(serverCard).getByRole('article', {
        name: 'Linux RTC 服务端 SDK for Python',
      }),
    ).toBeVisible();
  });

  it('orders zh-CN SDK capability groups like the API reference', () => {
    render(<SdksCatalog locale="zh-CN" />);

    const headings = screen
      .getAllByRole('heading', { level: 2 })
      .map((node) => node.textContent?.trim())
      .filter(Boolean);

    expect(headings).toEqual([
      '对话式 AI 引擎',
      '实时互动基础能力',
      '会议协作',
      '扩展能力与生态',
      '教育',
      '智能硬件',
    ]);
  });

  it('uses canonical Chinese product names and descriptions throughout the catalog', () => {
    render(<SdksCatalog locale="zh-CN" />);

    const expectedProducts = [
      ['Agora Agents SDK', '用于在服务端构建和运行语音智能体的 SDK'],
      [
        '客户端组件 SDK',
        '用于在 Android、iOS 和 Web 客户端集成对话式 AI 引擎能力的组件',
      ],
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
      /Signaling SDK|Chat SDK|Mediaplayer Kit SDK|Interactive Whiteboard Fastboard|灵动会议 SDK/,
    );
  });

  it('uses the confirmed zh-CN Android download-card versions', () => {
    window.history.replaceState(
      null,
      '',
      '/zh-CN/reference/sdks?product=video&platform=android',
    );

    render(<SdksCatalog locale="zh-CN" />);

    const videoCard = openProductCard('视频 SDK');
    expect(
      within(videoCard).getByRole('article', { name: 'Android Full' }),
    ).toBeVisible();
    expect(
      within(videoCard).getByRole('article', { name: 'Android Lite' }),
    ).toBeVisible();
    expect(
      within(videoCard).getByRole('link', { name: '查看下载页 ↗' }),
    ).toHaveAttribute(
      'href',
      '/zh-CN/realtime-media/rtc/reference/downloads/android',
    );
  });

  it('copies the dedicated Electron download-page cards into the overview', () => {
    window.history.replaceState(
      null,
      '',
      '/zh-CN/reference/sdks?product=video&platform=electron',
    );

    render(<SdksCatalog locale="zh-CN" />);

    const videoCard = openProductCard('视频 SDK');
    const unionTechCard = within(videoCard).getByRole('article', {
      name: 'Electron for 统信 OS',
    });

    expect(within(videoCard).getAllByRole('article')).toHaveLength(2);
    expect(
      within(unionTechCard).getByText('v4.5.40-rc.2（统信 OS 专版）'),
    ).toBeVisible();
    expect(
      within(unionTechCard).getByRole('link', {
        name: '获取 Electron for 统信 OS',
      }),
    ).toHaveAttribute(
      'href',
      'https://www.npmjs.com/package/agora-electron-sdk/v/4.5.40-rc.2',
    );
  });

  it('uses only the platforms exposed by the interactive whiteboard download page', () => {
    window.history.replaceState(
      null,
      '',
      '/zh-CN/reference/sdks?product=whiteboard',
    );

    render(<SdksCatalog locale="zh-CN" />);

    const whiteboardCard = openProductCard('互动白板 SDK');
    const platform = within(whiteboardCard).getByRole('combobox', {
      name: '互动白板 SDK 平台',
    });

    expect(
      within(platform).getByRole('option', { name: 'Android' }),
    ).toBeInTheDocument();
    expect(
      within(platform).getByRole('option', { name: 'iOS' }),
    ).toBeInTheDocument();
    expect(
      within(platform).getByRole('option', { name: 'Web' }),
    ).toBeInTheDocument();
    expect(
      within(platform).queryByRole('option', { name: 'macOS' }),
    ).not.toBeInTheDocument();
  });

  it('copies the four RTC server download-page variants into the platform selector', () => {
    window.history.replaceState(
      null,
      '',
      '/zh-CN/reference/sdks?product=server-gateway&platform=linux',
    );

    render(<SdksCatalog locale="zh-CN" />);

    const serverCard = openProductCard('RTC 服务端 SDK');
    const platform = within(serverCard).getByRole('combobox', {
      name: 'RTC 服务端 SDK 平台',
    });

    expect(platform).toHaveValue('linux-java');
    expect(
      within(platform)
        .getAllByRole('option')
        .map((option) => option.textContent),
    ).toEqual(['Linux Java', 'Linux C++', 'Python', 'Go']);
    expect(
      within(serverCard).getByRole('article', {
        name: 'Linux RTC 服务端 SDK Java x86-64',
      }),
    ).toBeVisible();

    fireEvent.change(platform, { target: { value: 'linux-cpp' } });
    expect(within(serverCard).getAllByRole('article')).toHaveLength(2);
    expect(
      within(serverCard).getByRole('link', { name: '查看下载页 ↗' }),
    ).toHaveAttribute(
      'href',
      '/zh-CN/realtime-media/rtc-server-sdk/reference/downloads/linux-cpp',
    );
  });

  it('copies the C++ and Java variants from the local recording download page', () => {
    window.history.replaceState(
      null,
      '',
      '/zh-CN/reference/sdks?product=on-premise-recording&platform=linux',
    );

    render(<SdksCatalog locale="zh-CN" />);

    const recordingCard = openProductCard('本地服务端录制 SDK');
    const platform = within(recordingCard).getByRole('combobox', {
      name: '本地服务端录制 SDK 平台',
    });

    expect(platform).toHaveValue('linux-cpp');
    expect(
      within(platform)
        .getAllByRole('option')
        .map((option) => option.textContent),
    ).toEqual(['Linux C++', 'Linux Java']);
    expect(within(recordingCard).getAllByRole('article')).toHaveLength(2);
    expect(
      within(recordingCard).getByRole('link', { name: '查看下载页 ↗' }),
    ).toHaveAttribute(
      'href',
      '/zh-CN/realtime-media/local-server-recording/reference/downloads/linux-cpp',
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
      within(videoCard).getByRole('combobox', { name: 'Video SDK platform' }),
    ).toHaveValue('android');
  });
});
