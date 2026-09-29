import React from 'react';
import { 
  Sparkles, 
  Package, 
  Flame, 
  Layers, 
  Crown, 
  ShieldCheck, 
  Baby, 
  Armchair, 
  ChevronRight, 
  Factory, 
  SprayCan, 
  UtensilsCrossed, 
  Shirt, 
  Grid
} from 'lucide-react';
import { CATEGORIES } from '../data/products';

// Rich color mapping matching Office Target aesthetic (vibrant circles with distinct hues)
const CIRCLE_THEMES = {
  todos: {
    bg: 'bg-gradient-to-tr from-slate-800 to-slate-900',
    ring: 'ring-slate-400/30',
    shadow: 'shadow-slate-900/30',
    text: 'text-white',
    badge: '★ TODOS',
    icon: Sparkles
  },
  organizacion: {
    bg: 'bg-gradient-to-tr from-purple-600 to-indigo-600',
    ring: 'ring-purple-400/30',
    shadow: 'shadow-purple-500/30',
    text: 'text-white',
    badge: 'POPULAR',
    icon: Package
  },
  cocina: {
    bg: 'bg-gradient-to-tr from-blue-600 to-cyan-500',
    ring: 'ring-blue-400/30',
    shadow: 'shadow-blue-500/30',
    text: 'text-white',
    badge: 'FDA BPA FREE',
    icon: UtensilsCrossed
  },
  lavanderia: {
    bg: 'bg-gradient-to-tr from-rose-600 to-pink-500',
    ring: 'ring-rose-400/30',
    shadow: 'shadow-rose-500/30',
    text: 'text-white',
    badge: 'HOGAR',
    icon: Shirt
  },
  mesa_hogar: {
    bg: 'bg-gradient-to-tr from-amber-500 to-orange-500',
    ring: 'ring-amber-400/30',
    shadow: 'shadow-amber-500/30',
    text: 'text-white',
    badge: 'IRROMPIBLE',
    icon: Crown
  },
  patio_limpieza: {
    bg: 'bg-gradient-to-tr from-emerald-600 to-teal-500',
    ring: 'ring-emerald-400/30',
    shadow: 'shadow-emerald-500/30',
    text: 'text-white',
    badge: 'HIGIENE',
    icon: SprayCan
  },
  infantil: {
    bg: 'bg-gradient-to-tr from-teal-500 to-cyan-400',
    ring: 'ring-teal-400/30',
    shadow: 'shadow-teal-500/30',
    text: 'text-white',
    badge: 'BEBÉ',
    icon: Baby
  },
  muebles: {
    bg: 'bg-gradient-to-tr from-orange-600 to-red-500',
    ring: 'ring-orange-400/30',
    shadow: 'shadow-orange-500/30',
    text: 'text-white',
    badge: 'RESISTENTE',
    icon: Armchair
  },
};

export const CategoryGridSection = ({ selectedCategory, onSelectCategory }) => {
  const scrollToCatalog = () => {
    const el = document.getElementById('catalog');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="w-full py-6 sm:py-10 px-3 sm:px-4 bg-slate-50/80 border-b border-slate-200">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section in Office Target Aesthetic */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6 sm:mb-8">
          <div>
            <span className="text-[11px] font-black tracking-widest text-[#F16100] uppercase block mb-1">
              CATEGORÍAS DEPARTAMENTALES
            </span>
            <h2 className="text-xl sm:text-3xl font-black text-slate-900 leading-tight">
              Todo lo que tu hogar y negocio necesita
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
              Plásticos 100% vírgenes, libres de BPA y soluciones de organización para cada espacio
            </p>
          </div>

          <button
            onClick={() => {
              onSelectCategory('todos');
              scrollToCatalog();
            }}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#F16100] hover:text-[#D05000] transition-colors self-start sm:self-auto group"
          >
            <span>Ver catálogo completo</span>
            <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Circular Category Grid (Office Target Layout) */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-8 gap-3 sm:gap-4 md:gap-6">
          {CATEGORIES.map((cat) => {
            const theme = CIRCLE_THEMES[cat.id] || CIRCLE_THEMES.todos;
            const IconComponent = theme.icon || Package;
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => {
                  onSelectCategory(cat.id);
                  scrollToCatalog();
                }}
                className="group flex flex-col items-center text-center transition-all focus:outline-none"
              >
                {/* Circle Badge with vivid gradient & soft drop shadow */}
                <div
                  className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center ${theme.bg} ${theme.shadow} shadow-lg ring-4 ${
                    isSelected ? 'ring-[#F16100] scale-110' : `${theme.ring} group-hover:scale-105`
                  } transition-all duration-300 transform`}
                >
                  <IconComponent size={28} className="text-white drop-shadow-sm group-hover:rotate-6 transition-transform" />
                  
                  {/* Subtle Indicator Badge */}
                  {isSelected && (
                    <span className="absolute -top-1 -right-1 bg-white text-[#F16100] text-[9px] font-black px-1.5 py-0.5 rounded-full border border-[#F16100] shadow-sm">
                      ✓
                    </span>
                  )}
                </div>

                {/* Category Name Below Circle */}
                <span
                  className={`mt-2.5 text-xs sm:text-sm font-bold leading-tight line-clamp-2 ${
                    isSelected ? 'text-[#F16100] font-black scale-105' : 'text-slate-800 group-hover:text-[#F16100]'
                  } transition-colors`}
                >
                  {cat.name}
                </span>

                {/* Subtag / Helper text */}
                <span className="text-[10px] text-slate-400 font-medium mt-0.5 hidden sm:block">
                  Explorar →
                </span>
              </button>
            );
          })}
        </div>

      </div>
    </section>
  );
};
