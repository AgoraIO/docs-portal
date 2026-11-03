import { readFileSync } from 'node:fs';
import { cleanup, fireEvent, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { renderDocsMdx } from '@/test/render-docs-mdx';

const guides = [
  'harden-and-optimize/audio-setup',
  'shape-the-conversation/interrupt-agent',
  'handle-runtime-events/event-notifications',
  'shape-the-conversation/manual-turn-control',
  'transcripts',
  'send-multimodal-messages',
].map((slug) => `content/docs/zh-CN/ai/build/${slug}.mdx`);
const read = (path: string) =>
  readFileSync(path, 'utf8').replace(/^---\n[\s\S]*?\n---\n/, '');
const choose = (list: HTMLElement, name: string) =>
  fireEvent.mouseDown(within(list).getByRole('tab', { name }), {
    button: 0,
    ctrlKey: false,
  });

describe('legacy REST document switches', () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
  });
  afterEach(cleanup);

  it.each(guides)(
    'keeps installation methods separate from client platform choices in %s',
    async (path) => {
      await renderDocsMdx(read(path));
      const platformList = screen
        .getAllByRole('tablist')
        .find((list) =>
          within(list).queryByRole('tab', { name: 'Android' }),
        ) as HTMLElement;
      choose(platformList, 'Android');
      const android = screen.getByRole('tablist', {
        name: 'Android 组件集成方式',
      });
      choose(android, '源码集成');
      expect(
        within(android).getByRole('tab', { name: '源码集成' }),
      ).toHaveAttribute('aria-selected', 'true');
      expect(
        within(platformList).getByRole('tab', { name: 'Android' }),
      ).toHaveAttribute('aria-selected', 'true');
      choose(platformList, 'iOS');
      const ios = screen.getByRole('tablist', { name: 'iOS 组件集成方式' });
      choose(ios, 'Swift Package Manager');
      expect(
        within(platformList).getByRole('tab', { name: 'iOS' }),
      ).toHaveAttribute('aria-selected', 'true');
      expect(
        within(ios).getByRole('tab', { name: 'Swift Package Manager' }),
      ).toHaveAttribute('aria-selected', 'true');
      choose(platformList, 'Web');
      choose(
        screen.getByRole('tablist', { name: 'Web 组件集成方式' }),
        '源码集成',
      );
      choose(platformList, 'Android');
      expect(
        screen.getByRole('tablist', { name: 'Android 组件集成方式' }),
      ).toBeVisible();
    },
    30000,
  );

  it('keeps v2.10 client APIs in platform tabs and preserves the version anchor', async () => {
    const page = read('content/docs/zh-CN/ai/release-notes.mdx');
    const start = page.indexOf('<Accordion title="v2.10"');
    const end = page.indexOf('</Accordion>', start) + '</Accordion>'.length;
    await renderDocsMdx(
      `<Accordions type="multiple" openFirst>\n\n${page.slice(start, end)}\n\n</Accordions>`,
    );
    const tabs = screen.getByRole('tablist');
    expect(document.getElementById('v210')).toBeInTheDocument();
    for (const [label, platform] of [
      ['Android', 'android'],
      ['iOS', 'ios'],
      ['Web', 'web'],
    ]) {
      choose(tabs, label);
      const panel = screen.getByRole('tabpanel', { name: label });
      expect(panel).toHaveAttribute('data-state', 'active');
      expect(
        within(panel).getByRole('link', { name: 'manualSOS' }),
      ).toHaveAttribute('href', expect.stringContaining(`/${platform}/`));
      for (const other of screen
        .getAllByRole('tabpanel')
        .filter((candidate) => candidate !== panel))
        expect(other).toHaveAttribute('data-state', 'inactive');
    }
  }, 30000);
});
