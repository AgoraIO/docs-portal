import { readFileSync } from 'node:fs';
import { cleanup, fireEvent, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { renderDocsMdx } from '@/test/render-docs-mdx';

function readGuide(path: string) {
  return readFileSync(`content/docs/zh-CN/${path}.mdx`, 'utf8').replace(
    /^---\n[\s\S]*?\n---\n/,
    '',
  );
}

function expectSynchronizedChoices(
  tablists: HTMLElement[],
  choices: string[],
  firstGroup: number,
) {
  const sources = [
    tablists[firstGroup],
    ...tablists.filter((_, index) => index !== firstGroup),
  ];

  for (const source of sources) {
    for (const choice of choices) {
      fireEvent.mouseDown(within(source).getByRole('tab', { name: choice }), {
        button: 0,
        ctrlKey: false,
      });
      for (const relatedStep of tablists) {
        expect(
          within(relatedStep).getByRole('tab', { name: choice }),
        ).toHaveAttribute('aria-selected', 'true');
      }
    }
  }
}

describe('Chinese AI guide choices across steps', () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
  });
  afterEach(cleanup);

  it('keeps the Agents SDK language aligned when changing the start command or any other step', async () => {
    await renderDocsMdx(readGuide('ai/get-started/quick-start-agent'));

    const tablists = screen.getAllByRole('tablist');
    expect(tablists).toHaveLength(5);
    expectSynchronizedChoices(tablists, ['Python', 'TypeScript', 'Go'], 3);
  }, 30000);

  it('keeps transcript setup, callbacks, lifecycle and API references on the selected client platform', async () => {
    await renderDocsMdx(readGuide('ai/build/transcripts'));

    const tablists = screen.getAllByRole('tablist');
    expect(tablists).toHaveLength(10);
    expectSynchronizedChoices(tablists, ['Web', 'iOS', 'Android'], 3);
  }, 30000);
});
