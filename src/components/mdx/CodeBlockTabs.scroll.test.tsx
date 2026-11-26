import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ComponentType, ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DOCS_HASH_TARGET_EVENT } from '@/lib/docs-hash';
import { getMDXComponents, MDXAccordionProvider } from '../mdx';

type TabsProps = {
  children: ReactNode;
  defaultValue?: string;
  groupId?: string;
  persist?: boolean;
  value?: string;
};
const components = getMDXComponents(undefined, { locale: 'zh-CN' });
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
  it('opens a historical anchor in a code panel ahead of the saved language', async () => {
    sessionStorage.setItem('historical-token', 'python3');
    localStorage.setItem('historical-token', 'python3');
    window.history.replaceState({}, '', '/guide#sample-code');
    try {
      render(
        <MDXAccordionProvider>
          {['first', 'second'].map((id) => (
            <CodeTabs
              key={id}
              defaultValue="cpp"
              groupId="historical-token"
              persist
            >
              <CodeList>
                <CodeTrigger value="cpp">C++</CodeTrigger>
                <CodeTrigger value="Golang">Golang</CodeTrigger>
                <CodeTrigger value="python3">Python3</CodeTrigger>
              </CodeList>
              <CodePanel value="cpp">
                <pre>cpp sample</pre>
              </CodePanel>
              <CodePanel value="Golang">
                {id === 'first' ? <span id="sample-code" /> : null}
                <pre>Go sample</pre>
              </CodePanel>
              <CodePanel value="python3">
                <pre>Python sample</pre>
              </CodePanel>
            </CodeTabs>
          ))}
        </MDXAccordionProvider>,
      );
      await waitFor(() =>
        expect(
          screen
            .getAllByRole('tab', { name: 'Golang' })
            .every((tab) => tab.getAttribute('aria-selected') === 'true'),
        ).toBe(true),
      );
      fireEvent.mouseDown(screen.getAllByRole('tab', { name: 'Python3' })[0], {
        button: 0,
        ctrlKey: false,
      });
      fireEvent(
        window,
        new CustomEvent(DOCS_HASH_TARGET_EVENT, { detail: '#sample-code' }),
      );
      await waitFor(() =>
        expect(
          screen
            .getAllByRole('tab', { name: 'Golang' })
            .every((tab) => tab.getAttribute('aria-selected') === 'true'),
        ).toBe(true),
      );
      expect(
        document.getElementById('sample-code')?.closest('[role="tabpanel"]'),
      ).not.toHaveAttribute('hidden');
    } finally {
      sessionStorage.removeItem('historical-token');
      localStorage.removeItem('historical-token');
      window.history.replaceState({}, '', '/');
    }
  });

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
