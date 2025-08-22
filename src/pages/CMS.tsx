import { useEffect, useState } from 'react'
import { api } from '../lib/api'

type Entry = { key: string; value: any }

const DEFAULT_KEYS: string[] = [
  'hero.title',
  'hero.subtitle',
  'hero.description',
  'hero.background_image_url',
  'homepage.banner',
  'homepage.faq',
  'contact.info',
  'offers.active',
]

export default function CMS() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  if (loading) return <div>Loading...</div>
  if (error) return <div className="card" style={{ color: '#b91c1c', background: '#fef2f2' }}>{error}</div>

  return (
    <div>
      <div className="toolbar"><h2>CMS Content</h2><button className="btn" onClick={load}>Refresh</button></div>
      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {entries.map((e, idx) => (
          <div key={e.key} className="card">
            <div style={{ fontWeight:600, marginBottom:6 }}>{e.key}</div>
            <textarea style={{ width:'100%', minHeight: 120 }} value={typeof e.value === 'string' ? e.value : JSON.stringify(e.value ?? '', null, 2)}
              onChange={(ev) => {
                const v = ev.target.value
                setEntries(prev => prev.map((x, i) => i === idx ? { ...x, value: tryParse(v) } : x))
              }} />
            <div style={{ marginTop: 8 }}>
              <button className="btn" onClick={() => save(entries[idx])}>Save</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function tryParse(v: string) {
  try { return JSON.parse(v) } catch { return v }
}


