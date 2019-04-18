import * as React from 'react';
import { Callable, callable } from '../util';

type Label =
  | string
  | {
      (): any;
    };

const TBody: React.SFC<{
  idKey?: string;
  label?: Label;
  cols: Col[];
  rows: any[];
}> = ({ idKey, label, cols, rows }) => (
  <tbody>
    {label && (
      <tr>
        <th colSpan={cols.length}>{callable(label)}</th>
      </tr>
    )}
    {rows.map(row => (
      <tr key={row[idKey || 'id']}>
        {cols.map((col, i) => (
          <td key={i} className={callable(col.className, row)}>
            {row &&
              (typeof col.value === 'function'
                ? col.value(row)
                : row[col.value])}
          </td>
        ))}
      </tr>
    ))}
  </tbody>
);

type Value<T> =
  | keyof T
  | {
      (props: T): any;
    };

export type Col<T = any> = {
  label?: Label;
  value: Value<T>;
  className?: Callable<string, T | undefined>;
};

type Section = { label?: Label; rows: any[] };
type Props = {
  cols: Col[];
  idKey?: string;
  rows?: any[];
  sections?: Array<Section>;
};

export const Table: React.SFC<Props> = ({
  idKey,
  cols,
  rows: inputData,
  sections,
}) => {
  const labels = (
    <tr>
      {cols.map((col, i) => (
        <th key={i} className={callable(col.className)}>
          {col.label && callable(col.label)}
        </th>
      ))}
    </tr>
  );

  let body;
  let length: number = 0;
  if (Array.isArray(sections)) {
    length = sections
      .map(({ rows }) => rows.length)
      .reduce((acc, n) => acc + n, 0);
    body = sections.map(({ label, rows }: Section, i) => (
      <TBody key={i} cols={cols} rows={rows} label={label} idKey={idKey} />
    ));
  } else if (Array.isArray(inputData)) {
    length = inputData.length;
    body = <TBody cols={cols} rows={inputData as any[]} idKey={idKey} />;
  }

  return (
    <div className="table-container">
      <table className="table">
        <thead>{labels}</thead>
        {length > 10 ? <tfoot>{labels}</tfoot> : null}
        {body}
      </table>
    </div>
  );
};
