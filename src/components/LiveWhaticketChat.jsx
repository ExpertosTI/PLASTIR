import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Send, 
  Sparkles, 
  CheckCheck, 
  Clock, 
  Phone, 
  User, 
  ShieldCheck, 
  ShoppingBag,
  Loader2,
  ExternalLink,
  MessageCircle,
  Truck,
  CheckCircle2,
  ChevronRight,
  Bot,
  RotateCcw,
  Package,
  Layers,
  HelpCircle,
  Zap,
  ArrowRight
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { generateSalesResponse } from '../utils/plastirSalesAI';

const DOMINICAN_SHIPPING_ZONES = [
  { id: 'dn', name: 'Distrito Nacional (Naco, Piantini, Bella Vista, Gazcue)', cost: 250, time: '2 a 4 horas' },
  { id: 'sde', name: 'Santo Domingo Este (Alma Rosa, San Vicente, Charles, Invivienda)', cost: 250, time: '2 a 4 horas' },
  { id: 'sdn_sdo', name: 'Santo Domingo Norte / Oeste (Herrera, Villa Mella, Alcarrizos)', cost: 300, time: 'Mismo día' },
  { id: 'santiago', name: 'Santiago de los Caballeros', cost: 350, time: '24 horas Express' },
  { id: 'san_cristobal', name: 'San Cristóbal / Baní', cost: 300, time: '24 horas' },
  { id: 'este', name: 'La Romana / San Pedro / Punta Cana / Higüey', cost: 350, time: '24 horas' },
  { id: 'interior', name: 'Resto del País (Caribe Tours / Metro Pac)', cost: 350, time: '24 a 48 horas' },
];

const CHAT_STORAGE_KEY = 'plastir_ai_sales_chat_v3';

