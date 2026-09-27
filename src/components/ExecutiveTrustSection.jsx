import React from 'react';
import { 
  ShieldCheck, 
  Truck, 
  Star, 
  CheckCircle2, 
  Award,
  CreditCard,
  ShoppingBag
} from 'lucide-react';

const REVIEWS = [
  {
    id: 1,
    author: 'Carmen Morales',
    role: 'Cliente Verificada',
    city: 'Naco, Distrito Nacional',
    rating: 5,
    date: 'Ayer',
    title: 'Transformó por completo mi despensa y cocina',
    comment:
      'Compré el set de 7 contenedores herméticos y el dispensador giratorio. La calidad es increíble, son súper transparentes y sellan al vacío sin fugas. Me llegó en menos de 3 horas a mi casa y pagué al recibir.',
    verified: true,
  },
  {
    id: 2,
    author: 'Dra. Patricia Lora',
    role: 'Cliente Verificada',
    city: 'Bella Vista, Santo Domingo',
    rating: 5,
    date: 'Hace 3 días',
    title: 'Plástico grueso, sin olores químicos y broches fuertes',
    comment:
      'Las cajas organizadoras transparentes para clóset y zapateras magnéticas son de calidad superior. Cero olores a plástico reciclado, todo se ve ordenado y elegante. Excelente servicio de entrega en mi puerta.',
    verified: true,
  },
  {
    id: 3,
    author: 'Yaniris Peña',
    role: 'Cliente Verificada',
    city: 'Santiago de los Caballeros',
    rating: 5,
    date: 'Hace 5 días',
    title: 'Envío rápido al interior y todo en perfecto estado',
    comment:
      'Hice el pedido por la página web y al día siguiente ya lo tenía en Santiago. Todo llegó súper bien protegido en su caja. El gavetero y los cestos de lavandería son súper resistentes.',
    verified: true,
  },
];

export const ExecutiveTrustSection = () => {
  const scrollToCatalog = () => {
    const el = document.getElementById('catalog');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="py-12 px-4 bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* 4 Customer Pillars (Amazon / Modern Retail Style) */}
        <div>
          <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-[#F16100] bg-orange-50 border border-orange-200 px-3 py-1 rounded-full">
              GARANTÍA & CONFIANZA PLASTIR RD
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight">
              Tu Hogar en Orden con Calidad Garantizada
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Productos duraderos, materiales certificados libres de BPA y entregas rápidas con Pago Contra Entrega en todo el país.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            
            {/* Pillar 1 */}
            <div className="bg-slate-50 hover:bg-white border border-slate-200 hover:border-[#F16100]/40 rounded-2xl p-5 transition-all shadow-sm hover:shadow-md space-y-3">
              <div className="w-11 h-11 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-[#F16100]">
                <Award size={22} />
              </div>
              <h3 className="text-sm font-black text-slate-900 uppercase">
                Garantía de Calidad
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Plásticos gruesos de alta resistencia diseñados para soportar el uso diario sin romperse ni deformarse.
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
                Aprobados para conservar alimentos frescos. Aptos para refrigerador, congelador y microondas con total seguridad.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="bg-slate-50 hover:bg-white border border-slate-200 hover:border-[#F16100]/40 rounded-2xl p-5 transition-all shadow-sm hover:shadow-md space-y-3">
              <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                <Truck size={22} />
              </div>
              <h3 className="text-sm font-black text-slate-900 uppercase">
                Envío Rápido a Domicilio
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Entregas en 2 a 4 horas en Santo Domingo y envíos seguros a todas las provincias del país en 24 a 48 horas.
              </p>
            </div>

            {/* Pillar 4 */}
            <div className="bg-slate-50 hover:bg-white border border-slate-200 hover:border-[#F16100]/40 rounded-2xl p-5 transition-all shadow-sm hover:shadow-md space-y-3">
              <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                <CreditCard size={22} />
              </div>
              <h3 className="text-sm font-black text-slate-900 uppercase">
                Pago Contra Entrega Seguro
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Pagas en efectivo o transferencia únicamente cuando recibes y verificas tu pedido en tus manos.
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
                Basado en más de 1,240 valoraciones y compras verificadas en República Dominicana.
              </p>
            </div>

            <button
              onClick={scrollToCatalog}
              className="px-5 py-2.5 rounded-xl bg-[#F16100] hover:bg-[#D95500] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-sm flex items-center gap-2 self-start sm:self-auto"
            >
              <ShoppingBag size={15} />
              <span>Ver Catálogo Completo</span>
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

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <strong className="text-xs text-slate-900 block">{review.author}</strong>
                    <span className="text-[10px] text-slate-400">{review.city}</span>
                  </div>
                  {review.verified && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle2 size={11} />
                      Compra Verificada
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
};
