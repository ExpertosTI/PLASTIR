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

  const [selectedSize, setSelectedSize] = useState('Estándar');
  const [selectedColor, setSelectedColor] = useState({ name: 'Original' });
  const [addedFeedback, setAddedFeedback] = useState(false);

  useEffect(() => {
    if (quickChoiceProduct) {
      setSelectedSize(
        quickChoiceProduct.initialSize ||
          (quickChoiceProduct.sizes && quickChoiceProduct.sizes[0]) ||
          'Estándar'
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
    '/logo.PNG';

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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full sm:max-w-lg bg-white border border-slate-200 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl text-slate-900 relative animate-scale-up max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full flex items-center gap-1">
              <Zap size={12} className="fill-emerald-600 text-emerald-600" />
              Pedido Rápido en 1 Paso
            </span>
          </div>
          <button
            onClick={() => setQuickChoiceProduct(null)}
            className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Product Card Row */}
        <div className="flex items-center gap-3.5 py-4">
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-slate-50 border border-slate-200 flex-shrink-0">
            <img
              src={displayImage}
              alt={quickChoiceProduct.name}
              className="w-full h-full object-cover"
            />
            {quickChoiceProduct.discountPercent && (
              <span className="absolute top-1 left-1 bg-[#F16100] text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow">
                -{quickChoiceProduct.discountPercent}%
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 line-clamp-2 leading-snug">
              {quickChoiceProduct.name}
            </h3>

            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-lg sm:text-xl font-black text-[#F16100]">
                {formatMoney(quickChoiceProduct.price)}
              </span>
              {quickChoiceProduct.originalPrice > quickChoiceProduct.price && (
                <span className="text-xs text-slate-400 line-through">
                  {formatMoney(quickChoiceProduct.originalPrice)}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 mt-1.5 text-[11px] text-emerald-600 font-medium">
              <span className="flex items-center gap-1">
                <Truck size={12} /> Envío Express RD
              </span>
              <span className="flex items-center gap-1 text-slate-500">
                <ShieldCheck size={12} className="text-emerald-600" /> Pago al recibir (COD)
              </span>
            </div>
          </div>
        </div>

        {/* Size Selection */}
        {quickChoiceProduct.sizes && quickChoiceProduct.sizes.length > 0 && (
          <div className="py-2.5 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-slate-600 font-bold">Presentación / Medida:</span>
              <span className="text-slate-900 font-mono font-bold bg-slate-100 px-2 py-0.5 rounded text-[11px]">
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
                      ? 'bg-[#F16100] text-white border-[#F16100] shadow-sm scale-105'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Color Selection if variants exist */}
        {quickChoiceProduct.colors && quickChoiceProduct.colors.length > 1 && (
          <div className="py-2.5 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-slate-600 font-bold">Color:</span>
              <span className="text-slate-900 font-bold text-[11px]">{selectedColor?.name || ''}</span>
            </div>
            <div className="flex items-center gap-2">
              {quickChoiceProduct.colors.map((c) => (
                <button
                  key={c.name}
                  onClick={() => setSelectedColor(c)}
                  className={`w-6 h-6 rounded-full border-2 transition-all ${
                    selectedColor?.name === c.name
                      ? 'ring-2 ring-[#F16100] border-white scale-110 shadow-sm'
                      : 'border-slate-300 opacity-70'
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
          </div>
        )}

        {/* The 2 Primary Action Choices */}
        <div className="space-y-2.5 pt-4 border-t border-slate-100">
          <p className="text-center text-xs text-slate-500 font-semibold mb-1">
            ¿Cómo deseas continuar?
          </p>

          {/* Option 1: Direct WhatsApp */}
          <button
            onClick={handleWhatsAppDirect}
            className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm uppercase tracking-wider shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.01] active:scale-95 flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                <MessageCircle size={20} className="fill-white text-white" />
              </div>
              <div className="text-left">
                <div className="text-sm font-bold text-white leading-tight">
                  Pedir por WhatsApp Directamente
                </div>
                <div className="text-[10px] text-emerald-100 font-normal leading-tight">
                  Mensaje listo con artículo, precio y entrega
                </div>
              </div>
            </div>
            <ChevronRight size={18} className="text-emerald-200 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Option 2: Add to Cart */}
          <button
            onClick={handleAddToCartAndContinue}
            className={`w-full py-3.5 px-4 rounded-2xl border transition-all flex items-center justify-between group ${
              addedFeedback
                ? 'bg-emerald-500 text-white border-emerald-500 shadow-md'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                  addedFeedback ? 'bg-white/20 text-white' : 'bg-orange-50 text-[#F16100]'
                }`}
              >
                {addedFeedback ? <CheckCircle2 size={20} /> : <ShoppingBag size={18} />}
              </div>
              <div className="text-left">
                <div className="text-sm font-bold leading-tight">
                  {addedFeedback ? '¡Agregado al Carrito!' : 'Agregar y Seguir Explorando'}
                </div>
                <div className="text-[10px] text-slate-500 font-normal leading-tight">
                  Guarda en el carrito para ordenar varios productos juntos
                </div>
              </div>
            </div>
            <ChevronRight size={18} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Option 3: View Full Details */}
          <button
            onClick={handleViewFullDetails}
            className="w-full py-2 text-center text-xs font-semibold text-slate-500 hover:text-[#F16100] transition-colors"
          >
            Ver fotos grandes y ficha técnica completa →
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickProductActionModal;
