// import React, { useEffect, useMemo, useState } from 'react'
// import { api } from '../lib/api'
// import { TableToolbar } from '../components/TableTools'
// import { DataTable, Column } from '../components/DataTable'
// import { CrudModal } from '../components/CrudModal'
// import { useCan } from '../lib/permissions'
// import { EmptyPlaceholder, ErrorPlaceholder, LoadingPlaceholder } from '../components/Placeholder'

// interface Service { _id: string; name: string; description?: string; price?: number; durationMinutes?: number; isActive?: boolean; category?: string }

// export default function Services() {
//   const { canCreateService, canUpdateService, canDeleteService } = useCan()
//   const [items, setItems] = useState<Service[]>([])
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState<string | null>(null)
//   const [newItem, setNewItem] = useState<Partial<Service>>({ name: '', category: '', price: 0, durationMinutes: 30, isActive: true, description: '', icon: '' } as any)

//   // server-side table state
//   const [page, setPage] = useState(1)
//   const [limit, setLimit] = useState(10)
//   const [total, setTotal] = useState(0)
//   const [search, setSearch] = useState('')
//   const [sortBy, setSortBy] = useState<keyof Service | 'createdAt' | 'updatedAt'>('createdAt')
//   const [order, setOrder] = useState<'asc' | 'desc'>('desc')

//   const query = useMemo(() => {
//     const params = new URLSearchParams()
//     params.set('page', String(page))
//     params.set('limit', String(limit))
//     if (search.trim()) params.set('search', search.trim())
//     params.set('sortBy', String(sortBy))
//     params.set('order', order)
//     return `/services?${params.toString()}`
//   }, [page, limit, search, sortBy, order])

//   const load = async () => {
//     setLoading(true)
//     setError(null)
//     try {
//       const res = await api.get<any>(query)
//       // Backward compatibility: API may return an array
//       if (Array.isArray(res)) {
//         setItems(res)
//         setTotal(res.length)
//       } else {
//         setItems(res.items || [])
//         setTotal(res.total || 0)
//       }
//     } catch (e: any) {
//       setError(e?.message || 'Failed to load services')
//     } finally {
//       setLoading(false)
//     }
//   }
//   useEffect(() => { load() }, [query])

//   const toggleActive = async (id: string, current?: boolean) => {
//     const s = items.find(i => i._id === id)
//     if (!s) return
//     await api.put(`/services/${id}`, { ...s, isActive: !current })
//     await load()
//   }

//   const createItem = async () => {
//     if (!newItem.name) {
//       setError('Name is required')
//       return
//     }
//     try {
//       setError(null)
//       await api.post('/services', {
//         name: newItem.name,
//         description: newItem.description,
//         icon: (newItem as any).icon,
//         category: newItem.category,
//         price: newItem.price,
//         durationMinutes: newItem.durationMinutes,
//         isActive: newItem.isActive,
//       })
//       setNewItem({ name: '', category: '', price: 0, durationMinutes: 30, isActive: true, description: '', icon: '' } as any)
//       await load()
//     } catch (e: any) {
//       setError(e?.message || 'Failed to create service')
//     }
//   }

//   const updateInline = async (svc: Service, patch: Partial<Service>) => {
//     const payload = { ...svc, ...patch }
//     await api.put(`/services/${svc._id}`, payload)
//     await load()
//   }

//   const remove = async (id: string) => {
//     await api.delete(`/services/${id}`)
//     await load()
//   }

//   if (loading) return <LoadingPlaceholder label="Loading services..." />
//   if (error) return <ErrorPlaceholder message={error} />

