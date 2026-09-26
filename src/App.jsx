import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { ShowroomsSection } from './components/ShowroomsSection';
import { FlashDeals } from './components/FlashDeals';
import { CategoryFilter } from './components/CategoryFilter';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { QuickProductActionModal } from './components/QuickProductActionModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderTracker } from './components/OrderTracker';
import { AdminModal } from './components/AdminModal';
import { StaffManualModal } from './components/StaffManualModal';
import { StaffPortal } from './components/StaffPortal';
import { WishlistModal } from './components/WishlistModal';
import { LiveWhaticketChat } from './components/LiveWhaticketChat';
import { AuthModal } from './components/AuthModal';
import { UserProfileModal } from './components/UserProfileModal';
import { ExecutiveTrustSection } from './components/ExecutiveTrustSection';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { MobileBottomNav } from './components/MobileBottomNav';
import { QuickQuoterModal } from './components/QuickQuoterModal';
import { Footer } from './components/Footer';
import { PRODUCTS as STATIC_PRODUCTS } from './data/products';
import { useCart } from './context/CartContext';
import { Sparkles, LayoutGrid, List, Menu, Search, X, Package } from 'lucide-react';

import { trackPageView, trackSearchQuery, trackCategoryClick, initSessionTracking } from './utils/tracker';

const normalizeText = (text) => {
  return String(text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
    .trim();
};

// Spanish phonetic & acoustic normalization for common typos (v/b, c/s/z, h, y/ll)
const phoneticKey = (word) => {
  return String(word || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/v/g, 'b')
    .replace(/z/g, 's')
    .replace(/c(?=[ei])/g, 's')
    .replace(/k/g, 'c')
    .replace(/qu(?=[ei])/g, 'c')
    .replace(/h/g, '')
    .replace(/y(?=[aeiou]|$)/g, 'll')
    .replace(/m(?=[pb])/g, 'n');
};

// Fast Levenshtein distance with early exit
const levenshtein = (a, b) => {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  if (Math.abs(a.length - b.length) > 2) return 3;

  const d = [];
  for (let j = 0; j <= b.length; j++) d[j] = j;

  for (let i = 1; i <= a.length; i++) {
    let prev = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      const val = Math.min(d[j - 1] + cost, d[j] + 1, prev + 1);
      d[j - 1] = prev;
      prev = val;
    }
    d[b.length] = prev;
  }
  return d[b.length];
};

// Domain-specific plastic & home synonyms and root stems
const getSearchStems = (queryWord) => {
  const stems = new Set([queryWord]);
  if (queryWord.endsWith('es') && queryWord.length > 3) stems.add(queryWord.slice(0, -2));
  else if (queryWord.endsWith('s') && queryWord.length > 2) stems.add(queryWord.slice(0, -1));

  if (queryWord.includes('caj') || queryWord.includes('organ') || queryWord.includes('box')) {
    stems.add('caja'); stems.add('cajas'); stems.add('organizador'); stems.add('organizadores'); stems.add('box');
  }
  if (queryWord.includes('hermet') || queryWord.includes('taper') || queryWord.includes('tuper') || queryWord.includes('recip')) {
    stems.add('hermetico'); stems.add('hermeticos'); stems.add('contenedor'); stems.add('contenedores'); stems.add('recipiente');
  }
  if (queryWord.includes('zafac') || queryWord.includes('basur') || queryWord.includes('tacho') || queryWord.includes('bote')) {
    stems.add('zafacon'); stems.add('zafacones'); stems.add('basura'); stems.add('contenedor');
  }
  if (queryWord.includes('cest') || queryWord.includes('canast') || queryWord.includes('rop')) {
    stems.add('cesto'); stems.add('cestos'); stems.add('canasta'); stems.add('canastas'); stems.add('ropa');
  }
  if (queryWord.includes('sill') || queryWord.includes('mes') || queryWord.includes('banc') || queryWord.includes('taburet')) {
    stems.add('silla'); stems.add('sillas'); stems.add('mesa'); stems.add('mesas'); stems.add('banco');
  }
  if (queryWord.includes('vas') || queryWord.includes('jarr') || queryWord.includes('cop')) {
    stems.add('vaso'); stems.add('vasos'); stems.add('jarra'); stems.add('jarras');
  }
  if (queryWord.includes('gavet') || queryWord.includes('cajon')) {
    stems.add('gavetero'); stems.add('gaveteros'); stems.add('cajon'); stems.add('cajones');
  }
  return Array.from(stems);
};

