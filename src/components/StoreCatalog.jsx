import React, { useState, useEffect } from 'react';
import './StoreCatalog.css';
import { storeProducts } from '../mockData';

const StoreCatalog = ({ storeSearchQuery, onAddToCart }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState(storeProducts);

  useEffect(() => {
    // If the chatbot updates the search query, sync it here
    if (storeSearchQuery !== undefined && storeSearchQuery !== null) {
      setSearchTerm(storeSearchQuery);
    }
  }, [storeSearchQuery]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredProducts(storeProducts);
    } else {
      const lower = searchTerm.toLowerCase();
      const filtered = storeProducts.filter(p => 
        p.name.toLowerCase().includes(lower) || 
        p.description.toLowerCase().includes(lower) ||
        p.category.toLowerCase().includes(lower)
      );
      setFilteredProducts(filtered);
    }
  }, [searchTerm]);

  return (
    <div className="store-catalog-container">
      <div className="catalog-header">
        <h2>Catálogo de Productos</h2>
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input 
            type="text" 
            placeholder="Buscar por nombre, descripción o categoría..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="products-grid">
        {filteredProducts.length === 0 ? (
          <div className="no-results">No se encontraron productos para "{searchTerm}"</div>
        ) : (
          filteredProducts.map(product => (
            <div key={product.id} className="product-card glass-card">
              <div className="product-image-container">
                <img src={product.image} alt={product.name} className="product-image" />
                {product.stock < 20 && <span className="low-stock-badge">Poco Stock</span>}
              </div>
              <div className="product-details">
                <span className="product-code">{product.code}</span>
                <h3 className="product-name">{product.name}</h3>
                <p className="product-desc">{product.description}</p>
                
                <div className="product-footer">
                  <div className="product-price">${product.price.toFixed(2)}</div>
                  <div className="product-stock">Disp: {product.stock}</div>
                </div>
                
                <button 
                  className="add-to-cart-btn"
                  onClick={() => onAddToCart(product)}
                >
                  🛒 Añadir al Carrito
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StoreCatalog;