//   return (
//     <div>
//       <TableToolbar title="Services" search={search} setSearch={(v) => { setPage(1); setSearch(v) }} onRefresh={load} onExport={() => {
//         const headers = Object.keys(items[0] || {})
//         const csv = [headers.join(',')].concat(items.map((r: any) => headers.map(h => JSON.stringify(r[h] ?? '')).join(','))).join("\n")
//         const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
//         const url = URL.createObjectURL(blob)
//         const a = document.createElement('a')
//         a.href = url
//         a.download = 'services.csv'
//         a.click()
//         URL.revokeObjectURL(url)
//       }} />
//       <div className="card" style={{ marginBottom: 12 }}>
//         <div style={{ fontWeight: 600, marginBottom: 8 }}>Add service</div>
//         <div className="grid" style={{ gridTemplateColumns: '1.2fr 1fr 0.8fr 0.8fr 0.8fr 1fr 1fr', gap: 8, alignItems: 'end' }}>
//           <div className="field">
//             <label>Name</label>
//             <input placeholder="e.g., Tyre Service" value={newItem.name || ''} onChange={e => setNewItem({ ...newItem, name: e.target.value })} aria-label="Service name" />
//           </div>
//           <div className="field">
//             <label>Category</label>
//             <input placeholder="Two Wheeler / Four Wheeler" value={newItem.category || ''} onChange={e => setNewItem({ ...newItem, category: e.target.value })} aria-label="Service category" />
//           </div>
//           <div className="field">
//             <label>Icon (emoji/url)</label>
//             <input placeholder="https://... or 😀" value={(newItem as any).icon || ''} onChange={e => setNewItem({ ...newItem, icon: e.target.value } as any)} aria-label="Service icon (emoji or image URL)" />
//           </div>
//           <div className="field">
//             <label>Price</label>
//             <input type="number" placeholder="e.g., 1499" value={Number(newItem.price || 0)} onChange={e => setNewItem({ ...newItem, price: Number(e.target.value) })} aria-label="Service price in INR" />
//           </div>
//           <div className="field">
//             <label>Duration (min)</label>
//             <input type="number" placeholder="e.g., 120" value={Number(newItem.durationMinutes || 0)} onChange={e => setNewItem({ ...newItem, durationMinutes: Number(e.target.value) })} aria-label="Estimated duration in minutes" />
//           </div>
//           <div className="field">
//             <label>Status</label>
//             <select value={String(newItem.isActive)} onChange={e => setNewItem({ ...newItem, isActive: e.target.value === 'true' })} aria-label="Service status selector">
//               <option value="true">active</option>
//               <option value="false">inactive</option>
//             </select>
//           </div>
//           <div className="field">
//             <label>Description</label>
//             <input placeholder="Short description shown on site" value={newItem.description || ''} onChange={e => setNewItem({ ...newItem, description: e.target.value })} aria-label="Service description" />
//           </div>
//           <button className="btn primary" onClick={createItem} disabled={!newItem.name || !canCreateService} title={!canCreateService ? 'Insufficient permission' : ''} aria-label="Create new service">Create</button>
//         </div>
//       </div>
//       {items.length === 0 ? (
//         <EmptyPlaceholder title="No services" message="Use the form above to add your first service." />
//       ) : (
//       <DataTable
//         columns={[
//           { key: 'name', header: 'Name', sortable: true, render: (s: Service) => <input value={s.name} onChange={e => canUpdateService && updateInline(s, { name: e.target.value })} disabled={!canUpdateService} title={!canUpdateService ? 'Insufficient permission' : ''} /> },
//           { key: 'category', header: 'Category', render: (s: Service) => <input value={s.category || ''} onChange={e => canUpdateService && updateInline(s, { category: e.target.value })} disabled={!canUpdateService} title={!canUpdateService ? 'Insufficient permission' : ''} /> },
//           { key: 'price', header: 'Price', sortable: true, render: (s: Service) => <input type="number" value={Number(s.price || 0)} onChange={e => canUpdateService && updateInline(s, { price: Number(e.target.value) })} disabled={!canUpdateService} title={!canUpdateService ? 'Insufficient permission' : ''} /> },
//           { key: 'durationMinutes', header: 'Duration', sortable: true, render: (s: Service) => <span><input type="number" value={Number(s.durationMinutes || 0)} onChange={e => canUpdateService && updateInline(s, { durationMinutes: Number(e.target.value) })} disabled={!canUpdateService} title={!canUpdateService ? 'Insufficient permission' : ''} /> min</span> },
//           { key: 'isActive', header: 'Status', render: (s: Service) => (
//             <select value={String(s.isActive)} onChange={e => canUpdateService && updateInline(s, { isActive: e.target.value === 'true' })} disabled={!canUpdateService} title={!canUpdateService ? 'Insufficient permission' : ''}>
//               <option value="true">active</option>
//               <option value="false">inactive</option>
//             </select>
//           ) },
//           { key: 'actions', header: '', render: (s: Service) => (
//             <div style={{ display: 'flex', gap: 8 }}>
//               <button className="btn" onClick={() => canUpdateService && toggleActive(s._id, s.isActive)} disabled={!canUpdateService} title={!canUpdateService ? 'Insufficient permission' : ''}>Toggle</button>
//               <button className="btn" onClick={() => canDeleteService && remove(s._id)} disabled={!canDeleteService} title={!canDeleteService ? 'Insufficient permission' : ''}>Delete</button>
//             </div>
//           ) },
//         ] as Column<Service>[]}
//         rows={items}
//         onSort={(key) => { setSortBy(key as any); setOrder(prev => (sortBy === key && prev === 'asc') ? 'desc' : 'asc') }}
//         sortBy={sortBy as string}
//         order={order}
//         pagination={{ page, limit, total, onPageChange: (p) => setPage(Math.max(1, p)), onLimitChange: (n) => { setPage(1); setLimit(n) } }}
//       />
//       )}

