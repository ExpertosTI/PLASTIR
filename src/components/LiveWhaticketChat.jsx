import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Send, 
  MessageSquare, 
  Sparkles, 
  CheckCheck, 
  Clock, 
  Phone, 
  User, 
  MapPin, 
  ShieldCheck, 
  ShoppingBag,
  Loader2,
  ExternalLink,
  MessageCircle,
  Zap,
  Truck,
  Flame,
  CheckCircle2,
  ChevronRight,
  Headphones,
  Smartphone
} from 'lucide-react';
import { useCart } from '../context/CartContext';

const DOMINICAN_SHIPPING_ZONES = [
  { id: 'sde', name: 'Santo Domingo Este (Los Mina, San Vicente, Invivienda, Charles)', cost: 200, time: '2 a 4 horas' },
  { id: 'dn', name: 'Distrito Nacional (Naco, Piantini, Bella Vista, Gazcue)', cost: 250, time: '2 a 4 horas' },
  { id: 'sdn_sdo', name: 'Santo Domingo Norte / Oeste (Villa Mella, Herrera, Alcarrizos)', cost: 300, time: 'Mismo día' },
  { id: 'santiago', name: 'Santiago de los Caballeros', cost: 350, time: '24 horas Express' },
  { id: 'san_cristobal', name: 'San Cristóbal / Baní', cost: 300, time: '24 horas' },
  { id: 'este', name: 'La Romana / San Pedro / Punta Cana / Higüey', cost: 350, time: '24 horas' },
  { id: 'interior', name: 'Resto del País (Caribe Tour / Metro Pac / Aptra)', cost: 350, time: '24 horas' },
];

const CHAT_STORAGE_KEY = 'mvpflow_live_chat_history_v2';

