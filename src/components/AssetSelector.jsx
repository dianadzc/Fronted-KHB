// src/components/AssetSelector.jsx
import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import api from '../services/api';

export default function AssetSelector({ value, onChange, required = false }) {
  const [assets, setAssets] = useState([]);
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);

  useEffect(() => {
    loadAssets();
  }, []);

  useEffect(() => {
    if (value && assets.length > 0) {
      const asset = assets.find(a => a.id === value);
      setSelectedAsset(asset);
    }
  }, [value, assets]);

  const loadAssets = async () => {
    try {
      const data = await api.getInventory();
      setAssets(data);
      setFilteredAssets(data);
    } catch (error) {
      console.error('Error al cargar activos:', error);
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    if (term.trim() === '') {
      setFilteredAssets(assets);
    } else {
      const filtered = assets.filter(asset =>
        asset.nombre?.toLowerCase().includes(term.toLowerCase()) ||
        asset.asset_code?.toLowerCase().includes(term.toLowerCase()) ||
        asset.marca?.toLowerCase().includes(term.toLowerCase()) ||
        asset.modelo?.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredAssets(filtered);
    }
  };

  const handleSelect = (asset) => {
    setSelectedAsset(asset);
    onChange(asset.id);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = () => {
    setSelectedAsset(null);
    onChange(null);
    setSearchTerm('');
  };

  return (
    <div className="relative">
      {/* Display seleccionado o input de búsqueda */}
      {selectedAsset ? (
        <div className="flex items-center justify-between px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50">
          <div>
            <p className="font-medium text-gray-900">{selectedAsset.nombre}</p>
            <p className="text-sm text-gray-500">
              {selectedAsset.marca} {selectedAsset.modelo} • {selectedAsset.asset_code}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="text-red-500 hover:text-red-700 font-medium text-sm"
          >
            Cambiar
          </button>
        </div>
      ) : (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => setIsOpen(true)}
            placeholder="Buscar activo por nombre, código, marca..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required={required}
          />
        </div>
      )}

      {/* Dropdown de resultados */}
      {isOpen && !selectedAsset && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {filteredAssets.length > 0 ? (
              filteredAssets.map((asset) => (
                <button
                  key={asset.id}
                  type="button"
                  onClick={() => handleSelect(asset)}
                  className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition-colors"
                >
                  <p className="font-medium text-gray-900">{asset.nombre}</p>
                  <p className="text-sm text-gray-500">
                    {asset.marca} {asset.modelo} • {asset.asset_code}
                  </p>
                  <span className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-full ${
                    asset.status === 'active' ? 'bg-green-100 text-green-800' :
                    asset.status === 'in_use' ? 'bg-blue-100 text-blue-800' :
                    asset.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {asset.estado}
                  </span>
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-center text-gray-500">
                No se encontraron activos
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}