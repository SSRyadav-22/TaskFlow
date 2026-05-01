import axios from 'axios'

const api = axios.create({
  // Locally: falls back to '/api' (Vite proxies to localhost:8000)
  // Production: set VITE_API_URL=https://your-app.up.railway.app/api in Vercel
  baseURL: import.meta.env.VITE_API_URL || '/api',
})

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('access')
  if (token) cfg.headers.Authorization = `Bearer ${token}`

  // Attach current org so backend can scope queries
  try {
    const org = JSON.parse(localStorage.getItem('taskflow_org'))
    if (org?.id) cfg.headers['X-Org-Id'] = org.id
  } catch { /* ignore */ }

  return cfg
})

api.interceptors.response.use(
  r => r,
  async err => {
    const original = err.config
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        const refresh = localStorage.getItem('refresh')
        const { data } = await axios.post('/api/auth/token/refresh/', { refresh })
        localStorage.setItem('access', data.access)
        original.headers.Authorization = `Bearer ${data.access}`
        return api(original)
      } catch {
        localStorage.clear()
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

export default api
