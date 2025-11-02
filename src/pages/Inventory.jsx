// src/pages/Inventory.jsx
import { useState, useEffect } from 'react';
import { Package, Plus, Edit, Trash2, Search, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import AssetNameSelector from '../components/AssetNameSelector';
import TypeSelector from '../components/TypeSelector';

export default function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    tipo: '',  // ⭐ IMPORTANTE
    estado: 'Disponible',
    valorEstimado: '',
    marca: '',
    numeroSerie: ''  // ⭐ CORREGIR (estaba como modnumeroSerie)
  });

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      setLoading(true);
      const data = await api.getInventory();
      // ⭐ Filtrar solo activos que NO estén inactivos
      const activeAssets = data.filter(item => item.status !== 'inactive');
      setInventory(activeAssets);
    } catch (error) {
      console.error('Error al cargar inventario:', error);
      toast.error('Error al cargar el inventario');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.updateInventoryItem(editingItem.id, formData);
        toast.success('Activo actualizado exitosamente');
      } else {
        await api.createInventoryItem(formData);
        toast.success('Activo creado exitosamente');
      }
      setShowModal(false);
      resetForm();
      loadInventory();
    } catch (error) {
      console.error('Error al guardar:', error);
      toast.error(error.message || 'Error al guardar el activo');
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      nombre: item.nombre,
      descripcion: item.descripcion,
      tipo: item.tipo || '',  // ⭐ IMPORTANTE
      estado: item.estado || 'Disponible',
      valorEstimado: item.valorEstimado,
      marca: item.marca || '',
      numeroSerie: item.numeroSerie || ''  // ⭐ IMPORTANTE
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (confirm('¿Estás seguro de eliminar este activo?')) {
      try {
        await api.deleteInventoryItem(id);
        toast.success('Activo eliminado exitosamente');
        loadInventory();
      } catch (error) {
        console.error('Error al eliminar:', error);
        toast.error('Error al eliminar el activo');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      tipo: '',  // ⭐ IMPORTANTE
      estado: 'Disponible',
      valorEstimado: '',
      marca: '',
      numeroSerie: ''  // ⭐ IMPORTANTE
    });
    setEditingItem(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const filteredInventory = inventory.filter(item =>
    item.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <LoadingSpinner fullScreen message="Cargando inventario..." />;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <Package className="w-8 h-8" />
            Gestión de Inventario
          </h1>
          <p className="text-gray-600 mt-1">Control de activos tecnológicos</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nuevo Activo
        </button>
      </div>

      {/* Búsqueda */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar activo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Marca</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">No. Serie</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredInventory.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{item.nombre}</div>
                    <div className="text-sm text-gray-500">{item.descripcion}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{item.tipo}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{item.marca || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{item.numeroSerie || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${item.estado === 'Disponible' ? 'bg-green-100 text-green-800' :
                      item.estado === 'En uso' ? 'bg-blue-100 text-blue-800' :
                        item.estado === 'En mantenimiento' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                      }`}>
                      {item.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    ${parseFloat(item.valorEstimado || 0).toLocaleString('es-MX')}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:text-red-800"
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
        {filteredInventory.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No hay activos registrados
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-800">
                {editingItem ? 'Editar Activo' : 'Nuevo Activo'}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre del Activo *</label>
                <AssetNameSelector
                  value={formData.nombre}
                  onChange={(name) => setFormData({ ...formData, nombre: name })}
                  required={true}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Descripción</label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Tipo</label>
                <TypeSelector
                  value={formData.tipo}
                  onChange={(tipo) => setFormData({ ...formData, tipo })}
                  required={false}
                />
              </div>


              <div>
                <label className="block text-sm font-medium mb-1">Estado *</label>
                <select
                  name="estado"
                  value={formData.estado}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                  required
                >
                  <option value="Disponible">Disponible</option>
                  <option value="En uso">En uso</option>
                  <option value="En mantenimiento">En mantenimiento</option>
                  <option value="Dado de baja">Dado de baja</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Valor Estimado</label>
                <input
                  type="number"
                  name="valorEstimado"
                  value={formData.valorEstimado}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                  step="0.01"
                />
              </div>

              {/* ⭐ AGREGAR ESTOS DOS CAMPOS */}
              <div>
                <label className="block text-sm font-medium mb-1">Marca</label>
                <input
                  type="text"
                  name="marca"
                  value={formData.marca}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Ej: HP, Dell, Lenovo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Número de Serie</label>
                <input
                  type="text"
                  name="numeroSerie"
                  value={formData.numeroSerie}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Ej: SN-2024-001"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Guardando...' : (editingItem ? 'Actualizar' : 'Crear')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 border border-gray-300 py-2 rounded hover:bg-gray-50"
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