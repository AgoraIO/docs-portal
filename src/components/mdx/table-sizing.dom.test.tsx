import { readFileSync } from 'node:fs';
import {
  act,
  fireEvent,
  render,
  waitFor,
  within,
} from '@testing-library/react';
import { type ReactNode, useState } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterAll, beforeAll, expect, it } from 'vitest';
import { DocsTable } from './DocsTable';
import { prepareTableColumns } from './table-columns';
import { applyTableContentSizing } from './table-sizing.dom';

function renderNativeTable(children: ReactNode) {
  const { container } = render(
    <div className="docs-table-container">
      <section />
    </div>,
  );
  const holder = container.querySelector('section');
  if (!holder) throw new Error('Missing table holder');
  holder.innerHTML = renderToStaticMarkup(
    <table>{prepareTableColumns(children).children}</table>,
  );
  const table = holder.querySelector('table');
  if (!table) throw new Error('Missing native table');
  return table;
}

it('restores numeric authored vertical alignment after a merged cell splits', () => {
  const table = renderNativeTable([
    <thead key="head">
      <tr>
        <th>Name</th>
        <th>Required</th>
        <th>Description</th>
      </tr>
    </thead>,
    <tbody key="body">
      <tr>
        <td colSpan={2} style={{ verticalAlign: 5 }}>
          A
        </td>
        <td>B</td>
      </tr>
    </tbody>,
  ]);
  const a = within(table).getByText('A');
  a.setAttribute('colspan', '1');
  within(table).getByText('B').setAttribute('colspan', '2');
  applyTableContentSizing(table);
  expect(a).toHaveStyle({ verticalAlign: '5px' });
});

function ChangingAlignmentRows({ toCenter = false }: { toCenter?: boolean }) {
  const [changed, setChanged] = useState(false);
  return (
    <tr>
      <td>field</td>
      <td
        style={{
          textAlign: changed ? (toCenter ? 'center' : 'right') : 'left',
          verticalAlign: changed ? 'bottom' : 'top',
        }}
      >
        <button type="button" onClick={() => setChanged(!changed)}>
          {changed
            ? 'A longer description changes its authored alignment together with the visible text.'
            : 'Initial'}
        </button>
      </td>
    </tr>
  );
}

it('keeps the bottom edge on the last nonempty row group', () => {
  const table = renderNativeTable([
    <tbody key="body">
      <tr>
        <td rowSpan={2}>A</td>
        <td>B</td>
      </tr>
      <tr>
        <td>C</td>
      </tr>
    </tbody>,
    <tfoot key="footer" />,
  ]);
  const a = within(table).getByText('A');
  expect(a).toHaveAttribute('data-table-bottom-edge');
  applyTableContentSizing(table);
  expect(a).toHaveAttribute('data-table-bottom-edge');
});

it.each([false, true])(
  'preserves later authored alignment, including the active layout value (%s)',
  async (toCenter) => {
    const view = render(
      <DocsTable>
        <thead>
          <tr>
            <th>Name</th>
            <th>{toCenter ? 'Required' : 'Description'}</th>
          </tr>
        </thead>
        <tbody>
          <ChangingAlignmentRows toCenter={toCenter} />
        </tbody>
      </DocsTable>,
    );
    const button = within(view.container).getByRole('button');
    const cell = button.closest('td');
    expect(cell?.style.textAlign).toBe('left');
    expect(cell).toHaveStyle({
      textAlign: toCenter ? 'center' : 'left',
      verticalAlign: 'top',
    });
    fireEvent.click(button);
    await waitFor(() =>
      expect(cell).toHaveAttribute('data-table-column-size', 'prose'),
    );
    expect(cell?.style.textAlign).toBe(toCenter ? 'center' : 'right');
    expect(cell).toHaveStyle({
      textAlign: toCenter ? 'center' : 'right',
      verticalAlign: 'bottom',
    });
    fireEvent.click(button);
    await waitFor(() =>
      expect(cell).toHaveAttribute('data-table-column-size', 'compact'),
    );
    expect(cell?.style.textAlign).toBe('left');
    expect(cell).toHaveStyle({
      textAlign: toCenter ? 'center' : 'left',
      verticalAlign: 'top',
    });
  },
);

