import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  ShoppingBag, 
  DollarSign, 
  ShieldCheck, 
  Truck, 
  X, 
  Sparkles, 
  Award, 
  CheckCircle2,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { useCart } from '../context/CartContext';

export const CustomerStatsModal = () => {
  const { isStatsOpen, setIsStatsOpen, cart, openLiveChat } = useCart();

  if (!isStatsOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-3 sm:p-4 animate-fade-in">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/30">
              <BarChart3 size={22} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black uppercase tracking-wider">Estadísticas & Métricas del Cliente</h2>
              <p className="text-xs text-slate-300">Resumen de optimización de espacio y ahorro estimado en RD$</p>
            </div>
          </div>

          <button
            onClick={() => setIsStatsOpen(false)}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* Top 3 Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-gradient-to-tr from-emerald-500 to-teal-600 text-white p-4 rounded-2xl shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-100">Ahorro Estimado</span>
                <DollarSign size={18} className="text-emerald-100" />
              </div>
              <div className="text-2xl font-black mt-2">RD$ 2,450</div>
              <p className="text-[11px] text-emerald-100 mt-1 font-medium">Por compras en combos y mayorista</p>
            </div>

            <div className="bg-gradient-to-tr from-orange-500 to-amber-600 text-white p-4 rounded-2xl shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-orange-100">Artículos Organizados</span>
                <ShoppingBag size={18} className="text-orange-100" />
              </div>
              <div className="text-2xl font-black mt-2">14 ítems</div>
              <p className="text-[11px] text-orange-100 mt-1 font-medium">Clóset, cocina y lavandería</p>
            </div>

            <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 text-white p-4 rounded-2xl shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-100">Entregas a Tiempo</span>
                <Truck size={18} className="text-blue-100" />
              </div>
              <div className="text-2xl font-black mt-2">99.4%</div>
              <p className="text-[11px] text-blue-100 mt-1 font-medium">Cumplimiento en envíos COD</p>
            </div>
          </div>

          {/* Detailed Breakdown */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <TrendingUp size={16} className="text-[#F16100]" />
              <span>Eficiencia de Espacio por Departamento</span>
            </h3>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-800 mb-1">
                  <span>📦 Organización & Clóset</span>
                  <span className="text-[#F16100]">40% Ahorro Espacio</span>
                </div>
                <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-[#F16100] rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-800 mb-1">
                  <span>🍳 Cocina & Despensa (FDA BPA Free)</span>
                  <span className="text-emerald-600">35% Ahorro Espacio</span>
                </div>
                <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-800 mb-1">
                  <span>🧺 Lavandería & Limpieza</span>
                  <span className="text-blue-600">25% Ahorro Espacio</span>
                </div>
                <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: '60%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Guarantee Banner */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-emerald-900">Garantía de Satisfacción 100% Plastir</h4>
                <p className="text-[11px] text-emerald-700">Plásticos grado industrial a prueba de impactos y humedad</p>
              </div>
            </div>

            <button
              onClick={() => {
                setIsStatsOpen(false);
                openLiveChat();
              }}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold whitespace-nowrap shadow-sm transition-colors flex items-center gap-1"
            >
              <span>Consultar Asesora</span>
              <ChevronRight size={14} />
            </button>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">Actualizado en tiempo real</span>
          <button
            onClick={() => setIsStatsOpen(false)}
            className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
          >
            Cerrar Ventana
          </button>
        </div>

      </div>
    </div>
  );
};
