type Col<T> = {
  name: string;
  key: keyof T | ((item: T) => any);
  className?: string;
};
export type Cols<T> = Col<T>[];
export function Table<T>({
  cols,
  data = [],
}: {
  cols: Cols<T>;
  data?: readonly any[];
}) {
  return (
    <table className="w-full bg-transparent border-collapse">
      <thead className="thead-light">
        <tr>
          {cols.map(col => (
            <th
              key={col.name}
              className={`px-6 bg-light text-dark align-middle border border-solid border-light py-3 text-xs uppercase border-l-0 border-r-0 whitespace-no-wrap font-semibold text-left ${col.className ||
                ''}`}
            >
              {col.name}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="border-t-2 border-primary">
        {data.map((row, rowI) => (
          <tr key={row.id}>
            {cols.map(col => {
              const Key = col.key;
              return (
                <td
                  key={col.name}
                  className={`border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-no-wrap p-4 text-left ${
                    rowI % 2 !== 0 ? 'bg-light' : ''
                  } ${col.className || ''}`}
                >
                  {typeof Key === 'function' ? <Key {...row} /> : row[Key]}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
