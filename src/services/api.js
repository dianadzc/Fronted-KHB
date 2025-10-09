// services/api.js - VERSIÓN ACTUALIZADA Y CORREGIDA
const API_URL = 'http://localhost:5000/api';

// Configuración base para fetch
async function request(endpoint, options = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
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
      throw new Error(data.message || data.error || 'Error en la petición');
    }
    
    return data;
  } catch (error) {
    console.error('Error en API:', error);
    throw error;
  }
}

// ========== AUTENTICACIÓN ==========
export const login = async (username, password) => {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
};

export const register = async (userData) => {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
};

export const getProfile = async () => {
  return request('/auth/profile');
};

/*export const getUsers = async () => {
  const response = await request('/auth/users');
  return response.users || [];
};

export const createUser = async (userData) => {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
};

export const updateUser = async (id, userData) => {
  return request(`/auth/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(userData),
  });
};*/

// ========== INVENTARIO (ASSETS) ==========
export const getInventory = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const response = await request(`/inventory${query ? `?${query}` : ''}`);
  return response.assets || [];
};

export const getInventoryById = async (id) => {
  const response = await request(`/inventory/${id}`);
  return response.asset;
};

export const createInventoryItem = async (item) => {
  // Convertir del formato del frontend al backend
  const backendItem = {
    name: item.nombre,
    description: item.descripcion,
    category_id: getCategoryIdByType(item.tipo),
    asset_code: `ASSET-${Date.now()}`, // Generar código único
    status: item.estado.toLowerCase().replace(' ', '_'),
    purchase_price: parseFloat(item.valorEstimado),
    brand: item.marca || '',
    model: item.modelo || ''
  };
  
  return request('/inventory', {
    method: 'POST',
    body: JSON.stringify(backendItem),
  });
};

export const updateInventoryItem = async (id, item) => {
  const backendItem = {
    name: item.nombre,
    description: item.descripcion,
    category_id: getCategoryIdByType(item.tipo),
    status: item.estado.toLowerCase().replace(' ', '_'),
    purchase_price: parseFloat(item.valorEstimado),
  };
  
  return request(`/inventory/${id}`, {
    method: 'PUT',
    body: JSON.stringify(backendItem),
  });
};

export const deleteInventoryItem = async (id) => {
  return request(`/inventory/${id}`, {
    method: 'DELETE',
  });
};

// Función auxiliar para mapear tipos a category_id
function getCategoryIdByType(tipo) {
  const mapping = {
    'Computadora': 1,
    'Impresora': 2,
    'Cámara': 3,
    'Red': 4,
    'Software': 5,
    'Otro': 8
  };
  return mapping[tipo] || 8;
}

// ========== INCIDENCIAS ==========
export const getIncidents = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const response = await request(`/incidents${query ? `?${query}` : ''}`);
  return response.incidents || [];
};

export const getIncidentById = async (id) => {
  const response = await request(`/incidents/${id}`);
  return response.incident;
};

export const createIncident = async (incident) => {
  const backendIncident = {
    title: incident.titulo || incident.title,
    description: incident.descripcion || incident.description,
    priority: incident.prioridad?.toLowerCase() || 'medium',
    asset_id: incident.idActivo || incident.asset_id
  };
  
  return request('/incidents', {
    method: 'POST',
    body: JSON.stringify(backendIncident),
  });
};

export const updateIncidentStatus = async (id, status) => {
  return request(`/incidents/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
};

// ========== MANTENIMIENTO ==========
export const getMaintenance = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const response = await request(`/maintenance${query ? `?${query}` : ''}`);
  return response.maintenances || [];
};

export const createMaintenance = async (maintenance) => {
  const backendMaintenance = {
    asset_id: maintenance.idActivo || maintenance.asset_id,
    type: maintenance.tipo?.toLowerCase() || 'preventive',
    title: maintenance.titulo || `Mantenimiento ${maintenance.tipo}`,
    description: maintenance.notas || maintenance.description,
    scheduled_date: maintenance.fechaInicio || maintenance.scheduled_date,
    cost: parseFloat(maintenance.costosEstimados || maintenance.cost || 0)
  };
  
  return request('/maintenance', {
    method: 'POST',
    body: JSON.stringify(backendMaintenance),
  });
};

export const completeMaintenance = async (id) => {
  return request(`/maintenance/${id}/complete`, {
    method: 'PUT',
    body: JSON.stringify({ notes: 'Completado desde el sistema' }),
  });
};

// ========== FORMATOS RESPONSIVOS ==========
export const getResponsiveForms = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const response = await request(`/responsive-forms${query ? `?${query}` : ''}`);
  return response.forms || [];
};

export const createResponsiveForm = async (form) => {
  const backendForm = {
    asset_id: form.idActivo || form.asset_id,
    new_responsible_id: 1, // Usuario por defecto, ajustar según necesidad
    transfer_date: new Date().toISOString().split('T')[0],
    reason: `Asignación de ${form.tipoequipo}`,
    conditions: `Marca: ${form.marca}, Serie: ${form.serie}`
  };
  
  return request('/responsive-forms', {
    method: 'POST',
    body: JSON.stringify(backendForm),
  });
};

export const returnAsset = async (id) => {
  return request(`/responsive-forms/${id}/return`, {
    method: 'PUT',
  });
};

export const downloadResponsiveFormPDF = async (id) => {
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
};

// ========== REQUISICIONES ==========
export const getRequisitions = async () => {
  // Por ahora devolver array vacío ya que no está implementado en el backend
  return [];
};

export const createRequisition = async (requisition) => {
  // Implementar cuando el backend esté listo
  console.log('Crear requisición:', requisition);
  return { message: 'Funcionalidad en desarrollo' };
};

export const updateRequisitionStatus = async (id, status) => {
  console.log('Actualizar requisición:', id, status);
  return { message: 'Funcionalidad en desarrollo' };
};

export const downloadRequisitionPDF = async (id) => {
  console.log('Descargar PDF requisición:', id);
};

// ========== REPORTES ==========
export const getReports = async () => {
  const response = await request('/reports/dashboard');
  return response.dashboard || {};
};

export const downloadInventoryReport = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/reports/inventory`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (!response.ok) throw new Error('Error al descargar reporte');
  
  const data = await response.json();
  console.log('Reporte de inventario:', data);
  // Aquí puedes agregar lógica para descargar como PDF
};

// ========== USUARIOS ==========
export const getUsers = async () => {
  // Por ahora devolver array vacío ya que no hay endpoint en el backend
  return [];
};

export const updateUser = async (id, userData) => {
  console.log('Actualizar usuario:', id, userData);
  return { message: 'Funcionalidad en desarrollo' };
};

// Export default con todas las funciones
const api = {
  login,
  register,
  getProfile,
  getInventory,
  getInventoryById,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  getIncidents,
  getIncidentById,
  createIncident,
  updateIncidentStatus,
  getMaintenance,
  createMaintenance,
  completeMaintenance,
  getResponsiveForms,
  createResponsiveForm,
  returnAsset,
  downloadResponsiveFormPDF,
  getRequisitions,
  createRequisition,
  updateRequisitionStatus,
  downloadRequisitionPDF,
  getReports,
  downloadInventoryReport,
  getUsers,
  updateUser
};

export default api;