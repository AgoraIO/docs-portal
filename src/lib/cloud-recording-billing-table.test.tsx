import { readFileSync } from 'node:fs';
import { within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderDocsMdx } from '@/test/render-docs-mdx';

describe('Cloud Recording billing example tables', () => {
  it('associates every usage and fee value with a nonempty column heading', async () => {
    const source = readFileSync(
      'content/docs/zh-CN/realtime-media/cloud-recording/reference/billing-strategy/billing.mdx',
      'utf8',
    );
    const section = source.match(
      /### 费用计算\n([\s\S]*?)(?=## 注意事项)/,
    )?.[1];
    expect(section).toBeDefined();
    const { container } = await renderDocsMdx(section ?? '');
    const tables = within(container).getAllByRole('table');
    for (const table of tables) {
      const headings = within(table).getAllByRole('columnheader');
      expect(headings.every((heading) => heading.textContent?.trim())).toBe(
        true,
      );
      expect(headings.length).toBeLessThanOrEqual(6);
      for (const row of table.querySelectorAll('tbody tr')) {
        expect(row.querySelectorAll('td')).toHaveLength(headings.length);
      }
    }
    expect(tables).toHaveLength(3);
    const [actual, displayed, fees] = tables;
    expect(
      within(actual).getByRole('row', { name: /2020-02-13/ }),
    ).toHaveTextContent('3,500');
    expect(
      within(displayed).getByRole('row', { name: /2020-02-13/ }),
    ).toHaveTextContent('59');
    expect(within(fees).getByRole('row', { name: /^音频/ })).toHaveTextContent(
      '300',
    );
    expect(within(fees).getByRole('row', { name: /^音频/ })).toHaveTextContent(
      '2.7',
    );
    expect(within(fees).getByRole('row', { name: /^2K\+/ })).toHaveTextContent(
      '2.916',
    );
    expect(container).toHaveTextContent(
      '控制台用量仅供参考，不用作实际计费依据。',
    );
    expect(container).toHaveTextContent('10.01');
    expect(container).toHaveTextContent(
      '(2.7 + 2.124 + 2.268 + 2.916 = 10.008)',
    );
  });
});
