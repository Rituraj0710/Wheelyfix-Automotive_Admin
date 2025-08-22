import { useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

export default function Analytics() {
  const [users, setUsers] = useState<any[]>([])
  const [bookings, setBookings] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])

  const load = async () => {
    const [u, b, p, s] = await Promise.all([
      api.get<any[]>('/users'),
      api.get<any[]>('/bookings'),
      api.get<any[]>('/payments'),
      api.get<any[]>('/services'),
    ])
    setUsers(u); setBookings(b); setPayments(p); setServices(s)
  }
  useEffect(() => { load() }, [])

  const totals = useMemo(() => ({
    users: users.length,
    bookings: bookings.length,
    payments: payments.length,
    revenueINR: payments.filter((p: any) => p.status === 'paid').reduce((a: number, p: any) => a + (p.amount || 0), 0) / 100,
    activeServices: services.filter((s: any) => s.isActive !== false).length,
  }), [users, bookings, payments, services])

  return (
    <div>
      <div className="toolbar"><h2>Dashboard</h2><button className="btn" onClick={load}>Refresh</button></div>
      <div className="grid cols-2">
        <div className="card">
          <div>Total users</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{totals.users}</div>
        </div>
        <div className="card">
          <div>Bookings</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{totals.bookings}</div>
        </div>
        <div className="card">
          <div>Payments</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{totals.payments}</div>
        </div>
        <div className="card">
          <div>Revenue (INR)</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(totals.revenueINR)}</div>
        </div>
        <div className="card">
          <div>Active services</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{totals.activeServices}</div>
        </div>
      </div>

      <div className="card">
        <div style={{ marginBottom: 8, fontWeight: 600 }}>Revenue (last 14 days)</div>
        <div style={{ height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={buildRevenueSeries(payments)} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

function buildRevenueSeries(payments: any[]) {
  const days = 14
  const map: Record<string, number> = {}
  const now = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(now.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    map[key] = 0
  }
  payments.filter((p: any) => p.status === 'paid').forEach((p: any) => {
    const key = new Date(p.createdAt).toISOString().slice(0, 10)
    if (map[key] !== undefined) map[key] += (p.amount || 0) / 100
  })
  return Object.entries(map).map(([date, revenue]) => ({ date: date.slice(5), revenue }))
}


