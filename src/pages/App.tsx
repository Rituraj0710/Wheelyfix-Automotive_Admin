import { NavLink, Route, Routes, useNavigate } from 'react-router-dom'
import Users from './Users'
import Services from './Services'
import Bookings from './Bookings'
import Payments from './Payments'
import Analytics from './Analytics'
import Settings from './Settings'
import Brands from './Brands'
import Pricing from './Pricing'
import CMS from './CMS'
import { useEffect } from 'react'

function requireAuth() {
  const token = localStorage.getItem('token')
  if (!token) return false
  const isAdmin = localStorage.getItem('isAdmin') === 'true'
  return isAdmin
}

export default function App() {
  const navigate = useNavigate()
  useEffect(() => {
    if (!requireAuth()) {
      navigate('/login')
    }
  }, [navigate])

  return (
    <div className="container">
      <div className="toolbar">
        <h1>Wheelyfix Admin</h1>
        <div>
          <button className="btn" onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('isAdmin'); navigate('/login') }}>Logout</button>
        </div>
      </div>
      <nav className="nav">
        <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>Dashboard</NavLink>
        <NavLink to="/users" className={({ isActive }) => isActive ? 'active' : ''}>Users</NavLink>
        <NavLink to="/services" className={({ isActive }) => isActive ? 'active' : ''}>Services</NavLink>
        <NavLink to="/bookings" className={({ isActive }) => isActive ? 'active' : ''}>Bookings</NavLink>
        <NavLink to="/payments" className={({ isActive }) => isActive ? 'active' : ''}>Payments</NavLink>
        <NavLink to="/analytics" className={({ isActive }) => isActive ? 'active' : ''}>Analytics</NavLink>
        <NavLink to="/settings" className={({ isActive }) => isActive ? 'active' : ''}>Settings</NavLink>
      </nav>
      <Routes>
        <Route path="/" element={<Analytics />} />
        <Route path="/users" element={<Users />} />
        <Route path="/services" element={<Services />} />
        <Route path="/brands" element={<Brands />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/cms" element={<CMS />} />
        <Route path="/bookings" element={<Bookings />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </div>
  )
}


