// src/services/api.js
import axios from 'axios';

// Configura la base de la API
const API_URL = 'https://tu-servidor-backend.com/api';

// ✅ 1. Instancia principal de Axios
export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ✅ 2. Función para setear el token global
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('token', token);
  } else {
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('token');
  }
};

// ✅ 3. API de autenticación (esto es lo que importa)
export const authAPI = {
  login: async (credentials) => {
    const res = await api.post('/login', credentials);
    return res.data;
  },

  register: async (data) => {
    const res = await api.post('/register', data);
    return res.data;
  },

  getProfile: async () => {
    const res = await api.get('/profile');
    return res.data;
  },

  changePassword: async (data) => {
    const res = await api.post('/change-password', data);
    return res.data;
  },
};

// ✅ 4. Función para cerrar sesión
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  delete api.defaults.headers.common['Authorization'];
};


// services/api.js
/*const API_URL = 'http://localhost:5000';

class ApiService {
  // Configuración base para fetch
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(`${API_URL}${endpoint}`, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error en la petición');
      }
      
      return data;
    } catch (error) {
      console.error('Error en API:', error);
      throw error;
    }
  }

  // ========== AUTENTICACIÓN ==========
  async login(username, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // ========== INVENTARIO ==========
  async getInventory() {
    return this.request('/inventory');
  }

  async getInventoryById(id) {
    return this.request(`/inventory/${id}`);
  }

  async createInventoryItem(item) {
    return this.request('/inventory', {
      method: 'POST',
      body: JSON.stringify(item),
    });
  }

  async updateInventoryItem(id, item) {
    return this.request(`/inventory/${id}`, {
      method: 'PUT',
      body: JSON.stringify(item),
    });
  }

  async deleteInventoryItem(id) {
    return this.request(`/inventory/${id}`, {
      method: 'DELETE',
    });
  }

  // ========== INCIDENCIAS ==========
  async getIncidents() {
    return this.request('/incidents');
  }

  async getIncidentById(id) {
    return this.request(`/incidents/${id}`);
  }

  async createIncident(incident) {
    return this.request('/incidents', {
      method: 'POST',
      body: JSON.stringify(incident),
    });
  }

  async updateIncidentStatus(id, status) {
    return this.request(`/incidents/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ estado: status }),
    });
  }

  // ========== MANTENIMIENTO ==========
  async getMaintenance() {
    return this.request('/maintenance');
  }

  async createMaintenance(maintenance) {
    return this.request('/maintenance', {
      method: 'POST',
      body: JSON.stringify(maintenance),
    });
  }

  async completeMaintenance(id) {
    return this.request(`/maintenance/${id}/complete`, {
      method: 'PATCH',
    });
  }

  // ========== FORMATOS RESPONSIVOS ==========
  async getResponsiveForms() {
    return this.request('/responsive-forms');
  }

  async createResponsiveForm(form) {
    return this.request('/responsive-forms', {
      method: 'POST',
      body: JSON.stringify(form),
    });
  }

  async returnAsset(id) {
    return this.request(`/responsive-forms/${id}/return`, {
      method: 'PATCH',
    });
  }

  async downloadResponsiveFormPDF(id) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/responsive-forms/${id}/pdf`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) throw new Error('Error al descargar PDF');
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `formato-responsivo-${id}.pdf`;
    a.click();
  }

  // ========== REQUISICIONES ==========
  async getRequisitions() {
    return this.request('/requisitions');
  }

  async createRequisition(requisition) {
    return this.request('/requisitions', {
      method: 'POST',
      body: JSON.stringify(requisition),
    });
  }

  async updateRequisitionStatus(id, status) {
    return this.request(`/requisitions/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ estado: status }),
    });
  }

  async downloadRequisitionPDF(id) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/requisitions/${id}/pdf`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) throw new Error('Error al descargar PDF');
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `requisicion-${id}.pdf`;
    a.click();
  }

  // ========== REPORTES ==========
  async getReports() {
    return this.request('/reports');
  }

  async downloadInventoryReport() {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/reports/inventory`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) throw new Error('Error al descargar reporte');
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-inventario.pdf`;
    a.click();
  }

  // ========== USUARIOS ==========
  async getUsers() {
    return this.request('/auth/users');
  }

  async updateUser(id, userData) {
    return this.request(`/auth/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }
}

export const logout = async () => {
  // ejemplo de lógica para cerrar sesión
  localStorage.removeItem('token');
  return true;
};


export default new ApiService();*/