// services/api.js - VERSIÓN ACTUALIZADA CON INCIDENCIAS COMPLETAS
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
  const response = await request('/auth/profile');
  return response.user;
};

// ========== INVENTARIO ==========
export const getInventory = async (params = {}) => {
  try {
    const query = new URLSearchParams(params).toString();
    const response = await request(`/inventory${query ? `?${query}` : ''}`);
    
    const assets = response.assets || [];
    
    const formattedAssets = assets.map(asset => ({
      id: asset._id || asset.id,
      idActivo: asset._id || asset.id,
      name: asset.name,
      nombre: asset.name,
      description: asset.description,
      descripcion: asset.description,
      asset_code: asset.asset_code,
      category_name: asset.category?.name || asset.category_name || 'Otro',
      tipo: asset.category?.name || asset.category_name || 'Otro',
      status: asset.status,
      purchase_price: asset.purchase_price,
      valorEstimado: asset.purchase_price,
      brand: asset.brand,
      marca: asset.brand,
      model: asset.model,
      modelo: asset.model
    }));
    
    return formattedAssets;
  } catch (error) {
    console.error('❌ Error en getInventory:', error);
    return [];
  }
};

export const getInventoryById = async (id) => {
  const response = await request(`/inventory/${id}`);
  const asset = response.asset;
  
  return {
    id: asset._id || asset.id,
    idActivo: asset._id || asset.id,
    name: asset.name,
    nombre: asset.name,
    description: asset.description,
    descripcion: asset.description,
    asset_code: asset.asset_code,
    category_name: asset.category?.name || asset.category_name || 'Otro',
    tipo: asset.category?.name || asset.category_name || 'Otro',
    status: asset.status,
    purchase_price: asset.purchase_price,
    valorEstimado: asset.purchase_price,
    brand: asset.brand,
    marca: asset.brand,
    model: asset.model,
    modelo: asset.model
  };
};

export const createInventoryItem = async (item) => {
  const statusMap = {
    'Disponible': 'active',
    'En uso': 'in_use',
    'En mantenimiento': 'maintenance',
    'Dado de baja': 'inactive'
  };

  const backendItem = {
    name: item.nombre,
    description: item.descripcion,
    asset_code: `ASSET-${Date.now()}`,
    serial_number: item.serie || '',
    status: statusMap[item.estado] || 'active',
    purchase_date: new Date().toISOString().split('T')[0],
    purchase_price: parseFloat(item.valorEstimado) || 0,
    brand: item.marca || '',
    model: item.modelo || '',
    location: 'Almacén',
    notes: item.descripcion || ''
  };
  
  return request('/inventory', {
    method: 'POST',
    body: JSON.stringify(backendItem),
  });
};

export const updateInventoryItem = async (id, item) => {
  const statusMap = {
    'Disponible': 'active',
    'En uso': 'in_use',
    'En mantenimiento': 'maintenance',
    'Dado de baja': 'inactive'
  };

  const backendItem = {
    name: item.nombre,
    description: item.descripcion,
    status: statusMap[item.estado] || 'active',
    purchase_price: parseFloat(item.valorEstimado) || 0,
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
  return request('/incidents', {
    method: 'POST',
    body: JSON.stringify(incident),
  });
};

export const updateIncident = async (id, incident) => {
  return request(`/incidents/${id}`, {
    method: 'PUT',
    body: JSON.stringify(incident),
  });
};

export const assignIncident = async (id, userId) => {
  return request(`/incidents/${id}/assign`, {
    method: 'PUT',
    body: JSON.stringify({ assigned_to: userId }),
  });
};

export const resolveIncident = async (id, solution) => {
  return request(`/incidents/${id}/resolve`, {
    method: 'PUT',
    body: JSON.stringify({ solution }),
  });
};

export const deleteIncident = async (id) => {
  return request(`/incidents/${id}`, {
    method: 'DELETE',
  });
};

export const getIncidentStats = async () => {
  const response = await request('/incidents/stats/overview');
  return response.stats || {};
};

// ========== MANTENIMIENTO ==========
export const getMaintenance = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const response = await request(`/maintenance${query ? `?${query}` : ''}`);
  
  const maintenances = response.maintenances || [];
  return maintenances.map(m => ({
    idMantenimiento: m._id,
    idActivo: m.asset_id?._id || m.asset_id,
    nombreActivo: m.asset_id?.name,
    tipo: formatMaintenanceType(m.type),
    fechaInicio: m.scheduled_date,
    fechaFin: m.completed_date,
    notas: m.description || m.notes || '',
    costosEstimados: m.cost || 0,
    status: m.status,
    titulo: m.title
  }));
};

const formatMaintenanceType = (type) => {
  const typeMap = {
    'preventive': 'Preventivo',
    'corrective': 'Correctivo',
    'predictive': 'Predictivo'
  };
  return typeMap[type] || 'Preventivo';
};

