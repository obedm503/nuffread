type Col<T> = { name: string; key: keyof T | ((item: T) => any) };
export type Cols<T> = Col<T>[];
export function Table<T>({
  title,
  cols,
  data = [],
}: {
  title: string;
  cols: Cols<T>;
  data?: readonly any[];
}) {
  return (
    <div className="w-full px-4">
      <div className="min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded">
        <div className="rounded-t mb-0 px-4 py-3 border-0">
          <div className="relative w-full px-4">
            <h3 className="font-semibold text-base text-dark">{title}</h3>
          </div>
        </div>
        <div className="block w-full overflow-x-auto">
          <table className="w-full bg-transparent border-collapse">
            <thead className="thead-light">
              <tr>
                {cols.map(col => (
                  <th
                    key={col.name}
                    className="px-6 bg-light text-dark align-middle border border-solid border-light py-3 text-xs uppercase border-l-0 border-r-0 whitespace-no-wrap font-semibold text-left"
                  >
                    {col.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map(row => (
                <tr key={row.id}>
                  {cols.map(col => (
                    <td
                      key={col.name}
                      className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-no-wrap p-4 text-left"
                    >
                      {typeof col.key === 'function'
                        ? col.key(row)
                        : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
