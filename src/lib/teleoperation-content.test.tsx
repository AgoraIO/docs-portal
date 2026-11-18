import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { evaluate } from '@mdx-js/mdx';
import { render, screen, within } from '@testing-library/react';
import * as runtime from 'react/jsx-runtime';
import { describe, expect, it } from 'vitest';
import { getMDXComponents } from '@/components/mdx';

describe('Chinese teleoperation scenario cards', () => {
  it('renders all three scenarios in a responsive grid with compact lists', async () => {
    const source = readFileSync(
      resolve('content/docs/zh-CN/solutions/teleoperation/index.mdx'),
      'utf8',
    );
    const scenarios = source
      .replace(/^---\n[\s\S]*?\n---\n/, '')
      .split('## 开始构建')[0];
    const { default: Body } = await evaluate(scenarios, { ...runtime });

    render(<Body components={getMDXComponents()} />);

    const names = ['应急接管', '高危作业', '远程服务'];
    const cards = names.map((name) =>
      screen.getByText(name).closest('[data-card]'),
    );
    const grid = cards[0]?.parentElement;

    expect(grid).toHaveClass(
      'docs-teleoperation-scenarios',
      'grid-cols-1',
      'lg:grid-cols-3',
    );
    expect(Array.from(grid?.children ?? [])).toEqual(cards);
    for (const name of names) {
      expect(
        screen.getByRole('heading', { name, level: 3 }),
      ).toBeInTheDocument();
    }
    expect(within(grid as HTMLElement).getAllByRole('listitem')).toHaveLength(
      10,
    );
    expect(grid?.querySelector('li > p')).toBeNull();
    expect(grid?.querySelector('[height]')).toBeNull();
  });
});
