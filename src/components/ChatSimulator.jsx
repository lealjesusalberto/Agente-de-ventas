import React, { useState, useEffect, useRef } from 'react';
import './ChatSimulator.css';

const ChatSimulator = ({ activeModule, onJobCreated, onUpdateJobDetails, lastNotification, onUpdateJobFileStatus, pricingSettings, hardwareInventory, onOrderGenerated, onBotSearch, onBotAddToCart, cart, onClearCart }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  
  // States for the conversation FSM
  const [botState, setBotState] = useState('ASK_NAME');
  const [jobData, setJobData] = useState({ 
    clientName: '',
    description: '', 
    material: '', 
    measurements: '', 
    finishing: '',
    priceUsd: 0, 
    priceBs: 0,
    pricingType: 'area' 
  });
  const [latestJobId, setLatestJobId] = useState(null);
  const [pendingOrders, setPendingOrders] = useState([]);

  useEffect(() => {
    // Reset conversation when module changes
    let greeting = `¡Hola! Soy el asistente virtual de ${activeModule === 'print' ? 'Impresión' : activeModule === 'hardware' ? 'Ferretería' : 'la Tienda en Línea'}. `;
    if (activeModule === 'store') {
        greeting += '¿En qué te puedo ayudar hoy? Puedes preguntarme por herramientas, pinturas, o lo que busques.';
        setBotState('STORE_CHAT');
    } else {
        greeting += 'Para brindarte una mejor atención, ¿me podrías indicar tu nombre o el de tu empresa?';
        setBotState('ASK_NAME');
    }
    setMessages([{ id: Date.now(), text: greeting, sender: 'bot' }]);
    setJobData({
      clientName: '',
      description: '', 
      material: '', 
      measurements: '', 
      finishing: '',
      priceUsd: 0, 
      priceBs: 0,
      pricingType: 'area' 
    });
  }, [activeModule]);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (lastNotification) {
      setMessages(prev => [...prev, { id: lastNotification.id, text: lastNotification.text, sender: 'bot', type: lastNotification.type }]);
    }
  }, [lastNotification]);

  const addBotMessage = (text, delay = 600, options = null, image = null) => {
    setTimeout(() => {
      setMessages(prev => [...prev, { id: Date.now(), text, sender: 'bot', options, image }]);
    }, delay);
  };

  const calculatePrice = (measurementsStr, materialStr, pType) => {
    if (!pricingSettings) return { usd: 45, bs: 45 * 36.5 }; // Fallback

    let areaSqm = 0;
    let isMinimumApplied = false;

    if (pType === 'unit' || pType === 'pack') {
      const qtyMatch = measurementsStr.match(/(\d+)/);
      const qty = qtyMatch ? parseInt(qtyMatch[1], 10) : 1;
      areaSqm = qty; // Multiplier is just the quantity
    } else {
      // 'area' logic
      let widthCm = 100;
      let heightCm = 100;
      const regex = /(\d+)\s*(?:x|por|y|ancho|alto|-)\s*(\d+)?/i;
      const match = measurementsStr.match(regex);
      if (match) {
        widthCm = parseInt(match[1], 10);
        heightCm = match[2] ? parseInt(match[2], 10) : widthCm;
      }
      areaSqm = (widthCm / 100) * (heightCm / 100);

      if (areaSqm < 1.59) {
        areaSqm = 1.59;
        isMinimumApplied = true;
      }
    }

    // Find material price
    const matLower = materialStr.toLowerCase();
    let pricePerSqm = 15; // default fallback
    const foundMat = pricingSettings.materials.find(m => matLower.includes(m.name.toLowerCase()) || m.name.toLowerCase().includes(matLower));
    
    if (foundMat) {
      pricePerSqm = foundMat.pricePerSqm;
    }

    const totalUsd = areaSqm * pricePerSqm;
    const totalBs = totalUsd * pricingSettings.exchangeRate;

    return { usd: totalUsd.toFixed(2), bs: totalBs.toFixed(2), isMinimumApplied };
  };

  const handleQuoteStep = (measurementsStr, materialStr, pType, finishingStr) => {
    const prices = calculatePrice(measurementsStr, materialStr, pType);
    const finalData = { 
      ...jobData, 
      measurements: measurementsStr, 
      finishing: finishingStr,
      priceUsd: prices.usd, 
      priceBs: prices.bs 
    };
    setJobData(finalData);
    
    let minMsg = prices.isMinimumApplied ? '\n*(Nota: Se aplicó tarifa base de venta mínima de 1.59 m²)*' : '';
    
    // Buscar la guía de template del material
    let templateMsg = 'armado según las especificaciones';
    const matLower = materialStr.toLowerCase();
    const foundMat = pricingSettings?.materials.find(m => matLower.includes(m.name.toLowerCase()) || m.name.toLowerCase().includes(matLower));
    
    if (foundMat && foundMat.template) {
      templateMsg = `armado de la siguiente forma: **${foundMat.template}**`;
    }
    
    addBotMessage(`¡Excelente! Resumiendo:\n- Producto: ${finalData.description} (${finalData.material})\n- Tamaño/Cant: ${finalData.measurements}\n- Acabados: ${finalData.finishing}`);
    addBotMessage(`El precio total es de **$${prices.usd}** (Ref: **${prices.bs} Bs**).${minMsg}\n\n⚠️ *Antes de proceder al pago, por favor envía tu archivo original como Documento (📎) ${templateMsg}, para que nuestra IA verifique la calidad.*`, 1500);
    setBotState('WAITING_DOCUMENT');
  };

  const processInput = (text) => {
    const lowerText = text.toLowerCase();
    
    if (activeModule === 'store') {
      if (botState === 'STORE_CHAT') {
        if (lowerText.match(/comprar|pagar|listo|finalizar|checkout/)) {
          if (cart && cart.length > 0) {
            setBotState('STORE_ASK_NAME');
            addBotMessage("¡Excelente! Vamos a procesar tu compra. ¿A nombre de quién hacemos el pedido?");
          } else {
            addBotMessage("Tu carrito está vacío. 🛒 ¿Qué producto estás buscando?");
          }
        } else {
          let searchWord = lowerText
             .replace(/busco|quiero|tienen|necesito|precio|de|un|una|unos|unas|donde|hay/g, '')
             .trim();
          
          if (searchWord.length < 2) searchWord = text;
          if (onBotSearch) onBotSearch(searchWord);
          
          addBotMessage(`🔍 Claro, he buscado "${searchWord}" en nuestro catálogo. ¡Revisa los resultados a la izquierda!\n\nAñade lo que necesites al carrito, y cuando termines dime **"listo"** o **"pagar"** para procesar tu orden.`);
        }
        return;
      }
      
      if (botState === 'STORE_ASK_NAME') {
        setJobData(prev => ({ ...prev, clientName: text }));
        addBotMessage("¿Deseas retirar en tienda o prefieres envío a domicilio (delivery)?", 600, [
          { label: '🏪 Retiro en Tienda', value: 'retiro' },
          { label: '🚚 Delivery', value: 'delivery' }
        ]);
        setBotState('STORE_DELIVERY_TYPE');
        return;
      }

      if (botState === 'STORE_DELIVERY_TYPE') {
        if (lowerText.includes('delivery') || lowerText.includes('envío') || lowerText.includes('domicilio')) {
          setJobData(prev => ({ ...prev, deliveryType: 'delivery' }));
          addBotMessage('Por favor, indícame la dirección exacta para el envío.');
          setBotState('STORE_DELIVERY_ADDRESS');
        } else {
          setJobData(prev => ({ ...prev, deliveryType: 'store_pickup', deliveryAddress: '' }));
          const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
          const totalBs = (total * pricingSettings.exchangeRate).toFixed(2);
          
          const PaymentMsg = (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', lineHeight: '1.4' }}>
              <span>Perfecto. El total de tu orden es <strong>${total.toFixed(2)}</strong> (Bs. {totalBs}).</span>
              <span>Para procesar tu pedido, realiza un Pago Móvil a:</span>
              <div style={{ background: 'rgba(255,255,255,0.1)', padding: '10px', borderRadius: '8px', borderLeft: '3px solid var(--accent-violet)', fontFamily: 'monospace' }}>
                <div><strong>Banco:</strong> Banesco (0134)</div>
                <div><strong>CI/RIF:</strong> J-12345678-9</div>
                <div><strong>Tel:</strong> 0414-1234567</div>
              </div>
              <button 
                onClick={(e) => { 
                  navigator.clipboard.writeText("Banesco\nJ-123456789\n04141234567"); 
                  e.target.innerText = "✅ Copiado"; 
                  setTimeout(() => e.target.innerText = "📋 Copiar Datos", 2000); 
                }}
                style={{ alignSelf: 'flex-start', background: 'var(--accent-violet)', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', fontSize: '12px' }}
              >
                📋 Copiar Datos
              </button>
              <span style={{ fontSize: '13px', fontStyle: 'italic' }}>Una vez pagues, envíame el <strong>número de referencia</strong> por aquí.</span>
            </div>
          );
          
          addBotMessage(PaymentMsg);
          setBotState('STORE_CONFIRM_PAYMENT');
        }
        return;
      }

      if (botState === 'STORE_DELIVERY_ADDRESS') {
        setJobData(prev => ({ ...prev, deliveryAddress: text }));
        const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const totalBs = (total * pricingSettings.exchangeRate).toFixed(2);
        
        const PaymentMsg = (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', lineHeight: '1.4' }}>
            <span>¡Anotado! El total de tu orden es <strong>${total.toFixed(2)}</strong> (Bs. {totalBs}).</span>
            <span>Para procesar tu pedido, realiza un Pago Móvil a:</span>
            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '10px', borderRadius: '8px', borderLeft: '3px solid var(--accent-violet)', fontFamily: 'monospace' }}>
              <div><strong>Banco:</strong> Banesco (0134)</div>
              <div><strong>CI/RIF:</strong> J-12345678-9</div>
              <div><strong>Tel:</strong> 0414-1234567</div>
            </div>
            <button 
              onClick={(e) => { 
                navigator.clipboard.writeText("Banesco\nJ-123456789\n04141234567"); 
                e.target.innerText = "✅ Copiado"; 
                setTimeout(() => e.target.innerText = "📋 Copiar Datos", 2000); 
              }}
              style={{ alignSelf: 'flex-start', background: 'var(--accent-violet)', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', fontSize: '12px' }}
            >
              📋 Copiar Datos
            </button>
            <span style={{ fontSize: '13px', fontStyle: 'italic' }}>Una vez pagues, envíame el <strong>número de referencia</strong> por aquí.</span>
          </div>
        );
        
        addBotMessage(PaymentMsg);
        setBotState('STORE_CONFIRM_PAYMENT');
        return;
      }

      if (botState === 'STORE_CONFIRM_PAYMENT') {
        setJobData(prev => ({ ...prev, paymentRef: text }));
        finishStoreOrder(jobData.clientName, jobData.deliveryType, jobData.deliveryAddress, text);
        return;
      }
    }

    // Hardware Flow
    if (activeModule === 'hardware') {
      switch (botState) {
        case 'ASK_NAME':
          setJobData(prev => ({ ...prev, clientName: text }));
          let catOptions = [];
          if (hardwareInventory && hardwareInventory.length > 0) {
            catOptions = hardwareInventory.map(cat => ({ label: cat.category, value: cat.category }));
          }
          addBotMessage(`¡Mucho gusto ${text}! Nuestro inventario está dividido en las siguientes categorías:\n\nPor favor, selecciona o responde con el nombre de la categoría.`, 600, catOptions);
          setBotState('ASK_HW_CATEGORY');
          break;
        case 'ASK_HW_CATEGORY':
          let matchedCategory = null;
          let itemsList = [];
          if (hardwareInventory) {
            const foundCat = hardwareInventory.find(cat => lowerText.includes(cat.category.toLowerCase()) || text === cat.category);
            if (foundCat) {
              matchedCategory = foundCat.category;
              itemsList = foundCat.items;
            } else {
              const num = parseInt(text, 10);
              if (!isNaN(num) && num > 0 && num <= hardwareInventory.length) {
                const fCat = hardwareInventory[num - 1];
                matchedCategory = fCat.category;
                itemsList = fCat.items;
              }
            }
          }
          
          if (matchedCategory) {
            setJobData(prev => ({ ...prev, material: matchedCategory }));
            const itemOptions = itemsList.map(item => ({ label: item, value: item }));
            addBotMessage(`Excelente elección. En **${matchedCategory}** tenemos disponibles:\n\nSelecciona el producto exacto que deseas.`, 600, itemOptions);
            setBotState('ASK_HW_PRODUCT');
          } else {
            addBotMessage(`No pude encontrar esa categoría. Por favor escribe una de las opciones válidas.`);
          }
          break;
        case 'ASK_HW_PRODUCT':
          let selectedProduct = text;
          if (hardwareInventory) {
            const currentCat = hardwareInventory.find(cat => cat.category === jobData.material);
            if (currentCat) {
              const num = parseInt(text, 10);
              if (!isNaN(num) && num > 0 && num <= currentCat.items.length) {
                selectedProduct = currentCat.items[num - 1];
              }
            }
          }
          setJobData(prev => ({ ...prev, description: selectedProduct }));
          addBotMessage(`Perfecto. ¿Qué cantidad necesitas de ${selectedProduct}?`);
          setBotState('ASK_HW_QUANTITY');
          break;
        case 'ASK_HW_QUANTITY':
          let unitPrice = Math.random() * 50 + 10;
          const matchPrice = jobData.description.match(/\$(\d+(\.\d+)?)/);
          if (matchPrice) {
            unitPrice = parseFloat(matchPrice[1]);
          }
          let qty = parseInt(text, 10);
          if (isNaN(qty) || qty < 1) qty = 1;
          const price = (unitPrice * qty).toFixed(2);
          setJobData(prev => ({ ...prev, measurements: text, priceUsd: price }));
          
          const getProductImageUrl = (prod) => {
            const p = prod.toLowerCase();
            if (p.includes('pintura')) return 'https://images.unsplash.com/photo-1562184552-997c461abbe6?auto=format&fit=crop&w=400&q=80';
            if (p.includes('brocha')) return 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=400&q=80';
            if (p.includes('herramienta') || p.includes('martillo') || p.includes('taladro')) return 'https://images.unsplash.com/photo-1581166397057-235af2b3c6dd?auto=format&fit=crop&w=400&q=80';
            if (p.includes('tornillo') || p.includes('clavo')) return 'https://images.unsplash.com/photo-1588691516086-4447c2111d51?auto=format&fit=crop&w=400&q=80';
            return 'https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?auto=format&fit=crop&w=400&q=80';
          };
          
          addBotMessage(`¡Anotado! El pedido de ${jobData.description} (Cant: ${text}) tiene un costo estimado de $${price}.\n\n¿Deseas confirmar la orden de compra?`, 600, [
            { label: '✅ Sí, confirmar orden', value: 'si' },
            { label: '❌ No, cancelar', value: 'no' }
          ], getProductImageUrl(jobData.description));
          setBotState('CONFIRM_QUOTE');
          break;
        case 'CONFIRM_QUOTE':
          if (lowerText.includes('si') || lowerText.includes('sí') || lowerText.includes('ok') || lowerText.includes('claro')) {
            addBotMessage('¡Orden registrada con éxito! 🎉 ¿Deseas ordenar algo más?', 600, [
              { label: 'Sí, ordenar otro producto', value: 'si' },
              { label: 'No, finalizar orden', value: 'no' }
            ]);
            setBotState('ASK_ANOTHER');
            const newJobId = `order-${Date.now()}`;
            setLatestJobId(newJobId);
            setPendingOrders(prev => [...prev, {
              id: newJobId,
              clientName: jobData.clientName || 'Cliente Web',
              clientType: 'Nuevo',
              description: `${jobData.description} (Cant: ${jobData.measurements})`,
              material: jobData.material || 'Ferretería',
              status: 'pending',
              paymentStatus: 'Pendiente',
              fileStatus: 'N/A',
              date: new Date().toISOString()
            }]);
          } else {
            addBotMessage('No hay problema. Avisame si necesitas algo más.');
            setBotState('GREETING');
          }
          break;
        case 'ASK_ANOTHER':
          if (lowerText.includes('si') || lowerText.includes('sí') || lowerText.includes('ok')) {
             let catOptions2 = [];
             if (hardwareInventory && hardwareInventory.length > 0) {
               catOptions2 = hardwareInventory.map(cat => ({ label: cat.category, value: cat.category }));
             }
             addBotMessage(`¡Perfecto! Selecciona otra categoría:`, 600, catOptions2);
             setBotState('ASK_HW_CATEGORY');
          } else {
             addBotMessage('¡Excelente! Para finalizar, ¿deseas retirar tu pedido en la tienda o prefieres envío por Delivery?', 600, [
               { label: '🏪 Retiro en Tienda', value: 'tienda' },
               { label: '🛵 Envío Delivery', value: 'delivery' }
             ]);
             setBotState('ASK_DELIVERY_TYPE');
          }
          break;
        case 'ASK_DELIVERY_TYPE':
          if (lowerText.includes('tienda') || lowerText.includes('retiro')) {
             pendingOrders.forEach(order => {
               onJobCreated({ ...order, deliveryType: 'tienda' });
             });
             addBotMessage('¡Perfecto! Te esperamos en nuestra sucursal principal. ¡Gracias por tu compra!');
             setBotState('DONE');
             setTimeout(() => { if (onOrderGenerated) onOrderGenerated(); }, 3500);
          } else {
             addBotMessage('¡Entendido! Por favor, indica la dirección exacta para el envío por Delivery:');
             setBotState('ASK_DELIVERY_ADDRESS');
          }
          break;
        case 'ASK_DELIVERY_ADDRESS':
          pendingOrders.forEach(order => {
             onJobCreated({ ...order, deliveryType: 'delivery', deliveryAddress: text });
          });
          addBotMessage(`¡Anotado! Enviaremos tu pedido a: **${text}**. ¡Gracias por tu compra! Procederemos a despachar tu pedido pronto.`);
          setBotState('DONE');
          setTimeout(() => { if (onOrderGenerated) onOrderGenerated(); }, 3500);
          break;
        case 'DONE':
          addBotMessage('Tu orden ya está en proceso. Si necesitas otra cosa, dime.');
          setBotState('GREETING');
          break;
        default:
          break;
      }
      return;
    }

    // Print Flow
    switch (botState) {
      case 'ASK_NAME':
        setJobData(prev => ({ ...prev, clientName: text }));
        let matNamesList = '';
        if (pricingSettings && pricingSettings.materials) {
           matNamesList = pricingSettings.materials.map((m, i) => `\n${i + 1}. **${m.name}**`).join('');
        }
        addBotMessage(`¡Mucho gusto ${text}! Nuestro catálogo de productos incluye:${matNamesList}\n\nResponde con el número o nombre del material que deseas cotizar.`);
        setBotState('ASK_MATERIAL');
        break;

      case 'ASK_MATERIAL':
        // Determine pricing type based on input
        let identifiedType = 'area';
        let matchedName = text;
        if (pricingSettings && pricingSettings.materials) {
          const num = parseInt(text, 10);
          let foundMat = null;
          
          if (!isNaN(num) && num > 0 && num <= pricingSettings.materials.length) {
            foundMat = pricingSettings.materials[num - 1];
          } else {
            foundMat = pricingSettings.materials.find(m => lowerText.includes(m.name.toLowerCase()) || m.name.toLowerCase().includes(lowerText));
          }
          
          if (foundMat) {
            identifiedType = foundMat.pricingType;
            matchedName = foundMat.name;
          }
        }
        
        setJobData(prev => ({ ...prev, description: matchedName, material: matchedName, pricingType: identifiedType }));
        
        if (identifiedType === 'unit') {
          addBotMessage('Perfecto. Este producto se cobra por unidad. ¿Cuántas unidades necesitas?');
          setBotState('ASK_QUANTITY');
        } else if (identifiedType === 'pack') {
          addBotMessage('Perfecto. Este producto se cobra por paquetes (ej. millares). ¿Cuántos paquetes necesitas?');
          setBotState('ASK_QUANTITY');
        } else {
          addBotMessage('Perfecto. ¿Cuáles son las **medidas exactas en cm**? (Ej. 200x100)');
          setBotState('ASK_MEASUREMENTS');
        }
        break;

      case 'ASK_QUANTITY':
        const qty = parseInt(text, 10) || 1;
        const qtyStr = `${qty} unidades/paquetes`;
        setJobData(prev => ({ ...prev, measurements: qtyStr }));
        addBotMessage('¡Anotado! Por último, ¿necesitas algún **Acabado Adicional**? (Ej. Ojetes, Laminado brillante, Despunte, o escribe "Ninguno").');
        setBotState('ASK_FINISHING');
        break;

      case 'ASK_MEASUREMENTS':
        setJobData(prev => ({ ...prev, measurements: text }));
        addBotMessage('¡Anotado! Por último, ¿necesitas algún **Acabado Adicional** para esta impresión? (Ej. Ojetes, Bolsillos para tubos, Laminado, o escribe "Ninguno").');
        setBotState('ASK_FINISHING');
        break;

      case 'ASK_FINISHING':
        handleQuoteStep(jobData.measurements, jobData.material, jobData.pricingType, text);
        break;

      case 'CONFIRM_QUOTE':
        if (lowerText.includes('si') || lowerText.includes('sí') || lowerText.includes('ok') || lowerText.includes('claro')) {
          addBotMessage('¡Pedido registrado con éxito! 🎉 Por favor realiza tu pago (transferencia/depósito) y envía tu comprobante por aquí.\n\nNuestro equipo verificará el pago en breve para comenzar la producción.');
          setBotState('DONE');
          
          const newJobId = `job-${Date.now()}`;
          setTimeout(() => {
            onJobCreated({
              id: newJobId,
              clientName: jobData.clientName || 'Cliente Web',
              clientType: 'Nuevo',
              description: `${jobData.description} (${jobData.measurements}) [Acabados: ${jobData.finishing}]`,
              material: jobData.material,
              status: 'pending',
              paymentStatus: 'Pendiente',
              fileStatus: 'Validado',
              date: new Date().toISOString(),
              thumbnailUrl: jobData.thumbnailUrl
            });
            if (onOrderGenerated) onOrderGenerated();
          }, 1000);
          
        } else {
          addBotMessage('No hay problema. Avisame si necesitas algo más.');
          setBotState('GREETING');
        }
        break;

      case 'WAITING_DOCUMENT':
        addBotMessage('Aún estoy esperando tu archivo. Por favor usa el botón de clip (📎) para adjuntarlo como documento.');
        break;

      case 'DONE':
        addBotMessage('Tu pedido ya está en proceso. Si deseas otra cosa, dime.');
        setBotState('GREETING');
        break;
        
      default:
        break;
    }
  };

  const handleSend = (e, overrideText = null) => {
    if (e) e.preventDefault();
    const text = overrideText !== null ? overrideText : inputValue;
    if (!text.trim()) return;

    // Add user message
    const newMsg = { id: Date.now(), text, sender: 'user' };
    setMessages(prev => [...prev, newMsg]);
    
    if (overrideText === null) {
      setInputValue('');
    }
    
    // Process bot logic
    processInput(text);
  };

  const processAction = (action) => {
    // Si el usuario hace click en Checkout desde el Carrito UI, simular que escribió "pagar"
    if (action === 'pagar_carrito' && activeModule === 'store') {
      processInput('pagar');
      return;
    }

    if (action === 'si' || action === 'no' || action === 'retiro' || action === 'delivery') {
      processInput(action);
    } else {
      processInput(action);
    }
  };

  const finishStoreOrder = (clientName, dType, dAddress, paymentRef) => {
    const itemsDesc = cart.map(i => `${i.quantity}x ${i.name}`).join(', ');
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    
    const newJobId = `store-${Date.now()}`;
    const newOrder = {
      id: newJobId,
      clientName: clientName || 'Cliente Web',
      clientType: 'Nuevo',
      description: itemsDesc + `\nRef Pago: ${paymentRef}`,
      material: 'Tienda en Línea',
      status: 'pending',
      priceUsd: total.toFixed(2),
      priceBs: (total * pricingSettings.exchangeRate).toFixed(2),
      date: new Date().toISOString(),
      priority: 'normal',
      deliveryType: dType,
      deliveryAddress: dAddress,
      paymentStatus: 'Verificando'
    };

    if (onJobCreated) onJobCreated(newOrder);
    
    let endMsg = `¡Pago recibido y orden generada con éxito! 🎉 (Ref: ${paymentRef}). Hemos registrado tu compra por $${total.toFixed(2)}.\n\n`;
    if (dType === 'delivery') {
      endMsg += `Será enviada a: ${dAddress}. Te contactaremos pronto.`;
    } else {
      endMsg += `Te esperamos en la tienda para tu retiro.`;
    }
    
    addBotMessage(endMsg);
    setBotState('FINISHED');
    if (onClearCart) onClearCart();
    
    setTimeout(() => {
      if (onOrderGenerated) onOrderGenerated();
    }, 3500);
  };

  const handleFileAttach = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Show attachment as a user message
    setMessages(prev => [...prev, { id: Date.now(), text: `📄 [Documento] ${file.name}`, sender: 'user' }]);

    if (botState === 'WAITING_DOCUMENT') {
       addBotMessage('⏳ Recibí tu documento. Dejame verificar la resolución con nuestra IA...', 1000);
       
       // Calculate DPI internally
       const url = URL.createObjectURL(file);
       const img = new Image();
       img.onload = () => {
         let targetWidthCm = 200; // default assumption if parsing fails
         const match = jobData.measurements.match(/(\d+)/);
         if (match) {
           targetWidthCm = parseInt(match[1], 10);
         }
         
         const targetWidthInches = targetWidthCm / 2.54;
         const dpi = Math.round(img.width / targetWidthInches);
         
         setTimeout(() => {
           if (dpi < 70) {
             addBotMessage(`❌ **Peligro de Pixelado**. El archivo tiene ${dpi} DPI (se requieren mínimo 70 DPI para tu medida). Por favor envía un archivo de mayor calidad (📎).`);
             URL.revokeObjectURL(url);
           } else {
             addBotMessage(`✅ **¡Resolución Óptima!** Tu archivo tiene ${dpi} DPI y ha sido aprobado para producción.\n\n¿Deseas confirmar el pedido por $${jobData.priceUsd} y proceder al pago? (Sí/No)`);
             setJobData(prev => ({ ...prev, thumbnailUrl: url }));
             setBotState('CONFIRM_QUOTE');
           }
         }, 2500);
       };
       img.src = url;
    } else {
       addBotMessage('Veo que enviaste un archivo, pero aún no te lo he solicitado o ya procesamos tu pedido.');
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="chat-avatar">IA</div>
        <div className="chat-title">
          <h3>Agente de Ventas (IA)</h3>
          <span>En línea</span>
        </div>
      </div>
      
      <div className="chat-messages">
        {messages.map(msg => (
          <div key={msg.id} className={`message ${msg.sender} ${msg.type === 'success' ? 'success-msg' : ''}`}>
            {msg.text}
            {msg.image && (
              <img src={msg.image} alt="Producto" style={{ width: '100%', borderRadius: '8px', marginTop: '8px' }} />
            )}
            {msg.options && (
              <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {msg.options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(null, opt.value)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.9)',
                      border: '1px solid var(--primary-color)',
                      color: '#000',
                      padding: '8px 12px',
                      borderRadius: '16px',
                      fontSize: '0.85rem',
                      fontWeight: '500',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <form className="chat-input-area" onSubmit={handleSend}>
        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          accept="image/*"
          onChange={handleFileAttach}
        />
        {activeModule !== 'hardware' && (
          <button 
            type="button" 
            className="chat-attach-btn" 
            onClick={() => fileInputRef.current?.click()}
            title="Adjuntar documento"
          >
            📎
          </button>
        )}
        <input 
          type="text" 
          className="chat-input"
          placeholder="Escribe un mensaje..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <button type="submit" className="chat-send-btn" disabled={!inputValue.trim()}>
          ➤
        </button>
      </form>
    </div>
  );
};

export default ChatSimulator;
