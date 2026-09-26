import React from 'react';
import { 
  ShieldCheck, 
  Truck, 
  RefreshCw, 
  Phone, 
  MapPin, 
  Instagram, 
  MessageCircle, 
  Zap, 
  Heart,
  Clock,
  Recycle,
  Package,
  FileText
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { PlastirLogo } from './PlastirLogo';

export const Footer = ({ onSelectCategory }) => {
  const { setIsTrackerOpen, setIsAdminOpen, setIsQuickQuoterOpen } = useCart();

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <footer className="bg-slate-100/80 border-t border-slate-200 text-slate-600 text-xs pt-12 pb-8 px-4">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Value Proposition Banners (IKEA / Department Style) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pb-8 border-b border-slate-200">
          <div className="flex items-center gap-3.5 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="w-11 h-11 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-[#F16100] flex-shrink-0">
              <Truck size={22} />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900 uppercase">Envíos a todo RD</h4>
              <p className="text-slate-500 text-[11px]">Mismo día en Santo Domingo y 24-48h al interior con COD.</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 flex-shrink-0">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900 uppercase">100% Libre de BPA</h4>
              <p className="text-slate-500 text-[11px]">Plásticos vírgenes certificados de grado alimenticio.</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 flex-shrink-0">
              <RefreshCw size={22} />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900 uppercase">Garantía Plastir</h4>
              <p className="text-slate-500 text-[11px]">Reposición inmediata ante cualquier defecto de fábrica.</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 flex-shrink-0">
              <FileText size={22} />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900 uppercase">Venta Mayorista B2B</h4>
              <p className="text-slate-500 text-[11px]">Factura con Crédito Fiscal (NCF B01) para empresas.</p>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          
          {/* Brand & Location Column */}
          <div className="space-y-3">
            <PlastirLogo />
            
            <p className="text-slate-500 text-[11px] leading-relaxed pt-1">
              Artículos para el hogar y soluciones de organización con diseño funcional. El orden y calidad que transforman tu espacio.
            </p>

            <p className="text-slate-600 text-[11px] flex items-start gap-1.5 pt-1">
              <MapPin size={15} className="text-[#F16100] flex-shrink-0 mt-0.5" />
              <span>
                <strong>Almacén y Distribución:</strong> Santo Domingo, República Dominicana.
              </span>
            </p>

            <p className="text-slate-500 text-[11px] flex items-center gap-1.5">
              <Clock size={14} className="text-amber-500 flex-shrink-0" />
              <span>Lunes a Sábado: 8:00 AM – 7:00 PM</span>
            </p>
          </div>

          {/* Departamentos */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider text-[#F16100]">
              Departamentos
            </h4>
            <ul className="space-y-1.5 text-[11px] text-slate-600">
              <li>
                <button onClick={() => { onSelectCategory?.('organizacion'); scrollToSection('catalog'); }} className="hover:text-[#F16100] transition-colors">
                  Organización & Clóset
                </button>
              </li>
              <li>
                <button onClick={() => { onSelectCategory?.('cocina'); scrollToSection('catalog'); }} className="hover:text-[#F16100] transition-colors">
                  Cocina & Despensa
                </button>
              </li>
              <li>
                <button onClick={() => { onSelectCategory?.('lavanderia'); scrollToSection('catalog'); }} className="hover:text-[#F16100] transition-colors">
                  Lavandería & Baño
                </button>
              </li>
              <li>
                <button onClick={() => { onSelectCategory?.('mesa_hogar'); scrollToSection('catalog'); }} className="hover:text-[#F16100] transition-colors">
                  Mesa, Hogar & Terraza
                </button>
              </li>
              <li>
                <button onClick={() => { onSelectCategory?.('industrial'); scrollToSection('catalog'); }} className="hover:text-[#F16100] transition-colors">
                  Industrial & Hostelería B2B
                </button>
              </li>
              <li>
                <button onClick={() => { onSelectCategory?.('muebles'); scrollToSection('catalog'); }} className="hover:text-[#F16100] transition-colors">
                  Mobiliario & Sillas Plásticas
                </button>
              </li>
            </ul>
          </div>

          {/* Clientes & Servicios */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider text-[#F16100]">
              Atención al Cliente
            </h4>
            <ul className="space-y-1.5 text-[11px] text-slate-600">
              <li>
                <button onClick={() => setIsTrackerOpen(true)} className="hover:text-[#F16100] transition-colors">
                  Rastrear Estado de mi Pedido
                </button>
              </li>
              <li>
                <button onClick={() => setIsQuickQuoterOpen?.(true)} className="hover:text-[#F16100] transition-colors">
                  Cotizador Mayorista B2B (Ferreterías & Negocios)
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('showrooms')} className="hover:text-[#F16100] transition-colors">
                  Showrooms & Ambientes del Hogar
                </button>
              </li>
              <li>
                <button onClick={() => setIsQuickQuoterOpen?.(true)} className="hover:text-[#F16100] transition-colors">
                  Facturación con Comprobante Fiscal (NCF)
                </button>
              </li>
              <li>
                <a href="/catalogo.html" className="hover:text-[#F16100] transition-colors">
                  Catálogo Digital Interactivo
                </a>
              </li>
            </ul>
          </div>

          {/* Contacto & B2B WhatsApp */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider text-emerald-700">
              Ventas & WhatsApp
            </h4>
            <p className="text-[11px] text-slate-500">
              ¿Deseas comprar al por mayor o tienes dudas sobre medidas y capacidad? Contáctanos de inmediato.
            </p>

            <a
              href="https://wa.me/18096560219?text=Hola%20Plastir%20RD,%20deseo%20m%C3%A1s%20informaci%C3%B3n"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm"
            >
              <MessageCircle size={15} />
              <span>WhatsApp Ventas Directas</span>
            </a>

            <div className="pt-2">
              <button
                onClick={() => setIsAdminOpen(true)}
                className="text-[10px] text-slate-400 hover:text-slate-600 transition-colors"
              >
                Acceso Administrativo / Odoo Sync
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <div>
            © {new Date().getFullYear()} <strong>PLASTIR RD</strong> (plastirrd.com). Todos los derechos reservados.
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <span>Artículos para el Hogar</span>
            <span>•</span>
            <span>100% Reciclables</span>
            <span>•</span>
            <span>Libres de BPA</span>
            <span>•</span>
            <span>Tecnología RENACE</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
