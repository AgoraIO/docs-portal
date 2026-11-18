import { within } from '@testing-library/react';
import { expect, it } from 'vitest';
import { renderDocsMdx } from '@/test/render-docs-mdx';

it('assigns description width to its logical column across merged groups', async () => {
  const { container } = await renderDocsMdx(`<DocsTable>
<thead><tr><th rowSpan={2}>Group</th><th colSpan={2}>Settings</th></tr>
<tr><th>Type</th><th>Description</th></tr></thead>
<tbody><tr><td rowSpan={2}>Audio</td><td>string</td><td>First description.</td></tr>
<tr><td>number</td><td>Second description.</td></tr></tbody>
</DocsTable>`);
  const table = within(container).getByRole('table');
  expect(within(table).getByText('First description.')).toHaveAttribute(
    'data-table-column-kind',
    'description',
  );
  expect(within(table).getByText('Second description.')).toHaveAttribute(
    'data-table-column-kind',
    'description',
  );
  expect(within(table).getByText('number')).toHaveAttribute(
    'data-table-column-kind',
    'type',
  );
  expect(within(table).getByText('Audio')).toHaveAttribute('rowspan', '2');
  expect(within(table).getByText('Settings')).toHaveAttribute('colspan', '2');
});

it('keeps compact density independent of the column layout', async () => {
  const { container } =
    await renderDocsMdx(`<DocsTable density="compact" columns={['value', 'description']}>
<thead><tr><th>Option</th><th>Details</th></tr></thead>
<tbody><tr><td>10 Gbps</td><td>Readable prose remains in its own column.</td></tr></tbody>
</DocsTable>`);
  const table = within(container).getByRole('table');
  expect(table).toHaveAttribute('data-table-density', 'compact');
  expect(table).not.toHaveAttribute('data-table-layout', 'fixed');
  expect(within(table).getByText('10 Gbps')).toHaveAttribute(
    'data-table-column-kind',
    'value',
  );
  expect(
    within(table).getByText('Readable prose remains in its own column.'),
  ).toHaveAttribute('data-table-column-kind', 'description');
});

it('keeps a nested table independent from its containing description column', async () => {
  const { container } =
    await renderDocsMdx(`<DocsTable columns={['name', 'description']}>
<thead><tr><th>Parameter</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>profile</td>
<td>

<DocsTable><thead><tr><th>Tier</th><th>Resolution</th></tr></thead><tbody><tr><td>HD</td><td>1280 × 720</td></tr></tbody></DocsTable>

</td>
</tr>
</tbody>
</DocsTable>`);
  expect(within(container).getAllByRole('table')).toHaveLength(2);
  expect(within(container).getByText('1280 × 720')).toHaveAttribute(
    'data-table-column-kind',
    'value',
  );
  expect(within(container).getByText('HD')).toHaveAttribute(
    'data-table-column',
    '0',
  );
});

it('assigns known roles to composed API parameter rows after they render', async () => {
  const { container } = await renderDocsMdx(`<ParameterList>
<Parameter name="uid" type="string">The user identifier.</Parameter>
</ParameterList>`);
  const table = within(container).getByRole('table');
  expect(table.querySelector('tbody th')).toHaveAttribute(
    'data-table-column-kind',
    'name',
  );
  expect(table.querySelector('tbody td')).toHaveAttribute(
    'data-table-column-kind',
    'description',
  );
});

it('keeps unknown headings conservative until their roles are declared', async () => {
  const { container } = await renderDocsMdx(`<DocsTable>
<thead><tr><th>Delivery notes</th><th>Price</th></tr></thead>
<tbody><tr><td>Instructions retain their content measure.</td><td>12,000</td></tr></tbody>
</DocsTable>`);
  expect(
    within(container).getByText('Instructions retain their content measure.'),
  ).toHaveAttribute('data-table-column-kind', 'content');
  expect(within(container).getByText('12,000')).toHaveAttribute(
    'data-table-column-kind',
    'number',
  );
});
