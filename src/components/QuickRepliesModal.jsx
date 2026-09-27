import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Search, 
  User, 
  MessageSquare, 
  Zap, 
  Layers, 
  BookOpen 
} from 'lucide-react';
import { useCart } from '../context/CartContext';

export const QuickRepliesModal = () => {
  const { 
    isQuickRepliesOpen, 
    setIsQuickRepliesOpen, 
    setIsManualOpen, 
    setIsQuickQuoterOpen,
    setIsLocalCatalogOpen 
  } = useCart();
  const [copiedId, setCopiedId] = useState(null);
  const [agentName, setAgentName] = useState(() => localStorage.getItem('plastir_agent_name') || localStorage.getItem('mvpflow_agent_name') || 'Asesor Plastir');
  const [searchTerm, setSearchTerm] = useState('');

  if (!isQuickRepliesOpen) return null;

  const currentAgent = agentName.trim() || 'Asesor Plastir';

  const shortcuts = [
    {
      id: 'bienvenida',
      command: '/bienvenida',
      aliases: ['/saludo', '/hola'],
      title: 'Saludo & Bienvenida (Asesor)',
      badge: '✨ Saludo Inicial',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      text: `¡Hola! Le asiste ${currentAgent} de PLASTIR RD 👋📦\n\nBienvenido/a a la tienda oficial de organización inteligente y artículos para el hogar. Será un placer atenderle.\n\nCuéntenos, ¿qué organizadores, gaveteros o cajas plásticas está buscando hoy? Le envío fotos reales y disponibilidad de inmediato. ✨`,
    },
    {
      id: 'despedida',
      command: '/despedida',
      aliases: ['/bye', '/gracias'],
      title: 'Despedida & Cierre Asertivo',
      badge: '🙌 Cierre de Conversación',
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      text: `¡Gracias por comunicarse con PLASTIR RD! 🙌📦\n\nHa sido un placer atenderle. Recuerde que estamos a su disposición para cualquier consulta de medidas, capacidades o cotizaciones por volumen.\n\n¡Que tenga un excelente día! ✨`,
    },
    {
      id: 'ubicacion',
      command: '/ubicacion',
      aliases: ['/tienda', '/direccion', '/envios'],
      title: 'Almacén Central & Cobertura de Entregas',
      badge: '📍 Logística & Envíos',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
      text: `📍 *LOGÍSTICA & DESPACHOS PLASTIR RD:*\n\nDespachamos desde nuestro almacén central en Santo Domingo hacia todo el país.\n\n🛵 *Gran Santo Domingo:* Entregas el mismo día / 2 a 4 horas.\n🚚 *Interior del País:* Envío por transporte expreso (24 a 48 horas garantizado).\n\nTambién contamos con opción de pago al recibir (COD) en zonas seleccionadas. 📦`,
    },
    {
      id: 'cod',
      command: '/cod',
      aliases: ['/pago', '/entrega'],
      title: 'Explicación Pago Contra Entrega (COD)',
      badge: '💵 Pago al Recibir',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
      text: `💵 *¿CÓMO FUNCIONA EL PAGO AL RECIBIR?*\n\n1. Usted confirma su pedido con nosotros.\n2. Nuestro mensajero express despacha su mercancía con empaque protector.\n3. Recibe sus artículos en la puerta de su hogar u oficina, verifica el pedido y *paga en efectivo o transferencia* en el momento.\n\n¡Cómodo, transparente y 100% seguro! 📦`,
    },
    {
      id: 'confirmar',
      command: '/confirmar',
      aliases: ['/pedido', '/datos'],
      title: 'Captura de Datos para Despacho',
      badge: '📦 Cerrar Pedido',
      badgeColor: 'bg-orange-50 text-orange-700 border-orange-200',
      text: `📦 *PARA PROCESAR SU PEDIDO HOY MISMO, FAVOR INDICARNOS:*\n\n• *Nombre Completo:*\n• *Teléfono de Contacto:*\n• *Sector / Municipio:*\n• *Dirección Exacta:*\n• *Punto de Referencia:*\n• *Productos y Cantidades:*\n\n¡Tan pronto recibamos sus datos procedemos a preparar y despachar su paquete! 🛵💨`,
    },
    {
      id: 'seguimiento',
      command: '/seguimiento',
      aliases: ['/postventa', '/resena'],
      title: 'Seguimiento Post-Venta & Garantía',
      badge: '⭐ Satisfacción',
      badgeColor: 'bg-teal-50 text-teal-700 border-teal-200',
      text: `¡Hola! Le contactamos de *PLASTIR RD* 👋\n\nQueremos asegurarnos de que recibió sus artículos en perfecto estado y que esté disfrutando de la organización de sus espacios.\n\n¿Todo llegó excelente con su pedido? Su satisfacción es nuestra prioridad. 📦⭐`,
    },
  ];

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredShortcuts = shortcuts.filter((s) => {
    const q = searchTerm.toLowerCase();
    return (
      s.command.toLowerCase().includes(q) ||
      s.title.toLowerCase().includes(q) ||
      s.text.toLowerCase().includes(q) ||
      s.aliases.some((a) => a.toLowerCase().includes(q))
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white border border-slate-200 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-800">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between gap-4 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F16100] flex items-center justify-center shadow-sm flex-shrink-0">
              <MessageSquare size={20} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-extrabold uppercase tracking-wide text-slate-900">
                  Banco de Respuestas Rápidas
                </h3>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                  Whaticket Oficial
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Plantillas oficiales de atención al cliente de PLASTIR RD en 1 clic.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsQuickRepliesOpen(false);
                setIsQuickQuoterOpen(true);
              }}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm"
            >
              <Zap size={13} />
              <span>Abrir Cotizador</span>
            </button>

            <button
              onClick={() => setIsQuickRepliesOpen(false)}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Controls Bar: Asesor Name + Search Bar */}
        <div className="p-3 sm:p-4 border-b border-slate-100 bg-white flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Agent Name Input */}
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
            <User size={15} className="text-[#F16100] flex-shrink-0" />
            <span className="text-xs font-bold text-slate-600 whitespace-nowrap">Nombre de quien asiste:</span>
            <input
              type="text"
              value={agentName}
              onChange={(e) => {
                setAgentName(e.target.value);
                localStorage.setItem('plastir_agent_name', e.target.value);
              }}
              placeholder="Asesor Plastir"
              className="bg-white border border-slate-200 focus:border-[#F16100] rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800 focus:outline-none w-36 text-center"
            />
          </div>

          {/* Search Input */}
          <div className="relative flex-1 sm:max-w-xs">
            <Search size={14} className="absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar atajo (/bienvenida, /cod...)"
              className="w-full bg-slate-50 border border-slate-200 focus:border-[#F16100] rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Shortcuts Grid List */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/50 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredShortcuts.map((item) => {
              const isCopied = copiedId === item.id;
              return (
                <div
                  key={item.id}
                  className="bg-white border border-slate-200 hover:border-[#F16100]/50 rounded-2xl p-4 space-y-3 shadow-sm hover:shadow transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold bg-[#F16100] text-white px-2.5 py-1 rounded-lg">
                          {item.command}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.badgeColor}`}>
                          {item.badge}
                        </span>
                      </div>

                      <button
                        onClick={() => handleCopy(item.text, item.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all border ${
                          isCopied
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                        }`}
                      >
                        {isCopied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                        <span>{isCopied ? '¡Copiado!' : 'Copiar'}</span>
                      </button>
                    </div>

                    <h4 className="text-xs font-bold text-slate-800">
                      {item.title}
                    </h4>

                    <div className="text-xs text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-100 whitespace-pre-line leading-relaxed font-sans select-all">
                      {item.text}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                    <span>Atajos: {item.aliases.join(', ')}</span>
                    <span className="text-[#F16100] font-semibold">Listo para Whaticket</span>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredShortcuts.length === 0 && (
            <div className="text-center py-12 text-slate-400 text-xs">
              No se encontraron respuestas rápidas con el término "{searchTerm}".
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 border-t border-slate-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsQuickRepliesOpen(false);
                setIsLocalCatalogOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 text-xs font-bold transition-all"
            >
              <Layers size={13} />
              <span>Ver Catálogo Local Redes</span>
            </button>
          </div>

          <button
            onClick={() => {
              setIsQuickRepliesOpen(false);
              setIsManualOpen(true);
            }}
            className="text-[#F16100] hover:text-[#d55500] font-bold flex items-center gap-1.5 transition-colors text-xs"
          >
            <BookOpen size={14} />
            <span>Ver Manual de Operaciones</span>
          </button>
        </div>
      </div>
    </div>
  );
};
