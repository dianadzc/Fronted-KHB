import { useState, useEffect } from 'react';
import { Plus, FileText, ShoppingCart, Download, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Requisitions() {
  const [requisitions, setRequisitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [formData, setFormData] = useState({
    request_type: 'pago',
    amount: '',
    currency: 'MXN',
    payable_to: '',
    concept: ''
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
      toast.error('Error al cargar requisiciones');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.createRequisition(formData);
      toast.success('Requisición creada exitosamente');
      setShowModal(false);
      resetForm();
      loadRequisitions();
    } catch (error) {
      console.error('Error al crear requisición:', error);
      toast.error('Error al crear la requisición');
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.updateRequisitionStatus(id, true);
      toast.success('Requisición aprobada exitosamente');
      loadRequisitions();
    } catch (error) {
      console.error('Error al aprobar:', error);
      toast.error('Error al aprobar la requisición');
    }
  };

  const handleReject = async (id) => {
    try {
      await api.updateRequisitionStatus(id, false);
      toast.success('Requisición rechazada');
      loadRequisitions();
    } catch (error) {
      console.error('Error al rechazar:', error);
      toast.error('Error al rechazar la requisición');
    }
  };

  const handleDownloadPDF = async (id) => {
    try {
      await api.downloadRequisitionPDF(id);
      toast.success('PDF generado exitosamente');
    } catch (error) {
      console.error('Error al generar PDF:', error);
      toast.error('Error al generar el PDF');
    }
  };

  const resetForm = () => {
    setFormData({
      request_type: 'pago',
      amount: '',
      currency: 'MXN',
      payable_to: '',
      concept: ''
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'approved': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'pending': 'Pendiente',
      'approved': 'Aprobada',
      'rejected': 'Rechazada'
    };
    return labels[status] || status;
  };

  const filteredRequisitions = requisitions.filter(req => {
    if (activeTab === 'all') return true;
    return req.status === activeTab;
  });

  if (loading) return <LoadingSpinner fullScreen message="Cargando requisiciones..." />;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <ShoppingCart className="w-8 h-8" />
            Requisiciones
          </h1>
          <p className="text-gray-600 mt-1">Gestión de solicitudes - Departamento de Sistemas</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nueva Requisición
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-6 py-3 font-medium ${activeTab === 'all' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-800'
              }`}
          >
            Todas
            <span className="ml-2 px-2 py-1 text-xs rounded-full bg-gray-200">
              {requisitions.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-6 py-3 font-medium ${activeTab === 'pending' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-800'
              }`}
          >
            Pendientes
            <span className="ml-2 px-2 py-1 text-xs rounded-full bg-yellow-200">
              {requisitions.filter(r => r.status === 'pending').length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('approved')}
            className={`px-6 py-3 font-medium ${activeTab === 'approved' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-800'
              }`}
          >
            Aprobadas
            <span className="ml-2 px-2 py-1 text-xs rounded-full bg-green-200">
              {requisitions.filter(r => r.status === 'approved').length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('rejected')}
            className={`px-6 py-3 font-medium ${activeTab === 'rejected' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-800'
              }`}
          >
            Rechazadas
            <span className="ml-2 px-2 py-1 text-xs rounded-full bg-red-200">
              {requisitions.filter(r => r.status === 'rejected').length}
            </span>
          </button>
        </div>
      </div>

      {/* Resumen de montos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
          <h3 className="text-sm font-medium text-yellow-800 mb-1">Pendientes</h3>
          <p className="text-2xl font-bold text-yellow-900">
            ${requisitions.filter(r => r.status === 'pending').reduce((sum, r) => sum + r.amount, 0).toLocaleString('es-MX')}
          </p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <h3 className="text-sm font-medium text-green-800 mb-1">Aprobadas</h3>
          <p className="text-2xl font-bold text-green-900">
            ${requisitions.filter(r => r.status === 'approved').reduce((sum, r) => sum + r.amount, 0).toLocaleString('es-MX')}
          </p>
        </div>
        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
          <h3 className="text-sm font-medium text-red-800 mb-1">Rechazadas</h3>
          <p className="text-2xl font-bold text-red-900">
            ${requisitions.filter(r => r.status === 'rejected').reduce((sum, r) => sum + r.amount, 0).toLocaleString('es-MX')}
          </p>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">A favor de</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Concepto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredRequisitions.map((req) => (
                <tr key={req._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-mono text-gray-900">{req.requisition_code}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 capitalize">{req.request_type}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{req.payable_to}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 truncate max-w-xs">{req.concept}</div>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                    ${req.amount.toLocaleString('es-MX')} {req.currency}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(req.status)}`}>
                      {getStatusLabel(req.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {new Date(req.createdAt).toLocaleDateString('es-MX')}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex gap-2">
                      {req.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(req._id)}
                            className="text-green-600 hover:text-green-800"
                            title="Aprobar"
                          >
                            <Check className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleReject(req._id)}
                            className="text-red-600 hover:text-red-800"
                            title="Rechazar"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDownloadPDF(req._id)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Descargar PDF"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredRequisitions.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No hay requisiciones en esta categoría
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Solicitud *</label>
                  <select
                    required
                    value={formData.request_type}
                    onChange={(e) => setFormData({ ...formData, request_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pago">Pago</option>
                    <option value="compra">Compra</option>
                    <option value="transferencia">Transferencia</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">A favor de *</label>
                  <input
                    type="text"
                    required
                    value={formData.payable_to}
                    onChange={(e) => setFormData({ ...formData, payable_to: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nombre del proveedor o persona"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Monto *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Moneda *</label>
                    <select
                      required
                      value={formData.currency}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="MXN">MXN</option>
                      <option value="USD">USD</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Concepto *</label>
                  <textarea
                    required
                    value={formData.concept}
                    onChange={(e) => setFormData({ ...formData, concept: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder="Descripción detallada del concepto"
                  />
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    <strong>Nota:</strong> Las firmas de autorización se agregarán automáticamente al generar el PDF.
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