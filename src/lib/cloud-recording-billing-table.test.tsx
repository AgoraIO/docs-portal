import { readFileSync } from 'node:fs';
import { within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderDocsMdx } from '@/test/render-docs-mdx';

describe('Cloud Recording merged billing example', () => {
  it('preserves two header levels, all usage values and the shared note/total as actual merged cells', async () => {
    const source = readFileSync(
      'content/docs/zh-CN/realtime-media/cloud-recording/reference/billing-strategy/billing.mdx',
      'utf8',
    );
    const section = source.match(
      /### 费用计算\n([\s\S]*?)(?=## 注意事项)/,
    )?.[1];
    expect(section).toBeDefined();
    const { container } = await renderDocsMdx(section ?? '');
    const table = within(container).getByRole('table') as HTMLTableElement;
    expect(table.querySelectorAll('thead > tr')).toHaveLength(2);
    const headings = within(table).getAllByRole('columnheader');
    expect(headings.every((heading) => heading.textContent?.trim())).toBe(true);
    expect(table.querySelector('th')).toHaveAttribute('rowspan', '2');
    expect(within(table).getByText('实际用量（秒）')).toHaveAttribute(
      'colspan',
      '5',
    );
    expect(within(table).getByText('控制台展示用量（分钟）')).toHaveAttribute(
      'colspan',
      '5',
    );
    expect(table.querySelector('tr > p, tbody > p, thead > p')).toBeNull();

    const grid: HTMLTableCellElement[][] = [];
    for (const [r, row] of Array.from(table.rows).entries()) {
      grid[r] ??= [];
      let c = 0;
      for (const cell of Array.from(row.cells)) {
        while (grid[r][c]) c++;
        for (let y = 0; y < cell.rowSpan; y++) {
          grid[r + y] ??= [];
          for (let x = 0; x < cell.colSpan; x++) grid[r + y][c + x] = cell;
        }
        c += cell.colSpan;
      }
    }
    expect(grid).toHaveLength(10);
    expect(grid.every((row) => row.length === 11 && row.every(Boolean))).toBe(
      true,
    );
    const values = grid
      .slice(2, 7)
      .map((row) => row.slice(1).map((cell) => cell.textContent?.trim()));
    expect(values).toEqual([
      ['6,000', '0', '0', '0', '0', '100', '0', '0', '0', '0'],
      ['12,000', '0', '0', '0', '0', '200', '0', '0', '0', '0'],
      ['0', '3,500', '0', '0', '0', '0', '59', '0', '0', '0'],
      ['0', '0', '1,680', '0', '520', '0', '0', '28', '0', '9'],
      ['18,000', '3,500', '1,680', '0', '520', '300', '59', '28', '0', '9'],
    ]);
    const note = within(table)
      .getByText('控制台用量仅供参考，不用作实际计费依据。')
      .closest('td');
    expect(note).toHaveAttribute('rowspan', '3');
    expect(note).toHaveAttribute('colspan', '5');
    const fees = within(table).getByRole('row', { name: /^计费/ });
    expect(fees).toHaveTextContent('2.7');
    expect(fees).toHaveTextContent('2.916');
    expect(container).toHaveTextContent('10.01');
    expect(container).toHaveTextContent(
      '(2.7 + 2.124 + 2.268 + 2.916 = 10.008)',
    );
    const total = within(table).getByText('10.01').closest('td');
    expect(total).toHaveAttribute('colspan', '5');
  });
});
