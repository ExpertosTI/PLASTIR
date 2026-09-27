import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, ShieldCheck, CheckCheck, Sparkles, Phone, ExternalLink } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const WhaticketChatModal = () => {
  const { isWhaticketChatOpen, setIsWhaticketChatOpen, whaticketChatProduct, playBeep } = useCart();
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'agent',
      name: 'Equipo de Ventas Plastir RD',
      text: '¡Hola! 🏡 Bienvenido a Plastir RD, tu tienda de artículos plásticos y organización para el hogar. ¿En qué artículo, medidas o combo de cocina te colaboramos hoy?',
      time: 'Ahora'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const QUICK_PROMPTS = [
    '¿Tienen disponibilidad para entrega hoy?',
    'Quiero pedir con Pago Contra Entrega (COD) en efectivo.',
    '¿Cuáles son las medidas y capacidad en litros?',
    '¿Tienen combos con descuento para cocina o clóset?'
  ];

  useEffect(() => {
    if (whaticketChatProduct && isWhaticketChatOpen) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          sender: 'system',
          text: `📦 Has consultado por: ${whaticketChatProduct.name} (RD$ ${Number(whaticketChatProduct.price).toLocaleString('es-DO')})`,
          time: 'Ahora'
        }
      ]);
      setInputText(`¡Hola! Quisiera confirmar disponibilidad y entrega de: ${whaticketChatProduct.name}...`);
    }
  }, [whaticketChatProduct, isWhaticketChatOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = (textToSend = null) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    if (playBeep) playBeep('click');

    const newMsg = {
      id: Date.now(),
      sender: 'user',
      name: 'Tú',
      text: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText('');
    setIsTyping(true);

    // Simulated responsive agent reply + WhatsApp deep link
    setTimeout(() => {
      setIsTyping(false);
      if (playBeep) playBeep('success');
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'agent',
          name: 'Nicole (Ventas Express)',
          text: '¡Excelente elección! Tenemos stock disponible para despacho inmediato con mensajero COD en todo Santo Domingo y el país. Pulsa abajo para coordinar la entrega a tu ubicación exacta 👇',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 1200);
  };

  const handleOpenWhatsAppDirect = () => {
    const lastUserMsg = [...messages].reverse().find((m) => m.sender === 'user')?.text;
    const baseMsg = lastUserMsg 
      ? `¡Hola MVP FLOW RD! Vengo desde el chat de la web: "${lastUserMsg}"`
      : '¡Hola MVP FLOW RD! Quiero información de los tenis y combos disponibles para entrega express hoy.';
    
    window.open(`https://api.whatsapp.com/send?phone=18096560219&text=${encodeURIComponent(baseMsg)}`, '_blank');
  };

  if (!isWhaticketChatOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-mvp-dark border border-emerald-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[560px] max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-emerald-950 via-mvp-card to-teal-950 border-b border-emerald-500/30">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-400">
                <MessageSquare size={20} />
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-mvp-dark animate-pulse"></span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5 font-display tracking-wider">
                CHAT EN VIVO CON ASESORA
              </h3>
              <p className="text-[11px] text-emerald-300 font-medium">Asesoras en línea: Ashley & Nicole (Respuesta &lt; 1 min)</p>
            </div>
          </div>

          <button
            onClick={() => setIsWhaticketChatOpen(false)}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Messages Feed */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-mvp-black/40">
          {messages.map((m) => {
            if (m.sender === 'system') {
              return (
                <div key={m.id} className="text-center my-2">
                  <span className="inline-block bg-white/5 border border-white/10 text-amber-300 text-[11px] font-bold px-3 py-1 rounded-full">
                    {m.text}
                  </span>
                </div>
              );
            }

            const isUser = m.sender === 'user';
            return (
              <div key={m.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                {!isUser && (
                  <span className="text-[10px] text-emerald-400 font-bold mb-0.5 ml-1">{m.name}</span>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                    isUser
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-br-none shadow-md'
                      : 'bg-mvp-card border border-white/10 text-mvp-silver rounded-bl-none shadow-sm'
                  }`}
                >
                  <p className="whitespace-pre-line">{m.text}</p>
                  <span className={`block text-[9px] mt-1 text-right ${isUser ? 'text-emerald-200' : 'text-mvp-muted'}`}>
                    {m.time}
                  </span>
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 px-3 py-1.5 rounded-full w-fit animate-pulse border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.4s]"></span>
              <span className="ml-1">Asesora escribiendo...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts */}
        <div className="px-3 py-2 bg-mvp-black/70 border-t border-white/5 flex gap-1.5 overflow-x-auto no-scrollbar">
          {QUICK_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              className="text-[11px] font-semibold text-emerald-300 hover:text-white bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-full px-3 py-1 whitespace-nowrap transition-all flex-shrink-0"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input & Direct WhatsApp Button */}
        <div className="p-3 bg-mvp-card border-t border-white/10 space-y-2">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Escribe tu consulta o talla..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-mvp-black border border-white/10 rounded-2xl px-3.5 py-2.5 text-xs text-white placeholder-mvp-muted focus:outline-none focus:border-emerald-400 transition-colors"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="w-10 h-10 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black flex items-center justify-center transition-all disabled:opacity-40 disabled:hover:bg-emerald-500 flex-shrink-0"
            >
              <Send size={16} />
            </button>
          </form>

          <button
            onClick={handleOpenWhatsAppDirect}
            className="w-full py-2 bg-gradient-to-r from-emerald-600/30 to-teal-600/30 hover:bg-emerald-600/40 border border-emerald-500/40 rounded-xl text-emerald-300 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5"
          >
            <Phone size={13} />
            <span>Continuar por WhatsApp Directo (+1 809-656-0219)</span>
            <ExternalLink size={12} />
          </button>
        </div>

      </div>
    </div>
  );
};
