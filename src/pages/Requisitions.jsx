import { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Download, CheckCircle, XCircle, Clock } from 'lucide-react';
import api from '../services/api';

export default function Requisitions() {
  const [requisitions, setRequisitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('Todas');
  const [formData, setFormData] = useState({
    descripcion: '',
    montoestimado: ''
  });

  useEffect(() => {
    loadRequisitions();
  }, []);

  const loadRequisitions = async () => {
    try {
      setLoading(true);
      const data = await api.getRequisitions();
      setRequisitions(data);
    } catch (error) {
      console.error('Error al cargar requisiciones:', error);
      alert('Error al cargar las requisiciones');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.createRequisition(formData);
      setShowModal(false);
      resetForm();
      loadRequisitions();
    } catch (error) {
      console.error('Error al crear requisición:', error);
      alert('Error al crear la requisición');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.updateRequisitionStatus(id, newStatus);
      loadRequisitions();
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      alert('Error al actualizar el estado');
    }
  };

  const handleDownloadPDF = async (id) => {
    try {
      await api.downloadRequisitionPDF(id);
    } catch (error) {
      console.error('Error al descargar PDF:', error);
      alert('Error al descargar el PDF');
    }
  };

  const resetForm = () => {
    setFormData({
      descripcion: '',
      montoestimado: ''
    });
  };

  const filteredRequisitions = filterStatus === 'Todas'
    ? requisitions
    : requisitions.filter(req => req.estado === filterStatus);

  const statusColors = {
    'Pendiente': 'bg-yellow-100 text-yellow-800',
    'Aprobada': 'bg-green-100 text-green-800',
    'Rechazada': 'bg-red-100 text-red-800'
  };

  const statusIcons = {
    'Pendiente': <Clock className="w-4 h-4" />,
    'Aprobada': <CheckCircle className="w-4 h-4" />,
    'Rechazada': <XCircle className="w-4 h-4" />
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Cargando requisiciones...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <ShoppingCart className="w-8 h-8" />
            Requisiciones
          </h1>
          <p className="text-gray-600 mt-1">Gestión de solicitudes de compra</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nueva Requisición
        </button>
      </div>

      {/* Filtros y estadísticas */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex gap-2">
            {['Todas', 'Pendiente', 'Aprobada', 'Rechazada'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg ${
                  filterStatus === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
          <div className="flex gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {requisitions.filter(r => r.estado === 'Pendiente').length}
              </div>
              <div className="text-sm text-gray-600">Pendientes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {requisitions.filter(r => r.estado === 'Aprobada').length}
              </div>
              <div className="text-sm text-gray-600">Aprobadas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                ${requisitions
                  .filter(r => r.estado === 'Aprobada')
                  .reduce((sum, r) => sum + parseFloat(r.montoestimado || 0), 0)
                  .toLocaleString('es-MX')}
              </div>
              <div className="text-sm text-gray-600">Total Aprobado</div>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de requisiciones */}
      <div className="grid gap-4">
        {filteredRequisitions.map((req) => (
          <div key={req.idrequisicion} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-sm font-medium text-gray-500">
                    Requisición #{req.idrequisicion}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${statusColors[req.estado]}`}>
                    {statusIcons[req.estado]}
                    {req.estado}
                  </span>
                </div>
                <p className="text-gray-800 mb-3 text-lg">{req.descripcion}</p>
                <div className="flex items-center gap-6 text-sm text-gray-600">
                  <span className="font-semibold text-blue-600 text-lg">
                    ${parseFloat(req.montoestimado).toLocaleString('es-MX', {minimumFractionDigits: 2})}
                  </span>
                  <span>Solicitado: {new Date(req.fechasolicitud).toLocaleDateString('es-MX')}</span>
                  {req.estado === 'Aprobada' && req.usuario && (
                    <span className="text-green-600">Aprobado por usuario #{req.usuario}</span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDownloadPDF(req.idrequisicion)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  PDF
                </button>
                {req.estado === 'Pendiente' && (
                  <>
                    <button
                      onClick={() => handleStatusChange(req.idrequisicion, 'Aprobada')}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Aprobar
                    </button>
                    <button
                      onClick={() => handleStatusChange(req.idrequisicion, 'Rechazada')}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      Rechazar
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
        {filteredRequisitions.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No hay requisiciones {filterStatus !== 'Todas' && `con estado "${filterStatus}"`}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-6">Nueva Requisición</h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción de la Solicitud *
                  </label>
                  <textarea
                    required
                    value={formData.descripcion}
                    onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="4"
                    placeholder="Describe el producto o servicio a adquirir..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Monto Estimado *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      $
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.montoestimado}
                      onChange={(e) => setFormData({...formData, montoestimado: e.target.value})}
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Ingresa el monto aproximado de la compra
                  </p>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  Crear Requisición
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