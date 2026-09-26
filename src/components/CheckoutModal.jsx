import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Phone, 
  User, 
  ShieldCheck, 
  Zap, 
  Navigation, 
  Truck,
  CheckCircle2,
  Package
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { RD_PROVINCES, getZoneByProvince, getShippingCost } from '../data/locationsRD';

export const CheckoutModal = () => {
  const {
    cart,
    isCheckoutOpen,
    setIsCheckoutOpen,
    clearCart,
    subtotalDOP,
    couponDiscountDOP,
    activeCoupon,
    setCurrentTrackingId,
    setIsTrackerOpen,
    formatMoney,
  } = useCart();

  if (!isCheckoutOpen) return null;

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [provinceId, setProvinceId] = useState('dn');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [deliveryType, setDeliveryType] = useState('express'); // 'express', 'national', 'pickup'
  const GPS_STORAGE_KEY = 'plastir_gps_location';
  const [gpsLocation, setGpsLocation] = useState(() => {
    try {
      const saved = localStorage.getItem(GPS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const [isGettingGps, setIsGettingGps] = useState(false);
  const [gpsToast, setGpsToast] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const selectedProvince = RD_PROVINCES.find((p) => p.id === provinceId) || RD_PROVINCES[0];
  const selectedZone = getZoneByProvince(provinceId);
  const rawShipping = deliveryType === 'pickup' ? 0 : getShippingCost(provinceId);
  const shippingFee = activeCoupon?.freeShipping ? 0 : rawShipping;
  const totalToPay = Math.max(0, subtotalDOP - couponDiscountDOP + shippingFee);

  const handleCaptureGPS = () => {
    if (!navigator.geolocation) {
      setGpsToast('⚠️ Tu navegador no soporta geolocalización.');
      setTimeout(() => setGpsToast(null), 3000);
      return;
    }
    setIsGettingGps(true);
    setGpsToast('📡 Obteniendo tu ubicación exacta...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setGpsLocation(loc);
        setIsGettingGps(false);
        setGpsToast('✅ ¡Ubicación guardada! Se adjuntará al pedido de Plastir.');
        setTimeout(() => setGpsToast(null), 3500);
        try { localStorage.setItem(GPS_STORAGE_KEY, JSON.stringify(loc)); } catch {}
      },
      () => {
        setIsGettingGps(false);
        setGpsToast('❌ No se pudo obtener la ubicación. Verifica los permisos.');
        setTimeout(() => setGpsToast(null), 4000);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setFormError(null);
    if (!name.trim() || !phone.trim() || (deliveryType !== 'pickup' && !address.trim())) {
      setFormError('Por favor completa tu nombre, teléfono y dirección de entrega.');
      return;
    }

    setIsSubmitting(true);
    const trackingId = `PLASTIR-${Math.floor(100000 + Math.random() * 900000)}`;

    const orderPayload = {
      trackingId,
      createdAt: new Date().toISOString(),
      status: 'received',
      customer: {
        name: name.trim(),
        phone: phone.trim(),
      },
      deliveryType,
      shipping: {
        provinceId,
        provinceName: selectedProvince.name,
        zoneName: selectedZone.name,
        estimatedDelivery: deliveryType === 'pickup' ? 'Retiro inmediato en Almacén' : selectedZone.estimatedDelivery,
        municipality: selectedProvince.municipalities[0] || 'Centro',
        address: address.trim(),
        notes: notes.trim(),
        gpsLocation,
      },
      payment: {
        method: 'cash_cod',
        subtotal: subtotalDOP,
        discount: couponDiscountDOP,
        couponCode: activeCoupon?.code || null,
        shippingFee,
        total: totalToPay,
      },
      items: cart.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        size: item.selectedSize,
        color: item.selectedColor,
        image: item.selectedImage || item.image || item.images?.[0],
      })),
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
    } catch {
      // Offline fallback: save locally immediately
      const existing = JSON.parse(localStorage.getItem('plastir_orders') || '[]');
      existing.unshift(orderPayload);
      localStorage.setItem('plastir_orders', JSON.stringify(existing));
    }

    setIsSubmitting(false);
    clearCart();
    setIsCheckoutOpen(false);
    setCurrentTrackingId(trackingId);
    setIsTrackerOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border-2 border-blue-500/40 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[95vh] flex flex-col animate-fade-in">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <Package size={20} className="text-blue-400" />
            <div>
              <h2 className="text-sm sm:text-base font-black text-white uppercase tracking-wider">
                Confirmar Pedido // Plastir RD
              </h2>
              <span className="text-[11px] text-emerald-400 font-bold block">
                ⚡ Pagas en efectivo al recibir en tu puerta (COD)
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsCheckoutOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmitOrder} className="p-4 sm:p-5 space-y-4 overflow-y-auto">
          
          {/* Nombre */}
          <div>
            <label className="text-[11px] text-slate-200 font-bold block mb-1">
              ¿A nombre de quién entregamos? *
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="Nombre y Apellido o Empresa"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
              <User size={14} className="absolute left-3 top-3 text-slate-400" />
            </div>
          </div>

          {/* Teléfono */}
          <div>
            <label className="text-[11px] text-slate-200 font-bold block mb-1">
              Teléfono / WhatsApp para coordinar *
            </label>
            <div className="relative">
              <input
                type="tel"
                required
                placeholder="Ej: 809-555-0199"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
              <Phone size={14} className="absolute left-3 top-3 text-slate-400" />
            </div>
          </div>

          {/* Método de Entrega */}
          <div>
            <label className="text-[11px] text-slate-200 font-bold block mb-1.5">
              Tipo de Entrega:
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setDeliveryType('express')}
                className={`p-2.5 rounded-xl border text-left flex flex-col gap-0.5 transition-all ${
                  deliveryType === 'express'
                    ? 'bg-blue-600/20 border-blue-400 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <span className="font-bold">🚚 A Domicilio</span>
                <span className="text-[10px] text-slate-400">Entrega rápida en RD</span>
              </button>

              <button
                type="button"
                onClick={() => setDeliveryType('pickup')}
                className={`p-2.5 rounded-xl border text-left flex flex-col gap-0.5 transition-all ${
                  deliveryType === 'pickup'
                    ? 'bg-blue-600/20 border-blue-400 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <span className="font-bold">🏢 Retiro en Almacén</span>
                <span className="text-[10px] text-emerald-400 font-semibold">Gratis (Sin costo de envío)</span>
              </button>
            </div>
          </div>

          {/* Provincia & Dirección */}
          {deliveryType !== 'pickup' && (
            <>
              <div>
                <label className="text-[11px] text-slate-200 font-bold block mb-1">
                  Provincia o Zona de Entrega:
                </label>
                <div className="relative">
                  <select
                    value={provinceId}
                    onChange={(e) => setProvinceId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none appearance-none"
                  >
                    {RD_PROVINCES.map((prov) => (
                      <option key={prov.id} value={prov.id}>
                        {prov.name} ({prov.estimatedHours}) — RD$ {prov.fee}
                      </option>
                    ))}
                  </select>
                  <MapPin size={14} className="absolute left-3 top-3 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] text-slate-200 font-bold block">
                    Dirección exacta y puntos de referencia *
                  </label>
                  <button
                    type="button"
                    onClick={handleCaptureGPS}
                    disabled={isGettingGps}
                    className="text-[10px] text-blue-400 hover:text-white font-bold flex items-center gap-1 bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700"
                  >
                    <Navigation size={10} />
                    <span>{isGettingGps ? 'Localizando...' : gpsLocation ? '📍 GPS Listo' : 'Usar GPS'}</span>
                  </button>
                </div>
                <textarea
                  required
                  rows={2}
                  placeholder="Calle, número de casa/apartamento, sector y referencia (ej: frente al parque)..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none resize-none"
                />
                {gpsToast && (
                  <p className="text-[10px] text-amber-300 font-mono mt-1">{gpsToast}</p>
                )}
              </div>
            </>
          )}

          {/* Resumen Económico */}
          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-300">
              <span>Subtotal ({cart.length} productos):</span>
              <span className="font-bold text-white">{formatMoney(subtotalDOP)}</span>
            </div>
            {couponDiscountDOP > 0 && (
              <div className="flex justify-between text-emerald-400 font-semibold">
                <span>Descuento Cupón:</span>
                <span>-{formatMoney(couponDiscountDOP)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-300">
              <span>Envío ({deliveryType === 'pickup' ? 'Retiro en Tienda' : selectedProvince.name}):</span>
              <span className="font-bold text-white">
                {shippingFee === 0 ? <strong className="text-emerald-400">GRATIS</strong> : formatMoney(shippingFee)}
              </span>
            </div>
            <div className="flex justify-between text-sm font-black text-white pt-1.5 border-t border-slate-800">
              <span className="uppercase">Total a Pagar (Contra Entrega):</span>
              <span className="text-base sm:text-lg text-amber-300 font-sans">{formatMoney(totalToPay)}</span>
            </div>
          </div>

          {formError && (
            <p className="text-xs text-red-400 font-bold bg-red-500/10 p-2 rounded-xl border border-red-500/30">
              {formError}
            </p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-blue-600 text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-blue-600/30 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <Zap size={16} className="text-amber-300" />
            <span>{isSubmitting ? 'Procesando Pedido...' : 'CONFIRMAR Y ENVIAR PEDIDO'}</span>
          </button>

          <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 text-center">
            <ShieldCheck size={13} className="text-emerald-400" />
            <span>Sin pagos por adelantado. Pagas en efectivo al recibir y revisar.</span>
          </div>

        </form>
      </div>
    </div>
  );
};
