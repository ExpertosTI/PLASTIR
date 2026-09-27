import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Zap, 
  Send, 
  Copy, 
  Check, 
  User, 
  Phone, 
  MapPin, 
  Plus, 
  Trash2, 
  Search, 
  ShoppingBag, 
  Sparkles, 
  MessageSquare, 
  CheckCircle2, 
  AlertCircle,
  RefreshCw,
  Clock,
  ArrowRight,
  DollarSign,
  Package,
  Layers,
  Flame,
  CheckCircle
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { DOMINICAN_ZONES } from '../data/locationsRD';

export const QuickQuoterModal = () => {
  const { 
    isQuickQuoterOpen, 
    setIsQuickQuoterOpen, 
    quoterInitialProduct, 
    setQuoterInitialProduct,
    formatMoney 
  } = useCart();

  // Agent details
  const [agentName, setAgentName] = useState(() => localStorage.getItem('plastir_agent_name') || localStorage.getItem('mvpflow_agent_name') || 'Asesor Plastir');
  
  // Customer
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedTicketId, setSelectedTicketId] = useState('');
  
  // Conversations state
  const [whaticketTickets, setWhaticketTickets] = useState([]);
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);

  // Catalog products & search
  const [catalogProducts, setCatalogProducts] = useState([]);
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('Estándar');
  const [selectedColor, setSelectedColor] = useState('Original');
  const [itemQuantity, setItemQuantity] = useState(1);
  const [customItemPrice, setCustomItemPrice] = useState('');

  // Cart / Quoted items
  const [quoteItems, setQuoteItems] = useState([]);
  
  // Shipping zone & discounts
  const [selectedZoneId, setSelectedZoneId] = useState('dn');
  const [extraDiscount, setExtraDiscount] = useState(0);
  const [quoteNotes, setQuoteNotes] = useState('');

  // UI state
  const [isCopied, setIsCopied] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [sendError, setSendError] = useState(null);
  const [createdOrderTicket, setCreatedOrderTicket] = useState(null);
  const [isConvertingOrder, setIsConvertingOrder] = useState(false);

  // Load catalog products from API on mount
  useEffect(() => {
    fetch('/api/products')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setCatalogProducts(data);
        }
      })
      .catch(() => {});
  }, []);

  // Save agent name
  useEffect(() => {
    if (agentName) localStorage.setItem('plastir_agent_name', agentName);
  }, [agentName]);

  // Load active Whaticket conversations
  const loadTickets = async () => {
    setIsLoadingTickets(true);
    try {
      const res = await fetch('/api/whaticket/tickets');
      if (res.ok) {
        const data = await res.json();
        const tickets = Array.isArray(data) ? data : data.tickets || [];
        setWhaticketTickets(tickets);
      }
    } catch {
      // Fallback
    } finally {
      setIsLoadingTickets(false);
    }
  };

  useEffect(() => {
    if (isQuickQuoterOpen) {
      loadTickets();
    }
  }, [isQuickQuoterOpen]);

  // Handle auto-population when opening modal with a specific product
  useEffect(() => {
    if (quoterInitialProduct) {
      setSelectedProduct(quoterInitialProduct);
      setSelectedSize(quoterInitialProduct.sizes?.[0] || 'Estándar');
      setSelectedColor(quoterInitialProduct.colors?.[0]?.name || 'Original');
      setCustomItemPrice(quoterInitialProduct.price || '');
      setItemQuantity(1);
    }
  }, [quoterInitialProduct]);

  // When a ticket conversation is selected from Whaticket
  const handleSelectTicket = async (ticketId) => {
    setSelectedTicketId(ticketId);
    if (!ticketId) return;

    const ticket = whaticketTickets.find((t) => String(t.id) === String(ticketId));
    if (ticket) {
      setCustomerName(ticket.contact?.name || ticket.name || '');
      const rawNum = ticket.contact?.number || ticket.number || '';
      setPhoneNumber(rawNum.replace(/\D/g, ''));

      try {
        const token = sessionStorage.getItem('plastir_admin_token') || sessionStorage.getItem('mvpflow_admin_token') || '';
        const res = await fetch(`/api/whaticket/tickets/${ticketId}/messages`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const messages = await res.json();
          if (Array.isArray(messages)) {
            const fullHistory = messages.map((m) => m.body || '').join(' ');
            for (const z of DOMINICAN_ZONES) {
              if (new RegExp(z.id, 'i').test(fullHistory) || new RegExp(z.name.slice(0, 5), 'i').test(fullHistory)) {
                setSelectedZoneId(z.id);
                break;
              }
            }
          }
        }
      } catch {
        // Fallback
      }
    }
  };

  // Filter products in instant search
  const filteredProducts = useMemo(() => {
    if (!productSearchQuery.trim()) return catalogProducts.slice(0, 10);
    const q = productSearchQuery.toLowerCase();
    return catalogProducts.filter((p) =>
      p.name?.toLowerCase().includes(q) ||
      p.sku?.toLowerCase().includes(q) ||
      p.department?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q)
    ).slice(0, 12);
  }, [catalogProducts, productSearchQuery]);

  const handleSelectProduct = (prod) => {
    setSelectedProduct(prod);
    setSelectedSize(prod.sizes?.[0] || 'Estándar');
    setSelectedColor(prod.colors?.[0]?.name || 'Original');
    setCustomItemPrice(prod.price || '');
  };

  // Add item to quote
  const handleAddProductToQuote = () => {
    if (!selectedProduct) return;
    const finalPrice = customItemPrice !== '' ? Number(customItemPrice) : Number(selectedProduct.price || 0);

    const newItem = {
      id: `${selectedProduct.id}-${Date.now()}`,
      productId: selectedProduct.id,
      name: selectedProduct.name,
      size: selectedSize,
      color: selectedColor,
      price: finalPrice,
      quantity: Number(itemQuantity) || 1,
      image: selectedProduct.images?.[0] || selectedProduct.image,
      sku: selectedProduct.sku || selectedProduct.id,
    };

    setQuoteItems((prev) => [...prev, newItem]);
    setSelectedProduct(null);
    setProductSearchQuery('');
    setCustomItemPrice('');
    setItemQuantity(1);
  };

  const handleRemoveQuoteItem = (itemId) => {
    setQuoteItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  // Selected Zone
  const currentZone = DOMINICAN_ZONES.find((z) => z.id === selectedZoneId) || DOMINICAN_ZONES[0];

  // Financial calculations
  const subtotal = useMemo(() => {
    return quoteItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [quoteItems]);

  const calculatedShippingCost = useMemo(() => {
    if (subtotal >= 4500) return 0;
    return currentZone.fee || 250;
  }, [subtotal, currentZone]);

  const total = useMemo(() => {
    return Math.max(0, subtotal + calculatedShippingCost - Number(extraDiscount || 0));
  }, [subtotal, calculatedShippingCost, extraDiscount]);

  // Formatted Quotation Message
  const formattedQuoteText = useMemo(() => {
    const itemsList = quoteItems
      .map(
        (it, idx) =>
          `*${idx + 1}. ${it.name}*\n` +
          `   • Presentación: ${it.size} | Color: ${it.color}\n` +
          `   • Cantidad: ${it.quantity} unid.\n` +
          `   • Precio: RD$ ${it.price.toLocaleString('es-DO')} c/u (Total: RD$ ${(it.price * it.quantity).toLocaleString('es-DO')})`
      )
      .join('\n\n');

    return (
      `⚡ *COTIZACIÓN OFICIAL — PLASTIR RD* ⚡\n` +
      `🏢 *Artículos para el Hogar, Organización & Plásticos*\n` +
      `👤 *Cliente / Solicitante:* ${customerName || 'Estimado/a Cliente'}\n` +
      `👩‍💼 *Asesor/a:* ${agentName}\n` +
      `📅 *Fecha:* ${new Date().toLocaleDateString('es-DO')}\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━━\n` +
      `📦 *ARTÍCULOS COTIZADOS:*\n` +
      `━━━━━━━━━━━━━━━━━━━━━━\n\n` +
      (itemsList || '• Sin artículos seleccionados') +
      `\n\n━━━━━━━━━━━━━━━━━━━━━━\n` +
      `💰 *RESUMEN DE PAGO:*\n` +
      `━━━━━━━━━━━━━━━━━━━━━━\n` +
      `• Subtotal: RD$ ${subtotal.toLocaleString('es-DO')}\n` +
      (extraDiscount > 0 ? `• Descuento por Volumen: - RD$ ${Number(extraDiscount).toLocaleString('es-DO')}\n` : '') +
      `• Envío (${currentZone.name}): ${calculatedShippingCost === 0 ? '*¡GRATIS!*' : `RD$ ${calculatedShippingCost.toLocaleString('es-DO')}`}\n` +
      `\n👉 *TOTAL FINAL: RD$ ${total.toLocaleString('es-DO')}*\n\n` +
      `📍 *DESTINO Y ENTREGA:*\n` +
      `• Zona: ${currentZone.name}\n` +
      `• Tiempo estimado: ${currentZone.estimatedDelivery || currentZone.estimatedHours || '2 a 4 horas'}\n` +
      `• Forma de Pago: *Pago Contra Entrega / Transferencia*\n` +
      (quoteNotes ? `\n📝 *Nota:* ${quoteNotes}\n` : '') +
      `\n🛡️ *Garantía Plastir:* 100% Plásticos vírgenes de alta resistencia, libres de BPA. Reposición directa garantizada ante cualquier inconformidad de fábrica.\n\n` +
      `¿Deseas confirmar este pedido? Responde *SÍ* o facilítanos tus datos de entrega para despacharte de inmediato. 🚚`
    );
  }, [quoteItems, customerName, agentName, subtotal, extraDiscount, currentZone, calculatedShippingCost, total, quoteNotes]);

  // Send Quote via Chat API
  const handleSendQuote = async () => {
    if (!phoneNumber) {
      alert('Por favor ingresa un número de teléfono o WhatsApp para el cliente.');
      return;
    }

    setIsSending(true);
    setSendSuccess(false);
    setSendError(null);

    try {
      const cleanPhone = phoneNumber.replace(/\D/g, '');
      const formattedPhone = cleanPhone.length === 10 ? `1${cleanPhone}` : cleanPhone;
      const token = sessionStorage.getItem('plastir_admin_token') || sessionStorage.getItem('mvpflow_admin_token') || '';

      const res = await fetch('/api/whaticket/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          ticketId: selectedTicketId || undefined,
          number: formattedPhone,
          message: formattedQuoteText,
        }),
      });

      if (res.ok) {
        setSendSuccess(true);
        setTimeout(() => setSendSuccess(false), 5000);
      } else {
        const err = await res.json().catch(() => ({}));
        setSendError(err.message || 'No se pudo enviar por Whaticket. Copia el texto para enviarlo por WhatsApp web.');
      }
    } catch {
      setSendError('Error de conexión con el servicio de mensajería.');
    } finally {
      setIsSending(false);
    }
  };

  // Copy to clipboard
  const handleCopyQuote = () => {
    navigator.clipboard.writeText(formattedQuoteText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Convert Quote into an official Order
  const handleConvertToOrder = async () => {
    if (quoteItems.length === 0) return;
    setIsConvertingOrder(true);

    const trackingId = `PLASTIR-${Math.floor(100000 + Math.random() * 900000)}`;

    const newOrder = {
      trackingId,
      createdAt: new Date().toISOString(),
      status: 'received',
      agentName: agentName,
      customer: {
        name: customerName || 'Cliente Cotización',
        phone: phoneNumber || '',
      },
      shipping: {
        municipality: currentZone.name,
        zoneName: currentZone.name,
        address: quoteNotes || 'Dirección acordada por chat',
        cost: calculatedShippingCost,
      },
      payment: {
        method: 'cash_cod',
        subtotal: subtotal,
        total: total,
      },
      items: quoteItems.map((item) => ({
        id: item.productId,
        name: item.name,
        price: item.price,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        image: item.image,
      })),
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder),
      });

      if (res.ok) {
        setCreatedOrderTicket(trackingId);
      } else {
        // Fallback local
        const local = JSON.parse(localStorage.getItem('plastir_orders') || '[]');
        local.unshift(newOrder);
        localStorage.setItem('plastir_orders', JSON.stringify(local));
        setCreatedOrderTicket(trackingId);
      }
    } catch {
      const local = JSON.parse(localStorage.getItem('plastir_orders') || '[]');
      local.unshift(newOrder);
      localStorage.setItem('plastir_orders', JSON.stringify(local));
      setCreatedOrderTicket(trackingId);
    } finally {
      setIsConvertingOrder(false);
    }
  };

  if (!isQuickQuoterOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[95vh] flex flex-col animate-fade-in">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center text-[#F16100] shadow-sm">
              <Zap size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black uppercase tracking-tight text-slate-900">
                  Cotizador Rápido B2B & Ventas
                </h2>
                <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                  PLASTIR RD
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Arma presupuestos al instante y envíalos directamente por WhatsApp al cliente.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <User size={13} className="text-[#F16100]" />
              <span className="text-[11px] text-slate-500 font-medium">Asesor/a:</span>
              <input
                type="text"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                placeholder="Nombre"
                className="bg-transparent text-[11px] font-bold text-slate-900 focus:outline-none w-24 text-center border-b border-orange-300"
              />
            </div>

            <button
              onClick={() => setIsQuickQuoterOpen(false)}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content Body: 2 Columns */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* Left Column: Form & Product Selector (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* 1. Customer Picker */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <User size={14} className="text-[#F16100]" />
                  1. Datos del Cliente
                </span>

                {whaticketTickets.length > 0 && (
                  <button
                    onClick={loadTickets}
                    disabled={isLoadingTickets}
                    className="flex items-center gap-1 text-[10px] text-slate-600 hover:text-slate-900 bg-white px-2 py-1 rounded-lg border border-slate-200 shadow-sm"
                  >
                    <RefreshCw size={11} className={isLoadingTickets ? 'animate-spin' : ''} />
                    <span>Recargar Chats</span>
                  </button>
                )}
              </div>

              {/* Quick chat picker if available */}
              {whaticketTickets.length > 0 && (
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                    Cargar desde conversación activa:
                  </label>
                  <select
                    value={selectedTicketId}
                    onChange={(e) => handleSelectTicket(e.target.value)}
                    className="w-full bg-white border border-slate-200 focus:border-[#F16100] rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                  >
                    <option value="">-- Seleccionar cliente de la lista --</option>
                    {whaticketTickets.map((t) => {
                      const name = t.contact?.name || t.name || 'Sin Nombre';
                      const num = t.contact?.number || t.number || '';
                      return (
                        <option key={t.id} value={t.id}>
                          {name} ({num})
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}

              {/* Manual inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                    Nombre o Empresa:
                  </label>
                  <div className="relative">
                    <User size={14} className="absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Ej. María Pérez / Ferretería Central"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full bg-white border border-slate-200 focus:border-[#F16100] rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                    WhatsApp del Cliente:
                  </label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Ej. 809-656-0219"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full bg-white border border-slate-200 focus:border-[#F16100] rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Intelligent Product Search & Picker */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <ShoppingBag size={14} className="text-[#F16100]" />
                  2. Buscar y Agregar Artículo
                </span>
                <span className="text-[10px] text-slate-400">
                  {catalogProducts.length} productos en catálogo
                </span>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="🔍 Buscar por nombre, cajas, herméticos, zafacones, sillas o SKU..."
                  value={productSearchQuery}
                  onChange={(e) => setProductSearchQuery(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-[#F16100] rounded-xl pl-9 pr-8 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none shadow-sm"
                />
                {productSearchQuery && (
                  <button
                    onClick={() => setProductSearchQuery('')}
                    className="absolute right-2.5 top-2 text-xs text-slate-400 hover:text-slate-700"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Instant Search Grid Results */}
              <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1 border border-slate-200 rounded-xl p-1.5 bg-white">
                {filteredProducts.map((p) => {
                  const isSelected = selectedProduct?.id === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => handleSelectProduct(p)}
                      className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-orange-50 border border-[#F16100]'
                          : 'bg-slate-50/70 hover:bg-slate-100 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={p.images?.[0] || '/logo.PNG'}
                          alt={p.name}
                          className="w-9 h-9 rounded-lg object-cover border border-slate-200 bg-white flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">{p.name}</p>
                          <p className="text-[10px] text-slate-500">
                            {p.capacity ? `${p.capacity} • ` : ''}SKU: {p.sku || p.id}
                          </p>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0 pl-2">
                        <span className="text-xs font-mono font-bold text-[#F16100] block">
                          RD$ {Number(p.price).toLocaleString('es-DO')}
                        </span>
                        {isSelected && (
                          <span className="text-[9px] text-emerald-600 font-bold uppercase">
                            Seleccionado ✓
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Customizer for selected product */}
              {selectedProduct && (
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-3 animate-fade-in shadow-sm">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                    <span className="text-[#F16100]">Artículo a Cotizar:</span>
                    <span className="truncate">{selectedProduct.name}</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                        Presentación / Medida:
                      </label>
                      <select
                        value={selectedSize}
                        onChange={(e) => setSelectedSize(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-[#F16100] rounded-xl px-2 py-1.5 text-xs text-slate-900"
                      >
                        {(selectedProduct.sizes || ['Estándar', 'Pack x 3', 'Pack x 6', 'Bulto Cerrado']).map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                        Color:
                      </label>
                      <select
                        value={selectedColor}
                        onChange={(e) => setSelectedColor(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-[#F16100] rounded-xl px-2 py-1.5 text-xs text-slate-900"
                      >
                        {(selectedProduct.colors || [{ name: 'Original' }]).map((c, idx) => (
                          <option key={idx} value={c.name || c}>{c.name || c}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                        Precio Unitario (RD$):
                      </label>
                      <input
                        type="number"
                        value={customItemPrice}
                        onChange={(e) => setCustomItemPrice(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-[#F16100] rounded-xl px-2 py-1.5 text-xs text-slate-900 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                        Cantidad:
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={itemQuantity}
                        onChange={(e) => setItemQuantity(Math.max(1, Number(e.target.value)))}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-[#F16100] rounded-xl px-2 py-1.5 text-xs text-slate-900 text-center"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddProductToQuote}
                    className="w-full py-2 bg-[#F16100] hover:bg-[#E05300] text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-98"
                  >
                    <Plus size={15} />
                    <span>Agregar a la Cotización</span>
                  </button>
                </div>
              )}

              {/* Items in quote */}
              {quoteItems.length > 0 && (
                <div className="space-y-1.5 pt-2">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                    Artículos en esta Cotización ({quoteItems.length}):
                  </span>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {quoteItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-8 h-8 rounded-lg object-cover border border-slate-200"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate">{item.name}</p>
                            <p className="text-[10px] text-slate-500">
                              {item.size} | Color: {item.color} | Cant: {item.quantity}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono font-bold text-slate-900">
                            RD$ {(item.price * item.quantity).toLocaleString('es-DO')}
                          </span>
                          <button
                            onClick={() => handleRemoveQuoteItem(item.id)}
                            className="p-1 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 3. Shipping & Discounts */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 shadow-sm">
              <span className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <MapPin size={14} className="text-[#F16100]" />
                3. Destino de Entrega & Descuentos
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                    Zona de Entrega en RD:
                  </label>
                  <select
                    value={selectedZoneId}
                    onChange={(e) => setSelectedZoneId(e.target.value)}
                    className="w-full bg-white border border-slate-200 focus:border-[#F16100] rounded-xl px-3 py-2 text-xs text-slate-900"
                  >
                    {DOMINICAN_ZONES.map((z) => (
                      <option key={z.id} value={z.id}>
                        {z.name} (RD$ {z.fee} • {z.estimatedDelivery || z.estimatedHours || '2 a 4h'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                    Descuento por Volumen (RD$):
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={extraDiscount}
                    onChange={(e) => setExtraDiscount(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 focus:border-[#F16100] rounded-xl px-3 py-2 text-xs text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                  Notas de Entrega / Referencia:
                </label>
                <input
                  type="text"
                  placeholder="Ej. Entregar en almacén / Frente a la estación..."
                  value={quoteNotes}
                  onChange={(e) => setQuoteNotes(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-[#F16100] rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400"
                />
              </div>
            </div>

          </div>

          {/* Right Column: Live Message Preview & 1-Click Dispatch (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col space-y-4">
            
            {/* Financial Summary Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5 shadow-sm">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>Subtotal Artículos:</span>
                <span className="font-mono text-slate-900 font-bold">RD$ {subtotal.toLocaleString('es-DO')}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>Envío ({currentZone.name}):</span>
                <span className="font-mono text-emerald-600 font-bold">
                  {calculatedShippingCost === 0 ? '¡GRATIS!' : `RD$ ${calculatedShippingCost.toLocaleString('es-DO')}`}
                </span>
              </div>
              {extraDiscount > 0 && (
                <div className="flex items-center justify-between text-xs text-emerald-600 font-bold">
                  <span>Descuento Volumen:</span>
                  <span className="font-mono">- RD$ {Number(extraDiscount).toLocaleString('es-DO')}</span>
                </div>
              )}
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-black uppercase text-[#F16100] block">TOTAL A PAGAR:</span>
                  <span className="text-[10px] text-slate-500">Pago Contra Entrega</span>
                </div>
                <span className="text-xl font-mono font-black text-slate-900">
                  RD$ {total.toLocaleString('es-DO')}
                </span>
              </div>
            </div>

            {/* Live Chat Message Preview */}
            <div className="flex-1 bg-white border border-slate-200 rounded-2xl p-3.5 flex flex-col shadow-sm">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Vista Previa del Mensaje
                </span>
                <button
                  onClick={handleCopyQuote}
                  className="flex items-center gap-1 text-[11px] text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded-lg transition-all"
                >
                  {isCopied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                  <span>{isCopied ? '¡Copiado!' : 'Copiar'}</span>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto text-[11px] font-mono whitespace-pre-wrap text-slate-800 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200 select-all max-h-72">
                {formattedQuoteText}
              </div>
            </div>

            {/* Error or Success notification */}
            {sendSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs flex items-center gap-2 animate-fade-in">
                <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
                <span>¡Cotización enviada exitosamente por chat!</span>
              </div>
            )}
            {sendError && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
                <span>{sendError}</span>
              </div>
            )}
            {createdOrderTicket && (
              <div className="bg-orange-50 border border-orange-200 text-orange-900 p-3 rounded-xl text-xs flex items-center justify-between animate-fade-in">
                <div className="flex items-center gap-2">
                  <Package size={16} className="text-[#F16100]" />
                  <span>Pedido generado: <strong>#{createdOrderTicket}</strong></span>
                </div>
                <button
                  onClick={() => setIsQuickQuoterOpen(false)}
                  className="text-[#F16100] underline font-bold"
                >
                  Listo
                </button>
              </div>
            )}

            {/* 1-Click Action Buttons */}
            <div className="space-y-2 pt-1">
              <button
                onClick={handleSendQuote}
                disabled={isSending || quoteItems.length === 0}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isSending ? (
                  <>
                    <RefreshCw size={15} className="animate-spin" />
                    <span>Despachando por Chat...</span>
                  </>
                ) : (
                  <>
                    <Send size={15} />
                    <span>Enviar Cotización por Chat</span>
                  </>
                )}
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleConvertToOrder}
                  disabled={isConvertingOrder || quoteItems.length === 0}
                  className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs uppercase tracking-wider rounded-xl border border-slate-200 flex items-center justify-center gap-1.5 transition-all"
                >
                  <Package size={14} className="text-[#F16100]" />
                  <span>Crear Orden</span>
                </button>

                <button
                  onClick={handleCopyQuote}
                  className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs uppercase tracking-wider rounded-xl border border-slate-200 flex items-center justify-center gap-1.5 transition-all"
                >
                  {isCopied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  <span>{isCopied ? '¡Copiado!' : 'Copiar Texto'}</span>
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default QuickQuoterModal;
