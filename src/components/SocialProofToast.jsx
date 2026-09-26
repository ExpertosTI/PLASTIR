import React, { useState, useEffect } from 'react';
import { ShoppingBag, CheckCircle, Zap, TrendingUp, Sparkles } from 'lucide-react';
import { PRODUCTS } from '../data/products';

const RECENT_BUYERS = [
  { name: 'Kervin M.', city: 'Los Mina, Santo Domingo Este', time: 'hace 1 min' },
  { name: 'Alejandro R.', city: 'Santiago de los Caballeros', time: 'hace 2 min' },
  { name: 'Dionel P.', city: 'Distrito Nacional (Naco)', time: 'hace 3 min' },
  { name: 'Jean Carlos V.', city: 'La Romana', time: 'hace 1 min' },
  { name: 'Yariel S.', city: 'San Cristóbal (Madre Vieja)', time: 'hace 4 min' },
  { name: 'Brayan T.', city: 'Punta Cana / Bávaro', time: 'hace 2 min' },
  { name: 'Moisés G.', city: 'Villa Mella, Sto. Dgo. Norte', time: 'hace 5 min' },
  { name: 'Franklin D.', city: 'San Vicente de Paúl, SDE', time: 'hace 30 seg' },
  { name: 'Cristian H.', city: 'Herrera, Sto. Dgo. Oeste', time: 'hace 2 min' },
];

export const SocialProofToast = () => {
  const [currentNotification, setCurrentNotification] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const showRandomToast = () => {
      const randomBuyer = RECENT_BUYERS[Math.floor(Math.random() * RECENT_BUYERS.length)];
      const randomProduct = PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)];

      setCurrentNotification({
        buyer: randomBuyer,
        product: randomProduct,
      });
      setIsVisible(true);

      // Hide after 5.5 seconds
      setTimeout(() => {
        setIsVisible(false);
      }, 5500);
    };

    // First trigger after 3 seconds, then trigger exactly every 20 seconds
    const initialTimer = setTimeout(showRandomToast, 3000);
    const interval = setInterval(showRandomToast, 20000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, []);

  if (!currentNotification || !isVisible) return null;

  return (
    <div className="fixed bottom-16 sm:bottom-5 left-3 sm:left-5 z-40 max-w-xs sm:max-w-sm bg-mvp-card/95 backdrop-blur-xl border border-emerald-500/40 rounded-2xl p-3 shadow-[0_10px_30px_rgba(0,0,0,0.8)] animate-slide-up flex items-center gap-3">
      {/* Product Thumbnail with pulsing green dot */}
      <div className="relative flex-shrink-0">
        <img
          src={currentNotification.product.images[0]}
          alt={currentNotification.product.name}
          className="w-12 h-12 rounded-xl object-cover bg-black border border-white/10"
        />
        <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-mvp-dark animate-ping"></span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-black tracking-wider uppercase">
          <CheckCircle size={11} className="text-emerald-400" />
          <span>¡Pedido Confirmado COD!</span>
          <span className="text-mvp-muted font-normal">• {currentNotification.buyer.time}</span>
        </div>
        <p className="text-xs text-white font-bold truncate">
          <span className="text-emerald-300 font-black">{currentNotification.buyer.name}</span> en {currentNotification.buyer.city}
        </p>
        <p className="text-[11px] text-mvp-silver truncate">
          Compró: <strong className="text-amber-300">{currentNotification.product.name}</strong>
        </p>
      </div>
    </div>
  );
};
