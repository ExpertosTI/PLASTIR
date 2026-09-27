import React, { useState, useEffect } from 'react';
import { 
  X, 
  Search, 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Phone, 
  MessageSquare, 
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { useCart } from '../context/CartContext';

const STATUS_STEPS = [
  { id: 'received', title: 'Pedido Recibido', desc: 'Confirmado en sistema', icon: Clock },
  { id: 'preparing', title: 'Empacando en Almacén', desc: 'Artículos embalados y verificados', icon: Package },
  { id: 'shipped', title: 'En Ruta de Entrega', desc: 'Repartidor en camino a tu dirección', icon: Truck },
  { id: 'delivered', title: 'Entregado con Éxito', desc: 'Pago contra entrega recibido', icon: CheckCircle2 },
];

export const OrderTracker = () => {
  const { isTrackerOpen, setIsTrackerOpen, currentTrackingId, formatMoney } = useCart();
  const [searchInput, setSearchInput] = useState(currentTrackingId || '');
  const [orderData, setOrderData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (currentTrackingId) {
      setSearchInput(currentTrackingId);
      fetchOrder(currentTrackingId);
    }
  }, [currentTrackingId, isTrackerOpen]);

  const fetchOrder = async (trackingIdToFind) => {
    const cleanId = trackingIdToFind.trim().toUpperCase().replace('#', '');
    if (!cleanId) return;

    setIsLoading(true);
    setNotFound(false);

    try {
      // 1. Try server API
      const res = await fetch(`/api/orders/${cleanId}`);
      if (res.ok) {
        const data = await res.json();
        setOrderData(data);
        setIsLoading(false);
        return;
      }
    } catch {
      // API fallback
    }

    // 2. Try localStorage fallback
    const savedOrders = JSON.parse(localStorage.getItem('plastir_orders') || localStorage.getItem('mvpflow_orders') || '[]');
    const found = savedOrders.find(
      (o) => o.trackingId && (o.trackingId.toUpperCase() === cleanId || o.trackingId.toUpperCase() === `PLASTIR-${cleanId}` || o.trackingId.toUpperCase() === `MVP-${cleanId}`)
    );

    if (found) {
      setOrderData(found);
    } else {
      setNotFound(true);
      setOrderData(null);
    }
    setIsLoading(false);
  };

  if (!isTrackerOpen) return null;

  const currentStepIndex = orderData 
    ? STATUS_STEPS.findIndex((s) => s.id === (orderData.status || 'received'))
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col animate-fade-in">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-[#F16100]">
              <Truck size={18} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-tight">
                Rastreo de Pedido en Vivo
              </h2>
              <span className="text-[11px] text-slate-500">Consulta el estado de despacho de tu orden Plastir</span>
            </div>
          </div>
          <button
            onClick={() => setIsTrackerOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Search Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchOrder(searchInput);
            }}
            className="flex gap-2"
          >
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Ingresa tu número de Pedido (Ej: PLASTIR-582910)"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-[#F16100] focus:bg-white rounded-xl pl-9 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 font-mono placeholder-slate-400 focus:outline-none uppercase transition-colors"
              />
              <Search size={16} className="absolute left-3 top-3 text-slate-400" />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 bg-[#F16100] hover:bg-[#E05300] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center gap-1.5"
            >
              <span>{isLoading ? 'Buscando...' : 'Rastrear'}</span>
            </button>
          </form>

          {notFound && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center space-y-2">
              <Package size={32} className="text-slate-400 mx-auto" />
              <h3 className="text-sm font-bold text-slate-900">No encontramos el pedido #{searchInput}</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Verifica que el número sea correcto o contáctanos por WhatsApp para consultar con nuestro equipo de entregas.
              </p>
            </div>
          )}

          {orderData && (
            <div className="space-y-6 animate-fade-in">
              {/* Top Order Badge */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] text-slate-500 block">Número de Pedido:</span>
                  <h3 className="text-lg sm:text-xl font-black text-[#F16100] font-mono">
                    #{orderData.trackingId}
                  </h3>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-[11px] text-slate-500 block">Fecha:</span>
                  <span className="text-xs font-bold text-slate-700">
                    {orderData.createdAt ? new Date(orderData.createdAt).toLocaleDateString('es-DO', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    }) : 'Reciente'}
                  </span>
                </div>
              </div>

              {/* Status Timeline Stepper */}
              <div className="space-y-2">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Progreso de Entrega
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                  {STATUS_STEPS.map((step, idx) => {
                    const StepIcon = step.icon;
                    const isCompleted = idx <= (currentStepIndex === -1 ? 0 : currentStepIndex);
                    const isCurrent = idx === (currentStepIndex === -1 ? 0 : currentStepIndex);

                    return (
                      <div
                        key={step.id}
                        className={`p-3 rounded-2xl border text-center transition-all ${
                          isCurrent
                            ? 'bg-orange-50 border-[#F16100] text-slate-900 shadow-sm scale-102'
                            : isCompleted
                            ? 'bg-emerald-50/60 border-emerald-300 text-slate-800'
                            : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 ${
                            isCurrent
                              ? 'bg-[#F16100] text-white shadow-sm'
                              : isCompleted
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-200 text-slate-500'
                          }`}
                        >
                          <StepIcon size={16} />
                        </div>
                        <h5 className="text-[11px] font-black leading-tight text-slate-900">{step.title}</h5>
                        <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">{step.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Delivery Destination */}
              {orderData.shipping && (
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <MapPin size={14} className="text-[#F16100]" />
                      <span>Destino: {orderData.shipping.provinceName || orderData.shipping.municipality || 'Santo Domingo'}</span>
                    </span>
                    <span className="text-[11px] bg-white border border-slate-200 px-2 py-0.5 rounded-md text-slate-600 font-semibold">
                      {orderData.shipping.estimatedDelivery || 'Entrega estándar'}
                    </span>
                  </div>

                  {orderData.shipping.address && (
                    <p className="text-xs text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200">
                      📍 <strong>Dirección:</strong> {orderData.shipping.address}
                    </p>
                  )}
                </div>
              )}

              {/* Items in Order */}
              {orderData.items && orderData.items.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    Artículos del Pedido ({orderData.items.length})
                  </h4>

                  <div className="space-y-2">
                    {orderData.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200"
                      >
                        {item.image && (
                          <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover bg-white border border-slate-200" />
                        )}
                        <div className="flex-1 min-w-0">
                          <h5 className="text-xs font-bold text-slate-900 truncate">{item.name}</h5>
                          <span className="text-[11px] text-slate-500">
                            {item.quantity}x {item.size ? `| ${item.size}` : ''} {item.color ? `| ${item.color}` : ''}
                          </span>
                        </div>
                        <span className="text-xs font-black text-[#F16100]">
                          {formatMoney(Number(item.price || 0) * Number(item.quantity || 1))}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Total */}
                  {orderData.payment && (
                    <div className="flex justify-between items-center bg-slate-100 p-3 rounded-xl border border-slate-200 mt-2">
                      <span className="text-xs font-bold text-slate-700 uppercase">Total al Recibir:</span>
                      <span className="text-base font-black text-[#F16100]">
                        {formatMoney(orderData.payment.total)}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* WhatsApp Support Button */}
              <div className="pt-2">
                <a
                  href={`https://wa.me/18096560219?text=${encodeURIComponent(`¡Hola PLASTIR RD! Quisiera consultar sobre el estado de mi pedido #${orderData.trackingId}`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  <MessageSquare size={16} />
                  <span>Consultar Estado por WhatsApp</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderTracker;
