import React, { useState, useEffect } from 'react';
import { X, Star, ShoppingBag, ShieldCheck, Truck, RefreshCw, Zap, Check, Package, MessageSquare, Layers, FileText } from 'lucide-react';
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
    setIsCartOpen 
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

  const currentImage = selectedProduct.images?.[activeImageIndex] || selectedProduct.images?.[0];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div 
        className="relative bg-slate-900 border border-slate-700 rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => setSelectedProduct(null)}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all border border-slate-700"
          title="Cerrar"
        >
          <X size={18} />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 max-h-[90vh] overflow-y-auto">
          
          {/* Left Column: Media Gallery */}
          <div className="md:col-span-6 p-4 sm:p-6 bg-slate-950/60 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-800">
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-inner group">
                <img
                  src={currentImage}
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {selectedProduct.discountPercent && (
                  <div className="absolute top-3 left-3 bg-[#FFDB00] text-slate-950 text-xs font-black px-2.5 py-1 rounded shadow uppercase">
                    {selectedProduct.discountPercent}% AHORRO
                  </div>
                )}
                {selectedProduct.capacity && (
                  <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-md border border-slate-700 text-amber-300 text-xs font-bold px-2 py-1 rounded shadow">
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
                        activeImageIndex === idx ? 'border-blue-500 scale-105 shadow-md' : 'border-slate-800 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Department Store Highlights */}
            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-800 mt-4 text-center">
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                <Truck size={16} className="text-blue-400 mx-auto mb-1" />
                <span className="text-[10px] text-slate-300 font-bold block">Envío Express</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                <ShieldCheck size={16} className="text-emerald-400 mx-auto mb-1" />
                <span className="text-[10px] text-slate-300 font-bold block">Libre de BPA</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                <RefreshCw size={16} className="text-amber-400 mx-auto mb-1" />
                <span className="text-[10px] text-slate-300 font-bold block">Garantía Plastir</span>
              </div>
            </div>
          </div>

          {/* Right Column: Product Specs & Ordering */}
          <div className="md:col-span-6 p-5 sm:p-7 space-y-5 flex flex-col justify-between">
            
            <div className="space-y-4">
              {/* Header Badges */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-black uppercase text-blue-400 tracking-wider">
                  {selectedProduct.department || 'Plásticos & Hogar'}
                </span>
                <div className="flex items-center gap-1 text-amber-400">
                  <Star size={13} className="fill-amber-400" />
                  <span className="text-xs font-bold">{selectedProduct.rating || '5.0'}</span>
                  <span className="text-[11px] text-slate-400">({selectedProduct.reviewsCount || 42} valoraciones)</span>
                </div>
              </div>

              {/* Title & Price */}
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                  {selectedProduct.name}
                </h2>
                
                <div className="flex items-baseline gap-3 mt-2">
                  <span className="text-2xl sm:text-3xl font-black text-amber-300 font-sans">
                    {formatMoney(selectedProduct.price)}
                  </span>
                  {selectedProduct.originalPrice && (
                    <span className="text-sm text-slate-400 line-through">
                      {formatMoney(selectedProduct.originalPrice)}
                    </span>
                  )}
                  <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                    ✔ Stock Central Disponible
                  </span>
                </div>
              </div>

              {/* Color Selector */}
              {selectedProduct.colors && selectedProduct.colors.length > 1 && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                    Color: <span className="text-white font-normal">{selectedColor?.name}</span>
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
                            ? 'bg-blue-600/20 border-blue-500 text-white shadow-sm'
                            : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500'
                        }`}
                      >
                        <span className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ backgroundColor: color.hex }} />
                        <span>{color.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Presentation / Pack Selector */}
              {selectedProduct.sizes && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                    Presentación / Pack: <span className="text-white font-normal">{selectedSize}</span>
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
                            ? 'bg-blue-600 text-white border-blue-400 shadow-md'
                            : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-500'
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
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Cantidad:</label>
                <div className="flex items-center bg-slate-800 border border-slate-700 rounded-xl">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1 text-slate-300 hover:text-white font-black"
                  >
                    -
                  </button>
                  <span className="px-3 py-1 text-sm font-bold text-white">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-1 text-slate-300 hover:text-white font-black"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Technical Specifications Tabs (IKEA Style) */}
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <div className="flex gap-2 border-b border-slate-800 pb-1">
                  <button
                    onClick={() => setActiveTab('specs')}
                    className={`text-xs font-bold pb-1 transition-colors ${
                      activeTab === 'specs' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Ficha Técnica
                  </button>
                  <button
                    onClick={() => setActiveTab('dimensions')}
                    className={`text-xs font-bold pb-1 transition-colors ${
                      activeTab === 'dimensions' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Dimensiones
                  </button>
                  <button
                    onClick={() => setActiveTab('wholesale')}
                    className={`text-xs font-bold pb-1 transition-colors ${
                      activeTab === 'wholesale' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Venta Mayorista B2B
                  </button>
                </div>

                {activeTab === 'specs' && (
                  <div className="space-y-1.5 text-xs text-slate-300 animate-fade-in">
                    <p className="leading-relaxed">{selectedProduct.description}</p>
                    <ul className="space-y-1 pt-1">
                      {selectedProduct.features?.map((feat, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-[11px] text-slate-300">
                          <Check size={13} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {activeTab === 'dimensions' && (
                  <div className="space-y-2 text-xs text-slate-300 bg-slate-950/40 p-3 rounded-xl border border-slate-800 animate-fade-in">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Capacidad:</span>
                      <strong className="text-white">{selectedProduct.capacity || 'Estándar'}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Medidas:</span>
                      <strong className="text-white">{selectedProduct.dimensions || 'Ver empaque'}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Material:</span>
                      <strong className="text-white">{selectedProduct.material || 'Polipropileno Virgen'}</strong>
                    </div>
                  </div>
                )}

                {activeTab === 'wholesale' && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-1.5 text-amber-200 animate-fade-in">
                    <span className="font-bold block text-amber-300">🏢 Condiciones para Empresas & Ferreterías:</span>
                    <p className="text-[11px] leading-relaxed">
                      {selectedProduct.b2bDiscount || 'Descuentos escalonados a partir de 12 unidades. Emitimos Factura con Comprobante Fiscal (NCF B01).'}
                    </p>
                  </div>
                )}
              </div>

            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-3">
              {/* WhatsApp direct order */}
              <button
                onClick={() => {
                  trackProductClick(selectedProduct, 'modal_whatsapp_buy_click');
                  openDirectWhatsAppForProduct(selectedProduct, selectedSize, selectedColor?.name || 'Original');
                  setSelectedProduct(null);
                }}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md hover:scale-[1.02] active:scale-95"
              >
                <MessageSquare size={16} />
                <span>Pedir Directo por WhatsApp</span>
              </button>

              {/* Add to Cart Drawer */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleAddToCartOnly}
                  className="py-3 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow"
                >
                  <ShoppingBag size={15} />
                  <span>Al Carrito</span>
                </button>

                <button
                  onClick={handleBuyNow}
                  className="py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 active:scale-95"
                >
                  <Zap size={15} className="text-amber-300" />
                  <span>Comprar COD</span>
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
