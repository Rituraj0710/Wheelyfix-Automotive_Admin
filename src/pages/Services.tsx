import React, { useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api'
import { TableToolbar } from '../components/TableTools'
import { DataTable, Column } from '../components/DataTable'
import { CrudModal } from '../components/CrudModal'
import { useCan } from '../lib/permissions'

interface Service { _id: string; name: string; description?: string; price?: number; durationMinutes?: number; isActive?: boolean; category?: string }

export default function Services() {
  const { canCreateService, canUpdateService, canDeleteService } = useCan()
  const [items, setItems] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newItem, setNewItem] = useState<Partial<Service>>({ name: '', category: '', price: 0, durationMinutes: 30, isActive: true, description: '', icon: '' } as any)

  // server-side table state
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<keyof Service | 'createdAt' | 'updatedAt'>('createdAt')
  const [order, setOrder] = useState<'asc' | 'desc'>('desc')

  const query = useMemo(() => {
    const params = new URLSearchParams()
    params.set('page', String(page))
    params.set('limit', String(limit))
    if (search.trim()) params.set('search', search.trim())
    params.set('sortBy', String(sortBy))
    params.set('order', order)
    return `/services?${params.toString()}`
  }, [page, limit, search, sortBy, order])

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get<any>(query)
      // Backward compatibility: API may return an array
      if (Array.isArray(res)) {
        setItems(res)
        setTotal(res.length)
      } else {
        setItems(res.items || [])
        setTotal(res.total || 0)
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to load services')
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { load() }, [query])

  const toggleActive = async (id: string, current?: boolean) => {
    const s = items.find(i => i._id === id)
    if (!s) return
    await api.put(`/services/${id}`, { ...s, isActive: !current })
    await load()
  }

  const createItem = async () => {
    if (!newItem.name) {
      setError('Name is required')
      return
    }
    try {
      setError(null)
      await api.post('/services', {
        name: newItem.name,
        description: newItem.description,
        icon: (newItem as any).icon,
        category: newItem.category,
        price: newItem.price,
        durationMinutes: newItem.durationMinutes,
        isActive: newItem.isActive,
      })
      setNewItem({ name: '', category: '', price: 0, durationMinutes: 30, isActive: true, description: '', icon: '' } as any)
      await load()
    } catch (e: any) {
      setError(e?.message || 'Failed to create service')
    }
  }

  const updateInline = async (svc: Service, patch: Partial<Service>) => {
    const payload = { ...svc, ...patch }
    await api.put(`/services/${svc._id}`, payload)
    await load()
  }

  const remove = async (id: string) => {
    await api.delete(`/services/${id}`)
    await load()
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div className="card" style={{ color: '#b91c1c', background: '#fef2f2' }}>{error}</div>

  return (
    <div>
      <TableToolbar title="Services" search={search} setSearch={(v) => { setPage(1); setSearch(v) }} onRefresh={load} onExport={() => {
        const headers = Object.keys(items[0] || {})
        const csv = [headers.join(',')].concat(items.map((r: any) => headers.map(h => JSON.stringify(r[h] ?? '')).join(','))).join("\n")
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'services.csv'
        a.click()
        URL.revokeObjectURL(url)
      }} />
      <div className="card" style={{ marginBottom: 12 }}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>Add service</div>
        <div className="grid" style={{ gridTemplateColumns: '1.2fr 1fr 0.8fr 0.8fr 0.8fr 1fr 1fr', gap: 8, alignItems: 'end' }}>
          <div className="field">
            <label>Name</label>
            <input value={newItem.name || ''} onChange={e => setNewItem({ ...newItem, name: e.target.value })} />
          </div>
          <div className="field">
            <label>Category</label>
            <input value={newItem.category || ''} onChange={e => setNewItem({ ...newItem, category: e.target.value })} />
          </div>
          <div className="field">
            <label>Icon (emoji/url)</label>
            <input value={(newItem as any).icon || ''} onChange={e => setNewItem({ ...newItem, icon: e.target.value } as any)} />
          </div>
          <div className="field">
            <label>Price</label>
            <input type="number" value={Number(newItem.price || 0)} onChange={e => setNewItem({ ...newItem, price: Number(e.target.value) })} />
          </div>
          <div className="field">
            <label>Duration (min)</label>
            <input type="number" value={Number(newItem.durationMinutes || 0)} onChange={e => setNewItem({ ...newItem, durationMinutes: Number(e.target.value) })} />
          </div>
          <div className="field">
            <label>Status</label>
            <select value={String(newItem.isActive)} onChange={e => setNewItem({ ...newItem, isActive: e.target.value === 'true' })}>
              <option value="true">active</option>
              <option value="false">inactive</option>
            </select>
          </div>
          <div className="field">
            <label>Description</label>
            <input value={newItem.description || ''} onChange={e => setNewItem({ ...newItem, description: e.target.value })} />
          </div>
          <button className="btn primary" onClick={createItem} disabled={!newItem.name || !canCreateService} title={!canCreateService ? 'Insufficient permission' : ''}>Create</button>
        </div>
      </div>
      <DataTable
        columns={[
          { key: 'name', header: 'Name', sortable: true, render: (s: Service) => <input value={s.name} onChange={e => canUpdateService && updateInline(s, { name: e.target.value })} disabled={!canUpdateService} title={!canUpdateService ? 'Insufficient permission' : ''} /> },
          { key: 'category', header: 'Category', render: (s: Service) => <input value={s.category || ''} onChange={e => canUpdateService && updateInline(s, { category: e.target.value })} disabled={!canUpdateService} title={!canUpdateService ? 'Insufficient permission' : ''} /> },
          { key: 'price', header: 'Price', sortable: true, render: (s: Service) => <input type="number" value={Number(s.price || 0)} onChange={e => canUpdateService && updateInline(s, { price: Number(e.target.value) })} disabled={!canUpdateService} title={!canUpdateService ? 'Insufficient permission' : ''} /> },
          { key: 'durationMinutes', header: 'Duration', sortable: true, render: (s: Service) => <span><input type="number" value={Number(s.durationMinutes || 0)} onChange={e => canUpdateService && updateInline(s, { durationMinutes: Number(e.target.value) })} disabled={!canUpdateService} title={!canUpdateService ? 'Insufficient permission' : ''} /> min</span> },
          { key: 'isActive', header: 'Status', render: (s: Service) => (
            <select value={String(s.isActive)} onChange={e => canUpdateService && updateInline(s, { isActive: e.target.value === 'true' })} disabled={!canUpdateService} title={!canUpdateService ? 'Insufficient permission' : ''}>
              <option value="true">active</option>
              <option value="false">inactive</option>
            </select>
          ) },
          { key: 'actions', header: '', render: (s: Service) => (
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn" onClick={() => canUpdateService && toggleActive(s._id, s.isActive)} disabled={!canUpdateService} title={!canUpdateService ? 'Insufficient permission' : ''}>Toggle</button>
              <button className="btn" onClick={() => canDeleteService && remove(s._id)} disabled={!canDeleteService} title={!canDeleteService ? 'Insufficient permission' : ''}>Delete</button>
            </div>
          ) },
        ] as Column<Service>[]}
        rows={items}
        onSort={(key) => { setSortBy(key as any); setOrder(prev => (sortBy === key && prev === 'asc') ? 'desc' : 'asc') }}
        sortBy={sortBy as string}
        order={order}
        pagination={{ page, limit, total, onPageChange: (p) => setPage(Math.max(1, p)), onLimitChange: (n) => { setPage(1); setLimit(n) } }}
      />

      <CrudModal open={false} title="" onClose={() => {}}>{null}</CrudModal>
    </div>
  )
}


