import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { ApiReferenceCards } from '@/components/docs-overview/ApiReferenceCards';
import { ApiReferenceProductNav } from './ApiReferenceProductNav';

describe('ApiReferenceProductNav', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/zh-CN/api-reference/api');
  });

  it('renders grouped products in an independent always-visible scroll area', () => {
    render(<ApiReferenceProductNav />);

    const navigation = screen.getByRole('navigation', {
      name: 'API 参考产品',
    });
    const scrollArea = screen.getByTestId('api-reference-product-scroll');

    expect(screen.getByRole('combobox', { name: '平台/语言' })).toHaveValue(
      'all',
    );
    expect(
      within(navigation).getByRole('heading', {
        name: '实时互动基础能力',
      }),
    ).toBeVisible();
    expect(
      within(navigation).getByRole('heading', {
        name: '实时互动扩展能力',
      }),
    ).toBeVisible();
    expect(
      within(navigation).getByRole('heading', { name: '场景化解决方案' }),
    ).toBeVisible();
    expect(
      within(navigation).getByRole('button', { name: '实时互动 RTC' }),
    ).toBeVisible();
    expect(
      scrollArea.querySelector('[data-slot="scroll-area-scrollbar"]'),
    ).toBeInTheDocument();
  });

  it('filters the API catalog and URL when a product is selected', async () => {
    render(
      <>
        <ApiReferenceProductNav />
        <ApiReferenceCards locale="zh-CN" type="all" />
      </>,
    );

    const navigation = screen.getByRole('navigation', {
      name: 'API 参考产品',
    });
    const rtcButton = within(navigation).getByRole('button', {
      name: '实时互动 RTC',
    });

    fireEvent.click(rtcButton);

    await waitFor(() => {
      expect(rtcButton).toHaveAttribute('aria-pressed', 'true');
      expect(new URLSearchParams(window.location.search).get('product')).toBe(
        'rtc',
      );
    });
    expect(screen.getByRole('heading', { name: '实时互动 RTC' })).toBeVisible();
    expect(
      screen.queryByRole('heading', { name: '对话式 AI' }),
    ).not.toBeInTheDocument();
  });

  it('keeps the sidebar platform selector synchronized with the catalog', async () => {
    render(
      <>
        <ApiReferenceProductNav />
        <ApiReferenceCards locale="zh-CN" type="all" />
      </>,
    );

    const sidebarFilters = screen.getByRole('region', {
      name: 'API 参考筛选',
    });
    const platformSelect = within(sidebarFilters).getByRole('combobox', {
      name: '平台/语言',
    });

    fireEvent.change(platformSelect, { target: { value: 'web' } });

    await waitFor(() => {
      expect(new URLSearchParams(window.location.search).get('platform')).toBe(
        'web',
      );
    });
    expect(
      screen.getByRole('link', { name: /实时互动 RTC Web 客户端 SDK/i }),
    ).toBeVisible();
    expect(
      screen.queryByRole('link', {
        name: /实时互动 RTC Android 客户端 SDK/i,
      }),
    ).not.toBeInTheDocument();
  });
});
