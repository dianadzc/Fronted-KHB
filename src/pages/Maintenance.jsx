// src/pages/Maintenance.jsx
import { useState, useEffect } from 'react';
import { Plus, Calendar, Wrench, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import AssetSelector from '../components/AssetSelector';

export default function Maintenance() {
  const [maintenances, setMaintenances] = useState([]);
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
      const maintenanceData = await api.getMaintenance();
      setMaintenances(maintenanceData);
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-yellow-600 to-yellow-700 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Programar Mantenimiento</h3>
              <button 
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }} 
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-80px)]">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Activo <span className="text-red-500">*</span>
                </label>
                <AssetSelector
                  value={formData.idActivo}
                  onChange={(assetId) => setFormData({ ...formData, idActivo: assetId })}
                  required={true}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tipo <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all bg-white"
                >
                  <option value="Preventivo">Preventivo</option>
                  <option value="Correctivo">Correctivo</option>
                  <option value="Predictivo">Predictivo</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Fecha Programada <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.fechaInicio}
                  onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Notas
                </label>
                <textarea
                  value={formData.notas}
                  onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all resize-none"
                  rows="3"
                  placeholder="Notas adicionales del mantenimiento"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Costo Estimado
                </label>
                <input
                  type="number"
                  value={formData.costosEstimados}
                  onChange={(e) => setFormData({ ...formData, costosEstimados: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                  placeholder="0.00"
                  step="0.01"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-yellow-600 text-white py-2.5 rounded-lg hover:bg-yellow-700 font-semibold transition-colors"
                >
                  Programar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-2.5 rounded-lg hover:bg-gray-300 font-semibold transition-colors"
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