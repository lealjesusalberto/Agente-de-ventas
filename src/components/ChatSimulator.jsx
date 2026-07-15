import React, { useState, useEffect, useRef } from 'react';
import './ChatSimulator.css';

const ChatSimulator = ({ activeModule, onJobCreated, lastNotification, onUpdateJobFileStatus, pricingSettings, hardwareInventory, onOrderGenerated }) => {
  const [messages, setMessages] = useState([
    { id: 1, text: '¡Hola! Soy el asistente virtual. Para brindarte una mejor atención, ¿me podrías indicar tu nombre o el de tu empresa?', sender: 'bot' }
  ]);
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

  useEffect(() => {
    // Reset conversation when module changes
    setMessages([{ id: Date.now(), text: `¡Hola! Soy el asistente virtual de ${activeModule === 'print' ? 'Impresión' : 'Ferretería'}. Para brindarte una mejor atención, ¿me podrías indicar tu nombre o el de tu empresa?`, sender: 'bot' }]);
    setBotState('ASK_NAME');
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

  const addBotMessage = (text, delay = 600) => {
    setTimeout(() => {
      setMessages(prev => [...prev, { id: Date.now(), text, sender: 'bot' }]);
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
    
    // Ferreteria Flow
    if (activeModule === 'hardware') {
      switch (botState) {
        case 'ASK_NAME':
          setJobData(prev => ({ ...prev, clientName: text }));
          let catText = '';
          if (hardwareInventory && hardwareInventory.length > 0) {
            catText = hardwareInventory.map(cat => `\n- **${cat.category}**`).join('');
          }
          addBotMessage(`¡Mucho gusto ${text}! Nuestro inventario está dividido en las siguientes categorías:${catText}\n\n¿De qué categoría te gustaría ver los productos?`);
          setBotState('ASK_HW_CATEGORY');
          break;
        case 'ASK_HW_CATEGORY':
          let matchedCategory = null;
          let itemsList = [];
          if (hardwareInventory) {
            const foundCat = hardwareInventory.find(cat => lowerText.includes(cat.category.toLowerCase()));
            if (foundCat) {
              matchedCategory = foundCat.category;
              itemsList = foundCat.items;
            }
          }
          
          if (matchedCategory) {
            setJobData(prev => ({ ...prev, material: matchedCategory }));
            const itemsStr = itemsList.map(item => `\n- ${item}`).join('');
            addBotMessage(`Excelente elección. En **${matchedCategory}** tenemos disponibles:${itemsStr}\n\n¿Qué producto exacto deseas ordenar?`);
            setBotState('ASK_HW_PRODUCT');
          } else {
            const catNames = hardwareInventory?.map(c => c.category).join(', ') || 'Herramientas, Pintura...';
            addBotMessage(`No pude encontrar esa categoría. Por favor elige una de las siguientes: **${catNames}**.`);
          }
          break;
        case 'ASK_HW_PRODUCT':
          setJobData(prev => ({ ...prev, description: text }));
          addBotMessage(`Perfecto. ¿Qué cantidad necesitas de ${text}?`);
          setBotState('ASK_HW_QUANTITY');
          break;
        case 'ASK_HW_QUANTITY':
          setJobData(prev => ({ ...prev, measurements: text, priceUsd: (Math.random() * 50 + 10).toFixed(2) }));
          addBotMessage(`¡Anotado! El pedido de ${jobData.description} (Cant: ${text}) tiene un costo estimado de $${(Math.random() * 50 + 10).toFixed(2)}.\n\n¿Deseas confirmar la orden de compra? (Sí/No)`);
          setBotState('CONFIRM_QUOTE');
          break;
        case 'CONFIRM_QUOTE':
          if (lowerText.includes('si') || lowerText.includes('sí') || lowerText.includes('ok') || lowerText.includes('claro')) {
            addBotMessage('¡Orden registrada con éxito! 🎉 Por favor realiza tu pago para proceder al despacho.');
            setBotState('DONE');
            const newJobId = `order-${Date.now()}`;
            setTimeout(() => {
              onJobCreated({
                id: newJobId,
                clientName: jobData.clientName || 'Cliente Web',
                clientType: 'Nuevo',
                description: `${jobData.description} (Cant: ${jobData.measurements})`,
                material: jobData.material || 'Ferretería',
                status: 'pending',
                paymentStatus: 'Pendiente',
                fileStatus: 'N/A',
                date: new Date().toISOString(),
              });
              if (onOrderGenerated) onOrderGenerated();
            }, 1000);
          } else {
            addBotMessage('No hay problema. Avisame si necesitas algo más.');
            setBotState('GREETING');
          }
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
        const matNames = pricingSettings?.materials.map(m => m.name).join(', ') || 'Lona, Vinil, DTF...';
        addBotMessage(`¡Mucho gusto ${text}! Nuestro catálogo de productos incluye: **${matNames}**.\n\n¿Cuál de estos deseas cotizar hoy?`);
        setBotState('ASK_MATERIAL');
        break;

      case 'ASK_MATERIAL':
        // Determine pricing type based on input
        let identifiedType = 'area';
        let matchedName = text;
        if (pricingSettings) {
          const foundMat = pricingSettings.materials.find(m => lowerText.includes(m.name.toLowerCase()) || m.name.toLowerCase().includes(lowerText));
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

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Add user message
    const newMsg = { id: Date.now(), text: inputValue, sender: 'user' };
    setMessages(prev => [...prev, newMsg]);
    
    const text = inputValue;
    setInputValue('');
    
    // Process bot logic
    processInput(text);
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
