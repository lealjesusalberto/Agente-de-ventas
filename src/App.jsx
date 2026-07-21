import React, { useState } from 'react';
import './App.css';
import KanbanBoard from './components/KanbanBoard';
import ChatSimulator from './components/ChatSimulator';
import FileValidatorModal from './components/FileValidatorModal';
import SettingsModal from './components/SettingsModal';
import { mockJobs, mockHardwareOrders, hardwareInventory } from './mockData';
import ModuleSelector from './components/ModuleSelector';
import LandingPage from './components/LandingPage';
import StoreCatalog from './components/StoreCatalog';
import ShoppingCart from './components/ShoppingCart';

const initialSettings = {
  exchangeRate: 36.50,
  materials: [
    { id: 'lona', name: 'Lona', pricePerSqm: 10.0, pricingType: 'area', template: 'Escala 1:1 o 1:10, modo CMYK' },
    { id: 'vinil', name: 'Vinil Adhesivo', pricePerSqm: 15.0, pricingType: 'area', template: 'Escala 1:1, modo CMYK' },
    { id: 'microperforado', name: 'Microperforado', pricePerSqm: 18.0, pricingType: 'area', template: 'Escala 1:1, modo CMYK' },
    { id: 'dtf', name: 'DTF (59x30cm)', pricePerSqm: 20.0, pricingType: 'unit', template: 'Mesa de trabajo de 58cm de ancho, fondo transparente (PNG/PDF)' },
    { id: 'taza', name: 'Taza Blanca 11oz', pricePerSqm: 5.0, pricingType: 'unit', template: 'Mesa de trabajo de 20x9 cm (JPG/PDF)' },
    { id: 'tarjetas', name: 'Tarjetas (Millar)', pricePerSqm: 25.0, pricingType: 'pack', template: 'Formato 9x5 cm con 3mm de sangría por lado' }
  ]
};

