import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { EmptyPlaceholder, ErrorPlaceholder, LoadingPlaceholder } from '../components/Placeholder'
import { TableToolbar, useTableTools } from '../components/TableTools'

interface Booking { _id: string; name: string; email: string; phoneNumber: string; vehicleType: string; vehicleModel: string; serviceType: string; date: string; timeSlot: string; status: 'upcoming'|'completed'|'cancelled'; createdAt: string }

export default function Bookings() {
  const [items, setItems] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const list = await api.get<Booking[]>('/bookings')
      setItems(list)
    } catch (e: any) {
      setError(e?.message || 'Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { load() }, [])

  const changeStatus = async (id: string, status: Booking['status']) => {
    await api.put(`/bookings/${id}/status`, { status })
    await load()
  }

  const tools = useTableTools(items, { searchText: (b) => `${b.name} ${b.email} ${b.serviceType}`, sortKey: (b) => new Date(b.createdAt).getTime() }, 'desc')
  if (loading) return <LoadingPlaceholder label="Loading bookings..." />
  if (error) return <ErrorPlaceholder message={error} />

  return (
    <div>
      <TableToolbar title="Bookings" search={tools.search} setSearch={tools.setSearch} onRefresh={load} onExport={() => tools.exportCSV('bookings.csv')} />
      <div className="card">
        {tools.filtered.length === 0 ? (
          <EmptyPlaceholder title="No bookings found" message="Try refreshing or adjusting your search." />
        ) : (
        <table className="table">
          <thead>
            <tr><th>Customer</th><th>Vehicle</th><th>Service</th><th>Date</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            {tools.filtered.map(b => (
              <tr key={b._id}>
                <td>
                  <div>{b.name}</div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>{b.email} • {b.phoneNumber}</div>
                </td>
                <td>{b.vehicleType} {b.vehicleModel}</td>
                <td>{b.serviceType}</td>
                <td>{new Date(b.date).toLocaleString()}</td>
                <td><span className="badge">{b.status}</span></td>
                <td>
                  <select value={b.status} onChange={(e) => changeStatus(b._id, e.target.value as Booking['status'])} aria-label="Change booking status">
                    <option value="upcoming">upcoming</option>
                    <option value="completed">completed</option>
                    <option value="cancelled">cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
      </div>
    </div>
  )
}


