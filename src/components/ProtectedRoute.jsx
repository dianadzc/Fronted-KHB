import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import LoadingSpinner from './LoadingSpinner'

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, loading, user, isAdmin } = useAuth()

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return <LoadingSpinner />
  }

  // Redirigir al login si no está autenticado
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Verificar permisos de admin si es necesario
  if (requireAdmin && !isAdmin()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div className="mt-3 text-center">
            <h3 className="text-lg font-medium text-gray-900">
              Acceso Denegado
            </h3>
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                No tienes permisos suficientes para acceder a esta sección. 
                Esta área está restringida solo para administradores.
              </p>
            </div>
            <div className="mt-4">
              <button 
                onClick={() => window.history.back()}
                className="btn-outline mr-3"
              >
                Volver
              </button>
              <button 
                onClick={() => window.location.href = '/dashboard'}
                className="btn-primary"
              >
                Ir al Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return children
}

export default ProtectedRoute