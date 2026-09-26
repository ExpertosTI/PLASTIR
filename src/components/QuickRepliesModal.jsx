import React, { useState } from 'react';
import { 
  X, 
  MessageSquare, 
  Copy, 
  Check, 
  User, 
  Search, 
  ExternalLink,
  BookOpen,
  Sparkles,
  Zap,
  Layers,
  ShoppingBag
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
  const [agentName, setAgentName] = useState(() => localStorage.getItem('mvpflow_agent_name') || 'Ashley');
  const [searchTerm, setSearchTerm] = useState('');

  if (!isQuickRepliesOpen) return null;

  const currentAgent = agentName.trim() || 'Ashley';

  const shortcuts = [
    {
      id: 'bienvenida',
      command: '/bienvenida',
      aliases: ['/saludo', '/hola'],
      title: 'Saludo & Bienvenida (Asesor)',
      badge: '✨ Saludo Inicial',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      text: `Hola, le asiste ${currentAgent} ! 👋🔥\n\nBienvenido/a a MVP FLOW BOUTIQUE RD, la tienda #1 en tenis y ropa urbana. Será un placer atenderte. 🛍️\n\nCuéntame, ¿qué modelo o talla estás buscando hoy? Te envío fotos reales y toda la información de una vez. 👟✨`,
    },
    {
      id: 'despedida',
      command: '/despedida',
      aliases: ['/bye', '/gracias'],
      title: 'Despedida & Cierre Asertivo',
      badge: '🙌 Cierre de Conversación',
      badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
      text: `¡Gracias por comunicarte con MVP FLOW BOUTIQUE RD! 🙌🔥\n\nHa sido un placer atenderte. Recuerda que estamos a la orden para ayudarte con cualquier modelo, talla o información que necesites.\n\n¡Esperamos verte pronto! 👟🛍️✨`,
    },
    {
      id: 'ubicacion',
      command: '/ubicacion',
      aliases: ['/tienda', '/direccion'],
      title: 'Ubicación & Horarios de Tienda',
      badge: '📍 Tienda Física',
      badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      text: `📍 *UBICACIÓN OFICIAL DE NUESTRA TIENDA:*\n\nEstamos ubicados en la *Av. San Vicente de Paúl, Los Mina, Santo Domingo Este* (justo al lado de la estación del metro Trina de Moya de Vázquez).\n\n🕒 *Horario:* Lunes a Domingo de 9:00 AM a 9:00 PM.\n¡Pasa por allá a medírtelos o te los enviamos hoy mismo a tu casa con mensajero! 🛵`,
    },
    {
      id: 'cod',
      command: '/cod',
      aliases: ['/pago', '/entrega'],
      title: 'Explicación Pago Contra Entrega (COD)',
      badge: '💵 Pago al Recibir',
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      text: `💵 *¿CÓMO FUNCIONA EL PAGO CONTRA ENTREGA?*\n\n1. Tú confirmas tu pedido hoy.\n2. Nuestro mensajero express sale para tu dirección.\n3. Te entregamos tus tenis en mano, los revisas y *pagas en efectivo o transferencia* en el momento.\n\n¡Cero riesgo para ti! 100% seguro y garantizado. 💯`,
    },
    {
      id: 'confirmar',
      command: '/confirmar',
      aliases: ['/pedido', '/datos'],
      title: 'Captura de Datos para Despacho COD',
      badge: '📦 Cerrar Envío',
      badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      text: `📦 *PARA DESPACHAR TU PAQUETE HOY MISMO, ENVÍANOS ESTOS DATOS:*\n\n• *Nombre Completo:*\n• *Teléfono de Contacto:*\n• *Provincia y Sector:*\n• *Calle y Número de Casa/Apto:*\n• *Punto de Referencia (cerca de qué colmado o lugar):*\n• *Modelo y Talla:*\n\n¡Apenas nos envíes esto, empaquetamos y te asignamos el mensajero de inmediato! 🛵💨`,
    },
    {
      id: 'seguimiento',
      command: '/seguimiento',
      aliases: ['/postventa', '/resena'],
      title: 'Seguimiento Post-Venta & Reseñas',
      badge: '⭐ Post-Venta',
      badgeColor: 'bg-teal-500/10 text-teal-400 border-teal-500/30',
      text: `¡Saludos mi líder! 👋 ¿Qué tal te quedó la pinta que recibiste de *MVP FLOW BOUTIQUE RD*?\n\nSi puedes, tómate una foto y etiquétanos en Instagram *@mvp_flow_boutique08* para repostearte. 🔥👟`,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-mvp-card border border-mvp-cardHover rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-mvp-cardHover flex items-center justify-between gap-4 bg-mvp-black/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-mvp-red to-rose-600 flex items-center justify-center shadow-glow-sm flex-shrink-0">
              <MessageSquare size={20} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black uppercase tracking-wider text-white">
                  Banco de Respuestas Rápidas
                </h3>
                <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Whaticket v1.0.0
                </span>
              </div>
              <p className="text-[11px] text-mvp-silver/70">
                Copia en 1 clic los mensajes oficiales de atención al cliente de MVP FLOW RD.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsQuickRepliesOpen(false);
                setIsQuickQuoterOpen(true);
              }}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-glow-sm"
            >
              <Zap size={13} />
              <span>Abrir Cotizador</span>
            </button>

            <button
              onClick={() => setIsQuickRepliesOpen(false)}
              className="p-2 text-mvp-muted hover:text-white rounded-xl hover:bg-white/5 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Controls Bar: Asesor Name + Search Bar */}
        <div className="p-3 sm:p-4 border-b border-mvp-cardHover bg-mvp-dark flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Agent Name Input */}
          <div className="flex items-center gap-2 bg-mvp-black px-3 py-2 rounded-xl border border-mvp-cardHover">
            <User size={15} className="text-mvp-red flex-shrink-0" />
            <span className="text-xs font-bold text-mvp-silver whitespace-nowrap">Nombre de quien asiste:</span>
            <input
              type="text"
              value={agentName}
              onChange={(e) => {
                setAgentName(e.target.value);
                localStorage.setItem('mvpflow_agent_name', e.target.value);
              }}
              placeholder="Ashley"
              className="bg-mvp-card border border-mvp-cardHover focus:border-mvp-red rounded-lg px-2.5 py-1 text-xs font-bold text-white focus:outline-none w-28 text-center"
            />
          </div>

          {/* Search Input */}
          <div className="relative flex-1 sm:max-w-xs">
            <Search size={14} className="absolute left-3 top-3 text-mvp-muted" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar atajo (/bienvenida, /despedida...)"
              className="w-full bg-mvp-black border border-mvp-cardHover focus:border-mvp-red rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-mvp-muted focus:outline-none"
            />
          </div>
        </div>

        {/* Shortcuts Grid List */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-4 bg-mvp-black/40 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredShortcuts.map((item) => {
              const isCopied = copiedId === item.id;
              return (
                <div
                  key={item.id}
                  className="bg-mvp-dark border border-mvp-cardHover hover:border-mvp-red/50 rounded-2xl p-4 space-y-3 shadow-sm transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black bg-mvp-red text-white px-2.5 py-1 rounded-lg">
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
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-glow-sm'
                            : 'bg-mvp-card hover:bg-mvp-cardHover text-white border-mvp-cardHover hover:border-white/20'
                        }`}
                      >
                        {isCopied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                        <span>{isCopied ? '¡Copiado!' : 'Copiar'}</span>
                      </button>
                    </div>

                    <h4 className="text-xs font-bold text-white/90">
                      {item.title}
                    </h4>

                    <div className="text-xs text-mvp-silver/90 bg-mvp-black/80 p-3.5 rounded-xl border border-white/5 whitespace-pre-line leading-relaxed font-sans select-all">
                      {item.text}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-mvp-muted pt-1 border-t border-white/5">
                    <span>Atajos: {item.aliases.join(', ')}</span>
                    <span className="text-mvp-red font-semibold">Listo para Whaticket</span>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredShortcuts.length === 0 && (
            <div className="text-center py-12 text-mvp-muted text-xs">
              No se encontraron respuestas rápidas con el término "{searchTerm}".
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 border-t border-mvp-cardHover bg-mvp-dark flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsQuickRepliesOpen(false);
                setIsLocalCatalogOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 hover:text-white border border-amber-500/30 text-xs font-bold transition-all"
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
            className="text-mvp-red hover:text-white font-bold flex items-center gap-1.5 transition-colors text-xs"
          >
            <BookOpen size={14} />
            <span>Ver Manual de Operaciones Completo</span>
          </button>
        </div>
      </div>
    </div>
  );
};
