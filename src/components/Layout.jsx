// src/components/Layout.jsx
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  Menu, X, Home, Package, AlertCircle, Wrench,
  FileText, ShoppingCart, BarChart3, Users, User, LogOut
} from 'lucide-react';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Detectar tamaño de pantalla
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLogout = () => {
    if (confirm('¿Estás seguro de cerrar sesión?')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebarOnMobile = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const menuItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/inventory', icon: Package, label: 'Inventario' },
    { path: '/incidents', icon: AlertCircle, label: 'Incidencias' },
    { path: '/maintenance', icon: Wrench, label: 'Mantenimientos' },
    { path: '/responsive-forms', icon: FileText, label: 'Formatos Responsivos' },
    { path: '/requisitions', icon: ShoppingCart, label: 'Requisiciones' },
    { path: '/reports', icon: BarChart3, label: 'Reportes' },
    { path: '/users', icon: Users, label: 'Usuarios' },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Overlay para móvil */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={closeSidebarOnMobile}
        />
      )}

      {/* Sidebar Responsivo */}
      <aside 
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${sidebarOpen && !isMobile ? 'w-64' : 'w-64 lg:w-20'}
          bg-gradient-to-b from-slate-800 to-slate-900 text-white 
          transition-all duration-300 shadow-xl flex flex-col
        `}
      >
        {/* Header del Sidebar */}
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center justify-between">
            {(sidebarOpen || isMobile) && (
              <div className={`${isMobile ? 'block' : sidebarOpen ? 'block' : 'hidden lg:hidden'}`}>
                <h1 className="text-lg font-bold text-white">KBH Sistema</h1>
                <p className="text-xs text-slate-400">Kin Ha Beachscape</p>
              </div>
            )}
            <button
              onClick={toggleSidebar}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              aria-label="Toggle Sidebar"
            >
              {(sidebarOpen || isMobile) ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Navegación Principal */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    closeSidebarOnMobile();
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <item.icon size={20} className="flex-shrink-0" />
                  {(sidebarOpen || isMobile) && (
                    <span className="text-sm font-medium truncate">
                      {item.label}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Footer del Sidebar */}
        <div className="border-t border-slate-700 p-3 space-y-1">
          <button
            onClick={() => {
              navigate('/profile');
              closeSidebarOnMobile();
            }}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
              location.pathname === '/profile'
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <User size={20} className="flex-shrink-0" />
            {(sidebarOpen || isMobile) && <span className="text-sm font-medium">Perfil</span>}
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-colors"
          >
            <LogOut size={20} className="flex-shrink-0" />
            {(sidebarOpen || isMobile) && <span className="text-sm font-medium">Cerrar Sesión</span>}
          </button>
        </div>
      </aside>

      {/* Contenido Principal */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header Responsivo */}
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="px-3 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
            {/* Botón hamburguesa en móvil (solo cuando sidebar está cerrado) */}
            <div className="flex items-center gap-3">
              {!sidebarOpen && (
                <button
                  onClick={toggleSidebar}
                  className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Menu size={24} className="text-gray-700" />
                </button>
              )}
              
              <div>
                <h2 className="text-base sm:text-xl lg:text-2xl font-bold text-gray-800">
                  Hotel Kin Ha Beachscape
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">
                  Sistema de Inventario y Administración de Formatos
                </p>
              </div>
            </div>

            {/* User Info - Responsivo */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="text-right hidden md:block">
                <p className="text-xs sm:text-sm font-semibold text-gray-700">
                  {user.full_name || 'Usuario'}
                </p>
                <p className="text-xs text-gray-500">
                  {user.department || 'Departamento'}
                </p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <User size={16} className="text-white sm:w-5 sm:h-5" />
              </div>
            </div>
          </div>
        </header>

        {/* Área de Contenido con Scroll */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-3 sm:p-4 lg:p-6">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}