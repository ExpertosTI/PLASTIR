import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Search, 
  MapPin, 
  Settings, 
  CheckCircle2, 
  User, 
  Heart,
  Volume2,
  VolumeX,
  MessageSquare,
  Zap,
  Layers,
  Sparkles,
  Package,
  Flame,
  FileText,
  ChevronDown,
  Bot,
  Bell,
  BarChart2
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { PlastirLogo } from './PlastirLogo';
import { CATEGORIES } from '../data/products';

const PROMO_MESSAGES = [
  { tag: '🇩🇴 ENVÍOS RD', text: 'Envíos express el mismo día en Santo Domingo y a todo el país con Pago Contra Entrega (COD)' },
  { tag: '🛡️ 100% VIRGEN & BPA FREE', text: 'Plásticos de máxima durabilidad aprobados para alimentos, microondas y congelador' },
  { tag: '🚚 A TU PUERTA', text: 'Recibe en tu casa con seguridad y paga únicamente cuando tengas el producto en tus manos' },
  { tag: '✨ DISEÑO FUNCIONAL', text: 'Soluciones que maximizan cada centímetro de tu clóset, cocina y despensa' },
  { tag: '💎 GARANTÍA PLASTIR', text: 'Reposición inmediata garantizada ante cualquier defecto de fábrica' },
];

