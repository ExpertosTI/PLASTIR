import React, { useState } from 'react';
import { SHOWROOMS, PRODUCTS } from '../data/products';
import { Sparkles, ShoppingBag, ArrowRight, CheckCircle2, Eye, Tag, Layers } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const ShowroomsSection = ({ onSelectCategory, onSelectProduct }) => {
  const [activeShowroomId, setActiveShowroomId] = useState(SHOWROOMS[0].id);
  const { addToCart, setIsCartOpen } = useCart();

  const activeShowroom = SHOWROOMS.find((s) => s.id === activeShowroomId) || SHOWROOMS[0];
  const showroomProducts = PRODUCTS.filter((p) => activeShowroom.productIds.includes(p.id));

  const handleAddBundleToCart = () => {
    showroomProducts.forEach((prod) => {
      addToCart({
        ...prod,
        selectedColor: prod.colors?.[0]?.name || 'Estándar',
        selectedSize: prod.sizes?.[0] || 'Estándar',
        quantity: 1,
      });
    });
    setIsCartOpen(true);
  };

  return (
    <section id="showrooms" className="py-8 sm:py-12 px-3 sm:px-4 bg-slate-900/60 border-y border-slate-800 relative overflow-hidden">
      {/* Background Subtle Accent */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 space-y-6 sm:space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles size={13} className="text-amber-400" />
              <span>Inspiración Tipo IKEA // Ambientes Reales</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight flex items-center gap-2">
              <span>EXPLORA POR</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-amber-300">ESPACIOS & AMBIENTES</span>
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm max-w-2xl mt-1">
              Descubre cómo transformar cada rincón de tu casa o empresa. Compra el ambiente completo con descuento exclusivo o selecciona productos individuales.
            </p>
          </div>

          {/* Showroom Tabs Selector */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {SHOWROOMS.map((showroom) => {
              const isActive = showroom.id === activeShowroomId;
              return (
                <button
                  key={showroom.id}
                  onClick={() => setActiveShowroomId(showroom.id)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 scale-105 border border-blue-400'
                      : 'bg-slate-800/80 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700'
                  }`}
                >
                  <span>{showroom.room}</span>
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Showroom Display Showcase */}
        <div className="bg-slate-800/60 rounded-3xl border border-slate-700/80 p-4 sm:p-6 backdrop-blur-md">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            {/* Ambient Hero Image with Overlay */}
            <div className="lg:col-span-7 relative rounded-2xl overflow-hidden aspect-[16/10] group shadow-2xl border border-slate-700">
              <img
                src={activeShowroom.roomImage}
                alt={activeShowroom.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />

              {/* Badge on Image */}
              <div className="absolute top-3 left-3 bg-blue-600/90 backdrop-blur-md text-white text-[11px] font-black uppercase px-3 py-1 rounded-lg border border-blue-400 shadow-md">
                {activeShowroom.tag}
              </div>

              {/* Content on Image Bottom */}
              <div className="absolute bottom-4 left-4 right-4 space-y-1.5 text-white">
                <h3 className="text-xl sm:text-2xl font-black">{activeShowroom.name}</h3>
                <p className="text-xs sm:text-sm text-slate-200 line-clamp-2 font-normal">
                  {activeShowroom.subtitle}
                </p>
              </div>
            </div>

            {/* Right Column: Room Pack Details & Products */}
            <div className="lg:col-span-5 space-y-5">
              
              {/* Value proposition bullets */}
              <div className="space-y-2 bg-slate-900/60 p-4 rounded-2xl border border-slate-700/60">
                <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider block">
                  Beneficios del Ambiente:
                </span>
                {activeShowroom.features.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                    <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>

              {/* Products in this showroom list */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Layers size={14} className="text-blue-400" />
                    <span>Artículos en este Ambiente ({showroomProducts.length})</span>
                  </span>
                  <span className="text-[10px] text-slate-400">Clic para ver detalle</span>
                </div>

                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto no-scrollbar pr-1">
                  {showroomProducts.map((prod) => (
                    <div
                      key={prod.id}
                      onClick={() => onSelectProduct?.(prod)}
                      className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-750 border border-slate-750 hover:border-blue-500/50 cursor-pointer transition-all flex items-center gap-2 group"
                    >
                      <img
                        src={prod.images[0]}
                        alt={prod.name}
                        className="w-10 h-10 rounded-lg object-cover bg-slate-800 flex-shrink-0"
                      />
                      <div className="overflow-hidden">
                        <span className="text-[11px] font-bold text-slate-200 block truncate group-hover:text-blue-300">
                          {prod.name}
                        </span>
                        <span className="text-[10px] font-black text-amber-400">
                          RD$ {prod.price.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Room Bundle Price & Add All Button */}
              <div className="pt-2 border-t border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl sm:text-2xl font-black text-white">
                      RD$ {activeShowroom.bundlePrice.toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-400 line-through">
                      RD$ {activeShowroom.originalBundlePrice.toLocaleString()}
                    </span>
                  </div>
                  <span className="text-[11px] text-emerald-400 font-bold block">
                    ✨ Ahorras {activeShowroom.discountPercent}% llevando el pack completo
                  </span>
                </div>

                <button
                  onClick={handleAddBundleToCart}
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-blue-600 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-blue-600/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <ShoppingBag size={16} />
                  <span>Comprar Ambiente Completo</span>
                </button>
              </div>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
