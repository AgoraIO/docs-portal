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

it('keeps a literal key column in the natural content layout', async () => {
  const { container } = await renderDocsMdx(`| key | type | value |
| --- | --- | --- |
| NSMicrophoneUsageDescription | string | Allow microphone access. |`);
  expect(
    within(container).getByRole('columnheader', { name: 'key' }),
  ).toHaveAttribute('data-table-column-kind', 'content');
  expect(
    within(container).getByRole('cell', {
      name: 'NSMicrophoneUsageDescription',
    }),
  ).toHaveAttribute('data-table-column-kind', 'content');
});

it('centers merged table headings without changing their text or spans', async () => {
  const { container } = await renderDocsMdx(`<DocsTable>
<thead><tr><th rowSpan={2}>日期</th><th colSpan={2}>控制台展示用量（分钟）</th></tr>
<tr><th>音频</th><th>视频</th></tr></thead>
<tbody><tr><td>2025-02-04</td><td>12,000</td><td>18,000</td></tr></tbody>
</DocsTable>`);
  for (const name of ['日期', '控制台展示用量（分钟）']) {
    expect(within(container).getByRole('columnheader', { name })).toHaveStyle({
      textAlign: 'center',
      verticalAlign: 'middle',
    });
  }
  expect(
    within(container).getByRole('columnheader', { name: '日期' }),
  ).toHaveAttribute('rowspan', '2');
  expect(
    within(container).getByRole('columnheader', {
      name: '控制台展示用量（分钟）',
    }),
  ).toHaveAttribute('colspan', '2');
  expect(within(container).getByText('12,000')).toHaveTextContent('12,000');
});

it('centers the merged console reference and subtotal cells without editing them', async () => {
  const { container } = await renderDocsMdx(`<DocsTable>
<thead><tr><th>日期</th><th>实际音频</th><th>实际视频</th><th>控制台音频</th><th>控制台视频</th></tr></thead>
<tbody>
<tr><td>2025-02-04</td><td>12,000</td><td>18,000</td><td rowSpan={3} colSpan={2}>控制台用量仅供参考，不用作实际计费依据。</td></tr>
<tr><td>2025-02-05</td><td>6,000</td><td>0</td></tr>
<tr><td colSpan={3}>本月总用量</td></tr>
</tbody>
</DocsTable>`);
  const note = within(container).getByRole('cell', {
    name: '控制台用量仅供参考，不用作实际计费依据。',
  });
  expect(note).toHaveStyle({ textAlign: 'center', verticalAlign: 'middle' });
  expect(note).toHaveAttribute('rowspan', '3');
  expect(note).toHaveAttribute('colspan', '2');
  expect(
    within(container).getByRole('cell', { name: '本月总用量' }),
  ).toHaveStyle({ textAlign: 'center', verticalAlign: 'middle' });
  expect(within(container).getByText('18,000')).toHaveTextContent('18,000');
});
