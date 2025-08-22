import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { TableToolbar, useTableTools } from '../components/TableTools'

interface User { _id: string; name: string; email: string; isAdmin: boolean; createdAt?: string }

export default function Users() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const list = await api.get<User[]>('/users')
      setUsers(list)
    } catch (e: any) {
      setError(e?.message || 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { load() }, [])

  const changeRole = async (id: string, isAdmin: boolean) => {
    await api.put(`/users/${id}/role`, { isAdmin })
    await load()
  }

  const tools = useTableTools(users, { searchText: (u) => `${u.name} ${u.email}`, sortKey: (u) => u.name || '' })
  if (loading) return <div>Loading...</div>
  if (error) return <div className="card" style={{ color: '#b91c1c', background: '#fef2f2' }}>{error}</div>

  return (
    <div>
      <TableToolbar title="Users" search={tools.search} setSearch={tools.setSearch} onRefresh={load} onExport={() => tools.exportCSV('users.csv')} />
      <div className="card">
        <table className="table">
          <thead>
            <tr><th>Name</th><th>Email</th><th>Role</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {tools.filtered.map(u => (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td><span className="badge">{u.isAdmin ? 'admin' : 'user'}</span></td>
                <td>
                  {u.isAdmin ? (
                    <button className="btn" onClick={() => changeRole(u._id, false)}>Make user</button>
                  ) : (
                    <button className="btn" onClick={() => changeRole(u._id, true)}>Make admin</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}


