import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, Tag, Truck, ShieldCheck, Zap, MessageSquare } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10 w-full sm:w-auto">
        <div className="w-full sm:w-screen sm:max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col justify-between h-full">
          
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <ShoppingBag size={20} className="text-blue-400" />
              <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-wider">Tu Carrito de Compras</h2>
              <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full font-bold">
                {cart.length} {cart.length === 1 ? 'artículo' : 'artículos'}
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Free Shipping Progress (Shopify Style) */}
          <div className="bg-slate-850 p-3 border-b border-slate-800 flex-shrink-0">
            <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
              <span className="flex items-center gap-1.5 text-slate-200">
                <Truck size={14} className="text-blue-400" />
                {progressToFreeShipping >= 100 ? (
                  <strong className="text-emerald-400 font-bold">¡ENVÍO GRATIS DESBLOQUEADO! 🎉</strong>
                ) : (
                  <>Agrega <strong>{formatMoney(remainingForFreeShipping)}</strong> para Envío Gratis</>
                )}
              </span>
              <span className="text-amber-400 font-bold">{progressToFreeShipping}%</span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-700">
              <div
                className="bg-gradient-to-r from-blue-500 via-sky-400 to-emerald-400 h-full transition-all duration-500"
                style={{ width: `${progressToFreeShipping}%` }}
              />
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 min-h-0">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
                <div className="w-16 h-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
                  <ShoppingBag size={32} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Tu carrito está vacío</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs">
                    Explora los departamentos de Plastir y descubre soluciones para organizar tu espacio.
                  </p>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-blue-500 transition-colors shadow-md"
                >
                  Explorar Catálogo
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.cartItemId}
                  className="bg-slate-800/80 border border-slate-700 rounded-2xl p-3 flex gap-3 items-center group shadow-sm"
                >
                  {/* Thumbnail */}
                  <img
                    src={item.selectedImage || item.image || item.images?.[0]}
                    alt={item.name}
                    className="w-16 h-16 rounded-xl object-cover bg-slate-900 flex-shrink-0 border border-slate-700"
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-white truncate leading-snug">
                      {item.name}
                    </h4>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 my-1">
                      {item.selectedSize && (
                        <span className="bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700 text-slate-200">
                          {item.selectedSize}
                        </span>
                      )}
                      {item.selectedColor && (
                        <span className="bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700 truncate text-slate-200">
                          {item.selectedColor}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm font-black text-amber-300 font-sans">
                        {formatMoney(item.price * item.quantity)}
                      </span>

                      {/* Stepper */}
                      <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg">
                        <button
                          onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                          className="px-2.5 py-1 text-slate-300 hover:text-white font-black text-xs active:bg-slate-800"
                        >
                          -
                        </button>
                        <span className="px-2 text-xs font-bold text-white">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                          className="px-2.5 py-1 text-slate-300 hover:text-white font-black text-xs active:bg-slate-800"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(item.cartItemId)}
                    className="text-slate-500 hover:text-red-400 p-1.5 rounded transition-colors"
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
            <div className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800 space-y-3 flex-shrink-0 pb-6 sm:pb-4">
              
              {/* Coupon Input */}
              <div className="space-y-1">
                {activeCoupon ? (
                  <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/40 p-2 rounded-xl text-xs">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-bold truncate">
                      <Tag size={14} className="flex-shrink-0" />
                      <span className="truncate">{activeCoupon.description}</span>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-xs text-slate-400 hover:text-red-400 font-bold px-1 flex-shrink-0"
                    >
                      Quitar
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Cupón de descuento (ej: PLASTIR10)"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white uppercase placeholder:normal-case placeholder-slate-400 focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-white text-xs font-bold rounded-xl transition-colors flex-shrink-0"
                    >
                      Aplicar
                    </button>
                  </form>
                )}

                {couponMessage && (
                  <p className={`text-[11px] font-semibold ${couponMessage.success ? 'text-emerald-400' : 'text-red-400'}`}>
                    {couponMessage.message}
                  </p>
                )}
              </div>

              {/* Pricing Breakdown */}
              <div className="space-y-1 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-bold text-white">{formatMoney(subtotalDOP)}</span>
                </div>

                {totalSavingsDOP > 0 && (
                  <div className="flex justify-between text-amber-300 font-semibold">
                    <span>Ahorro en Descuentos:</span>
                    <span>-{formatMoney(totalSavingsDOP)}</span>
                  </div>
                )}

                {couponDiscountDOP > 0 && (
                  <div className="flex justify-between text-emerald-400 font-semibold">
                    <span>Descuento Cupón:</span>
                    <span>-{formatMoney(couponDiscountDOP)}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm font-black text-white pt-1.5 border-t border-slate-800">
                  <span className="uppercase">Total a Pagar (COD):</span>
                  <span className="text-base sm:text-xl text-amber-300 font-sans">{formatMoney(finalTotal)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleProceedToCheckout}
                className="w-full py-3.5 sm:py-4 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-blue-600 text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-blue-600/30 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Zap size={16} className="text-amber-300" />
                <span>FINALIZAR PEDIDO (PAGO CONTRA ENTREGA)</span>
                <ArrowRight size={16} />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 text-center">
                <ShieldCheck size={12} className="text-emerald-400" />
                <span>Pagas en efectivo al recibir y verificar tus artículos.</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
