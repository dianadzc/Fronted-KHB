// src/pages/Users.jsx - CON ELIMINAR Y EMAIL OPCIONAL
import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Users as UsersIcon, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    full_name: '',
    email: '',
    role: 'user',
    department: ''
  });

  useEffect(() => {
    loadUsers();
    loadCurrentUser();
  }, []);
  //
  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await api.getUsers();
      console.log('👥 Usuarios recibidos:', response);

      // ⭐ MAPEAR CORRECTAMENTE EL ID
      const mappedUsers = response.map(user => ({
        ...user,
        id: user._id || user.id  // ⭐ IMPORTANTE: MongoDB usa _id
      }));

      setUsers(mappedUsers);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      toast.error('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // ⭐ Preparar datos sin campos vacíos
      const dataToSend = {
        full_name: formData.full_name,
        role: formData.role,
        department: formData.department
      };

      // Solo incluir email si tiene valor
      if (formData.email && formData.email.trim() !== '') {
        dataToSend.email = formData.email.trim();
      }

      // Solo incluir password si tiene valor
      if (formData.password && formData.password.trim() !== '') {
        dataToSend.password = formData.password.trim();
      }

      // Si es nuevo usuario, incluir username
      if (!editingUser) {
        dataToSend.username = formData.username;
        // Password es obligatorio al crear
        if (!dataToSend.password) {
          toast.error('La contraseña es obligatoria para nuevos usuarios');
          return;
        }
      }

      console.log('📤 Enviando datos:', dataToSend);

      if (editingUser) {
        await api.updateUser(editingUser.id, dataToSend);
        toast.success('Usuario actualizado exitosamente');
      } else {
        await api.createUser(dataToSend);
        toast.success('Usuario creado exitosamente');
      }

      setShowModal(false);
      resetForm();
      loadUsers();
    } catch (error) {
      console.error('❌ Error al guardar usuario:', error);
      toast.error(error.message || 'Error al guardar el usuario');
    }
  };

  const loadCurrentUser = async () => {
    try {
      const profile = await api.getProfile();
      console.log('👤 Usuario actual:', profile);
      // ⭐ USAR _id si existe, sino id
      setCurrentUserId(profile._id || profile.id);
    } catch (error) {
      console.error('Error al obtener perfil:', error);
    }
  };
  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: '',
      full_name: user.full_name,
      email: user.email || '',
      role: user.role,
      department: user.department || ''
    });
    setShowModal(true);
  };

  // ⭐ FUNCIÓN PARA ELIMINAR
  const handleDelete = async (user) => {
    // Evitar eliminar el usuario actual
    if (user.id === currentUserId) {
      toast.error('No puedes eliminar tu propio usuario');
      return;
    }

    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="font-semibold text-gray-200">¿Estás seguro?</p>
        <p className="text-sm text-gray-200">
          Se eliminará el usuario <strong>{user.username}</strong> permanentemente.
        </p>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await api.deleteUser(user.id);
                toast.success('Usuario eliminado exitosamente');
                loadUsers();
              } catch (error) {
                console.error('Error al eliminar:', error);
                toast.error(error.message || 'Error al eliminar el usuario');
              }
            }}
            className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 font-medium"
          >
            Eliminar
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 font-medium"
          >
            Cancelar
          </button>
        </div>
      </div>
    ), {
      duration: Infinity,
      position: 'top-center',
    });
  };

  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      full_name: '',
      email: '',
      role: 'user',
      department: ''
    });
    setEditingUser(null);
  };

  const roleColors = {
    admin: 'bg-purple-100 text-purple-800',
    user: 'bg-blue-100 text-blue-800'
  };

  const roleLabels = {
    admin: 'Administrador',
    user: 'Usuario'
  };

  if (loading) return <LoadingSpinner fullScreen message="Cargando usuarios..." />;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <UsersIcon className="w-8 h-8" />
            Gestión de Usuarios
          </h1>
          <p className="text-gray-600 mt-1">Administración de usuarios del sistema</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nuevo Usuario
        </button>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre Completo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Departamento</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{user.username}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{user.full_name}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{user.email || '-'}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${roleColors[user.role]}`}>
                    {roleLabels[user.role]}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{user.department || '-'}</td>
                <td className="px-6 py-4">
                  {user.active ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                </td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(user)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Editar"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    {/* ⭐ MOSTRAR BOTÓN SOLO SI NO ES EL USUARIO ACTUAL */}
                    {user.id !== currentUserId && user._id !== currentUserId && (
                      <button
                        onClick={() => handleDelete(user)}
                        className="text-red-600 hover:text-red-800"
                        title="Eliminar"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No hay usuarios registrados
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">
              {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                {!editingUser && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre de Usuario *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="usuario123"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Juan Pérez"
                  />
                </div>
                {/* ⭐ EMAIL OPCIONAL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email (Opcional)
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="usuario@beachscape.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contraseña {editingUser && '(dejar vacío para no cambiar)'}*
                  </label>
                  <input
                    type="password"
                    required={!editingUser}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="••••••••"
                    minLength={6}
                  />
                  <p className="text-xs text-gray-500 mt-1">Mínimo 6 caracteres</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rol *
                  </label>
                  <select
                    required
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="user">Usuario</option>
                    <option value="admin">Administrador</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Usuario: Puede ver y descargar formatos. Admin: Control total del sistema
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Departamento
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Sistemas, Recepción, etc."
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  {editingUser ? 'Actualizar' : 'Crear Usuario'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}