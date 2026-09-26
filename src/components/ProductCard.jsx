import React, { useState } from 'react';
import { ShoppingBag, Star, Zap, Eye, Heart, Plus, Check, ShieldCheck, Package } from 'lucide-react';
import { useCart } from '../context/CartContext';
import {
  trackProductClick,
  trackCustomerAction,
  trackWishlistToggle,
  trackSizeSelect,
  trackColorSelect,
} from '../utils/tracker';

export const ProductCard = ({ product, viewMode = 'grid' }) => {
  const { addToCart, setSelectedProduct, formatMoney, toggleFavorite, isFavorite, setIsCartOpen } = useCart();
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || '1 Unidad');
  
  const initialVariant = product.variants?.[0];
  const [selectedColor, setSelectedColor] = useState(
    initialVariant
      ? { name: initialVariant.code, image: initialVariant.image, variantId: initialVariant.id, sku: initialVariant.sku }
      : (product.colors?.[0] || { name: 'Original', image: product.images?.[0] })
  );

  const [addedAnimation, setAddedAnimation] = useState(false);

  const displayImage = selectedColor?.image || product.images?.[0];
  const isLiked = isFavorite(product.id);
  const totalStock = product.stockLeft ?? product.qtyAvailable ?? product.stock ?? 0;

  const handleCardClick = () => {
    trackProductClick(product, 'card_view_details');
    setSelectedProduct({ ...product, initialColor: selectedColor });
  };

  const handleQuickAdd = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    trackProductClick(product, 'quick_add_cart');
    addToCart({
      ...product,
      selectedImage: displayImage,
      selectedSize,
      selectedColor: selectedColor?.name,
      quantity: 1,
    });
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1200);
    setIsCartOpen(true);
  };

  const handleFavoriteToggle = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    trackWishlistToggle(product, !isLiked);
    toggleFavorite(product.id);
  };

  // View Mode: Compact List
  if (viewMode === 'compact') {
    return (
      <div 
        onClick={handleCardClick}
        className="group bg-slate-800/80 hover:bg-slate-750 border border-slate-700/80 hover:border-blue-500/50 rounded-xl px-3 py-2 transition-all flex items-center justify-between gap-3 shadow-sm cursor-pointer"
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-900 flex-shrink-0 relative border border-slate-700">
            <img
              src={displayImage}
              alt={product.name}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
            {product.discountPercent && (
              <span className="absolute top-0.5 left-0.5 bg-blue-600 text-white text-[8px] font-black px-1 rounded">
                -{product.discountPercent}%
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-[9px] uppercase font-bold text-blue-400 truncate">
                {product.department || product.category}
              </span>
              {product.capacity && (
                <span className="text-[9px] text-amber-300 font-mono truncate">
                  • {product.capacity}
                </span>
              )}
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-blue-300 transition-colors">
              {product.name}
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          <div className="text-right">
            <div className="text-xs sm:text-sm font-black text-white font-mono">
              {formatMoney(product.price)}
            </div>
            {product.originalPrice && (
              <div className="text-[9px] text-slate-500 line-through font-mono">
                {formatMoney(product.originalPrice)}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleQuickAdd}
            className="p-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-all shadow"
            title="Agregar al Carrito"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>
    );
  }

  // View Mode: Grid (IKEA + Shopify Card)
  return (
    <div className="group relative bg-slate-800/85 hover:bg-slate-800 border border-slate-700/80 hover:border-blue-500/50 rounded-2xl p-3 sm:p-3.5 transition-all duration-300 flex flex-col justify-between shadow-lg hover:shadow-xl hover:-translate-y-1">
      
      {/* Product Image Area */}
      <div 
        className="relative aspect-square rounded-xl overflow-hidden mb-3 bg-slate-900 cursor-pointer border border-slate-700/50"
        onClick={handleCardClick}
      >
        <img
          src={displayImage}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Top Left Badges: Department & Capacity */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 items-start max-w-[80%]">
          {product.tag && (
            <div className="bg-blue-600/90 backdrop-blur-md text-white text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded shadow uppercase tracking-wider">
              {product.tag}
            </div>
          )}
          {product.capacity && (
            <div className="bg-slate-950/80 backdrop-blur-md border border-slate-700 text-amber-300 text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
              📐 {product.capacity}
            </div>
          )}
        </div>

        {/* Top Right: Favorite Button & Discount Badge */}
        <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
          <button
            onClick={handleFavoriteToggle}
            className={`p-1.5 rounded-full backdrop-blur-md transition-all shadow-md ${
              isLiked ? 'bg-red-500 text-white scale-110' : 'bg-black/60 text-white/80 hover:text-white hover:bg-black/80'
            }`}
            title="Guardar en favoritos"
          >
            <Heart size={14} className={isLiked ? 'fill-white' : ''} />
          </button>

          {product.discountPercent && (
            <div className="bg-[#FFDB00] text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded shadow">
              -{product.discountPercent}%
            </div>
          )}
        </div>

        {/* Quick View Overlay on Desktop */}
        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <span className="bg-white text-slate-900 text-xs font-black px-3.5 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
            <Eye size={13} /> Vista Rápida
          </span>
        </div>
      </div>

      {/* Details Area */}
      <div className="space-y-2 flex-1 flex flex-col justify-between">
        <div>
          {/* Department and Rating */}
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-400">
              {product.department || 'Plásticos & Hogar'}
            </span>

            <div className="flex items-center gap-1 text-amber-400">
              <Star size={12} className="fill-amber-400" />
              <span className="font-bold text-[11px]">{product.rating || '5.0'}</span>
              <span className="text-slate-400 text-[10px]">({product.reviewsCount || 42})</span>
            </div>
          </div>

          {/* Title */}
          <h3
            onClick={handleCardClick}
            className="text-xs sm:text-sm font-bold text-white group-hover:text-blue-300 transition-colors line-clamp-2 cursor-pointer leading-snug"
          >
            {product.name}
          </h3>

          {/* Material & BPA Free highlight */}
          {product.material && (
            <div className="flex items-center gap-1 mt-1 text-[10px] text-emerald-400 font-medium truncate">
              <ShieldCheck size={12} className="flex-shrink-0" />
              <span className="truncate">Libre de BPA • Grado Alimenticio</span>
            </div>
          )}

          {/* Color Swatches */}
          {product.colors && product.colors.length > 1 && (
            <div className="flex items-center gap-1.5 mt-2">
              {product.colors.map((color) => (
                <button
                  key={color.name}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedColor(color);
                    trackColorSelect(color.name, product);
                  }}
                  title={color.name}
                  className={`w-3.5 h-3.5 rounded-full border transition-all ${
                    selectedColor?.name === color.name ? 'ring-2 ring-blue-400 scale-125' : 'border-white/20'
                  }`}
                  style={{ backgroundColor: color.hex }}
                />
              ))}
              <span className="text-[10px] text-slate-400 ml-1 truncate max-w-[100px]">
                {selectedColor?.name}
              </span>
            </div>
          )}

          {/* Size / Packs Pills */}
          {product.sizes && product.sizes.length > 1 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {product.sizes.slice(0, 3).map((size) => (
                <button
                  key={size}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedSize(size);
                    trackSizeSelect(size, product);
                  }}
                  className={`text-[9px] px-1.5 py-0.5 rounded border transition-colors ${
                    selectedSize === size
                      ? 'bg-blue-600 text-white border-blue-500 font-bold'
                      : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-500'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Pricing and Add to Cart Button (Shopify Style) */}
        <div className="pt-2 border-t border-slate-700/60 space-y-2 mt-2">
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-slate-400 line-through">
              {formatMoney(product.originalPrice)}
            </span>
            <span className="text-base sm:text-lg font-black text-amber-300 font-sans">
              {formatMoney(product.price)}
            </span>
          </div>

          <button
            onClick={handleQuickAdd}
            className={`w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md active:scale-95 ${
              addedAnimation
                ? 'bg-emerald-600 text-white'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20'
            }`}
          >
            {addedAnimation ? (
              <>
                <Check size={15} />
                <span>¡Agregado!</span>
              </>
            ) : (
              <>
                <ShoppingBag size={14} />
                <span>Agregar al Carrito</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
