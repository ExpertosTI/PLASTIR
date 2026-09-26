import React, { useState, useEffect } from 'react';
import { Clock, ShoppingCart, Star, Zap, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { PRODUCTS } from '../data/products';

export const FlashDeals = ({ products = PRODUCTS }) => {
  const { addToCart, setSelectedProduct, formatMoney, setIsCartOpen } = useCart();
  const safeProducts = Array.isArray(products) && products.length > 0 ? products : PRODUCTS;
  const flashProducts = safeProducts.filter((p) => p.isFlashDeal).slice(0, 4);

  const [timeLeft, setTimeLeft] = useState({ hours: 5, minutes: 42, seconds: 18 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 6, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDigits = (num) => String(num).padStart(2, '0');

  if (flashProducts.length === 0) return null;

  return (
    <section className="py-8 px-4 max-w-7xl mx-auto">
      {/* Header with Title and Countdown (Amazon 'Deal of the Day' Style) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 bg-[#F16100] text-white px-3 py-0.5 rounded-md text-[11px] font-black uppercase tracking-wider shadow-sm">
            <span>OFERTAS DEL DÍA</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">
            Selección Especial con Precios Rebajados
          </h2>
          <p className="text-xs text-slate-500">
            Ahorro directo en artículos seleccionados para organización y hogar. Disponibilidad garantizada para despacho inmediato.
          </p>
        </div>

        {/* Sober Countdown Box */}
        <div className="flex items-center gap-2 self-start sm:self-auto bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200">
          <Clock size={14} className="text-slate-500" />
          <span className="text-[11px] font-bold text-slate-600 uppercase">Tiempo restante:</span>
          <div className="flex items-center gap-1 font-mono text-xs font-bold text-slate-900">
            <span className="bg-white px-1.5 py-0.5 rounded border border-slate-200 text-[#F16100] font-black">
              {formatDigits(timeLeft.hours)}h
            </span>
            <span>:</span>
            <span className="bg-white px-1.5 py-0.5 rounded border border-slate-200 text-[#F16100] font-black">
              {formatDigits(timeLeft.minutes)}m
            </span>
            <span>:</span>
            <span className="bg-white px-1.5 py-0.5 rounded border border-slate-200 text-[#F16100] font-black">
              {formatDigits(timeLeft.seconds)}s
            </span>
          </div>
        </div>
      </div>

      {/* Grid of Deal Products */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {flashProducts.map((product) => {
          const savings = (product.originalPrice || product.price) - product.price;

          return (
            <div
              key={product.id}
              className="group relative bg-white hover:bg-white border border-slate-200 hover:border-[#F16100]/60 rounded-2xl p-3 sm:p-4 transition-all duration-300 flex flex-col justify-between shadow-sm hover:shadow-lg"
            >
              {/* Product Thumbnail */}
              <div 
                className="relative aspect-square rounded-xl overflow-hidden mb-3 bg-slate-50 cursor-pointer border border-slate-100"
                onClick={() => setSelectedProduct(product)}
              >
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Discount Badge */}
                {product.discountPercent && (
                  <div className="absolute top-2 left-2 bg-[#F16100] text-white text-[11px] font-black px-2 py-0.5 rounded shadow-sm">
                    -{product.discountPercent}% OFF
                  </div>
                )}

                {/* Capacity badge */}
                {product.capacity && (
                  <div className="absolute bottom-2 left-2 bg-white/95 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold text-slate-700 border border-slate-200 shadow-sm">
                    {product.capacity}
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#F16100]">
                      {product.department || 'Hogar & Organización'}
                    </span>
                    <div className="flex items-center gap-1 text-amber-500">
                      <Star size={12} className="fill-amber-400 text-amber-400" />
                      <span className="font-bold text-[11px] text-slate-700">{product.rating || '4.9'}</span>
                      <span className="text-slate-400 text-[10px]">({product.reviewsCount || 34})</span>
                    </div>
                  </div>

                  <h3
                    onClick={() => setSelectedProduct(product)}
                    className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#F16100] transition-colors line-clamp-2 cursor-pointer leading-snug"
                  >
                    {product.name}
                  </h3>
                </div>

                {/* Pricing Breakdown (Amazon Style) */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-base sm:text-lg font-black text-[#F16100]">
                        {formatMoney(product.price)}
                      </span>
                      {product.originalPrice && (
                        <span className="text-xs text-slate-400 line-through">
                          {formatMoney(product.originalPrice)}
                        </span>
                      )}
                    </div>
                    {savings > 0 && (
                      <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                        Ahorras: {formatMoney(savings)} ({product.discountPercent}%)
                      </p>
                    )}
                  </div>

                  {/* Stock & Delivery Status */}
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                    <CheckCircle2 size={12} className="text-emerald-600 flex-shrink-0" />
                    <span>En inventario • Envío a todo el país</span>
                  </div>

                  {/* Quick Action Button */}
                  <button
                    onClick={() => {
                      addToCart(product, product.sizes[0], product.colors[0]?.name);
                      setIsCartOpen(true);
                    }}
                    className="w-full mt-2 py-2.5 rounded-xl bg-slate-900 hover:bg-[#F16100] text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    <ShoppingCart size={14} />
                    <span>Agregar al Carrito</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
