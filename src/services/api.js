import axios from 'axios'
import toast from 'react-hot-toast'

// Configuración base de Axios
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para agregar token de autenticación
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    console.error('API Error:', error)
    
    // Manejar errores de autenticación
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
      toast.error('Sesión expirada. Por favor, inicia sesión nuevamente.')
      return Promise.reject(error)
    }
    
    // Manejar otros errores
    const message = error.response?.data?.message || 
                   error.response?.data?.errors?.[0]?.msg ||
                   'Ha ocurrido un error inesperado'
    
    toast.error(message)
    return Promise.reject(error)
  }
)

// === SERVICIOS DE AUTENTICACIÓN ===
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
  changePassword: (passwords) => api.put('/auth/change-password', passwords),
}

// === SERVICIOS DE INVENTARIO ===
export const inventoryAPI = {
  getAssets: (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return api.get(`/inventory${queryString ? `?${queryString}` : ''}`)
  },
  getAsset: (id) => api.get(`/inventory/${id}`),
  createAsset: (assetData) => api.post('/inventory', assetData),
  updateAsset: (id, assetData) => api.put(`/inventory/${id}`, assetData),
  deleteAsset: (id) => api.delete(`/inventory/${id}`),
  getCategories: () => api.get('/inventory/categories/all'),
  createCategory: (categoryData) => api.post('/inventory/categories', categoryData),
  getStats: () => api.get('/inventory/stats/overview'),
}

// === SERVICIOS DE INCIDENCIAS ===
export const incidentsAPI = {
  getIncidents: (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return api.get(`/incidents${queryString ? `?${queryString}` : ''}`)
  },
  getIncident: (id) => api.get(`/incidents/${id}`),
  createIncident: (incidentData) => api.post('/incidents', incidentData),
  updateIncident: (id, incidentData) => api.put(`/incidents/${id}`, incidentData),
  assignIncident: (id, assignData) => api.put(`/incidents/${id}/assign`, assignData),
  resolveIncident: (id, solutionData) => api.put(`/incidents/${id}/resolve`, solutionData),
  getStats: () => api.get('/incidents/stats/overview'),
}

// === SERVICIOS DE MANTENIMIENTOS ===
export const maintenanceAPI = {
  getMaintenances: (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return api.get(`/maintenance${queryString ? `?${queryString}` : ''}`)
  },
  getMaintenance: (id) => api.get(`/maintenance/${id}`),
  createMaintenance: (maintenanceData) => api.post('/maintenance', maintenanceData),
  updateMaintenance: (id, maintenanceData) => api.put(`/maintenance/${id}`, maintenanceData),
  startMaintenance: (id) => api.put(`/maintenance/${id}/start`),
  completeMaintenance: (id, completionData) => api.put(`/maintenance/${id}/complete`, completionData),
  getUpcoming: (days = 30) => api.get(`/maintenance/upcoming/list?days=${days}`),
  getOverdue: () => api.get('/maintenance/overdue/list'),
  getStats: () => api.get('/maintenance/stats/overview'),
}

// === SERVICIOS DE FORMATOS RESPONSIVOS ===
export const responsiveFormsAPI = {
  getForms: (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return api.get(`/responsive-forms${queryString ? `?${queryString}` : ''}`)
  },
  getForm: (id) => api.get(`/responsive-forms/${id}`),
  createForm: (formData) => api.post('/responsive-forms', formData),
  approveForm: (id, approvalData) => api.put(`/responsive-forms/${id}/approve`, approvalData),
  getAssetHistory: (assetId) => api.get(`/responsive-forms/asset/${assetId}/history`),
  getPendingForms: () => api.get('/responsive-forms/pending/approval'),
  getFormPDF: (id) => api.get(`/responsive-forms/${id}/pdf`),
  getStats: () => api.get('/responsive-forms/stats/overview'),
}

// === SERVICIOS DE REQUISICIONES ===
export const requisitionsAPI = {
  getRequisitions: (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return api.get(`/requisitions${queryString ? `?${queryString}` : ''}`)
  },
  getRequisition: (id) => api.get(`/requisitions/${id}`),
  createRequisition: (requisitionData) => api.post('/requisitions', requisitionData),
  updateRequisition: (id, requisitionData) => api.put(`/requisitions/${id}`, requisitionData),
  reviewRequisition: (id, reviewData) => api.put(`/requisitions/${id}/review`, reviewData),
  completeRequisition: (id, completionData) => api.put(`/requisitions/${id}/complete`, completionData),
  getPendingRequisitions: () => api.get('/requisitions/pending/approval'),
  getRequisitionPDF: (id) => api.get(`/requisitions/${id}/pdf`),
  getStats: () => api.get('/requisitions/stats/overview'),
}

// === SERVICIOS DE REPORTES ===
export const reportsAPI = {
  getDashboard: () => api.get('/reports/dashboard'),
  getInventoryReport: (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return api.get(`/reports/inventory${queryString ? `?${queryString}` : ''}`)
  },
  getIncidentsReport: (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return api.get(`/reports/incidents${queryString ? `?${queryString}` : ''}`)
  },
  getMaintenanceReport: (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return api.get(`/reports/maintenance${queryString ? `?${queryString}` : ''}`)
  },
  getResponsiveFormsReport: (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return api.get(`/reports/responsive-forms${queryString ? `?${queryString}` : ''}`)
  },
  getRequisitionsReport: (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return api.get(`/reports/requisitions${queryString ? `?${queryString}` : ''}`)
  },
  getUserActivityReport: (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return api.get(`/reports/user-activity${queryString ? `?${queryString}` : ''}`)
  },
}

// === SERVICIOS DE USUARIOS (Solo Admin) ===
export const usersAPI = {
  getUsers: (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return api.get(`/auth/users${queryString ? `?${queryString}` : ''}`)
  },
  createUser: (userData) => api.post('/auth/register', userData),
  updateUser: (id, userData) => api.put(`/auth/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/auth/users/${id}`),
  toggleUserStatus: (id) => api.put(`/auth/users/${id}/toggle-status`),
}

// Funciones utilitarias
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token)
    api.defaults.headers.Authorization = `Bearer ${token}`
  } else {
    localStorage.removeItem('token')
    delete api.defaults.headers.Authorization
  }
}

export const isAuthenticated = () => {
  return !!localStorage.getItem('token')
}

export const getCurrentUser = () => {
  const user = localStorage.getItem('user')
  return user ? JSON.parse(user) : null
}

export const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  delete api.defaults.headers.Authorization
}

export default api