const BASE_URL = 'https://mila10-basura-inteligente.hf.space'

function getToken() {
  return localStorage.getItem('access_token')
}

function authHeaders() {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function handleResponse(res) {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Error desconocido' }))
    throw new Error(err.detail || `Error ${res.status}`)
  }
  return res.json()
}

// AUTH
export const authAPI = {
  register: (data) =>
    fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse),

  login: (data) =>
    fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse),

  me: () =>
    fetch(`${BASE_URL}/api/auth/me`, {
      headers: authHeaders(),
    }).then(handleResponse),
}

// DETECTIONS
export const detectionsAPI = {
  analyze: (file, zona = '', zona_detalle = '') => {
    const formData = new FormData()
    formData.append('file', file)
    if (zona) formData.append('zona', zona)
    if (zona_detalle) formData.append('zona_detalle', zona_detalle)
    return fetch(`${BASE_URL}/api/detections/analyze`, {
      method: 'POST',
      headers: authHeaders(),
      body: formData,
    }).then(handleResponse)
  },

  history: (params = {}) => {
    const query = new URLSearchParams()
    if (params.limit)     query.set('limit', params.limit)
    if (params.skip)      query.set('skip', params.skip)
    if (params.categoria) query.set('categoria', params.categoria)
    if (params.zona)      query.set('zona', params.zona)
    if (params.fecha)     query.set('fecha', params.fecha)
    return fetch(`${BASE_URL}/api/detections/history?${query}`, {
      headers: authHeaders(),
    }).then(handleResponse)
  },

  exportCSV: async (params = {}) => {
    const query = new URLSearchParams()
    if (params.categoria) query.set('categoria', params.categoria)
    if (params.zona)      query.set('zona', params.zona)
    if (params.fecha)     query.set('fecha', params.fecha)
    const res = await fetch(`${BASE_URL}/api/detections/history/export?${query}`, {
      headers: authHeaders(),
    })
    if (!res.ok) throw new Error('Error al exportar')
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'historial_basuras.csv'
    a.click()
    URL.revokeObjectURL(url)
  },

  stats: () =>
    fetch(`${BASE_URL}/api/detections/stats/global`, {
      headers: authHeaders(),
    }).then(handleResponse),

  detail: (id) =>
    fetch(`${BASE_URL}/api/detections/${id}`, {
      headers: authHeaders(),
    }).then(handleResponse),
}

export const imageUrl = (path) => {
  if (!path) return ''
  if (path.startsWith('http')) return path
  return `${BASE_URL}${path}`
}
