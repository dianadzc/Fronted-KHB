// src/pages/ResponsiveForms.jsx - VERSIÓN ACTUALIZADA CON TOAST
import { useState, useEffect } from 'react';
import { FileText, Plus, Download, Eye, Edit, Trash2, UserPlus, Laptop } from 'lucide-react';
import toast from 'react-hot-toast'; // ← IMPORTACIÓN AGREGADA
import { generateResponsiveFormPDF, previewResponsiveFormPDF } from '../services/responsivePDFGenerator';
import api from '../services/api';

export default function ResponsiveForms() {
  const [forms, setForms] = useState([]);
  const [equipments, setEquipments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showEquipmentModal, setShowEquipmentModal] = useState(false);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('Todas');
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    equipment_type: '',
    brand: '',
    serial_number: '',
    acquisition_cost: '',
    delivery_date: new Date().toISOString().split('T')[0],
    employee_name: '',
    employee_position: '',
    status: 'active'
  });
  
  const [newEquipment, setNewEquipment] = useState({ name: '' });
  const [newEmployee, setNewEmployee] = useState({ 
    full_name: '', 
    position: '', 
    department: '' 
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [formsData, equipmentsData, employeesData] = await Promise.all([
        api.getResponsiveForms(),
        api.getEquipments(),
        api.getEmployees()
      ]);
      setForms(formsData);
      setEquipments(equipmentsData);
      setEmployees(employeesData);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      toast.error('Error al cargar los datos'); // ← CAMBIADO A TOAST
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.updateResponsiveForm(editingId, formData);
        toast.success('Responsiva actualizada exitosamente'); // ← CAMBIADO A TOAST
      } else {
        await api.createResponsiveForm(formData);
        toast.success('Responsiva creada exitosamente'); // ← CAMBIADO A TOAST
      }
      setShowModal(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.message || 'Error al procesar la responsiva'); // ← CAMBIADO A TOAST
    }
  };

  const handleCreateEquipment = async (e) => {
    e.preventDefault();
    try {
      const result = await api.createEquipment(newEquipment);
      setEquipments([...equipments, result.equipment]);
      setFormData({...formData, equipment_type: result.equipment.name});
      setShowEquipmentModal(false);
      setNewEquipment({ name: '' });
      toast.success('Equipo agregado exitosamente'); // ← CAMBIADO A TOAST
    } catch (error) {
      console.error('Error al crear equipo:', error);
      toast.error(error.message || 'Error al crear el equipo'); // ← CAMBIADO A TOAST
    }
  };

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    try {
      const result = await api.createEmployee(newEmployee);
      setEmployees([...employees, result.employee]);
      setFormData({
        ...formData, 
        employee_name: result.employee.full_name,
        employee_position: result.employee.position
      });
      setShowEmployeeModal(false);
      setNewEmployee({ full_name: '', position: '', department: '' });
      toast.success('Empleado agregado exitosamente'); // ← CAMBIADO A TOAST
    } catch (error) {
      console.error('Error al crear empleado:', error);
      toast.error(error.message || 'Error al crear el empleado'); // ← CAMBIADO A TOAST
    }
  };

  const handleDownloadPDF = async (id) => {
    try {
      const form = await api.downloadResponsiveFormPDF(id);
      await generateResponsiveFormPDF(form);
      toast.success('PDF descargado exitosamente'); // ← AGREGADO TOAST DE ÉXITO
    } catch (error) {
      console.error('Error al descargar PDF:', error);
      toast.error('Error al descargar el PDF'); // ← CAMBIADO A TOAST
    }
  };

  const handleViewPDF = async (id) => {
    try {
      const form = await api.downloadResponsiveFormPDF(id);
      await previewResponsiveFormPDF(form);
    } catch (error) {
      console.error('Error al visualizar PDF:', error);
      toast.error('Error al visualizar el PDF'); // ← CAMBIADO A TOAST
    }
  };

  const handleEdit = (form) => {
    setEditingId(form._id || form.id);
    
    let fechaFormato = new Date().toISOString().split('T')[0];
    if (form.delivery_date) {
      fechaFormato = new Date(form.delivery_date).toISOString().split('T')[0];
    }
    
    setFormData({
      equipment_type: form.equipment_type,
      brand: form.brand,
      serial_number: form.serial_number,
      acquisition_cost: form.acquisition_cost,
      delivery_date: fechaFormato,
      employee_name: form.employee_name,
      employee_position: form.employee_position,
      status: form.status
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
  // Mostrar toast de confirmación personalizado
  toast((t) => (
    <div className="flex flex-col gap-3 ">
      <p className="font-semibold text-gray-200">¿Estás seguro?</p>
      <p className="text-sm text-gray-200">Esta acción no se puede deshacer.</p>
      <div className="flex gap-2">
        <button
          onClick={async () => {
            toast.dismiss(t.id);
            try {
              await api.deleteResponsiveForm(id);
              toast.success('Responsiva eliminada exitosamente');
              loadData();
            } catch (error) {
              console.error('Error al eliminar responsiva:', error);
              toast.error(error.message || 'Error al eliminar la responsiva');
            }
          }}
          className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 font-medium"
        >
          Eliminar
        </button>
        <button
          onClick={() => toast.dismiss(t.id)}
          className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 font-medium"
        >
          Cancelar
        </button>
      </div>
    </div>
  ), {
    duration: Infinity, // No se cierra automáticamente
    position: 'top-center',
  });
};

  const handleEmployeeSelect = (e) => {
    const selectedEmployee = employees.find(emp => emp.full_name === e.target.value);
    if (selectedEmployee) {
      setFormData({
        ...formData,
        employee_name: selectedEmployee.full_name,
        employee_position: selectedEmployee.position
      });
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      equipment_type: '',
      brand: '',
      serial_number: '',
      acquisition_cost: '',
      delivery_date: new Date().toISOString().split('T')[0],
      employee_name: '',
      employee_position: '',
      status: 'active'
    });
  };

  const filteredForms = filterStatus === 'Todas'
    ? forms
    : forms.filter(form => form.status === filterStatus.toLowerCase());

  const statusColors = {
    'active': 'bg-green-100 text-green-800',
    'returned': 'bg-blue-100 text-blue-800',
    'damaged': 'bg-red-100 text-red-800'
  };

  const statusLabels = {
    'active': 'Activa',
    'returned': 'Devuelta',
    'damaged': 'Dañada'
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Cargando formatos responsivos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <FileText className="w-8 h-8" />
            Formatos Responsivos
          </h1>
          <p className="text-gray-600 mt-1">Gestión de responsivas de equipos</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-md"
        >
          <Plus className="w-5 h-5" />
          Nueva Responsiva
        </button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total</p>
              <p className="text-3xl font-bold text-gray-800">{forms.length}</p>
            </div>
            <FileText className="w-10 h-10 text-blue-600" />
          </div>
        </div>
        <div className="bg-green-50 rounded-lg shadow-md p-6 border-2 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-700 text-sm font-medium">Activas</p>
              <p className="text-3xl font-bold text-green-800">
                {forms.filter(f => f.status === 'active').length}
              </p>
            </div>
            <FileText className="w-10 h-10 text-green-600" />
          </div>
        </div>
        <div className="bg-blue-50 rounded-lg shadow-md p-6 border-2 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-700 text-sm font-medium">Devueltas</p>
              <p className="text-3xl font-bold text-blue-800">
                {forms.filter(f => f.status === 'returned').length}
              </p>
            </div>
            <FileText className="w-10 h-10 text-blue-600" />
          </div>
        </div>
        <div className="bg-red-50 rounded-lg shadow-md p-6 border-2 border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-700 text-sm font-medium">Dañadas</p>
              <p className="text-3xl font-bold text-red-800">
                {forms.filter(f => f.status === 'damaged').length}
              </p>
            </div>
            <FileText className="w-10 h-10 text-red-600" />
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex gap-2 overflow-x-auto">
          {['Todas', 'Active', 'Returned', 'Damaged'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                filterStatus === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status === 'Todas' ? 'Todas' : statusLabels[status.toLowerCase()]}
            </button>
          ))}
        </div>
      </div>

      {/* Valor Total */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-6 mb-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-sm mb-1">Valor Total</p>
            <p className="text-4xl font-bold">
              ${filteredForms.reduce((sum, form) => 
                sum + parseFloat(form.acquisition_cost || 0), 0
              ).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-blue-100 text-xs mt-1">
              {filteredForms.length} responsiva{filteredForms.length !== 1 ? 's' : ''}
            </p>
          </div>
          <FileText className="w-16 h-16 text-blue-300 opacity-50" />
        </div>
      </div>

      {/* Lista de Responsivas */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Código
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Equipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Marca
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  No. Serie
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Costo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Empleado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredForms.map((form) => (
                <tr key={form._id || form.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-mono font-medium text-gray-900">
                      {form.form_code || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {form.equipment_type}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{form.brand}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{form.serial_number}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">
                      ${parseFloat(form.acquisition_cost || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{form.employee_name}</div>
                    <div className="text-xs text-gray-500">{form.employee_position}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[form.status]}`}>
                      {statusLabels[form.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewPDF(form._id || form.id)}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        title="Ver PDF"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDownloadPDF(form._id || form.id)}
                        className="text-green-600 hover:text-green-800 transition-colors"
                        title="Descargar PDF"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleEdit(form)}
                        className="text-yellow-600 hover:text-yellow-800 transition-colors"
                        title="Editar"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(form._id || form.id)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredForms.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No hay responsivas en esta categoría</p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
            >
              Crear primera responsiva
            </button>
          </div>
        )}
      </div>

      {/* Modal Crear/Editar Responsiva */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <FileText className="w-7 h-7 text-blue-600" />
              {editingId ? 'Editar Responsiva' : 'Nueva Responsiva'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Fecha de Entrega */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Entrega *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.delivery_date}
                    onChange={(e) => setFormData({...formData, delivery_date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Tipo de Equipo */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Tipo de Equipo *
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowEquipmentModal(true)}
                      className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                    >
                      <Laptop className="w-4 h-4" />
                      Agregar equipo
                    </button>
                  </div>
                  <select
                    required
                    value={formData.equipment_type}
                    onChange={(e) => setFormData({...formData, equipment_type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar tipo...</option>
                    {equipments.map((equipment) => (
                      <option key={equipment._id} value={equipment.name}>
                        {equipment.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Marca */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Marca *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.brand}
                    onChange={(e) => setFormData({...formData, brand: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="HP, Dell, Lenovo..."
                  />
                </div>

                {/* Número de Serie */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número de Serie *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.serial_number}
                    onChange={(e) => setFormData({...formData, serial_number: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="ABC123456789"
                  />
                </div>

                {/* Costo de Adquisición */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Costo de Adquisición: $ *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.acquisition_cost}
                    onChange={(e) => setFormData({...formData, acquisition_cost: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>

                {/* Empleado */}
                <div className="md:col-span-2">
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Entregar A: *
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowEmployeeModal(true)}
                      className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                    >
                      <UserPlus className="w-4 h-4" />
                      Agregar empleado
                    </button>
                  </div>
                  <select
                    required
                    value={formData.employee_name}
                    onChange={handleEmployeeSelect}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar empleado...</option>
                    {employees.map((employee) => (
                      <option key={employee._id} value={employee.full_name}>
                        {employee.full_name} - {employee.position}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Cargo (automático) */}
                {formData.employee_position && (
                  <div className="md:col-span-2 bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cargo:
                    </label>
                    <p className="text-lg font-bold text-blue-800">
                      {formData.employee_position}
                    </p>
                  </div>
                )}

                {/* Estado (solo en edición) */}
                {editingId && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estado
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="active">Activa</option>
                      <option value="returned">Devuelta</option>
                      <option value="damaged">Dañada</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-semibold"
                >
                  {editingId ? 'Actualizar' : 'Crear Responsiva'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 font-semibold"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Agregar Equipo */}
      {showEquipmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-6">Agregar Nuevo Equipo</h2>
            <form onSubmit={handleCreateEquipment}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Equipo *
                </label>
                <input
                  type="text"
                  required
                  value={newEquipment.name}
                  onChange={(e) => setNewEquipment({name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: LAPTOP"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Este equipo estará disponible para futuras responsivas
                </p>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-semibold flex items-center justify-center gap-2"
                >
                  <Laptop className="w-5 h-5" />
                  Agregar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEquipmentModal(false);
                    setNewEquipment({ name: '' });
                  }}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 font-semibold"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Agregar Empleado */}
      {showEmployeeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-6">Agregar Nuevo Empleado</h2>
            <form onSubmit={handleCreateEmployee}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={newEmployee.full_name}
                    onChange={(e) => setNewEmployee({...newEmployee, full_name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: ELIZABETH RODRÍGUEZ MEDINA"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cargo / Puesto *
                  </label>
                  <input
                    type="text"
                    required
                    value={newEmployee.position}
                    onChange={(e) => setNewEmployee({...newEmployee, position: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: GERENTE DE VENTAS"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Departamento (Opcional)
                  </label>
                  <input
                    type="text"
                    value={newEmployee.department}
                    onChange={(e) => setNewEmployee({...newEmployee, department: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: Ventas"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 font-semibold flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-5 h-5" />
                  Agregar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEmployeeModal(false);
                    setNewEmployee({ full_name: '', position: '', department: '' });
                  }}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 font-semibold"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}