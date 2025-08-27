// import React, { useEffect, useMemo, useState } from 'react'
// import { api } from '../lib/api'
// import { TableToolbar } from '../components/TableTools'
// import { DataTable, Column } from '../components/DataTable'
// import { CrudModal } from '../components/CrudModal'
// import { useCan } from '../lib/permissions'
// import { EmptyPlaceholder, ErrorPlaceholder, LoadingPlaceholder } from '../components/Placeholder'

// interface Service { _id: string; name: string; description?: string; price?: number; durationMinutes?: number; isActive?: boolean; category?: string }

// export default function Services() {
//   const { canCreateService, canUpdateService, canDeleteService } = useCan()
//   const [items, setItems] = useState<Service[]>([])
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState<string | null>(null)
//   const [newItem, setNewItem] = useState<Partial<Service>>({ name: '', category: '', price: 0, durationMinutes: 30, isActive: true, description: '', icon: '' } as any)

//   // server-side table state
//   const [page, setPage] = useState(1)
//   const [limit, setLimit] = useState(10)
//   const [total, setTotal] = useState(0)
//   const [search, setSearch] = useState('')
//   const [sortBy, setSortBy] = useState<keyof Service | 'createdAt' | 'updatedAt'>('createdAt')
//   const [order, setOrder] = useState<'asc' | 'desc'>('desc')

//   const query = useMemo(() => {
//     const params = new URLSearchParams()
//     params.set('page', String(page))
//     params.set('limit', String(limit))
//     if (search.trim()) params.set('search', search.trim())
//     params.set('sortBy', String(sortBy))
//     params.set('order', order)
//     return `/services?${params.toString()}`
//   }, [page, limit, search, sortBy, order])

//   const load = async () => {
//     setLoading(true)
//     setError(null)
//     try {
//       const res = await api.get<any>(query)
//       // Backward compatibility: API may return an array
//       if (Array.isArray(res)) {
//         setItems(res)
//         setTotal(res.length)
//       } else {
//         setItems(res.items || [])
//         setTotal(res.total || 0)
//       }
//     } catch (e: any) {
//       setError(e?.message || 'Failed to load services')
//     } finally {
//       setLoading(false)
//     }
//   }
//   useEffect(() => { load() }, [query])

//   const toggleActive = async (id: string, current?: boolean) => {
//     const s = items.find(i => i._id === id)
//     if (!s) return
//     await api.put(`/services/${id}`, { ...s, isActive: !current })
//     await load()
//   }

//   const createItem = async () => {
//     if (!newItem.name) {
//       setError('Name is required')
//       return
//     }
//     try {
//       setError(null)
//       await api.post('/services', {
//         name: newItem.name,
//         description: newItem.description,
//         icon: (newItem as any).icon,
//         category: newItem.category,
//         price: newItem.price,
//         durationMinutes: newItem.durationMinutes,
//         isActive: newItem.isActive,
//       })
//       setNewItem({ name: '', category: '', price: 0, durationMinutes: 30, isActive: true, description: '', icon: '' } as any)
//       await load()
//     } catch (e: any) {
//       setError(e?.message || 'Failed to create service')
//     }
//   }

//   const updateInline = async (svc: Service, patch: Partial<Service>) => {
//     const payload = { ...svc, ...patch }
//     await api.put(`/services/${svc._id}`, payload)
//     await load()
//   }

//   const remove = async (id: string) => {
//     await api.delete(`/services/${id}`)
//     await load()
//   }

//   if (loading) return <LoadingPlaceholder label="Loading services..." />
//   if (error) return <ErrorPlaceholder message={error} />

