import { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Download, CheckCircle, XCircle, Clock, UserPlus } from 'lucide-react';
import { generateRequisitionPDF } from '../services/pdfGenerator';
import api from '../services/api';

export default function Requisitions() {
  const [requisitions, setRequisitions] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('Todas');
  const [formData, setFormData] = useState({
    request_type: 'transferencia',
    amount: '',
    currency: 'MXN',
    payable_to: '',
    concept: ''
  });
  const [newClient, setNewClient] = useState({ name: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [requisitionsData, clientsData] = await Promise.all([
        api.getRequisitions(),
        api.getClients()
      ]);
      console.log('📋 Requisiciones:', requisitionsData);
      console.log('👥 Clientes:', clientsData);
      setRequisitions(requisitionsData);
      setClients(clientsData);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      alert('Error al cargar los datos');
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
      loadData();
      alert('Requisición creada exitosamente');
    } catch (error) {
      console.error('Error al crear requisición:', error);
      alert('Error al crear la requisición');
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
      alert('Cliente agregado exitosamente');
    } catch (error) {
      console.error('Error al crear cliente:', error);
      alert(error.message || 'Error al crear el cliente');
    }
  };

  const handleStatusChange = async (id, approved) => {
    try {
      await api.updateRequisitionStatus(id, approved);
      loadData();
      alert(`Requisición ${approved ? 'aprobada' : 'rechazada'} exitosamente`);
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      alert('Error al actualizar el estado');
    }
  };

  const handleDownloadPDF = async (id) => {
    try {
      const requisition = await api.downloadRequisitionPDF(id);
      generateRequisitionPDF(requisition);
    } catch (error) {
      console.error('Error al descargar PDF:', error);
      alert('Error al descargar el PDF');
    }
  };

  const resetForm = () => {
    setFormData({
      request_type: 'transferencia',
      amount: '',
      currency: 'MXN',
      payable_to: '',
      concept: ''
    });
  };

  const filteredRequisitions = filterStatus === 'Todas'
    ? requisitions
    : requisitions.filter(req => req.status === filterStatus.toLowerCase());

  const statusColors = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'approved': 'bg-green-100 text-green-800',
    'rejected': 'bg-red-100 text-red-800',
    'completed': 'bg-blue-100 text-blue-800'
  };

  const statusLabels = {
    'pending': 'Pendiente',
    'approved': 'Aprobada',
    'rejected': 'Rechazada',
    'completed': 'Completada'
  };

  const requestTypeLabels = {
    'transferencia': 'Transferencia',
    'pago_tarjeta': 'Pago con Tarjeta',
    'efectivo': 'Efectivo',
    'pago_linea': 'Pago en Línea'
  };

  const statusIcons = {
    'pending': <Clock className="w-4 h-4" />,
    'approved': <CheckCircle className="w-4 h-4" />,
    'rejected': <XCircle className="w-4 h-4" />,
    'completed': <CheckCircle className="w-4 h-4" />
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
          <p className="text-gray-600 mt-1">Gestión de solicitudes - Departamento de Sistemas</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Nueva Requisición
        </button>
      </div>

      {/* Filtros y estadísticas */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex gap-2">
            {['Todas', 'Pending', 'Approved', 'Rejected'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg transition-colors ${filterStatus === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {status === 'Todas' ? 'Todas' : statusLabels[status.toLowerCase()]}
              </button>
            ))}
          </div>
          <div className="flex gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {requisitions.filter(r => r.status === 'pending').length}
              </div>
              <div className="text-sm text-gray-600">Pendientes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {requisitions.filter(r => r.status === 'approved').length}
              </div>
              <div className="text-sm text-gray-600">Aprobadas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                ${requisitions
                  .filter(r => r.status === 'approved')
                  .reduce((sum, r) => sum + parseFloat(r.amount || 0), 0)
                  .toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-sm text-gray-600">Total Aprobado</div>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de requisiciones */}
      <div className="grid gap-4">
        {filteredRequisitions.map((req) => (
          <div key={req._id || req.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-sm font-medium text-gray-500">
                    {req.requisition_code || `REQ-${req._id?.slice(-6)}`}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${statusColors[req.status]}`}>
                    {statusIcons[req.status]}
                    {statusLabels[req.status]}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {requestTypeLabels[req.request_type] || req.request_type}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-sm text-gray-600">A favor de:</p>
                    <p className="font-semibold text-gray-800">{req.payable_to}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Monto:</p>
                    <p className="font-semibold text-blue-600 text-lg">
                      ${parseFloat(req.amount || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })} {req.currency}
                    </p>
                  </div>
                </div>

                <div className="mb-3">
                  <p className="text-sm text-gray-600">Concepto:</p>
                  <p className="text-gray-800">{req.concept}</p>
                </div>

                <div className="flex items-center gap-6 text-sm text-gray-600">
                  <span>Solicitado: {new Date(req.request_date || req.createdAt).toLocaleDateString('es-MX')}</span>
                  <span>Departamento: SISTEMAS</span>
                  {req.requested_by && (
                    <span>Por: {req.requested_by.full_name}</span>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleDownloadPDF(req._id || req.id)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  PDF
                </button>
                {req.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleStatusChange(req._id || req.id, true)}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Aprobar
                    </button>
                    <button
                      onClick={() => handleStatusChange(req._id || req.id, false)}
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
          <div className="text-center py-12 text-gray-500 bg-white rounded-lg shadow-md">
            No hay requisiciones {filterStatus !== 'Todas' && `con estado "${statusLabels[filterStatus.toLowerCase()]}"`}
          </div>
        )}
      </div>

      {/* Modal Requisición */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-3 mb-6">
              <img
                src="https://i.imgur.com/8vZqYXm.png"
                alt="Beachscape Logo"
                className="h-16"
              />
              <div>
                <h2 className="text-2xl font-bold text-gray-800">SOLICITUD DE TRANSFERENCIA</h2>
                <p className="text-sm text-gray-600">Beachscape Kin Ha Villas & Suites</p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                {/* Tipo de Solicitud */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    TIPO DE SOLICITUD *
                  </label>
                  <select
                    required
                    value={formData.request_type}
                    onChange={(e) => setFormData({ ...formData, request_type: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="transferencia">TRANSFERENCIA</option>
                    <option value="pago_tarjeta">PAGO POR TARJETA</option>
                    <option value="efectivo">EFECTIVO</option>
                    <option value="pago_linea">PAGO EN LÍNEA</option>
                  </select>
                </div>

                {/* Fecha y Monto */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      FECHA
                    </label>
                    <input
                      type="text"
                      value={new Date().toLocaleDateString('es-MX', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      }).toUpperCase()}
                      disabled
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      POR LA CANTIDAD DE: $ *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Moneda */}
                <div className="flex gap-6">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="currency"
                      value="MXN"
                      checked={formData.currency === 'MXN'}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium">MXN</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="currency"
                      value="USD"
                      checked={formData.currency === 'USD'}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium">USD</span>
                  </label>
                </div>

                {/* A Favor De */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium text-gray-700">
                      A FAVOR DE: *
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowClientModal(true)}
                      className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1 font-medium"
                    >
                      <UserPlus className="w-4 h-4" />
                      Agregar nuevo cliente
                    </button>
                  </div>
                  <select
                    required
                    value={formData.payable_to}
                    onChange={(e) => setFormData({ ...formData, payable_to: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar cliente...</option>
                    {clients.map((client) => (
                      <option key={client._id} value={client.name}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                  {clients.length === 0 && (
                    <p className="text-xs text-amber-600 mt-1">
                      No hay clientes registrados. Haz clic en "Agregar nuevo cliente" para crear uno.
                    </p>
                  )}
                </div>

                {/* Concepto */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CONCEPTO: *
                  </label>
                  <textarea
                    required
                    value={formData.concept}
                    onChange={(e) => setFormData({ ...formData, concept: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder="Describe el motivo de la solicitud..."
                  />
                </div>

                {/* Departamento */}
                <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    DEPARTAMENTO:
                  </label>
                  <p className="text-lg font-bold text-blue-800">SISTEMAS</p>
                </div>

                {/* Nota */}
                <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
                  <p className="text-sm text-gray-700">
                    <strong>Nota:</strong> Las firmas de autorización se agregarán automáticamente al generar el PDF.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold"
                >
                  Crear Requisición
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 font-semibold"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Cliente */}
      {showClientModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Agregar Nuevo Cliente</h2>
            <form onSubmit={handleCreateClient}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del Cliente / Empresa *
                  </label>
                  <input
                    type="text"
                    required
                    value={newClient.name}
                    onChange={(e) => setNewClient({ name: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Ej: DAYJAF INTEGRALES"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Este cliente estará disponible para futuras requisiciones
                  </p>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 font-semibold flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-5 h-5" />
                  Agregar Cliente
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowClientModal(false);
                    setNewClient({ name: '' });
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