// Check whether a query token matches a product's name, sku, tag, or category
const isTokenMatch = (queryToken, product, targetWords, targetText) => {
  if (!queryToken) return true;

  const isNumericOrShort = /^\d+$/.test(queryToken) || queryToken.length <= 2;

  if (isNumericOrShort) {
    const nameNorm = normalizeText(product.name || '');
    const tagNorm = normalizeText(product.tag || '');
    const skuNorm = normalizeText(product.sku || '');

    const boundaryRegex = new RegExp(`(^|[^a-z0-9])${queryToken}([^a-z0-9]|$)`, 'i');
    return boundaryRegex.test(nameNorm) || boundaryRegex.test(tagNorm) || boundaryRegex.test(skuNorm);
  }

  // Alphanumeric / Word Token Matching
  if (targetText.includes(queryToken)) return true;

  const stems = getSearchStems(queryToken);
  for (const stem of stems) {
    if (targetText.includes(stem)) return true;
  }

  if (queryToken.length >= 3) {
    const pQuery = phoneticKey(queryToken);
    for (const tWord of targetWords) {
      if (!tWord || tWord.length < 3) continue;
      if (tWord === queryToken || tWord.includes(queryToken) || queryToken.includes(tWord)) return true;

      const pTarget = phoneticKey(tWord);
      if (pQuery === pTarget) return true;

      if (queryToken.length >= 4 && tWord.length >= 4) {
        if (levenshtein(queryToken, tWord) <= 1) return true;
      }
    }
  }

  return false;
};

