import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { TableToolbar, useTableTools } from '../components/TableTools'

interface Service { _id: string; name: string; description?: string; price?: number; durationMinutes?: number; isActive?: boolean; category?: string }

export default function Services() {
  const [items, setItems] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const list = await api.get<Service[]>('/services')
      setItems(list)
    } catch (e: any) {
      setError(e?.message || 'Failed to load services')
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { load() }, [])

  const toggleActive = async (id: string, current?: boolean) => {
    const s = items.find(i => i._id === id)
    if (!s) return
    await api.put(`/services/${id}`, { ...s, isActive: !current })
    await load()
  }

  const tools = useTableTools(items, { searchText: (s) => `${s.name} ${s.category || ''}`, sortKey: (s) => s.name || '' })
  if (loading) return <div>Loading...</div>
  if (error) return <div className="card" style={{ color: '#b91c1c', background: '#fef2f2' }}>{error}</div>

  return (
    <div>
      <TableToolbar title="Services" search={tools.search} setSearch={tools.setSearch} onRefresh={load} onExport={() => tools.exportCSV('services.csv')} />
      <div className="card">
        <table className="table">
          <thead>
            <tr><th>Name</th><th>Category</th><th>Price</th><th>Duration</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            {tools.filtered.map(s => (
              <tr key={s._id}>
                <td>{s.name}</td>
                <td>{s.category}</td>
                <td>{s.price}</td>
                <td>{s.durationMinutes} min</td>
                <td><span className="badge">{s.isActive ? 'active' : 'inactive'}</span></td>
                <td><button className="btn" onClick={() => toggleActive(s._id, s.isActive)}>Toggle</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}


