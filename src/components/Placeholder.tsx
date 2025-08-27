import React from 'react'

type Variant = 'loading' | 'empty' | 'error' | 'info'

export function Placeholder({
  title,
  message,
  icon,
  action,
  variant = 'info',
  fullHeight = false,
}: {
  title?: string
  message?: string
  icon?: React.ReactNode
  action?: React.ReactNode
  variant?: Variant
  fullHeight?: boolean
}) {
  const styleByVariant: Record<Variant, React.CSSProperties> = {
    loading: { background: '#f1f5f9', color: '#0f172a' },
    empty: { background: '#f8fafc', color: '#334155' },
    error: { background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' },
    info: { background: '#f1f5f9', color: '#0f172a' },
  }

  return (
    <div
      className="card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        gap: 8,
        padding: 24,
        minHeight: fullHeight ? 320 : undefined,
        ...styleByVariant[variant],
      }}
    >
      {icon && <div style={{ opacity: 0.8 }}>{icon}</div>}
      {title && <div style={{ fontSize: 18, fontWeight: 700 }}>{title}</div>}
      {message && <div style={{ fontSize: 14, opacity: 0.9, maxWidth: 560 }}>{message}</div>}
      {action && <div style={{ marginTop: 8 }}>{action}</div>}
    </div>
  )
}

export function LoadingPlaceholder({ label = 'Loading...' }: { label?: string }) {
  return (
    <Placeholder
      variant="loading"
      title={label}
      message="Please wait while we fetch the latest data."
    />
  )
}

export function ErrorPlaceholder({ message }: { message: string }) {
  return (
    <Placeholder
      variant="error"
      title="Something went wrong"
      message={message}
    />
  )
}

export function EmptyPlaceholder({ title = 'Nothing here yet', message }: { title?: string; message?: string }) {
  return (
    <Placeholder
      variant="empty"
      title={title}
      message={message || 'No data to display. Try adjusting filters or add new items.'}
    />
  )
}


