import React, { useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api'
import { ErrorPlaceholder, LoadingPlaceholder } from '../components/Placeholder'

type Entry = { key: string; value: any }

const DEFAULT_KEYS: string[] = [
  // Hero section
  'hero.title',
  'hero.subtitle',
  'hero.description',
  'hero.background_image_url',
  'hero.cta_text',
  // Header/Footer navigation
  'header.nav',
  'footer.links',
  'footer.contact',
  // Home sections
  'homepage.banner',
  'homepage.faq',
  'homepage.testimonials',
  'homepage.brands',
  // Services landing content
  'services.heading',
  'services.subheading',
  // Global settings
  'site.name',
  'site.logo_url',
  'site.support_email',
  'site.phone',
  // SEO
  'seo.title',
  'seo.description',
  'seo.keywords',
  // Contact page
  'contact.info',
  'contact.address',
  'contact.map_embed_url',
  // Offers / flags
  'offers.active',
]

export default function CMS() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newKey, setNewKey] = useState('')
  const [newValue, setNewValue] = useState('')

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const list: Entry[] = await Promise.all(DEFAULT_KEYS.map(async (key) => ({ key, value: await api.get(`/cms/${encodeURIComponent(key)}`) })))
      setEntries(list)
    } catch (e: any) {
      setError(e?.message || 'Failed to load CMS content')
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { load() }, [])

  const save = async (e: Entry) => {
    await api.put(`/cms/${encodeURIComponent(e.key)}`, { value: e.value })
  }

  const addEntry = async () => {
    if (!newKey.trim()) return
    const value = tryParse(newValue)
    await api.put(`/cms/${encodeURIComponent(newKey.trim())}`, { value })
    setNewKey('')
    setNewValue('')
    await load()
  }

  const grouped = useMemo(() => {
    const map: Record<string, Entry[]> = {}
    for (const e of entries) {
      const group = (e.key.split('.')[0] || 'general').toLowerCase()
      if (!map[group]) map[group] = []
      map[group].push(e)
    }
    return map
  }, [entries])

  if (loading) return <LoadingPlaceholder label="Loading CMS content..." />
  if (error) return <ErrorPlaceholder message={error} />

  return (
    <div>
      <div className="toolbar">
        <h2>CMS Content</h2>
        <button className="btn" onClick={load} aria-label="Refresh CMS content" title="Reload all CMS keys from server">Refresh content</button>
      </div>

      {/* Add new entry */}
      <div className="card" style={{ marginBottom: 12 }}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>Add new CMS entry</div>
        <div className="grid" style={{ gridTemplateColumns: '1.2fr 1fr', gap: 8 }}>
          <div className="field">
            <label>Key (e.g., hero.title)</label>
            <input placeholder="Enter CMS key, e.g., hero.title" value={newKey} onChange={e => setNewKey(e.target.value)} aria-label="CMS entry key" />
          </div>
          <div className="field" style={{ gridColumn: '1 / -1' }}>
            <label>Value (JSON or text)</label>
            <textarea placeholder='Enter value, e.g., "Get Free Service Quote" or {"items":[]}' style={{ width: '100%', minHeight: 80 }} value={newValue} onChange={e => setNewValue(e.target.value)} aria-label="CMS entry value" />
          </div>
        </div>
        <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
          <button className="btn primary" onClick={addEntry} aria-label="Add new CMS entry" title="Create or overwrite this CMS key">Add entry</button>
          <button className="btn" onClick={() => { setNewKey(''); setNewValue('') }} aria-label="Clear form inputs" title="Clear the key and value fields">Clear form</button>
        </div>
      </div>

      {/* Grouped sections */}
      {Object.entries(grouped).map(([group, list]) => (
        <div key={group} style={{ marginBottom: 16 }}>
          <h3 style={{ fontWeight: 700, margin: '8px 0' }}>{group.toUpperCase()}</h3>
          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {list.map((e, idx) => (
              <div key={e.key} className="card">
                <div style={{ fontWeight:600, marginBottom:6 }}>{e.key}</div>
                <textarea
                  placeholder="Update content here"
                  style={{ width:'100%', minHeight: 120 }}
                  value={typeof e.value === 'string' ? e.value : JSON.stringify(e.value ?? '', null, 2)}
                  onChange={(ev) => {
                    const v = ev.target.value
                    setEntries(prev => prev.map((x) => x.key === e.key ? { ...x, value: tryParse(v) } : x))
                  }}
                />
                <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                  <button className="btn" onClick={() => save(e)} aria-label={`Save changes for ${e.key}`}>Save changes</button>
                  <button className="btn" onClick={load} aria-label="Reload entries to discard local edits">Discard</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function tryParse(v: string) {
  try { return JSON.parse(v) } catch { return v }
}