//       <CrudModal open={false} title="" onClose={() => {}}>{null}</CrudModal>
//     </div>
//   )
// }

// import React, { useEffect, useMemo, useState } from 'react'
// import axios from 'axios'
// import { TableToolbar } from '../components/TableTools'
// import { DataTable, Column } from '../components/DataTable'
// import { CrudModal } from '../components/CrudModal'
// import { useCan } from '../lib/permissions'
// import { EmptyPlaceholder, ErrorPlaceholder, LoadingPlaceholder } from '../components/Placeholder'

// interface Service {
//   _id: string
//   name: string
//   description?: string
//   price?: number
//   durationMinutes?: number
//   isActive?: boolean
//   category?: string
//   icon?: string
// }

// const BASE_URL = 'http://localhost:5000/api/services'

// export default function Services() {
//   const { canCreateService, canUpdateService, canDeleteService } = useCan()
//   const [items, setItems] = useState<Service[]>([])
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState<string | null>(null)
//   const [newItem, setNewItem] = useState<Partial<Service>>({
//     name: '',
//     category: '',
//     price: 0,
//     durationMinutes: 30,
//     isActive: true,
//     description: '',
//     icon: '',
//   })

//   const [page, setPage] = useState(1)
//   const [limit, setLimit] = useState(10)
//   const [total, setTotal] = useState(0)
//   const [search, setSearch] = useState('')
//   const [sortBy, setSortBy] = useState<keyof Service | 'createdAt' | 'updatedAt'>('createdAt')
//   const [order, setOrder] = useState<'asc' | 'desc'>('desc')

//   const query = useMemo(() => {
//     const params = new URLSearchParams()
//     params.set('page', String(page))
//     params.set('limit', String(limit))
//     if (search.trim()) params.set('search', search.trim())
//     params.set('sortBy', String(sortBy))
//     params.set('order', order)
//     return `${BASE_URL}?${params.toString()}`
//   }, [page, limit, search, sortBy, order])

//   const load = async () => {
//     setLoading(true)
//     setError(null)
//     try {
//       const res = await axios.get(query)
//       const data = res.data
//       if (Array.isArray(data)) {
//         setItems(data)
//         setTotal(data.length)
//       } else {
//         setItems(data.items || [])
//         setTotal(data.total || 0)
//       }
//     } catch (e: any) {
//       setError(e?.response?.data?.message || e.message || 'Failed to load services')
//     } finally {
//       setLoading(false)
//     }
//   }

//   useEffect(() => { load() }, [query])

//   const toggleActive = async (id: string, current?: boolean) => {
//     const s = items.find(i => i._id === id)
//     if (!s) return
//     await axios.put(`${BASE_URL}/${id}`, { ...s, isActive: !current })
//     await load()
//   }

//   const createItem = async () => {
//     if (!newItem.name) {
//       setError('Name is required')
//       return
//     }
//     try {
//       setError(null)
//       await axios.post(BASE_URL, newItem)
//       setNewItem({ name: '', category: '', price: 0, durationMinutes: 30, isActive: true, description: '', icon: '' })
//       await load()
//     } catch (e: any) {
//       setError(e?.response?.data?.message || e.message || 'Failed to create service')
//     }
//   }

//   const updateInline = async (svc: Service, patch: Partial<Service>) => {
//     const payload = { ...svc, ...patch }
//     await axios.put(`${BASE_URL}/${svc._id}`, payload)
//     await load()
//   }

//   const remove = async (id: string) => {
//     await axios.delete(`${BASE_URL}/${id}`)
//     await load()
//   }

