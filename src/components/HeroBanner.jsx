import React from 'react';
import { 
  ShieldCheck, 
  Truck, 
  ArrowRight, 
  CheckCircle2, 
  Package, 
  Recycle,
  Sparkles
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { trackBannerClick } from '../utils/tracker';

export const HeroBanner = ({ onSelectCategory }) => {
  const { setSelectedProduct } = useCart();

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const featuredProduct = {
    id: 'pla-001',
    name: 'Set 7 Contenedores Herméticos "Nordic Fresh" Click-Lock',
    category: 'cocina',
    department: 'Cocina & Despensa',
    price: 1890,
    originalPrice: 2600,
    discountPercent: 27,
    image: '/img/nordic-containers.jpg',
    capacity: 'Set de 7 Tamaños',
    description: 'Herméticos con sello de silicona médica. Mantén tus harinas, pastas y cereales secos y ordenados.',
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-white via-orange-50/20 to-white border-b border-slate-200/80 py-8 sm:py-14 px-4">
      {/* Background glow effects */}
      <div className="absolute -top-24 left-1/3 w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-20 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Headline & Call to action */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6 text-center lg:text-left">
            
            {/* Promo Tag */}
            <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200 px-3.5 py-1.5 rounded-full shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#F16100]"></span>
              <span className="text-xs sm:text-sm font-bold text-[#F16100] tracking-wide uppercase">
                PLASTIR RD • ARTÍCULOS PARA EL HOGAR & ORGANIZACIÓN
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 uppercase leading-[1.08]">
              EL ARTE DE ORGANIZAR <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F16100] via-[#E05300] to-slate-900">
                CADA RINCÓN DE TU HOGAR
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed">
              Soluciones funcionales para clóset, cocina, lavandería y áreas comerciales. Plásticos vírgenes de alta resistencia, 
              libres de BPA y diseñados para ordenar tu espacio con elegancia y durabilidad.
              <strong className="text-[#F16100] font-semibold"> Envíos a todo el país y Pago Contra Entrega.</strong>
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
              <button
                onClick={() => {
                  trackBannerClick('explorar_departamentos');
                  scrollToSection('catalog');
                }}
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#F16100] via-[#FA751A] to-[#F16100] hover:from-[#E05300] hover:to-[#F16100] text-white font-bold text-xs sm:text-sm uppercase tracking-wider shadow-md shadow-orange-500/25 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
              >
                <Package size={17} className="text-white" />
                <span>EXPLORAR CATÁLOGO</span>
                <ArrowRight size={16} />
              </button>

              <button
                onClick={() => {
                  trackBannerClick('ver_ambientes');
                  scrollToSection('showrooms');
                }}
                className="px-5 py-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center gap-2 shadow-sm"
              >
                <Sparkles size={16} className="text-[#F16100]" />
                <span>Ambientes e Ideas</span>
              </button>
            </div>

            {/* Department Store Trust Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-200 text-left">
              <div className="flex items-center gap-2">
                <Truck size={18} className="text-[#F16100] flex-shrink-0" />
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Envío Express</span>
                  <span className="text-[10px] text-slate-500">Mismo día en Santo Domingo</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-emerald-600 flex-shrink-0" />
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Libre de BPA</span>
                  <span className="text-[10px] text-slate-500">100% Grado Alimenticio</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-[#F16100] flex-shrink-0" />
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Pago Contra Entrega</span>
                  <span className="text-[10px] text-slate-500">Pagas al recibir en mano</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Recycle size={18} className="text-emerald-600 flex-shrink-0" />
                <div>
                  <span className="text-xs font-bold text-slate-900 block">100% Reciclable</span>
                  <span className="text-[10px] text-slate-500">Compromiso Ambiental</span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Featured Product Card */}
          <div className="lg:col-span-5">
            <div className="relative rounded-3xl bg-white border border-slate-200 p-5 sm:p-6 shadow-xl space-y-4">
              
              {/* Badge top */}
              <div className="flex items-center justify-between">
                <span className="bg-[#F16100] text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-md tracking-wider shadow-sm">
                  DESTACADO DE ORGANIZACIÓN
                </span>
                <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Disponible en almacén
                </span>
              </div>

              {/* Product preview */}
              <div 
                className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-slate-50 border border-slate-100 group cursor-pointer"
                onClick={() => setSelectedProduct(featuredProduct)}
              >
                <img
                  src={featuredProduct.image}
                  alt={featuredProduct.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute bottom-2 left-2 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-200 text-[11px] font-bold text-slate-800 shadow-sm">
                  Despensa & Cocina
                </div>
              </div>

              {/* Title & Pricing */}
              <div>
                <h3 
                  onClick={() => setSelectedProduct(featuredProduct)}
                  className="text-base sm:text-lg font-bold text-slate-900 leading-snug hover:text-[#F16100] cursor-pointer transition-colors"
                >
                  {featuredProduct.name}
                </h3>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-black text-[#F16100] font-sans">
                    RD$ 1,890
                  </span>
                  <span className="text-xs text-slate-400 line-through">
                    RD$ 2,600
                  </span>
                  <span className="bg-orange-100 text-[#D45000] text-[10px] font-black px-1.5 py-0.5 rounded border border-orange-200">
                    27% AHORRO
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                  Herméticos con sello de silicona médica. Mantén tus harinas, pastas y cereales secos y ordenados.
                </p>
              </div>

              {/* CTA button */}
              <button
                onClick={() => setSelectedProduct(featuredProduct)}
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-[#F16100] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2"
              >
                <span>Ver Detalles del Artículo</span>
                <ArrowRight size={15} />
              </button>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
