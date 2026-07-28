import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SdksCatalog } from '@/components/docs-overview/SdksCatalog';
import { SdkDownloadProductNav } from './SdkDownloadProductNav';

describe('SdkDownloadProductNav', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/zh-CN/reference/sdks');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('keeps product labels in sync with the SDK cards', () => {
    render(
      <>
        <SdkDownloadProductNav />
        <SdksCatalog locale="zh-CN" />
      </>,
    );

    const navigation = screen.getByRole('navigation', { name: 'SDK 产品' });
    const cardsByProductId = new Map(
      screen
        .getAllByRole('article')
        .map((card) => [
          card.dataset.sdkDownloadProductId,
          within(card).getByRole('heading', { level: 3 }).textContent,
        ]),
    );

    for (const link of within(navigation).getAllByRole('link')) {
      const productId = link
        .getAttribute('href')
        ?.replace('#sdk-download-product-', '');

      expect(link).toHaveTextContent(cardsByProductId.get(productId) ?? '');
    }
  });

  it('only lists SDK products rendered by the current query filters', async () => {
    window.history.replaceState(
      {},
      '',
      '/zh-CN/reference/sdks?product=voice',
    );

    render(
      <>
        <SdkDownloadProductNav />
        <SdksCatalog locale="zh-CN" />
      </>,
    );

    const navigation = screen.getByRole('navigation', { name: 'SDK 产品' });

    await waitFor(() => {
      expect(
        within(navigation).queryByRole('link', { name: '视频 SDK' }),
      ).not.toBeInTheDocument();
    });
    expect(
      within(navigation).getByRole('link', { name: '语音 SDK' }),
    ).toHaveAttribute('href', '#sdk-download-product-voice');
  });

  it('tracks the SDK card at the current document scroll position', async () => {
    let hasScrolledToVoice = false;
    const originalScrollIntoView = window.HTMLElement.prototype.scrollIntoView;
    const scrollIntoView = vi.fn();

    window.HTMLElement.prototype.scrollIntoView = scrollIntoView;
    vi.spyOn(
      window.HTMLElement.prototype,
      'getBoundingClientRect',
    ).mockImplementation(function (this: HTMLElement) {
      const productId = this.dataset.sdkDownloadProductId;
      const top =
        productId === 'agents'
          ? hasScrolledToVoice
            ? -500
            : 500
          : productId === 'voice'
            ? hasScrolledToVoice
              ? 120
              : 900
            : 1200;

      return {
        bottom: top + 300,
        height: 300,
        left: 0,
        right: 300,
        toJSON: () => ({}),
        top,
        width: 300,
        x: 0,
        y: top,
      };
    });

    try {
      render(
        <>
          <SdkDownloadProductNav />
          <SdksCatalog locale="zh-CN" />
        </>,
      );

      hasScrolledToVoice = true;
      fireEvent.scroll(window);
      await new Promise((resolve) => window.requestAnimationFrame(resolve));

      const voiceLink = screen.getByRole('link', { name: '语音 SDK' });

      await waitFor(() => {
        expect(voiceLink).toHaveAttribute('aria-current', 'location');
      });
      expect(scrollIntoView).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'nearest',
      });
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