it.each([
  ['Name', 'Required', 'Description'],
  ['名称', '是否必填', '说明'],
])(
  'refreshes logical roles and authored alignment when %s row spans move',
  (name, required, description) => {
    const children = [
      <thead key="head">
        <tr>
          <th>{name}</th>
          <th>{required}</th>
          <th>{description}</th>
        </tr>
      </thead>,
      <tbody key="body">
        <tr>
          <td
            rowSpan={2}
            data-table-bottom-edge=""
            style={{ textAlign: 'right', verticalAlign: 'bottom' }}
          >
            A
          </td>
          <td style={{ textAlign: 'left', verticalAlign: 'top' }}>B</td>
          <td>C</td>
        </tr>
        <tr>
          <td style={{ textAlign: 'right' }}>
            <a href="/details">D</a>
          </td>
          <td>E</td>
        </tr>
      </tbody>,
    ];
    const table = renderNativeTable(children);
    const [a, b] = table.querySelectorAll<HTMLTableCellElement>(
      'tbody tr:first-child > td',
    );
    const d = table.querySelector<HTMLTableCellElement>(
      'tbody tr:last-child > td',
    );
    if (!d) throw new Error('Missing moved cell');
    const text = table.textContent;
    const link = table.querySelector('a');
    applyTableContentSizing(table);
    expect(d).toHaveAttribute('data-table-column', '1');
    expect(d).toHaveStyle({ textAlign: 'center' });
    a.rowSpan = 1;
    b.rowSpan = 2;
    applyTableContentSizing(table);
    expect(d).toHaveAttribute('data-table-column', '0');
    expect(d).toHaveAttribute('data-table-column-kind', 'name');
    expect(d).toHaveStyle({ textAlign: 'right' });
    expect(a).not.toHaveAttribute('data-table-bottom-edge');
    expect(b).toHaveAttribute('data-table-bottom-edge');
    expect(a).toHaveStyle({ textAlign: 'right', verticalAlign: 'bottom' });
    expect(b).toHaveStyle({ textAlign: 'center', verticalAlign: 'middle' });
    a.rowSpan = 2;
    b.rowSpan = 1;
    applyTableContentSizing(table);
    expect(d).toHaveAttribute('data-table-column', '1');
    expect(d).toHaveAttribute('data-table-column-kind', 'required');
    expect(d).toHaveStyle({ textAlign: 'center' });
    expect(a).toHaveStyle({ verticalAlign: 'middle' });
    expect(b).toHaveStyle({ verticalAlign: 'top' });
    expect(a).toHaveAttribute('data-table-bottom-edge');
    expect(b).not.toHaveAttribute('data-table-bottom-edge');
    expect(table.textContent).toBe(text);
    expect(table.querySelector('a')).toBe(link);
    expect(link).toHaveAttribute('href', '/details');
  },
);

it('restores logical roles and authored alignment when column spans move', () => {
  const table = renderNativeTable([
    <thead key="head">
      <tr>
        <th>Name</th>
        <th>Required</th>
        <th>Description</th>
      </tr>
    </thead>,
    <tbody key="body">
      <tr>
        <td colSpan={2} style={{ textAlign: 'right', verticalAlign: 'bottom' }}>
          A
        </td>
        <td style={{ textAlign: 'left', verticalAlign: 'top' }}>B</td>
      </tr>
    </tbody>,
  ]);
  const [a, b] = table.querySelectorAll<HTMLTableCellElement>('tbody td');
  applyTableContentSizing(table);
  a.colSpan = 1;
  b.colSpan = 2;
  applyTableContentSizing(table);
  expect(a).toHaveAttribute('data-table-column-kind', 'name');
  expect(a).toHaveStyle({ textAlign: 'right', verticalAlign: 'bottom' });
  expect(b).toHaveAttribute('data-table-column', '1');
  expect(b).not.toHaveAttribute('data-table-column-kind');
  expect(b).toHaveStyle({ textAlign: 'center', verticalAlign: 'middle' });
  a.colSpan = 2;
  b.colSpan = 1;
  applyTableContentSizing(table);
  expect(a).not.toHaveAttribute('data-table-column-kind');
  expect(a).toHaveStyle({ textAlign: 'center', verticalAlign: 'middle' });
  expect(b).toHaveAttribute('data-table-column', '2');
  expect(b).toHaveAttribute('data-table-column-kind', 'description');
  expect(b).toHaveStyle({ textAlign: 'left', verticalAlign: 'top' });
});

it('observes span changes while preserving declared column roles', async () => {
  const view = render(
    <DocsTable columns={['name', 'required', 'description']}>
      <thead>
        <tr>
          <th>First</th>
          <th>Second</th>
          <th>Third</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td rowSpan={2}>A</td>
          <td>B</td>
          <td>C</td>
        </tr>
        <tr>
          <td>D</td>
          <td>E</td>
        </tr>
      </tbody>
    </DocsTable>,
  );
  const table = within(view.container).getByRole('table');
  const a = within(table).getByText('A');
  const b = within(table).getByText('B');
  const d = within(table).getByText('D');
  await act(async () => {
    a.setAttribute('rowspan', '1');
    b.setAttribute('rowspan', '2');
  });
  await waitFor(() => expect(d).toHaveAttribute('data-table-column', '0'));
  expect(d).toHaveAttribute('data-table-column-kind', 'name');
  expect(d).not.toHaveStyle({ textAlign: 'center' });
  await act(async () => {
    a.setAttribute('rowspan', '2');
    b.setAttribute('rowspan', '1');
  });
  await waitFor(() => expect(d).toHaveAttribute('data-table-column', '1'));
  expect(d).toHaveAttribute('data-table-column-kind', 'required');
  expect(d).toHaveStyle({ textAlign: 'center' });
});

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

const referenceStyles = readFileSync('src/styles/reference.css', 'utf8');
const tableStyles = document.createElement('style');
beforeAll(() => {
  tableStyles.textContent = referenceStyles;
  document.head.append(tableStyles);
});
afterAll(() => tableStyles.remove());
