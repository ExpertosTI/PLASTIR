import React, { useState } from 'react';
import { 
  Bell, 
  X, 
  CheckCircle2, 
  Truck, 
  Package, 
  Clock, 
  MessageSquare, 
  Sparkles, 
  ShieldCheck, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  BarChart2
} from 'lucide-react';
import { useCart } from '../context/CartContext';

export const NotificationsModal = () => {
  const { 
    isNotificationsOpen, 
    setIsNotificationsOpen, 
    setIsTrackerOpen, 
    setIsStatsOpen,
    openLiveChat, 
    cart, 
    itemsCount 
  } = useCart();

  const [filter, setFilter] = useState('all'); // 'all' | 'orders' | 'whatsapp' | 'promos'

  if (!isNotificationsOpen) return null;

  const NOTIFICATIONS_LIST = [
    {
      id: 'notif-1',
      type: 'orders',
      title: '🚚 Envió Express COD Activo en Santo Domingo',
      message: 'Recibe tu pedido hoy mismo con Pago Contra Entrega. El mensajero confirma por WhatsApp previo al despacho.',
      time: 'Hace 5 minutos',
      unread: true,
      icon: Truck,
      color: 'bg-emerald-500 text-white',
      badge: 'EN RUTA COD'
    },
    {
      id: 'notif-2',
      type: 'promos',
      title: '✨ 25% OFF en Cajas Organizadoras con Broches',
      message: 'Lote fresco de cajas transparentes apilables de 30L y 50L en stock con precio especial de temporada.',
      time: 'Hace 1 hora',
      unread: true,
      icon: Sparkles,
      color: 'bg-orange-500 text-white',
      badge: 'OFERTA DESTACADA'
    },
    {
      id: 'notif-3',
      type: 'whatsapp',
      title: '💬 Asistencia Directa en Vivo por Whaticket',
      message: '¿Necesitas cotización mayorista o asesoría en medidas? Conéctate con nuestras asesoras por WhatsApp en tiempo real.',
      time: 'Activo Ahora',
      unread: false,
      icon: MessageSquare,
      color: 'bg-teal-500 text-white',
      badge: 'ASESORÍA 24/7'
    },
    {
      id: 'notif-4',
      type: 'orders',
      title: '🛡️ Garantía de Reposición Inmediata Plastir',
      message: 'Todos tus artículos cuentan con 100% garantía de cambio directo ante cualquier daño o defecto.',
      time: 'Permanente',
      unread: false,
      icon: ShieldCheck,
      color: 'bg-indigo-500 text-white',
      badge: 'GARANTÍA'
    }
  ];

  const filteredNotifs = NOTIFICATIONS_LIST.filter(n => filter === 'all' || n.type === filter);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/60 backdrop-blur-sm p-0 sm:p-4 animate-fade-in">
      <div className="bg-white w-full sm:max-w-md h-full sm:h-[90vh] sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F16100] text-white flex items-center justify-center shadow-md shadow-orange-500/30">
              <Bell size={20} />
            </div>
            <div>
              <h2 className="text-base font-black uppercase tracking-wider">Notificaciones & Alertas</h2>
              <p className="text-[11px] text-slate-300 font-medium">Actualizaciones de pedidos y ofertas de PLASTIR RD</p>
            </div>
          </div>

          <button
            onClick={() => setIsNotificationsOpen(false)}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Quick Tabs */}
        <div className="flex items-center gap-1.5 p-3 bg-slate-50 border-b border-slate-200 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              filter === 'all' ? 'bg-[#F16100] text-white shadow-sm' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setFilter('orders')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              filter === 'orders' ? 'bg-[#F16100] text-white shadow-sm' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            📦 Rastreo
          </button>
          <button
            onClick={() => setFilter('whatsapp')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              filter === 'whatsapp' ? 'bg-[#F16100] text-white shadow-sm' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            💬 WhatsApp
          </button>
          <button
            onClick={() => setFilter('promos')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              filter === 'promos' ? 'bg-[#F16100] text-white shadow-sm' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            ✨ Descuentos
          </button>
        </div>

        {/* Shortcuts for Tracker & Stats */}
        <div className="p-3 bg-orange-50/70 border-b border-orange-100 flex items-center justify-between gap-2">
          <button
            onClick={() => {
              setIsNotificationsOpen(false);
              setIsTrackerOpen(true);
            }}
            className="flex-1 py-2 px-3 rounded-xl bg-white border border-orange-200 text-[#F16100] text-xs font-black flex items-center justify-center gap-1.5 shadow-sm hover:bg-orange-50 transition-colors"
          >
            <Truck size={14} />
            <span>Rastrear Pedido COD</span>
          </button>

          <button
            onClick={() => {
              setIsNotificationsOpen(false);
              setIsStatsOpen(true);
            }}
            className="flex-1 py-2 px-3 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs font-black flex items-center justify-center gap-1.5 shadow-sm hover:bg-slate-50 transition-colors"
          >
            <BarChart2 size={14} className="text-emerald-600" />
            <span>Ver Estadísticas</span>
          </button>
        </div>

        {/* Notification Cards List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
          {filteredNotifs.map((notif) => {
            const IconComp = notif.icon;
            return (
              <div 
                key={notif.id}
                className={`p-3.5 rounded-2xl border transition-all ${
                  notif.unread 
                    ? 'bg-orange-50/40 border-orange-200 shadow-sm' 
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${notif.color} shadow-sm`}>
                    <IconComp size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 uppercase tracking-wider">
                        {notif.badge}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">{notif.time}</span>
                    </div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">{notif.title}</h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{notif.message}</p>
                    
                    {notif.type === 'whatsapp' && (
                      <button
                        onClick={() => {
                          setIsNotificationsOpen(false);
                          openLiveChat();
                        }}
                        className="mt-2.5 inline-flex items-center gap-1 text-xs font-black text-[#F16100] hover:text-[#D05000]"
                      >
                        <span>Abrir Chat Asesoras</span>
                        <ChevronRight size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-center">
          <p className="text-[11px] text-slate-500 font-medium">
            Notificaciones en tiempo real vía WhatsApp & SMS al realizar tus compras
          </p>
        </div>

      </div>
    </div>
  );
};
