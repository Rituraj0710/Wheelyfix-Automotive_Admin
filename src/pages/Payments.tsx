import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { EmptyPlaceholder, ErrorPlaceholder, LoadingPlaceholder } from '../components/Placeholder'
import { TableToolbar, useTableTools } from '../components/TableTools'

interface Payment { _id: string; orderId?: string; paymentId?: string; amount: number; currency: string; status: 'created'|'paid'|'failed'; createdAt: string; user?: { name?: string; email?: string } }

const formatAmount = (amountPaise: number, currency: string) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(amountPaise / 100)

export default function Payments() {
  const [items, setItems] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const list = await api.get<Payment[]>('/payments')
      setItems(list)
    } catch (e: any) {
      setError(e?.message || 'Failed to load payments')
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { load() }, [])

  const tools = useTableTools(items, { searchText: (p) => `${p.orderId || ''} ${p.paymentId || ''} ${p.user?.email || ''}`, sortKey: (p) => new Date(p.createdAt).getTime() }, 'desc')
  if (loading) return <LoadingPlaceholder label="Loading payments..." />
  if (error) return <ErrorPlaceholder message={error} />

  return (
    <div>
      <TableToolbar title="Payments" search={tools.search} setSearch={tools.setSearch} onRefresh={load} onExport={() => tools.exportCSV('payments.csv')} />
      <div className="card">
        {tools.filtered.length === 0 ? (
          <EmptyPlaceholder title="No payments" message="No payments to show for current filters." />
        ) : (
        <table className="table">
          <thead>
            <tr><th>Order</th><th>Payment</th><th>Customer</th><th>Amount</th><th>Status</th><th>Created</th></tr>
          </thead>
          <tbody>
            {tools.filtered.map(p => (
              <tr key={p._id}>
                <td>{p.orderId || '—'}</td>
                <td>{p.paymentId || '—'}</td>
                <td>
                  <div>{p.user?.name || '—'}</div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>{p.user?.email || '—'}</div>
                </td>
                <td>{formatAmount(p.amount, p.currency)}</td>
                <td><span className="badge">{p.status}</span></td>
                <td>{new Date(p.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
      </div>
    </div>
  )
}


