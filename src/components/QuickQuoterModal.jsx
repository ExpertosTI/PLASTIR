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
  const [agentName, setAgentName] = useState(() => localStorage.getItem('mvpflow_agent_name') || 'Ventas MVP Flow');
  
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
  const [selectedSize, setSelectedSize] = useState('40 (8)');
  const [selectedColor, setSelectedColor] = useState('Original');
  const [itemQuantity, setItemQuantity] = useState(1);
  const [customItemPrice, setCustomItemPrice] = useState('');

  // Quoted items list
  const [quoteItems, setQuoteItems] = useState([]);

  // Shipping & Pricing
  const [selectedZoneId, setSelectedZoneId] = useState(DOMINICAN_ZONES[0]?.id || 'dn');
  const [customShippingCost, setCustomShippingCost] = useState('');
  const [extraDiscount, setExtraDiscount] = useState(0);
  const [quoteNotes, setQuoteNotes] = useState('');

  // UI status states
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [sendError, setSendError] = useState(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isConvertingOrder, setIsConvertingOrder] = useState(false);
  const [createdOrderTicket, setCreatedOrderTicket] = useState(null);

  // Persist agent name
  useEffect(() => {
    if (agentName) localStorage.setItem('mvpflow_agent_name', agentName);
  }, [agentName]);

  // Load products when opening
  useEffect(() => {
    if (isQuickQuoterOpen) {
      loadProducts();
      loadTickets();
    }
  }, [isQuickQuoterOpen]);

  // Handle initial product passed from Catalog
  useEffect(() => {
    if (quoterInitialProduct && isQuickQuoterOpen) {
      const defaultSize = quoterInitialProduct.sizes?.[0] || '40 (8)';
      const defaultColor = quoterInitialProduct.colors?.[0]?.name || 'Original';
      
      setQuoteItems([
        {
          id: `${quoterInitialProduct.id}-${Date.now()}`,
          productId: quoterInitialProduct.id,
          name: quoterInitialProduct.name,
          price: Number(quoterInitialProduct.price),
          size: defaultSize,
          color: defaultColor,
          quantity: 1,
          image: quoterInitialProduct.images?.[0] || '/img/drop-1.jpg',
        }
      ]);
      setQuoterInitialProduct(null);
    }
  }, [quoterInitialProduct, isQuickQuoterOpen, setQuoterInitialProduct]);

  const loadProducts = async () => {
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setCatalogProducts(data);
          if (!selectedProduct && data.length > 0) {
            handleSelectProduct(data[0]);
          }
        }
      }
    } catch {}
  };

  const loadTickets = async () => {
    setIsLoadingTickets(true);
    try {
      const token = sessionStorage.getItem('mvpflow_admin_token') || '';
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const res = await fetch('/api/whaticket/tickets?status=open', { headers });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.tickets)) {
          setWhaticketTickets(data.tickets);
        } else if (Array.isArray(data)) {
          setWhaticketTickets(data);
        }
      }
    } catch {
    } finally {
      setIsLoadingTickets(false);
    }
  };

  const handleSelectTicket = (ticketId) => {
    setSelectedTicketId(ticketId);
    if (!ticketId) return;
    const found = whaticketTickets.find((t) => String(t.id) === String(ticketId));
    if (found) {
      const name = found.contact?.name || found.name || '';
      const phone = found.contact?.number || found.number || '';
      if (name) setCustomerName(name);
      if (phone) setPhoneNumber(phone);
    }
  };

  // Filter catalog products for search
  const filteredProducts = useMemo(() => {
    if (!productSearchQuery.trim()) {
      return catalogProducts.slice(0, 8);
    }
    const q = productSearchQuery.toLowerCase();
    return catalogProducts.filter((p) => 
      p.name?.toLowerCase().includes(q) ||
      p.sku?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q) ||
      p.tag?.toLowerCase().includes(q)
    );
  }, [catalogProducts, productSearchQuery]);

  const handleSelectProduct = (prod) => {
    setSelectedProduct(prod);
    setSelectedSize(prod.sizes?.[0] || '40 (8)');
    setSelectedColor(prod.colors?.[0]?.name || 'Original');
    setCustomItemPrice(String(prod.price));
  };

  const handleAddProductToQuote = () => {
    if (!selectedProduct) return;

    const price = Number(customItemPrice) > 0 ? Number(customItemPrice) : selectedProduct.price;
    const newItem = {
      id: `${selectedProduct.id}-${selectedSize}-${selectedColor}-${Date.now()}`,
      productId: selectedProduct.id,
      name: selectedProduct.name,
      price: price,
      size: selectedSize,
      color: selectedColor,
      quantity: Number(itemQuantity) || 1,
      image: selectedProduct.images?.[0] || '/img/drop-1.jpg',
    };

    setQuoteItems((prev) => [...prev, newItem]);
  };

  const handleRemoveQuoteItem = (itemId) => {
    setQuoteItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  // Shipping calculation
  const currentZone = useMemo(() => {
    return DOMINICAN_ZONES.find((z) => z.id === selectedZoneId) || DOMINICAN_ZONES[0] || {
      name: 'Distrito Nacional',
      fee: 200,
      estimatedDelivery: '2 a 4 horas',
    };
  }, [selectedZoneId]);

  const calculatedShippingCost = useMemo(() => {
    if (customShippingCost !== '') {
      return Number(customShippingCost);
    }
    const sub = quoteItems.reduce((acc, i) => acc + i.price * i.quantity, 0);
    if (sub >= 3000) return 0;
    return currentZone.fee || 200;
  }, [customShippingCost, quoteItems, currentZone]);

  const subtotal = quoteItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = Math.max(0, subtotal + calculatedShippingCost - Number(extraDiscount || 0));

  // Formatted quote message
  const formattedQuoteText = useMemo(() => {
    const itemsList = quoteItems
      .map(
        (item, idx) =>
          `${idx + 1}. 👟 *${item.name}*\n   • Talla: ${item.size} | Color: ${item.color}\n   • Cant: ${item.quantity} x RD$ ${item.price.toLocaleString('es-DO')} = *RD$ ${(item.price * item.quantity).toLocaleString('es-DO')}*`
      )
      .join('\n\n');

    return (
      `⚡ *COTIZACIÓN OFICIAL — PLASTIR RD* ⚡\n` +
      `🏢 *Tienda por Departamentos (Plásticos & Organización)*\n` +
      `👤 *Cliente / Empresa:* ${customerName || 'Estimado/a Cliente'}\n` +
      `👩‍💼 *Asesor/a:* ${agentName}\n` +
      `📅 *Fecha:* ${new Date().toLocaleDateString('es-DO')}\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━━\n` +
      `📦 *ARTÍCULOS COTIZADOS:*\n` +
      `━━━━━━━━━━━━━━━━━━━━━━\n\n` +
      (itemsList || '• Sin artículos seleccionados') +
      `\n\n━━━━━━━━━━━━━━━━━━━━━━\n` +
      `💰 *RESUMEN DE PAGO (COD / FISCAL):*\n` +
      `━━━━━━━━━━━━━━━━━━━━━━\n` +
      `• Subtotal: RD$ ${subtotal.toLocaleString('es-DO')}\n` +
      (extraDiscount > 0 ? `• Descuento Mayorista B2B: - RD$ ${Number(extraDiscount).toLocaleString('es-DO')}\n` : '') +
      `• Envío (${currentZone.name}): ${calculatedShippingCost === 0 ? '*¡GRATIS!*' : `RD$ ${calculatedShippingCost.toLocaleString('es-DO')}`}\n` +
      `\n👉 *TOTAL FINAL: RD$ ${total.toLocaleString('es-DO')}*\n\n` +
      `📍 *DESTINO Y ENTREGA:*\n` +
      `• Zona: ${currentZone.name}\n` +
      `• Tiempo estimado: ${currentZone.estimatedDelivery || currentZone.estimatedHours || '2 a 4 horas'}\n` +
      `• Forma de Pago: *Pago Contra Entrega / Transferencia / Factura Fiscal B01*\n` +
      (quoteNotes ? `\n📝 *Nota:* ${quoteNotes}\n` : '') +
      `\n🛡️ *Garantía Plastir:* 100% Plásticos vírgenes de alta resistencia, libres de BPA. Reposición inmediata garantizada ante cualquier defecto.\n\n` +
      `¿Deseas confirmar este pedido? Responde *SÍ* o facilítanos tus datos de facturación y entrega para despacharte de inmediato. 🚚💨`
    );
  }, [quoteItems, customerName, agentName, subtotal, extraDiscount, currentZone, calculatedShippingCost, total, quoteNotes]);

  // Send Quote via Chat API
  const handleSendQuote = async () => {
    if (!phoneNumber) {
      alert('Por favor ingresa un número de teléfono o WhatsApp para el cliente.');
      return;
    }
    if (quoteItems.length === 0) {
      alert('Por favor agrega al menos un producto a la cotización.');
      return;
    }

    setIsSending(true);
    setSendSuccess(false);
    setSendError(null);

    const quotePayload = {
      quoteNumber: `COT-${Date.now().toString().slice(-4)}`,
      customerName: customerName || 'Cliente',
      agentName: agentName,
      items: quoteItems,
      subtotal: subtotal,
      shippingCost: calculatedShippingCost,
      discount: Number(extraDiscount || 0),
      total: total,
      deliveryZone: currentZone.name,
      deliveryTime: currentZone.estimatedDelivery || currentZone.estimatedHours || '2 a 4 horas',
      paymentMethod: 'Pago Contra Entrega (Efectivo al Mensajero)',
      notes: quoteNotes,
    };

    try {
      const token = sessionStorage.getItem('mvpflow_admin_token') || '';
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      };

      const res = await fetch('/api/whaticket/send-quote', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          phoneNumber: phoneNumber,
          customerName: customerName || 'Cliente',
          agentName: agentName,
          quoteData: quotePayload,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSendSuccess(true);
        setTimeout(() => setSendSuccess(false), 6000);
      } else {
        setSendError(data.message || 'Error al enviar por el canal de chat.');
      }
    } catch (err) {
      setSendError(err.message || 'Error de conexión.');
    } finally {
      setIsSending(false);
    }
  };

  const handleCopyQuote = () => {
    navigator.clipboard.writeText(formattedQuoteText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Convert Quote into Confirmed Autopedido Ticket
  const handleConvertToOrder = async () => {
    if (!customerName || !phoneNumber) {
      alert('Se requiere nombre y teléfono del cliente para generar el ticket de entrega.');
      return;
    }
    if (quoteItems.length === 0) {
      alert('Agrega al menos un producto.');
      return;
    }

    setIsConvertingOrder(true);
    const trackingId = `MVP-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder = {
      trackingId,
      date: new Date().toISOString(),
      status: 'received',
      agentName: agentName,
      customer: {
        name: customerName,
        phone: phoneNumber,
      },
      shipping: {
        municipality: currentZone.name,
        zoneName: currentZone.name,
        address: quoteNotes || 'Dirección acordada por chat',
        cost: calculatedShippingCost,
      },
      payment: {
        method: 'cod',
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
      }
    } catch {
      setCreatedOrderTicket(trackingId);
    } finally {
      setIsConvertingOrder(false);
    }
  };

  if (!isQuickQuoterOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-5xl bg-gradient-to-b from-mvp-card via-mvp-dark to-mvp-black border border-mvp-cardHover rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[95vh] flex flex-col text-white">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-mvp-cardHover bg-mvp-dark flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-mvp-red to-mvp-crimson flex items-center justify-center shadow-glow-red flex-shrink-0">
              <Zap size={20} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-white">
                  COTIZADOR RÁPIDO EXPRESS
                </h2>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Despacho 1-Clic
                </span>
              </div>
              <p className="text-[11px] text-mvp-silver/70">
                Arma cotizaciones instantáneas con flete COD y envíalas directamente al cliente.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 bg-mvp-black px-3 py-1.5 rounded-xl border border-mvp-cardHover">
              <User size={13} className="text-mvp-red" />
              <span className="text-[11px] text-mvp-silver">Asesora:</span>
              <input
                type="text"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                placeholder="Ashley"
                className="bg-transparent text-[11px] font-bold text-white focus:outline-none w-20 text-center border-b border-mvp-red/40"
              />
            </div>

            <button
              onClick={() => setIsQuickQuoterOpen(false)}
              className="p-2 text-mvp-muted hover:text-white rounded-xl hover:bg-white/5 transition-colors"
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
            <div className="bg-mvp-dark/80 border border-mvp-cardHover rounded-2xl p-4 space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-mvp-red flex items-center gap-1.5">
                  <User size={14} />
                  1. Datos del Cliente
                </span>

                {whaticketTickets.length > 0 && (
                  <button
                    onClick={loadTickets}
                    disabled={isLoadingTickets}
                    className="flex items-center gap-1 text-[10px] text-mvp-muted hover:text-white bg-mvp-black px-2 py-1 rounded-lg border border-white/5"
                  >
                    <RefreshCw size={11} className={isLoadingTickets ? 'animate-spin' : ''} />
                    <span>Recargar Chats</span>
                  </button>
                )}
              </div>

              {/* Quick chat picker if available */}
              {whaticketTickets.length > 0 && (
                <div>
                  <label className="block text-[10px] uppercase font-bold text-mvp-muted mb-1">
                    Cargar desde conversación activa:
                  </label>
                  <select
                    value={selectedTicketId}
                    onChange={(e) => handleSelectTicket(e.target.value)}
                    className="w-full bg-mvp-black border border-mvp-cardHover focus:border-mvp-red rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
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
                  <label className="block text-[10px] uppercase font-bold text-mvp-muted mb-1">
                    Nombre del Cliente:
                  </label>
                  <div className="relative">
                    <User size={14} className="absolute left-3 top-2.5 text-mvp-muted" />
                    <input
                      type="text"
                      placeholder="Ej. Kelvin Rosario"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full bg-mvp-black border border-mvp-cardHover focus:border-mvp-red rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-mvp-muted focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-mvp-muted mb-1">
                    WhatsApp del Cliente:
                  </label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3 top-2.5 text-mvp-muted" />
                    <input
                      type="text"
                      placeholder="Ej. 809-656-0219"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full bg-mvp-black border border-mvp-cardHover focus:border-mvp-red rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-mvp-muted focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Intelligent Product Search & Picker */}
            <div className="bg-mvp-dark/80 border border-mvp-cardHover rounded-2xl p-4 space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <ShoppingBag size={14} />
                  2. Buscar y Agregar Prenda al Presupuesto
                </span>
                <span className="text-[10px] text-mvp-silver/60">
                  {catalogProducts.length} modelos en catálogo
                </span>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search size={15} className="absolute left-3 top-2.5 text-amber-400" />
                <input
                  type="text"
                  placeholder="🔍 Buscar por nombre, marca, tenis, hoodie o SKU..."
                  value={productSearchQuery}
                  onChange={(e) => setProductSearchQuery(e.target.value)}
                  className="w-full bg-mvp-black border border-amber-500/30 focus:border-amber-400 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-mvp-muted focus:outline-none shadow-inner"
                />
                {productSearchQuery && (
                  <button
                    onClick={() => setProductSearchQuery('')}
                    className="absolute right-2.5 top-2 text-xs text-mvp-muted hover:text-white"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Instant Search Grid Results */}
              <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1 border border-white/5 rounded-xl p-1 bg-black/40">
                {filteredProducts.map((p) => {
                  const isSelected = selectedProduct?.id === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => handleSelectProduct(p)}
                      className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-amber-500/20 border border-amber-500/50'
                          : 'bg-mvp-card/60 hover:bg-mvp-cardHover border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={p.images?.[0] || '/img/drop-1.jpg'}
                          alt={p.name}
                          className="w-9 h-9 rounded-lg object-cover border border-white/10 flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate">{p.name}</p>
                          <p className="text-[10px] text-mvp-silver/70">
                            SKU: {p.sku || p.id} • Stock: {p.stockLeft || 8}
                          </p>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0 pl-2">
                        <span className="text-xs font-mono font-bold text-emerald-400 block">
                          RD$ {Number(p.price).toLocaleString('es-DO')}
                        </span>
                        {isSelected && (
                          <span className="text-[9px] text-amber-400 font-bold uppercase">
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
                <div className="p-3 bg-mvp-black/90 rounded-xl border border-white/10 space-y-3 animate-fade-in">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <span className="text-amber-400">Prenda a Cotizar:</span>
                    <span className="truncate">{selectedProduct.name}</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-mvp-muted mb-1">
                        Talla:
                      </label>
                      <select
                        value={selectedSize}
                        onChange={(e) => setSelectedSize(e.target.value)}
                        className="w-full bg-mvp-dark border border-mvp-cardHover focus:border-amber-400 rounded-xl px-2 py-1.5 text-xs text-white"
                      >
                        {(selectedProduct.sizes || ['39', '40', '41', '42', '43', '44']).map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-mvp-muted mb-1">
                        Color:
                      </label>
                      <select
                        value={selectedColor}
                        onChange={(e) => setSelectedColor(e.target.value)}
                        className="w-full bg-mvp-dark border border-mvp-cardHover focus:border-amber-400 rounded-xl px-2 py-1.5 text-xs text-white"
                      >
                        {(selectedProduct.colors || [{ name: 'Original Color' }]).map((c, idx) => (
                          <option key={idx} value={c.name || c}>{c.name || c}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-mvp-muted mb-1">
                        Precio (RD$):
                      </label>
                      <input
                        type="number"
                        value={customItemPrice}
                        onChange={(e) => setCustomItemPrice(e.target.value)}
                        className="w-full bg-mvp-dark border border-mvp-cardHover focus:border-amber-400 rounded-xl px-2 py-1.5 text-xs text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-mvp-muted mb-1">
                        Cantidad:
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={itemQuantity}
                        onChange={(e) => setItemQuantity(Math.max(1, Number(e.target.value)))}
                        className="w-full bg-mvp-dark border border-mvp-cardHover focus:border-amber-400 rounded-xl px-2 py-1.5 text-xs text-white text-center"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddProductToQuote}
                    className="w-full py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-98"
                  >
                    <Plus size={15} />
                    <span>Agregar a la Cotización</span>
                  </button>
                </div>
              )}

              {/* Items in quote */}
              {quoteItems.length > 0 && (
                <div className="space-y-1.5 pt-2">
                  <span className="text-[11px] font-bold text-mvp-silver uppercase tracking-wider block">
                    Prendas en esta Cotización ({quoteItems.length}):
                  </span>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {quoteItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-2 rounded-xl bg-mvp-black border border-mvp-cardHover"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-8 h-8 rounded-lg object-cover border border-white/10"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-white truncate">{item.name}</p>
                            <p className="text-[10px] text-mvp-silver/70">
                              Talla: {item.size} | Color: {item.color} | Cant: {item.quantity}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono font-bold text-white">
                            RD$ {(item.price * item.quantity).toLocaleString('es-DO')}
                          </span>
                          <button
                            onClick={() => handleRemoveQuoteItem(item.id)}
                            className="p-1 text-mvp-muted hover:text-red-400 rounded-lg hover:bg-white/5"
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
            <div className="bg-mvp-dark/80 border border-mvp-cardHover rounded-2xl p-4 space-y-3 shadow-sm">
              <span className="text-xs font-black uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <MapPin size={14} />
                3. Destino de Entrega & Descuentos
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-mvp-muted mb-1">
                    Zona de Entrega en RD:
                  </label>
                  <select
                    value={selectedZoneId}
                    onChange={(e) => setSelectedZoneId(e.target.value)}
                    className="w-full bg-mvp-black border border-mvp-cardHover focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    {DOMINICAN_ZONES.map((z) => (
                      <option key={z.id} value={z.id}>
                        {z.name} (RD$ {z.fee} • {z.estimatedDelivery || z.estimatedHours || '2 a 4h'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-mvp-muted mb-1">
                    Descuento Extra (RD$):
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={extraDiscount}
                    onChange={(e) => setExtraDiscount(Number(e.target.value))}
                    className="w-full bg-mvp-black border border-mvp-cardHover focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-mvp-muted mb-1">
                  Notas de Entrega / Referencia:
                </label>
                <input
                  type="text"
                  placeholder="Ej. Entregar después de las 2 PM / Frente a la farmacia"
                  value={quoteNotes}
                  onChange={(e) => setQuoteNotes(e.target.value)}
                  className="w-full bg-mvp-black border border-mvp-cardHover focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-white placeholder-mvp-muted"
                />
              </div>
            </div>

          </div>

          {/* Right Column: Live Message Preview & 1-Click Dispatch (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col space-y-4">
            
            {/* Financial Summary Card */}
            <div className="bg-mvp-dark border border-mvp-cardHover rounded-2xl p-4 space-y-2.5 shadow-sm">
              <div className="flex items-center justify-between text-xs text-mvp-silver">
                <span>Subtotal Prendas:</span>
                <span className="font-mono text-white font-bold">RD$ {subtotal.toLocaleString('es-DO')}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-mvp-silver">
                <span>Envío ({currentZone.name}):</span>
                <span className="font-mono text-emerald-400 font-bold">
                  {calculatedShippingCost === 0 ? '¡GRATIS!' : `RD$ ${calculatedShippingCost.toLocaleString('es-DO')}`}
                </span>
              </div>
              {extraDiscount > 0 && (
                <div className="flex items-center justify-between text-xs text-amber-400">
                  <span>Descuento Aplicado:</span>
                  <span className="font-mono font-bold">- RD$ {Number(extraDiscount).toLocaleString('es-DO')}</span>
                </div>
              )}
              <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-xs font-black uppercase text-mvp-red block">TOTAL A PAGAR (COD):</span>
                  <span className="text-[10px] text-mvp-silver/60">Paga al mensajero express</span>
                </div>
                <span className="text-xl font-mono font-black text-white">
                  RD$ {total.toLocaleString('es-DO')}
                </span>
              </div>
            </div>

            {/* Live Chat Message Preview */}
            <div className="flex-1 bg-[#0b141a] border border-emerald-500/30 rounded-2xl p-3.5 flex flex-col shadow-inner">
              <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  Vista Previa del Mensaje
                </span>
                <button
                  onClick={handleCopyQuote}
                  className="flex items-center gap-1 text-[11px] text-mvp-silver hover:text-white bg-white/5 hover:bg-white/10 px-2 py-0.5 rounded-lg transition-all"
                >
                  {isCopied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  <span>{isCopied ? '¡Copiado!' : 'Copiar'}</span>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto text-[11px] font-mono whitespace-pre-wrap text-slate-200 leading-relaxed bg-[#111b21] p-3 rounded-xl border border-white/5 select-all max-h-72">
                {formattedQuoteText}
              </div>
            </div>

            {/* Error or Success notification */}
            {sendSuccess && (
              <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 p-3 rounded-xl text-xs flex items-center gap-2 animate-fade-in">
                <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
                <span>¡Cotización enviada exitosamente al cliente por el canal de chat!</span>
              </div>
            )}
            {sendError && (
              <div className="bg-red-500/20 border border-red-500/40 text-red-300 p-3 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
                <span>{sendError}</span>
              </div>
            )}
            {createdOrderTicket && (
              <div className="bg-amber-500/20 border border-amber-500/40 text-amber-300 p-3 rounded-xl text-xs flex items-center justify-between animate-fade-in">
                <div className="flex items-center gap-2">
                  <Package size={16} className="text-amber-400" />
                  <span>Ticket generado: <strong>#{createdOrderTicket}</strong></span>
                </div>
                <a
                  href={`/?tracking=${createdOrderTicket}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-white underline font-bold"
                >
                  Ver Rastreo
                </a>
              </div>
            )}

            {/* 1-Click Action Buttons */}
            <div className="space-y-2 pt-1">
              <button
                onClick={handleSendQuote}
                disabled={isSending || quoteItems.length === 0}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-[0_4px_20px_rgba(16,185,129,0.35)] flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-98 disabled:opacity-50"
              >
                {isSending ? (
                  <>
                    <RefreshCw size={15} className="animate-spin" />
                    <span>Despachando por Chat...</span>
                  </>
                ) : (
                  <>
                    <Send size={15} />
                    <span>💬 1-Clic Enviar Cotización al Cliente</span>
                  </>
                )}
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleConvertToOrder}
                  disabled={isConvertingOrder || quoteItems.length === 0}
                  className="py-2.5 bg-mvp-card hover:bg-mvp-cardHover text-white font-bold text-xs uppercase tracking-wider rounded-xl border border-white/10 flex items-center justify-center gap-1.5 transition-all"
                >
                  <Package size={14} className="text-amber-400" />
                  <span>Crear Ticket Pedido</span>
                </button>

                <button
                  onClick={handleCopyQuote}
                  className="py-2.5 bg-mvp-card hover:bg-mvp-cardHover text-white font-bold text-xs uppercase tracking-wider rounded-xl border border-white/10 flex items-center justify-center gap-1.5 transition-all"
                >
                  {isCopied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  <span>{isCopied ? '¡Texto Copiado!' : 'Copiar Texto'}</span>
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
