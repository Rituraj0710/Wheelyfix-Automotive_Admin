import { NavLink, Outlet } from 'react-router-dom'
import { useEffect, useState } from 'react'
import HeaderBar from './HeaderBar'
import FooterBar from './FooterBar'

export default function Layout() {
  const [dark, setDark] = useState<boolean>(() => localStorage.getItem('adminTheme') === 'dark')
  useEffect(() => {
    const root = document.documentElement
    if (dark) { root.classList.add('dark'); localStorage.setItem('adminTheme', 'dark') }
    else { root.classList.remove('dark'); localStorage.setItem('adminTheme', 'light') }
  }, [dark])

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="logo">Wheelyfix Admin</div>
        <nav>
          <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>Dashboard</NavLink>
          <NavLink to="/users" className={({ isActive }) => isActive ? 'active' : ''}>Users</NavLink>
          <NavLink to="/services" className={({ isActive }) => isActive ? 'active' : ''}>Services</NavLink>
          <NavLink to="/brands" className={({ isActive }) => isActive ? 'active' : ''}>Brands/Models</NavLink>
          <NavLink to="/pricing" className={({ isActive }) => isActive ? 'active' : ''}>Pricing</NavLink>
          <NavLink to="/cms" className={({ isActive }) => isActive ? 'active' : ''}>CMS</NavLink>
          <NavLink to="/bookings" className={({ isActive }) => isActive ? 'active' : ''}>Bookings</NavLink>
          <NavLink to="/payments" className={({ isActive }) => isActive ? 'active' : ''}>Payments</NavLink>
          <NavLink to="/settings" className={({ isActive }) => isActive ? 'active' : ''}>Settings</NavLink>
        </nav>
      </aside>
      <div className="main">
        <HeaderBar right={
          <div className="header-actions">
            <button className="btn" onClick={() => setDark((v) => !v)}>{dark ? 'Light mode' : 'Dark mode'}</button>
            <button className="btn" onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('isAdmin'); window.location.href = '/login' }}>Logout</button>
          </div>
        } />
        <div className="content">
          <Outlet />
        </div>
        <FooterBar />
      </div>
    </div>
  )
}
