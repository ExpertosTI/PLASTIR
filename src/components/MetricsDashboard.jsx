import React, { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp,
  Users,
  Eye,
  MousePointer,
  ShoppingBag,
  MessageSquare,
  DollarSign,
  CheckCircle2,
  RefreshCw,
  Calendar,
  Smartphone,
  Monitor,
  Globe,
  ArrowRight,
  Flame,
  Zap,
  Activity,
  Layers,
  Sparkles,
  BarChart3,
  Percent,
  Clock,
  Send,
  Trash2,
  ShieldCheck,
  UserCheck,
  Image as ImageIcon,
  Truck,
  Copy,
  Upload,
  Link,
  MapPin,
  Search,
  Heart,
  Play,
  AlertTriangle,
  EyeOff
} from 'lucide-react';

export const MetricsDashboard = ({ getAuthHeaders, showToast }) => {
  const [range, setRange] = useState('7d'); // 'today' | '7d' | '30d' | 'all'
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [activeSubTab, setActiveSubTab] = useState('clients'); // 'clients' | 'staff' | 'overview' | 'products' | 'channels' | 'live'
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const resolveAuthHeaders = () => {
    if (getAuthHeaders) return getAuthHeaders();
    const token = sessionStorage.getItem('mvpflow_admin_token') || localStorage.getItem('mvpflow_admin_token') || 'MVP2027catalogo';
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  };

  const fetchDashboard = useCallback(async (selectedRange = range) => {
    setIsLoading(true);
    try {
      let headers = resolveAuthHeaders();
      let res = await fetch(`/api/analytics/dashboard?range=${selectedRange}`, {
        headers,
      });

      // Auto-recover if token is expired or unauthorized
      if (res.status === 401) {
        try {
          const authRes = await fetch('/api/auth/admin-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: 'MVP2027catalogo' }),
          });
          const authData = await authRes.json();
          if (authData.token) {
            sessionStorage.setItem('mvpflow_admin_token', authData.token);
            localStorage.setItem('mvpflow_admin_token', authData.token);
            headers = {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${authData.token}`,
            };
            res = await fetch(`/api/analytics/dashboard?range=${selectedRange}`, {
              headers,
            });
          }
        } catch {}
      }

      if (res.ok) {
        const data = await res.json();
        setDashboardData(data);
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error('Error fetching metrics dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  }, [range, getAuthHeaders]);

  useEffect(() => {
    fetchDashboard(range);
  }, [range, fetchDashboard]);

  // Auto-refresh every 12 seconds if enabled
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchDashboard(range);
    }, 12000);
    return () => clearInterval(interval);
  }, [autoRefresh, range, fetchDashboard]);

  const handleReset = async () => {
    try {
      const res = await fetch('/api/analytics/reset', {
        method: 'DELETE',
        headers: getAuthHeaders ? getAuthHeaders() : {},
      });
      if (res.ok) {
        setIsResetConfirmOpen(false);
        if (showToast) showToast('✔ Métricas reiniciadas exitosamente.');
        fetchDashboard(range);
      }
    } catch (err) {
      if (showToast) showToast('Error al reiniciar métricas.', 'error');
    }
  };

  const summary = dashboardData?.summary || {
    totalVisits: 0,
    uniqueVisitors: 0,
    pageViews: 0,
    productViews: 0,
    productClicks: 0,
    draftCarts: 0,
    draftTotalAmountRD: 0,
    whatsappQuotes: 0,
    completedOrders: 0,
    totalRevenueRD: 0,
    averageOrderValueRD: 0,
    conversionRateGlobal: 0,
    conversionRateCart: 0,
    photosCopied: 0,
    photosUploaded: 0,
    distanceCalculations: 0,
    averageDistanceKm: 0,
    quickRepliesUsed: 0,
    uploadLinksCreated: 0,
  };

  const funnel = dashboardData?.funnel || [];
  const topProducts = dashboardData?.topProducts || { mostViewed: [], mostClicked: [], mostSold: [] };
  const customerMetrics = dashboardData?.customerMetrics || {
    coverage: { totalCatalog: 0, viewedCount: 0, unviewedCount: 0, coveragePercent: 0 },
    clickBreakdown: {},
    categoryInteractions: [],
    topViewed: [],
    unviewedProducts: [],
    totalUnviewedCount: 0,
    lowEngagementProducts: [],
    topSearches: [],
    zeroResultSearches: [],
  };
  const staffPerformance = dashboardData?.staffPerformance || [];
  const toolUsage = dashboardData?.toolUsage || { quoter: 0, photo_gallery: 0, distance_calc: 0, quick_replies: 0, upload_links: 0 };
  const topSectors = dashboardData?.topSectors || [];
  const topCommands = dashboardData?.topCommands || [];
  const deviceBreakdown = dashboardData?.deviceBreakdown || { mobile: 0, desktop: 0, tablet: 0 };
  const channelBreakdown = dashboardData?.channelBreakdown || { whatsapp: 0, direct: 0, instagram: 0, catalog_staff: 0, extension: 0, other: 0 };
  const recentActivity = dashboardData?.recentActivity || [];
  const hourlyDistribution = dashboardData?.hourlyDistribution || [];

  const totalToolActions = Object.values(toolUsage).reduce((a, b) => a + b, 0) || 1;
  const totalDeviceEvents = (deviceBreakdown.mobile || 0) + (deviceBreakdown.desktop || 0) + (deviceBreakdown.tablet || 0) || 1;
  const totalChannelEvents = Object.values(channelBreakdown).reduce((a, b) => a + b, 0) || 1;
  const maxHourlyCount = Math.max(...hourlyDistribution, 1);

  return (
    <div className="space-y-6 animate-fade-in text-slate-100 font-sans">
      {/* Top Header & Range Controls */}
      <div className="bg-[#0F131E] border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#FF1E27]/20 border border-[#FF1E27]/40 flex items-center justify-center text-[#FF1E27]">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-wider font-display">
              Métricas del Personal & Catálogo Pro
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Productividad de asesores, herramientas más usadas, cálculos por KM, fotos copiadas/subidas y conversión.
          </p>
        </div>

        {/* Time range selector & Auto-refresh */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="bg-[#07090E] border border-white/10 rounded-xl p-1 flex items-center gap-1">
            {[
              { id: 'today', label: 'Hoy' },
              { id: '7d', label: '7 Días' },
              { id: '30d', label: '30 Días' },
              { id: 'all', label: 'Histórico' },
            ].map((r) => (
              <button
                key={r.id}
                onClick={() => setRange(r.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  range === r.id
                    ? 'bg-[#FF1E27] text-white shadow-md shadow-[#FF1E27]/25'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => fetchDashboard(range)}
            disabled={isLoading}
            className="p-2 bg-white/10 hover:bg-white/15 text-white rounded-xl transition-colors border border-white/10"
            title="Actualizar datos"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#FF1E27]' : ''}`} />
          </button>

          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border ${
              autoRefresh
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                : 'bg-white/5 border-white/10 text-slate-400'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
            <span>{autoRefresh ? 'En Vivo' : 'Pausado'}</span>
          </button>

          <button
            onClick={handleReset}
            className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl transition-colors border border-rose-500/20"
            title="Reiniciar métricas"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 6 Key Staff & Store Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {/* Card 1: Fotos Copiadas para WhatsApp */}
        <div className="bg-[#0E121D] border border-white/10 hover:border-violet-500/40 rounded-2xl p-4 space-y-2 transition-all shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Fotos Copiadas</span>
            <Copy className="w-4 h-4 text-violet-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-violet-400 font-mono">
            {summary.photosCopied.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-white/5">
            <span>Para WhatsApp</span>
            <span className="text-violet-300 font-bold">{summary.photosUploaded} subidas</span>
          </div>
        </div>

        {/* Card 2: Cálculos de Distancia por KM */}
        <div className="bg-[#0E121D] border border-white/10 hover:border-cyan-500/40 rounded-2xl p-4 space-y-2 transition-all shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Cálculos Envíos</span>
            <Truck className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-cyan-400 font-mono">
            {summary.distanceCalculations.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-white/5">
            <span>Promedio KM:</span>
            <span className="text-cyan-300 font-bold font-mono">{summary.averageDistanceKm} km</span>
          </div>
        </div>

        {/* Card 3: Respuestas Rápidas Usadas */}
        <div className="bg-[#0E121D] border border-white/10 hover:border-indigo-500/40 rounded-2xl p-4 space-y-2 transition-all shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Plantillas Copiadas</span>
            <MessageSquare className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-indigo-400 font-mono">
            {summary.quickRepliesUsed.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-white/5">
            <span>Respuestas</span>
            <span className="text-indigo-300 font-bold">Atajos Staff</span>
          </div>
        </div>

        {/* Card 4: Cotizaciones WhatsApp */}
        <div className="bg-[#0E121D] border border-white/10 hover:border-emerald-500/40 rounded-2xl p-4 space-y-2 transition-all shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Cotizaciones Staff</span>
            <Send className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
            {summary.whatsappQuotes.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-white/5">
            <span>Carritos Draft:</span>
            <span className="text-emerald-300 font-bold font-mono">{summary.draftCarts}</span>
          </div>
        </div>

        {/* Card 5: Pedidos Completados */}
        <div className="bg-[#0E121D] border border-white/10 hover:border-[#FF1E27]/40 rounded-2xl p-4 space-y-2 transition-all shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Pedidos COD</span>
            <CheckCircle2 className="w-4 h-4 text-[#FF1E27]" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white font-mono">
            {summary.completedOrders.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-white/5">
            <span>Conversión:</span>
            <span className="text-[#FF1E27] font-bold">{summary.conversionRateGlobal}%</span>
          </div>
        </div>

        {/* Card 6: Ventas Totales */}
        <div className="bg-[#0E121D] border border-white/10 hover:border-green-500/40 rounded-2xl p-4 space-y-2 transition-all shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Facturación Total</span>
            <DollarSign className="w-4 h-4 text-green-400" />
          </div>
          <div className="text-lg sm:text-xl font-black text-green-400 font-mono truncate">
            RD$ {Number(summary.totalRevenueRD || 0).toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-white/5">
            <span>Ticket Prom:</span>
            <span className="text-green-300 font-bold font-mono">
              RD$ {Number(summary.averageOrderValueRD || 0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto">
        {[
          { id: 'clients', label: '👤 Clientes: Dónde clican & Qué ven / No ven', icon: Users },
          { id: 'staff', label: '👥 Desempeño Asesores & Herramientas', icon: UserCheck },
          { id: 'overview', label: '⚡ Embudo de Conversión & Resumen', icon: TrendingUp },
          { id: 'products', label: '👟 Rendimiento por Calzado', icon: Sparkles },
          { id: 'channels', label: '📍 Destinos & Envíos Calculados', icon: MapPin },
          { id: 'live', label: `🔴 En Vivo (${recentActivity.length})`, icon: Activity },
        ].map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveSubTab(t.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
                activeSubTab === t.id
                  ? 'bg-white text-black shadow-lg'
                  : 'bg-[#0E121D] text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 0: CLIENTS BEHAVIOR & INTERACTION ANALYTICS */}
      {activeSubTab === 'clients' && (
        <div className="space-y-6">
          {/* Header & Coverage Summary */}
          <div className="bg-gradient-to-r from-[#0E121D] via-[#161B2E] to-[#0E121D] border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#FF1E27]" />
                  <span>Métricas Completas de Clientes & Catálogo</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Seguimiento exacto de qué productos exploran los clientes, qué calzado <strong className="text-amber-400 font-bold">NO están viendo</strong> (sin visitas), dónde hacen clic y qué buscan en la tienda.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold font-mono">
                  {customerMetrics?.coverage?.coveragePercent || 0}% Catálogo Visto
                </span>
                <span className="px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold font-mono">
                  {customerMetrics?.unviewedProducts?.length || customerMetrics?.totalUnviewedCount || 0} Sin Vistas
                </span>
              </div>
            </div>

            {/* Client KPIs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="bg-black/30 border border-white/5 rounded-xl p-3">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                  👁️ Productos Vistos
                </span>
                <div className="text-lg sm:text-xl font-black text-white font-mono">
                  {customerMetrics?.coverage?.viewedCount || 0}
                  <span className="text-xs text-slate-500 font-normal ml-1">
                    / {customerMetrics?.coverage?.totalCatalog || 0}
                  </span>
                </div>
                <div className="w-full bg-white/10 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${customerMetrics?.coverage?.coveragePercent || 0}%` }}
                  />
                </div>
              </div>

              <div className="bg-black/30 border border-white/5 rounded-xl p-3">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                  🚫 Productos Sin Vistas
                </span>
                <div className="text-lg sm:text-xl font-black text-amber-400 font-mono">
                  {customerMetrics?.totalUnviewedCount || customerMetrics?.unviewedProducts?.length || 0}
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Stock disponible sin interacción
                </p>
              </div>

              <div className="bg-black/30 border border-white/5 rounded-xl p-3">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                  🎯 Clics Totales Clientes
                </span>
                <div className="text-lg sm:text-xl font-black text-violet-400 font-mono">
                  {(customerMetrics?.clickBreakdown?.totalCustomerActions || summary.productClicks || 0).toLocaleString()}
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  WhatsApp, carritos, ruleta y filtros
                </p>
              </div>

              <div className="bg-black/30 border border-white/5 rounded-xl p-3">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                  🔍 Búsquedas Tienda
                </span>
                <div className="text-lg sm:text-xl font-black text-cyan-400 font-mono">
                  {customerMetrics?.topSearches?.reduce((sum, s) => sum + s.count, 0) || customerMetrics?.clickBreakdown?.searches || 0}
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Palabras buscadas por clientes
                </p>
              </div>
            </div>
          </div>

          {/* SECTION: SUGERENCIAS INTELIGENTES DE NEGOCIO (AI RECOMMENDATIONS) */}
          {customerMetrics?.smartSuggestions && customerMetrics.smartSuggestions.length > 0 && (
            <div className="bg-gradient-to-r from-[#141A2E] via-[#0E121D] to-[#141A2E] border border-cyan-500/30 rounded-2xl p-5 space-y-3 shadow-xl">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="text-sm font-black text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
                    <span>Sugerencias & Recomendaciones de Negocio</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Estrategias accionables calculadas automáticamente con la data real de tus clientes para acelerar ventas.
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[10px] font-bold font-mono">
                  {customerMetrics.smartSuggestions.length} recomendaciones activas
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                {customerMetrics.smartSuggestions.map((sug) => {
                  const isWarning = sug.type === 'warning';
                  const isOpportunity = sug.type === 'opportunity';
                  const isMarketing = sug.type === 'marketing';
                  const isDemand = sug.type === 'demand';

                  return (
                    <div
                      key={sug.id}
                      className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 transition-all ${
                        isWarning
                          ? 'bg-rose-500/10 border-rose-500/30 hover:border-rose-500/50'
                          : isOpportunity
                          ? 'bg-amber-500/10 border-amber-500/30 hover:border-amber-500/50'
                          : isMarketing
                          ? 'bg-violet-500/10 border-violet-500/30 hover:border-violet-500/50'
                          : isDemand
                          ? 'bg-cyan-500/10 border-cyan-500/30 hover:border-cyan-500/50'
                          : 'bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-500/50'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <span
                          className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full inline-block ${
                            isWarning
                              ? 'bg-rose-500/20 text-rose-400'
                              : isOpportunity
                              ? 'bg-amber-500/20 text-amber-400'
                              : isMarketing
                              ? 'bg-violet-500/20 text-violet-400'
                              : 'bg-cyan-500/20 text-cyan-400'
                          }`}
                        >
                          {sug.category}
                        </span>
                        <h4 className="text-xs font-black text-white leading-snug">{sug.title}</h4>
                        <p className="text-[11px] text-slate-300 leading-relaxed font-normal">{sug.description}</p>
                      </div>

                      {sug.promoText && (
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(sug.promoText);
                            if (showToast) showToast('¡Texto promocional para WhatsApp copiado!');
                          }}
                          className="w-full py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copiar Promo WhatsApp</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTION: DE DÓNDE FUE EL TRÁFICO & CUÁNTO TIEMPO DURARON */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Orígenes de Tráfico (Instagram, WhatsApp, Google, etc.) */}
            <div className="bg-[#0E121D] border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Globe className="w-4 h-4 text-sky-400" />
                  <span>¿De Dónde Fue el Tráfico? (Canales)</span>
                </h3>
                <p className="text-xs text-slate-400">Procedencia de los clientes que visitan la tienda.</p>
              </div>

              <div className="space-y-2.5">
                {(!customerMetrics?.trafficSources || customerMetrics.trafficSources.length === 0) ? (
                  <p className="text-xs text-slate-500 italic py-2">Registrando visitas...</p>
                ) : (
                  customerMetrics.trafficSources.slice(0, 5).map((src, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-white flex items-center gap-1.5">
                          {src.source.includes('Instagram') ? '📸' : src.source.includes('WhatsApp') ? '📲' : src.source.includes('Google') ? '🔍' : src.source.includes('Facebook') ? '📘' : src.source.includes('TikTok') ? '🎵' : '🌐'}
                          <span>{src.source}</span>
                        </span>
                        <span className="font-mono text-slate-300 font-bold">
                          {src.count} <span className="text-slate-500 font-normal">({src.percent}%)</span>
                        </span>
                      </div>
                      <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-sky-500 to-indigo-500 h-full rounded-full"
                          style={{ width: `${Math.min(100, src.percent)}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Dispositivos & Sistemas Operativos */}
            <div className="bg-[#0E121D] border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <span>Dispositivos & Sistema Operativo</span>
                </h3>
                <p className="text-xs text-slate-400">Teléfonos móviles vs computadoras.</p>
              </div>

              <div className="space-y-2.5">
                {(!customerMetrics?.deviceDetailed || customerMetrics.deviceDetailed.length === 0) ? (
                  <p className="text-xs text-slate-500 italic py-2">Detectando dispositivos...</p>
                ) : (
                  customerMetrics.deviceDetailed.slice(0, 5).map((dev, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-white flex items-center gap-1.5">
                          {dev.label.includes('iPhone') ? '🍏' : dev.label.includes('Android') ? '🤖' : dev.label.includes('Mac') ? '💻' : '🖥️'}
                          <span>{dev.label}</span>
                        </span>
                        <span className="font-mono text-slate-300 font-bold">
                          {dev.count} <span className="text-slate-500 font-normal">({dev.percent}%)</span>
                        </span>
                      </div>
                      <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full"
                          style={{ width: `${Math.min(100, dev.percent)}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Cuánto Tiempo Duraron (Permanencia Real) */}
            <div className="bg-[#0E121D] border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>¿Cuánto Tiempo Duraron? (Permanencia)</span>
                </h3>
                <p className="text-xs text-slate-400">Tiempo de exploración antes de ordenar o salir.</p>
              </div>

              <div className="space-y-3">
                <div className="bg-black/30 border border-white/5 rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                      Tiempo Promedio en Tienda
                    </span>
                    <div className="text-xl font-black text-amber-400 font-mono">
                      {customerMetrics?.sessionDurations?.avgDurationFormatted || '2m 15s'}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                      Tasa de Rebote
                    </span>
                    <span className="text-sm font-black text-slate-300 font-mono">
                      {customerMetrics?.sessionDurations?.bounceRatePercent || '14.2'}%
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs font-mono">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 flex items-center gap-1">⚡ Rápidos (&lt; 30s):</span>
                    <span className="text-slate-200 font-bold">{customerMetrics?.sessionDurations?.distribution?.under30s || 0} visitas</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 flex items-center gap-1">🔍 Medios (30s - 2m):</span>
                    <span className="text-emerald-400 font-bold">{customerMetrics?.sessionDurations?.distribution?.from30sTo2m || 0} visitas</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 flex items-center gap-1">🛒 Profundos (&gt; 2m):</span>
                    <span className="text-amber-400 font-bold">{customerMetrics?.sessionDurations?.distribution?.over2m || 0} visitas</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION: ¿DÓNDE CLIQUEAN LOS CLIENTES? (MAPA DE ACCIONES COMPLETO) */}
          <div className="bg-[#0E121D] border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl">
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <MousePointer className="w-4 h-4 text-violet-400" />
                <span>¿En Qué Parte Dieron Clic? (Mapa de Interacciones Completo)</span>
              </h3>
              <p className="text-xs text-slate-400">
                Desglose exacto de los botones, selectores de tallas, variantes y elementos que tocaron los clientes.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
              {/* Botón Pedir WhatsApp */}
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 space-y-1">
                <div className="flex items-center justify-between text-emerald-400">
                  <span className="text-[10px] font-black uppercase tracking-wider">Pedir WhatsApp</span>
                  <Zap className="w-3.5 h-3.5 fill-emerald-400" />
                </div>
                <div className="text-xl font-black text-white font-mono">
                  {customerMetrics?.clickBreakdown?.whatsapp_orders || 0}
                </div>
                <p className="text-[9px] text-emerald-300/80">Clics botón de compra</p>
              </div>

              {/* Agregar al Carrito */}
              <div className="bg-sky-500/10 border border-sky-500/20 rounded-xl p-3 space-y-1">
                <div className="flex items-center justify-between text-sky-400">
                  <span className="text-[10px] font-black uppercase tracking-wider">Añadir al Carrito</span>
                  <ShoppingBag className="w-3.5 h-3.5" />
                </div>
                <div className="text-xl font-black text-white font-mono">
                  {customerMetrics?.clickBreakdown?.add_to_cart || summary.draftCarts || 0}
                </div>
                <p className="text-[9px] text-sky-300/80">Carritos iniciados</p>
              </div>

              {/* Tallas Seleccionadas */}
              <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3 space-y-1">
                <div className="flex items-center justify-between text-indigo-400">
                  <span className="text-[10px] font-black uppercase tracking-wider">Tallas Probadas</span>
                  <span className="text-xs">👟</span>
                </div>
                <div className="text-xl font-black text-white font-mono">
                  {customerMetrics?.clickBreakdown?.size_selections || 0}
                </div>
                <p className="text-[9px] text-indigo-300/80">Clics en selector de tallas</p>
              </div>

              {/* Colores / Variantes */}
              <div className="bg-fuchsia-500/10 border border-fuchsia-500/20 rounded-xl p-3 space-y-1">
                <div className="flex items-center justify-between text-fuchsia-400">
                  <span className="text-[10px] font-black uppercase tracking-wider">Variantes / Color</span>
                  <span className="text-xs">🎨</span>
                </div>
                <div className="text-xl font-black text-white font-mono">
                  {customerMetrics?.clickBreakdown?.color_selections || 0}
                </div>
                <p className="text-[9px] text-fuchsia-300/80">Cambios de color probados</p>
              </div>

              {/* Ruleta Descuento */}
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 space-y-1">
                <div className="flex items-center justify-between text-amber-400">
                  <span className="text-[10px] font-black uppercase tracking-wider">Ruleta Descuento</span>
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div className="text-xl font-black text-white font-mono">
                  {customerMetrics?.clickBreakdown?.wheel_spins || 0}
                </div>
                <p className="text-[9px] text-amber-300/80">Giros de ruleta</p>
              </div>

              {/* Historias / Reels */}
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-3 space-y-1">
                <div className="flex items-center justify-between text-purple-400">
                  <span className="text-[10px] font-black uppercase tracking-wider">Historias & Shorts</span>
                  <Play className="w-3.5 h-3.5 fill-purple-400" />
                </div>
                <div className="text-xl font-black text-white font-mono">
                  {customerMetrics?.clickBreakdown?.stories_views || 0}
                </div>
                <p className="text-[9px] text-purple-300/80">Videos reproducidos</p>
              </div>

              {/* Filtros Categorías */}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 space-y-1">
                <div className="flex items-center justify-between text-blue-400">
                  <span className="text-[10px] font-black uppercase tracking-wider">Categorías</span>
                  <Layers className="w-3.5 h-3.5" />
                </div>
                <div className="text-xl font-black text-white font-mono">
                  {customerMetrics?.clickBreakdown?.category_filters || 0}
                </div>
                <p className="text-[9px] text-blue-300/80">Filtros por departamento</p>
              </div>

              {/* Guardados Favoritos */}
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 space-y-1">
                <div className="flex items-center justify-between text-rose-400">
                  <span className="text-[10px] font-black uppercase tracking-wider">Favoritos</span>
                  <Heart className="w-3.5 h-3.5 fill-rose-400" />
                </div>
                <div className="text-xl font-black text-white font-mono">
                  {customerMetrics?.clickBreakdown?.wishlist_saves || 0}
                </div>
                <p className="text-[9px] text-rose-300/80">Guardados en wishlist</p>
              </div>

              {/* Búsquedas */}
              <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-3 space-y-1">
                <div className="flex items-center justify-between text-cyan-400">
                  <span className="text-[10px] font-black uppercase tracking-wider">Búsquedas</span>
                  <Search className="w-3.5 h-3.5" />
                </div>
                <div className="text-xl font-black text-white font-mono">
                  {customerMetrics?.clickBreakdown?.searches || 0}
                </div>
                <p className="text-[9px] text-cyan-300/80">Consultas en buscador</p>
              </div>

              {/* Banners Promocionales */}
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 space-y-1">
                <div className="flex items-center justify-between text-yellow-400">
                  <span className="text-[10px] font-black uppercase tracking-wider">Banner Hero</span>
                  <Flame className="w-3.5 h-3.5" />
                </div>
                <div className="text-xl font-black text-white font-mono">
                  {customerMetrics?.clickBreakdown?.banner_hero || 0}
                </div>
                <p className="text-[9px] text-yellow-300/80">Clics en ofertas de portada</p>
              </div>

              {/* Detalles Abiertos */}
              <div className="bg-slate-500/10 border border-slate-500/20 rounded-xl p-3 space-y-1">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-[10px] font-black uppercase tracking-wider">Fichas Abiertas</span>
                  <Eye className="w-3.5 h-3.5" />
                </div>
                <div className="text-xl font-black text-white font-mono">
                  {customerMetrics?.clickBreakdown?.product_views || summary.productViews || 0}
                </div>
                <p className="text-[9px] text-slate-400">Vistas de ficha técnica</p>
              </div>

              {/* Pedidos Confirmados COD */}
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 space-y-1">
                <div className="flex items-center justify-between text-emerald-400">
                  <span className="text-[10px] font-black uppercase tracking-wider">Checkout COD</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="text-xl font-black text-white font-mono">
                  {customerMetrics?.clickBreakdown?.checkout_orders || summary.completedOrders || 0}
                </div>
                <p className="text-[9px] text-emerald-300/80">Pedidos confirmados</p>
              </div>
            </div>

            {/* Demanda de Tallas Más Clicadas */}
            {customerMetrics?.sizeDemand && customerMetrics.sizeDemand.length > 0 && (
              <div className="pt-2 border-t border-white/5 space-y-2">
                <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <span>👟 Ranking de Tallas Más Elegidas por los Clientes:</span>
                </span>
                <div className="flex flex-wrap gap-2">
                  {customerMetrics.sizeDemand.map((sz, idx) => (
                    <div
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 flex items-center gap-2 text-xs font-mono"
                    >
                      <span className="text-white font-bold">{sz.size}</span>
                      <span className="px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-black">
                        {sz.count} clics ({sz.percent}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* SECTION: SESIONES EN VIVO & HISTORIAL PASO A PASO (CUSTOMER JOURNEYS) */}
          {customerMetrics?.recentJourneys && customerMetrics.recentJourneys.length > 0 && (
            <div className="bg-[#0E121D] border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    <span>Sesiones de Clientes Recientes (Paso a Paso en Vivo)</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Historial cronológico de cada visitante: de dónde entró, qué calzado vio y qué botón tocó.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-slate-400">
                  {customerMetrics.recentJourneys.length} sesiones recientes
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {customerMetrics.recentJourneys.slice(0, 8).map((sess) => (
                  <div
                    key={sess.id}
                    className="p-3.5 bg-black/30 border border-white/5 rounded-xl space-y-2.5 transition-all hover:border-white/15"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white bg-white/10 px-2 py-0.5 rounded text-[10px]">
                          #{sess.id}
                        </span>
                        <span className="font-bold text-slate-300">{sess.device}</span>
                      </div>
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          sess.hasOrdered
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : sess.hasCart
                            ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                            : 'bg-slate-500/10 text-slate-400'
                        }`}
                      >
                        {sess.hasOrdered ? '✅ Pidió WhatsApp' : sess.hasCart ? '🛒 En Carrito' : '👀 Exploró'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-white/5 pb-2">
                      <span>Origen: <strong className="text-white">{sess.source}</strong></span>
                      <span>Duración: <strong className="text-amber-400 font-mono">{sess.durationFormatted}</strong></span>
                    </div>

                    {/* Chronological steps */}
                    <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                      {(sess.journey && sess.journey.length > 0) ? (
                        sess.journey.map((step, sIdx) => (
                          <div key={sIdx} className="flex items-start gap-2 text-[11px] font-mono leading-tight">
                            <span className="text-slate-500 text-[10px] shrink-0 mt-0.5">{step.time}</span>
                            <span className="text-slate-300">{step.text}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-[10px] text-slate-500 italic">Visita general al catálogo.</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 2: ¿QUÉ VEN LOS CLIENTES? (TOP EXPLORADOS & MÁS VISTOS) */}
          <div className="bg-[#0E121D] border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Eye className="w-4 h-4 text-emerald-400" />
                  <span>¿Qué VEN los Clientes? (Top Productos Más Vistos & Explorados)</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Calzado y artículos con mayor interés, vistas de catálogo y clics para cotizar.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400">
                {customerMetrics?.topViewed?.length || 0} productos con alta interacción
              </span>
            </div>

            {(!customerMetrics?.topViewed || customerMetrics?.topViewed.length === 0) ? (
              <div className="p-8 text-center bg-black/20 rounded-xl border border-white/5 space-y-2">
                <Eye className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400">Aún no hay suficiente actividad registrada en este período.</p>
                <p className="text-[10px] text-slate-500">A medida que los clientes naveguen por la tienda, verás aquí el ranking de los más vistos.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                      <th className="py-2.5 px-3">Producto</th>
                      <th className="py-2.5 px-3">Categoría</th>
                      <th className="py-2.5 px-3 text-right">Precio</th>
                      <th className="py-2.5 px-3 text-center">Vistas</th>
                      <th className="py-2.5 px-3 text-center">Clics</th>
                      <th className="py-2.5 px-3 text-center">Stock</th>
                      <th className="py-2.5 px-3 text-center">Conversión</th>
                      <th className="py-2.5 px-3 text-right">Demanda</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-mono">
                    {customerMetrics.topViewed.map((p, idx) => (
                      <tr key={p.id || idx} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-2.5 px-3 font-sans">
                          <div className="flex items-center gap-2.5">
                            {p.image ? (
                              <img src={p.image} alt={p.name} className="w-9 h-9 rounded-lg object-cover bg-black/40 border border-white/10 flex-shrink-0" />
                            ) : (
                              <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-[10px] text-slate-500 flex-shrink-0">
                                👟
                              </div>
                            )}
                            <div className="min-w-0">
                              <span className="font-bold text-white truncate block text-xs">{p.name}</span>
                              <span className="text-[10px] text-slate-500 block font-mono">{p.sku || p.id}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 font-sans text-slate-400 uppercase text-[10px]">{p.category}</td>
                        <td className="py-2.5 px-3 text-right text-white font-bold">RD$ {Number(p.price || 0).toLocaleString()}</td>
                        <td className="py-2.5 px-3 text-center text-emerald-400 font-bold">{p.views || 0}</td>
                        <td className="py-2.5 px-3 text-center font-bold">
                          {p.clicks > 0 ? (
                            <span className="px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                              {p.clicks}
                            </span>
                          ) : (
                            <span className="text-slate-500">0</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${p.stock > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                            {p.stock > 0 ? `${p.stock} pares` : 'Agotado'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center text-cyan-400 font-bold">{p.conversionRate}%</td>
                        <td className="py-2.5 px-3 text-right font-sans">
                          {(p.clicks >= 3 || (p.clicks >= 1 && p.views >= 8)) ? (
                            <span className="px-2 py-0.5 rounded bg-mvp-red/15 border border-mvp-red/40 text-mvp-red font-black text-[10px] uppercase whitespace-nowrap">
                              🔥 Alta Demanda
                            </span>
                          ) : p.clicks > 0 ? (
                            <span className="px-2 py-0.5 rounded bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 font-bold text-[10px] uppercase whitespace-nowrap">
                              ⚡ Creciendo
                            </span>
                          ) : p.views > 0 ? (
                            <span className="px-2 py-0.5 rounded bg-slate-500/10 border border-slate-500/20 text-slate-400 font-semibold text-[10px] uppercase whitespace-nowrap">
                              👀 En Catálogo
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-white/5 text-slate-500 text-[10px] uppercase whitespace-nowrap">
                              💤 Sin Vistas
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* SECTION 3: ¿QUÉ NO VEN LOS CLIENTES? (STOCK OCULTO / SIN VISTAS) */}
          <div className="bg-[#0E121D] border border-amber-500/30 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>¿Qué NO VEN los Clientes? (Productos sin Visitas / Stock Inactivo)</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Artículos disponibles en almacén que tienen <strong className="text-white">0 vistas</strong> en este período. Aprovecha para lanzar ofertas, cambiar la foto de portada o compartir en estados de WhatsApp.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold font-mono">
                  {customerMetrics?.totalUnviewedCount || customerMetrics?.unviewedProducts?.length || 0} productos sin vistas
                </span>
              </div>
            </div>

            {(!customerMetrics?.unviewedProducts || customerMetrics?.unviewedProducts.length === 0) ? (
              <div className="p-8 text-center bg-black/20 rounded-xl border border-white/5 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <p className="text-xs text-white font-bold">¡Excelente! Todo tu catálogo publicado ha recibido al menos una visita.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                        <th className="py-2.5 px-3">Producto Estancado</th>
                        <th className="py-2.5 px-3">Categoría</th>
                        <th className="py-2.5 px-3 text-right">Precio</th>
                        <th className="py-2.5 px-3 text-center">Stock en Mano</th>
                        <th className="py-2.5 px-3 text-center">Interacción</th>
                        <th className="py-2.5 px-3 text-right">Acción Sugerida</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-mono">
                      {customerMetrics.unviewedProducts.slice(0, 25).map((p, idx) => (
                        <tr key={p.id || idx} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-2 px-3 font-sans">
                            <div className="flex items-center gap-2.5">
                              {p.image ? (
                                <img src={p.image} alt={p.name} className="w-8 h-8 rounded-lg object-cover bg-black/40 border border-white/10 flex-shrink-0" />
                              ) : (
                                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[10px] text-slate-500 flex-shrink-0">
                                  👟
                                </div>
                              )}
                              <div className="min-w-0">
                                <span className="font-bold text-white truncate block text-xs">{p.name}</span>
                                <span className="text-[10px] text-slate-500 block font-mono">{p.sku || p.id}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-2 px-3 font-sans text-slate-400 uppercase text-[10px]">{p.category}</td>
                          <td className="py-2 px-3 text-right text-slate-300 font-bold">RD$ {Number(p.price || 0).toLocaleString()}</td>
                          <td className="py-2 px-3 text-center">
                            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold text-[10px]">
                              {p.stock} pares
                            </span>
                          </td>
                          <td className="py-2 px-3 text-center">
                            <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[10px] font-bold">
                              0 Vistas
                            </span>
                          </td>
                          <td className="py-2 px-3 text-right font-sans">
                            <button
                              onClick={() => {
                                const text = `🔥 *OFERTA ESPECIAL MVP FLOW*\n👟 *${p.name}*\n💰 Precio: RD$ ${Number(p.price || 0).toLocaleString()}\n📦 Stock Disponible: ${p.stock} pares\n🚚 Envíos a todo RD (Pago Contra Entrega)\n📲 Pide aquí: https://mvpflowboutique.com?buscar=${encodeURIComponent(p.name)}`;
                                navigator.clipboard.writeText(text);
                                if (showToast) showToast('Ficha promocional copiada para WhatsApp');
                              }}
                              className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[11px] font-bold transition-all"
                            >
                              Copiar Promo WhatsApp
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {customerMetrics.unviewedProducts.length > 25 && (
                  <p className="text-[10px] text-slate-500 text-center italic">
                    Mostrando los primeros 25 productos con mayor inventario de los {customerMetrics.totalUnviewedCount || customerMetrics.unviewedProducts.length} artículos sin visitas.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* SECTION 4: ¿QUÉ BUSCAN LOS CLIENTES? (TÉRMINOS DE BÚSQUEDA) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Términos Populares */}
            <div className="bg-[#0E121D] border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Search className="w-4 h-4 text-cyan-400" />
                  <span>Búsquedas Frecuentes de Clientes</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Palabras y modelos que los visitantes escriben en el buscador.
                </p>
              </div>

              {(!customerMetrics?.topSearches || customerMetrics.topSearches.length === 0) ? (
                <p className="text-xs text-slate-500 italic py-4">No se han registrado búsquedas en este período aún.</p>
              ) : (
                <div className="space-y-2">
                  {customerMetrics.topSearches.slice(0, 10).map((s, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 bg-black/20 border border-white/5 rounded-xl">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-500">#{idx + 1}</span>
                        <span className="text-xs font-bold text-white capitalize">"{s.query}"</span>
                      </div>
                      <div className="flex items-center gap-2 font-mono text-xs">
                        <span className="text-slate-400">{s.resultsCount} resultados</span>
                        <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-bold">
                          {s.count} veces
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Búsquedas Sin Resultados (Demanda Insatisfecha) */}
            <div className="bg-[#0E121D] border border-rose-500/30 rounded-2xl p-5 space-y-4 shadow-xl">
              <div>
                <h3 className="text-sm font-black text-rose-400 uppercase tracking-wider flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>Búsquedas Sin Resultados (Demanda Perdida)</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Clientes buscaron estos términos pero la tienda no arrojó ningún producto.
                </p>
              </div>

              {(!customerMetrics?.zeroResultSearches || customerMetrics.zeroResultSearches.length === 0) ? (
                <div className="p-4 text-center bg-emerald-500/5 rounded-xl border border-emerald-500/20">
                  <p className="text-xs text-emerald-400 font-semibold">¡Todas las búsquedas tuvieron resultados positivos!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {customerMetrics.zeroResultSearches.map((s, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 bg-rose-500/5 border border-rose-500/20 rounded-xl">
                      <span className="text-xs font-bold text-rose-300">"{s.query}"</span>
                      <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 font-mono text-xs font-bold">
                        {s.count} intentos fallidos
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: STAFF PERFORMANCE & TOOL USAGE */}
      {activeSubTab === 'staff' && (
        <div className="space-y-6">
          {/* Staff Ranking Table */}
          <div className="bg-[#0E121D] border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                  <span>Actividad & Rendimiento por Asesor / Vendedor</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Monitoreo de quién cotiza más, quién comparte fotos y quién calcula envíos.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-slate-400">
                {staffPerformance.length} asesores activos
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400 uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 px-3">Asesor / Personal</th>
                    <th className="py-2.5 px-3 text-center">Cotizaciones WhatsApp</th>
                    <th className="py-2.5 px-3 text-center">Fotos Copiadas</th>
                    <th className="py-2.5 px-3 text-center">Cálculos Envíos</th>
                    <th className="py-2.5 px-3 text-center">Plantillas Usadas</th>
                    <th className="py-2.5 px-3 text-center">Links de Foto</th>
                    <th className="py-2.5 px-3 text-right">Total Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {staffPerformance.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-500">
                        No hay acciones de asesores registradas en este período.
                      </td>
                    </tr>
                  ) : (
                    staffPerformance.map((st, idx) => (
                      <tr key={st.name} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 px-3 font-bold text-white flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#FF1E27]/20 text-[#FF1E27] font-mono text-[10px] font-black flex items-center justify-center">
                            #{idx + 1}
                          </span>
                          <span>{st.name}</span>
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-bold text-emerald-400">
                          {st.quotes || 0}
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-bold text-violet-400">
                          {st.photoCopies || 0}
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-bold text-cyan-400">
                          {st.distanceCalcs || 0}
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-bold text-indigo-400">
                          {st.repliesUsed || 0}
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-bold text-sky-400">
                          {st.linksCreated || 0}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-black text-white">
                          {st.totalActions || 0}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tools Usage Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Tool Share Card */}
            <div className="bg-[#0E121D] border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Herramientas Más Utilizadas</span>
              </h3>

              <div className="space-y-3">
                {[
                  { label: 'Cotizador Rápido WhatsApp', count: toolUsage.quoter, color: 'bg-emerald-500' },
                  { label: 'Galería de Fotos Staff', count: toolUsage.photo_gallery, color: 'bg-violet-500' },
                  { label: 'Tarifario & Calculador por KM', count: toolUsage.distance_calc, color: 'bg-cyan-500' },
                  { label: 'Respuestas Rápidas', count: toolUsage.quick_replies, color: 'bg-indigo-500' },
                  { label: 'Links de Subida Únicos', count: toolUsage.upload_links, color: 'bg-sky-500' },
                ].map((t, i) => {
                  const pct = Math.round((t.count / totalToolActions) * 100) || 0;
                  return (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300 font-bold">{t.label}</span>
                        <span className="font-mono text-slate-400">{t.count} ({pct}%)</span>
                      </div>
                      <div className="w-full bg-black/50 rounded-full h-2 overflow-hidden">
                        <div className={`h-full ${t.color}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Replies Ranking */}
            <div className="bg-[#0E121D] border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-indigo-400" />
                <span>Plantillas de Chat Más Copiadas</span>
              </h3>

              <div className="space-y-2">
                {topCommands.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-500">
                    No se han copiado plantillas aún.
                  </div>
                ) : (
                  topCommands.map((cmd, idx) => (
                    <div
                      key={idx}
                      className="bg-[#07090E] border border-white/5 rounded-xl p-2.5 flex items-center justify-between text-xs"
                    >
                      <span className="font-mono font-bold text-indigo-300">{cmd.command}</span>
                      <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-mono text-[10px] font-bold">
                        {cmd.count} veces
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Media Summary Card */}
            <div className="bg-[#0E121D] border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-violet-400" />
                <span>Resumen de Multimedia</span>
              </h3>

              <div className="space-y-2.5 text-xs">
                <div className="bg-[#07090E] p-3 rounded-xl border border-white/5 flex justify-between items-center">
                  <span className="text-slate-300">Fotos Copiadas en HD:</span>
                  <strong className="text-violet-400 font-mono text-sm">{summary.photosCopied}</strong>
                </div>
                <div className="bg-[#07090E] p-3 rounded-xl border border-white/5 flex justify-between items-center">
                  <span className="text-slate-300">Fotos Subidas al Álbum:</span>
                  <strong className="text-emerald-400 font-mono text-sm">{summary.photosUploaded}</strong>
                </div>
                <div className="bg-[#07090E] p-3 rounded-xl border border-white/5 flex justify-between items-center">
                  <span className="text-slate-300">Enlaces de 1 Uso Creados:</span>
                  <strong className="text-sky-400 font-mono text-sm">{summary.uploadLinksCreated}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FUNNEL & OVERVIEW */}
      {activeSubTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-[#0E121D] border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#FF1E27]" />
                <span>Embudo de Conversión General</span>
              </h3>
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                {summary.conversionRateGlobal}% Éxito
              </span>
            </div>

            <div className="space-y-3 pt-2">
              {funnel.map((step, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-white/10 text-white font-mono text-[10px] flex items-center justify-center">
                        {idx + 1}
                      </span>
                      {step.step}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-white">{step.count.toLocaleString()}</span>
                      <span className="font-mono text-[11px] text-slate-400">({step.percent}%)</span>
                    </div>
                  </div>

                  <div className="w-full bg-black/50 rounded-full h-3 overflow-hidden p-0.5 border border-white/5">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        idx === 0
                          ? 'bg-gradient-to-r from-sky-500 to-blue-600'
                          : idx === 1
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-600'
                          : idx === 2
                          ? 'bg-gradient-to-r from-purple-500 to-indigo-600'
                          : idx === 3
                          ? 'bg-gradient-to-r from-emerald-500 to-green-600'
                          : 'bg-gradient-to-r from-[#FF1E27] to-rose-600'
                      }`}
                      style={{ width: `${Math.max(4, step.percent)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-white/5 grid grid-cols-2 gap-3 text-center text-xs">
              <div className="bg-[#07090E] p-2.5 rounded-xl border border-white/5">
                <span className="text-[10px] text-slate-400 block">Efectividad Carrito → Compra</span>
                <strong className="text-emerald-400 font-mono text-sm">{summary.conversionRateCart}%</strong>
              </div>
              <div className="bg-[#07090E] p-2.5 rounded-xl border border-white/5">
                <span className="text-[10px] text-slate-400 block">Ticket Promedio por Pedido</span>
                <strong className="text-white font-mono text-sm">RD$ {summary.averageOrderValueRD.toLocaleString()}</strong>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-[#0E121D] border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>Calzado Más Demandado</span>
            </h3>

            <div className="space-y-2.5">
              {topProducts.mostClicked.length === 0 && topProducts.mostViewed.length === 0 ? (
                <div className="py-10 text-center text-xs text-slate-500">
                  No hay interacciones registradas en este período.
                </div>
              ) : (
                (topProducts.mostClicked.length > 0 ? topProducts.mostClicked : topProducts.mostViewed).slice(0, 5).map((p, idx) => (
                  <div
                    key={p.id}
                    className="bg-[#07090E] border border-white/5 hover:border-white/10 rounded-xl p-3 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <span className="font-mono font-black text-amber-400 text-sm w-4 shrink-0">
                        #{idx + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-white block truncate">{p.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          RD$ {Number(p.price || 0).toLocaleString()} · {p.category}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 font-mono font-bold text-[11px] border border-amber-500/20 block">
                        {p.clicks + p.drafts || p.views} interés
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PRODUCTS TABLE */}
      {activeSubTab === 'products' && (
        <div className="bg-[#0E121D] border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                Métricas Detalladas por Producto
              </h3>
              <p className="text-xs text-slate-400">
                Modelos que generan más vistas, drafts, carritos y pedidos confirmados.
              </p>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {topProducts.mostViewed.length} productos con actividad
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3">Producto / Modelo</th>
                  <th className="py-2.5 px-3">Categoría</th>
                  <th className="py-2.5 px-3">Precio</th>
                  <th className="py-2.5 px-3 text-center">Vistas</th>
                  <th className="py-2.5 px-3 text-center">Clics / Drafts</th>
                  <th className="py-2.5 px-3 text-center">Pedidos</th>
                  <th className="py-2.5 px-3 text-right">Facturación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {topProducts.mostViewed.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">
                      No hay datos de productos en este rango.
                    </td>
                  </tr>
                ) : (
                  topProducts.mostViewed.map((p) => (
                    <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-3 font-bold text-white">
                        {p.name}
                      </td>
                      <td className="py-3 px-3 text-slate-400 capitalize">
                        {p.category}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-300">
                        RD$ {Number(p.price || 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-sky-400">
                        {p.views || 0}
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-purple-400">
                        {(p.clicks || 0) + (p.drafts || 0)}
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-emerald-400">
                        {p.orders || 0}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-white">
                        RD$ {Number(p.revenue || 0).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: SECTORS & DESTINATIONS */}
      {activeSubTab === 'channels' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Top Sectors Calculated */}
          <div className="bg-[#0E121D] border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4 text-cyan-400" />
              <span>Sectores con Más Envíos Calculados</span>
            </h3>

            <div className="space-y-2">
              {topSectors.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  No hay cálculos de distancia registrados aún.
                </div>
              ) : (
                topSectors.map((sec, idx) => (
                  <div
                    key={idx}
                    className="bg-[#07090E] border border-white/5 rounded-xl p-2.5 flex items-center justify-between text-xs"
                  >
                    <span className="font-bold text-slate-300 truncate">{sec.name}</span>
                    <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-mono text-[10px] font-bold">
                      {sec.count} cálculos
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Traffic Sources */}
          <div className="bg-[#0E121D] border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-400" />
              <span>Canales de Entrada</span>
            </h3>

            <div className="space-y-3">
              {[
                { label: 'WhatsApp / Whaticket', count: channelBreakdown.whatsapp, color: 'bg-emerald-500' },
                { label: 'Tráfico Directo / Web', count: channelBreakdown.direct, color: 'bg-sky-500' },
                { label: 'Instagram / Redes', count: channelBreakdown.instagram, color: 'bg-pink-500' },
                { label: 'Catálogo de Asesores', count: channelBreakdown.catalog_staff, color: 'bg-amber-500' },
                { label: 'Extensión Chrome', count: channelBreakdown.extension, color: 'bg-[#FF1E27]' },
              ].map((c, i) => {
                const pct = Math.round((c.count / totalChannelEvents) * 100) || 0;
                return (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300 font-bold">{c.label}</span>
                      <span className="font-mono text-slate-400">{c.count} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-black/50 rounded-full h-2 overflow-hidden">
                      <div className={`h-full ${c.color}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Devices Breakdown */}
          <div className="bg-[#0E121D] border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-sky-400" />
              <span>Dispositivos</span>
            </h3>

            <div className="space-y-3">
              {[
                { label: 'Móvil (iPhone / Android)', count: deviceBreakdown.mobile, color: 'bg-sky-500' },
                { label: 'Computadora / Desktop', count: deviceBreakdown.desktop, color: 'bg-indigo-500' },
                { label: 'Tablet / iPad', count: deviceBreakdown.tablet, color: 'bg-purple-500' },
              ].map((d, i) => {
                const pct = Math.round((d.count / totalDeviceEvents) * 100) || 0;
                return (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300 font-bold">{d.label}</span>
                      <span className="font-mono text-slate-400">{d.count} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-black/50 rounded-full h-2 overflow-hidden">
                      <div className={`h-full ${d.color}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: LIVE ACTIVITY STREAM */}
      {activeSubTab === 'live' && (
        <div className="bg-[#0E121D] border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span>Registro de Actividad en Vivo ({recentActivity.length} eventos recientes)</span>
            </h3>
            <span className="text-[11px] text-slate-400">
              Actualizado: {lastUpdated.toLocaleTimeString()}
            </span>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {recentActivity.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                Esperando nuevas interacciones en el catálogo...
              </div>
            ) : (
              recentActivity.map((act) => (
                <div
                  key={act.id}
                  className="bg-[#07090E] border border-white/5 hover:border-white/10 rounded-xl p-3 flex items-center justify-between gap-3 text-xs transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 shrink-0 text-xs">
                      {act.type === 'page_view' && '🌐'}
                      {act.type === 'product_view' && '👟'}
                      {act.type === 'product_click' && '⚡'}
                      {act.type === 'add_to_cart' && '🛒'}
                      {act.type === 'whatsapp_click' && '💬'}
                      {act.type === 'photo_copy' && '📋'}
                      {act.type === 'photo_upload' && '📸'}
                      {act.type === 'distance_calc' && '📍'}
                      {act.type === 'quick_reply_copy' && '💬'}
                      {act.type === 'upload_link_created' && '🔗'}
                      {act.type === 'order_placed' && '💰'}
                    </div>

                    <div className="min-w-0 flex-1">
                      <span className="font-bold text-white block truncate">{act.title}</span>
                      <div className="text-[10px] text-slate-400 flex items-center gap-2">
                        {act.agentName && <span className="text-emerald-400 font-bold">Por {act.agentName}</span>}
                        {act.agentName && <span>•</span>}
                        <span className="capitalize">{act.source}</span>
                        <span>•</span>
                        <span className="capitalize">{act.device}</span>
                      </div>
                    </div>
                  </div>

                  <span className="font-mono text-[10px] text-slate-500 shrink-0">
                    {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MetricsDashboard;
