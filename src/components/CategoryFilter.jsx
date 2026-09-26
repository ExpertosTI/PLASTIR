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
    <div id="categories-filter" className="w-full py-2.5 sm:py-3 px-3 sm:px-4 bg-white/95 border-b border-slate-200 sticky top-[82px] sm:top-[94px] z-30 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          
          {/* Botón Asesoría Inmediata */}
          <button
            onClick={() => openLiveChat()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap bg-emerald-50 border border-emerald-500/50 text-emerald-700 hover:text-emerald-900 hover:bg-emerald-100 transition-all flex-shrink-0 shadow-sm"
            title="Abrir Chat con Asesoras"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
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
                    ? 'bg-[#F16100] text-white shadow-md shadow-orange-500/25 scale-105 border border-[#F16100]'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 shadow-sm'
                }`}
              >
                <IconComponent
                  size={14}
                  className={isSelected ? 'text-white' : 'text-[#F16100]'}
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
