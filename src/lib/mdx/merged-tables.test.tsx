import { within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderDocsMdx } from '@/test/render-docs-mdx';

describe('merged documentation table publication', () => {
  it('marks logical column and bottom edges across nested row and column spans', async () => {
    const { container } = await renderDocsMdx(`<DocsTable>
<thead>
<tr><th rowSpan={2}>Group</th><th colSpan={3}>Settings</th></tr>
<tr><th>Key</th><th>Part</th><th>Value</th></tr>
</thead>
<tbody>
<tr><td rowSpan={3}>shared</td><td>one</td><td>part A</td><td>1</td></tr>
<tr><td>two</td><td rowSpan={2}>part B</td><td>2</td></tr>
<tr><td>three</td><td>3</td></tr>
</tbody>
</DocsTable>`);
    const table = within(container).getByRole('table');
    const rows = table.querySelectorAll('tbody tr');
    const columns = (row: Element) =>
      Array.from(row.children).map((cell) =>
        cell.getAttribute('data-table-column'),
      );
    expect(columns(rows[0])).toEqual(['0', '1', '2', '3']);
    expect(columns(rows[1])).toEqual(['1', '2', '3']);
    expect(columns(rows[2])).toEqual(['1', '3']);
    expect(columns(table.querySelectorAll('thead tr')[1])).toEqual([
      '1',
      '2',
      '3',
    ]);
    expect(within(table).getByText('shared')).toHaveAttribute(
      'data-table-bottom-edge',
    );
    expect(within(table).getByText('part B')).toHaveAttribute(
      'data-table-bottom-edge',
    );
    expect(within(table).getByText('two')).not.toHaveAttribute(
      'data-table-bottom-edge',
    );
    expect(table.querySelector('thead [data-table-bottom-edge]')).toBeNull();
  });
  it('renders actual spans and rich Markdown without paragraph wrappers around rows or cells', async () => {
    const { container } = await renderDocsMdx(`<DocsTable>
<thead>
<tr>
<th colSpan={2}>Settings</th>
</tr>
</thead>
<tbody>
<tr>
<td rowSpan={2}>\`option\`</td>
<td>

- First detail
- Second detail

</td>
</tr>
<tr>
<td>\`strength\`</td>
</tr>
</tbody>
</DocsTable>`);
    const table = within(container).getByRole('table');
    const cells = table.querySelectorAll('tbody tr');
    expect(cells).toHaveLength(2);
    expect(cells[0].children).toHaveLength(2);
    expect(cells[1].children).toHaveLength(1);
    expect(table.querySelector('th')).toHaveAttribute('colspan', '2');
    expect(within(table).getByText('option').closest('td')).toHaveAttribute(
      'rowspan',
      '2',
    );
    expect(within(table).getAllByText('option')).toHaveLength(1);
    expect(within(table).getAllByRole('listitem')).toHaveLength(2);
    expect(table.querySelector('tr > p, thead > p, tbody > p')).toBeNull();
  });

  it('rejects prose in table structure instead of producing invalid HTML', async () => {
    await expect(
      renderDocsMdx(
        '<DocsTable>\n<tbody>\nPlain text outside cells.\n</tbody>\n</DocsTable>',
      ),
    ).rejects.toThrow('DocsTable tbody must contain only tr elements');
  });
});
