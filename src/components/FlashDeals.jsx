import React, { useState, useEffect } from 'react';
import { Flame, Clock, Eye, ShoppingCart, Star, Zap } from 'lucide-react';
import { useCart } from '../context/CartContext';

import { PRODUCTS } from '../data/products';

export const FlashDeals = ({ products = PRODUCTS }) => {
  const { addToCart, setSelectedProduct, formatMoney } = useCart();
  const safeProducts = Array.isArray(products) && products.length > 0 ? products : PRODUCTS;
  const flashProducts = safeProducts.filter((p) => p.isFlashDeal).slice(0, 4);

  const [timeLeft, setTimeLeft] = useState({ hours: 3, minutes: 42, seconds: 18 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 4, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDigits = (num) => String(num).padStart(2, '0');

  if (flashProducts.length === 0) return null;

  return (
    <section className="py-8 px-4 max-w-7xl mx-auto">
      {/* Header with Title and Countdown */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 bg-gradient-to-r from-mvp-card via-mvp-dark to-mvp-card p-4 rounded-2xl border border-mvp-red/30">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 bg-mvp-red/20 border border-mvp-red/50 text-mvp-red px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
            <Flame size={14} className="fill-mvp-red animate-flame" />
            <span>OFERTAS RELÁMPAGO // PRECIOS ESPECIALES HOY</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-black text-white uppercase tracking-wide">
            OFERTAS DEL DÍA CON PAGO AL RECIBIR
          </h2>
          <p className="text-xs text-mvp-silver/80">
            Precios rebajados por tiempo limitado con envío express a todo el país.
          </p>
        </div>

        {/* Live Timer Box */}
        <div className="flex items-center gap-2 self-start sm:self-auto bg-black/70 px-3.5 py-2 rounded-xl border border-mvp-red/40">
          <span className="text-xs font-bold text-mvp-muted uppercase">Termina en:</span>
          <div className="flex items-center gap-1 font-mono text-sm font-black text-mvp-red">
            <span className="bg-mvp-dark px-1.5 py-0.5 rounded border border-mvp-cardHover text-white">
              {formatDigits(timeLeft.hours)}
            </span>
            <span>:</span>
            <span className="bg-mvp-dark px-1.5 py-0.5 rounded border border-mvp-cardHover text-white">
              {formatDigits(timeLeft.minutes)}
            </span>
            <span>:</span>
            <span className="bg-mvp-dark px-1.5 py-0.5 rounded border border-mvp-cardHover text-white">
              {formatDigits(timeLeft.seconds)}
            </span>
          </div>
        </div>
      </div>

      {/* Grid of Flash Products */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {flashProducts.map((product) => {
          return (
            <div
              key={product.id}
              className="group relative bg-mvp-card hover:bg-mvp-cardHover border border-mvp-cardHover hover:border-mvp-red/50 rounded-2xl p-3 sm:p-4 transition-all duration-300 flex flex-col justify-between shadow-lg hover:shadow-glow-sm"
            >
              {/* Top badges */}
              <div className="relative aspect-square rounded-xl overflow-hidden mb-3 bg-black/40 cursor-pointer"
                   onClick={() => setSelectedProduct(product)}
              >
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Discount Ribbon */}
                <div className="absolute top-2 left-2 bg-gradient-to-r from-mvp-red to-mvp-darkRed text-white text-xs font-black px-2.5 py-1 rounded-md shadow-md flex items-center gap-1">
                  <Zap size={12} className="fill-white" />
                  <span>-{product.discountPercent}% OFF</span>
                </div>

                {/* Live Viewers Floating Badge */}
                <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] text-mvp-silver flex items-center gap-1 border border-white/10">
                  <Eye size={11} className="text-mvp-neonGreen" />
                  <span>{12 + (product.id.charCodeAt(product.id.length - 1) % 15)} viendo ahora</span>
                </div>
              </div>

              {/* Product Info */}
              <div className="space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1 text-xs text-amber-400 mb-1">
                    <Star size={13} className="fill-amber-400" />
                    <span className="font-bold">{product.rating}</span>
                    <span className="text-mvp-muted text-[11px]">({product.reviewsCount})</span>
                  </div>

                  <h3
                    onClick={() => setSelectedProduct(product)}
                    className="text-sm font-bold text-white group-hover:text-mvp-red transition-colors line-clamp-2 cursor-pointer leading-snug"
                  >
                    {product.name}
                  </h3>
                </div>

                {/* Pricing & Stock Progress */}
                <div className="space-y-2 pt-2 border-t border-mvp-cardHover/60">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-xs text-mvp-muted line-through mr-2">
                        {formatMoney(product.originalPrice)}
                      </span>
                      <span className="text-base sm:text-lg font-black text-white">
                        {formatMoney(product.price)}
                      </span>
                    </div>
                  </div>

                  {/* Stock Urgency Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-semibold text-mvp-muted">
                      <span className="text-amber-400 font-bold flex items-center gap-1 truncate max-w-[150px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping flex-shrink-0"></span>
                        {product.urgencyBadge || '⚡ Pocas unidades'}
                      </span>
                      <span className="text-mvp-red font-bold flex-shrink-0">
                        {product.stockLeft <= 4 ? '🚨 ¡Casi Agotado!' : product.stockLeft <= 10 ? '🔥 Alta Demanda' : '✔ En Stock'}
                      </span>
                    </div>
                    <div className="w-full bg-mvp-dark rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-amber-500 to-mvp-red h-full rounded-full"
                        style={{ width: `${product.soldPercent || 80}%` }}
                      />
                    </div>
                  </div>

                  {/* Quick Action Button */}
                  <button
                    onClick={() => addToCart(product, product.sizes[0], product.colors[0]?.name)}
                    className="w-full mt-2 py-2.5 rounded-xl bg-mvp-red/10 hover:bg-mvp-red text-mvp-red hover:text-white border border-mvp-red/40 hover:border-mvp-red font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 group-hover:bg-mvp-red group-hover:text-white"
                  >
                    <ShoppingCart size={15} />
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
