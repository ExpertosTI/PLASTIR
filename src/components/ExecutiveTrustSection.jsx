import React from 'react';
import { 
  ShieldCheck, 
  Truck, 
  FileCheck2, 
  Building2, 
  Star, 
  CheckCircle2, 
  Clock, 
  Award,
  ArrowRight,
  FileText
} from 'lucide-react';
import { useCart } from '../context/CartContext';

const REVIEWS = [
  {
    id: 1,
    author: 'Lic. Roberto Tavárez',
    role: 'Gerente de Operaciones - Grupo Gastronómico Naco',
    city: 'Distrito Nacional',
    rating: 5,
    date: '18 de Septiembre, 2026',
    title: 'Excelente calidad industrial y entrega con Comprobante Fiscal puntual',
    comment:
      'Equipamos toda el área de almacenamiento y refrigeración con los contenedores herméticos y gaveteros modulares Plastir. La emisión del NCF de Crédito Fiscal fue inmediata y el material soporta el uso continuo de cocina comercial sin deformarse.',
    verified: true,
  },
  {
    id: 2,
    author: 'Dra. Patricia Lora',
    role: 'Organización Residencial',
    city: 'Bella Vista, Santo Domingo',
    rating: 5,
    date: '12 de Septiembre, 2026',
    title: 'Acabado superior, plástico transparente y broches de alta resistencia',
    comment:
      'Compré el juego de cajas organizadoras para clóset y zafacones de pedal. El plástico es 100% virgen, sin olores químicos y los broches sellan perfectamente. Servicio al cliente de primera con pago contra entrega en mi puerta.',
    verified: true,
  },
  {
    id: 3,
    author: 'Ing. Carlos Santana',
    role: 'Ferretería & Suministros Cibao',
    city: 'Santiago de los Caballeros',
    rating: 5,
    date: '5 de Septiembre, 2026',
    title: 'Excelente margen para reventa y soporte B2B confiable',
    comment:
      'Llevamos 6 meses adquiriendo bultos por mayor a través del cotizador B2B. Los despachos hacia Santiago vía transporte de carga son impecables y la relación precio-calidad es la más competitiva del mercado dominicano.',
    verified: true,
  },
];

export const ExecutiveTrustSection = () => {
  const { setIsQuickQuoterOpen } = useCart();

  return (
    <section className="py-12 px-4 bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* 4 Executive Corporate Pillars (Amazon / Enterprise Style) */}
        <div>
          <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-[#F16100] bg-orange-50 border border-orange-200 px-3 py-1 rounded-full">
              ESTÁNDARES CORPORATIVOS PLASTIR RD
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight">
              Calidad Industrial para el Hogar y la Empresa
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Garantizamos máxima resistencia en cada producto, respaldo fiscal formal y cobertura logística en toda República Dominicana.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            
            {/* Pillar 1 */}
            <div className="bg-slate-50 hover:bg-white border border-slate-200 hover:border-[#F16100]/40 rounded-2xl p-5 transition-all shadow-sm hover:shadow-md space-y-3">
              <div className="w-11 h-11 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-[#F16100]">
                <FileCheck2 size={22} />
              </div>
              <h3 className="text-sm font-black text-slate-900 uppercase">
                Comprobante Fiscal (NCF)
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Emitimos facturas válidas para Crédito Fiscal (B01) y Régimen Especial para empresas registradas ante la DGII.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="bg-slate-50 hover:bg-white border border-slate-200 hover:border-[#F16100]/40 rounded-2xl p-5 transition-all shadow-sm hover:shadow-md space-y-3">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                <ShieldCheck size={22} />
              </div>
              <h3 className="text-sm font-black text-slate-900 uppercase">
                100% Virgen & Libre de BPA
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Polímeros certificados de grado alimenticio. Aptos para refrigeración, congelador y microondas sin toxinas.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="bg-slate-50 hover:bg-white border border-slate-200 hover:border-[#F16100]/40 rounded-2xl p-5 transition-all shadow-sm hover:shadow-md space-y-3">
              <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                <Truck size={22} />
              </div>
              <h3 className="text-sm font-black text-slate-900 uppercase">
                Logística Nacional
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Despacho en 24h para Santo Domingo y envíos asegurados a todas las provincias a través de transporte expreso de carga.
              </p>
            </div>

            {/* Pillar 4 */}
            <div className="bg-slate-50 hover:bg-white border border-slate-200 hover:border-[#F16100]/40 rounded-2xl p-5 transition-all shadow-sm hover:shadow-md space-y-3">
              <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                <Building2 size={22} />
              </div>
              <h3 className="text-sm font-black text-slate-900 uppercase">
                Ventas Corporativas B2B
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Escala de precios por docena y bultos cerrados para ferreterías, hoteles, restaurantes e instituciones.
              </p>
            </div>

          </div>
        </div>

        {/* Amazon-Style Verified Reviews Section */}
        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-10 space-y-8">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="flex items-center text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={18} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-base font-black text-slate-900">4.9 de 5 estrellas</span>
              </div>
              <p className="text-xs text-slate-500">
                Basado en más de 380 órdenes corporativas y residenciales completadas con éxito.
              </p>
            </div>

            <button
              onClick={() => setIsQuickQuoterOpen?.(true)}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-[#F16100] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-sm flex items-center gap-2 self-start sm:self-auto"
            >
              <FileText size={15} />
              <span>Solicitar Cotización Empresarial</span>
            </button>
          </div>

          {/* Reviews Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {REVIEWS.map((review) => (
              <div
                key={review.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-amber-400">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="text-[10px] text-slate-400">{review.date}</span>
                  </div>

                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                    "{review.title}"
                  </h4>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {review.comment}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900">{review.author}</span>
                    {review.verified && (
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                        <CheckCircle2 size={10} className="text-emerald-600" />
                        Compra Verificada
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500">{review.role}</p>
                  <p className="text-[10px] text-slate-400">{review.city}</p>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
};
