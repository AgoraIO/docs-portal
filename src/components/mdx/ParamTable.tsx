import type { ReactNode } from 'react';

type ParamTableProps = {
  children: ReactNode;
};

type ParamTableRowProps = {
  children: ReactNode;
  field: ReactNode;
  type?: ReactNode;
};

function ParamTableRoot({ children }: ParamTableProps) {
  return (
    <table data-param-table="">
      <thead>
        <tr>
          <th>Field</th>
          <th>Type</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  );
}

function ParamTableRow({ children, field, type }: ParamTableRowProps) {
  return (
    <tr>
      <td>
        <code>{field}</code>
      </td>
      <td>{type}</td>
      <td className="param-table-description">{children}</td>
    </tr>
  );
}

export const ParamTable = Object.assign(ParamTableRoot, {
  Row: ParamTableRow,
});
