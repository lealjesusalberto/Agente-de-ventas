import React from 'react';
import './ShoppingCart.css';

const ShoppingCart = ({ cart, onRemoveFromCart, onCheckout }) => {
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="shopping-cart glass-card">
      <div className="cart-header">
        <h3>🛒 Mi Carrito</h3>
        <span className="cart-count">{cart.length}</span>
      </div>

      <div className="cart-items">
        {cart.length === 0 ? (
          <div className="empty-cart">
            <p>Tu carrito está vacío.</p>
            <p className="empty-hint">Agrega productos del catálogo o pídelos al asistente.</p>
          </div>
        ) : (
          cart.map((item, index) => (
            <div key={`${item.id}-${index}`} className="cart-item">
              <div className="item-info">
                <span className="item-name">{item.name}</span>
                <span className="item-qty-price">
                  {item.quantity} x ${item.price.toFixed(2)}
                </span>
              </div>
              <div className="item-total">
                ${(item.quantity * item.price).toFixed(2)}
              </div>
              <button 
                className="remove-btn" 
                onClick={() => onRemoveFromCart(index)}
                title="Eliminar del carrito"
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>

      <div className="cart-footer">
        <div className="cart-total-row">
          <span>Total estimado:</span>
          <span className="cart-total-amount">${total.toFixed(2)}</span>
        </div>
        <button 
          className="checkout-btn" 
          disabled={cart.length === 0}
          onClick={onCheckout}
        >
          Procesar Orden
        </button>
      </div>
    </div>
  );
};

export default ShoppingCart;
