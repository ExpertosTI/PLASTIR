import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  Truck, 
  ArrowRight, 
  FileText, 
  Clock, 
  CheckCircle2, 
  Package, 
  Layers,
  Recycle
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { trackBannerClick } from '../utils/tracker';

export const HeroBanner = ({ onSelectCategory }) => {
  const { setIsQuickQuoterOpen } = useCart();

  // Countdown timer for hero flash deal
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 28, seconds: 45 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 5, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDigits = (num) => String(num).padStart(2, '0');

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-b border-slate-800 py-8 sm:py-14 px-4">
      {/* Background glow effects */}
      <div className="absolute -top-24 left-1/3 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-20 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Headline & Call to action */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6 text-center lg:text-left">
            
            {/* Promo Tag */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600/20 via-sky-500/10 to-transparent border border-blue-500/40 px-3.5 py-1.5 rounded-full">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-400"></span>
              </span>
              <span className="text-xs sm:text-sm font-bold text-blue-300 tracking-wide uppercase">
                PLASTIR RD // SOLUCIONES INTELIGENTES PARA TU ESPACIO
              </span>
            </div>

            {/* Main Headline (Shopify + IKEA hybrid vibe) */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white uppercase leading-[1.05]">
              EL ARTE DE ORGANIZAR <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-amber-300">
                CADA RINCÓN DE TU VIDA
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed">
              Inspirado en el diseño nórdico funcional de IKEA. Plásticos vírgenes de alta resistencia, 
              libres de BPA y creados para durar toda la vida.
              <strong className="text-amber-300 font-semibold"> ¡Pide hoy y paga en efectivo al recibir en tu puerta!</strong>
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
              <button
                onClick={() => {
                  trackBannerClick('explorar_departamentos');
                  scrollToSection('catalog');
                }}
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-blue-600 text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-blue-600/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
              >
                <Package size={17} className="text-amber-300" />
                <span>EXPLORAR DEPARTAMENTOS</span>
                <ArrowRight size={16} />
              </button>

              <button
                onClick={() => {
                  trackBannerClick('ver_ambientes_ikea');
                  scrollToSection('showrooms');
                }}
                className="px-5 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-blue-400/50 text-white font-bold text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center gap-2 shadow-md"
              >
                <Sparkles size={16} className="text-amber-400" />
                <span>Ambientes IKEA</span>
              </button>

              <button
                onClick={() => setIsQuickQuoterOpen?.(true)}
                className="px-4 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-amber-400/40 text-amber-300 font-bold text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center gap-2"
              >
                <FileText size={16} className="text-amber-400" />
                <span>Cotizador B2B</span>
              </button>
            </div>

            {/* Department Store Trust Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800 text-left">
              <div className="flex items-center gap-2">
                <Truck size={18} className="text-blue-400 flex-shrink-0" />
                <div>
                  <span className="text-xs font-bold text-white block">Envío Express</span>
                  <span className="text-[10px] text-slate-400">Mismo día en Santo Domingo</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-emerald-400 flex-shrink-0" />
                <div>
                  <span className="text-xs font-bold text-white block">Libre de BPA</span>
                  <span className="text-[10px] text-slate-400">100% Grado Alimenticio</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-amber-400 flex-shrink-0" />
                <div>
                  <span className="text-xs font-bold text-white block">Pago Contra Entrega</span>
                  <span className="text-[10px] text-slate-400">Pagas al recibir en mano</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Recycle size={18} className="text-emerald-400 flex-shrink-0" />
                <div>
                  <span className="text-xs font-bold text-white block">100% Reciclable</span>
                  <span className="text-[10px] text-slate-400">Compromiso Ambiental</span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Featured IKEA Highlight Card */}
          <div className="lg:col-span-5">
            <div className="relative rounded-3xl bg-slate-800/80 border border-slate-700 p-5 sm:p-6 backdrop-blur-xl shadow-2xl space-y-4">
              
              {/* Badge top */}
              <div className="flex items-center justify-between">
                <span className="bg-[#FFDB00] text-slate-950 text-[10px] font-black uppercase px-2.5 py-1 rounded-md tracking-wider">
                  OFERTA DESTACADA DE LA SEMANA
                </span>
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-300">
                  <Clock size={14} />
                  <span>{formatDigits(timeLeft.hours)}:{formatDigits(timeLeft.minutes)}:{formatDigits(timeLeft.seconds)}</span>
                </div>
              </div>

              {/* Product preview */}
              <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-slate-900 border border-slate-700/60 group">
                <img
                  src="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=800&auto=format&fit=crop"
                  alt="Set de 7 Contenedores Herméticos Nordic Fresh"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute bottom-2 left-2 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700 text-[11px] font-bold text-slate-200">
                  Despensa & Cocina
                </div>
              </div>

              {/* Title & Pricing */}
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
                  Set 7 Contenedores Herméticos "Nordic Fresh" Click-Lock
                </h3>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-black text-amber-300 font-sans">
                    RD$ 1,890
                  </span>
                  <span className="text-xs text-slate-400 line-through">
                    RD$ 2,600
                  </span>
                  <span className="bg-red-500/20 text-red-400 text-[10px] font-black px-1.5 py-0.5 rounded border border-red-500/40">
                    27% AHORRO
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 mt-1 line-clamp-2">
                  Herméticos con sello de silicona médica. Mantén tus harinas, pastas y cereales secos y ordenados.
                </p>
              </div>

              {/* CTA button */}
              <button
                onClick={() => {
                  trackBannerClick('ver_oferta_hermeticos');
                  onSelectCategory('cocina');
                  scrollToSection('catalog');
                }}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2"
              >
                <span>Ver Detalles de la Oferta</span>
                <ArrowRight size={15} />
              </button>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
