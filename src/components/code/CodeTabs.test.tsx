import { fireEvent, render, screen, within } from '@testing-library/react';
import type { ComponentType, ReactNode } from 'react';
import { afterEach, expect, it } from 'vitest';
import { getMDXComponents, MDXAccordionProvider } from '@/components/mdx';

afterEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});
function Example({
  page = 'zh-CN/realtime-media/rtc/example.mdx',
  group,
}: {
  page?: string;
  group?: string;
}) {
  const c = getMDXComponents(undefined, { contentPath: page });
  type Props = {
    children?: ReactNode;
    value?: string;
    groupId?: string;
    defaultValue?: string;
    persist?: boolean;
  };
  const Tabs = c.CodeBlockTabs as ComponentType<Props>;
  const List = c.CodeBlockTabsList as ComponentType<Props>;
  const Trigger = c.CodeBlockTabsTrigger as ComponentType<Props>;
  const Panel = c.CodeBlockTab as ComponentType<Props>;
  return (
    <Tabs defaultValue="java" groupId={group}>
      <List>
        <Trigger value="java">Java</Trigger>
        <Trigger value="kotlin">Kotlin</Trigger>
      </List>
      <Panel value="java">Java sample</Panel>
      <Panel value="kotlin">Kotlin sample</Panel>
    </Tabs>
  );
}
function chooseKotlin() {
  fireEvent.mouseDown(
    within(screen.getAllByRole('tablist')[0]).getByRole('tab', {
      name: 'Kotlin',
    }),
    { button: 0, ctrlKey: false },
  );
}
it('keeps code examples local even when their options match', () => {
  render(
    <MDXAccordionProvider>
      <Example />
      <Example />
    </MDXAccordionProvider>,
  );
  chooseKotlin();
  expect(
    within(screen.getAllByRole('tablist')[1]).getByRole('tab', {
      name: 'Java',
    }),
  ).toHaveAttribute('data-state', 'active');
});
it('syncs an explicit compatible group, restores it, and isolates other products', () => {
  const view = render(
    <>
      <Example group="sdk" />
      <Example group="sdk" />
      <Example group="sdk" page="zh-CN/realtime-media/rtm/example.mdx" />
    </>,
  );
  chooseKotlin();
  expect(
    within(screen.getAllByRole('tablist')[1]).getByRole('tab', {
      name: 'Kotlin',
    }),
  ).toHaveAttribute('data-state', 'active');
  expect(
    within(screen.getAllByRole('tablist')[2]).getByRole('tab', {
      name: 'Java',
    }),
  ).toHaveAttribute('data-state', 'active');
  view.unmount();
  sessionStorage.clear();
  render(<Example group="sdk" />);
  expect(screen.getByRole('tab', { name: 'Kotlin' })).toHaveAttribute(
    'data-state',
    'active',
  );
});

it('isolates persisted installation and example tabs by document path', () => {
  const c = getMDXComponents();
  type Props = {
    children?: ReactNode;
    value?: string;
    groupId?: string;
    defaultValue?: string;
    persist?: boolean;
  };
  const Tabs = c.Tabs as ComponentType<Props>;
  const List = c.TabsList as ComponentType<Props>;
  const Trigger = c.TabsTrigger as ComponentType<Props>;
  const Panel = c.TabsContent as ComponentType<Props>;
  const view = () => (
    <Tabs defaultValue="java" groupId="mode" persist>
      <List>
        <Trigger value="java">Java</Trigger>
        <Trigger value="kotlin">Kotlin</Trigger>
      </List>
      <Panel value="java">Java</Panel>
      <Panel value="kotlin">Kotlin</Panel>
    </Tabs>
  );
  const original = window.location.href;
  window.history.replaceState(null, '', '/zh-CN/realtime-media/rtc/example');
  const first = render(view());
  chooseKotlin();
  first.unmount();
  window.history.replaceState(null, '', '/zh-CN/realtime-media/rtm/example');
  const other = render(view());
  expect(screen.getByRole('tab', { name: 'Java' })).toHaveAttribute(
    'data-state',
    'active',
  );
  other.unmount();
  window.history.replaceState(null, '', '/zh-CN/realtime-media/rtc/example');
  render(view());
  expect(screen.getByRole('tab', { name: 'Kotlin' })).toHaveAttribute(
    'data-state',
    'active',
  );
  window.history.replaceState(null, '', original);
});

it('opens the inactive code tab targeted by an encoded deep link', async () => {
  const c = getMDXComponents();
  type Props = { children?: ReactNode; value?: string; defaultValue?: string };
  const Tabs = c.CodeBlockTabs as ComponentType<Props>;
  const List = c.CodeBlockTabsList as ComponentType<Props>;
  const Trigger = c.CodeBlockTabsTrigger as ComponentType<Props>;
  const Panel = c.CodeBlockTab as ComponentType<Props>;
  window.history.replaceState(
    null,
    '',
    '#%E4%BB%A3%E7%A0%81%E7%A4%BA%E4%BE%8B',
  );
  render(
    <Tabs defaultValue="java">
      <List>
        <Trigger value="java">Java</Trigger>
        <Trigger value="python">Python</Trigger>
      </List>
      <Panel value="java">Java example</Panel>
      <Panel value="python">
        <span id="代码示例">Python example</span>
      </Panel>
    </Tabs>,
  );
  expect(screen.getByRole('tab', { name: 'Python' })).toHaveAttribute(
    'data-state',
    'active',
  );
  expect(screen.getByText('Python example')).toBeVisible();
  window.history.replaceState(null, '', window.location.pathname);
});
