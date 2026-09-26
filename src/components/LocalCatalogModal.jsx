import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Search, 
  ShoppingBag, 
  Flame, 
  Zap, 
  Globe, 
  Lock, 
  Copy, 
  Check, 
  Plus, 
  RefreshCw, 
  Package, 
  Sparkles, 
  Filter, 
  ArrowUpRight,
  Layers,
  Tag,
  CheckCircle2,
  Database
} from 'lucide-react';
import { useCart } from '../context/CartContext';

export const LocalCatalogModal = () => {
  const { 
    isLocalCatalogOpen, 
    setIsLocalCatalogOpen, 
    openQuoterWithProduct, 
    setSelectedProduct, 
    formatMoney 
  } = useCart();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSyncingOdoo, setIsSyncingOdoo] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filterSource, setFilterSource] = useState('all'); // 'all', 'odoo', 'web', 'local_only'
  const [copiedId, setCopiedId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  useEffect(() => {
    if (isLocalCatalogOpen) {
      loadProducts();
    }
  }, [isLocalCatalogOpen]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setProducts(data);
        }
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  // Helper for auth headers
  const getAuthHeaders = () => {
    const token = sessionStorage.getItem('mvpflow_admin_token') || '';
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  };

  // Direct 1-Click Odoo Sync from Catalog
  const handleSyncOdoo = async () => {
    setIsSyncingOdoo(true);
    setSyncFeedback(null);
    try {
      const res = await fetch('/api/odoo/sync', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSyncFeedback(`¡${data.totalSynced || 0} productos sincronizados con éxito desde Odoo!`);
        await loadProducts();
      } else {
        setSyncFeedback(data.message || 'Error al conectar con Odoo.');
      }
    } catch (err) {
      setSyncFeedback(err.message || 'Error de conexión.');
    } finally {
      setIsSyncingOdoo(false);
      setTimeout(() => setSyncFeedback(null), 5000);
    }
  };

  // Fast 1-Click Web Toggle
  const handleToggleWebVisibility = async (productId, currentVal) => {
    setTogglingId(productId);
    const newVal = !currentVal;

    // Optimistic UI update
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, isPublishedWeb: newVal } : p))
    );

    try {
      await fetch(`/api/products/${productId}/toggle-web`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ isPublishedWeb: newVal }),
      });
    } catch {
      // Rollback
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, isPublishedWeb: currentVal } : p))
      );
    } finally {
      setTogglingId(null);
    }
  };

  // Copy sales pitch
  const handleCopySalesPitch = (product) => {
    const sizesStr = product.sizes?.join(', ') || '39 a 44';
    const text = 
      `👟 *${product.name.toUpperCase()}*\n` +
      `🔥 *Precio Especial:* RD$ ${Number(product.price).toLocaleString('es-DO')} (Antes: RD$ ${Number(product.originalPrice || product.price * 1.4).toLocaleString('es-DO')})\n` +
      `📏 *Tallas disponibles:* ${sizesStr}\n` +
      `📦 *Disponibilidad:* ${product.stockLeft > 0 ? `¡Solo quedan ${product.stockLeft} unidades en stock!` : 'Por encargo'}\n` +
      `🛵 *Envío Express con Pago Contra Entrega (COD):* Te lo llevamos hoy mismo a tu puerta en RD y pagas al recibir en efectivo al mensajero.\n\n` +
      `¿Qué talla te apartamos? Escríbenos para enviártelo de una vez. 🔥`;

    navigator.clipboard.writeText(text);
    setCopiedId(product.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtered products calculation
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (selectedCategory !== 'all' && p.category !== selectedCategory) {
        return false;
      }

      if (filterSource === 'odoo' && !p.isOdooProduct) return false;
      if (filterSource === 'web' && p.isPublishedWeb === false) return false;
      if (filterSource === 'local_only' && p.isPublishedWeb !== false) return false;

      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesName = p.name?.toLowerCase().includes(q);
        const matchesSku = p.sku?.toLowerCase().includes(q);
        const matchesDesc = p.description?.toLowerCase().includes(q);
        const matchesTag = p.tag?.toLowerCase().includes(q);
        return matchesName || matchesSku || matchesDesc || matchesTag;
      }

      return true;
    });
  }, [products, selectedCategory, filterSource, searchQuery]);

  if (!isLocalCatalogOpen) return null;

  const totalPublishedWeb = products.filter((p) => p.isPublishedWeb !== false).length;
  const totalLocalOnly = products.filter((p) => p.isPublishedWeb === false).length;
  const totalOdoo = products.filter((p) => p.isOdooProduct).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-6xl bg-gradient-to-b from-mvp-card via-mvp-dark to-mvp-black border border-mvp-cardHover rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col text-white">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-mvp-cardHover bg-mvp-dark flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-mvp-red to-mvp-crimson flex items-center justify-center shadow-glow-red flex-shrink-0">
              <ShoppingBag size={20} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-white">
                  Catálogo Completo & Ventas
                </h2>
                <span className="bg-amber-500/10 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                  Inventario en Vivo
                </span>
              </div>
              <p className="text-[11px] text-mvp-silver/70">
                Visualiza el catálogo de productos, copia fichas de venta y arma cotizaciones en 1 clic.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSyncOdoo}
              disabled={isSyncingOdoo}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 text-xs font-bold transition-all"
              title="Sincronizar inventario desde Odoo ERP"
            >
              <Database size={13} className={isSyncingOdoo ? 'animate-spin' : ''} />
              <span>{isSyncingOdoo ? 'Sincronizando...' : 'Sincronizar Odoo'}</span>
            </button>

            <button
              onClick={loadProducts}
              disabled={loading}
              className="p-2 text-mvp-muted hover:text-white rounded-xl hover:bg-white/5 transition-colors"
              title="Actualizar catálogo"
            >
              <RefreshCw size={17} className={loading ? 'animate-spin' : ''} />
            </button>

            <button
              onClick={() => setIsLocalCatalogOpen(false)}
              className="p-2 text-mvp-muted hover:text-white rounded-xl hover:bg-white/5 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Sync Feedback Toast */}
        {syncFeedback && (
          <div className="bg-purple-600/20 border-b border-purple-500/30 text-purple-200 px-4 py-2 text-xs flex items-center justify-between animate-fade-in">
            <span>{syncFeedback}</span>
            <button onClick={() => setSyncFeedback(null)} className="text-purple-400 hover:text-white">✕</button>
          </div>
        )}

        {/* Filter & Metric Ribbon */}
        <div className="px-4 sm:px-6 py-3 bg-mvp-dark/50 border-b border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 sm:gap-4 flex-wrap text-mvp-silver">
            <span className="flex items-center gap-1">
              <Package size={13} className="text-mvp-red" />
              Total Modelos: <strong className="text-white font-mono">{products.length}</strong>
            </span>
            <span className="flex items-center gap-1">
              <Globe size={13} className="text-emerald-400" />
              Públicos en Web: <strong className="text-white font-mono">{totalPublishedWeb}</strong>
            </span>
            <span className="flex items-center gap-1">
              <Database size={13} className="text-purple-400" />
              Odoo ERP: <strong className="text-white font-mono">{totalOdoo}</strong>
            </span>
          </div>

          <div className="text-[11px] text-amber-400 font-semibold flex items-center gap-1">
            <Zap size={12} />
            <span>Haz clic en "Cotizar" en cualquier modelo para armar la cotización.</span>
          </div>
        </div>

        {/* Search & Tabs Controls */}
        <div className="p-4 sm:px-6 sm:py-4 bg-mvp-card/50 border-b border-mvp-cardHover flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Buscar por modelo, marca, talla o SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-mvp-black border border-mvp-cardHover focus:border-amber-400 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-mvp-muted focus:outline-none transition-all shadow-inner"
            />
            <Search className="absolute left-3 top-2.5 text-mvp-muted" size={15} />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-xs text-mvp-muted hover:text-white"
              >
                ×
              </button>
            )}
          </div>

          {/* Categories & Source Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-mvp-black border border-mvp-cardHover text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              <option value="all">Todas las Categorías</option>
              <option value="sneakers">👟 Tenis Urbanos</option>
              <option value="combos">📦 Combos & Packs</option>
              <option value="hoodies">👕 Ropa & Hoodies</option>
              <option value="accessories">🕶️ Accesorios</option>
            </select>

            {/* Filter Tabs */}
            <div className="flex items-center bg-mvp-black rounded-xl p-1 border border-white/5 text-xs font-semibold">
              <button
                onClick={() => setFilterSource('all')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  filterSource === 'all' ? 'bg-white/10 text-white' : 'text-mvp-silver/60 hover:text-white'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setFilterSource('web')}
                className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all ${
                  filterSource === 'web' ? 'bg-emerald-500/20 text-emerald-300' : 'text-mvp-silver/60 hover:text-white'
                }`}
              >
                <Globe size={11} />
                <span>En Web</span>
              </button>
              <button
                onClick={() => setFilterSource('odoo')}
                className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all ${
                  filterSource === 'odoo' ? 'bg-purple-600/30 text-purple-300' : 'text-mvp-silver/60 hover:text-white'
                }`}
              >
                <Database size={11} />
                <span>Odoo ({totalOdoo})</span>
              </button>
            </div>
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {loading ? (
            <div className="py-20 text-center space-y-3">
              <RefreshCw size={32} className="animate-spin text-amber-400 mx-auto" />
              <p className="text-xs text-mvp-silver">Cargando inventario de productos...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-16 text-center space-y-4 max-w-sm mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto text-mvp-muted">
                <Package size={32} />
              </div>
              <p className="text-sm font-bold text-white">
                {filterSource === 'odoo' && totalOdoo === 0 
                  ? 'Aún no has sincronizado los productos de Odoo ERP' 
                  : 'No se encontraron productos con ese filtro.'}
              </p>
              {filterSource === 'odoo' && totalOdoo === 0 ? (
                <button
                  onClick={handleSyncOdoo}
                  disabled={isSyncingOdoo}
                  className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 mx-auto shadow-lg"
                >
                  <Database size={14} className={isSyncingOdoo ? 'animate-spin' : ''} />
                  <span>{isSyncingOdoo ? 'Sincronizando...' : 'Sincronizar Odoo Ahora'}</span>
                </button>
              ) : (
                <button
                  onClick={() => { setSearchQuery(''); setSelectedCategory('all'); setFilterSource('all'); }}
                  className="px-4 py-2 bg-mvp-card hover:bg-mvp-cardHover text-white text-xs font-bold rounded-xl border border-white/10"
                >
                  Restablecer Filtros
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map((product) => {
                const isPublished = product.isPublishedWeb !== false;
                const isCopied = copiedId === product.id;
                const isToggling = togglingId === product.id;

                return (
                  <div
                    key={product.id}
                    className={`group bg-mvp-dark/90 border rounded-2xl p-3 flex flex-col justify-between transition-all duration-200 hover:border-amber-400/50 hover:shadow-glow-sm ${
                      isPublished ? 'border-mvp-cardHover' : 'border-amber-500/20 bg-mvp-dark/50'
                    }`}
                  >
                    {/* Top Row: Thumbnail + Badges */}
                    <div>
                      <div className="relative aspect-square rounded-xl overflow-hidden bg-black/60 mb-2.5 border border-white/5">
                        <img
                          src={product.images?.[0] || '/img/drop-1.jpg'}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />

                        {/* Badges */}
                        <div className="absolute top-2 left-2 flex flex-col gap-1">
                          {product.isOdooProduct && (
                            <span className="bg-purple-600/90 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-sm">
                              ODOO
                            </span>
                          )}
                          {product.tag && (
                            <span className="bg-black/80 backdrop-blur-md text-amber-300 text-[9px] font-black px-1.5 py-0.5 rounded border border-amber-400/30">
                              {product.tag}
                            </span>
                          )}
                        </div>

                        {/* Web Visibility Pill */}
                        <button
                          onClick={() => handleToggleWebVisibility(product.id, isPublished)}
                          disabled={isToggling}
                          className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-bold flex items-center gap-1 backdrop-blur-md border transition-all ${
                            isPublished
                              ? 'bg-emerald-500/80 text-white border-emerald-400'
                              : 'bg-black/80 text-amber-300 border-amber-400/40 hover:bg-black'
                          }`}
                          title="Clic para cambiar visibilidad en la tienda web"
                        >
                          {isPublished ? (
                            <>
                              <Globe size={10} />
                              <span>En Web</span>
                            </>
                          ) : (
                            <>
                              <Lock size={10} />
                              <span>Solo Catálogo</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Product Name & SKU */}
                      <h3 className="font-display font-black text-xs text-white leading-tight mb-1 line-clamp-2">
                        {product.name}
                      </h3>
                      <div className="flex items-center justify-between text-[10px] text-mvp-silver/70 mb-2">
                        <span>SKU: {product.sku || product.id}</span>
                        <span>Stock: <strong className="text-white font-mono">{product.stockLeft || 8}</strong></span>
                      </div>

                      {/* Sizes preview */}
                      <div className="flex flex-wrap gap-1 mb-2.5">
                        {(product.sizes || []).slice(0, 4).map((s) => (
                          <span
                            key={s}
                            className="bg-black/50 text-mvp-silver/90 text-[9px] font-mono px-1.5 py-0.5 rounded border border-white/5"
                          >
                            {s}
                          </span>
                        ))}
                        {(product.sizes || []).length > 4 && (
                          <span className="text-[9px] text-mvp-silver/50 self-center">
                            +{product.sizes.length - 4}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Price & Action Buttons */}
                    <div className="pt-2 border-t border-white/5 space-y-2">
                      <div className="flex items-baseline justify-between">
                        <div>
                          <span className="text-xs font-mono font-black text-white">
                            RD$ {Number(product.price).toLocaleString('es-DO')}
                          </span>
                          {product.originalPrice && (
                            <span className="text-[10px] font-mono line-through text-mvp-silver/50 ml-1.5">
                              RD$ {Number(product.originalPrice).toLocaleString('es-DO')}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          onClick={() => {
                            setIsLocalCatalogOpen(false);
                            openQuoterWithProduct(product);
                          }}
                          className="py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-[11px] uppercase tracking-wider rounded-xl flex items-center justify-center gap-1 shadow-sm active:scale-98 transition-all"
                        >
                          <Zap size={12} />
                          <span>Cotizar</span>
                        </button>

                        <button
                          onClick={() => handleCopySalesPitch(product)}
                          className="py-1.5 bg-mvp-card hover:bg-white/10 text-white font-bold text-[11px] rounded-xl border border-white/10 flex items-center justify-center gap-1 transition-all"
                          title="Copiar texto de venta para WhatsApp o Instagram"
                        >
                          {isCopied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                          <span>{isCopied ? '¡Copiado!' : 'Copiar'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:px-6 bg-mvp-dark border-t border-mvp-cardHover flex items-center justify-between text-xs text-mvp-silver/70">
          <span>💡 El personal puede alternar la visibilidad web de cualquier producto con 1 clic.</span>
          <button
            onClick={() => setIsLocalCatalogOpen(false)}
            className="px-4 py-1.5 bg-mvp-card hover:bg-white/10 text-white font-bold rounded-xl transition-all"
          >
            Cerrar Catálogo
          </button>
        </div>

      </div>
    </div>
  );
};
