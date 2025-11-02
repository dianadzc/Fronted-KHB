// src/pages/Requisitions.jsx - CON EDICIÓN COMPLETA
import { useState, useEffect } from 'react';
import { Plus, FileText, ShoppingCart, Download, Check, X, Trash2, UserPlus, Eye, Edit } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { generateRequisitionPDF, previewRequisitionPDF } from '../services/pdfGenerator';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Requisitions() {
  const [requisitions, setRequisitions] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    request_type: 'transferencia',
    amount: '',
    currency: 'MXN',
    payable_to: '',
    concept: ''
  });
  const [newClient, setNewClient] = useState({
    name: ''
  });

  useEffect(() => {
    loadRequisitions();
    loadClients();
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

  const loadClients = async () => {
    try {
      const data = await api.getClients();
      setClients(data);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
      toast.error('Error al cargar clientes');
    }
  };

  const handleCreateClient = async (e) => {
    e.preventDefault();
    try {
      const result = await api.createClient(newClient);
      setClients([...clients, result.client]);
      setFormData({ ...formData, payable_to: result.client.name });
      setShowClientModal(false);
      setNewClient({ name: '' });
      toast.success('Cliente agregado exitosamente');
    } catch (error) {
      console.error('Error al crear cliente:', error);
      toast.error(error.message || 'Error al crear el cliente');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const amountNumber = parseFloat(formData.amount);

    if (isNaN(amountNumber) || amountNumber <= 0) {
      toast.error('El monto debe ser un número válido mayor a 0');
      return;
    }

    try {
      const dataToSend = {
        request_type: formData.request_type,
        amount: amountNumber,
        currency: formData.currency,
        payable_to: formData.payable_to.trim(),
        concept: formData.concept.trim(),
        status: 'pending'
      };

      if (editingId) {
        await api.updateRequisition(editingId, dataToSend);
        toast.success('Requisición actualizada exitosamente');
      } else {
        await api.createRequisition(dataToSend);
        toast.success('Requisición creada exitosamente');
      }

      setShowModal(false);
      resetForm();
      loadRequisitions();
    } catch (error) {
      console.error('❌ Error:', error);
      toast.error(error.message || 'Error al procesar la requisición');
    }
  };

  const handleEdit = (req) => {
    setEditingId(req._id);
    setFormData({
      request_type: req.request_type,
      amount: req.amount.toString(),
      currency: req.currency,
      payable_to: req.payable_to,
      concept: req.concept
    });
    setShowModal(true);
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
      const requisitionData = await api.downloadRequisitionPDF(id);
      await generateRequisitionPDF(requisitionData);
      toast.success('PDF descargado exitosamente');
    } catch (error) {
      console.error('Error al generar PDF:', error);
      toast.error('Error al generar el PDF');
    }
  };

  const handlePreviewPDF = async (id) => {
    try {
      const requisitionData = await api.downloadRequisitionPDF(id);
      await previewRequisitionPDF(requisitionData);
    } catch (error) {
      console.error('Error al previsualizar PDF:', error);
      toast.error('Error al previsualizar el PDF');
    }
  };

  const handleDelete = async (id) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="font-semibold text-gray-200">¿Estás seguro?</p>
        <p className="text-sm text-gray-200">Esta acción no se puede deshacer.</p>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await api.deleteRequisition(id);
                toast.success('Requisición eliminada exitosamente');
                loadRequisitions();
              } catch (error) {
                console.error('Error al eliminar:', error);
                toast.error('Error al eliminar la requisición');
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
      duration: Infinity,
      position: 'top-center',
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      request_type: 'transferencia',
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
            className={`px-6 py-3 font-medium ${activeTab === 'all' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
          >
            Todas
            <span className="ml-2 px-2 py-1 text-xs rounded-full bg-gray-200">
              {requisitions.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-6 py-3 font-medium ${activeTab === 'pending' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
          >
            Pendientes
            <span className="ml-2 px-2 py-1 text-xs rounded-full bg-yellow-200">
              {requisitions.filter(r => r.status === 'pending').length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('approved')}
            className={`px-6 py-3 font-medium ${activeTab === 'approved' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
          >
            Aprobadas
            <span className="ml-2 px-2 py-1 text-xs rounded-full bg-green-200">
              {requisitions.filter(r => r.status === 'approved').length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('rejected')}
            className={`px-6 py-3 font-medium ${activeTab === 'rejected' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
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
            ${requisitions.filter(r => r.status === 'pending').reduce((sum, r) => sum + r.amount, 0).toLocaleString('es-MX')} MXN
          </p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <h3 className="text-sm font-medium text-green-800 mb-1">Aprobadas</h3>
          <p className="text-2xl font-bold text-green-900">
            ${requisitions.filter(r => r.status === 'approved').reduce((sum, r) => sum + r.amount, 0).toLocaleString('es-MX')} MXN
          </p>
        </div>
        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
          <h3 className="text-sm font-medium text-red-800 mb-1">Rechazadas</h3>
          <p className="text-2xl font-bold text-red-900">
            ${requisitions.filter(r => r.status === 'rejected').reduce((sum, r) => sum + r.amount, 0).toLocaleString('es-MX')} MXN
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
                  <td className="px-6 py-4 text-sm text-gray-900 capitalize">{req.request_type.replace('_', ' ')}</td>
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
                        onClick={() => handlePreviewPDF(req._id)}
                        className="text-purple-600 hover:text-purple-800"
                        title="Vista previa PDF"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDownloadPDF(req._id)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Descargar PDF"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleEdit(req)}
                        className="text-yellow-600 hover:text-yellow-800"
                        title="Editar"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(req._id)}
                        className="text-red-600 hover:text-red-800"
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
        {filteredRequisitions.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No hay requisiciones en esta categoría
          </div>
        )}
      </div>

      {/* Modal Nueva/Editar Requisición */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-6">
              {editingId ? 'Editar Requisición' : 'Nueva Requisición'}
            </h2>
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
                    <option value="transferencia">Transferencia</option>
                    <option value="pago_tarjeta">Pago con Tarjeta</option>
                    <option value="efectivo">Efectivo</option>
                    <option value="pago_linea">Pago en Línea</option>
                  </select>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium text-gray-700">
                      A favor de <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowClientModal(true)}
                      className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                    >
                      <UserPlus className="w-4 h-4" />
                      Nuevo cliente
                    </button>
                  </div>
                  <select
                    required
                    value={formData.payable_to}
                    onChange={(e) => setFormData({ ...formData, payable_to: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar cliente...</option>
                    {clients.map((client) => (
                      <option key={client._id} value={client.name}>
                        {client.name}
                      </option>
                    ))}
                  </select>
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
                  {editingId ? 'Actualizar' : 'Crear'} Requisición
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

      {/* Modal Agregar Cliente */}
      {showClientModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <UserPlus className="w-6 h-6 text-blue-600" />
              Agregar Cliente
            </h3>
            <form onSubmit={handleCreateClient} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newClient.name}
                  onChange={(e) => setNewClient({ name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: ARPON"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium"
                >
                  Agregar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowClientModal(false);
                    setNewClient({ name: '' });
                  }}
                  className="flex-1 bg-gray-200 py-2 rounded-lg hover:bg-gray-300 font-medium"
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