const RAW_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
const CLEAN_API_URL = RAW_API_URL.replace(/\/+$/, '')
const API_BASE_URL = CLEAN_API_URL.endsWith('/api') ? CLEAN_API_URL : `${CLEAN_API_URL}/api`

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem('athletica_token')
  const headers = new Headers(options.headers || {})

  let body = options.body
  if (body && typeof body === 'object' && !(body instanceof FormData)) {
    body = JSON.stringify(body)
  }

  if (body && !headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    body,
  })
  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    const error = new Error(data.message || `Request failed with status ${response.status}`)
    error.status = response.status
    throw error
  }

  return data
}

export { API_BASE_URL }
