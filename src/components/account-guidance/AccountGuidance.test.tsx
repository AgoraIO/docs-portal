import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import type { Window as HappyWindow } from 'happy-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SdksCatalog } from '@/components/docs-overview/SdksCatalog';

const capture = vi.fn();
const navigation = (window as unknown as HappyWindow).happyDOM.settings
  .navigation;
const originalChildNavigation = navigation.disableChildPageNavigation;
const syncAccount = vi.fn<(...args: unknown[]) => Promise<void>>(
  async () => {},
);
vi.mock('@/lib/analytics/posthog', () => ({
  captureAccountFlow: (...args: unknown[]) => capture(...args),
  getDocsAnonymousId: async () => 'anonymous-browser-id',
  synchronizeDocsAccount: (...args: unknown[]) => syncAccount(...args),
}));

describe('Chinese SDK account guidance', () => {
  beforeEach(() => {
    // Keep native click/default-action semantics without opening network tabs.
    navigation.disableChildPageNavigation = true;
    capture.mockClear();
    syncAccount.mockClear();
    window.sessionStorage.clear();
    window.history.replaceState(null, '', '/zh-CN/reference/sdks');
    vi.stubGlobal(
      'fetch',
      vi.fn(() => new Promise(() => {})),
    );
  });
  afterEach(() => {
    navigation.disableChildPageNavigation = originalChildNavigation;
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it.each(['/zh-CN/reference/sdks', '/reference/sdks', '/reference/sdks/'])(
    'preserves the native RTM download and separate login tab at %s',
    async (path) => {
      window.history.replaceState(null, '', path);
      render(
        <SdksCatalog locale="zh-CN" product="signaling" platform="android" />,
      );
      const download = screen.getByRole('link', {
        name: /^下载 .*实时消息 SDK/,
      });
      expect(download).toHaveAttribute(
        'href',
        'https://download.shengwang.cn/rtm2/release/RTM_JAVA_SDK_for_Android_v2.3.0.zip',
      );
      expect(download).toHaveAttribute('target', '_blank');
      expect(fireEvent.click(download)).toBe(true);

      const dialog = await screen.findByRole('dialog', {
        name: '登录声网账号，继续使用相关服务',
      });
      expect(dialog).toBeVisible();
      const login = screen.getByRole('link', { name: '登录并前往控制台' });
      await waitFor(() =>
        expect(
          new URL(
            login.getAttribute('href') ?? '',
            window.location.origin,
          ).searchParams.get('anonymous_id'),
        ).toBe('anonymous-browser-id'),
      );
      const params = new URL(
        login.getAttribute('href') ?? '',
        window.location.origin,
      ).searchParams;
      expect(params.get('target')).toBe('rtm');
      expect(params.get('resource_id')).toBe('signaling');
      expect(params.get('platform')).toBe('android');
      expect(params.get('version')).toBe('2.3.0-rtm-sdk-android');
      expect(login).toHaveAttribute('target', '_blank');
      fireEvent.click(login);
      await waitFor(() =>
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
      );
      expect(capture.mock.calls.map(([event]) => event)).toEqual([
        'docs_resource_action_started',
        'docs_account_guidance_shown',
        'docs_account_login_clicked',
      ]);
      const flowIds = capture.mock.calls.map(([, flow]) => flow.flowId);
      expect(new Set(flowIds).size).toBe(1);
    },
  );

  it('counts exposure only when the original tab is visible, freezes the first resource, and skips once', async () => {
    let visible = false;
    vi.spyOn(document, 'visibilityState', 'get').mockImplementation(() =>
      visible ? 'visible' : 'hidden',
    );
    render(
      <SdksCatalog locale="zh-CN" product="signaling" platform="android" />,
    );
    fireEvent.click(screen.getByRole('link', { name: /^下载 .*实时消息 SDK/ }));
    await screen.findByRole('dialog');
    expect(capture.mock.calls.map(([event]) => event)).toEqual([
      'docs_resource_action_started',
    ]);
    const platform = screen.getByRole('combobox', {
      name: '实时消息 SDK 语言 / 平台',
      hidden: true,
    });
    fireEvent.change(platform, { target: { value: 'ios' } });
    fireEvent.click(
      screen.getByRole('link', { name: /^下载 .*实时消息 SDK/, hidden: true }),
    );
    visible = true;
    fireEvent(document, new Event('visibilitychange'));
    await waitFor(() =>
      expect(capture.mock.calls.map(([event]) => event)).toEqual([
        'docs_resource_action_started',
        'docs_resource_action_started',
        'docs_account_guidance_shown',
      ]),
    );
    const params = new URL(
      screen
        .getByRole('link', { name: '登录并前往控制台' })
        .getAttribute('href') ?? '',
      window.location.origin,
    ).searchParams;
    expect(params.get('platform')).toBe('android');
    expect(screen.getByText('Android · 版本 2.3.0（最新）')).toBeVisible();
    visible = false;
    fireEvent(document, new Event('visibilitychange'));
    visible = true;
    fireEvent(document, new Event('visibilitychange'));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeVisible());
    fireEvent.click(screen.getByRole('button', { name: '稍后再说' }));
    fireEvent.click(screen.getByRole('link', { name: /^下载 .*实时消息 SDK/ }));
    await waitFor(() => expect(capture).toHaveBeenCalledTimes(5));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(
      capture.mock.calls.filter(
        ([event]) => event === 'docs_account_guidance_dismissed',
      ),
    ).toHaveLength(1);
    vi.restoreAllMocks();
  });

  it('refreshes account status when returning from login and suppresses further guidance without a fake skip', async () => {
    const user = { accountUid: 'account-123', companyId: '456' };
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ status: 'unauthenticated' }), {
          status: 401,
        }),
      )
      .mockImplementation(
        async () =>
          new Response(
            JSON.stringify({
              status: 'authenticated',
              user,
              expiresAt: new Date(Date.now() + 3600000).toISOString(),
            }),
          ),
      );
    vi.stubGlobal('fetch', fetcher);
    render(
      <SdksCatalog locale="zh-CN" product="signaling" platform="android" />,
    );
    await waitFor(() => expect(syncAccount).toHaveBeenCalledWith(null));
    fireEvent.click(screen.getByRole('link', { name: /^下载 .*实时消息 SDK/ }));
    await screen.findByRole('dialog');
    fireEvent(window, new Event('focus'));
    await waitFor(() => expect(syncAccount).toHaveBeenCalledWith(user));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('link', { name: /^下载 .*实时消息 SDK/ }));
    expect(
      capture.mock.calls.filter(
        ([event]) => event === 'docs_account_guidance_dismissed',
      ),
    ).toHaveLength(0);
    expect(capture).toHaveBeenLastCalledWith(
      'docs_resource_action_started',
      expect.anything(),
      user,
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('does not add account guidance to English SDK downloads', async () => {
    window.history.replaceState(null, '', '/en/api-reference/sdks');
    render(<SdksCatalog product="signaling" platform="android" />);
    const download = screen.getByRole('link', { name: 'Direct download' });
    expect(fireEvent.click(download)).toBe(true);
    expect(download).toHaveAttribute('target', '_blank');
    expect(fetch).not.toHaveBeenCalled();
    expect(capture).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('guides Chinese RTC direct downloads with the home fallback target', () => {
    render(<SdksCatalog locale="zh-CN" product="video" platform="android" />);
    const download = screen.getByRole('link', { name: '下载 Android Full' });
    expect(fireEvent.click(download)).toBe(true);
    expect(download).toHaveAttribute('target', '_blank');
    expect(capture).toHaveBeenCalledWith(
      'docs_resource_action_started',
      expect.objectContaining({
        resourceId: 'video',
        target: 'home',
      }),
      null,
    );
  });

  it('does not treat package-manager-only RTM links as direct downloads', () => {
    render(
      <SdksCatalog locale="zh-CN" product="signaling" platform="flutter" />,
    );
    const packageLink = screen.getByRole('link', {
      name: '获取 Flutter 实时消息 SDK',
    });
    expect(packageLink).toHaveAttribute(
      'href',
      'https://pub.dev/packages/agora_rtm/versions/2.2.6',
    );
    expect(fireEvent.click(packageLink)).toBe(true);
    expect(capture).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('records an immediate login click before the first animation frame without losing its exposure', async () => {
    vi.spyOn(window, 'requestAnimationFrame').mockReturnValue(1);
    render(
      <SdksCatalog locale="zh-CN" product="signaling" platform="android" />,
    );
    fireEvent.click(screen.getByRole('link', { name: /^下载 .*实时消息 SDK/ }));
    const login = await screen.findByRole('link', {
      name: '登录并前往控制台',
    });
    fireEvent.click(login);
    expect(capture.mock.calls.map(([event]) => event)).toEqual([
      'docs_resource_action_started',
      'docs_account_guidance_shown',
      'docs_account_login_clicked',
    ]);
  });

  it('only lets the user dismiss through an explicit action button', async () => {
    const { baseElement } = render(
      <SdksCatalog locale="zh-CN" product="signaling" platform="android" />,
    );
    fireEvent.click(screen.getByRole('link', { name: /^下载 .*实时消息 SDK/ }));
    const dialog = await screen.findByRole('dialog');
    await waitFor(() => expect(capture).toHaveBeenCalledTimes(2));
    expect(within(dialog).getAllByRole('button')).toHaveLength(1);
    const overlay = baseElement.querySelector('[data-slot="dialog-overlay"]');
    if (!overlay) throw new Error('Expected dialog overlay');
    fireEvent.pointerDown(overlay);
    fireEvent.click(overlay);
    fireEvent.keyDown(dialog, { key: 'Escape' });
    expect(screen.getByRole('dialog')).toBeVisible();
    expect(
      capture.mock.calls.filter(
        ([event]) => event === 'docs_account_guidance_dismissed',
      ),
    ).toHaveLength(0);
    fireEvent.click(screen.getByRole('button', { name: '稍后再说' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(
      capture.mock.calls.filter(
        ([event]) => event === 'docs_account_guidance_dismissed',
      ),
    ).toHaveLength(1);
  });

  it('keeps embedded product downloads outside the first catalog slice unchanged', () => {
    window.history.replaceState(
      null,
      '',
      '/zh-CN/realtime-media/rtm/get-started/downloads',
    );
    render(
      <SdksCatalog locale="zh-CN" product="signaling" platform="android" />,
    );
    expect(
      fireEvent.click(
        screen.getByRole('link', { name: /^下载 .*实时消息 SDK/ }),
      ),
    ).toBe(true);
    expect(capture).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
