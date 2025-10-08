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
    <Router>
      <Routes>
        {/* Ruta pública */}
        <Route path="/login" element={<Login />} />

        {/* Rutas protegidas con Layout */}
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/incidents" element={<Incidents />} />
          <Route path="/maintenance" element={<Maintenance />} />
          <Route path="/responsive-forms" element={<ResponsiveForms />} />
          <Route path="/requisitions" element={<Requisitions />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/users" element={<Users />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* Redirecciones */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;