//   if (loading) return <LoadingPlaceholder label="Loading services..." />
//   if (error) return <ErrorPlaceholder message={error} />

//   return (
//     <div>
//       <TableToolbar
//         title="Services"
//         search={search}
//         setSearch={(v) => { setPage(1); setSearch(v) }}
//         onRefresh={load}
//         onExport={() => {
//           const headers = Object.keys(items[0] || {})
//           const csv = [headers.join(',')].concat(items.map((r: any) => headers.map(h => JSON.stringify(r[h] ?? '')).join(','))).join("\n")
//           const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
//           const url = URL.createObjectURL(blob)
//           const a = document.createElement('a')
//           a.href = url
//           a.download = 'services.csv'
//           a.click()
//           URL.revokeObjectURL(url)
//         }}
//       />
//       <div className="card" style={{ marginBottom: 12 }}>
//         <div style={{ fontWeight: 600, marginBottom: 8 }}>Add service</div>
//         <div className="grid" style={{ gridTemplateColumns: '1.2fr 1fr 0.8fr 0.8fr 0.8fr 1fr 1fr', gap: 8, alignItems: 'end' }}>
//           {/* Name */}
//           <div className="field">
//             <label>Name</label>
//             <input value={newItem.name || ''} onChange={e => setNewItem({ ...newItem, name: e.target.value })} />
//           </div>
//           {/* Category */}
//           <div className="field">
//             <label>Category</label>
//             <input value={newItem.category || ''} onChange={e => setNewItem({ ...newItem, category: e.target.value })} />
//           </div>
//           {/* Icon */}
//           <div className="field">
//             <label>Icon</label>
//             <input value={newItem.icon || ''} onChange={e => setNewItem({ ...newItem, icon: e.target.value })} />
//           </div>
//           {/* Price */}
//           <div className="field">
//             <label>Price</label>
//             <input type="number" value={newItem.price || 0} onChange={e => setNewItem({ ...newItem, price: Number(e.target.value) })} />
//           </div>
//           {/* Duration */}
//           <div className="field">
//             <label>Duration</label>
//             <input type="number" value={newItem.durationMinutes || 0} onChange={e => setNewItem({ ...newItem, durationMinutes: Number(e.target.value) })} />
//           </div>
//           {/* Status */}
//           <div className="field">
//             <label>Status</label>
//             <select value={String(newItem.isActive)} onChange={e => setNewItem({ ...newItem, isActive: e.target.value === 'true' })}>
//               <option value="true">active</option>
//               <option value="false">inactive</option>
//             </select>
//           </div>
//           {/* Description */}
//           <div className="field">
//             <label>Description</label>
//             <input value={newItem.description || ''} onChange={e => setNewItem({ ...newItem, description: e.target.value })} />
//           </div>
//           <button className="btn primary" onClick={createItem} disabled={!newItem.name || !canCreateService}>Create</button>
//         </div>
//       </div>

//       {/* Table */}
//       {items.length === 0 ? (
//         <EmptyPlaceholder title="No services" message="Use the form above to add your first service." />
//       ) : (
//         <DataTable
//           columns={[
//             { key: 'name', header: 'Name', sortable: true, render: (s) => <input value={s.name} onChange={e => updateInline(s, { name: e.target.value })} disabled={!canUpdateService} /> },
//             { key: 'category', header: 'Category', render: (s) => <input value={s.category || ''} onChange={e => updateInline(s, { category: e.target.value })} disabled={!canUpdateService} /> },
//             { key: 'price', header: 'Price', sortable: true, render: (s) => <input type="number" value={s.price || 0} onChange={e => updateInline(s, { price: Number(e.target.value) })} disabled={!canUpdateService} /> },
//             { key: 'durationMinutes', header: 'Duration', sortable: true, render: (s) => <span><input type="number" value={s.durationMinutes || 0} onChange={e => updateInline(s, { durationMinutes: Number(e.target.value) })} disabled={!canUpdateService} /> min</span> },
//             { key: 'isActive', header: 'Status', render: (s) => (
//               <select value={String(s.isActive)} onChange={e => updateInline(s, { isActive: e.target.value === 'true' })} disabled={!canUpdateService}>
//                 <option value="true">active</option>
//                 <option value="false">inactive</option>
//               </select>
//             ) },
//             { key: 'actions', header: '', render: (s) => (
//               <div style={{ display: 'flex', gap: 8 }}>
//                 <button className="btn" onClick={() => toggleActive(s._id, s.isActive)} disabled={!canUpdateService}>Toggle</button>
//                 <button className="btn" onClick={() => remove(s._id)} disabled={!canDeleteService}>Delete</button>
//               </div>
//             ) },
//           ] as Column<Service>[]}
//           rows={items}
//           onSort={(key) => { setSortBy(key as any); setOrder(prev => (sortBy === key && prev === 'asc') ? 'desc' : 'asc') }}
//           sortBy={sortBy as string}
//           order={order}
//           pagination={{ page, limit, total, onPageChange: (p) => setPage(Math.max(1, p)), onLimitChange: (n) => { setPage(1); setLimit(n) } }}
//         />
//       )}

