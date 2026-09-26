import React from 'react';
import { Home, Sparkles, ShoppingBag, Heart, MessageSquare } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const MobileBottomNav = ({ selectedCategory, onSelectCategory }) => {
  const { 
    itemsCount, 
    setIsCartOpen, 
    setIsWishlistOpen, 
    openLiveChat, 
    wishlist 
  } = useCart();

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 py-1.5 px-2 flex items-center justify-around shadow-2xl safe-area-bottom">
      {/* Home Tab */}
      <button
        onClick={() => {
          onSelectCategory('todos');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        className={`flex flex-col items-center gap-0.5 py-1 px-1.5 rounded-xl transition-all ${
          selectedCategory === 'todos' ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-white'
        }`}
      >
        <Home size={18} />
        <span className="text-[9px] font-bold">Inicio</span>
      </button>

      {/* Ambientes IKEA Tab */}
      <button
        onClick={() => {
          document.getElementById('showrooms')?.scrollIntoView({ behavior: 'smooth' });
        }}
        className="flex flex-col items-center gap-0.5 py-1 px-1.5 rounded-xl text-slate-400 hover:text-amber-300 transition-all"
      >
        <Sparkles size={18} className="text-amber-400" />
        <span className="text-[9px]">Ambientes</span>
      </button>

      {/* Center Chat Button */}
      <button
        onClick={() => openLiveChat()}
        className="flex flex-col items-center -mt-4 group"
      >
        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 flex items-center justify-center text-white shadow-[0_0_20px_rgba(16,185,129,0.5)] border-2 border-white group-active:scale-95 transition-transform">
          <MessageSquare size={20} className="animate-pulse" />
        </div>
        <span className="text-[9px] font-black text-emerald-400 mt-0.5 uppercase tracking-wider">Asesoría</span>
      </button>

      {/* Favoritos Tab */}
      <button
        onClick={() => setIsWishlistOpen(true)}
        className="relative flex flex-col items-center gap-0.5 py-1 px-1.5 rounded-xl text-slate-400 hover:text-red-400 transition-all"
      >
        <Heart size={18} className={wishlist?.length > 0 ? 'text-red-500 fill-red-500/20' : 'text-slate-400'} />
        <span className="text-[9px]">Favoritos</span>
        {wishlist?.length > 0 && (
          <span className="absolute top-0.5 right-1.5 bg-red-500 text-white text-[8px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
            {wishlist.length}
          </span>
        )}
      </button>

      {/* Cart Drawer Tab */}
      <button
        onClick={() => setIsCartOpen(true)}
        className="relative flex flex-col items-center gap-0.5 py-1 px-1.5 rounded-xl text-slate-400 hover:text-white transition-all"
      >
        <ShoppingBag size={18} className="text-white" />
        <span className="text-[9px] font-bold">Carrito</span>
        {itemsCount > 0 && (
          <span className="absolute top-0.5 right-1 bg-blue-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-slate-900 animate-bounce-subtle">
            {itemsCount}
          </span>
        )}
      </button>
    </nav>
  );
};
