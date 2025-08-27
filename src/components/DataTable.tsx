import React from 'react'

export type Column<T> = {
  key: keyof T | string
  header: string
  width?: string | number
  render?: (row: T) => React.ReactNode
  sortable?: boolean
}

export type Pagination = {
  page: number
  limit: number
  total: number
  onPageChange: (p: number) => void
  onLimitChange: (n: number) => void
}

export function DataTable<T extends { _id?: string | number }>(
  { columns, rows, pagination, onSort, sortBy, order }: {
    columns: Column<T>[]
    rows: T[]
    pagination?: Pagination
    onSort?: (key: string) => void
    sortBy?: string
    order?: 'asc' | 'desc'
  }
) {
  return (
    <div className="card">
      <table className="table">
        <thead>
          <tr>
            {columns.map(col => (
              <th key={String(col.key)} style={{ width: col.width, cursor: col.sortable ? 'pointer' : 'default' }} onClick={() => col.sortable && onSort?.(String(col.key))}>
                {col.header} {col.sortable && sortBy === col.key && (order === 'asc' ? '▲' : '▼')}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={(row as any)._id || idx}>
              {columns.map(col => (
                <td key={String(col.key)}>
                  {col.render ? col.render(row) : String((row as any)[col.key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {pagination && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
          <div>
            <label htmlFor="rows-per-page">Rows per page: </label>
            <select id="rows-per-page" value={pagination.limit} onChange={e => pagination.onLimitChange(Number(e.target.value))} aria-label="Rows per page selector">
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button className="btn" disabled={pagination.page <= 1} onClick={() => pagination.onPageChange(pagination.page - 1)} aria-label="Go to previous page">Prev</button>
            <span aria-live="polite">Page {pagination.page} of {Math.max(1, Math.ceil(pagination.total / pagination.limit))}</span>
            <button className="btn" disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)} onClick={() => pagination.onPageChange(pagination.page + 1)} aria-label="Go to next page">Next</button>
          </div>
          <div>
            <span aria-label="Total row count">Total: {pagination.total}</span>
          </div>
        </div>
      )}
    </div>
  )
}


