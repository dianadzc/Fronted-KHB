// src/pages/Reports.jsx
import { useState, useEffect } from 'react';
import {
  BarChart3, FileText, Download, Calendar, Package,
  AlertCircle, Wrench, TrendingUp, DollarSign
} from 'lucide-react';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Reports() {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalAssets: 0,
    totalValue: 0,
    openIncidents: 0,
    maintenanceScheduled: 0
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [inventory, incidents] = await Promise.all([
        api.getInventory(),
        api.getIncidents()
      ]);

      const totalValue = inventory.reduce((sum, item) => sum + (item.purchase_price || 0), 0);
      const openIncidents = incidents.filter(i => i.status === 'open' || i.status === 'assigned').length;

      setStats({
        totalAssets: inventory.length,
        totalValue,
        openIncidents,
        maintenanceScheduled: 0 // Agregar lógica de mantenimientos
      });
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  };

  // Función para generar PDF de Inventario Completo
  const generateInventoryReport = async () => {
    try {
      setLoading(true);
      toast.loading('Generando reporte de inventario...');

      const inventory = await api.getInventory();

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      // Encabezado
      doc.setFontSize(18);
      doc.setTextColor(30, 58, 138); // Blue
      doc.text('Hotel Kin Ha Beachscape', 14, 20);
      
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text('Reporte de Inventario Completo', 14, 30);

      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Fecha: ${new Date().toLocaleDateString('es-MX')}`, 14, 38);
      doc.text(`Total de Activos: ${inventory.length}`, 14, 44);

      // Tabla de inventario
      const tableData = inventory.map(item => [
        item.asset_code || 'N/A',
        item.name || '',
        item.category_name || 'Otro',
        item.status === 'active' ? 'Activo' : 
        item.status === 'in_use' ? 'En Uso' :
        item.status === 'maintenance' ? 'Mantenimiento' : 'Inactivo',
        `$${(item.purchase_price || 0).toFixed(2)}`,
        item.brand || 'N/A',
        item.model || 'N/A'
      ]);

      doc.autoTable({
        startY: 50,
        head: [['Código', 'Nombre', 'Categoría', 'Estado', 'Valor', 'Marca', 'Modelo']],
        body: tableData,
        theme: 'grid',
        headStyles: { 
          fillColor: [30, 58, 138],
          textColor: 255,
          fontSize: 9,
          fontStyle: 'bold'
        },
        bodyStyles: { 
          fontSize: 8 
        },
        alternateRowStyles: { 
          fillColor: [245, 247, 250] 
        },
        margin: { top: 50, left: 14, right: 14 }
      });

      // Pie de página
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
          `Página ${i} de ${pageCount}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      }

      doc.save(`Inventario_Completo_${Date.now()}.pdf`);
      toast.dismiss();
      toast.success('Reporte generado exitosamente');
    } catch (error) {
      console.error('Error al generar reporte:', error);
      toast.dismiss();
      toast.error('Error al generar reporte');
    } finally {
      setLoading(false);
    }
  };

  // Función para generar PDF de Incidencias
  const generateIncidentsReport = async () => {
    try {
      setLoading(true);
      toast.loading('Generando reporte de incidencias...');

      const incidents = await api.getIncidents();

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      // Encabezado
      doc.setFontSize(18);
      doc.setTextColor(220, 38, 38); // Red
      doc.text('Hotel Kin Ha Beachscape', 14, 20);
      
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text('Reporte de Incidencias', 14, 30);

      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Fecha: ${new Date().toLocaleDateString('es-MX')}`, 14, 38);
      doc.text(`Total de Incidencias: ${incidents.length}`, 14, 44);

      // Estadísticas
      const openCount = incidents.filter(i => i.status === 'open').length;
      const resolvedCount = incidents.filter(i => i.status === 'resolved').length;
      
      doc.text(`Abiertas: ${openCount} | Resueltas: ${resolvedCount}`, 14, 50);

      // Tabla de incidencias
      const tableData = incidents.map(item => [
        item.incident_code || 'N/A',
        item.title || '',
        item.asset_id?.name || 'N/A',
        item.priority === 'critical' ? 'Crítica' :
        item.priority === 'high' ? 'Alta' :
        item.priority === 'medium' ? 'Media' : 'Baja',
        item.status === 'open' ? 'Abierta' :
        item.status === 'assigned' ? 'Asignada' :
        item.status === 'in_progress' ? 'En Progreso' :
        item.status === 'resolved' ? 'Resuelta' : 'Cerrada',
        new Date(item.reported_date).toLocaleDateString('es-MX')
      ]);

      doc.autoTable({
        startY: 58,
        head: [['Código', 'Título', 'Activo', 'Prioridad', 'Estado', 'Fecha']],
        body: tableData,
        theme: 'grid',
        headStyles: { 
          fillColor: [220, 38, 38],
          textColor: 255,
          fontSize: 9,
          fontStyle: 'bold'
        },
        bodyStyles: { 
          fontSize: 8 
        },
        alternateRowStyles: { 
          fillColor: [254, 242, 242] 
        },
        margin: { top: 58, left: 14, right: 14 }
      });

      // Pie de página
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
          `Página ${i} de ${pageCount}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      }

      doc.save(`Incidencias_${Date.now()}.pdf`);
      toast.dismiss();
      toast.success('Reporte generado exitosamente');
    } catch (error) {
      console.error('Error al generar reporte:', error);
      toast.dismiss();
      toast.error('Error al generar reporte');
    } finally {
      setLoading(false);
    }
  };

  // Función para generar PDF de Mantenimientos
  const generateMaintenanceReport = async () => {
    try {
      setLoading(true);
      toast.loading('Generando reporte de mantenimientos...');

      const maintenance = await api.getMaintenance();

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      // Encabezado
      doc.setFontSize(18);
      doc.setTextColor(234, 179, 8); // Yellow/Orange
      doc.text('Hotel Kin Ha Beachscape', 14, 20);
      
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text('Reporte de Mantenimientos', 14, 30);

      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Fecha: ${new Date().toLocaleDateString('es-MX')}`, 14, 38);
      doc.text(`Total de Mantenimientos: ${maintenance.length}`, 14, 44);

      // Tabla de mantenimientos
      const tableData = maintenance.map(item => [
        item.nombreActivo || 'N/A',
        item.tipo || '',
        item.status === 'scheduled' ? 'Programado' :
        item.status === 'in_progress' ? 'En Progreso' :
        item.status === 'completed' ? 'Completado' : 'Cancelado',
        new Date(item.fechaInicio).toLocaleDateString('es-MX'),
        `$${(item.costosEstimados || 0).toFixed(2)}`,
        item.notas || ''
      ]);

      doc.autoTable({
        startY: 52,
        head: [['Activo', 'Tipo', 'Estado', 'Fecha', 'Costo', 'Notas']],
        body: tableData,
        theme: 'grid',
        headStyles: { 
          fillColor: [234, 179, 8],
          textColor: 0,
          fontSize: 9,
          fontStyle: 'bold'
        },
        bodyStyles: { 
          fontSize: 8 
        },
        alternateRowStyles: { 
          fillColor: [254, 252, 232] 
        },
        margin: { top: 52, left: 14, right: 14 }
      });

      // Pie de página
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
          `Página ${i} de ${pageCount}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      }

      doc.save(`Mantenimientos_${Date.now()}.pdf`);
      toast.dismiss();
      toast.success('Reporte generado exitosamente');
    } catch (error) {
      console.error('Error al generar reporte:', error);
      toast.dismiss();
      toast.error('Error al generar reporte');
    } finally {
      setLoading(false);
    }
  };

  // Función para generar PDF Financiero
  const generateFinancialReport = async () => {
    try {
      setLoading(true);
      toast.loading('Generando reporte financiero...');

      const [inventory, maintenance] = await Promise.all([
        api.getInventory(),
        api.getMaintenance()
      ]);

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      // Encabezado
      doc.setFontSize(18);
      doc.setTextColor(16, 185, 129); // Green
      doc.text('Hotel Kin Ha Beachscape', 14, 20);
      
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text('Reporte Financiero', 14, 30);

      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Fecha: ${new Date().toLocaleDateString('es-MX')}`, 14, 38);

      // Resumen financiero
      const totalAssetValue = inventory.reduce((sum, item) => sum + (item.purchase_price || 0), 0);
      const totalMaintenanceCost = maintenance.reduce((sum, item) => sum + (item.costosEstimados || 0), 0);

      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text('Resumen Financiero:', 14, 50);

      doc.setFontSize(10);
      doc.text(`Valor Total de Activos: $${totalAssetValue.toLocaleString('es-MX', {minimumFractionDigits: 2})}`, 14, 58);
      doc.text(`Costo Total de Mantenimientos: $${totalMaintenanceCost.toLocaleString('es-MX', {minimumFractionDigits: 2})}`, 14, 66);

      // Tabla de activos por categoría
      const categorySummary = inventory.reduce((acc, item) => {
        const category = item.category_name || 'Otro';
        if (!acc[category]) {
          acc[category] = { count: 0, value: 0 };
        }
        acc[category].count++;
        acc[category].value += item.purchase_price || 0;
        return acc;
      }, {});

      const categoryData = Object.entries(categorySummary).map(([category, data]) => [
        category,
        data.count,
        `$${data.value.toFixed(2)}`
      ]);

      doc.autoTable({
        startY: 75,
        head: [['Categoría', 'Cantidad', 'Valor Total']],
        body: categoryData,
        theme: 'grid',
        headStyles: { 
          fillColor: [16, 185, 129],
          textColor: 255,
          fontSize: 9,
          fontStyle: 'bold'
        },
        bodyStyles: { 
          fontSize: 9 
        },
        alternateRowStyles: { 
          fillColor: [236, 253, 245] 
        },
        margin: { top: 75, left: 14, right: 14 }
      });

      // Pie de página
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
          `Página ${i} de ${pageCount}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      }

      doc.save(`Reporte_Financiero_${Date.now()}.pdf`);
      toast.dismiss();
      toast.success('Reporte generado exitosamente');
    } catch (error) {
      console.error('Error al generar reporte:', error);
      toast.dismiss();
      toast.error('Error al generar reporte');
    } finally {
      setLoading(false);
    }
  };

  const reportCards = [
    {
      title: 'Reporte de Inventario Completo',
      description: 'Lista completa de todos los activos con sus detalles, estado y valor estimado.',
      icon: Package,
      color: 'bg-blue-500',
      onClick: generateInventoryReport
    },
    {
      title: 'Reporte de Incidencias',
      description: 'Historial de incidencias técnicas registradas, incluyendo estado y prioridad.',
      icon: AlertCircle,
      color: 'bg-red-500',
      onClick: generateIncidentsReport
    },
    {
      title: 'Reporte de Mantenimientos',
      description: 'Registro de mantenimientos preventivos y correctivos realizados.',
      icon: Wrench,
      color: 'bg-yellow-500',
      onClick: generateMaintenanceReport
    },
    {
      title: 'Reporte Financiero',
      description: 'Análisis de costos de mantenimientos, activos y estadísticas generales.',
      icon: DollarSign,
      color: 'bg-green-500',
      onClick: generateFinancialReport
    }
  ];

  if (loading) {
    return <LoadingSpinner fullScreen message="Generando reporte..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BarChart3 className="text-blue-600" />
          Centro de Reportes
        </h1>
        <p className="text-gray-600 mt-1">
          Genera reportes detallados de inventario, incidencias y mantenimientos con formato profesional
        </p>
      </div>

      {/* Estadísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Activos Totales</p>
              <p className="text-3xl font-bold mt-2">{stats.totalAssets}</p>
            </div>
            <Package size={40} className="text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Valor Total</p>
              <p className="text-3xl font-bold mt-2">${stats.totalValue.toLocaleString()}</p>
            </div>
            <DollarSign size={40} className="text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm font-medium">Incidencias Pendientes</p>
              <p className="text-3xl font-bold mt-2">{stats.openIncidents}</p>
            </div>
            <AlertCircle size={40} className="text-red-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm font-medium">Mantenimientos Activos</p>
              <p className="text-3xl font-bold mt-2">{stats.maintenanceScheduled}</p>
            </div>
            <Wrench size={40} className="text-yellow-200" />
          </div>
        </div>
      </div>

      {/* Información */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
        <div className="flex items-start">
          <FileText className="text-blue-500 mt-1 mr-3" size={20} />
          <div>
            <h3 className="text-sm font-semibold text-blue-900">Formato Profesional</h3>
            <p className="text-sm text-blue-700 mt-1">
              Todos los reportes se generan en formato PDF con diseño corporativo del hotel. 
              Incluyen tablas para imprimir y compartir fácilmente.
            </p>
          </div>
        </div>
      </div>

      {/* Tarjetas de Reportes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportCards.map((report, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden"
          >
            <div className={`${report.color} h-2`} />
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`${report.color} p-3 rounded-lg`}>
                  <report.icon size={24} className="text-white" />
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {report.title}
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                {report.description}
              </p>

              <button
                onClick={report.onClick}
                disabled={loading}
                className={`w-full ${report.color} text-white py-3 px-4 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 font-medium disabled:opacity-50`}
              >
                <Download size={20} />
                Descargar PDF
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Características */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="text-blue-600" />
          Características de los Reportes
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex items-start gap-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <FileText className="text-green-600" size={20} />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 text-sm">Formato Profesional</h4>
              <p className="text-xs text-gray-600">Documentos con diseño corporativo del hotel</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Calendar className="text-blue-600" size={20} />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 text-sm">Datos Actualizados</h4>
              <p className="text-xs text-gray-600">Información en tiempo real del sistema</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="bg-purple-100 p-2 rounded-lg">
              <Download className="text-purple-600" size={20} />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 text-sm">Descarga Inmediata</h4>
              <p className="text-xs text-gray-600">Listos para imprimir y compartir</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}