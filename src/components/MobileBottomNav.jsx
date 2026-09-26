import React from 'react';
import { Home, Sparkles, ShoppingBag, Heart, FileText, PhoneCall } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const MobileBottomNav = ({ selectedCategory, onSelectCategory }) => {
  const { 
    itemsCount, 
    setIsCartOpen, 
    setIsWishlistOpen, 
    setIsQuickQuoterOpen,
    openLiveChat, 
    wishlist 
  } = useCart();

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200 py-1.5 px-3 flex items-center justify-around shadow-lg safe-area-bottom">
      {/* Home Tab */}
      <button
        onClick={() => {
          onSelectCategory('todos');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition-all ${
          selectedCategory === 'todos' ? 'text-[#F16100] font-black' : 'text-slate-500 hover:text-slate-900'
        }`}
      >
        <Home size={18} />
        <span className="text-[10px] font-bold">Inicio</span>
      </button>

      {/* Ambientes / Showrooms */}
      <button
        onClick={() => {
          document.getElementById('showrooms')?.scrollIntoView({ behavior: 'smooth' });
        }}
        className="flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl text-slate-500 hover:text-[#F16100] transition-all"
      >
        <Sparkles size={18} />
        <span className="text-[10px] font-medium">Ambientes</span>
      </button>

      {/* Cotizador B2B Executive Center Button */}
      <button
        onClick={() => setIsQuickQuoterOpen?.(true)}
        className="flex flex-col items-center -mt-3 group"
        title="Cotizador B2B Mayorista"
      >
        <div className="w-11 h-11 rounded-full bg-[#F16100] text-white flex items-center justify-center shadow-md shadow-orange-500/30 border-2 border-white group-active:scale-95 transition-transform">
          <FileText size={18} />
        </div>
        <span className="text-[9px] font-black text-[#F16100] mt-0.5 uppercase tracking-wider">Cotizar B2B</span>
      </button>

      {/* Favoritos */}
      <button
        onClick={() => setIsWishlistOpen(true)}
        className="relative flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl text-slate-500 hover:text-[#F16100] transition-all"
      >
        <Heart size={18} className={wishlist?.length > 0 ? 'text-red-500 fill-red-500/20' : ''} />
        <span className="text-[10px] font-medium">Favoritos</span>
        {wishlist?.length > 0 && (
          <span className="absolute top-0.5 right-1.5 bg-red-500 text-white text-[8px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
            {wishlist.length}
          </span>
        )}
      </button>

      {/* Carrito */}
      <button
        onClick={() => setIsCartOpen(true)}
        className="relative flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl text-slate-500 hover:text-slate-900 transition-all"
      >
        <ShoppingBag size={18} />
        <span className="text-[10px] font-bold">Carrito</span>
        {itemsCount > 0 && (
          <span className="absolute top-0.5 right-1 bg-[#F16100] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
            {itemsCount}
          </span>
        )}
      </button>
    </nav>
  );
};
