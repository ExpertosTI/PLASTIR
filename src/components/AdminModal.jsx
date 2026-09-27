import React, { useState, useEffect } from 'react';
import { 
  X, 
  Settings, 
  Package, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  DollarSign, 
  Globe, 
  Key, 
  Server, 
  Phone, 
  Flame, 
  Users, 
  Layers, 
  Zap, 
  MessageSquare,
  Lock,
  Unlock,
  ShieldCheck,
  LogOut,
  BookOpen,
  TrendingUp,
  MapPin,
  Copy,
  Check,
  Database,
  ArrowRight,
  Film
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { PRODUCTS as DEFAULT_PRODUCTS, CATEGORIES } from '../data/products';

export const AdminModal = ({ onProductUpdated }) => {
  const { 
    isAdminOpen, 
    setIsAdminOpen, 
    setIsManualOpen, 
    openQuoterWithProduct, 
    formatMoney 
  } = useCart();
  const { storeFollowers } = useAuth();

  // Admin Password Protection Gate
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return sessionStorage.getItem('plastir_admin_auth') === 'true';
    } catch {
      return false;
    }
  });
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);

  const [activeTab, setActiveTab] = useState('products'); // 'products', 'orders', 'odoo', 'whaticket', 'metrics'
  const [productsList, setProductsList] = useState(DEFAULT_PRODUCTS);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  // Product Create/Edit Modal State
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    category: 'cajas',
    tag: '✨ MÁS VENDIDO',
    price: 950,
    originalPrice: 1400,
    discountPercent: 32,
    stockLeft: 15,
    soldPercent: 40,
    isFlashDeal: false,
    flashEndHours: 24,
    isPublishedWeb: true,
    sizes: 'Estándar, 30L, 50L, 70L',
    colors: 'Transparente (#E2E8F0), Blanco (#FFFFFF), Gris (#64748B)',
    images: '',
    description: 'Artículo de plástico de alta resistencia para organización en el hogar y oficina.',
    features: 'Tapa hermética, Cierre a presión, Libre de BPA, Apilable',
  });

  // Whaticket API Config State
  const [whaticketConfig, setWhaticketConfig] = useState({
    apiUrl: 'https://app.whaticket.com/api',
    token: '',
    connectionId: '',
    queueId: '',
    userId: '',
    supportPhone: '18096560219',
    autoSendWhaticket: true,
  });
  const [whaticketTestResult, setWhaticketTestResult] = useState(null);
  const [isTestingWhaticket, setIsTestingWhaticket] = useState(false);

  // Odoo ERP Config State
  const [odooConfig, setOdooConfig] = useState({
    url: '',
    db: '',
    username: '',
    apiKey: '',
    autoSync: true,
  });
  const [odooTestResult, setOdooTestResult] = useState(null);
  const [isTestingOdoo, setIsTestingOdoo] = useState(false);
  const [isSyncingOdoo, setIsSyncingOdoo] = useState(false);
  const [odooSyncResult, setOdooSyncResult] = useState(null);

  const [adminCopied, setAdminCopied] = useState(null);

  const handleAdminCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setAdminCopied(id);
    setTimeout(() => setAdminCopied(null), 2000);
  };

  const getAuthHeaders = () => {
    const token = sessionStorage.getItem('plastir_admin_token') || localStorage.getItem('plastir_admin_token') || '';
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  };

  useEffect(() => {
    if (isAdminOpen && isAuthenticated) {
      loadProducts();
      loadOrders();
      loadAppConfig();
    }
  }, [isAdminOpen, isAuthenticated]);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    const pass = adminPasswordInput.trim();
    if (!pass) return;

    try {
      const res = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pass }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.token) {
        setIsAuthenticated(true);
        sessionStorage.setItem('plastir_admin_auth', 'true');
        sessionStorage.setItem('plastir_admin_token', data.token);
        localStorage.setItem('plastir_admin_token', data.token);
        setPasswordError(false);
        setAdminPasswordInput('');
        return;
      }
      setPasswordError(true);
    } catch {
      setPasswordError(true);
    }
  };

  const handleAdminLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('plastir_admin_auth');
    sessionStorage.removeItem('plastir_admin_token');
    localStorage.removeItem('plastir_admin_token');
  };

  const loadProducts = async () => {
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setProductsList(data);
          return;
        }
      }
    } catch {}
    setProductsList(DEFAULT_PRODUCTS);
  };

  const loadOrders = async () => {
    try {
      const res = await fetch('/api/orders', { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
        return;
      }
    } catch {
      // Fallback
    }
    const local = JSON.parse(localStorage.getItem('plastir_orders') || '[]');
    setOrders(local);
  };

  const loadAppConfig = async () => {
    try {
      const res = await fetch('/api/config', { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        if (data.whaticketConfig) setWhaticketConfig(data.whaticketConfig);
        if (data.odooConfig) setOdooConfig(data.odooConfig);
        if (data.odooSyncStatus) setOdooSyncResult({ success: true, ...data.odooSyncStatus });
      }
    } catch {
      const savedWhaticket = localStorage.getItem('plastir_whaticket_config');
      if (savedWhaticket) setWhaticketConfig(JSON.parse(savedWhaticket));
      const savedOdoo = localStorage.getItem('plastir_odoo_config');
      if (savedOdoo) setOdooConfig(JSON.parse(savedOdoo));
    }
  };

  // Toggle Web Visibility
  const handleToggleWeb = async (productId, currentVal) => {
    const newVal = !currentVal;
    setProductsList((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, isPublishedWeb: newVal } : p))
    );

    try {
      await fetch(`/api/products/${productId}/toggle-web`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ isPublishedWeb: newVal }),
      });
      if (onProductUpdated) onProductUpdated();
    } catch {}
  };

  const handleOpenCreateProduct = () => {
    setEditingId(null);
    setProductForm({
      name: '',
      category: 'cajas',
      tag: '✨ MÁS VENDIDO',
      price: 950,
      originalPrice: 1400,
      discountPercent: 32,
      stockLeft: 15,
      soldPercent: 40,
      isFlashDeal: false,
      flashEndHours: 24,
      isPublishedWeb: true,
      sizes: 'Estándar, 30L, 50L, 70L',
      colors: 'Transparente (#E2E8F0), Blanco (#FFFFFF), Gris (#64748B)',
      images: '',
      description: 'Artículo de plástico de alta resistencia para el hogar.',
      features: 'Tapa hermética, Cierre a presión, Libre de BPA, Apilable',
    });
    setIsEditingProduct(true);
  };

  const handleOpenEditProduct = (prod) => {
    setEditingId(prod.id);
    setProductForm({
      name: prod.name,
      category: prod.category || 'cajas',
      tag: prod.tag || '',
      price: prod.price,
      originalPrice: prod.originalPrice || prod.price * 1.5,
      discountPercent: prod.discountPercent || 40,
      stockLeft: prod.stockLeft || 5,
      soldPercent: prod.soldPercent || 80,
      isFlashDeal: !!prod.isFlashDeal,
      flashEndHours: prod.flashEndHours || 3,
      isPublishedWeb: prod.isPublishedWeb !== false,
      sizes: prod.sizes?.join(', ') || '39, 40, 41, 42, 43',
      colors: prod.colors?.map((c) => `${c.name} (${c.hex})`).join(', ') || 'Negro (#111111)',
      images: prod.images?.join(', ') || '',
      description: prod.description || '',
      features: prod.features?.join(', ') || '',
    });
    setIsEditingProduct(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!productForm.name || !productForm.price) {
      alert('Por favor completa el nombre y precio.');
      return;
    }

    const sizesArr = productForm.sizes.split(',').map((s) => s.trim()).filter(Boolean);
    const imagesArr = productForm.images.split(',').map((img) => img.trim()).filter(Boolean);
    const featuresArr = productForm.features.split(',').map((f) => f.trim()).filter(Boolean);

    const colorsArr = productForm.colors.split(',').map((colStr) => {
      const match = colStr.match(/(.+?)\s*\((#[0-9a-fA-F]{3,6})\)/);
      if (match) {
        return { name: match[1].trim(), hex: match[2].trim() };
      }
      return { name: colStr.trim(), hex: '#FF1E27' };
    }).filter((c) => c.name);

    const discountCalculated = Math.round(
      ((productForm.originalPrice - productForm.price) / productForm.originalPrice) * 100
    );

    const productPayload = {
      id: editingId || `mvp-${Date.now().toString().slice(-4)}`,
      name: productForm.name,
      category: productForm.category,
      tag: productForm.tag,
      price: Number(productForm.price),
      originalPrice: Number(productForm.originalPrice),
      discountPercent: discountCalculated > 0 ? discountCalculated : productForm.discountPercent,
      stockLeft: Number(productForm.stockLeft),
      soldPercent: Number(productForm.soldPercent),
      isFlashDeal: productForm.isFlashDeal,
      flashEndHours: Number(productForm.flashEndHours),
      isPublishedWeb: Boolean(productForm.isPublishedWeb),
      isLocalCatalog: true,
      sizes: sizesArr.length > 0 ? sizesArr : ['39', '40', '41', '42'],
      colors: colorsArr.length > 0 ? colorsArr : [{ name: 'Negro', hex: '#111111' }],
      images: imagesArr.length > 0 ? imagesArr : ['/img/drop-1.jpg'],
      description: productForm.description,
      features: featuresArr,
    };

    try {
      if (editingId) {
        await fetch(`/api/products/${editingId}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(productPayload),
        });
      } else {
        await fetch('/api/products', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(productPayload),
        });
      }
    } catch {}

    const updated = editingId
      ? productsList.map((p) => (p.id === editingId ? productPayload : p))
      : [productPayload, ...productsList];

    setProductsList(updated);
    setIsEditingProduct(false);

    if (onProductUpdated) onProductUpdated();
    alert('¡Producto guardado correctamente!');
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este producto?')) return;

    try {
      await fetch(`/api/products/${id}`, { 
        method: 'DELETE',
        headers: getAuthHeaders()
      });
    } catch {}

    const updated = productsList.filter((p) => p.id !== id);
    setProductsList(updated);
    if (onProductUpdated) onProductUpdated();
  };

  const handleUpdateOrderStatus = async (trackingId, newStatus) => {
    const updated = orders.map((o) => (o.trackingId === trackingId ? { ...o, status: newStatus } : o));
    setOrders(updated);
    localStorage.setItem('plastir_orders', JSON.stringify(updated));

    try {
      await fetch(`/api/orders/${trackingId}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: newStatus }),
      });
      alert(`Estado actualizado a ${newStatus} y mensaje Whaticket enviado.`);
    } catch {}
  };

  // Save Whaticket Config
  const handleSaveWhaticketConfig = async (e) => {
    e.preventDefault();
    try {
      await fetch('/api/config', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ whaticketConfig }),
      });
    } catch {}
    localStorage.setItem('plastir_whaticket_config', JSON.stringify(whaticketConfig));
    alert('Configuración de Whaticket guardada correctamente.');
  };

  // Test Whaticket Connection
  const handleTestWhaticket = async () => {
    setIsTestingWhaticket(true);
    setWhaticketTestResult(null);
    try {
      const res = await fetch('/api/whaticket/test', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(whaticketConfig),
      });
      const data = await res.json();
      setWhaticketTestResult(data);
    } catch (err) {
      setWhaticketTestResult({ success: false, message: 'Error contactando el servidor de Whaticket.' });
    } finally {
      setIsTestingWhaticket(false);
    }
  };

  // Save Odoo Config
  const handleSaveOdooConfig = async (e) => {
    e.preventDefault();
    try {
      await fetch('/api/config', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ odooConfig }),
      });
    } catch {}
    localStorage.setItem('plastir_odoo_config', JSON.stringify(odooConfig));
    alert('Configuración de Odoo guardada correctamente.');
  };

  // Test Odoo Connection
  const handleTestOdoo = async () => {
    setIsTestingOdoo(true);
    setOdooTestResult(null);
    try {
      const res = await fetch('/api/odoo/test', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(odooConfig),
      });
      const data = await res.json();
      setOdooTestResult(data);
    } catch (err) {
      setOdooTestResult({ success: false, message: 'Error contactando el servidor Odoo.' });
    } finally {
      setIsTestingOdoo(false);
    }
  };

  // Sync Products from Odoo
  const handleSyncOdoo = async () => {
    setIsSyncingOdoo(true);
    setOdooSyncResult(null);
    try {
      const res = await fetch('/api/odoo/sync', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ config: odooConfig }),
      });
      const data = await res.json();
      setOdooSyncResult(data);
      if (data.success && data.products) {
        setProductsList(data.products);
        if (onProductUpdated) onProductUpdated();
      }
    } catch (err) {
      setOdooSyncResult({ success: false, message: err.message });
    } finally {
      setIsSyncingOdoo(false);
    }
  };

  if (!isAdminOpen) return null;

  const totalRevenue = orders.reduce((sum, o) => sum + (o.payment?.total || 0), 0);
  const deliveredOrders = orders.filter((o) => o.status === 'delivered');
  const deliveredRevenue = deliveredOrders.reduce((sum, o) => sum + (o.payment?.total || 0), 0);

  // If not authenticated, render Password Login Gate
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/90 backdrop-blur-md">
        <div className="relative w-full max-w-sm bg-gradient-to-b from-mvp-card via-mvp-dark to-mvp-black border-2 border-mvp-red/50 rounded-3xl p-6 shadow-glow-red space-y-4 text-center">
          <button
            onClick={() => setIsAdminOpen(false)}
            className="absolute top-4 right-4 p-1.5 text-mvp-muted hover:text-white rounded-lg"
          >
            <X size={18} />
          </button>

          <div className="w-12 h-12 rounded-2xl bg-mvp-red/20 border border-mvp-red/40 flex items-center justify-center text-mvp-red mx-auto">
            <Lock size={22} />
          </div>

          <div>
            <h2 className="text-base font-black text-white uppercase tracking-wider">
              Acceso Administrativo
            </h2>
            <p className="text-xs text-mvp-silver/70 mt-1">
              Introduce la contraseña de administración para gestionar la tienda.
            </p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-3 pt-2">
            <div>
              <input
                type="password"
                autoFocus
                required
                placeholder="Contraseña de Admin"
                value={adminPasswordInput}
                onChange={(e) => {
                  setAdminPasswordInput(e.target.value);
                  setPasswordError(false);
                }}
                className="w-full bg-mvp-black border border-mvp-cardHover focus:border-mvp-red rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-mvp-muted text-center focus:outline-none"
              />
            </div>

            {passwordError && (
              <p className="text-xs text-red-400 font-bold flex items-center justify-center gap-1">
                <AlertCircle size={13} />
                <span>Contraseña incorrecta</span>
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-mvp-red to-mvp-darkRed text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-glow-sm hover:scale-[1.02] transition-transform"
            >
              Ingresar al Panel
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-gradient-to-b from-mvp-card via-mvp-dark to-mvp-black border border-mvp-cardHover rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-mvp-cardHover bg-mvp-dark flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Settings size={22} className="text-mvp-red" />
            <div>
              <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-wider">
                Panel Administrativo CMS & Odoo / Whaticket (MVP FLOW RD)
              </h2>
              <span className="text-[11px] text-mvp-muted">Catálogo Real, Sincronización Odoo ERP y Whaticket API v1.0.0</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/subir-historias"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[11px] bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 text-white px-3 py-1.5 rounded-xl font-bold shadow-md hover:opacity-90 transition-opacity"
              title="Subir Historias y Reels TikTok / Instagram"
            >
              <Film size={13} />
              <span className="hidden sm:inline">Historias / Shorts</span>
            </a>

            <button
              onClick={() => {
                setIsAdminOpen(false);
                setIsManualOpen(true);
              }}
              className="flex items-center gap-1 text-[11px] bg-gradient-to-r from-mvp-red to-mvp-darkRed text-white px-3 py-1.5 rounded-xl font-bold shadow-glow-sm"
              title="Abrir Manual del Personal"
            >
              <BookOpen size={13} />
              <span className="hidden sm:inline">Manual</span>
            </button>

            <button
              onClick={handleAdminLogout}
              className="flex items-center gap-1 text-[11px] text-mvp-muted hover:text-red-400 bg-mvp-card px-2.5 py-1.5 rounded-lg border border-mvp-cardHover"
              title="Cerrar sesión de admin"
            >
              <LogOut size={13} />
              <span>Bloquear</span>
            </button>
            <button
              onClick={() => setIsAdminOpen(false)}
              className="p-2 text-mvp-muted hover:text-white rounded-xl hover:bg-mvp-card transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-mvp-cardHover bg-mvp-black px-4 pt-2 gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-colors whitespace-nowrap ${
              activeTab === 'products'
                ? 'bg-mvp-card text-white border-t-2 border-mvp-red'
                : 'text-mvp-muted hover:text-white'
            }`}
          >
            <Layers size={15} />
            <span>Catálogo & Publicación Web ({productsList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('odoo')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-colors whitespace-nowrap ${
              activeTab === 'odoo'
                ? 'bg-mvp-card text-white border-t-2 border-blue-500'
                : 'text-mvp-muted hover:text-white'
            }`}
          >
            <Database size={15} className="text-blue-400" />
            <span>Odoo ERP Sync 🔄</span>
          </button>

          <button
            onClick={() => setActiveTab('whaticket')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-colors whitespace-nowrap ${
              activeTab === 'whaticket'
                ? 'bg-mvp-card text-white border-t-2 border-emerald-500'
                : 'text-mvp-muted hover:text-white'
            }`}
          >
            <MessageSquare size={15} className="text-emerald-400" />
            <span>Whaticket API v1.0.0</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-colors whitespace-nowrap ${
              activeTab === 'orders'
                ? 'bg-mvp-card text-white border-t-2 border-mvp-red'
                : 'text-mvp-muted hover:text-white'
            }`}
          >
            <Package size={15} />
            <span>Autopedidos COD ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('metrics')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-colors whitespace-nowrap ${
              activeTab === 'metrics'
                ? 'bg-mvp-card text-white border-t-2 border-mvp-red'
                : 'text-mvp-muted hover:text-white'
            }`}
          >
            <DollarSign size={15} />
            <span>Métricas & Leads ({orders.length})</span>
          </button>
        </div>

        {/* Main Content Area */}
        <div className="overflow-y-auto p-4 sm:p-6 flex-1">
          
          {/* TAB 1: PRODUCTS CMS WITH WEB PUBLISH TOGGLE */}
          {activeTab === 'products' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-mvp-black/60 p-4 rounded-2xl border border-mvp-cardHover">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Gestión de Catálogo & Publicación en Web
                  </h3>
                  <p className="text-xs text-mvp-muted mt-0.5">
                    Activa o desactiva el interruptor "Mostrar en Web" para elegir qué modelos aparecen en la página y cuáles se reservan para venta en redes.
                  </p>
                </div>
                <button
                  onClick={handleOpenCreateProduct}
                  className="flex items-center gap-2 bg-mvp-red hover:bg-mvp-darkRed text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-glow-sm"
                >
                  <Plus size={16} />
                  <span>Crear Nuevo Producto</span>
                </button>
              </div>

              {/* Products Table */}
              <div className="bg-mvp-black rounded-2xl border border-mvp-cardHover overflow-hidden shadow-inner">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-mvp-silver">
                    <thead className="bg-mvp-dark text-[11px] uppercase tracking-wider text-mvp-muted border-b border-mvp-cardHover">
                      <tr>
                        <th className="p-3.5">Producto</th>
                        <th className="p-3.5">Origen / SKU</th>
                        <th className="p-3.5">Precio</th>
                        <th className="p-3.5">Stock</th>
                        <th className="p-3.5 text-center">Mostrar en WEB</th>
                        <th className="p-3.5 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-mvp-cardHover">
                      {productsList.map((p) => {
                        const isWeb = p.isPublishedWeb !== false;
                        return (
                          <tr key={p.id} className="hover:bg-mvp-card/40 transition-colors">
                            <td className="p-3.5">
                              <div className="flex items-center gap-3">
                                <img
                                  src={p.images?.[0] || '/img/drop-1.jpg'}
                                  alt={p.name}
                                  className="w-10 h-10 rounded-lg object-cover bg-mvp-black border border-white/10 flex-shrink-0"
                                />
                                <div>
                                  <p className="font-bold text-white line-clamp-1">{p.name}</p>
                                  <span className="text-[10px] text-mvp-muted uppercase font-mono">{p.category}</span>
                                </div>
                              </div>
                            </td>

                            <td className="p-3.5">
                              {p.isOdooProduct ? (
                                <span className="bg-blue-600/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded text-[10px] font-bold">
                                  📦 Odoo ({p.sku || p.id})
                                </span>
                              ) : (
                                <span className="bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded text-[10px] font-bold">
                                  ⚡ Local
                                </span>
                              )}
                            </td>

                            <td className="p-3.5 font-bold font-mono text-white">
                              RD$ {Number(p.price).toLocaleString('es-DO')}
                            </td>

                            <td className="p-3.5">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                p.stockLeft > 0 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/10 text-red-400'
                              }`}>
                                {p.stockLeft} unid.
                              </span>
                            </td>

                            {/* 1-Click Web Toggle Switch */}
                            <td className="p-3.5 text-center">
                              <button
                                onClick={() => handleToggleWeb(p.id, isWeb)}
                                className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all flex items-center gap-1.5 mx-auto ${
                                  isWeb
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30'
                                    : 'bg-zinc-800 text-amber-400 border border-amber-500/30 hover:bg-zinc-700'
                                }`}
                              >
                                {isWeb ? <Globe size={13} /> : <Lock size={13} />}
                                <span>{isWeb ? 'Público en Web' : 'Solo Local'}</span>
                              </button>
                            </td>

                            <td className="p-3.5 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => {
                                    setIsAdminOpen(false);
                                    openQuoterWithProduct(p);
                                  }}
                                  className="p-1.5 bg-mvp-card hover:bg-mvp-red hover:text-white rounded-lg text-mvp-silver text-[11px] flex items-center gap-1 px-2"
                                  title="Cotizar en Whaticket"
                                >
                                  <Zap size={13} />
                                  <span className="hidden sm:inline">Cotizar</span>
                                </button>

                                <button
                                  onClick={() => handleOpenEditProduct(p)}
                                  className="p-1.5 bg-mvp-card hover:bg-mvp-cardHover rounded-lg text-mvp-silver hover:text-white"
                                  title="Editar"
                                >
                                  <Edit3 size={14} />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(p.id)}
                                  className="p-1.5 bg-mvp-card hover:bg-red-500/20 rounded-lg text-mvp-silver hover:text-red-400"
                                  title="Eliminar"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ODOO ERP SYNCHRONIZATION */}
          {activeTab === 'odoo' && (
            <div className="space-y-6 max-w-3xl mx-auto">
              <div className="bg-gradient-to-r from-blue-900/30 via-mvp-card to-mvp-dark border border-blue-500/40 rounded-2xl p-5 space-y-2">
                <div className="flex items-center gap-2.5">
                  <Database size={22} className="text-blue-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Conexión con Odoo ERP (Inventario & Catálogo en Tiempo Real)
                  </h3>
                </div>
                <p className="text-xs text-mvp-silver/80 leading-relaxed">
                  Conecta la boutique directamente al servidor Odoo del cliente (soporte JSON-RPC para Odoo 12, 14, 15, 16, 17 y 18). Halará automáticamente productos, fotos, precios y stock disponible (<code className="text-blue-300">qty_available</code>).
                </p>
              </div>

              <form onSubmit={handleSaveOdooConfig} className="bg-mvp-black/60 p-5 rounded-2xl border border-mvp-cardHover space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-mvp-silver uppercase tracking-wider mb-1">
                      URL del Servidor Odoo (con https:// o http://):
                    </label>
                    <input
                      type="url"
                      required
                      placeholder="https://odoo.tuempresa.com o http://45.9.191.18:8069"
                      value={odooConfig.url}
                      onChange={(e) => setOdooConfig({ ...odooConfig, url: e.target.value })}
                      className="w-full bg-mvp-dark border border-mvp-cardHover focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-mvp-muted focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-mvp-silver uppercase tracking-wider mb-1">
                      Nombre de la Base de Datos (DB):
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="plastir_odoo_prod"
                      value={odooConfig.db}
                      onChange={(e) => setOdooConfig({ ...odooConfig, db: e.target.value })}
                      className="w-full bg-mvp-dark border border-mvp-cardHover focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-mvp-muted focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-mvp-silver uppercase tracking-wider mb-1">
                      Usuario / Email de Acceso Odoo:
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="admin@plastirrd.com"
                      value={odooConfig.username}
                      onChange={(e) => setOdooConfig({ ...odooConfig, username: e.target.value })}
                      className="w-full bg-mvp-dark border border-mvp-cardHover focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-mvp-muted focus:outline-none font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-mvp-silver uppercase tracking-wider mb-1">
                      API Key de Odoo o Contraseña:
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="API Key generada en Odoo o contraseña de usuario"
                      value={odooConfig.apiKey}
                      onChange={(e) => setOdooConfig({ ...odooConfig, apiKey: e.target.value })}
                      className="w-full bg-mvp-dark border border-mvp-cardHover focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-mvp-muted focus:outline-none font-mono"
                    />
                  </div>
                </div>

                {/* Test Result Card */}
                {odooTestResult && (
                  <div className={`p-4 rounded-xl text-xs border ${
                    odooTestResult.success
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-red-500/10 border-red-500/30 text-red-400'
                  }`}>
                    <p className="font-bold">{odooTestResult.message}</p>
                    {odooTestResult.uid && (
                      <p className="text-[11px] text-mvp-silver mt-1">
                        UID: {odooTestResult.uid} | Versión: {odooTestResult.serverVersion || 'Odoo Standard'}
                      </p>
                    )}
                  </div>
                )}

                {/* Sync Result Card */}
                {odooSyncResult && (
                  <div className={`p-4 rounded-xl text-xs border ${
                    odooSyncResult.success
                      ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                      : 'bg-red-500/10 border-red-500/30 text-red-400'
                  }`}>
                    <p className="font-bold">
                      {odooSyncResult.success ? `¡Sincronización completada! Se importaron ${odooSyncResult.totalSynced || odooSyncResult.products?.length || 0} productos desde Odoo.` : odooSyncResult.message}
                    </p>
                    {odooSyncResult.lastSyncedAt && (
                      <p className="text-[11px] text-mvp-silver mt-1">
                        Última sincronización: {new Date(odooSyncResult.lastSyncedAt).toLocaleString('es-DO')}
                      </p>
                    )}
                  </div>
                )}

                {/* Buttons Row */}
                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-colors"
                  >
                    Guardar Configuración Odoo
                  </button>

                  <button
                    type="button"
                    onClick={handleTestOdoo}
                    disabled={isTestingOdoo}
                    className="w-full sm:w-auto px-5 py-2.5 bg-mvp-card hover:bg-mvp-cardHover text-white text-xs font-bold rounded-xl border border-mvp-cardHover flex items-center justify-center gap-2"
                  >
                    <RefreshCw size={13} className={isTestingOdoo ? 'animate-spin' : ''} />
                    <span>{isTestingOdoo ? 'Probando...' : '🧪 Probar Conexión Odoo'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSyncOdoo}
                    disabled={isSyncingOdoo}
                    className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-glow-sm flex items-center justify-center gap-2"
                  >
                    <RefreshCw size={14} className={isSyncingOdoo ? 'animate-spin' : ''} />
                    <span>{isSyncingOdoo ? 'Sincronizando...' : '📥 Sincronizar Productos Ahora'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: WHATICKET API v1.0.0 */}
          {activeTab === 'whaticket' && (
            <div className="space-y-6 max-w-3xl mx-auto">
              <div className="bg-gradient-to-r from-emerald-900/30 via-mvp-card to-mvp-dark border border-emerald-500/40 rounded-2xl p-5 space-y-2">
                <div className="flex items-center gap-2.5">
                  <MessageSquare size={22} className="text-emerald-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Conexión Whaticket API v1.0.0
                  </h3>
                </div>
                <p className="text-xs text-mvp-silver/80 leading-relaxed">
                  Conecta el sistema directamente con tu instancia de Whaticket para consultar conversaciones activas y enviar cotizaciones y órdenes en 1 clic.
                </p>
              </div>

              <form onSubmit={handleSaveWhaticketConfig} className="bg-mvp-black/60 p-5 rounded-2xl border border-mvp-cardHover space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-mvp-silver uppercase tracking-wider mb-1">
                      URL de la API de Whaticket:
                    </label>
                    <input
                      type="url"
                      required
                      placeholder="https://app.whaticket.com/api o https://tu-instancia.com/api"
                      value={whaticketConfig.apiUrl}
                      onChange={(e) => setWhaticketConfig({ ...whaticketConfig, apiUrl: e.target.value })}
                      className="w-full bg-mvp-dark border border-mvp-cardHover focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-mvp-muted focus:outline-none font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-mvp-silver uppercase tracking-wider mb-1">
                      Bearer Token de Autenticación (API Token):
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Token generado en la pestaña API de Whaticket"
                      value={whaticketConfig.token}
                      onChange={(e) => setWhaticketConfig({ ...whaticketConfig, token: e.target.value })}
                      className="w-full bg-mvp-dark border border-mvp-cardHover focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-mvp-muted focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-mvp-silver uppercase tracking-wider mb-1">
                      ID de Conexión de WhatsApp (connectionId):
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="1"
                      value={whaticketConfig.connectionId}
                      onChange={(e) => setWhaticketConfig({ ...whaticketConfig, connectionId: e.target.value })}
                      className="w-full bg-mvp-dark border border-mvp-cardHover focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-mvp-muted focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-mvp-silver uppercase tracking-wider mb-1">
                      ID de Cola (queueId) - Opcional:
                    </label>
                    <input
                      type="text"
                      placeholder="1"
                      value={whaticketConfig.queueId || ''}
                      onChange={(e) => setWhaticketConfig({ ...whaticketConfig, queueId: e.target.value })}
                      className="w-full bg-mvp-dark border border-mvp-cardHover focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-mvp-muted focus:outline-none font-mono"
                    />
                  </div>
                </div>

                {whaticketTestResult && (
                  <div className={`p-4 rounded-xl text-xs border ${
                    whaticketTestResult.success
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-red-500/10 border-red-500/30 text-red-400'
                  }`}>
                    {whaticketTestResult.message}
                  </div>
                )}

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-colors"
                  >
                    Guardar Ajustes Whaticket
                  </button>

                  <button
                    type="button"
                    onClick={handleTestWhaticket}
                    disabled={isTestingWhaticket}
                    className="px-5 py-2.5 bg-mvp-card hover:bg-mvp-cardHover text-white text-xs font-bold rounded-xl border border-mvp-cardHover flex items-center gap-2"
                  >
                    <RefreshCw size={13} className={isTestingWhaticket ? 'animate-spin' : ''} />
                    <span>{isTestingWhaticket ? 'Probando...' : '🧪 Probar Conexión Whaticket'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 4: ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Registro de Autopedidos COD ({orders.length})
                </h3>
              </div>

              {orders.length === 0 ? (
                <div className="text-center py-12 text-mvp-muted text-xs">
                  No hay pedidos registrados todavía.
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((o) => (
                    <div key={o.trackingId} className="bg-mvp-black p-4 rounded-2xl border border-mvp-cardHover space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-2">
                        <div>
                          <span className="font-mono font-bold text-mvp-red text-sm">#{o.trackingId}</span>
                          <span className="text-[11px] text-mvp-muted ml-2">
                            {new Date(o.date || Date.now()).toLocaleString('es-DO')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">Estado:</span>
                          <select
                            value={o.status}
                            onChange={(e) => handleUpdateOrderStatus(o.trackingId, e.target.value)}
                            className="bg-mvp-dark border border-mvp-cardHover rounded-lg px-2 py-1 text-xs text-white focus:outline-none"
                          >
                            <option value="received">Recibido</option>
                            <option value="preparing">Empacando</option>
                            <option value="shipped">En Ruta</option>
                            <option value="delivered">Entregado</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                        <div>
                          <p className="text-[10px] text-mvp-muted uppercase font-bold">Cliente:</p>
                          <p className="font-bold text-white">{o.customer?.name}</p>
                          <p className="text-mvp-silver font-mono">{o.customer?.phone}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-mvp-muted uppercase font-bold">Destino:</p>
                          <p className="text-mvp-silver">{o.shipping?.municipality || 'Santo Domingo'}</p>
                          <p className="text-[11px] text-mvp-muted truncate">{o.shipping?.address}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-mvp-muted uppercase font-bold">Total a Cobrar:</p>
                          <p className="font-display font-black text-sm text-mvp-red">
                            RD$ {Number(o.payment?.total || 0).toLocaleString('es-DO')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: METRICS */}
          {activeTab === 'metrics' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-mvp-black p-4 rounded-2xl border border-mvp-cardHover">
                  <span className="text-[10px] text-mvp-muted uppercase font-bold">Ventas Totales COD</span>
                  <p className="text-xl font-display font-black text-white mt-1">
                    RD$ {totalRevenue.toLocaleString('es-DO')}
                  </p>
                </div>
                <div className="bg-mvp-black p-4 rounded-2xl border border-mvp-cardHover">
                  <span className="text-[10px] text-mvp-muted uppercase font-bold">Entregados Exitosos</span>
                  <p className="text-xl font-display font-black text-emerald-400 mt-1">
                    RD$ {deliveredRevenue.toLocaleString('es-DO')}
                  </p>
                </div>
                <div className="bg-mvp-black p-4 rounded-2xl border border-mvp-cardHover">
                  <span className="text-[10px] text-mvp-muted uppercase font-bold">Total Pedidos</span>
                  <p className="text-xl font-display font-black text-amber-400 mt-1">
                    {orders.length} pedidos
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal for Product Create / Edit */}
        {isEditingProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <div className="relative w-full max-w-lg bg-mvp-card border border-mvp-cardHover rounded-3xl p-5 shadow-2xl space-y-4 my-auto">
              <div className="flex items-center justify-between border-b border-mvp-cardHover pb-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  {editingId ? 'Editar Producto' : 'Crear Nuevo Producto'}
                </h3>
                <button onClick={() => setIsEditingProduct(false)} className="text-mvp-muted hover:text-white">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
                <div>
                  <label className="block text-mvp-muted font-bold mb-1">Nombre del Modelo:</label>
                  <input
                    type="text"
                    required
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    className="w-full bg-mvp-dark border border-mvp-cardHover rounded-xl px-3 py-2 text-white focus:outline-none focus:border-mvp-red"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-mvp-muted font-bold mb-1">Categoría:</label>
                    <select
                      value={productForm.category}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                      className="w-full bg-mvp-dark border border-mvp-cardHover rounded-xl px-3 py-2 text-white focus:outline-none"
                    >
                      <option value="cajas">Cajas & Gaveteros</option>
                      <option value="cocina">Cocina & Herméticos</option>
                      <option value="limpieza">Limpieza & Cubos</option>
                      <option value="combos">Combos del Hogar</option>
                      <option value="muebles">Muebles & Organización</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-mvp-muted font-bold mb-1">Mostrar en WEB:</label>
                    <select
                      value={productForm.isPublishedWeb ? 'true' : 'false'}
                      onChange={(e) => setProductForm({ ...productForm, isPublishedWeb: e.target.value === 'true' })}
                      className="w-full bg-mvp-dark border border-mvp-cardHover rounded-xl px-3 py-2 text-white focus:outline-none"
                    >
                      <option value="true">Sí, Público en Web</option>
                      <option value="false">No, Solo Catálogo Local</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-mvp-muted font-bold mb-1">Precio Oferta (RD$):</label>
                    <input
                      type="number"
                      required
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                      className="w-full bg-mvp-dark border border-mvp-cardHover rounded-xl px-3 py-2 text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-mvp-muted font-bold mb-1">Stock Disponible:</label>
                    <input
                      type="number"
                      value={productForm.stockLeft}
                      onChange={(e) => setProductForm({ ...productForm, stockLeft: e.target.value })}
                      className="w-full bg-mvp-dark border border-mvp-cardHover rounded-xl px-3 py-2 text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-mvp-muted font-bold mb-1">Tallas (separadas por coma):</label>
                  <input
                    type="text"
                    value={productForm.sizes}
                    onChange={(e) => setProductForm({ ...productForm, sizes: e.target.value })}
                    placeholder="39, 40, 41, 42, 43, 44"
                    className="w-full bg-mvp-dark border border-mvp-cardHover rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-mvp-muted font-bold mb-1">URL de Foto / Imagen:</label>
                  <input
                    type="text"
                    value={productForm.images}
                    onChange={(e) => setProductForm({ ...productForm, images: e.target.value })}
                    placeholder="/img/drop-1.jpg"
                    className="w-full bg-mvp-dark border border-mvp-cardHover rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-mvp-cardHover">
                  <button
                    type="button"
                    onClick={() => setIsEditingProduct(false)}
                    className="px-4 py-2 bg-mvp-dark text-mvp-silver hover:text-white rounded-xl"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-mvp-red hover:bg-mvp-darkRed text-white font-bold rounded-xl shadow-glow-sm"
                  >
                    Guardar Producto
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
