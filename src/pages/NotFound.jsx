// src/pages/NotFound.jsx
import { useNavigate } from 'react-router-dom';
import { Home, AlertTriangle } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <AlertTriangle className="w-24 h-24 text-yellow-500" />
        </div>
        <h1 className="text-9xl font-bold text-gray-800 mb-4">404</h1>
        <h2 className="text-3xl font-bold text-gray-700 mb-4">Página no encontrada</h2>
        <p className="text-gray-600 mb-8">
          Lo sentimos, la página que buscas no existe o ha sido movida.
        </p>
        <button
          onClick={() => navigate('/dashboard')}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto"
        >
          <Home className="w-5 h-5" />
          Volver al Dashboard
        </button>
      </div>
    </div>
  );
}