export const createMaintenance = async (maintenance) => {
  const typeMap = {
    'Preventivo': 'preventive',
    'Correctivo': 'corrective',
    'Predictivo': 'predictive'
  };

  const backendMaintenance = {
    asset_id: maintenance.idActivo,
    type: typeMap[maintenance.tipo] || 'preventive',
    title: maintenance.notas || 'Mantenimiento programado',
    description: maintenance.notas || '',
    scheduled_date: maintenance.fechaInicio,
    cost: parseFloat(maintenance.costosEstimados) || 0,
    notes: maintenance.notas || '',
    status: 'scheduled'
  };
  
  return request('/maintenance', {
    method: 'POST',
    body: JSON.stringify(backendMaintenance),
  });
};

export const completeMaintenance = async (id) => {
  return request(`/maintenance/${id}/complete`, {
    method: 'PUT',
    body: JSON.stringify({
      notes: 'Mantenimiento completado',
      cost: 0
    }),
  });
};

// ========== FORMATOS RESPONSIVOS ==========
export const getResponsiveForms = async () => {
  return request('/responsive-forms');
};

export const createResponsiveForm = async (data) => {
  return request('/responsive-forms', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateResponsiveForm = async (id, data) => {
  return request(`/responsive-forms/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const deleteResponsiveForm = async (id) => {
  return request(`/responsive-forms/${id}`, {
    method: 'DELETE',
  });
};

export const downloadResponsiveFormPDF = async (id) => {
  return request(`/responsive-forms/${id}`);
};

export const getEquipments = async () => {
  return request('/responsive-forms/catalog/equipments');
};

export const createEquipment = async (data) => {
  return request('/responsive-forms/catalog/equipments', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const getEmployees = async () => {
  return request('/responsive-forms/catalog/employees');
};

export const createEmployee = async (data) => {
  return request('/responsive-forms/catalog/employees', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

// ========== REQUISICIONES ==========
export const getRequisitions = async (params = {}) => {
  try {
    const query = new URLSearchParams(params).toString();
    const response = await request(`/requisitions${query ? `?${query}` : ''}`);
    return response.requisitions || [];
  } catch (error) {
    console.error('❌ Error al obtener requisiciones:', error);
    return [];
  }
};

export const createRequisition = async (requisition) => {
  const backendRequisition = {
    request_type: requisition.request_type,
    amount: parseFloat(requisition.amount),
    currency: requisition.currency,
    payable_to: requisition.payable_to,
    concept: requisition.concept
  };
  
  return request('/requisitions', {
    method: 'POST',
    body: JSON.stringify(backendRequisition),
  });
};

export const updateRequisition = async (id, data) => {
  return request(`/requisitions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const updateRequisitionStatus = async (id, approved) => {
  return request(`/requisitions/${id}/approve`, {
    method: 'PUT',
    body: JSON.stringify({ 
      approved: approved,
      notes: approved ? 'Aprobada desde el sistema' : 'Rechazada desde el sistema'
    }),
  });
};

export const downloadRequisitionPDF = async (id) => {
  try {
    const response = await request(`/requisitions/${id}/pdf`);
    return response.requisition;
  } catch (error) {
    console.error('❌ Error al obtener datos del PDF:', error);
    throw error;
  }
};

export const deleteRequisition = async (id) => {
  return request(`/requisitions/${id}`, {
    method: 'DELETE',
  });
};

// ========== CLIENTES ==========
export const getClients = async () => {
  try {
    const response = await request('/clients');
    return response.clients || [];
  } catch (error) {
    console.error('❌ Error al obtener clientes:', error);
    return [];
  }
};

export const createClient = async (clientData) => {
  return request('/clients', {
    method: 'POST',
    body: JSON.stringify(clientData),
  });
};

// ========== REPORTES ==========
export const getReports = async () => {
  const response = await request('/reports/dashboard');
  return response.dashboard || {};
};

// ========== USUARIOS ==========
export const getUsers = async () => {
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
};

// Export default con todas las funciones
const api = {
  // Auth
  login,
  register,
  getProfile,
  // Inventory
  getInventory,
  getInventoryById,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  // Incidents
  getIncidents,
  getIncidentById,
  createIncident,
  updateIncident,
  assignIncident,
  resolveIncident,
  deleteIncident,
  getIncidentStats,
  // Maintenance
  getMaintenance,
  createMaintenance,
  completeMaintenance,
  // Responsive Forms
  getResponsiveForms,
  createResponsiveForm,
  updateResponsiveForm,
  deleteResponsiveForm,
  downloadResponsiveFormPDF,
  getEquipments,
  createEquipment,
  getEmployees,
  createEmployee,
  // Clients
  getClients,
  createClient,
  // Requisitions
  getRequisitions,
  createRequisition,
  updateRequisition,
  updateRequisitionStatus,
  deleteRequisition,
  downloadRequisitionPDF,
  // Reports
  getReports,
  // Users
  getUsers,
  createUser,
  updateUser,
  // Request directo
  request
};

export default api;