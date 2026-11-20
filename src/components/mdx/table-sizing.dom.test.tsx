import { fireEvent, render, waitFor, within } from '@testing-library/react';
import { useState } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it } from 'vitest';
import { DocsTable } from './DocsTable';
import { prepareTableColumns } from './table-columns';
import { applyTableContentSizing } from './table-sizing.dom';

function ChangingRows({ onRender }: { onRender: () => void }) {
  onRender();
  const [long, setLong] = useState(false);
  return (
    <tr>
      <td>1</td>
      <td>
        <button type="button" onClick={() => setLong(!long)}>
          {long
            ? 'A long explanation inside a composed row needs room for continuous reading.'
            : 'Yes'}
        </button>
      </td>
    </tr>
  );
}

function ChangingValue() {
  const [long, setLong] = useState(false);
  return (
    <button type="button" onClick={() => setLong(!long)}>
      {long
        ? 'Optional when the configured extension requires a complete explanation to make its behavior understandable.'
        : 'Yes'}
    </button>
  );
}

function ChangingSpanRows() {
  const [merged, setMerged] = useState(true);
  return (
    <>
      <tr>
        <td rowSpan={merged ? 2 : 1}>
          A long description occupies the first logical column and retains
          reading space.
          <button type="button" onClick={() => setMerged(!merged)}>
            Toggle span
          </button>
        </td>
        <td>A</td>
      </tr>
      <tr>
        <td>B</td>
      </tr>
    </>
  );
}

it('updates logical column sizing for attribute-only span changes', async () => {
  const view = render(
    <DocsTable>
      <thead>
        <tr>
          <th>Description</th>
          <th>Value</th>
        </tr>
      </thead>
      <tbody>
        <ChangingSpanRows />
      </tbody>
    </DocsTable>,
  );
  const button = within(view.container).getByRole('button');
  const cell = within(view.container).getByText('B');
  const text = view.container.textContent;
  expect(cell).toHaveAttribute('data-table-column-size', 'compact');
  fireEvent.click(button);
  await waitFor(() =>
    expect(cell).toHaveAttribute('data-table-column-size', 'prose'),
  );
  expect(view.container.textContent).toBe(text);
  fireEvent.click(button);
  await waitFor(() =>
    expect(cell).toHaveAttribute('data-table-column-size', 'compact'),
  );
  expect(view.container.textContent).toBe(text);
});

it('updates composed child content without a parent render or an observer loop', async () => {
  let renders = 0;
  const view = render(
    <DocsTable>
      <thead>
        <tr>
          <th>No.</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        <ChangingRows
          onRender={() => {
            renders++;
          }}
        />
      </tbody>
    </DocsTable>,
  );
  const button = within(view.container).getByRole('button');
  expect(button.closest('td')).toHaveAttribute(
    'data-table-column-size',
    'compact',
  );
  fireEvent.click(button);
  await waitFor(() =>
    expect(button.closest('td')).toHaveAttribute(
      'data-table-column-size',
      'prose',
    ),
  );
  expect(renders).toBe(2);
  fireEvent.click(button);
  await waitFor(() =>
    expect(button.closest('td')).toHaveAttribute(
      'data-table-column-size',
      'compact',
    ),
  );
  expect(renders).toBe(3);
});

it('keeps logical columns, rowspan, colspan and nested-table contents intact', () => {
  const holder = document.createElement('div');
  holder.innerHTML =
    '<table><thead><tr><th>Group</th><th>Value</th><th>Notes</th></tr></thead><tbody><tr><td rowspan="2">Audio</td><td>12,000</td><td><table><tbody><tr><td>Nested long text must not stretch the outer value column.</td></tr></tbody></table></td></tr><tr><td>18,000</td><td>Other</td></tr><tr><td colspan="3">A shared explanatory note that spans the original three columns without changing their individual roles.</td></tr></tbody></table>';
  const table = holder.querySelector('table');
  if (!table) throw new Error('Missing table fixture');
  const before = table.textContent;
  applyTableContentSizing(table);
  const rows = table.querySelectorAll(
    ':scope > thead > tr, :scope > tbody > tr',
  );
  expect(rows[1].children[1]).toHaveAttribute(
    'data-table-column-size',
    'compact',
  );
  expect(rows[2].children[0]).toHaveAttribute(
    'data-table-column-size',
    'compact',
  );
  expect(rows[1].children[0]).toHaveAttribute('rowspan', '2');
  expect(rows[3].children[0]).toHaveAttribute('colspan', '3');
  expect(rows[3].children[0]).toHaveAttribute('data-table-column-size', 'span');
  expect(rows[1].children[2]).toHaveAttribute(
    'data-table-column-size',
    'prose',
  );
  expect(table.querySelector('td table td')).not.toHaveAttribute(
    'data-table-column-size',
  );
  expect(table.textContent).toBe(before);
});

it('uses the same content sizing for native SSR cells and the DOM adapter', () => {
  const children = [
    <thead key="head">
      <tr>
        <th>名称</th>
        <th>Default value</th>
        <th>Description</th>
      </tr>
    </thead>,
    <tbody key="body">
      <tr>
        <td>short</td>
        <td>
          <ul>
            <li>SD: 200</li>
            <li>HD: 50</li>
          </ul>
        </td>
        <td>
          <p>
            A complete explanation keeps room for continuous reading in the
            shared table.
          </p>
        </td>
      </tr>
    </tbody>,
  ];
  const plan = prepareTableColumns(children);
  const holder = document.createElement('div');
  holder.innerHTML = renderToStaticMarkup(<table>{plan.children}</table>);
  const table = holder.querySelector('table');
  if (!table) throw new Error('Missing SSR table');
  const snapshot = () =>
    [...table.querySelectorAll('th,td')].map((cell) => [
      cell.getAttribute('data-table-column-size'),
      (cell as HTMLElement).style.getPropertyValue('--docs-table-cell-min'),
    ]);
  const before = snapshot();
  applyTableContentSizing(table);
  expect(snapshot()).toEqual(before);
});

it('restores authored status alignment when changing child content becomes prose', async () => {
  const view = render(
    <DocsTable>
      <thead>
        <tr>
          <th>Name</th>
          <th>Required</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>field</td>
          <td style={{ textAlign: 'right' }}>
            <ChangingValue />
          </td>
        </tr>
      </tbody>
    </DocsTable>,
  );
  const button = within(view.container).getByRole('button');
  expect(button.closest('td')).toHaveStyle({ textAlign: 'center' });
  fireEvent.click(button);
  await waitFor(() =>
    expect(button.closest('td')).toHaveAttribute(
      'data-table-column-size',
      'prose',
    ),
  );
  expect(button.closest('td')).toHaveStyle({ textAlign: 'right' });
});
