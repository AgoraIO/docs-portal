import { existsSync } from 'node:fs';
import path from 'node:path';
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { zhCNApiReferenceCards } from '@/lib/api-reference-cards-data.zh-cn';
import { ApiReferenceCards } from './ApiReferenceCards';

describe('ApiReferenceCards', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/zh-CN/api-reference/api');
  });

  it('renders compact client API cards with product, platform, and API type', () => {
    render(<ApiReferenceCards locale="zh-CN" type="client" />);

    const rtcAndroidCard = screen
      .getByRole('link', { name: /实时互动 RTC Android 客户端 SDK/i })
      .closest('a');

    expect(screen.getByLabelText('产品')).toBeVisible();
    expect(screen.getByLabelText('平台/语言')).toBeVisible();
    expect(screen.getByRole('heading', { name: '实时互动 RTC' })).toBeVisible();
    expect(rtcAndroidCard).toHaveAttribute(
      'href',
      '/zh-CN/api-reference/rtc/android/rtc-api-overview',
    );
    expect(
      screen.getByText(`${zhCNApiReferenceCards.client.length} 个入口`),
    ).toBeVisible();
  });

  it('filters client cards by product and platform', () => {
    render(<ApiReferenceCards locale="zh-CN" type="client" />);

    fireEvent.change(screen.getByLabelText('产品'), {
      target: { value: 'rtm' },
    });
    fireEvent.change(screen.getByLabelText('平台/语言'), {
      target: { value: 'web' },
    });

    expect(
      screen.getByRole('link', {
        name: /实时消息 RTM JavaScript 客户端 SDK/i,
      }),
    ).toHaveAttribute('href', '/zh-CN/api-reference/rtm/web/configuration');
    expect(
      screen.queryByRole('link', { name: /实时互动 RTC Web 客户端 SDK/i }),
    ).not.toBeInTheDocument();
    expect(screen.getByText('1 个入口')).toBeVisible();
  });

  it('renders server API cards for server SDK and RESTful API entries', () => {
    render(<ApiReferenceCards locale="zh-CN" type="server" />);

    expect(
      screen.getByRole('link', { name: /RTC 服务端 SDK Python 服务端 SDK/i }),
    ).toHaveAttribute(
      'href',
      '/zh-CN/api-reference/rtc-server-sdk/python-api/overview.python',
    );
    expect(
      screen.getByRole('link', {
        name: /实时互动 RTC RESTful API/i,
      }),
    ).toHaveAttribute('href', '/zh-CN/api-reference/api-ref/rtc');
  });

  it('renders merged API reference groups and filters by API type', async () => {
    render(<ApiReferenceCards locale="zh-CN" type="all" />);

    expect(screen.getByRole('group', { name: 'API 类型' })).toBeVisible();
    expect(screen.queryByLabelText('API 类型')).not.toBeInstanceOf(
      HTMLSelectElement,
    );
    expect(
      screen.getByRole('button', { name: '全部', pressed: true }),
    ).toBeVisible();
    expect(
      screen.getByText(`${zhCNApiReferenceCards.all.length} 个入口`),
    ).toBeVisible();
    expect(screen.getByRole('heading', { name: '对话式 AI' })).toBeVisible();
    expect(
      screen.getByRole('link', { name: /对话式 AI Android 客户端 SDK/i }),
    ).toHaveAttribute(
      'href',
      '/zh-CN/api-reference/conversational-ai/android/overview',
    );
    expect(
      screen.getByRole('link', {
        name: /对话式 AI Python Agent SDK 服务端 SDK/i,
      }),
    ).toHaveAttribute(
      'href',
      '/zh-CN/api-reference/conversational-ai/agent-python',
    );

    fireEvent.click(screen.getByRole('button', { name: '服务端 SDK' }));

    const serverSdkCount = zhCNApiReferenceCards.all.filter(
      (entry) => entry.apiType === 'server-sdk',
    ).length;

    expect(screen.getByText(`${serverSdkCount} 个入口`)).toBeVisible();
    expect(
      screen.getByRole('button', { name: '服务端 SDK', pressed: true }),
    ).toBeVisible();
    expect(
      screen.queryByRole('link', { name: /对话式 AI Android 客户端 SDK/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('link', {
        name: /对话式 AI Python Agent SDK 服务端 SDK/i,
      }),
    ).toHaveAttribute(
      'href',
      '/zh-CN/api-reference/conversational-ai/agent-python',
    );
    expect(
      screen.queryByRole('link', { name: /对话式 AI RESTful API/i }),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'RESTful API' }));

    expect(
      screen.getByRole('link', { name: /对话式 AI RESTful API/i }),
    ).toHaveAttribute('href', '/zh-CN/api-reference/api-ref/conversational-ai');
    await waitFor(() => {
      expect(new URLSearchParams(window.location.search).get('apiType')).toBe(
        'restful',
      );
    });
  });

  it('groups Conversational AI into Toolkit, Agora Agents, and RESTful API', () => {
    render(<ApiReferenceCards locale="zh-CN" type="all" />);

    fireEvent.change(screen.getByLabelText('产品'), {
      target: { value: 'conversational-ai' },
    });

    const aiCard = screen
      .getByRole('heading', { name: '对话式 AI' })
      .closest('section');

    expect(
      within(aiCard as HTMLElement).getByRole('heading', {
        name: '对话式 AI Toolkit',
      }),
    ).toBeVisible();
    expect(within(aiCard as HTMLElement).getByText('客户端 SDK')).toBeVisible();
    expect(
      within(aiCard as HTMLElement).getByRole('heading', {
        name: 'Agora Agents',
      }),
    ).toBeVisible();
    expect(within(aiCard as HTMLElement).getByText('服务端 SDK')).toBeVisible();
    expect(screen.getByRole('heading', { name: 'RESTful API' })).toBeVisible();
    expect(
      within(
        screen.getByRole('link', { name: /对话式 AI RESTful API/i }),
      ).getByText('RESTful API'),
    ).toBeVisible();
  });

  it('loads RTC client filters from the URL and keeps changes shareable', async () => {
    window.history.replaceState(
      {},
      '',
      '/zh-CN/api-reference/api?product=rtc&apiType=client',
    );

    render(<ApiReferenceCards locale="zh-CN" type="all" />);

    const rtcClientCount = zhCNApiReferenceCards.client.filter(
      (entry) => entry.productId === 'rtc',
    ).length;

    await waitFor(() => {
      expect(screen.getByLabelText('产品')).toHaveValue('rtc');
      expect(
        screen.getByRole('button', { name: '客户端 SDK', pressed: true }),
      ).toBeVisible();
    });

    expect(screen.getByText(`${rtcClientCount} 个入口`)).toBeVisible();
    expect(screen.getByRole('heading', { name: '实时互动 RTC' })).toBeVisible();
    expect(
      screen.queryByRole('heading', { name: '实时消息 RTM' }),
    ).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('平台/语言'), {
      target: { value: 'web' },
    });

    await waitFor(() => {
      const params = new URLSearchParams(window.location.search);
      expect(params.get('product')).toBe('rtc');
      expect(params.get('apiType')).toBe('client');
      expect(params.get('platform')).toBe('web');
    });
  });

  it('renders every IM API as an external link immediately after RTM', () => {
    render(<ApiReferenceCards locale="zh-CN" type="all" />);

    const imEntries = zhCNApiReferenceCards.all.filter(
      (entry) => entry.productId === 'im',
    );
    const productHeadings = screen
      .getAllByRole('heading', { level: 3 })
      .map((heading) => heading.textContent);

    expect(imEntries.map((entry) => [entry.platform, entry.href])).toEqual([
      [
        'Android',
        'https://im.shengwang.cn/docs/sdk/android/api_reference_overview.html',
      ],
      [
        'iOS',
        'https://im.shengwang.cn/docs/sdk/ios/api_reference_overview.html',
      ],
      [
        'Web',
        'https://im.shengwang.cn/docs/sdk/web/api_reference_overview.html',
      ],
      [
        'HarmonyOS',
        'https://im.shengwang.cn/docs/sdk/harmonyos/api_reference_overview.html',
      ],
      [
        'C++ (全平台)',
        'https://im.shengwang.cn/docs/sdk/windows/api_reference_overview.html',
      ],
      [
        '小程序',
        'https://im.shengwang.cn/docs/sdk/applet/api_reference_overview.html',
      ],
      [
        'Unity',
        'https://im.shengwang.cn/docs/sdk/unity/api_reference_overview.html',
      ],
      [
        'Flutter',
        'https://im.shengwang.cn/docs/sdk/flutter/api_reference_overview.html',
      ],
      [
        'React Native',
        'https://im.shengwang.cn/docs/sdk/react-native/api_reference_overview.html',
      ],
      ['RESTful', 'https://im.shengwang.cn/docs/sdk/server-side/overview.html'],
    ]);
    expect(imEntries.every((entry) => entry.href.startsWith('https://'))).toBe(
      true,
    );
    expect(productHeadings.indexOf('即时通讯 IM')).toBe(
      productHeadings.indexOf('实时消息 RTM') + 1,
    );
    expect(screen.getByRole('heading', { name: '即时通讯 IM' })).toBeVisible();
    expect(
      screen.getByText(
        '一整套高可靠、低时延、高并发、安全、全球化的即时聊天云服务。',
      ),
    ).toBeVisible();
  });

  it('shows an empty state and can clear filters', () => {
    render(<ApiReferenceCards locale="zh-CN" type="server" />);

    fireEvent.change(screen.getByLabelText('产品'), {
      target: { value: 'rtc-server-sdk' },
    });
    fireEvent.change(screen.getByLabelText('平台/语言'), {
      target: { value: 'restful-api' },
    });

    expect(screen.getByText('没有匹配的 API 文档')).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: '清除筛选' }));

    expect(
      screen.getByText(`${zhCNApiReferenceCards.server.length} 个入口`),
    ).toBeVisible();
    expect(screen.queryByText('没有匹配的 API 文档')).not.toBeInTheDocument();
  });

  it('keeps every internal API reference card link pointed at an existing route file', () => {
    const missing = zhCNApiReferenceCards.all
      .filter((entry) => entry.href.startsWith('/'))
      .filter((entry) => !routeExists(entry.href))
      .map((entry) => `${entry.product} ${entry.platform}: ${entry.href}`);

    expect(missing).toEqual([]);
  });

  it('uses platform icons uploaded from the legacy API Center assets', () => {
    render(<ApiReferenceCards locale="zh-CN" type="all" />);

    expect(
      within(
        screen.getByRole('link', { name: /实时互动 RTC Android 客户端 SDK/i }),
      ).getByRole('presentation', { hidden: true }),
    ).toHaveAttribute(
      'src',
      'https://assets-docs.agora.io/images/api-reference/platforms/android.svg',
    );
    expect(
      within(
        screen.getByRole('link', {
          name: /实时互动 RTC RESTful API/i,
        }),
      ).getByRole('presentation', { hidden: true }),
    ).toHaveAttribute(
      'src',
      'https://assets-docs.agora.io/images/api-reference/platforms/restful.svg',
    );
    expect(
      within(
        screen.getByRole('link', {
          name: /媒体流加速 RTSA C 客户端 SDK/i,
        }),
      ).getByRole('presentation', { hidden: true }),
    ).toHaveAttribute(
      'src',
      'https://assets-docs.agora.io/images/api-reference/platforms/c.svg',
    );
    expect(
      within(
        screen.getByRole('link', {
          name: /在线美术教学 Windows 客户端 SDK/i,
        }),
      ).getByRole('presentation', { hidden: true }),
    ).toHaveAttribute(
      'src',
      'https://doc.shengwang.cn/img/platforms/windows.svg',
    );
  });

  it('does not expose Swift as an RTM API entry', () => {
    render(<ApiReferenceCards locale="zh-CN" type="all" />);

    fireEvent.change(screen.getByLabelText('产品'), {
      target: { value: 'rtm' },
    });

    expect(
      screen.queryByRole('link', { name: /实时消息 RTM Swift/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('option', { name: 'Swift' }),
    ).not.toBeInTheDocument();
  });

  it('keeps product groups and API chips scan-friendly', () => {
    render(<ApiReferenceCards locale="zh-CN" type="server" />);

    const cloudRecordingCard = screen.getByRole('link', {
      name: /云端录制 RESTful API/i,
    });

    expect(screen.getByRole('heading', { name: '云端录制' })).toBeVisible();
    expect(within(cloudRecordingCard).getByText('RESTful API')).toBeVisible();
  });

  it('renders stacked solution groups inside one product card', () => {
    render(<ApiReferenceCards locale="zh-CN" type="all" />);

    fireEvent.change(screen.getByLabelText('产品'), {
      target: { value: 'online-ktv' },
    });

    expect(screen.getByText('8 个入口')).toBeVisible();
    expect(screen.getByRole('heading', { name: '在线 K 歌房' })).toBeVisible();
    expect(
      screen.getByRole('heading', { name: '场景化 API 方案' }),
    ).toBeVisible();
    expect(screen.getByRole('heading', { name: 'PaaS 方案' })).toBeVisible();
    expect(
      screen.getByRole('link', {
        name: /在线 K 歌房 场景化 API 方案 Android 客户端 SDK/i,
      }),
    ).toHaveAttribute(
      'href',
      '/zh-CN/api-reference/online-ktv/android/ktv-scenario/api/ktv-api',
    );
    expect(
      screen.getByRole('link', {
        name: /在线 K 歌房 PaaS 方案 Android 客户端 SDK/i,
      }),
    ).toHaveAttribute(
      'href',
      '/zh-CN/api-reference/online-ktv/android/online-ktv-sdk/api/rtc-api',
    );
    expect(
      screen.getByRole('link', {
        name: /在线 K 歌房 PaaS 方案 RESTful API/i,
      }),
    ).toHaveAttribute(
      'href',
      '/zh-CN/api-reference/online-ktv/android/online-ktv-sdk/api/music-content-center',
    );
  });
});