export const LiveWhaticketChat = () => {
  const { 
    isWhaticketChatOpen, 
    setIsWhaticketChatOpen, 
    whaticketChatProduct, 
    addToCart,
    promptQuickOrder,
    setSelectedProduct,
    setIsQuickQuoterOpen,
    viewedProducts,
    cart,
    storePhone
  } = useCart();
  
  const [customerName, setCustomerName] = useState(() => localStorage.getItem('plastir_chat_name') || '');
  const [customerPhone, setCustomerPhone] = useState(() => localStorage.getItem('plastir_chat_phone') || '');
  
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem(CHAT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [];
  });

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedZone, setSelectedZone] = useState('dn');
  const [showShippingCalc, setShowShippingCalc] = useState(false);
  const [suggestedChips, setSuggestedChips] = useState([
    '🛵 ¿Cuánto tarda el envío en Santo Domingo?',
    '📐 ¿Cuáles son las medidas y capacidad?',
    '💵 ¿Cómo funciona el Pago Contra Entrega?',
    '🔥 ¿Cuáles son los productos más vendidos y combos?'
  ]);

  const messagesEndRef = useRef(null);

  // Initialize or update conversation with contextual greeting
  useEffect(() => {
    if (!isWhaticketChatOpen) return;

    if (messages.length === 0) {
      const initial = generateSalesResponse({
        userMessage: 'hola',
        currentProduct: whaticketChatProduct,
        viewedProducts,
        cart,
        customerName
      });

      const welcomeMsg = {
        id: 'welcome-1',
        sender: 'ai',
        name: 'Plastir AI Asistente',
        text: initial.reply,
        product: initial.product,
        quickActions: initial.quickActions,
        time: new Date().toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' })
      };

      setMessages([welcomeMsg]);
      if (initial.suggestedQuestions) setSuggestedChips(initial.suggestedQuestions);
    }
  }, [isWhaticketChatOpen, whaticketChatProduct]);

  // Save history
  useEffect(() => {
    try {
      if (messages.length > 0) {
        localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
      }
    } catch {}
  }, [messages]);

  // When opening chat for a specific product, insert contextual inquiry notice
  useEffect(() => {
    if (whaticketChatProduct && isWhaticketChatOpen) {
      setMessages((prev) => {
        const hasProdNotice = prev.some((m) => m.productId === whaticketChatProduct.id);
        if (hasProdNotice) return prev;
        return [
          ...prev,
          {
            id: `prod-${Date.now()}`,
            sender: 'system',
            productId: whaticketChatProduct.id,
            productData: whaticketChatProduct,
            text: `Artículo en consulta: ${whaticketChatProduct.name} (RD$ ${Number(whaticketChatProduct.price).toLocaleString('es-DO')})`,
            time: new Date().toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' })
          }
        ];
      });
    }
  }, [whaticketChatProduct, isWhaticketChatOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, showShippingCalc]);

  if (!isWhaticketChatOpen) return null;

  const currentZone = DOMINICAN_SHIPPING_ZONES.find((z) => z.id === selectedZone) || DOMINICAN_SHIPPING_ZONES[0];

  const handleSendMessage = (customMsg = null) => {
    const textToSend = (customMsg || inputText).trim();
    if (!textToSend || isTyping) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      name: customerName || 'Tú',
      text: textToSend,
      time: new Date().toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customMsg) setInputText('');
    setIsTyping(true);

    if (customerName) localStorage.setItem('plastir_chat_name', customerName);
    if (customerPhone) localStorage.setItem('plastir_chat_phone', customerPhone);

    // AI Natural Language Reasoning Engine (In-Page, Instant)
    setTimeout(() => {
      const response = generateSalesResponse({
        userMessage: textToSend,
        currentProduct: whaticketChatProduct,
        viewedProducts,
        cart,
        customerName
      });

      const aiMsg = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        name: 'Plastir AI Asistente',
        text: response.reply,
        product: response.product,
        quickActions: response.quickActions,
        time: new Date().toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' })
      };

      setIsTyping(false);
      setMessages((prev) => [...prev, aiMsg]);
      if (response.suggestedQuestions) {
        setSuggestedChips(response.suggestedQuestions);
      }
    }, 600);
  };

  const handleActionClick = (action) => {
    if (!action) return;
    if (action.type === 'add_to_cart' && action.product) {
      addToCart(action.product, action.product.sizes?.[0] || 'Estándar', action.product.colors?.[0] || 'Original');
      handleSendMessage(`He añadido ${action.product.name} al carrito. ¿Cómo coordinamos el envío?`);
    } else if (action.type === 'quick_checkout' && action.product) {
      promptQuickOrder(action.product);
    } else if (action.type === 'open_quoter') {
      setIsQuickQuoterOpen(true);
    }
  };

  const handleClearHistory = () => {
    localStorage.removeItem(CHAT_STORAGE_KEY);
    setMessages([]);
    setTimeout(() => {
      const initial = generateSalesResponse({
        userMessage: 'hola',
        currentProduct: whaticketChatProduct,
        viewedProducts,
        cart,
        customerName
      });
      setMessages([{
        id: 'welcome-fresh',
        sender: 'ai',
        name: 'Plastir AI Asistente',
        text: initial.reply,
        product: initial.product,
        quickActions: initial.quickActions,
        time: new Date().toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 100);
  };

  const buildWhatsAppFallbackUrl = () => {
    const cleanPhone = (storePhone || '18096560219').replace(/\D/g, '');
    const activeProdName = whaticketChatProduct ? whaticketChatProduct.name : (viewedProducts[0]?.name || 'artículos para el hogar');
    const msg = `¡Hola Plastir RD! Estaba conversando con el Asistente AI en plastirrd.com sobre ${activeProdName}. Mi nombre es ${customerName || 'Cliente'}. Deseo consultar con un asesor humano.`;
    return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-xl h-[92vh] max-h-[740px] bg-white border border-slate-200/90 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Elegante & Corporativo */}
        <div className="p-3.5 sm:p-4 border-b border-slate-200 bg-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center text-[#C2410C] shadow-sm">
                <Bot size={22} className="animate-pulse" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                  Plastir AI <span className="text-xs font-normal text-slate-500">• Asistente de Ventas</span>
                </h3>
                <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                  En Vivo
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Contexto activo: {viewedProducts.length} producto(s) explorados en tu sesión
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Botón Tarifas Envíos RD */}
            <button
              onClick={() => setShowShippingCalc(!showShippingCalc)}
              className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold transition-all flex items-center gap-1 shadow-sm"
              title="Calcular Envíos en República Dominicana"
            >
              <Truck size={14} className="text-[#C2410C]" />
              <span className="hidden sm:inline text-[11px]">Envíos RD</span>
            </button>

            {/* Cerrar modal (sin redirigir) */}
            <button
              onClick={() => setIsWhaticketChatOpen(false)}
              className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
              title="Cerrar chat"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Panel Desplegable de Envíos Express RD */}
        {showShippingCalc && (
          <div className="bg-orange-50/70 border-b border-orange-200/80 p-3 sm:p-4 animate-fade-in">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Truck size={14} className="text-[#C2410C]" /> Tarifas Oficiales de Envío Express (Pago al Recibir)
              </span>
              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">Mismo Día</span>
            </div>

            <div className="space-y-2">
              <select
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#C2410C]"
              >
                {DOMINICAN_SHIPPING_ZONES.map((zone) => (
                  <option key={zone.id} value={zone.id}>
                    {zone.name} — RD$ {zone.cost} ({zone.time})
                  </option>
                ))}
              </select>

              <div className="flex items-center justify-between text-xs bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-slate-600">Tarifa: <strong className="text-slate-900">RD$ {currentZone.cost}</strong></span>
                <span className="text-slate-600">Tiempo: <strong className="text-[#C2410C]">{currentZone.time}</strong></span>
                <button
                  onClick={() => {
                    handleSendMessage(`🛵 Deseo coordinar entrega para: ${currentZone.name} (Tarifa RD$ ${currentZone.cost})`);
                    setShowShippingCalc(false);
                  }}
                  className="px-3 py-1 bg-[#C2410C] hover:bg-[#9A3412] text-white font-bold text-[10px] rounded-lg transition-colors shadow-sm"
                >
                  Consultar Entrega
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Feed de Conversación en Tiempo Real */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3.5 bg-[#FAF9F6]">
          {messages.map((m) => {
            if (m.sender === 'system') {
              return (
                <div key={m.id} className="text-center my-2">
                  <div className="inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-800 text-xs px-3.5 py-1.5 rounded-2xl shadow-sm">
                    {m.productData?.images?.[0] && (
                      <img
                        src={m.productData.images[0]}
                        alt={m.productData.name}
                        className="w-6 h-6 object-cover rounded-md border border-slate-200"
                      />
                    )}
                    <span className="font-semibold">{m.text}</span>
                  </div>
                </div>
              );
            }

            const isUser = m.sender === 'user';
            return (
              <div key={m.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                <span className="text-[10px] text-slate-400 mb-0.5 px-1 font-semibold flex items-center gap-1">
                  {!isUser && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>}
                  {m.name}
                </span>
                
                <div
                  className={`max-w-[88%] sm:max-w-[82%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed shadow-sm transition-all ${
                    isUser
                      ? 'bg-[#C2410C] text-white rounded-br-none'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-line">{m.text}</p>

                  {/* Ficha interactiva de producto incrustada si la IA lo sugiere */}
                  {m.product && !isUser && (
                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2.5 bg-slate-50/80 p-2 rounded-xl border border-slate-200/80">
                      {m.product.images?.[0] && (
                        <img
                          src={m.product.images[0]}
                          alt={m.product.name}
                          className="w-12 h-12 object-cover rounded-lg border border-slate-200 flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 truncate">{m.product.name}</h4>
                        <div className="text-[11px] text-slate-500">
                          RD$ {Number(m.product.price).toLocaleString('es-DO')} • {m.product.capacity || 'Alta Capacidad'}
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedProduct(m.product)}
                        className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-bold rounded-lg transition-colors flex-shrink-0"
                      >
                        Ver Ficha
                      </button>
                    </div>
                  )}

                  {/* Botones de Acción Comercial Instantánea (Incidencia en la Venta) */}
                  {m.quickActions && m.quickActions.length > 0 && !isUser && (
                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
                      {m.quickActions.map((act, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleActionClick(act)}
                          className="inline-flex items-center gap-1 bg-gradient-to-r from-orange-500 to-[#C2410C] hover:from-orange-600 hover:to-[#9A3412] text-white font-bold text-[11px] px-3 py-1.5 rounded-xl shadow-sm transition-all hover:scale-102 active:scale-98"
                        >
                          <span>{act.label}</span>
                          <ArrowRight size={11} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <span className="text-[9px] text-slate-400 mt-0.5 flex items-center gap-1 px-1">
                  {m.time}
                  {isUser && <CheckCheck size={12} className="text-[#C2410C]" />}
                </span>
              </div>
            );
          })}

          {/* Indicador de escritura AI */}
          {isTyping && (
            <div className="flex items-center gap-2 bg-white border border-slate-200 px-3.5 py-2.5 rounded-2xl rounded-bl-none w-fit text-xs text-slate-600 shadow-sm animate-pulse">
              <Bot size={14} className="text-[#C2410C]" />
              <span className="font-semibold text-slate-700">Plastir AI analizando especificaciones...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Chips de Preguntas Frecuentes Dinámicas */}
        <div className="px-3 py-2 bg-white border-t border-slate-200 overflow-x-auto no-scrollbar flex items-center gap-1.5">
          {suggestedChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(chip)}
              className="flex-shrink-0 text-[11px] font-semibold bg-slate-50 hover:bg-orange-50/70 border border-slate-200 text-slate-700 hover:text-[#C2410C] hover:border-orange-200 px-3 py-1.5 rounded-full transition-all"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Datos Opcionales del Cliente para Personalización */}
        <div className="px-3 py-1.5 bg-slate-50/80 border-t border-slate-200 flex items-center gap-2">
          <div className="flex-1 flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-xl border border-slate-200 focus-within:border-[#C2410C]">
            <User size={13} className="text-slate-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Tu Nombre (Opcional)"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="bg-transparent text-xs text-slate-900 placeholder-slate-400 focus:outline-none w-full"
            />
          </div>
          <div className="flex-1 flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-xl border border-slate-200 focus-within:border-[#C2410C]">
            <Phone size={13} className="text-emerald-600 flex-shrink-0" />
            <input
              type="tel"
              placeholder="Teléfono / WhatsApp (Opcional)"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="bg-transparent text-xs text-slate-900 placeholder-slate-400 focus:outline-none w-full font-mono"
            />
          </div>
        </div>

        {/* Barra de Entrada de Mensaje */}
        <div className="p-3 bg-white border-t border-slate-200 space-y-2">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Pregunta sobre medidas, material, envíos o haz tu pedido..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isTyping}
              className="flex-1 bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#C2410C] placeholder-slate-400"
            />
            <button
              type="submit"
              disabled={isTyping || !inputText.trim()}
              className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-r from-orange-500 to-[#C2410C] hover:from-orange-600 hover:to-[#9A3412] disabled:opacity-40 text-white font-bold transition-all shadow-sm flex-shrink-0"
              title="Enviar consulta a Plastir AI"
            >
              {isTyping ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </form>

          {/* Barra inferior: Reseteo y Enlace Secundario Humano */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 pt-1">
            <a
              href={buildWhatsAppFallbackUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-700 hover:underline flex items-center gap-1 font-semibold"
            >
              <MessageCircle size={12} />
              <span>¿Prefieres hablar con un asesor humano por WhatsApp?</span>
            </a>

            <button
              onClick={handleClearHistory}
              className="text-slate-400 hover:text-slate-700 flex items-center gap-1"
              title="Reiniciar chat"
            >
              <RotateCcw size={11} />
              <span>Reiniciar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveWhaticketChat;
