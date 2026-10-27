import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import type * as FumadocsTabs from 'fumadocs-ui/components/tabs';
import type { ComponentProps, ComponentType, ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DOCS_HASH_TARGET_EVENT } from '@/lib/docs-hash';
import { getMDXComponents } from './mdx';

const components = getMDXComponents();
const Tabs = components.Tabs as ComponentType<
  ComponentProps<typeof FumadocsTabs.Tabs> & {
    value?: string;
    onValueChange?: (value: string) => void;
  }
>;
const TabsList = components.TabsList as typeof FumadocsTabs.TabsList;
const TabsTrigger = components.TabsTrigger as typeof FumadocsTabs.TabsTrigger;
const TabsContent = components.TabsContent as typeof FumadocsTabs.TabsContent;
const groupId = 'reading-position-regression';
const originalScrollY = Object.getOwnPropertyDescriptor(window, 'scrollY');
const originalHref = window.location.href;

type ChoiceProps = {
  label: string;
  initial?: string;
  value?: string;
  children?: ReactNode;
} & Pick<
  ComponentProps<typeof Tabs>,
  'onMouseDownCapture' | 'onKeyDownCapture' | 'onFocusCapture' | 'onValueChange'
>;

function Choice({
  label,
  initial = 'go',
  value,
  children,
  ...props
}: ChoiceProps) {
  return (
    <Tabs
      defaultValue={initial}
      value={value}
      groupId={groupId}
      persist
      {...props}
    >
      <TabsList aria-label={label}>
        <TabsTrigger value="go">Go</TabsTrigger>
        <TabsTrigger value="ts">TypeScript</TabsTrigger>
      </TabsList>
      <TabsContent value="go">
        <p>{label} Go body</p>
      </TabsContent>
      <TabsContent value="ts">
        <h3 id={`${label.toLowerCase().replace(/ /g, '-')}-ts`}>
          {label} TypeScript body
        </h3>
      </TabsContent>
      {children}
    </Tabs>
  );
}

function Page({
  initial = 'go',
  value,
  nestedScroll = false,
  ...props
}: Omit<ChoiceProps, 'label'> & { nestedScroll?: boolean }) {
  const body = (
    <>
      <Choice label="Earlier example" initial={initial} value={value} />
      <Choice
        label="Start command"
        initial={initial}
        value={value}
        {...props}
      />
    </>
  );
  return nestedScroll ? (
    <div data-testid="scroll-owner" style={{ overflowY: 'auto', height: 600 }}>
      {body}
    </div>
  ) : (
    body
  );
}

function readingGeometry({
  delta,
  target = 'ts',
  nativeDelta = 0,
  nestedScroll = false,
  sourceLabel = 'Start command',
}: {
  delta: number;
  target?: string;
  nativeDelta?: number;
  nestedScroll?: boolean;
  sourceLabel?: string;
}) {
  const earlier = screen.getByRole('tablist', { name: 'Earlier example' });
  const source = screen.getByRole('tablist', { name: sourceLabel });
  const owner = nestedScroll ? screen.getByTestId('scroll-owner') : undefined;
  let windowY = 500;
  let ownerY = 200;
  let anchored = false;
  Object.defineProperty(window, 'scrollY', {
    configurable: true,
    get: () => windowY,
  });
  const windowScroll = vi
    .spyOn(window, 'scrollTo')
    .mockImplementation(
      (options: number | ScrollToOptions | undefined, y?: number) => {
        if (typeof options === 'number') windowY = y ?? windowY;
        else if (options) windowY = options.top ?? windowY;
      },
    );
  const ownerScroll = vi.fn((options: ScrollToOptions) => {
    ownerY = options.top ?? ownerY;
  });
  if (owner) {
    Object.defineProperties(owner, {
      scrollTop: {
        configurable: true,
        get: () => ownerY,
        set: (value) => {
          ownerY = value;
        },
      },
      scrollHeight: { configurable: true, value: 3000 },
      clientHeight: { configurable: true, value: 600 },
      scrollTo: { configurable: true, value: ownerScroll },
    });
  }
  vi.spyOn(source, 'getBoundingClientRect').mockImplementation(() => {
    const changed =
      earlier
        .querySelector('[aria-selected="true"]')
        ?.getAttribute('aria-controls')
        ?.endsWith(`-${target}`) ?? false;
    if (changed && nativeDelta && !anchored) {
      if (owner) ownerY += nativeDelta;
      else windowY += nativeDelta;
      anchored = true;
    }
    const top =
      381 + (changed ? delta : 0) - (owner ? ownerY - 200 : windowY - 500);
    return {
      x: 0,
      y: top,
      top,
      bottom: top + 40,
      height: 40,
      width: 600,
      left: 0,
      right: 600,
      toJSON: () => ({}),
    };
  });
  return { source, windowScroll, ownerScroll, owner };
}

