import { within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderDocsMdx } from '@/test/render-docs-mdx';

describe('merged documentation table publication', () => {
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
