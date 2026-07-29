import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiReferenceCards } from '@/components/docs-overview/ApiReferenceCards';
import { ApiReferenceProductNav } from './ApiReferenceProductNav';

describe('ApiReferenceProductNav', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/zh-CN/api-reference/api');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders grouped products in an independent always-visible scroll area', () => {
    render(<ApiReferenceProductNav />);

    const navigation = screen.getByRole('navigation', {
      name: 'API 参考产品',
    });
    const scrollArea = screen.getByTestId('api-reference-product-scroll');

    expect(
      screen.queryByRole('combobox', { name: '平台/语言' }),
    ).not.toBeInTheDocument();
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
      within(navigation).getByRole('link', { name: '实时互动 RTC' }),
    ).toBeVisible();
    expect(
      within(navigation).queryByRole('link', { name: '全部产品' }),
    ).not.toBeInTheDocument();
    expect(
      scrollArea.querySelector('[data-slot="scroll-area-scrollbar"]'),
    ).toBeInTheDocument();
  });

  it('links to product sections without filtering later products', () => {
    render(
      <>
        <ApiReferenceProductNav />
        <ApiReferenceCards locale="zh-CN" type="all" />
      </>,
    );

    const navigation = screen.getByRole('navigation', {
      name: 'API 参考产品',
    });
    const rtcLink = within(navigation).getByRole('link', {
      name: '实时互动 RTC',
    });

    expect(rtcLink).toHaveAttribute('href', '#api-reference-product-rtc');
    expect(document.querySelector('#api-reference-product-rtc')).toBeVisible();
    expect(screen.getByRole('heading', { name: '实时互动 RTC' })).toBeVisible();
    expect(screen.getByRole('heading', { name: '对话式 AI' })).toBeVisible();
    expect(screen.getByRole('heading', { name: '实时消息 RTM' })).toBeVisible();
    expect(
      new URLSearchParams(window.location.search).get('product'),
    ).toBeNull();
  });

  it('removes products and empty capability groups that are unavailable after filtering', async () => {
    render(
      <>
        <ApiReferenceProductNav />
        <ApiReferenceCards locale="zh-CN" type="all" />
      </>,
    );

    fireEvent.change(screen.getByLabelText('平台/语言'), {
      target: { value: 'electron' },
    });

    const navigation = screen.getByRole('navigation', {
      name: 'API 参考产品',
    });

    await waitFor(() => {
      expect(
        within(navigation).queryByRole('link', { name: '对话式 AI' }),
      ).not.toBeInTheDocument();
    });
    expect(
      within(navigation).getByRole('link', { name: '实时互动 RTC' }),
    ).toBeVisible();
    expect(
      within(navigation).getByRole('link', { name: '灵动课堂' }),
    ).toBeVisible();
    expect(
      within(navigation).queryByRole('heading', {
        name: '实时互动扩展能力',
      }),
    ).not.toBeInTheDocument();
  });

  it('tracks the visible product and scrolls its left navigation link into view', async () => {
    let hasScrolledToRtc = false;
    const originalScrollIntoView = window.HTMLElement.prototype.scrollIntoView;
    const scrollIntoView = vi.fn();

    window.HTMLElement.prototype.scrollIntoView = scrollIntoView;
    vi.spyOn(
      window.HTMLElement.prototype,
      'getBoundingClientRect',
    ).mockImplementation(function (this: HTMLElement) {
      const productId = this.dataset.apiReferenceProductId;
      const isHiddenDuplicate = this.dataset.testHiddenDuplicate === 'true';
      const top =
        productId === 'conversational-ai'
          ? hasScrolledToRtc
            ? -500
            : 500
          : productId === 'rtc'
            ? hasScrolledToRtc
              ? 120
              : 900
            : 1200;

      return {
        bottom: top + 300,
        height: isHiddenDuplicate ? 0 : 300,
        left: 0,
        right: isHiddenDuplicate ? 0 : 300,
        toJSON: () => ({}),
        top,
        width: isHiddenDuplicate ? 0 : 300,
        x: 0,
        y: top,
      };
    });

    try {
      const hiddenDuplicate = document.createElement('div');

      hiddenDuplicate.dataset.apiReferenceProductId = 'flexible-classroom';
      hiddenDuplicate.dataset.testHiddenDuplicate = 'true';
      document.body.append(hiddenDuplicate);

      render(
        <>
          <ApiReferenceProductNav />
          <ApiReferenceCards locale="zh-CN" type="all" />
        </>,
      );

      hasScrolledToRtc = true;
      fireEvent.scroll(window);
      await new Promise((resolve) => window.requestAnimationFrame(resolve));

      const rtcLink = screen.getByRole('link', { name: '实时互动 RTC' });

      await waitFor(() => {
        expect(rtcLink).toHaveAttribute('aria-current', 'location');
      });
      expect(scrollIntoView).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'nearest',
      });
      hiddenDuplicate.remove();
    } finally {
      if (originalScrollIntoView) {
        window.HTMLElement.prototype.scrollIntoView = originalScrollIntoView;
      } else {
        delete (window.HTMLElement.prototype as Partial<HTMLElement>)
          .scrollIntoView;
      }
    }
  });
});
