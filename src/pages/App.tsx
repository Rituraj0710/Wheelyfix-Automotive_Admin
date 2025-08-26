import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Users from './Users'
import Services from './Services'
import Bookings from './Bookings'
import Payments from './Payments'
import Analytics from './Analytics'
import Settings from './Settings'
import Brands from './Brands'
import Pricing from './Pricing'
import CMS from './CMS'
import AuditLog from './AuditLog'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Analytics />} />
      <Route path="/users" element={<Users />} />
      <Route path="/services" element={<Services />} />
      <Route path="/brands" element={<Brands />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/cms" element={<CMS />} />
      <Route path="/audit" element={<AuditLog />} />
      <Route path="/bookings" element={<Bookings />} />
      <Route path="/payments" element={<Payments />} />
      <Route path="/analytics" element={<Analytics />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
  )
}