function App() {
  const [jobs, setJobs] = useState(mockJobs);
  const [hardwareOrders, setHardwareOrders] = useState(mockHardwareOrders);
  const [showLanding, setShowLanding] = useState(true);
  const [activeModule, setActiveModule] = useState('print'); // 'print', 'hardware', or 'store'
  const [hasSelectedModule, setHasSelectedModule] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(window.innerWidth > 768);
  const [lastNotification, setLastNotification] = useState(null);
  const [jobToValidate, setJobToValidate] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [pricingSettings, setPricingSettings] = useState(initialSettings);

  // Store state
  const [storeSearchQuery, setStoreSearchQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);

  const handleAddToCart = (product, quantity = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item);
      }
      return [...prev, { ...product, quantity }];
    });
    notifyClient({ text: `🛒 Se ha añadido ${product.name} al carrito.`, type: 'info' });
  };

  const handleRemoveFromCart = (index) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const prevWidth = React.useRef(window.innerWidth);

  React.useEffect(() => {
    const handleResize = () => {
      const currentWidth = window.innerWidth;
      const wasDesktop = prevWidth.current > 768;
      const isDesktop = currentWidth > 768;

      // Only toggle chat state if we actually cross the breakpoint
      if (wasDesktop && !isDesktop) {
        setIsChatOpen(false);
      } else if (!wasDesktop && isDesktop) {
        setIsChatOpen(true);
      }

      prevWidth.current = currentWidth;
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const notifyClient = (notification) => {
    setLastNotification({ id: Date.now(), ...notification });
  };

  const handleNewJob = (newJob) => {
    if (activeModule === 'print') {
      setJobs(prev => [...prev, newJob]);
    } else {
      setHardwareOrders(prev => [...prev, newJob]);
    }
  };

  const handleJobMove = (jobId, newStatus) => {
    if (activeModule === 'print') {
      setJobs(prev => prev.map(job =>
        job.id === jobId ? { ...job, status: newStatus } : job
      ));
    } else {
      setHardwareOrders(prev => prev.map(order =>
        order.id === jobId ? { ...order, status: newStatus } : order
      ));
    }

    const statusNames = {
      'pending': 'Por Cotizar',
      'design': activeModule === 'print' ? 'En Diseño' : 'En Preparación',
      'printing': activeModule === 'print' ? 'En Impresión' : 'En Despacho',
      'done': activeModule === 'print' ? 'Listo / Acabados' : 'Entregado'
    };

    if (newStatus === 'done') {
      notifyClient({ text: `🎉 ¡ATENCIÓN: PEDIDO LISTO! 🎉\n\nTu pedido de ha pasado a la etapa de **Listo / Acabados** y está preparado para retiro.`, type: 'success' });
    } else {
      notifyClient({ text: `📢 *Actualización*: Tu pedido ha pasado a la etapa de **${statusNames[newStatus]}**.`, type: 'info' });
    }
  };

  const handleVerifyPayment = (jobId) => {
    if (activeModule === 'print') {
      setJobs(prev => prev.map(job =>
        job.id === jobId ? { ...job, paymentStatus: 'Pagado' } : job
      ));
    } else {
      setHardwareOrders(prev => prev.map(order =>
        order.id === jobId ? { ...order, paymentStatus: 'Pagado' } : order
      ));
    }
    notifyClient({ text: `✅ *Pago Verificado*: Hemos confirmado tu pago exitosamente. ¡Empezamos a procesar tu pedido!`, type: 'info' });
  };

  const handleValidateSuccess = () => {
    if (jobToValidate) {
      setJobs(prev => prev.map(job =>
        job.id === jobToValidate ? { ...job, fileStatus: 'Validado' } : job
      ));
      notifyClient({ text: `🔍 *Archivo Aprobado*: Nuestro sistema IA analizó tu diseño y la resolución es perfecta para imprimir. ✅`, type: 'info' });
    }
  };

  const handleUpdateJobFileStatus = (jobId, newStatus) => {
    setJobs(prev => prev.map(job =>
      job.id === jobId ? { ...job, fileStatus: newStatus } : job
    ));
  };

  const handleModuleSelect = (module) => {
    setActiveModule(module);
    setHasSelectedModule(true);
    // On desktop make sure chat is open by default when entering module
    if (window.innerWidth > 768) {
      setIsChatOpen(true);
    }
  };

  if (showLanding) {
    return <LandingPage onTryDemo={() => setShowLanding(false)} />;
  }

  if (!hasSelectedModule) {
    return <ModuleSelector onSelectModule={handleModuleSelect} />;
  }

  return (
    <div className="app-container">
      <header className="header">
        <div>
          <h1>
            {activeModule === 'print' ? 'Print Manager' :
              activeModule === 'hardware' ? 'Ferretería Manager' :
                'Mini Market'}
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            {activeModule === 'print' ? 'Control de Producción & IA' :
              activeModule === 'hardware' ? 'Control de Inventario & Órdenes' :
                'Catálogo Interactivo con IA'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button
            className="home-btn"
            onClick={() => setHasSelectedModule(false)}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', textDecoration: 'underline' }}
          >
            Volver al Inicio
          </button>
          <button
            className="new-job-btn"
            style={{ background: 'transparent', border: '1px solid var(--glass-border)' }}
            onClick={() => setShowSettings(true)}
          >
            ⚙️ Admin
          </button>
          <button className="new-job-btn">+ Nuevo Pedido</button>
        </div>
      </header>

      <main className="main-content">
        <div className="kanban-wrapper">
          {activeModule === 'store' ? (
            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
              <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
                <StoreCatalog
                  storeSearchQuery={storeSearchQuery}
                  onAddToCart={(p) => {
                    handleAddToCart(p, 1);
                    // Opcional: Mostrar carrito automáticamente al añadir
                    // setShowCart(true); 
                  }}
                />
              </div>

              {/* Floating button */}
              <button
                className="floating-cart-btn"
                onClick={() => setShowCart(!showCart)}
              >
                🛒
                {cart.length > 0 && (
                  <span className="cart-badge">
                    {cart.length}
                  </span>
                )}
              </button>

              {/* Cart Drawer */}
              {showCart && (
                <div className="cart-drawer-overlay">
                  <ShoppingCart
                    cart={cart}
                    onRemoveFromCart={handleRemoveFromCart}
                    onCheckout={() => {
                      notifyClient({ text: '🛒 Procediendo al pago...', type: 'info' });
                      setStoreSearchQuery('');
                      setShowCart(false);
                    }}
                  />
                </div>
              )}
            </div>
          ) : (
            <KanbanBoard
              jobs={activeModule === 'print' ? jobs : hardwareOrders}
              activeModule={activeModule}
              onJobMove={handleJobMove}
              onVerifyPayment={handleVerifyPayment}
              onValidateFile={(jobId) => setJobToValidate(jobId)}
            />
          )}
        </div>

        <div className={`chat-wrapper ${isChatOpen ? 'open' : 'closed'}`}>
          <div className="chat-mobile-header" onClick={() => setIsChatOpen(!isChatOpen)}>
            <span>💬 Chat & Asistente IA</span>
            <span>{isChatOpen ? '▼' : '▲'}</span>
          </div>
          <div className="chat-content-area">
            <ChatSimulator
              activeModule={activeModule}
              onJobCreated={handleNewJob}
              onUpdateJobDetails={(jobId, updates) => {
                if (activeModule === 'print') {
                  setJobs(prev => prev.map(job => job.id === jobId ? { ...job, ...updates } : job));
                } else if (activeModule === 'hardware') {
                  setHardwareOrders(prev => prev.map(order => order.id === jobId ? { ...order, ...updates } : order));
                }
              }}
              lastNotification={lastNotification}
              onUpdateJobFileStatus={handleUpdateJobFileStatus}
              pricingSettings={pricingSettings}
              hardwareInventory={hardwareInventory}
              onOrderGenerated={() => setIsChatOpen(false)}
              onBotSearch={(query) => setStoreSearchQuery(query)}
              onBotAddToCart={handleAddToCart}
              cart={cart}
              onClearCart={() => {
                setCart([]);
                setShowCart(false);
              }}
            />
          </div>
        </div>

        {/* Mobile floating button when closed */}
        {!isChatOpen && (
          <button
            className="mobile-chat-toggle"
            onClick={() => setIsChatOpen(true)}
          >
            💬 Asistente IA
          </button>
        )}
      </main>

      {jobToValidate && (
        <FileValidatorModal
          onClose={() => setJobToValidate(null)}
          onValidateSuccess={handleValidateSuccess}
        />
      )}

      {showSettings && (
        <SettingsModal
          initialSettings={pricingSettings}
          onClose={() => setShowSettings(false)}
          onSaveSettings={(newSettings) => setPricingSettings(newSettings)}
        />
      )}
    </div>
  );
}

export default App;
