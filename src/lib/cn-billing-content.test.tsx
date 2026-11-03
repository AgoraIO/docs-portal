import { readFileSync } from 'node:fs';
import { cleanup, fireEvent, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { renderDocsMdx } from '@/test/render-docs-mdx';

async function renderPage(file: string) {
  const source = readFileSync(`content/docs/zh-CN/${file}.mdx`, 'utf8');
  await renderDocsMdx(source.replace(/^---\n[\s\S]*?\n---\n/, ''));
}

describe('published Chinese billing content', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  afterEach(cleanup);

  // Values and conditions checked against the public site on 2026-10-27.
  it.each(['auikaraoke', 'ktv-scenario', 'online-ktv-sdk'])(
    'restores current copyright packages and their conditions for %s',
    async (product) => {
      await renderPage(`solutions/online-ktv/${product}/reference/billing`);
      expect(
        screen.getByRole('heading', { name: /^版权曲库费用计算/ }),
      ).toBeVisible();
      expect(
        screen.getByRole('heading', { name: /^超出套餐费用/ }),
      ).toBeVisible();
      const paid = screen.getByRole('row', { name: /音集协曲库基础版/ });
      expect(within(paid).getAllByRole('listitem')).toHaveLength(3);
      expect(paid).toHaveTextContent('14000 次音集协曲库有效调用次数');
      expect(paid).toHaveTextContent('2464 元/月');
      expect(paid).toHaveTextContent('原价：2800 元/月');
      expect(screen.getByText(/购买套餐包前，请先联系销售/)).toBeVisible();
      expect(document.getElementById('内容订阅费用计算')).not.toBeNull();
      expect(screen.queryByText('VR 场景')).toBeNull();
    },
    30000,
  );

  it('preserves moderation model scopes and published billing examples', async () => {
    await renderPage('realtime-media/content-moderation/reference/billing');
    expect(screen.getByRole('row', { name: /^所有语种/ })).toHaveTextContent(
      '50.56',
    );
    expect(screen.getByRole('row', { name: /^所有语种/ })).toHaveTextContent(
      '11.38',
    );
    expect(
      screen.getByRole('heading', { name: /^视频审核「拓展能力」模型/ }),
    ).toBeVisible();
    expect(
      screen.getByText(/本月账单 = 800 \+ \(5444 - 4444\)/),
    ).toHaveTextContent('1030 元');
    expect(screen.getByText(/本月账单 = 1688/)).toHaveTextContent('6794 元');
    expect(screen.getByText(/本月账单 = 800 \+ \[/)).toHaveTextContent(
      '1520 元',
    );
    expect(screen.getAllByRole('link', { name: '计费项' })).toHaveLength(3);
    for (const link of screen.getAllByRole('link', { name: '计费项' })) {
      expect(decodeURIComponent(link.getAttribute('href') ?? '')).toBe(
        '#计费项',
      );
    }
  }, 30000);

  it('keeps RTM project columns, package quotas and upgrade timing', async () => {
    await renderPage('realtime-media/rtm/reference/account-and-billing');
    const row = screen.getByRole('row', { name: /PWM-QA/ });
    const cells = within(row).getAllByRole('cell');
    expect(cells).toHaveLength(4);
    expect(cells[1]).toHaveTextContent('PWM-QA');
    expect(cells[2]).toHaveTextContent('fba8cd1f5231496caef1db648f07****');
    expect(screen.getByRole('row', { name: /^每月消息数/ })).toHaveTextContent(
      '150,000,000',
    );
    expect(screen.getByText(/套餐之间可以自由升级或降级/)).toHaveTextContent(
      '升级套餐立即生效，降级套餐下月生效',
    );
  }, 30000);

  it('preserves the public RTM support commitment and plan wording', async () => {
    await renderPage('realtime-media/rtm/reference/billing/billing-strategy');
    expect(screen.getByText('免费体验产品所有特性')).toBeVisible();
    expect(screen.getByText('< 1 工作小时响应')).toBeVisible();
    expect(screen.getByText('套餐灵活选择')).toBeVisible();
  }, 30000);

  it('renders the complete UTC billing query cutoff instead of a colon directive', async () => {
    await renderPage('realtime-media/marketplace/reference/usage-billing');
    const rows = screen.getAllByRole('row', { name: /^toTs/ });
    expect(rows).toHaveLength(2);
    for (const row of rows) expect(row).toHaveTextContent('23:59:59');
  }, 30000);

  it('uses real SDK operation names on all nine published RTM platforms', async () => {
    await renderPage('realtime-media/rtm/reference/billing/billing-rules');
    for (const [label, login, renew] of [
      ['Web', 'login', 'renewToken'],
      ['Android', 'login', 'renewToken'],
      ['iOS', 'loginByToken', 'renewToken'],
      ['Swift', 'login', 'renewToken'],
      ['C++', 'login', 'renewToken'],
      ['HarmonyOS', 'login', 'renewToken'],
      ['小程序', 'login', 'renewToken'],
      ['Unity', 'LoginAsync', 'RenewTokenAsync'],
      ['Flutter', 'login', 'renewToken'],
    ]) {
      fireEvent.click(
        screen.getAllByRole('tab', {
          name: label === '小程序' ? /小程序|Mini Program/ : label,
        })[0],
      );
      const panel = document.querySelector<HTMLElement>(
        '[data-platform-panel]:not([hidden])',
      );
      expect(panel).not.toBeNull();
      if (!panel) throw new Error(`No visible platform panel for ${label}`);
      expect(
        within(panel).getByText(login, { selector: 'code' }),
      ).toBeVisible();
      expect(
        within(panel).getByText(renew, { selector: 'code' }),
      ).toBeVisible();
      expect(screen.queryByText('config.login')).toBeNull();
      expect(screen.queryByText('token.renewtoken')).toBeNull();
    }
  }, 30000);
});