//   return (
//     <div>
//       <TableToolbar title="Services" search={search} setSearch={(v) => { setPage(1); setSearch(v) }} onRefresh={load} onExport={() => {
//         const headers = Object.keys(items[0] || {})
//         const csv = [headers.join(',')].concat(items.map((r: any) => headers.map(h => JSON.stringify(r[h] ?? '')).join(','))).join("\n")
//         const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
//         const url = URL.createObjectURL(blob)
//         const a = document.createElement('a')
//         a.href = url
//         a.download = 'services.csv'
//         a.click()
//         URL.revokeObjectURL(url)
//       }} />
//       <div className="card" style={{ marginBottom: 12 }}>
//         <div style={{ fontWeight: 600, marginBottom: 8 }}>Add service</div>
//         <div className="grid" style={{ gridTemplateColumns: '1.2fr 1fr 0.8fr 0.8fr 0.8fr 1fr 1fr', gap: 8, alignItems: 'end' }}>
//           <div className="field">
//             <label>Name</label>
//             <input placeholder="e.g., Tyre Service" value={newItem.name || ''} onChange={e => setNewItem({ ...newItem, name: e.target.value })} aria-label="Service name" />
//           </div>
//           <div className="field">
//             <label>Category</label>
//             <input placeholder="Two Wheeler / Four Wheeler" value={newItem.category || ''} onChange={e => setNewItem({ ...newItem, category: e.target.value })} aria-label="Service category" />
//           </div>
//           <div className="field">
//             <label>Icon (emoji/url)</label>
//             <input placeholder="https://... or 😀" value={(newItem as any).icon || ''} onChange={e => setNewItem({ ...newItem, icon: e.target.value } as any)} aria-label="Service icon (emoji or image URL)" />
//           </div>
//           <div className="field">
//             <label>Price</label>
//             <input type="number" placeholder="e.g., 1499" value={Number(newItem.price || 0)} onChange={e => setNewItem({ ...newItem, price: Number(e.target.value) })} aria-label="Service price in INR" />
//           </div>
//           <div className="field">
//             <label>Duration (min)</label>
//             <input type="number" placeholder="e.g., 120" value={Number(newItem.durationMinutes || 0)} onChange={e => setNewItem({ ...newItem, durationMinutes: Number(e.target.value) })} aria-label="Estimated duration in minutes" />
//           </div>
//           <div className="field">
//             <label>Status</label>
//             <select value={String(newItem.isActive)} onChange={e => setNewItem({ ...newItem, isActive: e.target.value === 'true' })} aria-label="Service status selector">
//               <option value="true">active</option>
//               <option value="false">inactive</option>
//             </select>
//           </div>
//           <div className="field">
//             <label>Description</label>
//             <input placeholder="Short description shown on site" value={newItem.description || ''} onChange={e => setNewItem({ ...newItem, description: e.target.value })} aria-label="Service description" />
//           </div>
//           <button className="btn primary" onClick={createItem} disabled={!newItem.name || !canCreateService} title={!canCreateService ? 'Insufficient permission' : ''} aria-label="Create new service">Create</button>
//         </div>
//       </div>
//       {items.length === 0 ? (
//         <EmptyPlaceholder title="No services" message="Use the form above to add your first service." />
//       ) : (
//       <DataTable
//         columns={[
//           { key: 'name', header: 'Name', sortable: true, render: (s: Service) => <input value={s.name} onChange={e => canUpdateService && updateInline(s, { name: e.target.value })} disabled={!canUpdateService} title={!canUpdateService ? 'Insufficient permission' : ''} /> },
//           { key: 'category', header: 'Category', render: (s: Service) => <input value={s.category || ''} onChange={e => canUpdateService && updateInline(s, { category: e.target.value })} disabled={!canUpdateService} title={!canUpdateService ? 'Insufficient permission' : ''} /> },
//           { key: 'price', header: 'Price', sortable: true, render: (s: Service) => <input type="number" value={Number(s.price || 0)} onChange={e => canUpdateService && updateInline(s, { price: Number(e.target.value) })} disabled={!canUpdateService} title={!canUpdateService ? 'Insufficient permission' : ''} /> },
//           { key: 'durationMinutes', header: 'Duration', sortable: true, render: (s: Service) => <span><input type="number" value={Number(s.durationMinutes || 0)} onChange={e => canUpdateService && updateInline(s, { durationMinutes: Number(e.target.value) })} disabled={!canUpdateService} title={!canUpdateService ? 'Insufficient permission' : ''} /> min</span> },
//           { key: 'isActive', header: 'Status', render: (s: Service) => (
//             <select value={String(s.isActive)} onChange={e => canUpdateService && updateInline(s, { isActive: e.target.value === 'true' })} disabled={!canUpdateService} title={!canUpdateService ? 'Insufficient permission' : ''}>
//               <option value="true">active</option>
//               <option value="false">inactive</option>
//             </select>
//           ) },
//           { key: 'actions', header: '', render: (s: Service) => (
//             <div style={{ display: 'flex', gap: 8 }}>
//               <button className="btn" onClick={() => canUpdateService && toggleActive(s._id, s.isActive)} disabled={!canUpdateService} title={!canUpdateService ? 'Insufficient permission' : ''}>Toggle</button>
//               <button className="btn" onClick={() => canDeleteService && remove(s._id)} disabled={!canDeleteService} title={!canDeleteService ? 'Insufficient permission' : ''}>Delete</button>
//             </div>
//           ) },
//         ] as Column<Service>[]}
//         rows={items}
//         onSort={(key) => { setSortBy(key as any); setOrder(prev => (sortBy === key && prev === 'asc') ? 'desc' : 'asc') }}
//         sortBy={sortBy as string}
//         order={order}
//         pagination={{ page, limit, total, onPageChange: (p) => setPage(Math.max(1, p)), onLimitChange: (n) => { setPage(1); setLimit(n) } }}
//       />
//       )}

