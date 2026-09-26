import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Users,
  Smartphone,
  Download,
  Upload,
  RefreshCw,
  Search,
  MessageSquare,
  CheckCircle2,
  Share2,
  Phone,
  MapPin,
  DollarSign,
  ShieldCheck,
  X,
  ExternalLink,
  Sparkles,
  Zap,
  Globe,
  UserPlus,
  Copy,
  Check,
  ArrowLeftRight
} from 'lucide-react';

export const ContactSyncModal = ({ isOpen, onClose, getAuthHeaders, showToast }) => {
  const [contacts, setContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [copiedPhone, setCopiedPhone] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncingWhaticket, setIsSyncingWhaticket] = useState(false);
  const [isFullSyncing, setIsFullSyncing] = useState(false);
  const [isUploadingDevice, setIsUploadingDevice] = useState(false);
  const [contactPrefix, setContactPrefix] = useState('MVP Cliente - ');
  const [syncFeedback, setSyncFeedback] = useState(null);
  const fileInputRef = useRef(null);

  // New Contact Creation Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newContact, setNewContact] = useState({
    name: '',
    phone: '',
    city: 'Santo Domingo',
    address: '',
    note: '',
  });
  const [isCreating, setIsCreating] = useState(false);
  const [createFeedback, setCreateFeedback] = useState(null);

  const fetchContacts = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/contacts/list', {
        headers: getAuthHeaders ? getAuthHeaders() : {},
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.contacts)) {
          setContacts(data.contacts);
        }
      }
    } catch (err) {
      console.error('Error fetching contacts:', err);
    } finally {
      setIsLoading(false);
    }
  }, [getAuthHeaders]);

  useEffect(() => {
    if (isOpen) {
      fetchContacts();
    }
  }, [isOpen, fetchContacts]);

  const handleSyncWhaticket = async () => {
    setIsSyncingWhaticket(true);
    setSyncFeedback(null);
    try {
      const res = await fetch('/api/contacts/sync-whaticket', {
        method: 'POST',
        headers: getAuthHeaders ? getAuthHeaders() : {},
      });
      const data = await res.json();
      if (data.success) {
        setSyncFeedback(data.message || '✔ Contactos sincronizados con Whaticket.');
        if (showToast) showToast('✔ Contactos sincronizados con Whaticket.');
        fetchContacts();
      } else {
        alert(data.message || 'Error al sincronizar con Whaticket.');
      }
    } catch (err) {
      alert('Error de conexión al sincronizar contactos.');
    } finally {
      setIsSyncingWhaticket(false);
    }
  };

  const handleFullTwoWaySync = async () => {
    setIsFullSyncing(true);
    setSyncFeedback(null);
    try {
      const res = await fetch('/api/contacts/sync-full', {
        method: 'POST',
        headers: getAuthHeaders ? getAuthHeaders() : {},
      });
      const data = await res.json();
      if (data.success) {
        setSyncFeedback(data.message || '✔ Sincronización bidireccional completada con éxito.');
        if (showToast) showToast(data.message || '✔ Sincronización bidireccional completada.');
        fetchContacts();
      } else {
        alert(data.error || 'Error durante la sincronización.');
      }
    } catch (err) {
      alert('Error de conexión: ' + err.message);
    } finally {
      setIsFullSyncing(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingDevice(true);
    setSyncFeedback(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const fileContent = event.target?.result;
        const res = await fetch('/api/contacts/import-device', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(getAuthHeaders ? getAuthHeaders() : {}),
          },
          body: JSON.stringify({
            fileContent,
            fileName: file.name,
            syncToWhaticket: true,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setSyncFeedback(data.message || '✔ Contactos importados y sincronizados.');
          if (showToast) showToast(data.message || '✔ Contactos sincronizados con éxito.');
          fetchContacts();
        } else {
          alert(data.message || 'No se pudieron importar los contactos.');
        }
      } catch (err) {
        alert('Error al leer el archivo de contactos: ' + err.message);
      } finally {
        setIsUploadingDevice(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };

    reader.onerror = () => {
      alert('Error al leer el archivo seleccionado.');
      setIsUploadingDevice(false);
    };

    reader.readAsText(file);
  };

  const handleCreateContact = async (e) => {
    e.preventDefault();
    if (!newContact.phone.trim()) {
      alert('Por favor ingresa el número de teléfono o WhatsApp del cliente.');
      return;
    }
    setIsCreating(true);
    setCreateFeedback(null);
    try {
      const res = await fetch('/api/contacts/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(getAuthHeaders ? getAuthHeaders() : {}),
        },
        body: JSON.stringify(newContact),
      });
      const data = await res.json();
      if (data.success) {
        setCreateFeedback(data.message || '✔ Contacto guardado y sincronizado.');
        if (showToast) showToast(data.message || '✔ Contacto guardado y sincronizado.');
        setNewContact({ name: '', phone: '', city: 'Santo Domingo', address: '', note: '' });
        fetchContacts();
        setTimeout(() => {
          setShowCreateModal(false);
          setCreateFeedback(null);
        }, 1200);
      } else {
        alert(data.message || 'Error al registrar contacto.');
      }
    } catch (err) {
      alert('Error de conexión al crear contacto: ' + err.message);
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  const handleCopyPhone = (e, phone) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`+${phone}`);
    setCopiedPhone(phone);
    if (showToast) showToast(`✔ Teléfono +${phone} copiado al portapapeles`);
    setTimeout(() => setCopiedPhone(null), 1800);
  };

  const allCount = contacts.length;
  const buyersCount = contacts.filter((c) => c.orderCount > 0 || c.totalSpent > 0).length;
  const whaticketCount = contacts.filter((c) => c.inWhaticket).length;
  const vipCount = contacts.filter((c) => c.category === 'vip' || c.totalSpent >= 5000 || c.orderCount >= 2).length;
  const manualCount = contacts.filter((c) => c.category === 'manual' || c.source?.includes('Manual')).length;

  const filteredContacts = contacts.filter((c) => {
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      (c.name || '').toLowerCase().includes(q) ||
      (c.phone || '').includes(q) ||
      (c.city || '').toLowerCase().includes(q) ||
      (c.address || '').toLowerCase().includes(q) ||
      (c.note || '').toLowerCase().includes(q);

    if (!matchesQuery) return false;

    if (selectedCategory === 'buyers') return c.orderCount > 0 || c.totalSpent > 0;
    if (selectedCategory === 'whaticket') return !!c.inWhaticket;
    if (selectedCategory === 'vip') return c.category === 'vip' || c.totalSpent >= 5000 || c.orderCount >= 2;
    if (selectedCategory === 'manual') return c.category === 'manual' || c.source?.includes('Manual');

    return true;
  });

  const totalBuyers = contacts.filter((c) => c.orderCount > 0).length;
  const totalSpentAll = contacts.reduce((sum, c) => sum + Number(c.totalSpent || 0), 0);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#0E121D] border border-white/10 rounded-2xl max-w-4xl w-full p-4 sm:p-6 space-y-5 shadow-2xl relative my-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wider font-display">
                  Sincronizador de Contactos & Estados WhatsApp
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                  vCard + Whaticket
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Guarda los clientes en los celulares del equipo para que vean todas las historias y estados de WhatsApp.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3 Metric Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-[#07090E] p-3.5 rounded-xl border border-white/5 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Clientes Unificados</span>
              <strong className="text-lg font-black text-white font-mono">{contacts.length}</strong>
            </div>
            <Users className="w-5 h-5 text-sky-400 opacity-60" />
          </div>

          <div className="bg-[#07090E] p-3.5 rounded-xl border border-white/5 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Clientes Compradores</span>
              <strong className="text-lg font-black text-emerald-400 font-mono">{totalBuyers}</strong>
            </div>
            <CheckCircle2 className="w-5 h-5 text-emerald-400 opacity-60" />
          </div>

          <div className="bg-[#07090E] p-3.5 rounded-xl border border-white/5 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Facturado</span>
              <strong className="text-lg font-black text-white font-mono">RD$ {totalSpentAll.toLocaleString()}</strong>
            </div>
            <DollarSign className="w-5 h-5 text-amber-400 opacity-60" />
          </div>
        </div>

        {/* Download & Sync Action Bar */}
        <div className="bg-gradient-to-r from-emerald-950/40 via-[#0B101B] to-sky-950/40 border border-emerald-500/30 rounded-2xl p-4 sm:p-5 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Descarga Rápida para iPhone & Android</span>
              </h4>
              <p className="text-xs text-slate-300 mt-0.5">
                Al abrir el archivo <strong>.vcf</strong> en cualquier teléfono, se guardan todos los clientes en 1 toque.
              </p>
            </div>

            {/* Hidden File Input for Device Contact Import */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".vcf,.csv,text/vcard,text/csv,text/plain"
              className="hidden"
            />

            <div className="flex items-center gap-2 flex-wrap">
              {/* Full Bidirectional Sync Button */}
              <button
                type="button"
                onClick={handleFullTwoWaySync}
                disabled={isFullSyncing || isSyncingWhaticket}
                className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-sky-500/20 transition-all disabled:opacity-50 active:scale-95"
                title="Sincroniza contactos entre Whaticket, celulares y MVPFLOW en ambas direcciones"
              >
                <ArrowLeftRight className={`w-4 h-4 ${isFullSyncing ? 'animate-spin' : ''}`} />
                <span>{isFullSyncing ? 'Sincronizando...' : 'Sincronizar Todo (Celulares ⇄ Whaticket)'}</span>
              </button>

              {/* Upload Contacts from Device */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingDevice}
                className="px-3.5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50 active:scale-95"
                title="Sube un archivo .vcf o .csv exportado de tu iPhone, Android o Google para enviarlo a Whaticket"
              >
                <Upload className={`w-4 h-4 ${isUploadingDevice ? 'animate-bounce' : ''}`} />
                <span>{isUploadingDevice ? 'Leyendo...' : 'Subir de Celular (.VCF / CSV)'}</span>
              </button>

              {/* Add New Contact Button */}
              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="px-3.5 py-2.5 rounded-xl bg-mvp-red hover:bg-mvp-darkRed text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-red-500/20 transition-all active:scale-95"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ Nuevo</span>
              </button>

              {/* VCF Download Button */}
              <a
                href={`/api/contacts/vcf?prefix=${encodeURIComponent(contactPrefix)}`}
                download="Contactos_MVP_FLOW_WhatsApp.vcf"
                className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-black font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
                title="Descarga el archivo para abrirlo en iPhone o Android y agregar todos los contactos a tu agenda"
              >
                <Download className="w-4 h-4" />
                <span>Descargar a Celular (.VCF)</span>
              </a>

              {/* Google Contacts CSV */}
              <a
                href="/api/contacts/csv"
                download="Contactos_MVP_FLOW_Google.csv"
                className="px-3 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center gap-1.5 border border-white/10 transition-colors"
                title="Para importar en contacts.google.com"
              >
                <Globe className="w-4 h-4 text-sky-400" />
                <span>CSV</span>
              </a>
            </div>
          </div>

          {/* Sync Feedback Alert */}
          {syncFeedback && (
            <div className="text-xs font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-500/40 p-2.5 rounded-xl animate-fade-in">
              {syncFeedback}
            </div>
          )}
        </div>

        {/* Categories Pills & Search Bar */}
        <div className="space-y-3">
          {/* Categories Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {[
              { id: 'all', label: 'Todos', count: allCount },
              { id: 'vip', label: '💎 VIP', count: vipCount },
              { id: 'buyers', label: '🛍️ Compradores', count: buyersCount },
              { id: 'whaticket', label: '💬 Whaticket', count: whaticketCount },
              { id: 'manual', label: '📋 Tienda / Manual', count: manualCount },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                    : 'bg-[#141A28] text-slate-300 hover:text-white border border-white/5 hover:border-white/10'
                }`}
              >
                <span>{cat.label}</span>
                <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-mono font-black ${
                  selectedCategory === cat.id ? 'bg-black/20 text-black' : 'bg-white/10 text-slate-300'
                }`}>
                  {cat.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nombre, teléfono (+1829...), ciudad o sector..."
                className="w-full bg-[#07090E] border border-white/10 focus:border-emerald-500 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 outline-none"
              />
            </div>
            <span className="text-xs font-mono text-slate-400 shrink-0">
              {filteredContacts.length} de {contacts.length} contactos
            </span>
          </div>

          {/* Contacts Table */}
          <div className="max-h-72 overflow-y-auto border border-white/5 rounded-xl bg-[#07090E]">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 bg-[#0A0D16] border-b border-white/10 text-slate-400 uppercase text-[10px] tracking-wider z-10">
                <tr>
                  <th className="py-2.5 px-3">Cliente</th>
                  <th className="py-2.5 px-3">WhatsApp / Celular</th>
                  <th className="py-2.5 px-3">Ubicación</th>
                  <th className="py-2.5 px-3 text-center">Pedidos</th>
                  <th className="py-2.5 px-3 text-right">Gasto Total</th>
                  <th className="py-2.5 px-3 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      Cargando contactos...
                    </td>
                  </tr>
                ) : filteredContacts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      No se encontraron contactos coincidentes en esta categoría.
                    </td>
                  </tr>
                ) : (
                  filteredContacts.map((c) => (
                    <tr key={c.phone} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-2.5 px-3 font-bold text-white">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1.5">
                            <span>{c.name}</span>
                            {c.inWhaticket && (
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="En Whaticket" />
                            )}
                          </div>
                          <div className="flex items-center gap-1 mt-0.5">
                            {c.category === 'vip' && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                💎 VIP
                              </span>
                            )}
                            {c.category === 'buyer' && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                🛍️ Comprador
                              </span>
                            )}
                            {c.category === 'lead' && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-medium tracking-wider bg-sky-500/20 text-sky-300 border border-sky-500/30">
                                💬 WhatsApp
                              </span>
                            )}
                            {c.category === 'manual' && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-medium tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
                                📋 Tienda
                              </span>
                            )}
                            <span className="text-[10px] text-slate-500 font-normal">{c.source}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <button
                          type="button"
                          onClick={(e) => handleCopyPhone(e, c.phone)}
                          title="Clic para copiar teléfono"
                          className="group inline-flex items-center gap-1.5 font-mono text-emerald-400 hover:text-emerald-300 transition-colors"
                        >
                          <span>+{c.phone}</span>
                          {copiedPhone === c.phone ? (
                            <span className="text-[10px] text-emerald-300 font-sans font-bold flex items-center gap-0.5">
                              <Check className="w-3 h-3 text-emerald-400" /> Copiado
                            </span>
                          ) : (
                            <Copy className="w-3 h-3 text-slate-600 group-hover:text-emerald-400 transition-colors" />
                          )}
                        </button>
                      </td>
                      <td className="py-2.5 px-3 text-slate-400 truncate max-w-[150px]">
                        {c.city}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-white">
                        {c.orderCount}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-white">
                        RD$ {c.totalSpent.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <a
                          href={`https://wa.me/${c.phone}?text=${encodeURIComponent(`¡Hola ${c.name}! 👋 Te escribimos desde MVP Flow Boutique.`)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 hover:text-emerald-300 text-[11px] font-bold transition-all inline-flex items-center gap-1 border border-emerald-500/30"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>Chat</span>
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
          <span>💡 Importa el archivo .vcf en iCloud o Google Contacts para sincronización automática en todos los teléfonos.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs"
          >
            Cerrar
          </button>
        </div>

        {/* Create Contact Sub-Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-[#0E121D] border border-mvp-red/50 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl relative animate-scale-up">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-mvp-red/20 text-mvp-red flex items-center justify-center">
                    <UserPlus className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-black text-white uppercase tracking-wider">
                    Registrar y Sincronizar Contacto
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="p-1.5 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateContact} className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">
                    Nombre del Cliente
                  </label>
                  <input
                    type="text"
                    required
                    value={newContact.name}
                    onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                    placeholder="Ej. Kelvin Rodríguez"
                    className="w-full bg-[#07090E] border border-white/10 focus:border-mvp-red rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">
                    WhatsApp / Teléfono <span className="text-mvp-red">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={newContact.phone}
                    onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                    placeholder="Ej. 8295551234 o +1809..."
                    className="w-full bg-[#07090E] border border-white/10 focus:border-mvp-red rounded-xl px-3 py-2 text-xs text-white font-mono outline-none"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">Se sincronizará en Whaticket automáticamente con +1.</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-300 block mb-1">
                      Ciudad / Provincia
                    </label>
                    <input
                      type="text"
                      value={newContact.city}
                      onChange={(e) => setNewContact({ ...newContact, city: e.target.value })}
                      placeholder="Santo Domingo"
                      className="w-full bg-[#07090E] border border-white/10 focus:border-mvp-red rounded-xl px-3 py-2 text-xs text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-300 block mb-1">
                      Sector / Dirección
                    </label>
                    <input
                      type="text"
                      value={newContact.address}
                      onChange={(e) => setNewContact({ ...newContact, address: e.target.value })}
                      placeholder="Ej. Piantini / Naco"
                      className="w-full bg-[#07090E] border border-white/10 focus:border-mvp-red rounded-xl px-3 py-2 text-xs text-white outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">
                    Nota o Preferencias (Opcional)
                  </label>
                  <input
                    type="text"
                    value={newContact.note}
                    onChange={(e) => setNewContact({ ...newContact, note: e.target.value })}
                    placeholder="Ej. Talla 41, pide solo pago contra entrega"
                    className="w-full bg-[#07090E] border border-white/10 focus:border-mvp-red rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                </div>

                {createFeedback && (
                  <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold text-center">
                    {createFeedback}
                  </div>
                )}

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="flex-1 py-2.5 rounded-xl bg-mvp-red hover:bg-mvp-darkRed text-white font-black text-xs uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-glow-sm"
                  >
                    {isCreating ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Guardando...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Guardar y Sincronizar</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactSyncModal;
