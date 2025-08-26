import React, { useEffect, useState } from "react";
import { NavLink, Outlet, Navigate } from "react-router-dom";
import { Home, Users, Wrench, Car, IndianRupee, Type, FileText, CalendarDays, CreditCard, Settings as Cog, LogOut } from "lucide-react";
import HeaderBar from "./HeaderBar";
import FooterBar from "./FooterBar";

export default function Layout() {
  const [dark, setDark] = useState(() => localStorage.getItem("adminTheme") === "dark");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check authentication status
    const token = localStorage.getItem("token");
    const isAdmin = localStorage.getItem("isAdmin") === "true";
    
    if (token && isAdmin) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add("dark");
      localStorage.setItem("adminTheme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("adminTheme", "light");
    }
  }, [dark]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("isAdmin");
    setIsAuthenticated(false);
    window.location.href = "/login";
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="logo">
          <img src={`${(import.meta as any).env?.BASE_URL || '/'}images/wheelyfix-logo.png`} alt="Wheelyfix" className="brand-logo" />
          <div className="logo-text">
            <span className="logo-title">WHEELYFIX</span>
            <span className="logo-subtitle">Admin Panel</span>
          </div>
        </div>
        <nav className="sidebar-nav">
          <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
            <Home className="nav-icon" /> Dashboard
          </NavLink>
          <NavLink to="/users" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
            <Users className="nav-icon" /> Users
          </NavLink>
          <NavLink to="/services" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
            <Wrench className="nav-icon" /> Services
          </NavLink>
          <NavLink to="/brands" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
            <Car className="nav-icon" /> Brands/Models
          </NavLink>
          <NavLink to="/pricing" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
            <IndianRupee className="nav-icon" /> Pricing
          </NavLink>
          <NavLink to="/cms" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
            <FileText className="nav-icon" /> CMS
          </NavLink>
          <NavLink to="/bookings" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
            <CalendarDays className="nav-icon" /> Bookings
          </NavLink>
          <NavLink to="/payments" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
            <CreditCard className="nav-icon" /> Payments
          </NavLink>
          <NavLink to="/settings" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
            <Cog className="nav-icon" /> Settings
          </NavLink>
          <NavLink to="/audit" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
            <FileText className="nav-icon" /> Audit Log
          </NavLink>
        </nav>
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut className="nav-icon" /> Logout
          </button>
        </div>
      </aside>
      <div className="main">
        <HeaderBar 
          right={
            <div className="header-actions">
              <button className="btn theme-btn" onClick={() => setDark(!dark)}>
                {dark ? "☀️ Light" : "🌙 Dark"}
              </button>
            </div>
          } 
        />
        <div className="content">
          <Outlet />
        </div>
        <FooterBar />
      </div>
    </div>
  );
}
