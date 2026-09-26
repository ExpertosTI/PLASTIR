import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, Tag, Truck, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const CartDrawer = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    subtotalDOP,
    totalSavingsDOP,
    couponDiscountDOP,
    activeCoupon,
    applyCoupon,
    removeCoupon,
    setIsCheckoutOpen,
    formatMoney,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponMessage, setCouponMessage] = useState(null);

  if (!isCartOpen) return null;

  const FREE_SHIPPING_THRESHOLD = 4500;
  const progressToFreeShipping = Math.min(100, Math.round((subtotalDOP / FREE_SHIPPING_THRESHOLD) * 100));
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotalDOP);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!couponInput) return;
    const res = applyCoupon(couponInput);
    setCouponMessage(res);
    if (res.success) setCouponInput('');
  };

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const finalTotal = Math.max(0, subtotalDOP - couponDiscountDOP);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10 w-full sm:w-auto">
        <div className="w-full sm:w-screen sm:max-w-md bg-white border-l border-slate-200 shadow-2xl flex flex-col justify-between h-full">
          
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-200 bg-white flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-[#F16100]">
                <ShoppingBag size={18} />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900 uppercase tracking-tight">Tu Carrito</h2>
                <span className="text-xs text-slate-500 font-medium">
                  {cart.length} {cart.length === 1 ? 'artículo seleccionado' : 'artículos seleccionados'}
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Free Shipping Progress (Amazon / Shopify Style) */}
          <div className="bg-slate-50 p-3.5 border-b border-slate-200 flex-shrink-0">
            <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
              <span className="flex items-center gap-1.5 text-slate-700">
                <Truck size={14} className="text-[#F16100]" />
                {progressToFreeShipping >= 100 ? (
                  <strong className="text-emerald-600 font-bold">¡ENVÍO GRATIS APLICADO! 🚚</strong>
                ) : (
                  <>Agrega <strong>{formatMoney(remainingForFreeShipping)}</strong> para Envío Gratis</>
                )}
              </span>
              <span className="text-[#F16100] font-black">{progressToFreeShipping}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-orange-400 to-[#F16100] h-full transition-all duration-500 rounded-full"
                style={{ width: `${progressToFreeShipping}%` }}
              />
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 min-h-0">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
                <div className="w-16 h-16 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center text-[#F16100]">
                  <ShoppingBag size={30} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Tu carrito está vacío</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs">
                    Explora nuestros departamentos de organización y artículos para el hogar.
                  </p>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-6 py-2.5 rounded-xl bg-[#F16100] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#E05300] transition-colors shadow-md"
                >
                  Explorar Catálogo
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.cartItemId}
                  className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-3 flex gap-3 items-center group shadow-sm"
                >
                  {/* Thumbnail */}
                  <img
                    src={item.selectedImage || item.image || item.images?.[0]}
                    alt={item.name}
                    className="w-16 h-16 rounded-xl object-cover bg-slate-50 flex-shrink-0 border border-slate-200"
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate leading-snug">
                      {item.name}
                    </h4>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 my-1">
                      {item.selectedSize && (
                        <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 text-slate-700">
                          {item.selectedSize}
                        </span>
                      )}
                      {item.selectedColor && (
                        <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 truncate text-slate-700">
                          {item.selectedColor}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm font-black text-[#F16100] font-sans">
                        {formatMoney(item.price * item.quantity)}
                      </span>

                      {/* Stepper */}
                      <div className="flex items-center bg-slate-100 border border-slate-200 rounded-lg">
                        <button
                          onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                          className="px-2.5 py-0.5 text-slate-600 hover:text-slate-900 font-black text-xs active:bg-slate-200"
                        >
                          -
                        </button>
                        <span className="px-2 text-xs font-bold text-slate-900">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                          className="px-2.5 py-0.5 text-slate-600 hover:text-slate-900 font-black text-xs active:bg-slate-200"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(item.cartItemId)}
                    className="text-slate-400 hover:text-red-500 p-1.5 rounded transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Area */}
          {cart.length > 0 && (
            <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3 flex-shrink-0">
              
              {/* Coupon Input */}
              <div className="space-y-1">
                {activeCoupon ? (
                  <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-2 rounded-xl text-xs">
                    <div className="flex items-center gap-1.5 text-emerald-700 font-bold truncate">
                      <Tag size={14} className="flex-shrink-0" />
                      <span className="truncate">{activeCoupon.description}</span>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-xs text-slate-500 hover:text-red-500 font-bold px-1 flex-shrink-0"
                    >
                      Quitar
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Cupón (ej: PLASTIR10)"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 uppercase placeholder:normal-case placeholder-slate-400 focus:outline-none focus:border-[#F16100]"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-colors flex-shrink-0"
                    >
                      Aplicar
                    </button>
                  </form>
                )}

                {couponMessage && (
                  <p className={`text-[11px] font-semibold ${couponMessage.success ? 'text-emerald-600' : 'text-red-500'}`}>
                    {couponMessage.message}
                  </p>
                )}
              </div>

              {/* Pricing Breakdown */}
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-bold text-slate-900">{formatMoney(subtotalDOP)}</span>
                </div>

                {totalSavingsDOP > 0 && (
                  <div className="flex justify-between text-[#F16100] font-semibold">
                    <span>Ahorro en Descuentos:</span>
                    <span>-{formatMoney(totalSavingsDOP)}</span>
                  </div>
                )}

                {couponDiscountDOP > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Descuento Cupón:</span>
                    <span>-{formatMoney(couponDiscountDOP)}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
                  <span className="uppercase">Total a Pagar (COD):</span>
                  <span className="text-lg font-black text-[#F16100] font-sans">{formatMoney(finalTotal)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleProceedToCheckout}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#F16100] via-[#FA751A] to-[#F16100] hover:from-[#E05300] hover:to-[#F16100] text-white font-black text-xs uppercase tracking-wider shadow-md shadow-orange-500/25 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <span>CONTINUAR AL PAGO (CONTRA ENTREGA)</span>
                <ArrowRight size={16} />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500 text-center">
                <ShieldCheck size={12} className="text-emerald-600" />
                <span>Pagas en efectivo o transferencia al recibir tus artículos.</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
