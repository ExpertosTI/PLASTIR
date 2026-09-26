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
  { id: 'preparing', title: 'Empacando en Boutique', desc: 'Prendas empacadas y revisadas', icon: Package },
  { id: 'shipped', title: 'En Ruta con Mensajero', desc: 'Delivery en camino a tu dirección', icon: Truck },
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
    const savedOrders = JSON.parse(localStorage.getItem('mvpflow_orders') || '[]');
    const found = savedOrders.find(
      (o) => o.trackingId.toUpperCase() === cleanId || o.trackingId.toUpperCase() === `MVP-${cleanId}`
    );

    if (found) {
      setOrderData(found);
    } else {
      // Create mock preview if searching
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-mvp-card via-mvp-dark to-mvp-black border border-mvp-cardHover rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-mvp-cardHover bg-mvp-dark flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck size={20} className="text-mvp-red" />
            <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-wider">
              Rastreo de Autopedido en Vivo
            </h2>
          </div>
          <button
            onClick={() => setIsTrackerOpen(false)}
            className="p-1.5 text-mvp-muted hover:text-white rounded-lg hover:bg-mvp-card transition-colors"
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
                placeholder="Ingresa tu número de Ticket (Ej: MVP-582910)"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full bg-mvp-black border border-mvp-cardHover focus:border-mvp-red rounded-xl pl-9 pr-4 py-3 text-xs sm:text-sm text-white font-mono placeholder-mvp-muted focus:outline-none uppercase"
              />
              <Search size={16} className="absolute left-3 top-3.5 text-mvp-muted" />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-3 bg-mvp-red hover:bg-mvp-darkRed text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-glow-sm flex items-center gap-1.5"
            >
              <span>{isLoading ? 'Buscando...' : 'Rastrear'}</span>
            </button>
          </form>

          {notFound && (
            <div className="bg-mvp-dark/80 border border-mvp-cardHover rounded-2xl p-6 text-center space-y-2">
              <Package size={32} className="text-mvp-muted mx-auto" />
              <h3 className="text-sm font-bold text-white">No encontramos el pedido #{searchInput}</h3>
              <p className="text-xs text-mvp-silver/70 max-w-sm mx-auto">
                Verifica que el número sea exacto o contáctanos por WhatsApp para consultar con nuestro equipo de logística.
              </p>
            </div>
          )}

          {orderData && (
            <div className="space-y-6 animate-fade-in">
              {/* Top Order Badge */}
              <div className="bg-mvp-black/70 rounded-2xl p-4 border border-mvp-cardHover flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] text-mvp-muted block">Ticket de Compra:</span>
                  <h3 className="text-xl font-black text-white font-mono text-mvp-red">
                    #{orderData.trackingId}
                  </h3>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-[11px] text-mvp-muted block">Fecha del Pedido:</span>
                  <span className="text-xs font-bold text-mvp-silver">
                    {new Date(orderData.createdAt).toLocaleDateString('es-DO', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>

              {/* Status Timeline Stepper */}
              <div className="space-y-2">
                <h4 className="text-xs font-black text-mvp-silver uppercase tracking-wider">
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
                            ? 'bg-mvp-red/15 border-mvp-red text-white shadow-glow-sm scale-105'
                            : isCompleted
                            ? 'bg-mvp-dark/90 border-mvp-neonGreen/40 text-mvp-silver'
                            : 'bg-mvp-dark/40 border-mvp-cardHover/40 text-mvp-muted opacity-50'
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 ${
                            isCurrent
                              ? 'bg-mvp-red text-white'
                              : isCompleted
                              ? 'bg-mvp-neonGreen/20 text-mvp-neonGreen'
                              : 'bg-mvp-card text-mvp-muted'
                          }`}
                        >
                          <StepIcon size={16} />
                        </div>
                        <h5 className="text-[11px] font-black leading-tight">{step.title}</h5>
                        <p className="text-[10px] text-mvp-muted mt-0.5 leading-snug">{step.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Delivery Destination & Map Simulation */}
              <div className="bg-mvp-dark/70 rounded-2xl p-4 border border-mvp-cardHover space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <MapPin size={14} className="text-mvp-red" />
                    <span>Destino: {orderData.shipping.municipality}, {orderData.shipping.zoneName}</span>
                  </span>
                  <span className="text-[11px] bg-mvp-card px-2 py-0.5 rounded text-mvp-silver">
                    {orderData.shipping.estimatedHours}
                  </span>
                </div>

                <p className="text-xs text-mvp-silver/90 bg-mvp-black/50 p-2.5 rounded-xl border border-mvp-cardHover">
                  📍 <strong>Dirección:</strong> {orderData.shipping.address}
                  {orderData.shipping.reference && <span> (Ref: {orderData.shipping.reference})</span>}
                </p>
              </div>

              {/* Items in Order */}
              <div className="space-y-2">
                <h4 className="text-xs font-black text-mvp-silver uppercase tracking-wider">
                  Prendas del Pedido ({orderData.items?.length || 0})
                </h4>

                <div className="space-y-2">
                  {orderData.items?.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 bg-mvp-dark/60 p-2.5 rounded-xl border border-mvp-cardHover"
                    >
                      {item.image && (
                        <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover bg-black" />
                      )}
                      <div className="flex-1 min-w-0">
                        <h5 className="text-xs font-bold text-white truncate">{item.name}</h5>
                        <span className="text-[11px] text-mvp-muted">
                          {item.quantity}x | Talla: {item.size} {item.color ? `| ${item.color}` : ''}
                        </span>
                      </div>
                      <span className="text-xs font-black text-mvp-red">
                        {formatMoney(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="flex justify-between items-center bg-mvp-black p-3 rounded-xl border border-mvp-cardHover mt-2">
                  <span className="text-xs font-bold text-mvp-silver uppercase">Total al Recibir (COD):</span>
                  <span className="text-base font-black text-white">
                    {formatMoney(orderData.payment.total)}
                  </span>
                </div>
              </div>

              {/* WhatsApp Support Button */}
              <div className="pt-2">
                <a
                  href={`https://wa.me/18096560219?text=${encodeURIComponent(`Hola MVP Flow Boutique! Quisiera consultar sobre el estado de mi pedido #${orderData.trackingId}`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:brightness-110 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md"
                >
                  <MessageSquare size={16} />
                  <span>Consultar con Mensajería por WhatsApp</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
