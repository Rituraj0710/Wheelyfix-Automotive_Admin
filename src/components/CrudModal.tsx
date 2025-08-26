import React from 'react'

export function CrudModal({ open, title, children, onClose }: { open: boolean; title: string; children: React.ReactNode; onClose: () => void }) {
  if (!open) return null
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'grid', placeItems: 'center', zIndex: 1000 }}>
      <div className="card" style={{ width: 520, maxWidth: '90vw' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ fontWeight: 700 }}>{title}</div>
          <button className="btn" onClick={onClose}>Close</button>
        </div>
        <div>
          {children}
        </div>
      </div>
    </div>
  )
}


