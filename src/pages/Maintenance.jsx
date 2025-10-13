import { useState, useEffect } from 'react';
import { Wrench, Plus, Calendar, DollarSign } from 'lucide-react';
import api from '../services/api';

export default function Maintenance() {
  const [maintenances, setMaintenances] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    tipo: 'Preventivo',
    fechaInicio: '',
    notas: '',
    costosEstimados: '',
    idActivo: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [maintenanceData, assetsData] = await Promise.all([
        api.getMaintenance(),
        api.getInventory()
      ]);

      console.log('📦 Activos recibidos:', assetsData);

      setMaintenances(maintenanceData);
      setAssets(assetsData); // ✅ Ya vienen formateados de getInventory
    } catch (error) {
      console.error('Error al cargar datos:', error);
      alert('Error al cargar los mantenimientos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.createMaintenance(formData);
      setShowModal(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error al programar mantenimiento:', error);
      alert('Error al programar el mantenimiento');
    }
  };

  const handleComplete = async (id) => {
    if (!confirm('¿Marcar este mantenimiento como completado?')) return;
    try {
      await api.completeMaintenance(id);
      loadData();
    } catch (error) {
      console.error('Error al completar mantenimiento:', error);
      alert('Error al completar el mantenimiento');
    }
  };

  const resetForm = () => {
    setFormData({
      tipo: 'Preventivo',
      fechaInicio: '',
      notas: '',
      costosEstimados: '',
      idActivo: ''
    });
  };

  const tipoColors = {
    'Preventivo': 'bg-blue-100 text-blue-800',
    'Correctivo': 'bg-orange-100 text-orange-800'
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Cargando mantenimientos...</div>
      </div>
    );
  }

  const pendingMaintenances = maintenances.filter(m => !m.fechaFin);
  const completedMaintenances = maintenances.filter(m => m.fechaFin);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <Wrench className="w-8 h-8" />
            Mantenimientos
          </h1>
          <p className="text-gray-600 mt-1">Programación y seguimiento</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Programar Mantenimiento
        </button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Pendientes</p>
              <p className="text-3xl font-bold text-blue-600">{pendingMaintenances.length}</p>
            </div>
            <Calendar className="w-10 h-10 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Completados</p>
              <p className="text-3xl font-bold text-green-600">{completedMaintenances.length}</p>
            </div>
            <Wrench className="w-10 h-10 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Costo Total</p>
              <p className="text-3xl font-bold text-purple-600">
                ${maintenances.reduce((sum, m) => sum + parseFloat(m.costosEstimados || 0), 0).toLocaleString('es-MX')}
              </p>
            </div>
            <DollarSign className="w-10 h-10 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Mantenimientos Pendientes */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Mantenimientos Pendientes</h2>
        <div className="grid gap-4">
          {pendingMaintenances.map((maintenance) => {
            const asset = assets.find(a => a.idActivo === maintenance.idActivo);
            return (
              <div key={maintenance.idMantenimiento} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-medium text-gray-500">
                        #{maintenance.idMantenimiento}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${tipoColors[maintenance.tipo]}`}>
                        {maintenance.tipo}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      {asset?.nombre || 'Activo no encontrado'}
                    </h3>
                    <p className="text-gray-600 mb-3">{maintenance.notas}</p>
                    <div className="flex items-center gap-6 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Inicio: {new Date(maintenance.fechaInicio).toLocaleDateString('es-MX')}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        ${parseFloat(maintenance.costosEstimados).toLocaleString('es-MX')}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleComplete(maintenance.idMantenimiento)}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  >
                    Completar
                  </button>
                </div>
              </div>
            );
          })}
          {pendingMaintenances.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No hay mantenimientos pendientes
            </div>
          )}
        </div>
      </div>

      {/* Mantenimientos Completados */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Historial de Mantenimientos</h2>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Activo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha Inicio</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha Fin</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Costo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {completedMaintenances.map((maintenance) => {
                const asset = assets.find(a => a.idActivo === maintenance.idActivo);
                return (
                  <tr key={maintenance.idMantenimiento} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{maintenance.idMantenimiento}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{asset?.nombre || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${tipoColors[maintenance.tipo]}`}>
                        {maintenance.tipo}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(maintenance.fechaInicio).toLocaleDateString('es-MX')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(maintenance.fechaFin).toLocaleDateString('es-MX')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      ${parseFloat(maintenance.costosEstimados).toLocaleString('es-MX')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {completedMaintenances.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No hay mantenimientos completados
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-6">Programar Mantenimiento</h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Activo
                  </label>
                  <select
                    required
                    value={formData.idActivo}
                    onChange={(e) => setFormData({ ...formData, idActivo: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar activo...</option>
                    {assets.map(asset => (
                      <option key={asset.idActivo} value={asset.idActivo}>
                        {asset.nombre} - {asset.tipo}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Mantenimiento
                  </label>
                  <select
                    required
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Preventivo">Preventivo</option>
                    <option value="Correctivo">Correctivo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Inicio
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.fechaInicio}
                    onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notas
                  </label>
                  <textarea
                    required
                    value={formData.notas}
                    onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder="Descripción del mantenimiento..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Costo Estimado
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.costosEstimados}
                    onChange={(e) => setFormData({ ...formData, costosEstimados: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
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