function routeExists(href: string) {
  const cleanHref = href.split(/[?#]/, 1)[0];
  const segments = cleanHref.split('/').filter(Boolean);

  if (segments.length < 2) {
    return false;
  }

  const contentPath = path.join(process.cwd(), 'content', 'docs', ...segments);
  const candidates = [
    `${contentPath}.mdx`,
    `${contentPath}.md`,
    path.join(contentPath, 'index.mdx'),
    path.join(contentPath, 'index.md'),
  ];
  const basename = path.basename(contentPath);
  const dirname = path.dirname(contentPath);

  candidates.push(
    path.join(dirname, '(current)', `${basename}.mdx`),
    path.join(dirname, '(current)', `${basename}.md`),
    path.join(contentPath, '(current)', 'index.mdx'),
    path.join(contentPath, '(current)', 'index.md'),
  );

  for (let index = 3; index < segments.length; index += 1) {
    const versionedPath = path.join(
      process.cwd(),
      'content',
      'docs',
      ...segments.slice(0, index),
      '(current)',
      ...segments.slice(index),
    );
    candidates.push(
      `${versionedPath}.mdx`,
      `${versionedPath}.md`,
      path.join(versionedPath, 'index.mdx'),
      path.join(versionedPath, 'index.md'),
    );
  }

  return candidates.some((candidate) => existsSync(candidate));
}
