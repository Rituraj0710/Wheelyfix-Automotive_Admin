import React, { FormEvent, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [isSignup, setIsSignup] = useState(false)
  const [email, setEmail] = useState('admin123@gmail.com')
  const [password, setPassword] = useState('admin123')
  const [name, setName] = useState('Admin User')
  const [phoneNumber, setPhoneNumber] = useState('9999999999')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking')
  const navigate = useNavigate()

  // Check backend status on component mount
  useEffect(() => {
    checkBackendStatus()
  }, [])

  const checkBackendStatus = async () => {
    try {
      const res = await fetch('/api/users/test-connection')
      if (res.ok) {
        setBackendStatus('online')
      } else {
        setBackendStatus('offline')
      }
    } catch (err) {
      setBackendStatus('offline')
    }
  }

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      if (backendStatus === 'offline') {
        throw new Error('Backend server is offline. Please check if the server is running.')
      }

      const res = await fetch(`/api/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          name, 
          email, 
          password, 
          phoneNumber,
          isAdmin: true,
          adminSecret: 'wheelyfix-admin-2024' // Default admin secret
        }),
      })

      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data?.message || "Signup failed")
      }

      setSuccess("Admin user created successfully! You can now login.")
      setIsSignup(false)
      setEmail('admin123@gmail.com')
      setPassword('admin123')
      setName('Admin User')
      setPhoneNumber('9999999999')
    } catch (err: any) {
      setError(err?.message || "Signup failed")
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      if (backendStatus === 'offline') {
        throw new Error('Backend server is offline. Please check if the server is running.')
      }

      const res = await fetch(`/api/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data?.message || "Login failed")
      }

      localStorage.setItem("token", data.token)

      const profileRes = await fetch(`/api/users/profile`, {
        headers: {
          "Authorization": `Bearer ${data.token}`,
        },
      })
      
      if (!profileRes.ok) {
        throw new Error("Failed to verify admin status")
      }
      
      const profile = await profileRes.json()
      const isAdmin = Boolean(profile?.isAdmin ?? data?.isAdmin)

      localStorage.setItem("isAdmin", String(isAdmin))
      if (!isAdmin) {
        throw new Error("This account is not an admin")
      }

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
      <h1 style={{ marginBottom: 12 }}>Admin {isSignup ? 'Signup' : 'Login'}</h1>
      <p style={{ marginTop: -6, marginBottom: 16, color: '#6b7280' }}>
        {isSignup 
          ? 'Create a new admin account to access the dashboard.' 
          : 'Use your admin credentials to access the dashboard.'
        }
      </p>

      {/* Backend Status Indicator */}
      <div className="card" style={{ 
        marginBottom: 16, 
        background: backendStatus === 'online' ? '#f0fdf4' : backendStatus === 'offline' ? '#fef2f2' : '#fefce8',
        borderColor: backendStatus === 'online' ? '#22c55e' : backendStatus === 'offline' ? '#ef4444' : '#eab308'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 8, 
          color: backendStatus === 'online' ? '#166534' : backendStatus === 'offline' ? '#991b1b' : '#92400e'
        }}>
          <span style={{ fontSize: '18px' }}>
            {backendStatus === 'online' ? '🟢' : backendStatus === 'offline' ? '🔴' : '🟡'}
          </span>
          <span style={{ fontWeight: 600 }}>
            {backendStatus === 'online' ? 'Backend Online' : backendStatus === 'offline' ? 'Backend Offline' : 'Checking Backend...'}
          </span>
        </div>
        {backendStatus === 'offline' && (
          <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#991b1b' }}>
            Please ensure the backend server is running on port 5000
          </p>
        )}
      </div>

      {/* Success Message */}
      {success && (
        <div className="card" style={{ 
          marginBottom: 16, 
          background: '#f0fdf4', 
          borderColor: '#22c55e',
          color: '#166534'
        }}>
          {success}
        </div>
      )}

      <form onSubmit={isSignup ? handleSignup : onSubmit} className="card">
        {isSignup && (
          <div className="field">
            <label>Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full Name"
              disabled={loading || backendStatus === 'offline'}
              required
            />
          </div>
        )}
        
        <div className="field">
          <label>Email</label>
          <input
            type="email"
            autoFocus={!isSignup}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin email"
            disabled={loading || backendStatus === 'offline'}
            required
          />
        </div>
        
        <div className="field">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="password"
            disabled={loading || backendStatus === 'offline'}
            required
          />
        </div>

        {isSignup && (
          <div className="field">
            <label>Phone Number</label>
            <input
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="9999999999"
              disabled={loading || backendStatus === 'offline'}
              required
            />
          </div>
        )}

        {error && (
          <div className="card" style={{ color: "#b91c1c", background: "#fef2f2" }}>
            {error}
          </div>
        )}

        <div style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          {!isSignup && (
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input id="remember" type="checkbox" defaultChecked disabled={loading} />
              <label htmlFor="remember" style={{ color: '#6b7280' }}>
                Remember me
              </label>
            </div>
          )}
          <button 
            className="btn primary" 
            disabled={loading || backendStatus === 'offline'}
            type="submit"
          >
            {loading ? (isSignup ? "Creating..." : "Signing in…") : (isSignup ? "Create Admin" : "Sign in")}
          </button>
        </div>
      </form>

      {/* Toggle between Login and Signup */}
      <div className="card" style={{ marginTop: 12, textAlign: 'center' }}>
        <p style={{ margin: '0 0 12px 0', color: '#6b7280' }}>
          {isSignup ? 'Already have an admin account?' : "Don't have an admin account?"}
        </p>
        <button 
          className="btn" 
          onClick={() => {
            setIsSignup(!isSignup)
            setError(null)
            setSuccess(null)
          }}
          disabled={loading}
        >
          {isSignup ? 'Switch to Login' : 'Switch to Signup'}
        </button>
      </div>

      {!isSignup && (
        <div className="card" style={{ marginTop: 12 }}>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Test credentials</div>
          <div>
            Email: <code>admin123@gmail.com</code> &nbsp; Password:{" "}
            <code>admin123</code>
          </div>
        </div>
      )}

      {/* Troubleshooting Tips */}
      {backendStatus === 'offline' && (
        <div className="card" style={{ marginTop: 12, background: '#fef2f2', borderColor: '#ef4444' }}>
          <div style={{ fontWeight: 600, marginBottom: 8, color: '#991b1b' }}>Troubleshooting:</div>
          <ul style={{ margin: 0, paddingLeft: '20px', color: '#991b1b', fontSize: '14px' }}>
            <li>Ensure the backend server is running</li>
            <li>Check if MongoDB is connected</li>
            <li>Verify the server is running on port 5000</li>
            <li>Check the backend console for errors</li>
          </ul>
        </div>
      )}
    </div>
  )
}
