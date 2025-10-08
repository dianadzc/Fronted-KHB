import { useState } from 'react';
import { FileText, Download, BarChart3, PieChart } from 'lucide-react';
import api from '../services/api';

export default function Reports() {
  const [generating, setGenerating] = useState(false);

  const handleDownloadReport = async () => {
    setGenerating(true);
    try {
      await api.downloadInventoryReport();
    } catch (error) {
      console.error('Error al generar reporte:', error);
      alert('Error al generar el reporte');
    } finally {
      setGenerating(false);
    }
  };

  const reportTypes = [
    {
      title: 'Reporte de Inventario Completo',
      description: 'Lista completa de todos los activos con sus detalles, estado y valor estimado.',
      icon: <FileText className="w-8 h-8" />,
      color: 'blue',
      action: handleDownloadReport
    },
    {
      title: 'Reporte de Incidencias',
      description: 'Historial de incidencias técnicas registradas, incluyendo estado y prioridad.',
      icon: <BarChart3 className="w-8 h-8" />,
      color: 'red',
      action: () => alert('Funcionalidad en desarrollo')
    },
    {
      title: 'Reporte de Mantenimientos',
      description: 'Registro de mantenimientos preventivos y correctivos realizados.',
      icon: <PieChart className="w-8 h-8" />,
      color: 'yellow',
      action: () => alert('Funcionalidad en desarrollo')
    },
    {
      title: 'Reporte de Formatos Responsivos',
      description: 'Control de asignación y devolución de activos a empleados.',
      icon: <FileText className="w-8 h-8" />,
      color: 'green',
      action: () => alert('Funcionalidad en desarrollo')
    },
    {
      title: 'Reporte de Requisiciones',
      description: 'Historial de solicitudes de compra con montos y estados de aprobación.',
      icon: <BarChart3 className="w-8 h-8" />,
      color: 'purple',
      action: () => alert('Funcionalidad en desarrollo')
    },
    {
      title: 'Reporte Financiero',
      description: 'Análisis de costos de mantenimientos, activos y requisiciones aprobadas.',
      icon: <PieChart className="w-8 h-8" />,
      color: 'indigo',
      action: () => alert('Funcionalidad en desarrollo')
    }
  ];

  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    red: 'from-red-500 to-red-600',
    yellow: 'from-yellow-500 to-yellow-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    indigo: 'from-indigo-500 to-indigo-600'
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2 mb-2">
          <FileText className="w-8 h-8" />
          Centro de Reportes
        </h1>
        <p className="text-gray-600">Genera reportes detallados en formato PDF</p>
      </div>

      {/* Información */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-8 rounded-lg">
        <p className="text-blue-700">
          <strong>Información:</strong> Los reportes se generan en formato PDF y se descargan automáticamente. 
          Incluyen todos los datos actualizados del sistema con formato profesional.
        </p>
      </div>

      {/* Grid de reportes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportTypes.map((report, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden"
          >
            <div className={`bg-gradient-to-r ${colorClasses[report.color]} p-6 text-white`}>
              <div className="flex justify-between items-start mb-4">
                {report.icon}
              </div>
              <h3 className="text-xl font-bold">{report.title}</h3>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-4 min-h-[60px]">
                {report.description}
              </p>
              <button
                onClick={report.action}
                disabled={generating}
                className={`w-full bg-gradient-to-r ${colorClasses[report.color]} text-white py-3 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 font-semibold disabled:opacity-50`}
              >
                <Download className="w-5 h-5" />
                {generating ? 'Generando...' : 'Descargar PDF'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Información adicional */}
      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Características de los Reportes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Formato Profesional</h3>
              <p className="text-sm text-gray-600">Documentos con diseño corporativo del hotel</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <Download className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Descarga Inmediata</h3>
              <p className="text-sm text-gray-600">Reportes listos para imprimir o compartir</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="bg-purple-100 p-2 rounded-lg">
              <BarChart3 className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Datos Actualizados</h3>
              <p className="text-sm text-gray-600">Información en tiempo real del sistema</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="bg-orange-100 p-2 rounded-lg">
              <PieChart className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Análisis Completo</h3>
              <p className="text-sm text-gray-600">Estadísticas y métricas detalladas</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}