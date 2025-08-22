import { useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api'
import { TableToolbar, useTableTools } from '../components/TableTools'

type Fuel = 'petrol' | 'diesel' | 'cng'
interface BrandModel { name: string; fuels?: Fuel[] }
interface Brand { _id: string; type: 'car'|'bike'; name: string; slug: string; logo?: string; models: BrandModel[] }

export default function Brands() {
  const [vehicleType, setVehicleType] = useState<'car'|'bike'>('car')
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [newBrand, setNewBrand] = useState<Partial<Brand>>({ type: 'car', name: '', slug: '', logo: '' })
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null)
  const selectedBrand = useMemo(() => brands.find(b => b._id === selectedBrandId) || null, [brands, selectedBrandId])

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const list = await api.get<Brand[]>(`/brands?type=${vehicleType}`)
      setBrands(list)
    } catch (e: any) {
      setError(e?.message || 'Failed to load brands')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [vehicleType])

  const tools = useTableTools(brands, { searchText: (b) => `${b.name} ${b.slug}`, sortKey: (b) => b.name || '' })

  const createBrand = async () => {
    if (!newBrand.name || !newBrand.slug) return
    await api.post('/brands', { type: vehicleType, name: newBrand.name, slug: newBrand.slug, logo: newBrand.logo, models: [] })
    setNewBrand({ type: vehicleType, name: '', slug: '', logo: '' })
    await load()
  }

  const updateBrand = async (brand: Brand) => {
    await api.put(`/brands/${brand._id}`, { name: brand.name, slug: brand.slug, logo: brand.logo })
    await load()
  }

  const deleteBrand = async (id: string) => {
    await api.delete(`/brands/${id}`)
    if (selectedBrandId === id) setSelectedBrandId(null)
    await load()
  }

  const addModel = async (brand: Brand, model: BrandModel) => {
    const updated = { ...brand, models: [...brand.models, model] }
    await api.put(`/brands/${brand._id}`, { models: updated.models })
    await load()
  }

  const removeModel = async (brand: Brand, name: string) => {
    const updated = { ...brand, models: brand.models.filter(m => m.name !== name) }
    await api.put(`/brands/${brand._id}`, { models: updated.models })
    await load()
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div className="card" style={{ color: '#b91c1c', background: '#fef2f2' }}>{error}</div>

  return (
    <div className="grid" style={{ gridTemplateColumns: '1fr 420px', gap: 16 }}>
      <div>
        <div className="toolbar">
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            <h2>Brands & Models</h2>
            <select value={vehicleType} onChange={(e) => setVehicleType(e.target.value as 'car'|'bike')}>
              <option value="car">Car</option>
              <option value="bike">Bike</option>
            </select>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <input placeholder="Search..." value={tools.search} onChange={(e) => tools.setSearch(e.target.value)} />
            <button className="btn" onClick={load}>Refresh</button>
            <button className="btn" onClick={() => tools.exportCSV(`${vehicleType}-brands.csv`)}>Export</button>
          </div>
        </div>

        <div className="card">
          <table className="table">
            <thead>
              <tr><th>Name</th><th>Slug</th><th>Models</th><th></th></tr>
            </thead>
            <tbody>
              {tools.filtered.map(b => (
                <tr key={b._id}>
                  <td>
                    <input value={b.name} onChange={e => updateBrand({ ...b, name: e.target.value })} />
                  </td>
                  <td>
                    <input value={b.slug} onChange={e => updateBrand({ ...b, slug: e.target.value })} />
                  </td>
                  <td>{b.models?.length || 0}</td>
                  <td style={{ display:'flex', gap:8 }}>
                    <button className="btn" onClick={() => setSelectedBrandId(b._id)}>Edit models</button>
                    <button className="btn" onClick={() => deleteBrand(b._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <div className="card">
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Add {vehicleType} brand</div>
          <div className="field">
            <label>Name</label>
            <input value={newBrand.name || ''} onChange={(e) => setNewBrand({ ...newBrand, name: e.target.value })} />
          </div>
          <div className="field">
            <label>Slug</label>
            <input value={newBrand.slug || ''} onChange={(e) => setNewBrand({ ...newBrand, slug: e.target.value })} placeholder="lowercase-unique" />
          </div>
          <div className="field">
            <label>Logo (emoji/url)</label>
            <input value={newBrand.logo || ''} onChange={(e) => setNewBrand({ ...newBrand, logo: e.target.value })} />
          </div>
          <button className="btn primary" onClick={createBrand}>Create brand</button>
        </div>

        {selectedBrand && (
          <ModelsEditor brand={selectedBrand} onAdd={addModel} onRemove={removeModel} />
        )}
      </div>
    </div>
  )
}

function ModelsEditor({ brand, onAdd, onRemove }: { brand: Brand; onAdd: (b: Brand, m: BrandModel) => Promise<void>; onRemove: (b: Brand, name: string) => Promise<void> }) {
  const [name, setName] = useState('')
  const [fuels, setFuels] = useState<Fuel[]>(brand.type === 'bike' ? ['petrol'] : [])

  const toggleFuel = (f: Fuel) => {
    setFuels((prev) => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f])
  }

  return (
    <div className="card">
      <div style={{ fontWeight: 600, marginBottom: 8 }}>Models for {brand.name}</div>
      <div className="field">
        <label>Model name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      {brand.type === 'car' && (
        <div className="field">
          <label>Fuel types</label>
          <div style={{ display:'flex', gap:8 }}>
            {(['petrol','diesel','cng'] as Fuel[]).map(f => (
              <label key={f} style={{ display:'flex', gap:6, alignItems:'center' }}>
                <input type="checkbox" checked={fuels.includes(f)} onChange={() => toggleFuel(f)} /> {f}
              </label>
            ))}
          </div>
        </div>
      )}
      <div style={{ display:'flex', gap:8 }}>
        <button className="btn" onClick={() => name && onAdd(brand, { name, fuels })}>Add model</button>
      </div>

      <div style={{ marginTop: 12 }}>
        <table className="table">
          <thead>
            <tr><th>Model</th><th>Fuels</th><th></th></tr>
          </thead>
          <tbody>
            {brand.models.map(m => (
              <tr key={m.name}>
                <td>{m.name}</td>
                <td>{(m.fuels || []).join(', ')}</td>
                <td><button className="btn" onClick={() => onRemove(brand, m.name)}>Remove</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}