export const Navbar = ({ searchQuery, setSearchQuery, onSelectCategory }) => {
  const { 
    itemsCount, 
    wishlist,
    setIsWishlistOpen,
    setIsNotificationsOpen,
    setIsStatsOpen,
    setIsCartOpen, 
    setIsTrackerOpen, 
    setIsAdminOpen,
    openLiveChat,
    currency, 
    setCurrency, 
    activeCoupon 
  } = useCart();

  const { currentUser, setIsAuthModalOpen, setIsProfileModalOpen } = useAuth();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [promoIndex, setPromoIndex] = useState(0);
  const [isDeptDropdownOpen, setIsDeptDropdownOpen] = useState(false);

  // Rotating Promo Banner every 4 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setPromoIndex((prev) => (prev + 1) % PROMO_MESSAGES.length);
    }, 4200);
    return () => clearInterval(timer);
  }, []);

  const handleSearchChange = (val) => {
    setSearchQuery(val);
    if (val.trim()) {
      const catalogEl = document.getElementById('catalog');
      if (catalogEl) {
        catalogEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const currentPromo = PROMO_MESSAGES[promoIndex];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      
      {/* Top Department Store Announcement Bar in Plastir Orange */}
      <div className="bg-gradient-to-r from-[#F16100] via-[#FA751A] to-[#F16100] text-white py-1.5 px-3 text-xs font-semibold overflow-hidden transition-all shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden flex-1 mr-2 animate-fade-in key={promoIndex}">
            <span className="bg-white text-[#F16100] text-[10px] px-2 py-0.5 rounded font-black tracking-wide uppercase flex-shrink-0 shadow-sm">
              {currentPromo.tag}
            </span>
            <span className="truncate text-[11px] sm:text-xs font-medium text-white/95">
              {currentPromo.text}
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
            {/* Direct COD Guarantee Badge */}
            <div className="hidden md:flex items-center gap-1.5 text-[11px] font-bold text-white bg-black/15 px-2.5 py-0.5 rounded-full border border-white/30">
              <span>💵 Pago Contra Entrega Seguro</span>
            </div>

            {/* Currency Switcher */}
            <div className="flex items-center bg-black/20 rounded-full p-0.5 border border-white/30 text-[10px]">
              <button
                onClick={() => setCurrency('DOP')}
                className={`px-1.5 py-0.5 rounded-full transition-all ${
                  currency === 'DOP' ? 'bg-white text-[#F16100] font-black shadow-sm' : 'text-white/80 hover:text-white'
                }`}
              >
                RD$
              </button>
              <button
                onClick={() => setCurrency('USD')}
                className={`px-1.5 py-0.5 rounded-full transition-all ${
                  currency === 'USD' ? 'bg-white text-[#F16100] font-black shadow-sm' : 'text-white/80 hover:text-white'
                }`}
              >
                USD
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Brand Logo & Department Dropdown Trigger */}
        <div className="flex items-center gap-3 sm:gap-6">
          <a href="#" className="flex items-center group flex-shrink-0">
            <PlastirLogo />
          </a>

          {/* MegaMenu / Departamentos Trigger */}
          <div className="relative hidden md:block">
            <button
              onClick={() => setIsDeptDropdownOpen(!isDeptDropdownOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 text-xs font-bold transition-all shadow-sm"
            >
              <Package size={14} className="text-[#F16100]" />
              <span>Departamentos</span>
              <ChevronDown size={14} className={`text-slate-500 transition-transform ${isDeptDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isDeptDropdownOpen && (
              <div 
                className="absolute left-0 top-full mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 animate-fade-in"
                onMouseLeave={() => setIsDeptDropdownOpen(false)}
              >
                <div className="px-3.5 py-1.5 border-b border-slate-100 text-[10px] font-black uppercase text-[#F16100] tracking-wider">
                  Navegar por Departamentos
                </div>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      onSelectCategory?.(cat.id);
                      setIsDeptDropdownOpen(false);
                      scrollToSection('catalog');
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-[#F16100] hover:bg-orange-50 flex items-center justify-between transition-colors"
                  >
                    <span>{cat.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">→</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Enlace directo a Showrooms IKEA */}
          <button
            onClick={() => scrollToSection('showrooms')}
            className="hidden lg:flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-[#F16100] transition-colors"
          >
            <Sparkles size={14} className="text-[#F16100]" />
            <span>Ambientes e Ideas</span>
          </button>
        </div>

        {/* Search Bar - Desktop Shopify Style */}
        <div className="hidden md:flex flex-1 max-w-md mx-2">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Buscar cajas organizadoras, herméticos, zafacones, sillas..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full bg-slate-100/90 border border-slate-200 rounded-full py-1.5 pl-9 pr-8 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#F16100] focus:ring-2 focus:ring-[#F16100]/20 transition-all shadow-inner"
            />
            <Search className="absolute left-3 top-2 text-slate-400" size={14} />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1.5 text-xs text-slate-500 hover:text-slate-800 bg-slate-200 px-1.5 rounded-full"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Action Buttons Right */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          
          {/* Search Toggle for Mobile */}
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="md:hidden p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900"
            aria-label="Buscar"
          >
            <Search size={16} />
          </button>

          {/* CHAT EN VIVO CON PLASTIR AI */}
          <button
            onClick={() => openLiveChat()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50/90 border border-orange-300/80 hover:border-[#C2410C] text-[#C2410C] hover:text-[#9A3412] text-xs font-black transition-all shadow-sm hover:scale-105"
            title="Chat con Plastir AI Asistente de Ventas"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C2410C] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#C2410C]"></span>
            </span>
            <Bot size={15} className="text-[#C2410C]" />
            <span className="font-display tracking-wider uppercase text-xs hidden sm:inline">Plastir AI</span>
          </button>

          {/* Wishlist Button */}
          <button
            onClick={() => setIsWishlistOpen(true)}
            className="relative p-2 rounded-xl bg-slate-50 border border-slate-200 hover:border-[#F16100]/50 text-slate-600 hover:text-[#F16100] text-xs transition-all shadow-sm"
            title="Mis Favoritos"
          >
            <Heart size={16} className={wishlist?.length > 0 ? 'text-red-500 fill-red-500' : ''} />
            {wishlist?.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center">
                {wishlist.length}
              </span>
            )}
          </button>

          {/* Notification Bell Button */}
          <button
            onClick={() => setIsNotificationsOpen(true)}
            className="relative p-2 rounded-xl bg-slate-50 border border-slate-200 hover:border-[#F16100]/50 text-slate-600 hover:text-[#F16100] text-xs transition-all shadow-sm"
            title="Notificaciones & Alertas"
          >
            <Bell size={16} />
            <span className="absolute -top-1 -right-1 bg-[#F16100] text-white text-[9px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center animate-pulse">
              3
            </span>
          </button>



          {/* User Auth/Profile */}
          <button
            onClick={() => currentUser ? setIsProfileModalOpen(true) : setIsAuthModalOpen(true)}
            className="p-2 rounded-xl bg-slate-50 border border-slate-200 hover:border-[#F16100]/50 text-slate-600 hover:text-[#F16100] text-xs transition-all shadow-sm"
            title={currentUser ? `Hola, ${currentUser.name}` : 'Iniciar Sesión'}
          >
            <User size={16} className={currentUser ? 'text-[#F16100]' : ''} />
          </button>

          {/* Cart Drawer Trigger Button (Shopify Style in Plastir Orange) */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-[#F16100] via-[#FA751A] to-[#F16100] hover:from-[#E05300] hover:to-[#F16100] text-white font-black text-xs uppercase tracking-wider shadow-md shadow-orange-500/25 hover:scale-105 active:scale-95 transition-all"
          >
            <ShoppingBag size={16} />
            <span className="hidden sm:inline">Carrito</span>
            <span className="bg-white text-[#F16100] font-black text-[11px] px-1.5 py-0.2 rounded-full min-w-[18px] text-center shadow-sm">
              {itemsCount}
            </span>
          </button>

        </div>
      </div>

      {/* Mobile Search Bar Expansion */}
      {isSearchOpen && (
        <div className="md:hidden px-3 pb-3 pt-1 border-t border-slate-200 bg-white animate-fade-in">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Buscar en departamentos Plastir..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full bg-slate-100 border border-slate-200 rounded-full py-2 pl-9 pr-8 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#F16100] focus:ring-2 focus:ring-[#F16100]/20"
              autoFocus
            />
            <Search className="absolute left-3 top-2.5 text-slate-400" size={15} />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2 text-xs text-slate-500 bg-slate-200 px-1.5 rounded-full"
              >
                ×
              </button>
            )}
          </div>
        </div>
      )}

    </header>
  );
};
