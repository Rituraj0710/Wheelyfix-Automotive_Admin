import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { EmptyPlaceholder, ErrorPlaceholder, LoadingPlaceholder } from '../components/Placeholder'
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
  if (loading) return <LoadingPlaceholder label="Loading users..." />
  if (error) return <ErrorPlaceholder message={error} />

  return (
    <div>
      <TableToolbar title="Users" search={tools.search} setSearch={tools.setSearch} onRefresh={load} onExport={() => tools.exportCSV('users.csv')} />
      <div className="card">
        {tools.filtered.length === 0 ? (
          <EmptyPlaceholder title="No users" message="No users matched your search." />
        ) : (
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
                    <button className="btn" onClick={() => changeRole(u._id, false)} aria-label={`Change ${u.name}'s role to user`} title="Demote to standard user">Make user</button>
                  ) : (
                    <button className="btn" onClick={() => changeRole(u._id, true)} aria-label={`Change ${u.name}'s role to admin`} title="Promote to admin">Make admin</button>
                  )}
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


