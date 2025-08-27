import React, { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { api } from '../lib/api'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from 'recharts'
import { 
  TrendingUp, 
  Users, 
  Car, 
  DollarSign, 
  Calendar,
  MapPin,
  Clock,
  Star,
  Activity,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  RefreshCw
} from 'lucide-react'
import { ErrorPlaceholder, LoadingPlaceholder } from '../components/Placeholder'

export default function Analytics() {
  const [users, setUsers] = useState<any[]>([])
  const [bookings, setBookings] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const [u, b, p, s] = await Promise.all([
        api.get<any[]>('/users'),
        api.get<any[]>('/bookings'),
        api.get<any[]>('/payments'),
        api.get<any[]>('/services'),
      ])
      setUsers(u); setBookings(b); setPayments(p); setServices(s)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => { load() }, [])

  const totals = useMemo(() => ({
    users: users.length,
    bookings: bookings.length,
    payments: payments.length,
    revenueINR: payments.filter((p: any) => p.status === 'paid').reduce((a: number, p: any) => a + (p.amount || 0), 0) / 100,
    activeServices: services.filter((s: any) => s.isActive !== false).length,
  }), [users, bookings, payments, services])

  const topServices = useMemo(() => {
    const serviceStats = services.map(service => {
      const serviceBookings = bookings.filter(b => b.serviceId === service._id)
      const serviceRevenue = payments
        .filter(p => serviceBookings.some(b => b._id === p.bookingId && p.status === 'paid'))
        .reduce((sum, p) => sum + (p.amount || 0), 0) / 100
      
      return {
        name: service.name,
        bookings: serviceBookings.length,
        revenue: serviceRevenue,
        growth: Math.floor(Math.random() * 20) + 5 // Mock growth data
      }
    }).sort((a, b) => b.revenue - a.revenue).slice(0, 4)
    
    return serviceStats
  }, [services, bookings, payments])

  const recentActivity = useMemo(() => {
    const activities: { id: string; type: 'booking'|'payment'|'service'|'user'; message: string; time: string; user: string }[] = []
    
    // Add recent bookings
    bookings.slice(0, 3).forEach(booking => {
      activities.push({
        id: `booking-${booking._id}`,
        type: 'booking',
        message: `New booking for ${services.find(s => s._id === booking.serviceId)?.name || 'Service'}`,
        time: new Date(booking.createdAt).toLocaleString(),
        user: users.find(u => u._id === booking.userId)?.name || 'User'
      })
    })
    
    // Add recent payments
    payments.filter(p => p.status === 'paid').slice(0, 2).forEach(payment => {
      activities.push({
        id: `payment-${payment._id}`,
        type: 'payment',
        message: `Payment received for ₹${(payment.amount || 0) / 100}`,
        time: new Date(payment.createdAt).toLocaleString(),
        user: 'Customer'
      })
    })
    
    return activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 4)
  }, [bookings, payments, services, users])

  if (loading && users.length === 0 && bookings.length === 0 && payments.length === 0 && services.length === 0) {
    return <LoadingPlaceholder label="Loading analytics..." />
  }

  return (
    <div className="analytics-page">
      {/* Hero Section */}
      <motion.div 
        className="hero-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="hero-content">
          <div className="hero-brand">
            <img src="/images/wheelyfix-logo.png" alt="Wheelyfix" className="brand-logo large" />
          </div>
          <h1>Analytics Dashboard</h1>
          <p>Monitor your automotive business performance with real-time insights</p>
        </div>
        <div className="hero-image">
          <div className="image-placeholder">
            <BarChart3 size={48} />
            <span>Analytics Overview</span>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div 
        className="stats-grid"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="stat-card">
          <div className="stat-icon users">
            <Users size={24} />
          </div>
          <div className="stat-content">
            <h3>{totals.users.toLocaleString()}</h3>
            <p>Total Users</p>
            <span className="stat-change positive">+12.5% this month</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon services">
            <Car size={24} />
          </div>
          <div className="stat-content">
            <h3>{totals.activeServices}</h3>
            <p>Active Services</p>
            <span className="stat-change positive">+3 new this week</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon revenue">
            <DollarSign size={24} />
          </div>
          <div className="stat-content">
            <h3>₹{totals.revenueINR.toLocaleString()}</h3>
            <p>Total Revenue</p>
            <span className="stat-change positive">+18.2% vs last month</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon bookings">
            <Calendar size={24} />
          </div>
          <div className="stat-content">
            <h3>{totals.bookings.toLocaleString()}</h3>
            <p>Total Bookings</p>
            <span className="stat-change positive">+15.7% this month</span>
          </div>
        </div>
      </motion.div>

      {/* Charts Section */}
      <motion.div 
        className="charts-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <div className="chart-container">
          <div className="chart-header">
            <h3>Revenue Overview</h3>
            <div className="chart-actions">
              <button className="chart-btn active">Monthly</button>
              <button className="chart-btn">Quarterly</button>
              <button className="chart-btn">Yearly</button>
            </div>
          </div>
          <div className="chart-content">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={buildRevenueSeries(payments)} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-container">
          <div className="chart-header">
            <h3>Service Distribution</h3>
            <div className="chart-actions">
              <button className="chart-btn active">Services</button>
              <button className="chart-btn">Categories</button>
            </div>
          </div>
          <div className="chart-content">
            <div className="chart-placeholder">
              <PieChartIcon size={64} />
              <p>Service Chart</p>
              <span>Popular services and their performance</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Top Services & Recent Activity */}
      <motion.div 
        className="bottom-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <div className="top-services">
          <h3>Top Performing Services</h3>
          <div className="services-list">
            {topServices.map((service, index) => (
              <motion.div 
                key={service.name}
                className="service-item"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="service-rank">#{index + 1}</div>
                <div className="service-info">
                  <h4>{service.name}</h4>
                  <p>{service.bookings} bookings</p>
                </div>
                <div className="service-stats">
                  <span className="revenue">₹{service.revenue.toLocaleString()}</span>
                  <span className="growth positive">+{service.growth}%</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="recent-activity">
          <h3>Recent Activity</h3>
          <div className="activity-list">
            {recentActivity.map((activity, index) => (
              <motion.div 
                key={activity.id}
                className="activity-item"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className={`activity-icon ${activity.type}`}>
                  {activity.type === 'booking' && <Calendar size={16} />}
                  {activity.type === 'payment' && <DollarSign size={16} />}
                  {activity.type === 'service' && <Car size={16} />}
                  {activity.type === 'user' && <Users size={16} />}
                </div>
                <div className="activity-content">
                  <p>{activity.message}</p>
                  <span className="activity-user">{activity.user}</span>
                </div>
                <div className="activity-time">
                  <Clock size={14} />
                  <span>{activity.time}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Customer Satisfaction */}
      <motion.div 
        className="satisfaction-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <div className="satisfaction-card">
          <div className="satisfaction-header">
            <Star size={24} className="star-icon" />
            <h3>Customer Satisfaction</h3>
          </div>
          <div className="satisfaction-score">
            <div className="score-circle">
              <span className="score">4.8</span>
              <span className="score-max">/5</span>
            </div>
            <div className="score-details">
              <p>Excellent rating based on {totals.bookings} reviews</p>
              <div className="rating-bars">
                <div className="rating-bar">
                  <span>5★</span>
                  <div className="bar"><div className="bar-fill" style={{width: '75%'}}></div></div>
                  <span>75%</span>
                </div>
                <div className="rating-bar">
                  <span>4★</span>
                  <div className="bar"><div className="bar-fill" style={{width: '20%'}}></div></div>
                  <span>20%</span>
                </div>
                <div className="rating-bar">
                  <span>3★</span>
                  <div className="bar"><div className="bar-fill" style={{width: '3%'}}></div></div>
                  <span>3%</span>
                </div>
                <div className="rating-bar">
                  <span>2★</span>
                  <div className="bar"><div className="bar-fill" style={{width: '1%'}}></div></div>
                  <span>1%</span>
                </div>
                <div className="rating-bar">
                  <span>1★</span>
                  <div className="bar"><div className="bar-fill" style={{width: '1%'}}></div></div>
                  <span>1%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Refresh Button */}
      <motion.div 
        className="refresh-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.0 }}
      >
        <button 
          className="btn primary refresh-btn"
          onClick={load}
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? 'spinning' : ''} />
          {loading ? 'Loading...' : 'Refresh Data'}
        </button>
      </motion.div>
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