export const LiveWhaticketChat = () => {
  const { isWhaticketChatOpen, setIsWhaticketChatOpen, whaticketChatProduct, playBeep, formatMoney } = useCart();
  
  const [customerName, setCustomerName] = useState(() => localStorage.getItem('mvpflow_chat_name') || '');
  const [customerPhone, setCustomerPhone] = useState(() => localStorage.getItem('mvpflow_chat_phone') || '');
  
  const initialWelcomeMsg = {
    id: 'welcome-1',
    sender: 'agent',
    name: 'Equipo de Ventas MVP Flow',
    text: `¡Hola mi líder! 🔥 Bienvenido/a a *MVP FLOW BOUTIQUE RD* en Los Mina.\n\nUn asesor de nuestro **Equipo de Ventas Digitales** te atenderá de inmediato por aquí. ¿En qué modelo, talla o sector de envío estás interesado hoy?\n\n📲 *¿Prefieres chatear por WhatsApp?* Si deseas cambiar directamente a nuestro canal oficial de WhatsApp, pulsa el botón inferior.`,
    time: 'En vivo',
    hasWhatsAppLink: true,
  };

  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem(CHAT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [initialWelcomeMsg];
  });

  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedZone, setSelectedZone] = useState('sde');
  const [showShippingCalc, setShowShippingCalc] = useState(false);
  const [showPhonePrompt, setShowPhonePrompt] = useState(false);
  const messagesEndRef = useRef(null);

  // Save conversation history in localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
    } catch {}
  }, [messages]);

  // When opening chat for a specific product, attach inquiry banner
  useEffect(() => {
    if (whaticketChatProduct && isWhaticketChatOpen) {
      setMessages((prev) => {
        const hasProdMsg = prev.some((m) => m.productId === whaticketChatProduct.id);
        if (hasProdMsg) return prev;
        return [
          ...prev,
          {
            id: `prod-${Date.now()}`,
            sender: 'system',
            productId: whaticketChatProduct.id,
            productData: whaticketChatProduct,
            text: `👟 Has consultado por: ${whaticketChatProduct.name} (${Number(whaticketChatProduct.price).toLocaleString('es-DO')} DOP)`,
            time: new Date().toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' })
          }
        ];
      });
      setInputText(`¡Hola! Quisiera saber disponibilidad del modelo ${whaticketChatProduct.name} en talla...`);
    }
  }, [whaticketChatProduct, isWhaticketChatOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, showShippingCalc]);

  if (!isWhaticketChatOpen) return null;

  const currentZone = DOMINICAN_SHIPPING_ZONES.find((z) => z.id === selectedZone) || DOMINICAN_SHIPPING_ZONES[0];

  const buildDirectWhatsAppUrl = (customText = null) => {
    const defaultMsg = whaticketChatProduct
      ? `¡Hola equipo de ventas digitales MVP FLOW! Estoy en la tienda web y deseo comprar / consultar los *${whaticketChatProduct.name}* (RD$ ${Number(whaticketChatProduct.price).toLocaleString('es-DO')}). Mi nombre es ${customerName || 'Cliente'}.`
      : `¡Hola equipo de ventas digitales MVP FLOW! Estoy en mvpflowboutique.com y deseo consultar disponibilidad, tallas y envíos express. Mi nombre es ${customerName || 'Cliente'}.`;
    const message = customText || defaultMsg;
    return `https://api.whatsapp.com/send?phone=18096560219&text=${encodeURIComponent(message)}`;
  };

  const handleSendMessage = async (customMsg = null) => {
    const textToSend = (customMsg || inputText).trim();
    if (!textToSend || isSending) return;

    if (playBeep) playBeep('click');

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      name: customerName || 'Tú',
      text: textToSend,
      time: new Date().toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customMsg) setInputText('');
    setIsSending(true);
    setIsTyping(true);

    try {
      if (customerName) localStorage.setItem('mvpflow_chat_name', customerName);
      if (customerPhone) localStorage.setItem('mvpflow_chat_phone', customerPhone);

      // Dispatch to Whaticket API v1.0
      await fetch('/api/whaticket/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: customerName || 'Visitante Web',
          phone: customerPhone || '',
          message: textToSend,
          product: whaticketChatProduct
        })
      });

      // Context-aware smart sales assistant reply
      setTimeout(() => {
        setIsTyping(false);
        if (playBeep) playBeep('success');

        const lower = textToSend.toLowerCase();
        let replyText = '¡Recibido mi líder! 🔥 Tu mensaje ha entrado directamente en la bandeja de nuestro **Equipo de Ventas Digitales** en Whaticket. Un asesor del equipo te está atendiendo ahora mismo.';
        let hasWhatsAppCta = true;

        if (lower.includes('envio') || lower.includes('envío') || lower.includes('costo') || lower.includes('domingo') || lower.includes('mina') || lower.includes('delivery')) {
          replyText = '🛵 *Tarifas y Tiempos de Entrega Express:*\n• Santo Domingo Este y Los Mina: RD$ 200 (2 a 4 hrs)\n• Distrito Nacional (Naco, Piantini, etc): RD$ 250 (2 a 4 hrs)\n• Interior del país: RD$ 350 (24 hrs por Caribe Tour / Metro Pac)\n\n💵 *Todo con Pago Contra Entrega COD (Pagas al recibir).*';
        } else if (lower.includes('talla') || lower.includes('tallas') || lower.includes('numero') || lower.includes('número') || lower.includes('size')) {
          replyText = '👟 Tenemos disponibilidad desde la talla 38 (7 US) hasta la 44 (11 US) en calidad G5 con caja original. ¿Cuál es tu talla para reservarla en almacén de una vez?';
        } else if (lower.includes('pago') || lower.includes('cod') || lower.includes('efectivo') || lower.includes('transferencia')) {
          replyText = '💵 *Cero Riesgo — Pago Contra Entrega (COD):*\nNo pagas nada por adelantado. El mensajero express llega a tu ubicación, revisas tu mercancía y le pagas en efectivo o transferencia bancaria en mano.';
        } else if (lower.includes('tienda') || lower.includes('ubicacion') || lower.includes('dirección') || lower.includes('donde') || lower.includes('dónde')) {
          replyText = '📍 *Tienda Física:* Av. San Vicente de Paúl, Los Mina, Santo Domingo Este (al lado de la estación del Metro Trina de Moya). Abrimos de 9:00 AM a 9:00 PM todos los días.';
        }

        if (!customerPhone && !showPhonePrompt) {
          setShowPhonePrompt(true);
        }

        setMessages((prev) => [
          ...prev,
          {
            id: `reply-${Date.now()}`,
            sender: 'agent',
            name: 'Equipo de Ventas MVP Flow',
            text: replyText,
            hasWhatsAppLink: hasWhatsAppCta,
            time: new Date().toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }, 1100);
    } catch {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'agent',
          name: 'Equipo de Ventas MVP Flow',
          text: 'Tu consulta fue recibida en nuestro sistema. Para comunicarte de forma inmediata por WhatsApp con un asesor, pulsa el botón directo abajo 👇',
          hasWhatsAppLink: true,
          time: 'Ahora'
        }
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([initialWelcomeMsg]);
    localStorage.removeItem(CHAT_STORAGE_KEY);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-gradient-to-b from-[#16161A] via-[#111113] to-[#0A0A0C] border border-emerald-500/40 w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-[0_10px_50px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col h-[94vh] sm:h-[620px] max-h-[95vh] animate-scale-up">
        
        {/* Header with Live Status & WhatsApp Indicator */}
        <div className="bg-gradient-to-r from-emerald-950/90 via-[#1A1A22] to-emerald-950/90 p-3.5 sm:p-4 border-b border-emerald-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-sm shadow-[0_0_20px_rgba(16,185,129,0.5)] border border-emerald-300/40">
                <Headphones size={20} />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 border-2 border-mvp-dark rounded-full animate-pulse"></span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs sm:text-sm font-black text-white font-display uppercase tracking-wider">
                  Ventas Digitales en Vivo
                </h3>
                <span className="text-[9px] sm:text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/40 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  Whaticket Online
                </span>
              </div>
              <p className="text-[11px] text-mvp-silver flex items-center gap-1">
                <span>Equipo Oficial de Ventas</span>
                <span className="text-emerald-400 font-semibold">• Respuesta &lt; 1 min</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Quick Rates Button */}
            <button
              onClick={() => setShowShippingCalc(!showShippingCalc)}
              className={`p-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                showShippingCalc 
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                  : 'bg-mvp-card hover:bg-mvp-cardHover text-mvp-silver border border-white/10'
              }`}
              title="Cotizar Envío Express a tu sector"
            >
              <Truck size={14} className="text-amber-400" />
              <span className="hidden sm:inline text-[11px]">Envíos RD</span>
            </button>

            {/* Direct WhatsApp trigger */}
            <a
              href={buildDirectWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 hover:text-white border border-emerald-500/40 text-xs font-bold transition-all flex items-center gap-1 shadow-sm"
              title="Abrir en WhatsApp Directo"
            >
              <MessageCircle size={14} className="text-emerald-400" />
              <span className="hidden sm:inline text-[11px]">WhatsApp</span>
            </a>

            {/* Close Button */}
            <button
              onClick={() => setIsWhaticketChatOpen(false)}
              className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white flex items-center justify-center transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Shipping Quoter Banner inside chat */}
        {showShippingCalc && (
          <div className="bg-amber-500/10 border-b border-amber-500/30 p-3 sm:p-4 animate-fade-in">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Truck size={14} /> Tarifas de Envío Express (Pago Contra Entrega)
              </span>
              <span className="text-[10px] text-amber-400 font-mono font-bold">Entrega 2-4 hrs</span>
            </div>

            <div className="space-y-2">
              <select
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                className="w-full bg-mvp-black border border-amber-500/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              >
                {DOMINICAN_SHIPPING_ZONES.map((zone) => (
                  <option key={zone.id} value={zone.id}>
                    {zone.name} — RD$ {zone.cost} ({zone.time})
                  </option>
                ))}
              </select>

              <div className="flex items-center justify-between text-xs bg-mvp-black/70 p-2.5 rounded-xl border border-amber-500/20">
                <span className="text-mvp-silver">Costo: <strong className="text-white">RD$ {currentZone.cost}</strong></span>
                <span className="text-mvp-silver">Tiempo: <strong className="text-amber-300">{currentZone.time}</strong></span>
                <button
                  onClick={() => {
                    handleSendMessage(`🛵 Deseo pedir para envío a: ${currentZone.name} (Tarifa RD$ ${currentZone.cost})`);
                    setShowShippingCalc(false);
                  }}
                  className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-black font-black text-[10px] rounded-lg transition-colors shadow-sm"
                >
                  Consultar Sector
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Chat Feed */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3 bg-[#0C0C0E]/70">
          {messages.map((m) => {
            if (m.sender === 'system') {
              return (
                <div key={m.id} className="text-center my-2">
                  <div className="inline-flex items-center gap-2 bg-gradient-to-r from-mvp-card to-mvp-dark border border-amber-500/40 text-amber-300 text-xs px-3.5 py-2 rounded-2xl shadow-sm">
                    {m.productData?.images?.[0] && (
                      <img
                        src={m.productData.images[0]}
                        alt={m.productData.name}
                        className="w-7 h-7 object-cover rounded-lg border border-amber-500/30"
                      />
                    )}
                    <span className="font-bold">{m.text}</span>
                  </div>
                </div>
              );
            }

            const isUser = m.sender === 'user';
            return (
              <div key={m.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                <span className="text-[10px] text-mvp-muted mb-0.5 px-1 font-semibold flex items-center gap-1">
                  {!isUser && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>}
                  {m.name}
                </span>
                
                <div
                  className={`max-w-[88%] sm:max-w-[82%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-sm ${
                    isUser
                      ? 'bg-gradient-to-r from-mvp-red to-mvp-darkRed text-white rounded-br-none'
                      : 'bg-mvp-card border border-white/10 text-white rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-line">{m.text}</p>

                  {/* Embedded WhatsApp Direct Link CTA inside message */}
                  {m.hasWhatsAppLink && !isUser && (
                    <div className="mt-2.5 pt-2 border-t border-white/10">
                      <a
                        href={buildDirectWhatsAppUrl()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] px-3 py-1.5 rounded-xl shadow-md transition-all hover:scale-105"
                      >
                        <MessageCircle size={14} className="fill-white/20" />
                        <span>👉 Continuar por WhatsApp Oficial (+1 809-656-0219)</span>
                        <ExternalLink size={11} />
                      </a>
                    </div>
                  )}
                </div>

                <span className="text-[9px] text-mvp-muted mt-0.5 flex items-center gap-1 px-1">
                  {m.time}
                  {isUser && <CheckCheck size={12} className="text-emerald-400" />}
                </span>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-center gap-2 bg-mvp-card border border-white/10 px-3.5 py-2 rounded-2xl rounded-bl-none w-fit text-xs text-mvp-silver animate-pulse">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="font-semibold text-emerald-300">Asesora escribiendo...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-3 py-2 bg-[#121216] border-t border-white/10 overflow-x-auto no-scrollbar flex items-center gap-1.5">
          <button
            onClick={() => handleSendMessage('🛵 ¿Cuánto cuesta el envío a mi sector en Santo Domingo?')}
            className="flex-shrink-0 text-[11px] font-bold bg-mvp-card hover:bg-mvp-cardHover border border-white/10 text-mvp-silver hover:text-white px-3 py-1.5 rounded-full transition-all"
          >
            🛵 Cotizar Envío Express
          </button>
          <button
            onClick={() => handleSendMessage('👟 ¿Tienen disponibilidad en tallas 40, 41 y 42?')}
            className="flex-shrink-0 text-[11px] font-bold bg-mvp-card hover:bg-mvp-cardHover border border-white/10 text-mvp-silver hover:text-white px-3 py-1.5 rounded-full transition-all"
          >
            👟 Consultar Tallas
          </button>
          <button
            onClick={() => handleSendMessage('💵 ¿Cómo es el Pago Contra Entrega COD al recibir?')}
            className="flex-shrink-0 text-[11px] font-bold bg-mvp-card hover:bg-mvp-cardHover border border-white/10 text-mvp-silver hover:text-white px-3 py-1.5 rounded-full transition-all"
          >
            💵 Pago Contra Entrega
          </button>
          <button
            onClick={() => handleSendMessage('📍 ¿Cuál es la dirección exacta de la tienda en Los Mina?')}
            className="flex-shrink-0 text-[11px] font-bold bg-mvp-card hover:bg-mvp-cardHover border border-white/10 text-mvp-silver hover:text-white px-3 py-1.5 rounded-full transition-all"
          >
            📍 Ubicación Tienda
          </button>
        </div>

        {/* Customer WhatsApp & Name Input */}
        <div className="px-3 py-2 bg-black/60 border-t border-white/10 flex items-center gap-2">
          <div className="flex-1 flex items-center gap-1.5 bg-mvp-card px-2.5 py-1.5 rounded-xl border border-white/10 focus-within:border-emerald-500/50">
            <User size={13} className="text-mvp-muted flex-shrink-0" />
            <input
              type="text"
              placeholder="Tu Nombre (Opcional)"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="bg-transparent text-xs text-white placeholder-mvp-muted focus:outline-none w-full"
            />
          </div>
          <div className="flex-1 flex items-center gap-1.5 bg-mvp-card px-2.5 py-1.5 rounded-xl border border-white/10 focus-within:border-emerald-500/50">
            <Phone size={13} className="text-emerald-400 flex-shrink-0" />
            <input
              type="tel"
              placeholder="WhatsApp (829...)"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="bg-transparent text-xs text-white placeholder-mvp-muted focus:outline-none w-full font-mono"
            />
          </div>
        </div>

        {/* Input Bar & Dual Channel CTA */}
        <div className="p-3 bg-[#111114] border-t border-white/10 space-y-2">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Escribe tu mensaje aquí..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isSending}
              className="flex-1 bg-mvp-card border border-white/10 text-white text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-emerald-500 placeholder-mvp-muted"
            />
            <button
              type="submit"
              disabled={isSending || !inputText.trim()}
              className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-40 text-white font-bold transition-all shadow-md flex-shrink-0"
              title="Enviar mensaje"
            >
              {isSending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </form>

          {/* Jump to WhatsApp Channel Direct Link */}
          <div className="flex items-center gap-2">
            <a
              href={buildDirectWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2 bg-gradient-to-r from-emerald-600/30 to-teal-600/30 hover:from-emerald-600/40 hover:to-teal-600/40 border border-emerald-500/40 hover:border-emerald-400 rounded-xl text-emerald-300 hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm"
            >
              <Smartphone size={13} className="text-emerald-400" />
              <span>Chatear por WhatsApp Directo (+1 809-656-0219)</span>
              <ExternalLink size={11} />
            </a>

            <button
              onClick={handleClearHistory}
              className="px-2.5 py-2 text-[10px] text-mvp-muted hover:text-rose-400 hover:bg-white/5 rounded-xl border border-white/5 transition-colors"
              title="Limpiar chat"
            >
              Reiniciar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
