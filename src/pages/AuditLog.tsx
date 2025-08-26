import React, { useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api'
import { DataTable, Column } from '../components/DataTable'
import { TableToolbar } from '../components/TableTools'

interface AuditItem { _id: string; actorEmail?: string; action: string; entity: string; entityId: string; createdAt: string; metadata?: any }

export default function AuditLogPage() {
  const [items, setItems] = useState<AuditItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')

  const query = useMemo(() => {
    const params = new URLSearchParams()
    params.set('page', String(page))
    params.set('limit', String(limit))
    if (search.trim()) params.set('entity', search.trim())
    return `/audit?${params.toString()}`
  }, [page, limit, search])

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get<any>(query)
      if (Array.isArray(res)) {
        setItems(res)
        setTotal(res.length)
      } else {
        setItems(res.items || [])
        setTotal(res.total || 0)
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to load audit logs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [query])

  if (loading) return <div>Loading...</div>
  if (error) return <div className="card" style={{ color: '#b91c1c', background: '#fef2f2' }}>{error}</div>

  return (
    <div>
      <TableToolbar title="Audit Log" search={search} setSearch={(v) => { setPage(1); setSearch(v) }} onRefresh={load} onExport={() => {
        const headers = ['createdAt','actorEmail','action','entity','entityId']
        const csv = [headers.join(',')].concat(items.map((r: any) => headers.map(h => JSON.stringify(r[h] ?? '')).join(','))).join("\n")
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'audit.csv'
        a.click()
        URL.revokeObjectURL(url)
      }} />

      <DataTable
        columns={[
          { key: 'createdAt', header: 'Time', render: (r: AuditItem) => new Date(r.createdAt).toLocaleString(), sortable: false },
          { key: 'actorEmail', header: 'Actor' },
          { key: 'action', header: 'Action' },
          { key: 'entity', header: 'Entity' },
          { key: 'entityId', header: 'Entity ID' },
        ] as Column<AuditItem>[]}
        rows={items}
        pagination={{ page, limit, total, onPageChange: (p) => setPage(Math.max(1, p)), onLimitChange: (n) => { setPage(1); setLimit(n) } }}
      />
    </div>
  )
}


