import React from 'react';
import { CATEGORIES } from '../data/products';
import { Sparkles, Package, Flame, Layers, Crown, Zap, Shirt } from 'lucide-react';
import { useCart } from '../context/CartContext';

const ICON_MAP = {
  Sparkles,
  Package,
  Flame,
  Layers,
  Crown,
  Zap,
  Shirt,
};

export const CategoryFilter = ({ selectedCategory, onSelectCategory }) => {
  const { openLiveChat } = useCart();

  return (
    <div id="categories-filter" className="w-full py-2.5 sm:py-3 px-3 sm:px-4 bg-slate-900/80 border-b border-slate-800 sticky top-[82px] sm:top-[94px] z-30 backdrop-blur-md">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          
          {/* Botón Asesoría Inmediata */}
          <button
            onClick={() => openLiveChat()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap bg-emerald-500/10 border border-emerald-500/50 text-emerald-300 hover:text-white hover:bg-emerald-500/20 transition-all flex-shrink-0"
            title="Abrir Chat con Asesoras"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>💬 ASESORÍA EN VIVO</span>
          </button>

          {/* Categorías Departamentales */}
          {CATEGORIES.map((cat) => {
            const IconComponent = ICON_MAP[cat.icon] || Package;
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 scale-105 border border-blue-400'
                    : 'bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700/80'
                }`}
              >
                <IconComponent
                  size={14}
                  className={isSelected ? 'text-amber-300' : 'text-blue-400'}
                />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
