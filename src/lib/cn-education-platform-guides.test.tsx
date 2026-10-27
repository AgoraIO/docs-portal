import { readFileSync } from 'node:fs';
import { cleanup, fireEvent, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { renderDocsMdx } from '@/test/render-docs-mdx';

describe('Chinese education integration platforms', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  afterEach(cleanup);

  it.each(['art-class', 'online-music-class'])(
    'keeps %s resources and conditional sections on the selected SDK platform',
    async (product) => {
      const source = readFileSync(
        `content/docs/zh-CN/solutions/${product}/get-started/quick-start.mdx`,
        'utf8',
      ).replace(/^---\n[\s\S]*?\n---\n/, '');
      await renderDocsMdx(source);

      expect(
        screen.getAllByRole('link', { name: /云信令 SDK 集成指引/ }),
      ).toHaveLength(1);
      expect(
        screen.getByRole('link', { name: /云信令 API 参考/ }),
      ).toHaveAttribute(
        'href',
        'https://docportal.shengwang.cn/cn/Real-time-Messaging/API%20Reference/RTM_java/index.html',
      );
      fireEvent.click(screen.getAllByRole('tab', { name: 'Windows' })[0]);
      expect(
        screen.getByRole('link', { name: /云信令 SDK 集成指引/ }),
      ).toHaveAttribute(
        'href',
        'https://docportal.shengwang.cn/cn/Real-time-Messaging/messaging_cpp_windows?platform=Windows',
      );
      expect(
        screen.getByRole('link', { name: /云信令 API 参考/ }),
      ).toHaveAttribute(
        'href',
        'https://docportal.shengwang.cn/cn/Real-time-Messaging/API%20Reference/RTM_cpp/index.html',
      );
      expect(screen.queryByRole('heading', { name: /^互动白板/ })).toBeNull();
      expect(
        screen.queryByRole('heading', { name: /^多人实时合唱/ }),
      ).toBeNull();
      expect(
        screen.queryByRole('heading', { name: /^动画课件支持/ }),
      ).toBeNull();
      expect(
        screen
          .getAllByRole('link')
          .some((link) =>
            link.getAttribute('href')?.includes('/api-reference/rtc/android/'),
          ),
      ).toBe(false);

      fireEvent.click(screen.getAllByRole('tab', { name: 'iOS' })[0]);
      expect(
        screen.getByRole('link', { name: /云信令 SDK 集成指引/ }),
      ).toHaveAttribute(
        'href',
        'https://docportal.shengwang.cn/cn/Real-time-Messaging/messaging_ios?platform=iOS',
      );
      expect(
        screen.getByRole('link', { name: /云信令 API 参考/ }),
      ).toHaveAttribute(
        'href',
        'https://docportal.shengwang.cn/cn/Real-time-Messaging/API%20Reference/RTM_oc/docs/headers/API-Overview.html',
      );
      expect(screen.getByRole('heading', { name: /^互动白板/ })).toBeVisible();

      fireEvent.click(screen.getAllByRole('tab', { name: 'macOS' })[0]);
      expect(
        screen.getByRole('link', { name: /云信令 SDK 集成指引/ }),
      ).toHaveAttribute(
        'href',
        'https://docportal.shengwang.cn/cn/Real-time-Messaging/messaging_mac?platform=macOS',
      );
      expect(screen.queryByRole('heading', { name: /^互动白板/ })).toBeNull();
      if (product === 'art-class') {
        expect(document.querySelectorAll('[id="动画课件支持-1"]')).toHaveLength(
          1,
        );
      }
    },
    30000,
  );
});
