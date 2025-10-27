// src/pages/Profile.jsx
import { useState, useEffect } from 'react';
import { User, Mail, Building, Shield, Calendar, Edit2 } from 'lucide-react';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    department: ''
  });

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(userData);
    setFormData({
      full_name: userData.full_name || '',
      email: userData.email || '',
      department: userData.department || ''
    });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí iría la llamada a la API para actualizar el perfil
    const updatedUser = { ...user, ...formData };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    setEditing(false);
    alert('Perfil actualizado exitosamente');
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Cargando perfil...</div>
      </div>
    );
  }

  const roleLabels = {
    'admin': 'Administrador',
    'user': 'Usuario'
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-lg p-8 text-white">
          <div className="flex items-center gap-4">
            <div className="bg-white p-4 rounded-full">
              <User className="w-16 h-16 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{user.full_name || user.username}</h1>
              <p className="text-blue-100">@{user.username}</p>
            </div>
          </div>
        </div>

        {/* Información del perfil */}
        <div className="bg-white rounded-b-lg shadow-lg p-8">
          {!editing ? (
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Información del Perfil</h2>
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Edit2 className="w-4 h-4" />
                  Editar Perfil
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <User className="w-6 h-6 text-gray-600 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Nombre Completo</p>
                    <p className="text-lg font-semibold text-gray-800">{user.full_name || 'No especificado'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <Mail className="w-6 h-6 text-gray-600 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Correo Electrónico</p>
                    <p className="text-lg font-semibold text-gray-800">{user.email || 'No especificado'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <Building className="w-6 h-6 text-gray-600 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Departamento</p>
                    <p className="text-lg font-semibold text-gray-800">{user.department || 'No especificado'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <Shield className="w-6 h-6 text-gray-600 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Rol</p>
                    <p className="text-lg font-semibold text-gray-800">{roleLabels[user.rol] || user.rol}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <Calendar className="w-6 h-6 text-gray-600 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Miembro desde</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString('es-MX', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'No disponible'}
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Editar Perfil</h2>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre Completo
                    </label>
                    <input
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Correo Electrónico
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Departamento
                    </label>
                    <input
                      type="text"
                      value={formData.department}
                      onChange={(e) => setFormData({...formData, department: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                  >
                    Guardar Cambios
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(false);
                      setFormData({
                        full_name: user.full_name || '',
                        email: user.email || '',
                        department: user.department || ''
                      });
                    }}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </>
          )}
        </div>

        {/* Información adicional */}
        <div className="mt-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
          <p className="text-blue-700">
            <strong>Sistema:</strong> KBH - Hotel Kin Ha Beachscape
          </p>
          <p className="text-blue-600 text-sm mt-1">
            Cancún, Quintana Roo, México
          </p>
        </div>
      </div>
    </div>
  );
}