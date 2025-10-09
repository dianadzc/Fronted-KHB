import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  // Verificar si hay token en localStorage
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  // Si no hay token, redirigir al login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Si hay token, mostrar el contenido protegido
  return children;
}