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

const expectedGroups = [
  ['对话式 AI 引擎', ['对话式 AI 引擎']],
  [
    '实时互动基础能力',
    ['实时互动 RTC', '实时消息 RTM', '即时通讯 IM', '媒体流加速 RTSA'],
  ],
  [
    '实时媒体处理',
    [
      '实时转录翻译',
      '云端录制',
      '本地服务端录制',
      '云端转码',
      '旁路推流',
      '输入在线媒体流',
      'RTMP 网关',
      '融合 CDN 直播',
    ],
  ],
  ['会议协作', ['智能云会议引擎']],
  ['监控与分析', ['水晶球']],
  ['扩展能力与生态', ['RTC 服务端 SDK', '互动白板']],
  ['社交娱乐', ['在线 K 歌房', '1v1 私密房']],
  ['教育', ['灵动课堂', '在线美术教学', '在线音乐教学', 'PPT 转码服务']],
  ['智能硬件', ['微呼叫', '平行操控']],
  ['平台管理', ['控制台']],
] as const;

describe('ApiReferenceProductNav', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/zh-CN/api-reference/api');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders products under the current Chinese documentation categories', () => {
    render(<ApiReferenceProductNav />);

    const navigation = screen.getByRole('navigation', {
      name: 'API 参考产品',
    });
    const scrollArea = screen.getByTestId('api-reference-product-scroll');
    const headings = within(navigation)
      .getAllByRole('heading', { level: 2 })
      .map((heading) => heading.textContent);

    expect(headings).toEqual(expectedGroups.map(([label]) => label));

    for (const [label, products] of expectedGroups) {
      const section = within(navigation)
        .getByRole('heading', { level: 2, name: label })
        .closest('section');

      expect(section).not.toBeNull();
      expect(
        within(section as HTMLElement)
          .getAllByRole('link')
          .map((link) => link.textContent),
      ).toEqual(products);
    }

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
    expect(
      screen.getAllByRole('heading', { name: '对话式 AI 引擎' }),
    ).toHaveLength(2);
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
        within(navigation).queryByRole('heading', {
          name: '对话式 AI 引擎',
        }),
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
        name: '实时媒体处理',
      }),
    ).not.toBeInTheDocument();
    expect(
      within(navigation).getByRole('heading', {
        name: '会议协作',
      }),
    ).toBeVisible();
    expect(
      within(navigation).getByRole('heading', {
        name: '教育',
      }),
    ).toBeVisible();
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
