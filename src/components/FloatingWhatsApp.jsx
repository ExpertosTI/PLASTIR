import React, { useState, useEffect } from 'react';
import { MessageSquare, MessageCircle, X } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const FloatingWhatsApp = () => {
  const { openLiveChat } = useCart();
  const [showTooltip, setShowTooltip] = useState(true);

  // Hide mini teaser badge after 12 seconds or on interaction
  useEffect(() => {
    const timer = setTimeout(() => setShowTooltip(false), 14000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <aside aria-label="Soporte y Chat en Vivo" className="fixed bottom-16 sm:bottom-6 right-3 sm:right-5 z-40 flex flex-col items-end gap-2">
      {/* Floating Teaser Notification Bubble */}
      {showTooltip && (
        <div className="relative bg-mvp-card/95 border border-emerald-500/50 text-white rounded-2xl p-2.5 sm:p-3 shadow-[0_10px_30px_rgba(0,0,0,0.8)] backdrop-blur-md max-w-[240px] animate-scale-up flex items-start gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping mt-1 flex-shrink-0"></div>
          <div className="flex-1 text-[11px] leading-tight">
            <p className="font-black text-emerald-300">Equipo Ventas Digitales</p>
            <p className="text-mvp-silver text-[10px] mt-0.5">Asesores oficiales listos para atenderte en línea 🔥</p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowTooltip(false);
            }}
            className="text-mvp-muted hover:text-white -mr-1 -mt-1 p-1"
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
        className="flex items-center gap-2.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-black text-xs sm:text-sm py-2.5 sm:py-3 px-4 sm:px-5 rounded-full shadow-[0_4px_30px_rgba(16,185,129,0.6)] transition-all hover:scale-105 active:scale-95 group border-2 border-emerald-300/50 cursor-pointer"
        title="Abrir Chat con Asesoras en Vivo"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
        </span>
        <MessageCircle size={18} className="text-white fill-white/20 group-hover:rotate-12 transition-transform" />
        <span className="font-display tracking-wider uppercase text-xs sm:text-sm">Chat en Vivo</span>
      </button>
    </aside>
  );
};