//       <CrudModal open={false} title="" onClose={() => {}}>{null}</CrudModal>
//     </div>
//   )
// }

import React, { useState, useEffect } from 'react';

// Types
interface Category {
  _id: string;
  name: string;
}

interface Service {
  _id: string;
  title: string;
  description: string;
  howItWorks: string;
  image?: string;
  price: number;
  category: Category;
}

interface ServiceForm {
  title: string;
  description: string;
  howItWorks: string;
  image: string;
  price: string;
  category: string;
}

const ServicesManagement: React.FC = () => {
  const BASE_URL = 'http://localhost:5000';
  
  // State management
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [activeTab, setActiveTab] = useState<'categories' | 'services'>('categories');
  
  // Category form state
  const [categoryName, setCategoryName] = useState<string>('');
  const [categoryLoading, setCategoryLoading] = useState<boolean>(false);
  
  // Service form state
  const [serviceForm, setServiceForm] = useState<ServiceForm>({
    title: '',
    description: '',
    howItWorks: '',
    image: '',
    price: '',
    category: ''
  });
  const [serviceLoading, setServiceLoading] = useState<boolean>(false);
  const [editingService, setEditingService] = useState<string | null>(null);

  // Get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/categories`);
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // Fetch services
  const fetchServices = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/services`);
      const data = await response.json();
      setServices(data);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  // Create category
  const createCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) return;
    
    setCategoryLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/categories`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ name: categoryName })
      });
      
      if (response.ok) {
        setCategoryName('');
        fetchCategories();
      } else {
        const error = await response.json();
        alert(error.message || 'Error creating category');
      }
    } catch (error) {
      console.error('Error creating category:', error);
      alert('Error creating category');
    }
    setCategoryLoading(false);
  };

  // Delete category
  const deleteCategory = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    
    try {
      const response = await fetch(`${BASE_URL}/api/categories/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        fetchCategories();
      } else {
        const error = await response.json();
        alert(error.message || 'Error deleting category');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Error deleting category');
    }
  };

  // Handle service form input changes
  const handleServiceInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setServiceForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Create or update service
  const handleServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { title, description, howItWorks, price, category } = serviceForm;
    if (!title || !description || !howItWorks || !price || !category) {
      alert('All fields are required');
      return;
    }
    
    setServiceLoading(true);
    try {
      const serviceData = {
        ...serviceForm,
        price: parseFloat(serviceForm.price)
      };
      
      const url = editingService 
        ? `${BASE_URL}/api/services/${editingService}`
        : `${BASE_URL}/api/services`;
      
      const method = editingService ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: editingService ? getAuthHeaders() : { 'Content-Type': 'application/json' },
        body: JSON.stringify(serviceData)
      });
      
      if (response.ok) {
        setServiceForm({
          title: '',
          description: '',
          howItWorks: '',
          image: '',
          price: '',
          category: ''
        });
        setEditingService(null);
        fetchServices();
      } else {
        const error = await response.json();
        alert(error.message || 'Error saving service');
      }
    } catch (error) {
      console.error('Error saving service:', error);
      alert('Error saving service');
    }
    setServiceLoading(false);
  };

  // Edit service
  const editService = (service: Service) => {
    setServiceForm({
      title: service.title,
      description: service.description,
      howItWorks: service.howItWorks,
      image: service.image || '',
      price: service.price.toString(),
      category: service.category._id
    });
    setEditingService(service._id);
    setActiveTab('services');
  };

  // Delete service
  const deleteService = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    
    try {
      const response = await fetch(`${BASE_URL}/api/services/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        fetchServices();
      } else {
        const error = await response.json();
        alert(error.message || 'Error deleting service');
      }
    } catch (error) {
      console.error('Error deleting service:', error);
      alert('Error deleting service');
    }
  };

  // Cancel edit
  const cancelEdit = () => {
    setEditingService(null);
    setServiceForm({
      title: '',
      description: '',
      howItWorks: '',
      image: '',
      price: '',
      category: ''
    });
  };

  // Load data on component mount
  useEffect(() => {
    fetchCategories();
    fetchServices();
  }, []);

  const containerStyle: React.CSSProperties = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '24px',
    backgroundColor: 'white',
    minHeight: '100vh'
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '32px'
  };

  const tabContainerStyle: React.CSSProperties = {
    display: 'flex',
    marginBottom: '24px',
    borderBottom: '1px solid #e5e7eb'
  };

  const getTabStyle = (isActive: boolean): React.CSSProperties => ({
    padding: '12px 24px',
    fontWeight: '500',
    cursor: 'pointer',
    color: isActive ? '#2563eb' : '#6b7280',
    borderBottom: isActive ? '2px solid #2563eb' : 'none',
    background: 'none',
    border: 'none'
  });

  const sectionStyle: React.CSSProperties = {
    marginBottom: '24px'
  };

  const formContainerStyle: React.CSSProperties = {
    backgroundColor: '#f9fafb',
    padding: '24px',
    borderRadius: '8px',
    marginBottom: '24px'
  };

  const formTitleStyle: React.CSSProperties = {
    fontSize: '1.25rem',
    fontWeight: '600',
    marginBottom: '16px'
  };

  const formStyle: React.CSSProperties = {
    display: 'flex',
    gap: '16px',
    alignItems: 'flex-end'
  };

  const inputStyle: React.CSSProperties = {
    flex: 1,
    padding: '8px 16px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px'
  };

  const buttonStyle: React.CSSProperties = {
    padding: '8px 24px',
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px'
  };

  const deleteButtonStyle: React.CSSProperties = {
    padding: '8px 16px',
    backgroundColor: '#dc2626',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px'
  };

  const editButtonStyle: React.CSSProperties = {
    padding: '8px 16px',
    backgroundColor: '#d97706',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    marginRight: '8px'
  };

  const cancelButtonStyle: React.CSSProperties = {
    padding: '8px 16px',
    backgroundColor: '#6b7280',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px'
  };

  const listContainerStyle: React.CSSProperties = {
    backgroundColor: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '8px'
  };

  const listHeaderStyle: React.CSSProperties = {
    fontSize: '1.25rem',
    fontWeight: '600',
    padding: '24px',
    borderBottom: '1px solid #e5e7eb'
  };

  const listItemStyle: React.CSSProperties = {
    padding: '16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #e5e7eb'
  };

  const serviceFormStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  };

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '16px'
  };

  const textareaStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 16px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    resize: 'vertical' as const
  };

  const serviceItemStyle: React.CSSProperties = {
    padding: '24px',
    borderBottom: '1px solid #e5e7eb'
  };

  const serviceHeaderStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '16px'
  };

  const serviceInfoStyle: React.CSSProperties = {
    flex: 1
  };

  const serviceActionsStyle: React.CSSProperties = {
    display: 'flex',
    gap: '8px',
    marginLeft: '16px'
  };

  const serviceImageStyle: React.CSSProperties = {
    marginTop: '8px',
    width: '128px',
    height: '128px',
    objectFit: 'cover' as const,
    borderRadius: '4px'
  };

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>Services Management</h1>
      
      {/* Tab Navigation */}
      <div style={tabContainerStyle}>
        <button
          onClick={() => setActiveTab('categories')}
          style={getTabStyle(activeTab === 'categories')}
        >
          Categories
        </button>
        <button
          onClick={() => setActiveTab('services')}
          style={getTabStyle(activeTab === 'services')}
        >
          Services
        </button>
      </div>

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div style={sectionStyle}>
          {/* Create Category Form */}
          <div style={formContainerStyle}>
            <h2 style={formTitleStyle}>Create Category</h2>
            <form onSubmit={createCategory} style={formStyle}>
              <input
                type="text"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="Category name"
                style={inputStyle}
                required
              />
              <button
                type="submit"
                disabled={categoryLoading}
                style={{
                  ...buttonStyle,
                  opacity: categoryLoading ? 0.5 : 1,
                  cursor: categoryLoading ? 'not-allowed' : 'pointer'
                }}
              >
                {categoryLoading ? 'Creating...' : 'Create'}
              </button>
            </form>
          </div>

          {/* Categories List */}
          <div style={listContainerStyle}>
            <h2 style={listHeaderStyle}>Categories</h2>
            {categories.length === 0 ? (
              <p style={{ padding: '24px', color: '#6b7280' }}>No categories found</p>
            ) : (
              <>
                {categories.map((category, index) => (
                  <div 
                    key={category._id} 
                    style={{
                      ...listItemStyle,
                      borderBottom: index === categories.length - 1 ? 'none' : '1px solid #e5e7eb'
                    }}
                  >
                    <span style={{ fontWeight: '500' }}>{category.name}</span>
                    <button
                      onClick={() => deleteCategory(category._id)}
                      style={deleteButtonStyle}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}

      {/* Services Tab */}
      {activeTab === 'services' && (
        <div style={sectionStyle}>
          {/* Create/Edit Service Form */}
          <div style={formContainerStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={formTitleStyle}>
                {editingService ? 'Edit Service' : 'Create Service'}
              </h2>
              {editingService && (
                <button onClick={cancelEdit} style={cancelButtonStyle}>
                  Cancel Edit
                </button>
              )}
            </div>
            
            <form onSubmit={handleServiceSubmit} style={serviceFormStyle}>
              <div style={gridStyle}>
                <input
                  type="text"
                  name="title"
                  value={serviceForm.title}
                  onChange={handleServiceInputChange}
                  placeholder="Service title"
                  style={inputStyle}
                  required
                />
                
                <select
                  name="category"
                  value={serviceForm.category}
                  onChange={handleServiceInputChange}
                  style={inputStyle}
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <textarea
                name="description"
                value={serviceForm.description}
                onChange={handleServiceInputChange}
                placeholder="Service description"
                rows={3}
                style={textareaStyle}
                required
              />

              <textarea
                name="howItWorks"
                value={serviceForm.howItWorks}
                onChange={handleServiceInputChange}
                placeholder="How it works"
                rows={3}
                style={textareaStyle}
                required
              />

              <div style={gridStyle}>
                <input
                  type="url"
                  name="image"
                  value={serviceForm.image}
                  onChange={handleServiceInputChange}
                  placeholder="Image URL (optional)"
                  style={inputStyle}
                />
                
                <input
                  type="number"
                  name="price"
                  value={serviceForm.price}
                  onChange={handleServiceInputChange}
                  placeholder="Price"
                  min="0"
                  step="0.01"
                  style={inputStyle}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={serviceLoading}
                style={{
                  ...buttonStyle,
                  opacity: serviceLoading ? 0.5 : 1,
                  cursor: serviceLoading ? 'not-allowed' : 'pointer',
                  width: 'fit-content'
                }}
              >
                {serviceLoading ? 'Saving...' : (editingService ? 'Update Service' : 'Create Service')}
              </button>
            </form>
          </div>

          {/* Services List */}
          <div style={listContainerStyle}>
            <h2 style={listHeaderStyle}>Services</h2>
            {services.length === 0 ? (
              <p style={{ padding: '24px', color: '#6b7280' }}>No services found</p>
            ) : (
              <>
                {services.map((service, index) => (
                  <div 
                    key={service._id} 
                    style={{
                      ...serviceItemStyle,
                      borderBottom: index === services.length - 1 ? 'none' : '1px solid #e5e7eb'
                    }}
                  >
                    <div style={serviceHeaderStyle}>
                      <div style={serviceInfoStyle}>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '8px' }}>
                          {service.title}
                        </h3>
                        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '8px' }}>
                          Category: {service.category?.name || 'Unknown'}
                        </p>
                        <p style={{ color: '#374151', marginBottom: '8px' }}>{service.description}</p>
                        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '8px' }}>
                          <strong>How it works:</strong> {service.howItWorks}
                        </p>
                        <p style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#2563eb' }}>
                          ${service.price}
                        </p>
                        {service.image && (
                          <img 
                            src={service.image} 
                            alt={service.title}
                            style={serviceImageStyle}
                          />
                        )}
                      </div>
                      <div style={serviceActionsStyle}>
                        <button
                          onClick={() => editService(service)}
                          style={editButtonStyle}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteService(service._id)}
                          style={deleteButtonStyle}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicesManagement;
