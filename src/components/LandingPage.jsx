import React from 'react';
import './LandingPage.css';

const LandingPage = ({ onTryDemo }) => {
  return (
    <div className="landing-container">
      {/* Navbar */}
      <nav className="landing-nav">
        <div className="logo">
          <span className="logo-icon">🚀</span> Agent<span className="text-orange">Seller</span>
        </div>
        <div className="nav-links">
          <a href="#features">Características</a>
          <a href="#pricing">Precios</a>
          <button className="btn-outline" onClick={onTryDemo}>Acceso Cliente</button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">NUEVO: IA Generativa Integrada ✨</div>
          <h1 className="hero-title">
            Vende y Gestiona en <span className="text-orange">Piloto Automático</span>
          </h1>
          <p className="hero-subtitle">
            El software SaaS diseñado para negocios modernos. Integra un agente inteligente que atiende, cotiza y vende las 24 horas del día, sincronizado en tiempo real con tu tablero Kanban de producción.
          </p>
          <div className="hero-actions">
            <button className="btn-primary" onClick={onTryDemo}>
              Probar Demo Gratis
            </button>
            <button className="btn-secondary" onClick={() => document.getElementById('pricing').scrollIntoView()}>
              Ver Planes
            </button>
          </div>
          <div className="hero-stats">
            <div className="stat"><strong>+500</strong> Negocios activos</div>
            <div className="stat"><strong>24/7</strong> Atención al cliente</div>
            <div className="stat"><strong>+40%</strong> Aumento en ventas</div>
          </div>
        </div>
        <div className="hero-image-wrapper">
          <div className="glow-effect"></div>
          <img src="/saas-hero.png" alt="SaaS Dashboard Mockup" className="hero-image" />
        </div>
      </header>

      {/* Features Section */}
      <section id="features" className="features-section">
        <h2 className="section-title">¿Por qué elegir AgentSeller?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🤖</div>
            <h3>Chatbot IA Inteligente</h3>
            <p>Atiende a tus clientes, toma pedidos, calcula presupuestos y genera recibos de manera automática sin intervención humana.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Tablero Kanban</h3>
            <p>Visualiza y mueve tus órdenes a través de las diferentes etapas de producción o despacho en tiempo real.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🧩</div>
            <h3>Múltiples Módulos</h3>
            <p>Ya sea que tengas una Imprenta o una Ferretería, el sistema adapta su catálogo y lógica a tu modelo de negocio.</p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="pricing-section">
        <h2 className="section-title">Planes diseñados para crecer</h2>
        <div className="pricing-grid">
          
          <div className="pricing-card">
            <h3>Básico</h3>
            <div className="price"><span>$29</span> /mes</div>
            <ul className="pricing-features">
              <li>✔️ Módulo Único</li>
              <li>✔️ 1,000 interacciones de IA</li>
              <li>✔️ Tablero Kanban básico</li>
              <li>❌ Soporte prioritario</li>
            </ul>
            <button className="btn-outline full-width">Elegir Plan</button>
          </div>

          <div className="pricing-card popular">
            <div className="popular-badge">Más Elegido</div>
            <h3>Pro</h3>
            <div className="price"><span>$79</span> /mes</div>
            <ul className="pricing-features">
              <li>✔️ Multimódulo</li>
              <li>✔️ 10,000 interacciones de IA</li>
              <li>✔️ Tablero Kanban Avanzado</li>
              <li>✔️ Soporte 24/7</li>
            </ul>
            <button className="btn-primary full-width">Elegir Plan</button>
          </div>

          <div className="pricing-card">
            <h3>Enterprise</h3>
            <div className="price"><span>$199</span> /mes</div>
            <ul className="pricing-features">
              <li>✔️ Módulos Ilimitados</li>
              <li>✔️ IA Ilimitada</li>
              <li>✔️ Modelos de IA personalizados</li>
              <li>✔️ Asesor de cuenta dedicado</li>
            </ul>
            <button className="btn-outline full-width">Contactar Ventas</button>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>&copy; 2026 AgentSeller SaaS. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
