// src/components/TypeSelector.jsx
import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function TypeSelector({ value, onChange, required = false }) {
  const [types, setTypes] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newType, setNewType] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    loadTypes();
  }, []);

  const loadTypes = async () => {
    try {
      const data = await api.getTypeCatalog();
      setTypes(data);
    } catch (error) {
      console.error('Error al cargar tipos:', error);
      toast.error('Error al cargar tipos');
    }
  };

  const handleAddNew = async () => {
    if (!newType.trim()) {
      toast.error('El nombre no puede estar vacío');
      return;
    }

    try {
      await api.createType({ name: newType.trim() });
      toast.success('Tipo agregado al catálogo');
      setShowAddModal(false);
      setNewType('');
      await loadTypes();
      onChange(newType.trim());
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.message || 'Error al agregar tipo');
    }
  };

  return (
    <div className="relative">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <select
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setShowDropdown(true)}
            onBlur={() => setShowDropdown(false)}
            required={required}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
          >
            <option value="">Seleccionar tipo...</option>
            {types.map((type) => (
              <option key={type._id} value={type.name}>
                {type.name}
              </option>
            ))}
          </select>
          {/* Flecha personalizada */}
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Botón Agregar Nuevo */}
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap"
          title="Agregar nuevo tipo"
        >
          <Plus className="w-5 h-5" />
          <span className="text-sm">Nuevo</span>
        </button>
      </div>

      {/* Modal Agregar Nuevo */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Agregar Nuevo Tipo</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Nombre del Tipo *
                </label>
                <input
                  type="text"
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddNew()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Ej: Audio/Video, Mobiliario, etc."
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-1">
                  Este tipo se agregará al catálogo para futuros usos
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleAddNew}
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
                >
                  Agregar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setNewType('');
                  }}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}