function selectByMouse(tab: HTMLElement) {
  fireEvent.mouseDown(tab, { button: 0, ctrlKey: false });
  fireEvent.mouseUp(tab, { button: 0 });
  fireEvent.click(tab);
}

describe('synchronized MDX tabs reading position', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    window.history.replaceState(
      {},
      '',
      '/zh-CN/ai/get-started/quick-start-agent',
    );
  });
  afterEach(() => {
    vi.restoreAllMocks();
    if (originalScrollY) {
      Object.defineProperty(window, 'scrollY', originalScrollY);
    } else {
      Reflect.deleteProperty(window, 'scrollY');
    }
    window.history.replaceState({}, '', originalHref);
  });

  it.each([
    { initial: 'go', target: 'ts', name: 'TypeScript', delta: 479 },
    { initial: 'ts', target: 'go', name: 'Go', delta: -412 },
  ])(
    'keeps the initiating list fixed when earlier content changes by $delta px',
    ({ initial, target, name, delta }) => {
      render(<Page initial={initial} />);
      const { source, windowScroll } = readingGeometry({ delta, target });
      selectByMouse(within(source).getByRole('tab', { name }));
      expect(screen.getAllByRole('tab', { name, selected: true })).toHaveLength(
        2,
      );
      expect(source.getBoundingClientRect().top).toBe(381);
      expect(windowScroll).toHaveBeenCalledTimes(1);
      expect(windowScroll).toHaveBeenCalledWith(
        expect.objectContaining({ top: 500 + delta }),
      );
    },
  );
  it('does not compensate twice when native scroll anchoring already kept the list fixed', () => {
    render(<Page />);
    const { source, windowScroll } = readingGeometry({
      delta: 479,
      nativeDelta: 479,
    });
    selectByMouse(within(source).getByRole('tab', { name: 'TypeScript' }));
    expect(
      screen.getAllByRole('tab', { name: 'TypeScript', selected: true }),
    ).toHaveLength(2);
    expect(source.getBoundingClientRect().top).toBe(381);
    expect(windowScroll).not.toHaveBeenCalled();
  });

  it('corrects only the displacement left after partial native compensation', () => {
    render(<Page />);
    const { source, windowScroll } = readingGeometry({
      delta: 479,
      nativeDelta: 200,
    });
    selectByMouse(within(source).getByRole('tab', { name: 'TypeScript' }));
    expect(source.getBoundingClientRect().top).toBe(381);
    expect(windowScroll).toHaveBeenCalledTimes(1);
    expect(windowScroll).toHaveBeenCalledWith(
      expect.objectContaining({ top: 979 }),
    );
  });

  it('preserves the nested scroll owner instead of scrolling the document', () => {
    render(<Page nestedScroll />);
    const { source, windowScroll, ownerScroll, owner } = readingGeometry({
      delta: 479,
      nestedScroll: true,
    });
    selectByMouse(within(source).getByRole('tab', { name: 'TypeScript' }));
    expect(source.getBoundingClientRect().top).toBe(381);
    expect(owner?.scrollTop).toBe(679);
    expect(ownerScroll).toHaveBeenCalledTimes(1);
    expect(windowScroll).not.toHaveBeenCalled();
  });

  it.each(['Enter', ' '])(
    'keeps the source list fixed for %s keyboard selection',
    (key) => {
      render(<Page />);
      const { source, windowScroll } = readingGeometry({ delta: 479 });
      fireEvent.keyDown(
        within(source).getByRole('tab', { name: 'TypeScript' }),
        { key },
      );
      expect(
        screen.getAllByRole('tab', { name: 'TypeScript', selected: true }),
      ).toHaveLength(2);
      expect(source.getBoundingClientRect().top).toBe(381);
      expect(windowScroll).toHaveBeenCalledTimes(1);
    },
  );

  it('keeps position for automatic activation after arrow-key focus navigation', async () => {
    render(<Page />);
    const { source, windowScroll } = readingGeometry({ delta: 479 });
    const go = within(source).getByRole('tab', { name: 'Go' });
    act(() => go.focus());
    fireEvent.keyDown(go, { key: 'ArrowRight' });
    await waitFor(() =>
      expect(
        screen.getAllByRole('tab', { name: 'TypeScript', selected: true }),
      ).toHaveLength(2),
    );
    expect(source.getBoundingClientRect().top).toBe(381);
    expect(windowScroll).toHaveBeenCalledTimes(1);
  });

  it('anchors only the initiating nested group', () => {
    render(
      <>
        <Choice label="Earlier example" />
        <Choice label="Outer example">
          <Choice label="Nested command" />
        </Choice>
      </>,
    );
    const { source, windowScroll } = readingGeometry({
      delta: 479,
      sourceLabel: 'Nested command',
    });
    selectByMouse(within(source).getByRole('tab', { name: 'TypeScript' }));
    expect(
      screen.getAllByRole('tab', { name: 'TypeScript', selected: true }),
    ).toHaveLength(3);
    expect(source.getBoundingClientRect().top).toBe(381);
    expect(windowScroll).toHaveBeenCalledTimes(1);
  });

  it('keeps caller input handlers and respects a prevented mouse selection', () => {
    const mouse = vi.fn((event) => event.preventDefault());
    const keyboard = vi.fn();
    const focus = vi.fn();
    render(
      <Page
        onMouseDownCapture={mouse}
        onKeyDownCapture={keyboard}
        onFocusCapture={focus}
      />,
    );
    const { source, windowScroll } = readingGeometry({ delta: 479 });
    act(() => within(source).getByRole('tab', { name: 'Go' }).focus());
    expect(focus).toHaveBeenCalled();
    const ts = within(source).getByRole('tab', { name: 'TypeScript' });
    selectByMouse(ts);
    expect(mouse).toHaveBeenCalled();
    expect(
      screen.getAllByRole('tab', { name: 'Go', selected: true }),
    ).toHaveLength(2);
    expect(windowScroll).not.toHaveBeenCalled();
    fireEvent.keyDown(ts, { key: 'Enter' });
    expect(keyboard).toHaveBeenCalled();
    expect(source.getBoundingClientRect().top).toBe(381);
  });

  it('does not scroll when a stored group choice is restored on mount', () => {
    sessionStorage.setItem(groupId, 'ts');
    const scroll = vi.spyOn(window, 'scrollTo');
    render(<Page />);
    expect(
      screen.getAllByRole('tab', { name: 'TypeScript', selected: true }),
    ).toHaveLength(2);
    expect(scroll).not.toHaveBeenCalled();
  });

  it('does not anchor programmatic selection after an unrelated content click', () => {
    const { rerender } = render(<Page value="go" />);
    const { windowScroll } = readingGeometry({ delta: 479 });
    fireEvent.mouseDown(screen.getByText('Start command Go body'), {
      button: 0,
      ctrlKey: false,
    });
    rerender(<Page value="ts" />);
    expect(
      screen.getAllByRole('tab', { name: 'TypeScript', selected: true }),
    ).toHaveLength(2);
    expect(windowScroll).not.toHaveBeenCalled();
  });

  it('leaves hash-driven tab activation to the existing deep-link behavior', () => {
    render(<Page />);
    const { source, windowScroll } = readingGeometry({ delta: 479 });
    act(() =>
      window.dispatchEvent(
        new CustomEvent(DOCS_HASH_TARGET_EVENT, {
          detail: '#start-command-ts',
        }),
      ),
    );
    expect(
      within(source).getByRole('tab', { name: 'TypeScript', selected: true }),
    ).toBeInTheDocument();
    expect(windowScroll).not.toHaveBeenCalled();
  });

  it('expires an uncommitted input before later wheel movement and controlled updates', async () => {
    const request = vi.fn();
    const { rerender } = render(<Page value="go" onValueChange={request} />);
    const { source, windowScroll } = readingGeometry({ delta: 479 });
    selectByMouse(within(source).getByRole('tab', { name: 'TypeScript' }));
    expect(request).toHaveBeenCalledWith('ts');
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    fireEvent.wheel(window, { deltaY: 100 });
    rerender(<Page value="ts" onValueChange={request} />);
    expect(windowScroll).not.toHaveBeenCalled();
  });

  it('does not leave a scroll correction after the initiating group unmounts', async () => {
    const { unmount } = render(<Page value="go" />);
    const { source, windowScroll } = readingGeometry({ delta: 479 });
    selectByMouse(within(source).getByRole('tab', { name: 'TypeScript' }));
    unmount();
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    expect(windowScroll).not.toHaveBeenCalled();
  });
});
