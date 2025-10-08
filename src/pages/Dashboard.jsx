import { useState, useEffect } from 'react';
import { Package, AlertCircle, Wrench, FileText, ShoppingCart, TrendingUp } from 'lucide-react';
import api from '../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState({
    inventory: [],
    incidents: [],
    maintenance: [],
    responsiveForms: [],
    requisitions: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [inventory, incidents, maintenance, responsiveForms, requisitions] = await Promise.all([
        api.getInventory(),
        api.getIncidents(),
        api.getMaintenance(),
        api.getResponsiveForms(),
        api.getRequisitions()
      ]);
      
      setStats({
        inventory,
        incidents,
        maintenance,
        responsiveForms,
        requisitions
      });
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Cargando dashboard...</div>
      </div>
    );
  }

  const inventoryValue = stats.inventory.reduce((sum, item) => 
    sum + parseFloat(item.valorEstimado || 0), 0
  );

  const pendingIncidents = stats.incidents.filter(i => i.estado === 'Pendiente').length;
  const pendingMaintenance = stats.maintenance.filter(m => !m.fechaFin).length;
  const activeAssignments = stats.responsiveForms.filter(f => !f.fechadevolucion).length;
  const pendingRequisitions = stats.requisitions.filter(r => r.estado === 'Pendiente').length;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          Dashboard KBH
        </h1>
        <p className="text-gray-600">Hotel Kin Ha Beachscape - Sistema de Gestión de Activos</p>
      </div>

      {/* Tarjetas de estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Package className="w-10 h-10 opacity-80" />
            <span className="text-3xl font-bold">{stats.inventory.length}</span>
          </div>
          <h3 className="text-lg font-semibold mb-1">Activos Totales</h3>
          <p className="text-blue-100 text-sm">
            Valor: ${inventoryValue.toLocaleString('es-MX')}
          </p>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <AlertCircle className="w-10 h-10 opacity-80" />
            <span className="text-3xl font-bold">{pendingIncidents}</span>
          </div>
          <h3 className="text-lg font-semibold mb-1">Incidencias Pendientes</h3>
          <p className="text-red-100 text-sm">
            Total: {stats.incidents.length} incidencias
          </p>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Wrench className="w-10 h-10 opacity-80" />
            <span className="text-3xl font-bold">{pendingMaintenance}</span>
          </div>
          <h3 className="text-lg font-semibold mb-1">Mantenimientos Activos</h3>
          <p className="text-yellow-100 text-sm">
            Total: {stats.maintenance.length} programados
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <FileText className="w-10 h-10 opacity-80" />
            <span className="text-3xl font-bold">{activeAssignments}</span>
          </div>
          <h3 className="text-lg font-semibold mb-1">Asignaciones Activas</h3>
          <p className="text-green-100 text-sm">
            Formatos responsivos
          </p>
        </div>
      </div>

      {/* Sección de gráficos y listas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Estado del inventario */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Package className="w-6 h-6" />
            Estado del Inventario
          </h2>
          <div className="space-y-3">
            {['Disponible', 'En uso', 'En mantenimiento', 'Dado de baja'].map(estado => {
              const count = stats.inventory.filter(i => i.estado === estado).length;
              const percentage = (count / stats.inventory.length * 100) || 0;
              const colors = {
                'Disponible': 'bg-green-500',
                'En uso': 'bg-blue-500',
                'En mantenimiento': 'bg-yellow-500',
                'Dado de baja': 'bg-red-500'
              };
              return (
                <div key={estado}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700">{estado}</span>
                    <span className="font-semibold">{count} ({percentage.toFixed(0)}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`${colors[estado]} h-2 rounded-full transition-all`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Requisiciones recientes */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <ShoppingCart className="w-6 h-6" />
            Requisiciones
          </h2>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
              <span className="text-gray-700">Pendientes</span>
              <span className="font-bold text-yellow-600">{pendingRequisitions}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="text-gray-700">Aprobadas</span>
              <span className="font-bold text-green-600">
                {stats.requisitions.filter(r => r.estado === 'Aprobada').length}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
              <span className="text-gray-700">Rechazadas</span>
              <span className="font-bold text-red-600">
                {stats.requisitions.filter(r => r.estado === 'Rechazada').length}
              </span>
            </div>
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-medium">Monto Total Aprobado</span>
                <span className="font-bold text-purple-600 text-lg">
                  ${stats.requisitions
                    .filter(r => r.estado === 'Aprobada')
                    .reduce((sum, r) => sum + parseFloat(r.montoestimado || 0), 0)
                    .toLocaleString('es-MX')}
                </span>
              </div>
            </div>  
            </div>
        </div>
      </div>
    </div>
  );
}
