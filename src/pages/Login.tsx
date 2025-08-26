// import { FormEvent, useState } from 'react'
// import { useNavigate } from 'react-router-dom'
// import { api } from '../lib/api'

// export default function Login() {
//   const [email, setEmail] = useState('admin123@gmail.com')
//   const [password, setPassword] = useState('admin123')
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState<string | null>(null)
//   const navigate = useNavigate()

//   const onSubmit = async (e: FormEvent) => {
//     e.preventDefault()
//     setLoading(true)
//     setError(null)
//     try {
//       const res = await api.post<any>('/users/login', { email, password })
//       if (!res?.token) throw new Error(res?.message || 'Invalid response')
//       localStorage.setItem('token', res.token)
//       // Verify admin via profile for extra safety
//       const profile = await api.get<any>('/users/profile')
//       const isAdmin = Boolean(profile?.isAdmin ?? res?.isAdmin)
//       localStorage.setItem('isAdmin', String(isAdmin))
//       if (!isAdmin) throw new Error('This account is not an admin')
//       navigate('/')
//     } catch (err: any) {
//       setError(err?.message || 'Login failed')
//       localStorage.removeItem('token')
//       localStorage.removeItem('isAdmin')
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <div className="container" style={{ maxWidth: 440 }}>
//       <h1 style={{ marginBottom: 12 }}>Admin Login</h1>
//       <p style={{ marginTop: -6, marginBottom: 16, color: '#6b7280' }}>Use your admin credentials to access the dashboard.</p>
//       <form onSubmit={onSubmit} className="card">
//         <div className="field">
//           <label>Email</label>
//           <input autoFocus value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin email" />
//         </div>
//         <div className="field">
//           <label>Password</label>
//           <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password" />
//         </div>
//         {error && <div className="card" style={{ color: '#b91c1c', background: '#fef2f2' }}>{error}</div>}
//         <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'space-between' }}>
//           <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
//             <input id="remember" type="checkbox" defaultChecked onChange={(e) => { /* simple demo */ }} />
//             <label htmlFor="remember" style={{ color: '#6b7280' }}>Remember me</label>
//           </div>
//           <button className="btn primary" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}</button>
//         </div>
//       </form>

//       <div className="card" style={{ marginTop: 12 }}>
//         <div style={{ fontWeight: 600, marginBottom: 6 }}>Test credentials</div>
//         <div>Email: <code>admin123@gmail.com</code> &nbsp; Password: <code>admin123</code></div>
//       </div>
//     </div>
//   )
// }




import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [email, setEmail] = useState('admin123@gmail.com')
  const [password, setPassword] = useState('admin123')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // ✅ Use backend URL from .env
      const backendUrl = "http://localhost:5000"

      // Login request
      const res = await fetch(`${backendUrl}/api/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || "Login failed")

      // Save token
      localStorage.setItem("token", data.token)

      // Verify profile
      const profileRes = await fetch(`${backendUrl}/api/users/profile`, {
        headers: {
          "Authorization": `Bearer ${data.token}`,
        },
      })
      const profile = await profileRes.json()
      const isAdmin = Boolean(profile?.isAdmin ?? data?.isAdmin)

      localStorage.setItem("isAdmin", String(isAdmin))
      if (!isAdmin) throw new Error("This account is not an admin")

      navigate("/")
    } catch (err: any) {
      setError(err?.message || "Login failed")
      localStorage.removeItem("token")
      localStorage.removeItem("isAdmin")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container" style={{ maxWidth: 440 }}>
      <h1 style={{ marginBottom: 12 }}>Admin Login</h1>
      <p style={{ marginTop: -6, marginBottom: 16, color: '#6b7280' }}>
        Use your admin credentials to access the dashboard.
      </p>
      <form onSubmit={onSubmit} className="card">
        <div className="field">
          <label>Email</label>
          <input
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin email"
          />
        </div>
        <div className="field">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="password"
          />
        </div>
        {error && (
          <div
            className="card"
            style={{ color: "#b91c1c", background: "#fef2f2" }}
          >
            {error}
          </div>
        )}
        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input id="remember" type="checkbox" defaultChecked />
            <label htmlFor="remember" style={{ color: "#6b7280" }}>
              Remember me
            </label>
          </div>
          <button className="btn primary" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </div>
      </form>

      <div className="card" style={{ marginTop: 12 }}>
        <div style={{ fontWeight: 600, marginBottom: 6 }}>Test credentials</div>
        <div>
          Email: <code>admin123@gmail.com</code> &nbsp; Password:{" "}
          <code>admin123</code>
        </div>
      </div>
    </div>
  )
}
