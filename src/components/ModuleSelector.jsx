import React from 'react';
import './ModuleSelector.css';

const ModuleSelector = ({ onSelectModule }) => {
  return (
    <div className="module-selector-container">
      <div className="selector-content">
        <h1 className="selector-title">Elige tu Módulo</h1>
        <p className="selector-subtitle">Selecciona el área que deseas gestionar hoy</p>
        
        <div className="cards-wrapper">
          <div className="module-card print-card" onClick={() => onSelectModule('print')}>
            <div className="card-icon">🖨️</div>
            <h2>Print Manager</h2>
            <p>Control de Producción & IA para tu imprenta.</p>
            <div className="card-glow"></div>
          </div>
          
          <div className="module-card hardware-card" onClick={() => onSelectModule('hardware')}>
            <div className="card-icon">🔨</div>
            <h2>Ferretería Manager</h2>
            <p>Control de Inventario y Órdenes de compra.</p>
            <div className="card-glow"></div>
          </div>

          <div className="module-card store-card" onClick={() => onSelectModule('store')}>
            <div className="card-icon">🏪</div>
            <h2>Mini Market</h2>
            <p>Catálogo de ventas B2C interactivo con IA.</p>
            <div className="card-glow"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModuleSelector;
