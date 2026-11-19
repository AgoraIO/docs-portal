import { readFileSync } from 'node:fs';
import {
  cleanup,
  fireEvent,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { renderDocsMdx } from '@/test/render-docs-mdx';

async function renderSetup() {
  const source = readFileSync(
    'content/docs/zh-CN/realtime-media/rtc/build/setup-and-access/enable-service.mdx',
    'utf8',
  ).replace(/^---\n[\s\S]*?\n---\n/, '');
  await renderDocsMdx(source);
}

function panel(value: string) {
  const element = document.querySelector<HTMLElement>(
    `[data-mdx-tab-value="${value}"]`,
  );
  if (!element) throw new Error(`Missing ${value} setup panel`);
  return element;
}

describe('RTC console service setup tabs', () => {
  let originalLocation = '';
  beforeEach(() => {
    originalLocation = location.pathname + location.search + location.hash;
    localStorage.clear();
    sessionStorage.clear();
  });
  afterEach(() => {
    cleanup();
    window.history.replaceState({}, '', originalLocation);
  });

  it('keeps one navigation entry and separates the three setup workflows', async () => {
    await renderSetup();
    expect(screen.getByRole('tab', { name: '开通声网服务' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(
      screen.getByRole('heading', { name: /^获取临时 Token/ }),
    ).toBeVisible();
    expect(panel('restful')).toHaveAttribute('data-state', 'inactive');
    fireEvent.mouseDown(screen.getByRole('tab', { name: 'RESTful 服务' }), {
      button: 0,
      ctrlKey: false,
    });
    expect(
      screen.getByRole('heading', { name: /^获取客户 ID 和客户密钥/ }),
    ).toBeVisible();
    expect(screen.getByText(/客户密钥只能下载一次/)).toBeVisible();
    expect(panel('sdk')).toHaveAttribute('data-state', 'inactive');
    fireEvent.mouseDown(screen.getByRole('tab', { name: '小程序服务' }), {
      button: 0,
      ctrlKey: false,
    });
    expect(panel('mini-program')).toHaveAttribute('data-state', 'active');
    expect(
      within(panel('sdk')).getByRole('heading', { name: /Web SDK/ }),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /^开通步骤/ })).toBeVisible();
    expect(screen.getByRole('img', { name: '开通服务一' })).toBeVisible();
    expect(screen.getByRole('img', { name: '开通服务二' })).toBeVisible();
    const meta = JSON.parse(
      readFileSync(
        'content/docs/zh-CN/realtime-media/rtc/build/setup-and-access/meta.json',
        'utf8',
      ),
    );
    expect(
      meta.pages.filter((page: string) => page.startsWith('enable-')),
    ).toEqual(['enable-service']);
  }, 30000);

  it.each([
    ['restful-service', 'RESTful 服务', /^获取客户 ID 和客户密钥/],
    ['mini-program-service', '小程序服务', /^开通步骤/],
    ['开启小程序服务', '小程序服务', /^开通步骤/],
  ])(
    'reveals the correct panel for fragment %s',
    async (id, label, heading) => {
      window.history.replaceState(
        {},
        '',
        `/#${encodeURIComponent(id as string)}`,
      );
      await renderSetup();
      await waitFor(() =>
        expect(
          screen.getByRole('tab', { name: label as string }),
        ).toHaveAttribute('aria-selected', 'true'),
      );
      expect(
        screen.getByRole('heading', { name: heading as RegExp }),
      ).toBeVisible();
      const ids = [...document.querySelectorAll('[id]')].map((node) => node.id);
      expect(new Set(ids).size).toBe(ids.length);
    },
    30000,
  );
});
