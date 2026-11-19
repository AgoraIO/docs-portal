import { readFileSync } from 'node:fs';
import { evaluate } from '@mdx-js/mdx';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import {
  remarkCodeTab,
  remarkDirectiveAdmonition,
} from 'fumadocs-core/mdx-plugins';
import * as runtime from 'react/jsx-runtime';
import remarkDirective from 'remark-directive';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { getMDXComponents, MDXAccordionProvider } from '@/components/mdx';

describe('RTM Web package installation', () => {
  beforeEach(() => {
    sessionStorage.removeItem('package');
    localStorage.removeItem('package');
  });
  afterEach(() => {
    sessionStorage.removeItem('package');
    localStorage.removeItem('package');
  });

  it.each([
    ['API', 'content/docs/zh-CN/api-reference/rtm/web/configuration.mdx'],
    [
      'guide',
      'content/docs/zh-CN/realtime-media/rtm/build/rtm-initialization/application-setup.mdx',
    ],
  ])(
    'synchronizes all three %s scenarios inside installation step one',
    async (_, path) => {
      const source = readFileSync(path, 'utf8');
      const start = source.indexOf('1. 根据你的应用场景和开发需要');
      const stepTwo = source.indexOf('2. 完成安装后，在你的 `app.js`', start);
      const codeStart = source.indexOf('```', stepTwo);
      const end = source.indexOf('```', codeStart + 3) + 3;
      const { default: Content } = await evaluate(source.slice(start, end), {
        ...runtime,
        remarkPlugins: [
          remarkDirective,
          [remarkDirectiveAdmonition, { types: ['warning'] }],
          [remarkCodeTab, { parseMdx: true }],
        ],
      });
      const { container } = render(
        <MDXAccordionProvider>
          <Content components={getMDXComponents()} />
        </MDXAccordionProvider>,
      );

      for (const [manager, index] of [
        ['pnpm', 0],
        ['Yarn', 1],
        ['npm', 2],
      ] as const) {
        const tabs = screen.getAllByRole('tab', { name: `使用 ${manager}` });
        expect(tabs).toHaveLength(3);
        fireEvent.mouseDown(tabs[index]);
        await waitFor(() => {
          for (const tab of tabs)
            expect(tab).toHaveAttribute('aria-selected', 'true');
        });
      }

      const steps = container.querySelector('ol');
      expect(steps?.children).toHaveLength(2);
      for (const tabs of screen.getAllByRole('tablist')) {
        expect(tabs.closest('li')).toBe(steps?.children[0]);
      }
      expect(container.textContent).toContain(
        'yarn add agora-rtc-sdk-ng@4.22.0 --save-exact',
      );
      expect(container.textContent).toContain(
        'pnpm add agora-rtx --shamefully-hoist',
      );
    },
  );
});
