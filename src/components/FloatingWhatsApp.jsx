import React, { useState, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const FloatingWhatsApp = () => {
  const { openLiveChat } = useCart();
  const [showTooltip, setShowTooltip] = useState(true);

  // Hide mini teaser badge after 12 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowTooltip(false), 12000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <aside aria-label="Soporte y Chat en Vivo" className="fixed bottom-16 sm:bottom-6 right-3 sm:right-5 z-40 flex flex-col items-end gap-2">
      {/* Floating Teaser Notification Bubble */}
      {showTooltip && (
        <div className="relative bg-white/95 border border-slate-200 text-slate-800 rounded-2xl p-2.5 sm:p-3 shadow-xl backdrop-blur-md max-w-[240px] animate-scale-up flex items-start gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse mt-1 flex-shrink-0"></div>
          <div className="flex-1 text-[11px] leading-tight">
            <p className="font-bold text-slate-900">¿Dudas con medidas o envíos?</p>
            <p className="text-slate-500 text-[10px] mt-0.5">Asesoras listas para ayudarte por WhatsApp</p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowTooltip(false);
            }}
            className="text-slate-400 hover:text-slate-700 -mr-1 -mt-1 p-1"
          >
            <X size={12} />
          </button>
        </div>
      )}

      {/* Main Live Chat Button */}
      <button
        onClick={() => {
          setShowTooltip(false);
          openLiveChat();
        }}
        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm py-2.5 sm:py-3 px-4 sm:px-5 rounded-full shadow-lg shadow-emerald-600/30 transition-all hover:scale-105 active:scale-95 group cursor-pointer"
        title="Abrir Chat con Asesoras"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
        </span>
        <MessageCircle size={18} className="text-white fill-white/20 group-hover:rotate-6 transition-transform" />
        <span className="uppercase tracking-wider text-xs">Asesoría en Vivo</span>
      </button>
    </aside>
  );
};

export default FloatingWhatsApp;
