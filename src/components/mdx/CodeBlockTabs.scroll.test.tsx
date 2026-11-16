import { fireEvent, render, screen } from '@testing-library/react';
import type { ComponentType, ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { getMDXComponents } from '../mdx';

type TabsProps = {
  children: ReactNode;
  defaultValue?: string;
  groupId?: string;
  value?: string;
};
const components = getMDXComponents();
const Tabs = components.Tabs as ComponentType<TabsProps>;
const List = components.TabsList as ComponentType<TabsProps>;
const Trigger = components.TabsTrigger as ComponentType<TabsProps>;
const Panel = components.TabsContent as ComponentType<TabsProps>;
const CodeTabs = components.CodeBlockTabs as ComponentType<TabsProps>;
const CodeList = components.CodeBlockTabsList as ComponentType<TabsProps>;
const CodeTrigger = components.CodeBlockTabsTrigger as ComponentType<TabsProps>;
const CodePanel = components.CodeBlockTab as ComponentType<TabsProps>;

afterEach(() => vi.restoreAllMocks());

describe('synchronized code tab reading position', () => {
  it.each(['mouse', 'Enter', 'focus'])(
    'keeps the initiating code tab in view after %s grows an upstream mixed panel',
    (input) => {
      sessionStorage.clear();
      render(
        <>
          <Tabs defaultValue="npm" groupId="reading-position">
            <List>
              <Trigger value="npm">npm</Trigger>
              <Trigger value="pnpm">pnpm</Trigger>
            </List>
            <Panel value="npm">Short installation</Panel>
            <Panel value="pnpm">
              Long installation with preserved mixed prose
            </Panel>
          </Tabs>
          <CodeTabs defaultValue="npm" groupId="reading-position">
            <CodeList>
              <CodeTrigger value="npm">npm</CodeTrigger>
              <CodeTrigger value="pnpm">pnpm</CodeTrigger>
            </CodeList>
            <CodePanel value="npm">
              <pre>
                <code>npm install sdk</code>
              </pre>
            </CodePanel>
            <CodePanel value="pnpm">
              <pre>
                <code>pnpm add sdk</code>
              </pre>
            </CodePanel>
          </CodeTabs>
        </>,
      );
      const target = screen.getAllByRole('tab', { name: 'pnpm' })[1];
      const upstream = screen.getAllByRole('tab', { name: 'pnpm' })[0];
      const list = target.closest('[role="tablist"]');
      if (!list) throw new Error('Code tabs must have a tablist');
      const original = Object.getOwnPropertyDescriptor(window, 'scrollY');
      let scrollY = 986;
      Object.defineProperty(window, 'scrollY', {
        configurable: true,
        get: () => scrollY,
      });
      const scrollTo = vi
        .spyOn(window, 'scrollTo')
        .mockImplementation((options: ScrollToOptions | number) => {
          if (typeof options === 'object') scrollY = options.top ?? scrollY;
        });
      vi.spyOn(list, 'getBoundingClientRect').mockImplementation(() =>
        DOMRect.fromRect({
          y:
            (upstream.getAttribute('aria-selected') === 'true' ? 904 : 261) -
            (scrollY - 986),
          width: 400,
          height: 44,
        }),
      );
      try {
        if (input === 'mouse')
          fireEvent.mouseDown(target, { button: 0, ctrlKey: false });
        else if (input === 'Enter') fireEvent.keyDown(target, { key: 'Enter' });
        else fireEvent.focus(target);
        expect(upstream).toHaveAttribute('aria-selected', 'true');
        expect(target).toHaveAttribute('aria-selected', 'true');
        expect(scrollTo).toHaveBeenCalledWith({
          top: 1629,
          behavior: 'instant',
        });
        expect(list.getBoundingClientRect().top).toBe(261);
      } finally {
        if (original) Object.defineProperty(window, 'scrollY', original);
      }
    },
  );
});
