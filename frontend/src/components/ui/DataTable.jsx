import { Loader2 } from 'lucide-react';
import EmptyState from './EmptyState';

export default function DataTable({
  columns,
  rows,
  loading = false,
  emptyTitle = 'Aucune donnée',
  emptyDescription,
  renderCell,
}) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 auth-card flex justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!rows?.length) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 auth-card overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-bg-page/50">
            {columns.map((col) => (
              <th
                key={col.key || col}
                className="text-left px-4 py-3 font-semibold text-text-dark whitespace-nowrap"
              >
                {col.label || col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={row.id || row.id_candidature || row.id_offre || i}
              className="border-b border-gray-50 hover:bg-bg-page/30 transition-colors"
            >
              {columns.map((col) => {
                const key = col.key || col;
                const value = col.render
                  ? col.render(row)
                  : renderCell
                    ? renderCell(row, key)
                    : row[key];
                return (
                  <td key={key} className="px-4 py-3 text-text-secondary">
                    {value ?? '—'}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
