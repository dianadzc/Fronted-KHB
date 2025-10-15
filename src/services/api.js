// services/api.js
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
// Obtener lista de inventario con mapeo adecuado
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
    
    console.log('📦 Inventario mapeado:', formattedAssets);
    
    return formattedAssets;
  } catch (error) {
    console.error('❌ Error en getInventory:', error);
    return [];
  }
};
// Obtener un ítem de inventario por ID con mapeo adecuado
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
// Función para crear un nuevo ítem de inventario con mapeo adecuado
export const createInventoryItem = async (item) => {
  // Mapear el estado correctamente
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
  
  console.log('📦 Creando activo - Datos enviados:', backendItem);
  
  try {
    const result = await request('/inventory', {
      method: 'POST',
      body: JSON.stringify(backendItem),
    });
    console.log('✅ Activo creado exitosamente:', result);
    return result;
  } catch (error) {
    console.error('❌ Error al crear activo:', error);
    throw error;
  }
};

// Función para actualizar un ítem de inventario con mapeo adecuado
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

// Función para eliminar un ítem de inventario
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

export const createIncident = async (incident) => {
  return request('/incidents', {
    method: 'POST',
    body: JSON.stringify(incident),
  });
};


// ========== MANTENIMIENTO ==========

export const getMaintenance = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const response = await request(`/maintenance${query ? `?${query}` : ''}`);
  
  // Mapear datos del backend al frontend
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
    asset_id: maintenance.idActivo, // ✅ ID del activo
    type: typeMap[maintenance.tipo] || 'preventive', // ✅ Usar 'type' no 'maintenance_type'
    title: maintenance.notas || 'Mantenimiento programado', // ✅ CAMPO REQUERIDO
    description: maintenance.notas || '', // Descripción adicional
    scheduled_date: maintenance.fechaInicio, // ✅ Fecha en formato ISO
    cost: parseFloat(maintenance.costosEstimados) || 0, // ✅ Usar 'cost' no 'estimated_cost'
    notes: maintenance.notas || '',
    status: 'scheduled'
  };
  
  console.log('🔧 Enviando al backend:', backendMaintenance);
  
  try {
    const result = await request('/maintenance', {
      method: 'POST',
      body: JSON.stringify(backendMaintenance),
    });
    console.log('✅ Respuesta exitosa:', result);
    return result;
  } catch (error) {
    console.error('❌ Error al crear mantenimiento:', error);
    throw error;
  }
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
export const getResponsiveForms = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const response = await request(`/responsive-forms${query ? `?${query}` : ''}`);
  return response.forms || [];
};

export const createResponsiveForm = async (form) => {
  return request('/responsive-forms', {
    method: 'POST',
    body: JSON.stringify(form),
  });
};

// ========== REQUISICIONES ==========
// Obtener lista de requisiciones con mapeo adecuado
export const getRequisitions = async (params = {}) => {
  try {
    const query = new URLSearchParams(params).toString();
    const response = await request(`/requisitions${query ? `?${query}` : ''}`);
    
    const requisitions = response.requisitions || [];
    
    console.log('📋 Requisiciones recibidas:', requisitions);
    
    return requisitions;
  } catch (error) {
    console.error('❌ Error al obtener requisiciones:', error);
    return [];
  }
};
// Función para crear una nueva requisición con mapeo adecuado
export const createRequisition = async (requisition) => {
  const backendRequisition = {
    request_type: requisition.request_type,
    amount: parseFloat(requisition.amount),
    currency: requisition.currency,
    payable_to: requisition.payable_to,
    concept: requisition.concept
  };
  
  console.log('📝 Enviando requisición:', backendRequisition);
  
  try {
    const result = await request('/requisitions', {
      method: 'POST',
      body: JSON.stringify(backendRequisition),
    });
    console.log('✅ Requisición creada:', result);
    return result;
  } catch (error) {
    console.error('❌ Error completo:', error);
    throw error;
  }
};

// Función para actualizar una requisición existente
export const updateRequisition = async (id, data) => {
  console.log('✏️ Actualizando requisición:', id, data);
  
  return request(`/requisitions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

// Función para actualizar el estado de una requisición (aprobar/rechazar)
export const updateRequisitionStatus = async (id, approved) => {
  console.log(`${approved ? '✅' : '❌'} Actualizando estado:`, { id, approved });
  
  return request(`/requisitions/${id}/approve`, {
    method: 'PUT',
    body: JSON.stringify({ 
      approved: approved,
      notes: approved ? 'Aprobada desde el sistema' : 'Rechazada desde el sistema'
    }),
  });
};
// Función para "descargar" (mostrar) la requisición en formato PDF
export const downloadRequisitionPDF = async (id) => {
  try {
    const response = await request(`/requisitions/${id}/pdf`);
    console.log('📄 Datos para PDF:', response);
    return response.requisition; // Devolver la requisición completa
  } catch (error) {
    console.error('❌ Error al obtener datos del PDF:', error);
    throw error;
  }
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
  console.log('👤 Creando cliente:', clientData);
  
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

// ========== USUARIOS ========== ← AQUÍ ESTÁ LA CORRECCIÓN
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

// Export default
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
  createIncident,
  getMaintenance,
  createMaintenance,
  completeMaintenance,
  getResponsiveForms,
  createResponsiveForm,
   getClients,
  createClient,
  getRequisitions,
  createRequisition,
  updateRequisition,
  updateRequisitionStatus,
  downloadRequisitionPDF,
  getReports,
  getUsers,
  createUser,
  updateUser
};

export default api;