export const App = () => {
  const { setSelectedProduct } = useCart();
  const [allProducts, setAllProducts] = useState(STATIC_PRODUCTS);
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [isStaffPortalOpen, setIsStaffPortalOpen] = useState(false);
  
  // View mode preferences: 'grid', 'list', 'compact'
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('plastir_view_mode') || 'grid';
  });

  const handleSetViewMode = (mode) => {
    setViewMode(mode);
    localStorage.setItem('plastir_view_mode', mode);
  };

  // Sync products from server API
  const fetchProductsFromApi = useCallback(async () => {
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setAllProducts(data);
        }
      }
    } catch {
      // Fallback to static products
    }
  }, []);

  useEffect(() => {
    initSessionTracking();
    trackPageView('home_storefront');
    fetchProductsFromApi();
  }, [fetchProductsFromApi]);

  const handleSelectCategory = (catId) => {
    trackCategoryClick(catId);
    setSelectedCategory(catId);
    setSearchQuery('');
  };

  const handleSyncOdoo = async () => {
    try {
      const res = await fetch('/api/odoo/sync', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.products && Array.isArray(data.products)) {
          setAllProducts(data.products);
        }
      }
    } catch (e) {
      console.error('Odoo sync error:', e);
    }
  };

  // Filtered Products
  const filteredProducts = useMemo(() => {
    let prods = [...allProducts];

    // Filter by Category/Department
    if (selectedCategory && selectedCategory !== 'todos') {
      prods = prods.filter((p) => p.category === selectedCategory);
    }

    // Filter by Search Query
    const cleanQuery = normalizeText(searchQuery);
    if (!cleanQuery) return prods;

    const queryTokens = cleanQuery.split(/\s+/).filter(Boolean);

    return prods.filter((product) => {
      const targetText = normalizeText(
        `${product.name || ''} ${product.tag || ''} ${product.sku || ''} ${product.category || ''} ${product.department || ''} ${product.capacity || ''}`
      );
      const targetWords = targetText.split(/\s+/).filter(Boolean);

      return queryTokens.every((token) => isTokenMatch(token, product, targetWords, targetText));
    });
  }, [allProducts, selectedCategory, searchQuery]);

  const isSearching = Boolean(searchQuery.trim());

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-900 flex flex-col font-sans selection:bg-[#F16100] selection:text-white">
      
      {/* Sticky Header with Shopify Style MegaMenu */}
      <Navbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSelectCategory={handleSelectCategory}
      />

      {/* Hero Showcase (hidden while searching to keep focus) */}
      {!isSearching && (
        <>
          <HeroBanner onSelectCategory={handleSelectCategory} />
          
          {/* IKEA Showrooms / Inspírate por Espacios */}
          <ShowroomsSection 
            onSelectCategory={handleSelectCategory} 
            onSelectProduct={(p) => setSelectedProduct(p)} 
          />

          <FlashDeals />

          {/* Department Filter Bar */}
          <CategoryFilter
            selectedCategory={selectedCategory}
            onSelectCategory={handleSelectCategory}
          />
        </>
      )}

      {/* Main Department Store Catalog */}
      <main id="catalog" className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-10 flex-1 w-full">
        
        {/* Search Results Header */}
        {isSearching ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-[#F16100] flex-shrink-0">
                <Search size={18} />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900">
                  Resultados para: <span className="text-[#F16100]">"{searchQuery}"</span>
                </h2>
                <p className="text-xs text-slate-500">
                  {filteredProducts.length} {filteredProducts.length === 1 ? 'artículo encontrado' : 'artículos encontrados'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-200"
              >
                <X size={14} />
                <span>Limpiar Búsqueda</span>
              </button>
            </div>
          </div>
        ) : (
          /* Normal Department Catalog Header with 3 View Toggles */
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center text-[#F16100] shadow-sm flex-shrink-0">
                <Package size={20} />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900 leading-tight uppercase tracking-wide">
                  {selectedCategory === 'todos' ? 'Catálogo General de Artículos para el Hogar' : `Departamento: ${selectedCategory.toUpperCase()}`}
                </h2>
                <div className="flex items-center gap-2 text-xs">
                  <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Inventario en Tiempo Real
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-500 text-[11px]">{filteredProducts.length} artículos</span>
                </div>
              </div>
            </div>

            {/* View Mode Switcher (Compact / List / Grid) */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-inner self-end sm:self-auto">
              <button
                type="button"
                onClick={() => handleSetViewMode('compact')}
                className={`p-1.5 sm:p-2 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'compact' ? 'bg-[#F16100] text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Listado Compacto"
              >
                <Menu size={16} />
              </button>
              <button
                type="button"
                onClick={() => handleSetViewMode('list')}
                className={`p-1.5 sm:p-2 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'list' ? 'bg-[#F16100] text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Lista Detallada"
              >
                <List size={16} />
              </button>
              <button
                type="button"
                onClick={() => handleSetViewMode('grid')}
                className={`p-1.5 sm:p-2 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'grid' ? 'bg-[#F16100] text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Cuadrícula Departamental"
              >
                <LayoutGrid size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Product Cards Container */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 text-center space-y-3 my-6 shadow-sm">
            <p className="text-sm sm:text-base font-bold text-slate-900">No encontramos productos para "{searchQuery}".</p>
            <p className="text-xs text-slate-500">Prueba buscando por "cajas", "herméticos", "zafacones" o "sillas".</p>
            <button
              onClick={() => {
                setSelectedCategory('todos');
                setSearchQuery('');
              }}
              className="px-5 py-2.5 rounded-xl bg-[#F16100] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#E05300] transition-colors shadow-md"
            >
              Ver Catálogo Completo
            </button>
          </div>
        ) : (
          <div className={
            viewMode === 'compact'
              ? 'flex flex-col gap-2 max-w-3xl mx-auto'
              : viewMode === 'list'
              ? 'flex flex-col gap-3 max-w-2xl mx-auto'
              : 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6'
          }>
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} viewMode={viewMode} />
            ))}
          </div>
        )}

      </main>

      {/* Executive Trust Pillars & Verified Reviews */}
      {!isSearching && <ExecutiveTrustSection />}

      {/* Footer */}
      <Footer onSelectCategory={handleSelectCategory} />

      {/* Interactive Modals */}
      <ProductDetailModal />
      <QuickProductActionModal />
      <CartDrawer />
      <CheckoutModal />
      <QuickQuoterModal />
      <OrderTracker />
      <AdminModal onProductUpdated={fetchProductsFromApi} />
      <StaffManualModal />
      <StaffPortal 
        isOpen={isStaffPortalOpen} 
        onClose={() => setIsStaffPortalOpen(false)} 
        allProducts={allProducts} 
        onSyncOdoo={handleSyncOdoo} 
      />
      <WishlistModal />
      <LiveWhaticketChat />
      <AuthModal />
      <UserProfileModal />
      <FloatingWhatsApp />

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        selectedCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
      />

    </div>
  );
};

export default App;
