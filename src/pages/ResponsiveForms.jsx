import { useState, useEffect } from 'react';
import { FileText, Plus, Download, RotateCcw } from 'lucide-react';
import api from '../services/api';

export default function ResponsiveForms() {
  const [forms, setForms] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    tipoequipo: '',
    marca: '',
    serie: '',
    receptor: '',
    area: '',
    empresa: '',
    idActivo: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [formsData, assetsData] = await Promise.all([
        api.getResponsiveForms(),
        api.getInventory()
      ]);
      setForms(formsData);
      setAssets(assetsData);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      alert('Error al cargar los formatos responsivos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.createResponsiveForm(formData);
      setShowModal(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error al crear formato:', error);
      alert('Error al crear el formato responsivo');
    }
  };

  const handleReturn = async (id) => {
    if (!confirm('¿Confirmar devolución del activo?')) return;
    try {
      await api.returnAsset(id);
      loadData();
    } catch (error) {
      console.error('Error al devolver activo:', error);
      alert('Error al registrar la devolución');
    }
  };

  const handleDownloadPDF = async (id) => {
    try {
      await api.downloadResponsiveFormPDF(id);
    } catch (error) {
      console.error('Error al descargar PDF:', error);
      alert('Error al descargar el PDF');
    }
  };

  const resetForm = () => {
    setFormData({
      tipoequipo: '',
      marca: '',
      serie: '',
      receptor: '',
      area: '',
      empresa: '',
      idActivo: ''
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Cargando formatos...</div>
      </div>
    );
  }

  const activeForms = forms.filter(f => !f.fechadevolucion);
  const returnedForms = forms.filter(f => f.fechadevolucion);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <FileText className="w-8 h-8" />
            Formatos Responsivos
          </h1>
          <p className="text-gray-600 mt-1">Control de asignación de activos</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nuevo Formato
        </button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Activos Asignados</p>
              <p className="text-3xl font-bold text-blue-600">{activeForms.length}</p>
            </div>
            <FileText className="w-10 h-10 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Activos Devueltos</p>
              <p className="text-3xl font-bold text-green-600">{returnedForms.length}</p>
            </div>
            <RotateCcw className="w-10 h-10 text-green-600" />
          </div>
        </div>
      </div>

      {/* Formatos Activos */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Asignaciones Activas</h2>
        <div className="grid gap-4">
          {activeForms.map((form) => {
            const asset = assets.find(a => a.idActivo === form.idActivo);
            return (
              <div key={form.idresponsiva} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-sm font-medium text-gray-500">
                        Formato #{form.idresponsiva}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Activo
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <p className="text-sm text-gray-600">Equipo</p>
                        <p className="font-semibold text-gray-800">{form.tipoequipo}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Marca / Serie</p>
                        <p className="font-semibold text-gray-800">{form.marca} - {form.serie}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Receptor</p>
                        <p className="font-semibold text-gray-800">{form.receptor}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Área</p>
                        <p className="font-semibold text-gray-800">{form.area}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>Asignado: {new Date(form.fechaasignacion).toLocaleDateString('es-MX')}</span>
                      <span>Empresa: {form.empresa}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDownloadPDF(form.idresponsiva)}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      PDF
                    </button>
                    <button
                      onClick={() => handleReturn(form.idresponsiva)}
                      className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 flex items-center gap-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Devolver
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          {activeForms.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No hay asignaciones activas
            </div>
          )}
        </div>
      </div>

      {/* Historial de Devoluciones */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Historial de Devoluciones</h2>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Equipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Receptor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Asignación</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Devolución</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {returnedForms.map((form) => (
                <tr key={form.idresponsiva} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{form.idresponsiva}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{form.tipoequipo}</div>
                    <div className="text-sm text-gray-500">{form.marca} - {form.serie}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{form.receptor}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {new Date(form.fechaasignacion).toLocaleDateString('es-MX')}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {new Date(form.fechadevolucion).toLocaleDateString('es-MX')}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleDownloadPDF(form.idresponsiva)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {returnedForms.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No hay devoluciones registradas
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">Nuevo Formato Responsivo</h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Activo (Referencia)
                  </label>
                  <select
                    value={formData.idActivo}
                    onChange={(e) => setFormData({...formData, idActivo: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar activo (opcional)...</option>
                    {assets.map(asset => (
                      <option key={asset.idActivo} value={asset.idActivo}>
                        {asset.nombre} - {asset.tipo}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Equipo *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.tipoequipo}
                    onChange={(e) => setFormData({...formData, tipoequipo: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="ej. Laptop HP"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Marca *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.marca}
                    onChange={(e) => setFormData({...formData, marca: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="ej. Dell, HP, Lenovo"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número de Serie *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.serie}
                    onChange={(e) => setFormData({...formData, serie: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="ej. SN123456789"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Costo *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.costo}
                    onChange={(e) => setFormData({...formData, costo: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Receptor (Nombre completo) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.receptor}
                    onChange={(e) => setFormData({...formData, receptor: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nombre del empleado"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Área *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.area}
                    onChange={(e) => setFormData({...formData, area: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="ej. Sistemas, Recepción"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Empresa *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.empresa}
                    onChange={(e) => setFormData({...formData, empresa: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Beachscape Kin Ha"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  Crear Formato
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