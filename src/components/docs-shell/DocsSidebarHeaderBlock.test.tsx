import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import type { ComponentProps } from 'react';
import { I18nextProvider } from 'react-i18next';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { DocsSidebarHeader } from '@/lib/docs-nav-scope';
import { i18n } from '@/lib/i18n/i18n';
import { DocsSidebarHeaderBlock } from './DocsSidebarHeaderBlock';

vi.mock('@tanstack/react-router', () => ({
  Link: ({
    to,
    params: _params,
    search: _search,
    ...props
  }: ComponentProps<'a'> & {
    to: string;
    params?: object;
    search?: object;
  }) => <a {...props} data-router-link="true" href={to} />,
}));

const header = {
  backHref: '/zh-CN/api-reference',
  backLabel: 'API Reference',
  title: 'RTC Android',
  versionSwitcher: {
    currentId: 'current',
    versions: [
      {
        id: 'current',
        label: '最新版',
        href: '/zh-CN/api-reference/rtc/android',
      },
      {
        id: 'archive-https',
        label: '3.x',
        href: 'https://doc.shengwang.cn/api-ref/rtc/android/3.x/index.html',
      },
      {
        id: 'archive-http',
        label: '2.x',
        href: 'http://doc.shengwang.cn/api-ref/rtc/android/2.x/index.html',
      },
      {
        id: 'internal-history',
        label: '本地历史版本',
        href: '/zh-CN/api-reference/rtc/android/legacy',
      },
    ],
  },
} satisfies DocsSidebarHeader;

const t = i18n.getFixedT('zh-CN', 'common');

afterEach(cleanup);

describe.each(['desktop', 'mobile'] as const)(
  'DocsSidebarHeaderBlock (%s)',
  (mode) => {
    function renderHeader(overrides: Partial<DocsSidebarHeader> = {}) {
      const onSelectPath = vi.fn();

      render(
        <I18nextProvider i18n={i18n}>
          <DocsSidebarHeaderBlock
            header={{ ...header, ...overrides }}
            locale="zh-CN"
            mode={mode}
            onSelectPath={onSelectPath}
          />
        </I18nextProvider>,
      );

      return { onSelectPath };
    }

    it('opens archive links in a new tab without routing or changing the current version', async () => {
      const { onSelectPath } = renderHeader();
      const trigger = screen.getByRole('button', {
        name: t('docs.versionSelect'),
      });

      trigger.focus();
      fireEvent.keyDown(trigger, { key: 'ArrowDown' });

      const menu = await screen.findByRole('menu', {
        name: t('docs.versionSelect'),
      });
      expect(menu).toHaveAttribute('aria-label', t('docs.versionMenuLabel'));
      const current = within(menu).getByRole('menuitem', { name: '最新版' });
      const internalHistory = within(menu).getByRole('menuitem', {
        name: '本地历史版本',
      });

      expect(current).toHaveAttribute('data-router-link', 'true');
      expect(current).toHaveAttribute(
        'href',
        '/zh-CN/api-reference/rtc/android',
      );
      expect(current).toHaveAttribute('aria-current', 'page');
      expect(current).not.toHaveAttribute('target');
      expect(current.querySelector('svg')).not.toBeNull();
      expect(internalHistory).toHaveAttribute('data-router-link', 'true');
      expect(internalHistory).not.toHaveAttribute('target');
      expect(internalHistory).not.toHaveAttribute('aria-current');

      for (const [label, href] of [
        ['3.x', header.versionSwitcher.versions[1].href],
        ['2.x', header.versionSwitcher.versions[2].href],
      ] as const) {
        const archive = within(menu).getByRole('menuitem', { name: label });
        expect(archive.tagName).toBe('A');
        expect(archive).not.toHaveAttribute('data-router-link');
        expect(archive).toHaveAttribute('href', href);
        expect(archive).toHaveAttribute('target', '_blank');
        expect(archive).toHaveAttribute('rel', 'noopener noreferrer');
        expect(archive).not.toHaveAttribute('aria-current');
        expect(archive.querySelector('svg')).toBeNull();
      }

      fireEvent.click(within(menu).getByRole('menuitem', { name: '3.x' }));

      expect(onSelectPath).toHaveBeenCalledTimes(1);
      await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      expect(trigger).toHaveTextContent('最新版');
    });

    it.each([
      ['without versions', undefined],
      [
        'with tabs',
        { ...header.versionSwitcher, presentation: 'tabs' as const },
      ],
    ])('does not render the version dropdown %s', (_name, versionSwitcher) => {
      const { onSelectPath } = renderHeader({ versionSwitcher });

      expect(
        screen.queryByRole('button', { name: t('docs.versionSelect') }),
      ).toBeNull();
      expect(screen.getByText('RTC Android')).toBeVisible();
      const backLink = screen.getByRole('link', { name: 'API Reference' });
      expect(backLink).toHaveAttribute('href', '/zh-CN/api-reference');
      expect(backLink).toHaveAttribute('data-router-link', 'true');
      fireEvent.click(backLink);
      expect(onSelectPath).toHaveBeenCalledTimes(1);
    });
  },
);
