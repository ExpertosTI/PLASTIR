import React, { useState, useEffect } from 'react';
import { X, Star, ShoppingBag, ShieldCheck, Truck, RefreshCw, Zap, Check, Package, MessageSquare, Layers, FileText, Bot } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import {
  trackProductView,
  trackProductClick,
  trackCustomerAction,
  trackSizeSelect,
  trackColorSelect,
  trackProductModalDuration,
} from '../utils/tracker';

export const ProductDetailModal = () => {
  const { 
    selectedProduct, 
    setSelectedProduct, 
    addToCart, 
    setIsCheckoutOpen, 
    formatMoney, 
    openDirectWhatsAppForProduct,
    setIsCartOpen,
    openLiveChat
  } = useCart();
  const { currentUser, setIsAuthModalOpen } = useAuth();

  const [selectedSize, setSelectedSize] = useState('1 Unidad');
  const [selectedColor, setSelectedColor] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('specs'); // 'specs', 'dimensions', 'wholesale'

  useEffect(() => {
    if (selectedProduct) {
      trackProductView(selectedProduct);

      const initialVariant = selectedProduct.variants?.[0];
      const defaultColor =
        selectedProduct.initialColor ||
        (initialVariant
          ? { name: initialVariant.code, image: initialVariant.image, variantId: initialVariant.id, sku: initialVariant.sku }
          : (selectedProduct.colors?.[0] || { name: 'Original', image: selectedProduct.images?.[0] }));

      setSelectedSize(selectedProduct.sizes?.[0] || '1 Unidad');
      setSelectedColor(defaultColor);

      let imgIdx = 0;
      if (defaultColor?.image && Array.isArray(selectedProduct.images)) {
        const idx = selectedProduct.images.indexOf(defaultColor.image);
        imgIdx = idx >= 0 ? idx : 0;
      }
      setActiveImageIndex(imgIdx);
      setQuantity(1);
      setActiveTab('specs');
    }
  }, [selectedProduct]);

  useEffect(() => {
    if (!selectedProduct?.id) return;
    const openTime = Date.now();
    const prod = selectedProduct;

    return () => {
      const dur = Math.max(1, Math.round((Date.now() - openTime) / 1000));
      trackProductModalDuration(prod, dur);
    };
  }, [selectedProduct?.id]);

  if (!selectedProduct) return null;

  const handleBuyNow = () => {
    trackProductClick(selectedProduct, 'modal_checkout_cod_click');
    const itemToAdd = {
      ...selectedProduct,
      image: selectedColor?.image || selectedProduct.images?.[activeImageIndex] || selectedProduct.images?.[0],
      selectedImage: selectedColor?.image || selectedProduct.images?.[activeImageIndex] || selectedProduct.images?.[0],
      sku: selectedColor?.sku || selectedProduct.sku,
    };
    addToCart(itemToAdd, selectedSize, selectedColor?.name || 'Original', quantity);
    setSelectedProduct(null);
    setIsCheckoutOpen(true);
  };

  const handleAddToCartOnly = () => {
    const itemToAdd = {
      ...selectedProduct,
      image: selectedColor?.image || selectedProduct.images?.[activeImageIndex] || selectedProduct.images?.[0],
      selectedImage: selectedColor?.image || selectedProduct.images?.[activeImageIndex] || selectedProduct.images?.[0],
      sku: selectedColor?.sku || selectedProduct.sku,
    };
    addToCart(itemToAdd, selectedSize, selectedColor?.name || 'Original', quantity);
    setSelectedProduct(null);
    setIsCartOpen(true);
  };

  const currentImage = selectedColor?.image || selectedProduct.images?.[activeImageIndex] || selectedProduct.images?.[0];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div 
        className="relative bg-white border border-slate-200 rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => setSelectedProduct(null)}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-all border border-slate-200"
          title="Cerrar"
        >
          <X size={18} />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 max-h-[90vh] overflow-y-auto">
          
          {/* Left Column: Media Gallery */}
          <div className="md:col-span-6 p-4 sm:p-6 bg-slate-50/80 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-200">
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-sm group">
                <img
                  src={currentImage}
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {selectedProduct.discountPercent && (
                  <div className="absolute top-3 left-3 bg-[#F16100] text-white text-xs font-black px-2.5 py-1 rounded-lg shadow-sm uppercase tracking-wide">
                    {selectedProduct.discountPercent}% AHORRO
                  </div>
                )}
                {selectedProduct.capacity && (
                  <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md border border-slate-200 text-slate-800 text-xs font-bold px-2.5 py-1 rounded-lg shadow-sm">
                    📐 {selectedProduct.capacity}
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {selectedProduct.images && selectedProduct.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                  {selectedProduct.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                        activeImageIndex === idx ? 'border-[#F16100] scale-105 shadow-md' : 'border-slate-200 opacity-60 hover:opacity-100 bg-white'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Department Store Highlights */}
            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-200 mt-4 text-center">
              <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-sm">
                <Truck size={16} className="text-[#F16100] mx-auto mb-1" />
                <span className="text-[10px] text-slate-800 font-bold block">Envío Express</span>
                <span className="text-[9px] text-slate-400">Todo RD</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-sm">
                <ShieldCheck size={16} className="text-emerald-600 mx-auto mb-1" />
                <span className="text-[10px] text-slate-800 font-bold block">Libre de BPA</span>
                <span className="text-[9px] text-slate-400">100% Virgen</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-sm">
                <RefreshCw size={16} className="text-amber-500 mx-auto mb-1" />
                <span className="text-[10px] text-slate-800 font-bold block">Garantía Plastir</span>
                <span className="text-[9px] text-slate-400">Calidad Total</span>
              </div>
            </div>
          </div>

          {/* Right Column: Product Specs & Ordering */}
          <div className="md:col-span-6 p-5 sm:p-7 space-y-5 flex flex-col justify-between bg-white">
            
            <div className="space-y-4">
              {/* Header Badges */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-black uppercase text-[#F16100] tracking-wider">
                  {selectedProduct.department || selectedProduct.category || 'Plásticos & Hogar'}
                </span>
                <div className="flex items-center gap-1 text-amber-500">
                  <Star size={13} className="fill-amber-400" />
                  <span className="text-xs font-bold text-slate-800">{selectedProduct.rating || '5.0'}</span>
                  <span className="text-[11px] text-slate-400">({selectedProduct.reviewsCount || 42} valoraciones)</span>
                </div>
              </div>

              {/* Title & Price */}
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                  {selectedProduct.name}
                </h2>
                
                <div className="flex items-baseline gap-3 mt-2">
                  <span className="text-2xl sm:text-3xl font-black text-[#F16100] font-sans">
                    {formatMoney(selectedProduct.price)}
                  </span>
                  {selectedProduct.originalPrice && (
                    <span className="text-sm text-slate-400 line-through">
                      {formatMoney(selectedProduct.originalPrice)}
                    </span>
                  )}
                  <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                    ✔ Stock Disponible
                  </span>
                </div>
              </div>

              {/* Color Selector */}
              {selectedProduct.colors && selectedProduct.colors.length > 1 && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
                    Color: <span className="text-slate-900 font-semibold">{selectedColor?.name}</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.colors.map((color) => (
                      <button
                        key={color.name}
                        onClick={() => {
                          setSelectedColor(color);
                          trackColorSelect(color.name, selectedProduct);
                        }}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                          selectedColor?.name === color.name
                            ? 'bg-orange-50 border-[#F16100] text-[#F16100] ring-2 ring-[#F16100]/20 shadow-sm'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <span className="w-3.5 h-3.5 rounded-full border border-black/10" style={{ backgroundColor: color.hex }} />
                        <span>{color.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Presentation / Pack Selector */}
              {selectedProduct.sizes && selectedProduct.sizes.length > 0 && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
                    Presentación / Pack: <span className="text-slate-900 font-semibold">{selectedSize}</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => {
                          setSelectedSize(size);
                          trackSizeSelect(size, selectedProduct);
                        }}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                          selectedSize === size
                            ? 'bg-[#F16100] text-white border-[#F16100] shadow-sm'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="flex items-center gap-3 pt-1">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Cantidad:</label>
                <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl overflow-hidden shadow-inner">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 font-black transition-colors"
                  >
                    -
                  </button>
                  <span className="px-3 py-1.5 text-xs font-bold text-slate-900 font-mono">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 font-black transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Technical Specifications Tabs */}
              <div className="pt-2 border-t border-slate-200 space-y-2">
                <div className="flex gap-4 border-b border-slate-200 pb-1">
                  <button
                    onClick={() => setActiveTab('specs')}
                    className={`text-xs font-bold pb-1.5 transition-colors ${
                      activeTab === 'specs' ? 'text-[#F16100] border-b-2 border-[#F16100]' : 'text-slate-400 hover:text-slate-700'
                    }`}
                  >
                    Detalles
                  </button>
                  <button
                    onClick={() => setActiveTab('dimensions')}
                    className={`text-xs font-bold pb-1.5 transition-colors ${
                      activeTab === 'dimensions' ? 'text-[#F16100] border-b-2 border-[#F16100]' : 'text-slate-400 hover:text-slate-700'
                    }`}
                  >
                    Medidas
                  </button>
                  <button
                    onClick={() => setActiveTab('shipping')}
                    className={`text-xs font-bold pb-1.5 transition-colors ${
                      activeTab === 'shipping' ? 'text-[#0058A3] border-b-2 border-[#0058A3]' : 'text-slate-400 hover:text-slate-700'
                    }`}
                  >
                    Envío & Garantía
                  </button>
                </div>

                {activeTab === 'specs' && (
                  <div className="space-y-1.5 text-xs text-slate-600 animate-fade-in">
                    <p className="leading-relaxed">{selectedProduct.description}</p>
                    <ul className="space-y-1 pt-1">
                      {selectedProduct.features?.map((feat, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-[11px] text-slate-600">
                          <Check size={13} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {activeTab === 'dimensions' && (
                  <div className="space-y-2 text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 animate-fade-in">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Capacidad:</span>
                      <strong className="text-slate-900">{selectedProduct.capacity || 'Estándar'}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Medidas:</span>
                      <strong className="text-slate-900">{selectedProduct.dimensions || 'Ver empaque'}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Material:</span>
                      <strong className="text-slate-900">{selectedProduct.material || 'Polipropileno Virgen Libre de BPA'}</strong>
                    </div>
                  </div>
                )}

                {activeTab === 'shipping' && (
                  <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 text-xs space-y-2 text-slate-700 animate-fade-in">
                    <div className="flex items-center gap-2 text-blue-900 font-bold">
                      <Truck size={14} className="text-blue-600" />
                      <span>🚚 Envío Rápido a Domicilio:</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-slate-600">
                      Entregas en 2 a 4 horas en el Distrito Nacional y Santo Domingo. Envíos en 24-48 horas a todo el país con entrega en tu puerta.
                    </p>
                    <div className="flex items-center gap-2 text-emerald-900 font-bold pt-1">
                      <ShieldCheck size={14} className="text-emerald-600" />
                      <span>💵 Pago Contra Entrega Seguro:</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-slate-600">
                      Pagas en efectivo o transferencia únicamente cuando recibes y verificas tus productos.
                    </p>
                  </div>
                )}
              </div>

            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-3">
              {/* Primary: Comprar con Pago Contra Entrega */}
              <button
                onClick={handleBuyNow}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-orange-500 via-[#C2410C] to-[#9A3412] hover:from-orange-600 hover:to-[#7C2D12] text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 active:scale-98"
              >
                <Zap size={16} />
                <span>Comprar con Pago Contra Entrega (Pagas al Recibir)</span>
              </button>

              {/* Secondary Row: Add to cart & Consultar con Plastir AI */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleAddToCartOnly}
                  className="py-3 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <ShoppingBag size={15} />
                  <span>Al Carrito</span>
                </button>

                <button
                  onClick={() => {
                    openLiveChat(selectedProduct);
                  }}
                  className="py-3 rounded-xl bg-orange-50/80 hover:bg-orange-100 border border-orange-200 text-[#C2410C] font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <Bot size={15} className="text-[#C2410C]" />
                  <span>Consultar con AI</span>
                </button>
              </div>

              {/* Discrete WhatsApp Order */}
              <button
                onClick={() => {
                  trackProductClick(selectedProduct, 'modal_whatsapp_buy_click');
                  openDirectWhatsAppForProduct(selectedProduct, selectedSize, selectedColor?.name || 'Original');
                }}
                className="w-full py-2 text-slate-500 hover:text-emerald-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <MessageSquare size={13} className="text-emerald-600" />
                <span>¿Prefieres ordenar directo por WhatsApp? Haz clic aquí</span>
              </button>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;
