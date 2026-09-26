import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { StoriesBar } from './components/StoriesBar';
import { HeroBanner } from './components/HeroBanner';
import { ShowroomsSection } from './components/ShowroomsSection';
import { FlashDeals } from './components/FlashDeals';
import { CategoryFilter } from './components/CategoryFilter';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { QuickProductActionModal } from './components/QuickProductActionModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { SpinWheel } from './components/SpinWheel';
import { OrderTracker } from './components/OrderTracker';
import { AdminModal } from './components/AdminModal';
import { StaffManualModal } from './components/StaffManualModal';
import { StaffPortal } from './components/StaffPortal';
import { StoryUploadManager } from './components/StoryUploadManager';
import { WishlistModal } from './components/WishlistModal';
import { LiveWhaticketChat } from './components/LiveWhaticketChat';
import { AuthModal } from './components/AuthModal';
import { UserProfileModal } from './components/UserProfileModal';
import { SocialProofToast } from './components/SocialProofToast';
import { SocialFeed } from './components/SocialFeed';
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
  const [isStoriesUploadOpen, setIsStoriesUploadOpen] = useState(false);
  
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      
      {/* Sticky Header with Shopify Style MegaMenu */}
      <Navbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSelectCategory={handleSelectCategory}
      />

      {/* Stories Bar (Retail Instagram Style Stories) */}
      <StoriesBar onOpenUploadModal={() => setIsStoriesUploadOpen(true)} />

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
          <div className="bg-slate-900 border border-blue-500/40 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 flex-shrink-0">
                <Search size={18} />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-white">
                  Resultados para: <span className="text-amber-300">"{searchQuery}"</span>
                </h2>
                <p className="text-xs text-slate-400">
                  {filteredProducts.length} {filteredProducts.length === 1 ? 'artículo encontrado' : 'artículos encontrados'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-700"
              >
                <X size={14} />
                <span>Limpiar Búsqueda</span>
              </button>
            </div>
          </div>
        ) : (
          /* Normal Department Catalog Header with 3 View Toggles */
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 bg-slate-900/60 border border-slate-800 rounded-2xl p-4 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-sm flex-shrink-0">
                <Package size={20} />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-white leading-tight uppercase tracking-wide">
                  {selectedCategory === 'todos' ? 'Catálogo General Plastir' : `Departamento: ${selectedCategory.toUpperCase()}`}
                </h2>
                <div className="flex items-center gap-2 text-xs">
                  <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    Inventario en Tiempo Real
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-400 text-[11px]">{filteredProducts.length} artículos</span>
                </div>
              </div>
            </div>

            {/* View Mode Switcher (Compact / List / Grid) */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 shadow-inner self-end sm:self-auto">
              <button
                type="button"
                onClick={() => handleSetViewMode('compact')}
                className={`p-1.5 sm:p-2 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'compact' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
                title="Listado Compacto"
              >
                <Menu size={16} />
              </button>
              <button
                type="button"
                onClick={() => handleSetViewMode('list')}
                className={`p-1.5 sm:p-2 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'list' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
                title="Lista Detallada"
              >
                <List size={16} />
              </button>
              <button
                type="button"
                onClick={() => handleSetViewMode('grid')}
                className={`p-1.5 sm:p-2 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'grid' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
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
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 sm:p-12 text-center space-y-3 my-6">
            <p className="text-sm sm:text-base font-bold text-white">No encontramos productos para "{searchQuery}".</p>
            <p className="text-xs text-slate-400">Prueba buscando por "cajas", "herméticos", "zafacones" o "sillas".</p>
            <button
              onClick={() => {
                setSelectedCategory('todos');
                setSearchQuery('');
              }}
              className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-blue-500 transition-colors shadow-md"
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

      {/* Community Feed */}
      {!isSearching && <SocialFeed />}

      {/* Footer */}
      <Footer onSelectCategory={handleSelectCategory} />

      {/* Interactive Modals */}
      <ProductDetailModal />
      <QuickProductActionModal />
      <CartDrawer />
      <CheckoutModal />
      <QuickQuoterModal />
      <SpinWheel />
      <OrderTracker />
      <AdminModal onProductUpdated={fetchProductsFromApi} />
      <StaffManualModal />
      <StaffPortal 
        isOpen={isStaffPortalOpen} 
        onClose={() => setIsStaffPortalOpen(false)} 
        allProducts={allProducts} 
        onSyncOdoo={handleSyncOdoo} 
      />
      {isStoriesUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-4xl my-auto max-h-[92vh] overflow-y-auto">
            <StoryUploadManager isOpen={true} onClose={() => setIsStoriesUploadOpen(false)} />
          </div>
        </div>
      )}
      <WishlistModal />
      <LiveWhaticketChat />
      <AuthModal />
      <UserProfileModal />
      <SocialProofToast />
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
