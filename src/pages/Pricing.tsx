import React, { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { EmptyPlaceholder, ErrorPlaceholder, LoadingPlaceholder } from '../components/Placeholder'

interface Rule { _id?: string; scope: 'service'|'brand'|'model'; refId: string; price: number; currency?: string; metadata?: any }

export default function Pricing() {
  const [rules, setRules] = useState<Rule[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<Rule>({ scope: 'service', refId: '', price: 0, currency: 'INR', metadata: {} })

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const list = await api.get<Rule[]>('/pricing')
      setRules(list)
    } catch (e: any) {
      setError(e?.message || 'Failed to load pricing rules')
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { load() }, [])

  const upsert = async () => {
    await api.put('/pricing', form)
    setForm({ scope: 'service', refId: '', price: 0, currency: 'INR', metadata: {} })
    await load()
  }

  const remove = async (r: Rule) => {
    await api.delete('/pricing', { scope: r.scope, refId: r.refId })
    await load()
  }

  if (loading) return <LoadingPlaceholder label="Loading pricing rules..." />
  if (error) return <ErrorPlaceholder message={error} />

  return (
    <div className="grid" style={{ gridTemplateColumns: '420px 1fr', gap: 16 }}>
      <div className="card">
        <div style={{ fontWeight: 600, marginBottom: 8 }}>Add / Update rule</div>
        <div className="field">
          <label>Scope</label>
          <select value={form.scope} onChange={(e) => setForm({ ...form, scope: e.target.value as Rule['scope'] })}>
            <option value="service">service</option>
            <option value="brand">brand</option>
            <option value="model">model</option>
          </select>
        </div>
        <div className="field">
          <label>Reference</label>
          <input placeholder="serviceId or brandSlug or brandSlug:modelName" value={form.refId} onChange={(e) => setForm({ ...form, refId: e.target.value })} />
        </div>
        <div className="field">
          <label>Price (INR)</label>
          <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
        </div>
        <button className="btn primary" onClick={upsert}>Save</button>
      </div>

      <div className="card">
        {rules.length === 0 ? (
          <EmptyPlaceholder title="No pricing rules" message="Add a rule from the form on the left." />
        ) : (
        <table className="table">
          <thead>
            <tr><th>Scope</th><th>Ref</th><th>Price</th><th></th></tr>
          </thead>
          <tbody>
            {rules.map(r => (
              <tr key={`${r.scope}:${r.refId}`}>
                <td>{r.scope}</td>
                <td>{r.refId}</td>
                <td>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: r.currency || 'INR' }).format(r.price)}</td>
                <td><button className="btn" onClick={() => remove(r)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
      </div>
    </div>
  )
}