//       <CrudModal open={false} title="" onClose={() => {}}>{null}</CrudModal>
//     </div>
//   )
// }

import React, { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { TableToolbar } from '../components/TableTools'
import { DataTable, Column } from '../components/DataTable'
import { CrudModal } from '../components/CrudModal'
import { useCan } from '../lib/permissions'
import { EmptyPlaceholder, ErrorPlaceholder, LoadingPlaceholder } from '../components/Placeholder'

interface Service {
  _id: string
  name: string
  description?: string
  price?: number
  durationMinutes?: number
  isActive?: boolean
  category?: string
  icon?: string
}

const BASE_URL = 'http://localhost:5000/api/services'

export default function Services() {
  const { canCreateService, canUpdateService, canDeleteService } = useCan()
  const [items, setItems] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newItem, setNewItem] = useState<Partial<Service>>({
    name: '',
    category: '',
    price: 0,
    durationMinutes: 30,
    isActive: true,
    description: '',
    icon: '',
  })

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
    return `${BASE_URL}?${params.toString()}`
  }, [page, limit, search, sortBy, order])

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await axios.get(query)
      const data = res.data
      if (Array.isArray(data)) {
        setItems(data)
        setTotal(data.length)
      } else {
        setItems(data.items || [])
        setTotal(data.total || 0)
      }
    } catch (e: any) {
      setError(e?.response?.data?.message || e.message || 'Failed to load services')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [query])

  const toggleActive = async (id: string, current?: boolean) => {
    const s = items.find(i => i._id === id)
    if (!s) return
    await axios.put(`${BASE_URL}/${id}`, { ...s, isActive: !current })
    await load()
  }

  const createItem = async () => {
    if (!newItem.name) {
      setError('Name is required')
      return
    }
    try {
      setError(null)
      await axios.post(BASE_URL, newItem)
      setNewItem({ name: '', category: '', price: 0, durationMinutes: 30, isActive: true, description: '', icon: '' })
      await load()
    } catch (e: any) {
      setError(e?.response?.data?.message || e.message || 'Failed to create service')
    }
  }

  const updateInline = async (svc: Service, patch: Partial<Service>) => {
    const payload = { ...svc, ...patch }
    await axios.put(`${BASE_URL}/${svc._id}`, payload)
    await load()
  }

  const remove = async (id: string) => {
    await axios.delete(`${BASE_URL}/${id}`)
    await load()
  }

  if (loading) return <LoadingPlaceholder label="Loading services..." />
  if (error) return <ErrorPlaceholder message={error} />

  return (
    <div>
      <TableToolbar
        title="Services"
        search={search}
        setSearch={(v) => { setPage(1); setSearch(v) }}
        onRefresh={load}
        onExport={() => {
          const headers = Object.keys(items[0] || {})
          const csv = [headers.join(',')].concat(items.map((r: any) => headers.map(h => JSON.stringify(r[h] ?? '')).join(','))).join("\n")
          const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = 'services.csv'
          a.click()
          URL.revokeObjectURL(url)
        }}
      />
      <div className="card" style={{ marginBottom: 12 }}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>Add service</div>
        <div className="grid" style={{ gridTemplateColumns: '1.2fr 1fr 0.8fr 0.8fr 0.8fr 1fr 1fr', gap: 8, alignItems: 'end' }}>
          {/* Name */}
          <div className="field">
            <label>Name</label>
            <input value={newItem.name || ''} onChange={e => setNewItem({ ...newItem, name: e.target.value })} />
          </div>
          {/* Category */}
          <div className="field">
            <label>Category</label>
            <input value={newItem.category || ''} onChange={e => setNewItem({ ...newItem, category: e.target.value })} />
          </div>
          {/* Icon */}
          <div className="field">
            <label>Icon</label>
            <input value={newItem.icon || ''} onChange={e => setNewItem({ ...newItem, icon: e.target.value })} />
          </div>
          {/* Price */}
          <div className="field">
            <label>Price</label>
            <input type="number" value={newItem.price || 0} onChange={e => setNewItem({ ...newItem, price: Number(e.target.value) })} />
          </div>
          {/* Duration */}
          <div className="field">
            <label>Duration</label>
            <input type="number" value={newItem.durationMinutes || 0} onChange={e => setNewItem({ ...newItem, durationMinutes: Number(e.target.value) })} />
          </div>
          {/* Status */}
          <div className="field">
            <label>Status</label>
            <select value={String(newItem.isActive)} onChange={e => setNewItem({ ...newItem, isActive: e.target.value === 'true' })}>
              <option value="true">active</option>
              <option value="false">inactive</option>
            </select>
          </div>
          {/* Description */}
          <div className="field">
            <label>Description</label>
            <input value={newItem.description || ''} onChange={e => setNewItem({ ...newItem, description: e.target.value })} />
          </div>
          <button className="btn primary" onClick={createItem} disabled={!newItem.name || !canCreateService}>Create</button>
        </div>
      </div>

      {/* Table */}
      {items.length === 0 ? (
        <EmptyPlaceholder title="No services" message="Use the form above to add your first service." />
      ) : (
        <DataTable
          columns={[
            { key: 'name', header: 'Name', sortable: true, render: (s) => <input value={s.name} onChange={e => updateInline(s, { name: e.target.value })} disabled={!canUpdateService} /> },
            { key: 'category', header: 'Category', render: (s) => <input value={s.category || ''} onChange={e => updateInline(s, { category: e.target.value })} disabled={!canUpdateService} /> },
            { key: 'price', header: 'Price', sortable: true, render: (s) => <input type="number" value={s.price || 0} onChange={e => updateInline(s, { price: Number(e.target.value) })} disabled={!canUpdateService} /> },
            { key: 'durationMinutes', header: 'Duration', sortable: true, render: (s) => <span><input type="number" value={s.durationMinutes || 0} onChange={e => updateInline(s, { durationMinutes: Number(e.target.value) })} disabled={!canUpdateService} /> min</span> },
            { key: 'isActive', header: 'Status', render: (s) => (
              <select value={String(s.isActive)} onChange={e => updateInline(s, { isActive: e.target.value === 'true' })} disabled={!canUpdateService}>
                <option value="true">active</option>
                <option value="false">inactive</option>
              </select>
            ) },
            { key: 'actions', header: '', render: (s) => (
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn" onClick={() => toggleActive(s._id, s.isActive)} disabled={!canUpdateService}>Toggle</button>
                <button className="btn" onClick={() => remove(s._id)} disabled={!canDeleteService}>Delete</button>
              </div>
            ) },
          ] as Column<Service>[]}
          rows={items}
          onSort={(key) => { setSortBy(key as any); setOrder(prev => (sortBy === key && prev === 'asc') ? 'desc' : 'asc') }}
          sortBy={sortBy as string}
          order={order}
          pagination={{ page, limit, total, onPageChange: (p) => setPage(Math.max(1, p)), onLimitChange: (n) => { setPage(1); setLimit(n) } }}
        />
      )}

      <CrudModal open={false} title="" onClose={() => {}}>{null}</CrudModal>
    </div>
  )
}


