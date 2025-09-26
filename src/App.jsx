import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import LoadingSpinner from './components/LoadingSpinner'

// Páginas
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Inventory from './pages/Inventory'
import Incidents from './pages/Incidents'
import Maintenance from './pages/Maintenance'
import ResponsiveForms from './pages/ResponsiveForms'
import Requisitions from './pages/Requisitions'
import Reports from './pages/Reports'
import Users from './pages/Users'
import Profile from './pages/Profile'

// Páginas de error
import NotFound from './pages/NotFound'

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Routes>
          {/* Ruta de login */}
          <Route path="/login" element={<Login />} />
          
          {/* Rutas protegidas */}
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            {/* Dashboard */}
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            
            {/* Inventario */}
            <Route path="inventory" element={<Inventory />} />
            
            {/* Incidencias */}
            <Route path="incidents" element={<Incidents />} />
            
            {/* Mantenimientos */}
            <Route path="maintenance" element={<Maintenance />} />
            
            {/* Formatos Responsivos */}
            <Route path="responsive-forms" element={<ResponsiveForms />} />
            
            {/* Requisiciones */}
            <Route path="requisitions" element={<Requisitions />} />
            
            {/* Reportes */}
            <Route path="reports" element={<Reports />} />
            
            {/* Usuarios (Solo Admin) */}
            <Route path="users" element={
              <ProtectedRoute requireAdmin>
                <Users />
              </ProtectedRoute>
            } />
            
            {/* Perfil */}
            <Route path="profile" element={<Profile />} />
          </Route>
          
          {/* Página 404 */}
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </div>
    </AuthProvider>
  )
}

export default App