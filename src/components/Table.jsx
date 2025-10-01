export default function Table({ columns = [], data = [], empty = 'No data' }) {
  return (
    <div className="overflow-x-auto border border-gray-200 rounded-lg bg-white">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((c) => (
              <th key={c.key || c.header} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.length === 0 && (
            <tr>
              <td className="px-4 py-6 text-center text-gray-500" colSpan={columns.length}>{empty}</td>
            </tr>
          )}
          {data.map((row) => (
            <tr key={row.id || JSON.stringify(row)} className="hover:bg-gray-50">
              {columns.map((c) => (
                <td key={c.key || c.header} className="px-4 py-3 whitespace-nowrap">
                  {c.render ? c.render(row) : row[c.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
