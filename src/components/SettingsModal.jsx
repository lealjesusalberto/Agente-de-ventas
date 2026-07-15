import React, { useState } from 'react';
import './SettingsModal.css';

const SettingsModal = ({ onClose, initialSettings, onSaveSettings }) => {
  const [exchangeRate, setExchangeRate] = useState(initialSettings.exchangeRate);
  const [materials, setMaterials] = useState([...initialSettings.materials]);

  const handlePriceChange = (id, newPrice) => {
    setMaterials(prev => prev.map(m => 
      m.id === id ? { ...m, pricePerSqm: parseFloat(newPrice) || 0 } : m
    ));
  };

  const handleTypeChange = (id, newType) => {
    setMaterials(prev => prev.map(m => 
      m.id === id ? { ...m, pricingType: newType } : m
    ));
  };

  const handleTemplateChange = (id, newTemplate) => {
    setMaterials(prev => prev.map(m => 
      m.id === id ? { ...m, template: newTemplate } : m
    ));
  };

  const handleSave = () => {
    onSaveSettings({
      exchangeRate: parseFloat(exchangeRate) || 1,
      materials
    });
    onClose();
  };

  return (
    <div className="settings-modal-overlay" onClick={onClose}>
      <div className="settings-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>&times;</button>
        
        <div className="settings-header">
          <h2>⚙️ Configuración Administrativa</h2>
        </div>
        
        <div className="settings-section">
          <h3>Tasa de Cambio del Día</h3>
          <div className="rate-input-group">
            <span style={{ fontSize: '1.5rem' }}>🇻🇪</span>
            <label>1 USD ($) = </label>
            <input 
              type="number" 
              step="0.01"
              value={exchangeRate}
              onChange={e => setExchangeRate(e.target.value)}
            />
            <span>Bs</span>
          </div>
        </div>

        <div className="settings-section">
          <h3>Catálogo de Productos</h3>
          <table className="materials-table">
            <thead>
              <tr>
                <th>Producto / Material</th>
                <th>Tipo de Cobro</th>
                <th>Costo Base (USD)</th>
                <th>Guía de Archivo (Template)</th>
              </tr>
            </thead>
            <tbody>
              {materials.map(mat => (
                <tr key={mat.id}>
                  <td>{mat.name}</td>
                  <td>
                    <select 
                      value={mat.pricingType || 'area'} 
                      onChange={e => handleTypeChange(mat.id, e.target.value)}
                      style={{ background: 'rgba(0,0,0,0.3)', color: 'white', border: '1px solid var(--glass-border)', padding: '0.2rem', borderRadius: '4px' }}
                    >
                      <option value="area">Por m² (Área)</option>
                      <option value="unit">Por Unidad</option>
                      <option value="pack">Por Paquete</option>
                    </select>
                  </td>
                  <td>
                    <span style={{color: 'var(--accent-green)', marginRight: '4px'}}>$</span>
                    <input 
                      type="number"
                      step="0.1"
                      className="material-price-input"
                      value={mat.pricePerSqm}
                      onChange={e => handlePriceChange(mat.id, e.target.value)}
                    />
                  </td>
                  <td>
                    <input 
                      type="text"
                      className="material-price-input"
                      style={{ width: '100%', minWidth: '150px' }}
                      value={mat.template || ''}
                      onChange={e => handleTemplateChange(mat.id, e.target.value)}
                      placeholder="Ej. Mesa de trabajo 58cm"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button className="btn-save-settings" onClick={handleSave}>
          Guardar Cambios
        </button>
      </div>
    </div>
  );
};

export default SettingsModal;
