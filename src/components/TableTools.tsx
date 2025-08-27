import { useMemo, useState } from 'react'

export function useTableTools<T>(rows: T[], selectors: { searchText?: (row: T) => string; sortKey?: (row: T) => string | number }, initialSort: 'asc' | 'desc' = 'asc') {
  const [search, setSearch] = useState('')
  const [sortDir, setSortDir] = useState<'asc'|'desc'>(initialSort)

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    let out = rows
    if (term && selectors.searchText) {
      out = rows.filter(r => selectors.searchText!(r).toLowerCase().includes(term))
    }
    if (selectors.sortKey) {
      out = [...out].sort((a, b) => {
        const va = selectors.sortKey!(a)
        const vb = selectors.sortKey!(b)
        if (va < vb) return sortDir === 'asc' ? -1 : 1
        if (va > vb) return sortDir === 'asc' ? 1 : -1
        return 0
      })
    }
    return out
  }, [rows, search, selectors, sortDir])

  const exportCSV = (filename = 'export.csv') => {
    const headers = Object.keys(rows[0] || {})
    const csv = [headers.join(',')].concat(filtered.map((r: any) => headers.map(h => JSON.stringify(r[h] ?? '')).join(','))).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  return { filtered, search, setSearch, sortDir, setSortDir, exportCSV }
}

export function TableToolbar({ title, search, setSearch, onRefresh, onExport }: { title: string; search: string; setSearch: (v: string) => void; onRefresh: () => void; onExport: () => void }) {
  return (
    <div className="toolbar">
      <h2>{title}</h2>
      <div style={{ display: 'flex', gap: 8 }}>
        <input placeholder="Search by name, id, or text" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search table rows" />
        <button className="btn" onClick={onRefresh} title="Reload the latest data from the server" aria-label="Refresh table data">Refresh</button>
        <button className="btn" onClick={onExport} title="Download the current table as a CSV file" aria-label="Export table as CSV">Export CSV</button>
      </div>
    </div>
  )
}


