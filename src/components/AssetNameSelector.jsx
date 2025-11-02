// src/components/AssetNameSelector.jsx - VERSIÓN CORREGIDA
import { useState, useEffect } from 'react';
import { Search, Plus } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function AssetNameSelector({ value, onChange, required = false }) {
  const [assetNames, setAssetNames] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAssetName, setNewAssetName] = useState('');

  useEffect(() => {
    loadAssetNames();
  }, []);

  const loadAssetNames = async () => {
    try {
      const data = await api.getAssetCatalog();
      setAssetNames(data);
    } catch (error) {
      console.error('Error al cargar catálogo:', error);
      toast.error('Error al cargar nombres de activos');
    }
  };

  const handleSelect = (name) => {
    console.log('🔵 Seleccionado:', name);
    onChange(name); // ⭐ Actualiza directamente el padre
    setShowDropdown(false);
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    onChange(newValue); // ⭐ Actualiza directamente mientras escribe
    setShowDropdown(true);
  };

  const handleAddNew = async () => {
    if (!newAssetName.trim()) {
      toast.error('El nombre no puede estar vacío');
      return;
    }

    try {
      await api.createAssetName({ name: newAssetName.trim() });
      toast.success('Nombre agregado al catálogo');
      setShowAddModal(false);
      setNewAssetName('');
      await loadAssetNames();
      onChange(newAssetName.trim()); // ⭐ Actualiza el valor en el padre
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.message || 'Error al agregar nombre');
    }
  };

  const filteredNames = assetNames.filter(asset =>
    asset.name.toLowerCase().includes((value || '').toLowerCase())
  );

  return (
    <div className="relative">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={value || ''} // ⭐ USAR SOLO value DEL PADRE
            onChange={handleInputChange}
            onFocus={() => setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 300)} // ⭐ Aumentar timeout
            required={required}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Buscar o seleccionar activo..."
          />

          {/* Dropdown */}
          {showDropdown && filteredNames.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {filteredNames.map((asset) => (
                <div
                  key={asset._id}
                  onMouseDown={(e) => {
                    e.preventDefault(); // ⭐ Evita que se active onBlur antes del click
                    handleSelect(asset.name);
                  }}
                  className="px-4 py-2 hover:bg-blue-50 cursor-pointer border-b last:border-b-0"
                >
                  <p className="font-medium text-gray-900">{asset.name}</p>
                  {asset.description && (
                    <p className="text-xs text-gray-500">{asset.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Botón Agregar Nuevo */}
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap"
          title="Agregar nuevo tipo de activo"
        >
          <Plus className="w-5 h-5" />
          <span className="text-sm">Nuevo</span>
        </button>
      </div>

      {/* Modal Agregar Nuevo */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Agregar Nuevo Tipo de Activo</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Nombre del Activo *
                </label>
                <input
                  type="text"
                  value={newAssetName}
                  onChange={(e) => setNewAssetName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddNew()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Ej: Impresora, Monitor, etc."
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-1">
                  Este nombre se agregará al catálogo para futuros usos
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
                    setNewAssetName('');
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