import { useState, useEffect } from 'react';
import { Plus, Calendar, Wrench } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Maintenance() {
  const [maintenances, setMaintenances] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    idActivo: '',
    tipo: 'Preventivo',
    fechaInicio: '',
    notas: '',
    costosEstimados: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [maintenanceData, inventoryData] = await Promise.all([
        api.getMaintenance(),
        api.getInventory()
      ]);
      setMaintenances(maintenanceData);
      setInventory(inventoryData);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      toast.error('Error al cargar mantenimientos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.createMaintenance(formData);
      toast.success('Mantenimiento programado exitosamente');
      setShowModal(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error al crear mantenimiento:', error);
      toast.error('Error al programar el mantenimiento');
    }
  };

  const handleComplete = async (id) => {
    try {
      await api.completeMaintenance(id);
      toast.success('Mantenimiento completado exitosamente');
      loadData();
    } catch (error) {
      console.error('Error al completar mantenimiento:', error);
      toast.error('Error al completar el mantenimiento');
    }
  };

  const resetForm = () => {
    setFormData({
      idActivo: '',
      tipo: 'Preventivo',
      fechaInicio: '',
      notas: '',
      costosEstimados: ''
    });
  };

  const statusColors = {
    scheduled: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };

  const statusLabels = {
    scheduled: 'Programado',
    in_progress: 'En Progreso',
    completed: 'Completado',
    cancelled: 'Cancelado'
  };

  if (loading) return <LoadingSpinner fullScreen message="Cargando mantenimientos..." />;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <Wrench className="w-8 h-8" />
            Gestión de Mantenimientos
          </h1>
          <p className="text-gray-600 mt-1">Programación y seguimiento de mantenimientos</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Programar Mantenimiento
        </button>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Activo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha Inicio</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha Fin</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Costo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {maintenances.map((maintenance) => (
                <tr key={maintenance.idMantenimiento} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {maintenance.nombreActivo || 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{maintenance.tipo}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {new Date(maintenance.fechaInicio).toLocaleDateString('es-MX')}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {maintenance.fechaFin ? new Date(maintenance.fechaFin).toLocaleDateString('es-MX') : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    ${parseFloat(maintenance.costosEstimados || 0).toLocaleString('es-MX')}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${statusColors[maintenance.status]}`}>
                      {statusLabels[maintenance.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {maintenance.status === 'scheduled' && (
                      <button
                        onClick={() => handleComplete(maintenance.idMantenimiento)}
                        className="text-green-600 hover:text-green-800 text-sm font-medium"
                      >
                        Completar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {maintenances.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No hay mantenimientos programados
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-6">Programar Mantenimiento</h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Activo *</label>
                  <select
                    required
                    value={formData.idActivo}
                    onChange={(e) => setFormData({ ...formData, idActivo: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar activo</option>
                    {inventory.map(item => (
                      <option key={item.id} value={item.id}>{item.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
                  <select
                    required
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Preventivo">Preventivo</option>
                    <option value="Correctivo">Correctivo</option>
                    <option value="Predictivo">Predictivo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Programada *</label>
                  <input
                    type="date"
                    required
                    value={formData.fechaInicio}
                    onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                  <textarea
                    value={formData.notas}
                    onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Costo Estimado</label>
                  <input
                    type="number"
                    value={formData.costosEstimados}
                    onChange={(e) => setFormData({ ...formData, costosEstimados: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-yellow-600 text-white py-2 rounded-lg hover:bg-yellow-700"
                >
                  Programar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
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