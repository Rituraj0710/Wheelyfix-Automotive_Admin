import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { LoadingPlaceholder } from '../components/Placeholder'

export default function Settings() {
  const [conn, setConn] = useState<any>(null)
  const [payCfg, setPayCfg] = useState<any>(null)

  const load = async () => {
    const [c, p] = await Promise.all([
      api.get('/users/test-connection'),
      api.get('/payments/config'),
    ])
    setConn(c)
    setPayCfg(p)
  }

  useEffect(() => { load() }, [])

  const dbStateText = (s?: number) => s === 1 ? 'connected' : s === 2 ? 'connecting' : s === 3 ? 'disconnecting' : 'disconnected'

  if (!conn && !payCfg) return <LoadingPlaceholder label="Loading settings..." />

  return (
    <div>
      <div className="toolbar"><h2>Settings</h2><button className="btn" onClick={load}>Refresh</button></div>

      <div className="grid cols-2">
        <div className="card">
          <h3>Backend & Database</h3>
          <div>Status: <span className="badge">{conn?.success ? 'Online' : 'Offline'}</span></div>
          <div>DB: {dbStateText(conn?.dbState)}</div>
          {conn?.stats && (
            <div style={{ marginTop: 8, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              <div className="card"><div>Users</div><div style={{ fontSize: 18, fontWeight: 700 }}>{conn.stats.users ?? '—'}</div></div>
              <div className="card"><div>Bookings</div><div style={{ fontSize: 18, fontWeight: 700 }}>{conn.stats.bookings ?? '—'}</div></div>
              <div className="card"><div>Payments</div><div style={{ fontSize: 18, fontWeight: 700 }}>{conn.stats.payments ?? '—'}</div></div>
            </div>
          )}
          <div style={{ fontSize: 12, color: '#6b7280' }}>Last checked: {conn?.timestamp ? new Date(conn.timestamp).toLocaleString() : '—'}</div>
        </div>

        <div className="card">
          <h3>Payments (Razorpay)</h3>
          <div>Configured: <span className="badge">{payCfg?.enabled ? 'Yes' : 'No'}</span></div>
          <div>Key ID: {payCfg?.keyId ? `${payCfg.keyId.slice(0,6)}••••` : '—'}</div>
        </div>
      </div>
    </div>
  )
}


