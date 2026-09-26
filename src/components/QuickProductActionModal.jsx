import React, { useState, useEffect } from 'react';
import {
  X,
  MessageCircle,
  ShoppingBag,
  Zap,
  CheckCircle2,
  Truck,
  ShieldCheck,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useCart } from '../context/CartContext';

export const QuickProductActionModal = () => {
  const {
    quickChoiceProduct,
    setQuickChoiceProduct,
    addToCart,
    openDirectWhatsAppForProduct,
    setSelectedProduct,
    formatMoney,
  } = useCart();

  const [selectedSize, setSelectedSize] = useState('40 (8)');
  const [selectedColor, setSelectedColor] = useState({ name: 'Original' });
  const [addedFeedback, setAddedFeedback] = useState(false);

  useEffect(() => {
    if (quickChoiceProduct) {
      setSelectedSize(
        quickChoiceProduct.initialSize ||
          (quickChoiceProduct.sizes && quickChoiceProduct.sizes[0]) ||
          '40 (8)'
      );
      setSelectedColor(
        quickChoiceProduct.initialColor ||
          (quickChoiceProduct.colors && quickChoiceProduct.colors[0]) ||
          { name: 'Original', image: quickChoiceProduct.images?.[0] }
      );
      setAddedFeedback(false);
    }
  }, [quickChoiceProduct]);

  if (!quickChoiceProduct) return null;

  const displayImage =
    selectedColor?.image ||
    quickChoiceProduct.selectedImage ||
    quickChoiceProduct.images?.[0] ||
    '/img/drop-1.jpg';

  const handleWhatsAppDirect = () => {
    openDirectWhatsAppForProduct(quickChoiceProduct, selectedSize, selectedColor?.name || 'Original');
    setQuickChoiceProduct(null);
  };

  const handleAddToCartAndContinue = () => {
    const itemToAdd = {
      ...quickChoiceProduct,
      image: displayImage,
      selectedImage: displayImage,
      images: [displayImage, ...(quickChoiceProduct.images || [])],
      sku: selectedColor?.sku || quickChoiceProduct.sku,
    };

    addToCart(itemToAdd, selectedSize, selectedColor?.name || 'Original', 1, false);
    setAddedFeedback(true);

    setTimeout(() => {
      setQuickChoiceProduct(null);
      setAddedFeedback(false);
    }, 600);
  };

  const handleViewFullDetails = () => {
    const prod = quickChoiceProduct;
    setQuickChoiceProduct(null);
    setSelectedProduct({ ...prod, initialColor: selectedColor, initialSize: selectedSize });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        className="w-full sm:max-w-lg bg-[#0E121E] border border-white/10 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl text-white relative animate-scale-up max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase px-2.5 py-1 rounded-full flex items-center gap-1">
              <Zap size={12} className="fill-emerald-400" />
              Pedido Rápido en 1 Paso
            </span>
          </div>
          <button
            onClick={() => setQuickChoiceProduct(null)}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Product Card Row */}
        <div className="flex items-center gap-3.5 py-4">
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-black/50 border border-white/10 flex-shrink-0">
            <img
              src={displayImage}
              alt={quickChoiceProduct.name}
              className="w-full h-full object-cover"
            />
            {quickChoiceProduct.discountPercent && (
              <span className="absolute top-1 left-1 bg-mvp-red text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow">
                -{quickChoiceProduct.discountPercent}%
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-sm sm:text-base font-bold text-white line-clamp-2 leading-snug">
              {quickChoiceProduct.name}
            </h3>

            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-lg sm:text-xl font-black text-white">
                {formatMoney(quickChoiceProduct.price)}
              </span>
              {quickChoiceProduct.originalPrice > quickChoiceProduct.price && (
                <span className="text-xs text-mvp-silver/60 line-through">
                  {formatMoney(quickChoiceProduct.originalPrice)}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 mt-1.5 text-[11px] text-emerald-400 font-medium">
              <span className="flex items-center gap-1">
                <Truck size={12} /> Envío Express RD
              </span>
              <span className="flex items-center gap-1 text-mvp-silver/80">
                <ShieldCheck size={12} className="text-emerald-400" /> Pago al recibir (COD)
              </span>
            </div>
          </div>
        </div>

        {/* Size Selection */}
        {quickChoiceProduct.sizes && quickChoiceProduct.sizes.length > 0 && (
          <div className="py-2.5 border-t border-white/5">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-mvp-silver font-bold">Selecciona tu talla:</span>
              <span className="text-white font-mono font-bold bg-white/5 px-2 py-0.5 rounded text-[11px]">
                {selectedSize}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto no-scrollbar">
              {quickChoiceProduct.sizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ${
                    selectedSize === size
                      ? 'bg-mvp-red text-white border-mvp-red shadow-glow-sm scale-105'
                      : 'bg-[#141824] text-mvp-silver border-white/10 hover:border-white/30 hover:text-white'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Color Selection if variants exist */}
        {quickChoiceProduct.variants && quickChoiceProduct.variants.length > 1 ? (
          <div className="py-2.5 border-t border-white/5">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-mvp-silver font-bold">Color:</span>
              <span className="text-white font-bold text-[11px]">{selectedColor?.name || ''}</span>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {quickChoiceProduct.variants.map((v) => (
                <button
                  key={v.id}
                  onClick={() =>
                    setSelectedColor({
                      name: v.code,
                      image: v.image,
                      variantId: v.id,
                      sku: v.sku,
                    })
                  }
                  className={`relative w-9 h-9 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                    selectedColor?.variantId === v.id || selectedColor?.name === v.code
                      ? 'border-mvp-red scale-110 shadow-glow-sm'
                      : 'border-white/20 hover:border-white/50 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={v.image} alt={v.code} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        ) : quickChoiceProduct.colors && quickChoiceProduct.colors.length > 1 ? (
          <div className="py-2.5 border-t border-white/5">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-mvp-silver font-bold">Color:</span>
              <span className="text-white font-bold text-[11px]">{selectedColor?.name || ''}</span>
            </div>
            <div className="flex items-center gap-2">
              {quickChoiceProduct.colors.map((c) => (
                <button
                  key={c.name}
                  onClick={() => setSelectedColor(c)}
                  className={`w-6 h-6 rounded-full border-2 transition-all ${
                    selectedColor?.name === c.name
                      ? 'ring-2 ring-mvp-red border-white scale-110'
                      : 'border-white/20 opacity-70'
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
          </div>
        ) : null}

        {/* The 2 Primary Action Choices */}
        <div className="space-y-2.5 pt-4 border-t border-white/10">
          <p className="text-center text-xs text-mvp-silver/70 font-semibold mb-1">
            ¿Cómo deseas continuar?
          </p>

          {/* Option 1: Direct WhatsApp */}
          <button
            onClick={handleWhatsAppDirect}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-black/20 flex items-center justify-center">
                <MessageCircle size={20} className="fill-white text-emerald-500" />
              </div>
              <div className="text-left">
                <div className="text-sm font-black text-white leading-tight">
                  Ir al WhatsApp Directamente
                </div>
                <div className="text-[10px] text-emerald-100 font-normal leading-tight">
                  Mensaje listo con modelo, talla y precio
                </div>
              </div>
            </div>
            <ChevronRight size={18} className="text-emerald-100 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Option 2: Add to Cart and Keep Shopping */}
          <button
            onClick={handleAddToCartAndContinue}
            disabled={addedFeedback}
            className={`w-full py-3.5 px-4 rounded-2xl border transition-all flex items-center justify-between group ${
              addedFeedback
                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                : 'bg-[#151928] hover:bg-[#1C2236] border-white/10 hover:border-mvp-red/50 text-white shadow-md hover:scale-[1.01] active:scale-95'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center">
                {addedFeedback ? (
                  <CheckCircle2 size={20} className="text-emerald-400" />
                ) : (
                  <ShoppingBag size={19} className="text-mvp-red" />
                )}
              </div>
              <div className="text-left">
                <div className="text-sm font-black text-white leading-tight">
                  {addedFeedback ? '¡Guardado en el Carrito! 🎉' : 'Seguir Comprando'}
                </div>
                <div className="text-[10px] text-mvp-silver/70 font-normal leading-tight">
                  Habilita el carrito para que agregues más tenis
                </div>
              </div>
            </div>
            <Sparkles size={16} className="text-mvp-silver/50 group-hover:text-mvp-red transition-colors" />
          </button>
        </div>

        {/* Footer Link to full details */}
        <div className="pt-3 text-center">
          <button
            onClick={handleViewFullDetails}
            className="text-[11px] text-mvp-silver/60 hover:text-white underline underline-offset-2 transition-colors"
          >
            Ver fotos en alta resolución y descripción completa
          </button>
        </div>
      </div>
    </div>
  );
};
