// const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || '/api'

// const getAuthHeader = () => {
//   const token = localStorage.getItem('token')
//   return token ? { Authorization: `Bearer ${token}` } : {}
// }

// export const api = {
//   async get<T>(url: string): Promise<T> {
//     const res = await fetch(`${API_BASE}${url}`, { headers: { 'Content-Type': 'application/json', ...getAuthHeader() }, credentials: 'include' })
//     const data = await res.json().catch(() => ({}))
//     if (!res.ok) throw new Error(data?.message || `GET ${url} failed`)
//     return data
//   },
//   async post<T>(url: string, body?: any): Promise<T> {
//     const res = await fetch(`${API_BASE}${url}`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...getAuthHeader() }, body: JSON.stringify(body || {}), credentials: 'include' })
//     const data = await res.json().catch(() => ({}))
//     if (!res.ok) throw new Error(data?.message || `POST ${url} failed`)
//     return data
//   },
//   async put<T>(url: string, body?: any): Promise<T> {
//     const res = await fetch(`${API_BASE}${url}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', ...getAuthHeader() }, body: JSON.stringify(body || {}), credentials: 'include' })
//     const data = await res.json().catch(() => ({}))
//     if (!res.ok) throw new Error(data?.message || `PUT ${url} failed`)
//     return data
//   },
//   async delete<T>(url: string, body?: any): Promise<T> {
//     const res = await fetch(`${API_BASE}${url}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json', ...getAuthHeader() }, body: body ? JSON.stringify(body) : undefined, credentials: 'include' })
//     const data = await res.json().catch(() => ({}))
//     if (!res.ok) throw new Error(data?.message || `DELETE ${url} failed`)
//     return data
//   },
// }

const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || '/api';

const getAuthHeader = (): Record<string, string> => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const handleResponse = async <T>(res: Response): Promise<T> => {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.message || `Request failed with status ${res.status}`);
  }
  return data;
};

const apiRequest = async <T>(url: string, method: string, body?: any): Promise<T> => {
  const res = await fetch(`${API_BASE}${url}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include',
  });

  return handleResponse<T>(res);
};

export const api = {
  async get<T>(url: string): Promise<T> {
    return apiRequest<T>(url, 'GET');
  },

  async post<T>(url: string, body?: any): Promise<T> {
    return apiRequest<T>(url, 'POST', body);
  },

  async put<T>(url: string, body?: any): Promise<T> {
    return apiRequest<T>(url, 'PUT', body);
  },

  async delete<T>(url: string, body?: any): Promise<T> {
    return apiRequest<T>(url, 'DELETE', body);
  },
};
