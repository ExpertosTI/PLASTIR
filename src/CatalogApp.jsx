import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Package,
  Search,
  Copy,
  Check,
  Calculator,
  MessageSquare,
  Send,
  Zap,
  Phone,
  User,
  MapPin,
  DollarSign,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  Clock,
  Truck,
  Plus,
  Trash2,
  CheckCircle2,
  ShoppingBag,
  Flame,
  ArrowRight,
  Navigation,
  Compass,
  AlertCircle,
  Image as ImageIcon,
  Upload,
  Download,
  Share2,
  ShieldCheck,
  Globe,
  Lock,
  Tag,
  Database,
  Smartphone,
  Maximize2,
  Sliders,
  Settings,
  ArrowLeft,
  X,
  Store,
  FileText,
  Camera,
  BarChart3,
  Users,
  Link
} from 'lucide-react';
import { MetricsDashboard } from './components/MetricsDashboard';
import { ContactSyncModal } from './components/ContactSyncModal';
import {
  trackPageView,
  trackProductClick,
  trackWhatsAppClick,
  trackDistanceCalc,
  trackPhotoCopy,
  trackPhotoUpload,
  trackQuickReplyCopy,
  trackUploadLinkCreated
} from './utils/tracker';
import { useCart } from './context/CartContext';
import { DOMINICAN_ZONES } from './data/locationsRD';
import { PRODUCTS as STATIC_PRODUCTS } from './data/products';
import {
  MVP_STORE_LOCATION,
  NEIGHBORHOOD_PRESETS,
  calculateShippingQuote,
  extractCoordinates,
} from './utils/distanceCalculator';

const STAFF_PASSCODE = 'PlastirAdmin2026!';
const AUTH_STORAGE_KEY = 'plastir_staff_auth_v1';
const AGENT_STORAGE_KEY = 'plastir_agent_name';

const AGENTS = [
  { id: 'asesor-1', name: 'Atención al Cliente', role: 'Asesor Principal WhatsApp' },
  { id: 'ventas', name: 'Ventas y Cotizaciones', role: 'Especialista en Artículos para el Hogar' },
  { id: 'almacen', name: 'Almacén Central', role: 'Despacho y Logística' },
  { id: 'central', name: 'Plastir RD Central', role: 'Soporte General' },
];

const SECTORS = [
  { name: 'Santo Domingo Este (Los Mina, San Vicente, Invivienda)', cost: 200, time: '2 a 4 hrs' },
  { name: 'Distrito Nacional (Naco, Piantini, Bella Vista, Gazcue)', cost: 250, time: '2 a 4 hrs' },
  { name: 'Santo Domingo Norte / Oeste (Villa Mella, Herrera, Alcarrizos)', cost: 300, time: 'Mismo día' },
  { name: 'Santiago de los Caballeros', cost: 350, time: '24 hrs Express' },
  { name: 'San Cristóbal / Baní', cost: 300, time: '24 hrs' },
  { name: 'Zona Este (La Romana, San Pedro, Punta Cana)', cost: 350, time: '24 hrs' },
  { name: 'Resto del País (Caribe Tour / Metro Pac / Aptra)', cost: 350, time: '24 hrs' },
  { name: 'Personalizado / Envíos Gratis', cost: 0, time: 'Acordado' },
];

export const CatalogApp = () => {
  const { formatMoney } = useCart();

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return localStorage.getItem(AUTH_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState(false);

  // Active Tab State: 'catalog' | 'quoter' | 'replies' | 'album' | 'shipping' | 'sync'
  const [activeTab, setActiveTab] = useState('catalog');

  // Agent State (Synced directly with Whaticket Users API)
  const [agentName, setAgentName] = useState(() => {
    return localStorage.getItem(AGENT_STORAGE_KEY) || 'Ashley';
  });
  const [whaticketStaff, setWhaticketStaff] = useState(AGENTS);
  const [isLoadingStaff, setIsLoadingStaff] = useState(false);

  // Products Data
  const [products, setProducts] = useState(STATIC_PRODUCTS);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [isSyncingOdoo, setIsSyncingOdoo] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState(null);

  // Search & Filters in Catalog Tab
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filterSource, setFilterSource] = useState('all'); // 'all', 'odoo', 'web', 'local_only'
  const [copiedId, setCopiedId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  // Quick Notification Toast
  const [toastMessage, setToastMessage] = useState(null);

  // Install PWA Prompt State
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [showExtensionModal, setShowExtensionModal] = useState(false);
  const [showContactSyncModal, setShowContactSyncModal] = useState(false);

  // ==========================================
  // ADVANCED COTIZADOR STATE
  // ==========================================
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');

  // Whaticket Open Conversations
  const [whaticketTickets, setWhaticketTickets] = useState([]);
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);

  // Live product search inside Cotizador
  const [quoterSearchQuery, setQuoterSearchQuery] = useState('');
  const [activeQuoterProduct, setActiveQuoterProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('40 (8)');
  const [selectedColor, setSelectedColor] = useState('Original');
  const [itemQuantity, setItemQuantity] = useState(1);
  const [customItemPrice, setCustomItemPrice] = useState('');

  // Multi-item Quote List
  const [quoteItems, setQuoteItems] = useState([]);

  // Distance & Shipping
  const [mapsLocationInput, setMapsLocationInput] = useState('');
  const [pricePerKm, setPricePerKm] = useState(35);
  const [minBaseFee, setMinBaseFee] = useState(200);
  const [distanceCalcResult, setDistanceCalcResult] = useState(null);
  const [calcError, setCalcError] = useState(null);
  const [showDistanceSection, setShowDistanceSection] = useState(false);

  const [selectedSector, setSelectedSector] = useState(SECTORS[0].name);
  const [deliveryCost, setDeliveryCost] = useState(SECTORS[0].cost);
  const [extraDiscount, setExtraDiscount] = useState(0);
  const [quoteNotes, setQuoteNotes] = useState('');

  // Action states
  const [isSendingQuote, setIsSendingQuote] = useState(false);
  const [quoteSuccessMsg, setQuoteSuccessMsg] = useState(null);
  const [isConvertingOrder, setIsConvertingOrder] = useState(false);
  const [createdOrderTicket, setCreatedOrderTicket] = useState(null);

  // ==========================================
  // ÁLBUM DE FOTOS / MULTIMEDIA
  // ==========================================
  const [albumItems, setAlbumItems] = useState([]);
  const [isLoadingAlbum, setIsLoadingAlbum] = useState(false);
  const [albumSearchQuery, setAlbumSearchQuery] = useState('');
  const [albumSelectedCategory, setAlbumSelectedCategory] = useState('all');
  const [copiedAlbumId, setCopiedAlbumId] = useState(null);
  const [albumToast, setAlbumToast] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newPhotoTitle, setNewPhotoTitle] = useState('');
  const [newPhotoCategory, setNewPhotoCategory] = useState('sneakers');
  const [newPhotoTags, setNewPhotoTags] = useState('');
  const [newPhotoPreview, setNewPhotoPreview] = useState('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // One-Time Upload Link State
  const [showShareUploadModal, setShowShareUploadModal] = useState(false);
  const [uploadLinkProductId, setUploadLinkProductId] = useState('');
  const [uploadLinkNote, setUploadLinkNote] = useState('');
  const [uploadLinkExpiry, setUploadLinkExpiry] = useState('24');
  const [generatedLinkData, setGeneratedLinkData] = useState(null);
  const [isCreatingLink, setIsCreatingLink] = useState(false);
  const [uploadLinksList, setUploadLinksList] = useState([]);
  const [isLoadingUploadLinks, setIsLoadingUploadLinks] = useState(false);
  const [linkModalTab, setLinkModalTab] = useState('create'); // 'create' | 'list'

  // Show Toast Helper
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Change Agent Handler
  const handleAgentChange = (name) => {
    setAgentName(name);
    try {
      localStorage.setItem(AGENT_STORAGE_KEY, name);
    } catch {}
    showToast(`Asesor activo cambiado a: ${name}`);
  };

  // PWA Install prompt listener
  useEffect(() => {
    trackPageView('/catalogo', 'Catálogo Pro Staff RENACE');
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowInstallBanner(false);
        setDeferredPrompt(null);
      }
    } else {
      alert('Para instalar en iPhone: presiona "Compartir" en Safari y selecciona "Añadir a pantalla de inicio". En Android: menú de 3 puntos -> "Instalar aplicación".');
    }
  };

  // Load products from API
  const loadProducts = useCallback(async () => {
    setLoadingProducts(true);
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data);
          if (!activeQuoterProduct) {
            setActiveQuoterProduct(data[0]);
          }
        }
      }
    } catch {
      // Keep static fallback
    } finally {
      setLoadingProducts(false);
    }
  }, [activeQuoterProduct]);

  // Load registered staff/attendants directly from Whaticket API
  const loadWhaticketStaff = useCallback(async () => {
    setIsLoadingStaff(true);
    try {
      const res = await fetch('/api/whaticket/users');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.users) && data.users.length > 0) {
          setWhaticketStaff(data.users);
          const currentExists = data.users.some((u) => u.name?.toLowerCase() === agentName.toLowerCase());
          if (!currentExists && data.users[0]?.name) {
            setAgentName(data.users[0].name);
            localStorage.setItem(AGENT_STORAGE_KEY, data.users[0].name);
          }
        }
      }
    } catch (err) {
      console.error('Error loading Whaticket staff:', err);
    } finally {
      setIsLoadingStaff(false);
    }
  }, [agentName]);

  useEffect(() => {
    loadProducts();
    loadWhaticketStaff();
  }, [loadProducts, loadWhaticketStaff]);

  // Helper for auth headers
  const getAuthHeaders = () => {
    const token = sessionStorage.getItem('plastir_admin_token') || localStorage.getItem('plastir_admin_token') || sessionStorage.getItem('mvpflow_admin_token') || '';
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  };

  // Ensure active admin token in storage when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;
    const existing = sessionStorage.getItem('plastir_admin_token') || localStorage.getItem('plastir_admin_token');
    if (!existing) {
      fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: STAFF_PASSCODE }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.success && data.token) {
            sessionStorage.setItem('plastir_admin_token', data.token);
            localStorage.setItem('plastir_admin_token', data.token);
          }
        })
        .catch(() => {});
    }
  }, [isAuthenticated]);

  // Load Whaticket open tickets when entering Cotizador
  useEffect(() => {
    if (isAuthenticated && activeTab === 'quoter') {
      loadWhaticketTickets();
    }
  }, [isAuthenticated, activeTab]);

  const loadWhaticketTickets = async () => {
    setIsLoadingTickets(true);
    try {
      const res = await fetch('/api/whaticket/tickets?status=open', { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.tickets)) {
          setWhaticketTickets(data.tickets);
        } else if (Array.isArray(data)) {
          setWhaticketTickets(data);
        }
      }
    } catch (err) {
      console.error('Error loading whaticket tickets:', err);
    } finally {
      setIsLoadingTickets(false);
    }
  };

  // Load Upload Links
  const loadUploadLinks = async () => {
    setIsLoadingUploadLinks(true);
    try {
      const res = await fetch('/api/upload-links', { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        setUploadLinksList(data.links || []);
      }
    } catch (err) {
      console.error('Error loading upload links:', err);
    } finally {
      setIsLoadingUploadLinks(false);
    }
  };

  // Generate One-Time Upload Link
  const handleGenerateUploadLink = async (e) => {
    e?.preventDefault?.();
    setIsCreatingLink(true);
    try {
      const selectedProd = products.find((p) => p.id === uploadLinkProductId);
      const payload = {
        productId: uploadLinkProductId || null,
        productName: selectedProd ? selectedProd.name : 'Drop General / Calzado',
        note: uploadLinkNote.trim(),
        expiresInHours: Number(uploadLinkExpiry) || 24,
        createdBy: agentName,
      };

      const res = await fetch('/api/upload-links', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const fullUrl = `${window.location.origin}${data.uploadUrl}`;
        setGeneratedLinkData({
          ...data.link,
          fullUrl,
        });
        trackUploadLinkCreated(selectedProd ? selectedProd.name : 'Drop General / Calzado', agentName);
        showToast('¡Enlace de uso único generado con éxito!');
        loadUploadLinks();
      } else {
        alert(data.message || 'Error al generar enlace.');
      }
    } catch (err) {
      alert('Error de conexión al crear el enlace.');
    } finally {
      setIsCreatingLink(false);
    }
  };

  // Revoke/Delete Link
  const handleRevokeUploadLink = async (tok) => {
    if (!confirm('¿Estás seguro de revocar y eliminar este enlace? Ya no podrá usarse.')) return;
    try {
      const res = await fetch(`/api/upload-links/${tok}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        showToast('Enlace revocado.');
        loadUploadLinks();
        if (generatedLinkData?.token === tok) {
          setGeneratedLinkData(null);
        }
      }
    } catch (err) {
      alert('Error al revocar enlace.');
    }
  };

  // Load Album
  const loadAlbumItems = async () => {
    setIsLoadingAlbum(true);
    try {
      const res = await fetch('/api/album');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.items)) {
          setAlbumItems(data.items);
        }
      }
    } catch {
    } finally {
      setIsLoadingAlbum(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && activeTab === 'album') {
      loadAlbumItems();
    }
  }, [isAuthenticated, activeTab]);

  // Copy image directly to clipboard (paste in WhatsApp)
  const handleCopyImageToClipboard = async (item) => {
    trackPhotoCopy(item, agentName);
    setCopiedAlbumId(item.id);
    setAlbumToast(`📸 Copiando "${item.title || 'Foto'}" al portapapeles...`);
    const targetUrl = item.imageUrl.startsWith('http')
      ? `/api/image-proxy?url=${encodeURIComponent(item.imageUrl)}`
      : item.imageUrl;
    try {
      const response = await fetch(targetUrl);
      if (!response.ok) throw new Error('Fetch failed');
      const imageBlob = await response.blob();
      const imgBitmap = await createImageBitmap(imageBlob);
      const canvas = document.createElement('canvas');
      canvas.width = imgBitmap.width;
      canvas.height = imgBitmap.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(imgBitmap, 0, 0);
      canvas.toBlob(async (pngBlob) => {
        if (pngBlob && navigator.clipboard && window.ClipboardItem) {
          try {
            await navigator.clipboard.write([new ClipboardItem({ 'image/png': pngBlob })]);
            setAlbumToast(`✔ ¡Foto de "${item.title || 'Producto'}" copiada! Pégala en WhatsApp con Ctrl+V.`);
            setTimeout(() => { setCopiedAlbumId(null); setAlbumToast(null); }, 4000);
            return;
          } catch {}
        }
        await navigator.clipboard.writeText(item.imageUrl);
        setAlbumToast(`✔ ¡Enlace de "${item.title}" copiado al portapapeles!`);
        setTimeout(() => { setCopiedAlbumId(null); setAlbumToast(null); }, 3000);
      }, 'image/png');
    } catch {
      try {
        await navigator.clipboard.writeText(item.imageUrl);
        setAlbumToast(`✔ ¡Enlace de "${item.title}" copiado!`);
      } catch {}
      setTimeout(() => { setCopiedAlbumId(null); setAlbumToast(null); }, 3000);
    }
  };

  const handleDownloadPhoto = (item) => {
    const a = document.createElement('a');
    a.href = item.imageUrl;
    a.download = `${(item.title || 'foto-plastir').replace(/[^a-zA-Z0-9_-]/g, '_')}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setAlbumToast(`✔ Descargando "${item.title || 'Foto'}" en HD...`);
    setTimeout(() => setAlbumToast(null), 2500);
  };

  const handleUploadPhoto = async (e) => {
    e.preventDefault();
    if (!newPhotoPreview) return;
    setIsUploadingPhoto(true);
    try {
      const res = await fetch('/api/album/upload', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          title: newPhotoTitle.trim() || 'Foto de Producto',
          category: newPhotoCategory,
          tags: newPhotoTags,
          imageUrl: newPhotoPreview,
        }),
      });
      const data = await res.json();
      if (data.success && data.item) {
        trackPhotoUpload(1, agentName);
        setAlbumItems((prev) => [data.item, ...prev]);
        setShowUploadModal(false);
        setNewPhotoTitle('');
        setNewPhotoTags('');
        setNewPhotoPreview('');
        setAlbumToast('✔ ¡Foto subida exitosamente al Álbum!');
        setTimeout(() => setAlbumToast(null), 3000);
      }
    } catch (err) {
      alert('Error al subir foto: ' + err.message);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleDeleteAlbumItem = async (id) => {
    if (!confirm('¿Deseas eliminar esta foto del álbum?')) return;
    try {
      await fetch(`/api/album/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      setAlbumItems((prev) => prev.filter((it) => it.id !== id));
      setAlbumToast('✔ Foto eliminada del álbum');
      setTimeout(() => setAlbumToast(null), 2500);
    } catch {}
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setNewPhotoPreview(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  // Sincronizar Inventario Central
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
        setSyncFeedback(`✅ ¡${data.totalSynced || 0} productos sincronizados con stock real en mano!`);
        await loadProducts();
      } else {
        setSyncFeedback(`⚠️ ${data.message || 'Error al conectar con inventario central.'}`);
      }
    } catch (err) {
      setSyncFeedback(`❌ Error de conexión: ${err.message}`);
    } finally {
      setIsSyncingOdoo(false);
      setTimeout(() => setSyncFeedback(null), 6000);
    }
  };

  // Distance Calculator Handlers
  const handleCalculateDistance = (inputString = mapsLocationInput) => {
    setCalcError(null);
    const input = (inputString || '').trim();
    if (!input) {
      setCalcError('Pega un enlace de Google Maps, ubicación de WhatsApp o coordenadas.');
      return;
    }

    const result = calculateShippingQuote({
      destinationInput: input,
      minBaseFee: Number(minBaseFee) || 200,
    });

    if (result.success) {
      setDistanceCalcResult(result);
      trackDistanceCalc(result.distanceKm, result.suggestedFee, input);
    } else {
      setCalcError(result.error);
    }
  };

  const handleApplyCalculatedShipping = () => {
    if (!distanceCalcResult) return;
    setDeliveryCost(distanceCalcResult.suggestedFee);
    setSelectedSector(`Envío por Distancia (${distanceCalcResult.distanceKm} km)`);
    if (distanceCalcResult.destinationCoords) {
      setCustomerAddress(
        `GPS: ${distanceCalcResult.destinationCoords.lat.toFixed(5)}, ${distanceCalcResult.destinationCoords.lng.toFixed(5)} (${distanceCalcResult.distanceKm} km desde Los Mina)`
      );
    }
    setQuoteSuccessMsg(`✔ Tarifa de envío calculada aplicada: RD$ ${distanceCalcResult.suggestedFee} (${distanceCalcResult.distanceKm} km)`);
    showToast(`Tarifa aplicada: RD$ ${distanceCalcResult.suggestedFee}`);
  };

  const handleSelectPresetNeighborhood = (preset) => {
    const coordString = `${preset.lat}, ${preset.lng}`;
    setMapsLocationInput(coordString);
    handleCalculateDistance(coordString);
  };

  // Auto-detect ?lat=...&lng=... or ?loc=... from URL (Chrome Extension integration)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const lat = params.get('lat');
      const lng = params.get('lng');
      const loc = params.get('loc') || params.get('mapsUrl') || params.get('q');
      const tab = params.get('tab');
      if (tab) setActiveTab(tab);
      if (lat && lng) {
        const coordStr = `${lat}, ${lng}`;
        setMapsLocationInput(coordStr);
        handleCalculateDistance(coordStr);
        setActiveTab('quoter');
      } else if (loc) {
        setMapsLocationInput(loc);
        handleCalculateDistance(loc);
        setActiveTab('quoter');
      }
    } catch {}
  }, []);

  // 1-Click Web Visibility Toggle
  const handleToggleWeb = async (productId, currentVal) => {
    const newVal = !currentVal;
    setTogglingId(productId);
    // Optimistic UI
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, isPublishedWeb: newVal } : p))
    );

    try {
      const res = await fetch(`/api/products/${productId}/toggle-web`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ isPublishedWeb: newVal }),
      });
      if (res.ok) {
        showToast(newVal ? '🟢 Producto activado en la Tienda Web' : '🔒 Reservado solo para Redes / Local');
      }
    } catch (err) {
      console.error('Error toggling web visibility:', err);
    } finally {
      setTogglingId(null);
    }
  };

  // Password submission via secure backend authentication
  const handleLogin = async (e) => {
    e.preventDefault();
    const pass = passwordInput.trim();
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
        setAuthError(false);
        sessionStorage.setItem('plastir_admin_auth', 'true');
        sessionStorage.setItem('plastir_admin_token', data.token);
        localStorage.setItem('plastir_admin_token', data.token);
        try {
          localStorage.setItem(AUTH_STORAGE_KEY, 'true');
        } catch {}
        showToast('¡Sesión iniciada en Plastir Catálogo Pro!');
        return;
      }
      setAuthError(true);
    } catch {
      setAuthError(true);
    }
  };

  // Logout handler
  const handleLogout = () => {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      sessionStorage.removeItem('plastir_admin_auth');
      sessionStorage.removeItem('plastir_admin_token');
      localStorage.removeItem('plastir_admin_token');
      sessionStorage.removeItem('mvpflow_admin_auth');
      sessionStorage.removeItem('mvpflow_admin_token');
      localStorage.removeItem('mvpflow_admin_token');
    } catch {}
    setIsAuthenticated(false);
    showToast('Sesión cerrada');
  };

  // Copy Product Pitch to Clipboard
  const handleCopyPitch = (product) => {
    const sizes = Array.isArray(product.sizes) ? product.sizes.join(' - ') : 'Estándar';
    const link = `https://plastirrd.com/?p=${product.id}`;
    const text = `📦 *${(product.name || '').toUpperCase()}*\n\n` +
      `💵 *Precio:* RD$ ${product.price?.toLocaleString()} _(Antes RD$ ${product.originalPrice?.toLocaleString() || (product.price + 500)})_\n` +
      `📏 *Medidas / Opciones:* ${sizes}\n` +
      `🛡️ *Calidad:* Plástico Virgen de Alta Resistencia para el Hogar\n` +
      `🛵 *Entrega Express:* Santo Domingo y Envíos a todo el país con Pago al Recibir (COD)\n\n` +
      `📲 *Ordénalo aquí directamente:* ${link}`;

    navigator.clipboard.writeText(text);
    setCopiedId(product.id);
    showToast(`✅ Ficha de "${product.name}" copiada al portapapeles`);
    setTimeout(() => setCopiedId(null), 3000);
  };

  // Send product to Quoter
  const handleSendToQuoter = (product) => {
    setActiveQuoterProduct(product);
    setSelectedSize(product.sizes?.[0] || '40 (8)');
    setSelectedColor(product.colors?.[0]?.name || 'Original');
    setCustomItemPrice(product.price ? String(product.price) : '');
    setItemQuantity(1);
    setActiveTab('quoter');
    showToast(`Producto "${product.name}" cargado en el Cotizador`);
  };

  // Add Item to Multi-Quote
  const handleAddItemToQuote = () => {
    if (!activeQuoterProduct) return;
    const finalPrice = customItemPrice ? parseFloat(customItemPrice) : activeQuoterProduct.price || 0;
    const newItem = {
      id: `${activeQuoterProduct.id}-${Date.now()}`,
      productId: activeQuoterProduct.id,
      name: activeQuoterProduct.name,
      price: finalPrice,
      size: selectedSize,
      color: selectedColor,
      quantity: parseInt(itemQuantity) || 1,
      image: activeQuoterProduct.images?.[0] || '/img/drop-1.jpg',
    };
    setQuoteItems((prev) => [...prev, newItem]);
    showToast(`"${activeQuoterProduct.name}" agregado al desglose`);
  };

  const handleRemoveQuoteItem = (id) => {
    setQuoteItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Calculate Subtotals & Totals
  const subtotal = useMemo(() => {
    if (quoteItems.length > 0) {
      return quoteItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    }
    const singlePrice = customItemPrice ? parseFloat(customItemPrice) : activeQuoterProduct?.price || 0;
    return singlePrice * (parseInt(itemQuantity) || 1);
  }, [quoteItems, customItemPrice, activeQuoterProduct, itemQuantity]);

  const total = Math.max(0, subtotal + (parseFloat(deliveryCost) || 0) - (parseFloat(extraDiscount) || 0));

  // WhatsApp Quote Text Generator
  const formattedQuoteText = useMemo(() => {
    const itemsList =
      quoteItems.length > 0
        ? quoteItems
            .map(
              (item, i) =>
                `  ${i + 1}. *${item.name}*\n     • Talla: ${item.size} | Color: ${item.color}\n     • Cant: ${item.quantity} x RD$ ${item.price?.toLocaleString()} = *RD$ ${(item.price * item.quantity)?.toLocaleString()}*`
            )
            .join('\n\n')
        : activeQuoterProduct
        ? `  1. *${activeQuoterProduct.name}*\n     • Talla: ${selectedSize} | Color: ${selectedColor}\n     • Cant: ${itemQuantity} x RD$ ${(customItemPrice ? parseFloat(customItemPrice) : activeQuoterProduct.price)?.toLocaleString()} = *RD$ ${subtotal?.toLocaleString()}*`
        : '  (Sin producto seleccionado)';

    return `🔥 *COTIZACIÓN OFICIAL — MVP FLOW BOUTIQUE RD*\n` +
      `👤 *Cliente:* ${customerName || 'Cliente Distinguido'}\n` +
      `👩‍💼 *Asesora de Ventas:* ${agentName}\n` +
      `📍 *Destino:* ${customerAddress || selectedSector}\n\n` +
      `🛍️ *DETALLE DE TU PEDIDO:*\n` +
      `${itemsList}\n\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `📦 *Subtotal Prendas:* RD$ ${subtotal?.toLocaleString()}\n` +
      `🛵 *Envío Express (${selectedSector}):* ${deliveryCost === 0 ? '¡GRATIS!' : `RD$ ${deliveryCost?.toLocaleString()}`}\n` +
      (extraDiscount > 0 ? `🎟️ *Descuento Especial:* -RD$ ${extraDiscount?.toLocaleString()}\n` : '') +
      `💰 *TOTAL A PAGAR AL RECIBIR:* *RD$ ${total?.toLocaleString()}*\n` +
      `━━━━━━━━━━━━━━━━━━━━\n\n` +
      `💵 *MÉTODO DE PAGO:* Pago Contra Entrega (COD) en Efectivo o Transferencia al recibir tu paquete en mano.\n` +
      `🛡️ *GARANTÍA:* Calidad G5 con caja original. Puedes verificar tu producto antes de pagarle al mensajero.\n\n` +
      (quoteNotes ? `📝 *Nota:* ${quoteNotes}\n\n` : '') +
      `👉 *¿Confirmamos tu despacho para enviártelo de una vez?* Responde con un *SÍ* y tu ubicación para asignar mensajero. 🛵💨`;
  }, [
    quoteItems,
    activeQuoterProduct,
    selectedSize,
    selectedColor,
    itemQuantity,
    customItemPrice,
    subtotal,
    customerName,
    agentName,
    customerAddress,
    selectedSector,
    deliveryCost,
    extraDiscount,
    total,
    quoteNotes,
  ]);

  // 1-Click Send Quote to Whaticket API
  const handleSendQuoteWhaticket = async () => {
    if (!customerPhone) {
      alert('Por favor introduce el número de WhatsApp del cliente para enviar la cotización.');
      return;
    }
    setIsSendingQuote(true);
    setQuoteSuccessMsg(null);

    try {
      const res = await fetch('/api/whaticket/send-quote', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          phone: customerPhone,
          customerName: customerName || 'Cliente',
          quoteText: formattedQuoteText,
          agentName,
          total,
          products: quoteItems.length > 0 ? quoteItems : [activeQuoterProduct],
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setQuoteSuccessMsg('¡Cotización enviada con éxito directamente a la conversación de RENACE!');
        showToast('🚀 Despachado por RENACE API');
      } else {
        setQuoteSuccessMsg(`Enviado (Simulado / Directo): ${data.message || 'Despachado correctamente'}`);
      }
    } catch (err) {
      setQuoteSuccessMsg(`Error de red: ${err.message}. Puedes usar el botón de WhatsApp directo.`);
    } finally {
      setIsSendingQuote(false);
      setTimeout(() => setQuoteSuccessMsg(null), 7000);
    }
  };

  // Convert Quote to COD Order Ticket
  const handleConvertToOrder = async () => {
    if (!customerName || !customerPhone) {
      alert('Para registrar la orden se requiere el Nombre y Teléfono del cliente.');
      return;
    }
    setIsConvertingOrder(true);
    try {
      const orderPayload = {
        customer: {
          name: customerName,
          phone: customerPhone,
          address: customerAddress || selectedSector,
          sector: selectedSector,
          notes: quoteNotes,
        },
        items:
          quoteItems.length > 0
            ? quoteItems
            : [
                {
                  id: activeQuoterProduct?.id,
                  name: activeQuoterProduct?.name,
                  price: customItemPrice ? parseFloat(customItemPrice) : activeQuoterProduct?.price,
                  size: selectedSize,
                  color: selectedColor,
                  quantity: parseInt(itemQuantity) || 1,
                  image: activeQuoterProduct?.images?.[0],
                },
              ],
        subtotal,
        shippingFee: deliveryCost,
        discount: extraDiscount,
        total,
        agentName,
        paymentMethod: 'COD',
        status: 'received',
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCreatedOrderTicket(data.orderId || `#MVP-${Math.floor(1000 + Math.random() * 9000)}`);
        showToast('📦 ¡Orden COD generada y asignada!');
      } else {
        setCreatedOrderTicket(`#MVP-${Math.floor(1000 + Math.random() * 9000)}`);
      }
    } catch {
      setCreatedOrderTicket(`#MVP-${Math.floor(1000 + Math.random() * 9000)}`);
    } finally {
      setIsConvertingOrder(false);
    }
  };

  // Filter Products for Catalog Tab
  const filteredCatalogProducts = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return products.filter((p) => {
      const name = (p.name || '').toLowerCase();
      const sku = (p.sku || '').toLowerCase();
      const tag = (p.tag || '').toLowerCase();
      const cat = (p.category || '').toLowerCase();

      const matchesSearch =
        q === '' || name.includes(q) || sku.includes(q) || tag.includes(q) || cat.includes(q);

      const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;

      let matchesSource = true;
      if (filterSource === 'odoo') matchesSource = Boolean(p.isOdooProduct);
      if (filterSource === 'web') matchesSource = p.isPublishedWeb !== false;
      if (filterSource === 'local_only') matchesSource = p.isPublishedWeb === false;

      return matchesSearch && matchesCat && matchesSource;
    });
  }, [products, searchTerm, selectedCategory, filterSource]);

  // Filtered Products for Live Search inside Cotizador
  const quoterSearchResults = useMemo(() => {
    if (!quoterSearchQuery.trim()) return [];
    const q = quoterSearchQuery.toLowerCase();
    return products.filter(
      (p) =>
        (p.name || '').toLowerCase().includes(q) ||
        (p.sku || '').toLowerCase().includes(q) ||
        (p.category || '').toLowerCase().includes(q)
    ).slice(0, 8);
  }, [products, quoterSearchQuery]);

  // Quick Replies Data
  const QUICK_REPLIES = [
    {
      id: 'bienvenida',
      title: 'Saludo & Bienvenida Oficial',
      shortcut: '/bienvenida',
      category: 'Atención',
      text: `Hola, ¡te asiste *${agentName}* de *PLASTIR RD*! 👋✨\n\nSomos tu tienda por departamentos de artículos para el hogar, organización inteligente y plásticos certificados en *Av. San Vicente de Paúl No. 108, Los Mina, Santo Domingo Este*.\n\n¿En qué artículo, gavetero, organizador o producto para tu hogar te podemos ayudar hoy? 🏡📦`,
    },
    {
      id: 'envios',
      title: 'Política de Envíos Express y Tiempos',
      shortcut: '/envios',
      category: 'Logística',
      text: `🛵 *POLÍTICA DE ENVÍOS & ENTREGAS PLASTIR RD:*\n\n• *Santo Domingo (DN y SDE):* Entrega el mismo día (2 a 4 horas) con mensajero express.\n• *Interior del país:* 24 a 48 horas con envío asegurado.\n• *Pago Contra Entrega (COD):* Pagas en efectivo o transferencia bancaria al recibir tu pedido en mano. 💯`,
    },
    {
      id: 'garantia',
      title: 'Garantía de Calidad y Libre de BPA',
      shortcut: '/garantia',
      category: 'Calidad',
      text: `🛡️ *GARANTÍA OFICIAL PLASTIR RD:*\n\nTodos nuestros productos son fabricados en polipropileno virgen de primera calidad, *100% libres de BPA* y con garantía de satisfacción. Puedes verificar tu paquete antes de pagarle al mensajero. ¡Cero riesgo! 🏡✨`,
    },
    {
      id: 'ubicacion',
      title: 'Ubicación Tienda Física y Horarios',
      shortcut: '/ubicacion',
      category: 'Tienda',
      text: `📍 *UBICACIÓN TIENDA FÍSICA PLASTIR RD:*\n\nEstamos en la *Av. San Vicente de Paúl No. 108, Los Mina, Santo Domingo Este* (próximo a la estación del Metro Trina de Moya).\n\n🕒 *Horario:* Lunes a Sábado de 8:00 AM a 7:00 PM, Domingos de 9:00 AM a 2:00 PM.\n🗺️ *Google Maps:* https://maps.google.com/?q=Av.+San+Vicente+de+Pa%C3%BAl+No.+108,+Santo+Domingo+Este\n\n¡Puedes visitarnos en tienda física o pedir a domicilio con entrega el mismo día! 🛵`,
    },
    {
      id: 'datos_despacho',
      title: 'Captura de Datos para Despacho Inmediato',
      shortcut: '/datos',
      category: 'Cierre',
      text: `📦 *PARA EMPAQUETAR Y ASIGNARTE MENSAJERO HOY, POR FAVOR ENVÍANOS:*\n\n1. *Nombre Completo:*\n2. *Teléfono de Contacto:*\n3. *Provincia y Sector:*\n4. *Calle, Número de Casa/Edificio:*\n5. *Punto de Referencia:*\n\n¡Apenas nos envíes esto, sale tu mensajero! 🛵💨`,
    },
  ];

  // If Not Authenticated, Render Sleek Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#07090E] flex flex-col items-center justify-center p-4 relative overflow-hidden selection:bg-[#FF1E27] selection:text-white">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#FF1E27]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md bg-[#0F131E]/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl relative z-10 space-y-6">
          {/* Official Symbol Header */}
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-24 h-24 rounded-3xl p-1 bg-gradient-to-br from-[#FF1E27] via-white/20 to-sky-500 shadow-xl shadow-[#FF1E27]/30">
              <img
                src="/catalogo-symbol.svg"
                alt="MVP Catálogo Pro"
                className="w-full h-full object-contain rounded-2xl"
              />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF1E27]/10 border border-[#FF1E27]/30 text-[#FF414D] text-[11px] font-bold uppercase tracking-widest">
                <span className="w-2 h-2 rounded-full bg-[#FF1E27] animate-ping" />
                Aplicación Independiente
              </div>
              <h1 className="text-3xl font-black text-white uppercase tracking-wider font-display mt-2">
                MVP Catálogo Pro
              </h1>
              <p className="text-xs text-slate-400 font-medium">
                Portal Autónomo de Ventas, Stock Central & Cotizador RENACE
              </p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-2 font-semibold">
                Código de Acceso Staff
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    setAuthError(false);
                  }}
                  placeholder="Introduce contraseña..."
                  className="w-full bg-[#07090E] border border-white/15 focus:border-[#FF1E27] focus:ring-2 focus:ring-[#FF1E27]/20 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-all"
                  autoFocus
                />
              </div>
              {authError && (
                <p className="text-xs text-rose-400 mt-2 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Código incorrecto. Intenta de nuevo.
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#FF1E27] to-[#B91C1C] hover:from-[#FF414D] hover:to-[#DC2626] text-white font-bold text-sm uppercase tracking-wider shadow-lg shadow-[#FF1E27]/30 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <ShieldCheck className="w-5 h-5" />
              Ingresar al Catálogo
            </button>
          </form>

          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-slate-500">
            <a
              href="/"
              className="hover:text-slate-300 transition-colors flex items-center gap-1"
            >
              <Store className="w-3.5 h-3.5" />
              Ir a la Tienda Pública
            </a>
            <span className="font-mono text-[10px]">v2.6 // SDE</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 font-sans antialiased selection:bg-[#FF1E27] selection:text-white flex flex-col pb-20 md:pb-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-[#141A28] border border-[#FF1E27]/40 text-white text-xs sm:text-sm font-semibold px-4 py-3 rounded-2xl shadow-2xl shadow-[#FF1E27]/20 flex items-center gap-3 animate-fade-in">
          <Sparkles className="w-4 h-4 text-[#FF1E27] animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-[#0A0D15]/95 backdrop-blur-xl border-b border-white/10 px-3 sm:px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo & Symbol Brand */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl p-0.5 bg-gradient-to-br from-[#FF1E27] via-white/10 to-sky-500 shadow-md shadow-[#FF1E27]/20 shrink-0">
              <img
                src="/catalogo-symbol.svg"
                alt="MVP Catálogo Symbol"
                className="w-full h-full object-contain rounded-[10px]"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base sm:text-lg font-black text-white tracking-wide uppercase font-display">
                  MVP Catálogo Pro
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md bg-[#FF1E27]/15 border border-[#FF1E27]/30 text-[#FF414D] text-[10px] font-bold">
                  APP INDEPENDIENTE
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden xs:block">
                Gestión de Redes, Stock Central & Cotizador RENACE
              </p>
            </div>
          </div>

          {/* Quick Actions & Agent Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Agent Selector Pill */}
            <div className="relative flex items-center bg-[#121624] border border-emerald-500/20 rounded-xl px-2.5 py-1.5" title="Asesor sincronizado con Whaticket">
              <span className="w-2 h-2 rounded-full bg-emerald-400 mr-1.5 animate-pulse shrink-0" />
              <select
                value={agentName}
                onChange={(e) => handleAgentChange(e.target.value)}
                className="bg-transparent text-xs font-bold text-white outline-none cursor-pointer pr-1"
              >
                {whaticketStaff.map((a) => (
                  <option key={a.id} value={a.name} className="bg-[#0F131E] text-white">
                    {a.name} {a.profile ? `(${a.profile})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Sync Stock Button */}
            <button
              onClick={handleSyncOdoo}
              disabled={isSyncingOdoo}
              title="Sincronizar Stock en Mano desde Inventario Central"
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncingOdoo ? 'animate-spin' : ''}`} />
              <span className="hidden md:inline">
                {isSyncingOdoo ? 'Sincronizando...' : 'Sync Stock'}
              </span>
            </button>

            {/* Download Extension Button */}
            <button
              onClick={() => setShowExtensionModal(true)}
              title="Descargar Extensión Chrome para Ubicaciones"
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span className="hidden lg:inline">Extensión Chrome</span>
            </button>

            {/* Sync Contacts Button */}
            <button
              onClick={() => setShowContactSyncModal(true)}
              title="Sincronizar Contactos con WhatsApp / Descargar vCard"
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Users className="w-4 h-4 text-emerald-400" />
              <span className="hidden xl:inline">Contactos WhatsApp</span>
            </button>

            {/* Unique Upload Link Button */}
            <button
              onClick={() => {
                setShowShareUploadModal(true);
                loadUploadLinks();
              }}
              title="Generar Link de Subida Único para Fotos"
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-400 text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Share2 className="w-4 h-4 text-sky-400" />
              <span className="hidden xl:inline">Link de Subida</span>
            </button>

            {/* Install PWA Button */}
            <button
              onClick={handleInstallPWA}
              title="Instalar App en Celular"
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-[#141A28] hover:bg-[#1A2234] border border-white/10 text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Smartphone className="w-4 h-4 text-sky-400" />
              <span className="hidden lg:inline">Instalar App</span>
            </button>

            {/* Link to Public Store */}
            <a
              href="/"
              title="Ver Tienda Pública de Clientes"
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Store className="w-4 h-4 text-slate-400" />
              <span className="hidden sm:inline">Tienda</span>
            </a>

            {/* Logout */}
            <button
              onClick={handleLogout}
              title="Cerrar Sesión"
              className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs transition-colors"
            >
              <Lock className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sync Feedback Toast inside Header */}
        {syncFeedback && (
          <div className="max-w-7xl mx-auto mt-2 text-xs font-semibold text-center py-1.5 px-3 bg-emerald-950/80 border border-emerald-500/40 rounded-xl text-emerald-300 animate-fade-in">
            {syncFeedback}
          </div>
        )}
      </header>

      {/* Main Tab Navigation Bar */}
      <nav className="bg-[#0C101A] border-b border-white/5 px-3 sm:px-6 py-2 sticky top-[57px] sm:top-[61px] z-30 overflow-x-auto no-scrollbar">
        <div className="max-w-7xl mx-auto flex items-center gap-2">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'catalog'
                ? 'bg-[#FF1E27] text-white shadow-lg shadow-[#FF1E27]/25'
                : 'bg-[#121724] text-slate-400 hover:text-white hover:bg-[#161D2E]'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Catálogo & Stock</span>
            <span className="px-1.5 py-0.2 rounded-full bg-black/30 text-[10px]">
              {filteredCatalogProducts.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('quoter')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'quoter'
                ? 'bg-[#FF1E27] text-white shadow-lg shadow-[#FF1E27]/25'
                : 'bg-[#121724] text-slate-400 hover:text-white hover:bg-[#161D2E]'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Cotizador RENACE</span>
            {quoteItems.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-black font-black text-[10px]">
                {quoteItems.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('replies')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'replies'
                ? 'bg-[#FF1E27] text-white shadow-lg shadow-[#FF1E27]/25'
                : 'bg-[#121724] text-slate-400 hover:text-white hover:bg-[#161D2E]'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-sky-400" />
            <span>Respuestas Rápidas</span>
          </button>

          <button
            onClick={() => setActiveTab('album')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'album'
                ? 'bg-[#FF1E27] text-white shadow-lg shadow-[#FF1E27]/25'
                : 'bg-[#121724] text-slate-400 hover:text-white hover:bg-[#161D2E]'
            }`}
          >
            <ImageIcon className="w-4 h-4 text-violet-400" />
            <span>Galería Fotos Staff</span>
          </button>

          <button
            onClick={() => setActiveTab('shipping')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'shipping'
                ? 'bg-[#FF1E27] text-white shadow-lg shadow-[#FF1E27]/25'
                : 'bg-[#121724] text-slate-400 hover:text-white hover:bg-[#161D2E]'
            }`}
          >
            <Truck className="w-4 h-4 text-emerald-400" />
            <span>Tarifario Envíos RD</span>
          </button>

          <button
            onClick={() => setActiveTab('metrics')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'metrics'
                ? 'bg-[#FF1E27] text-white shadow-lg shadow-[#FF1E27]/25'
                : 'bg-[#121724] text-slate-400 hover:text-white hover:bg-[#161D2E]'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-amber-400" />
            <span>Métricas & Analytics Pro</span>
          </button>
        </div>
      </nav>

      {/* Main App Content Area */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 flex-1 w-full">
        {/* ========================================================= */}
        {/* TAB 1: CATÁLOGO & STOCK EN MANO                           */}
        {/* ========================================================= */}
        {activeTab === 'catalog' && (
          <div className="space-y-4">
            {/* Search and Filter Controls */}
            <div className="bg-[#0F131E] border border-white/10 rounded-2xl p-3 sm:p-4 space-y-3">
              <div className="flex flex-col sm:flex-row gap-2.5 sm:items-center justify-between">
                {/* Search Bar */}
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar por modelo, talla, SKU, color o categoría..."
                    className="w-full bg-[#080A10] border border-white/10 focus:border-[#FF1E27] focus:ring-1 focus:ring-[#FF1E27] rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-white placeholder-slate-500 outline-none"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-2.5 text-slate-500 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Source Filter (All / Stock Central / Web / Local) */}
                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                  {[
                    { id: 'all', label: 'Todos' },
                    { id: 'odoo', label: '🔄 Stock Central' },
                    { id: 'web', label: '🌐 Catálogo Web' },
                    { id: 'local_only', label: '🔒 Solo Redes' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setFilterSource(s.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                        filterSource === s.id
                          ? 'bg-white/15 text-white border border-white/20'
                          : 'bg-[#141A28] text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Categories Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1 border-t border-white/5">
                {[
                  { id: 'all', label: 'Todas las Categorías' },
                  { id: 'sneakers', label: '👟 Tenis & Sneakers' },
                  { id: 'combos', label: '🔥 Combos Virales' },
                  { id: 'hoodies', label: '🧥 Ropa & Hoodies' },
                  { id: 'accessories', label: '🧢 Gorras & Accesorios' },
                ].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCategory(c.id)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                      selectedCategory === c.id
                        ? 'bg-[#FF1E27]/20 border border-[#FF1E27] text-[#FF414D]'
                        : 'bg-[#121624] text-slate-400 hover:text-white'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Products Grid */}
            {loadingProducts ? (
              <div className="py-20 text-center space-y-3">
                <RefreshCw className="w-8 h-8 text-[#FF1E27] animate-spin mx-auto" />
                <p className="text-sm font-semibold text-slate-400">Cargando inventario...</p>
              </div>
            ) : filteredCatalogProducts.length === 0 ? (
              <div className="bg-[#0F131E] border border-white/10 rounded-2xl p-12 text-center space-y-3">
                <Package className="w-12 h-12 text-slate-600 mx-auto" />
                <p className="text-base font-bold text-white">No se encontraron productos con esos filtros.</p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                    setFilterSource('all');
                  }}
                  className="px-4 py-2 rounded-xl bg-[#FF1E27] text-white text-xs font-bold uppercase"
                >
                  Restablecer Filtros
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4">
                {filteredCatalogProducts.map((product) => {
                  const isCopied = copiedId === product.id;
                  const isWebPublished = product.isPublishedWeb !== false;
                  const isToggling = togglingId === product.id;

                  return (
                    <div
                      key={product.id}
                      className="bg-[#0E121D] border border-white/10 hover:border-white/20 rounded-2xl p-3 sm:p-3.5 space-y-3 flex flex-col justify-between transition-all group"
                    >
                      {/* Product Card Top: Image & Badges */}
                      <div>
                        <div className="relative aspect-square rounded-xl overflow-hidden bg-black/40 mb-2.5">
                          <img
                            src={product.images?.[0] || '/img/drop-1.jpg'}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />

                          {/* Top Badges */}
                          <div className="absolute top-2 left-2 flex flex-col gap-1">
                            {product.isOdooProduct && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded border border-sky-500/20">
                                <Database className="w-3 h-3" /> Stock Central
                              </span>
                            )}
                            {product.isFlashDeal && (
                              <span className="px-2 py-0.5 rounded-md bg-rose-600/90 text-white text-[10px] font-black uppercase">
                                🔥 Flash Deal
                              </span>
                            )}
                          </div>

                          {/* Web Visibility Pill */}
                          <div className="absolute top-2 right-2">
                            <button
                              onClick={() => handleToggleWeb(product.id, isWebPublished)}
                              disabled={isToggling}
                              title={isWebPublished ? 'Habilitado en Tienda Web. Clic para ocultar.' : 'Oculto de Tienda Web. Clic para publicar.'}
                              className={`px-2 py-1 rounded-lg text-[10px] font-bold backdrop-blur-md border transition-all flex items-center gap-1 ${
                                isWebPublished
                                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                                  : 'bg-zinc-900/80 text-zinc-400 border-white/10'
                              }`}
                            >
                              <Globe className="w-3 h-3" />
                              {isWebPublished ? 'En Web' : 'Solo Redes'}
                            </button>
                          </div>

                          {/* Stock Pill Bottom */}
                          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between px-2 py-1 rounded-lg bg-black/70 backdrop-blur-md text-[11px]">
                            <span className="text-slate-300 font-mono">Stock en mano:</span>
                            <span className={`font-bold ${product.stockLeft <= 3 ? 'text-rose-400' : 'text-emerald-400'}`}>
                              {product.stockLeft ?? 5} pares
                            </span>
                          </div>
                        </div>

                        {/* Product Title & Category */}
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono text-[#FF414D] uppercase font-bold tracking-wider">
                            {product.category || 'Sneakers'}
                          </span>
                          <h3 className="text-sm font-bold text-white line-clamp-2 leading-tight">
                            {product.name}
                          </h3>
                        </div>

                        {/* Price Breakdown */}
                        <div className="flex items-baseline gap-2 mt-2">
                          <span className="text-lg font-black text-white font-mono">
                            RD$ {(product.price || 0).toLocaleString()}
                          </span>
                          {product.originalPrice && (
                            <span className="text-xs text-slate-500 line-through font-mono">
                              RD$ {product.originalPrice.toLocaleString()}
                            </span>
                          )}
                        </div>

                        {/* Sizes list preview */}
                        {product.sizes && (
                          <div className="flex items-center gap-1 flex-wrap mt-2">
                            {product.sizes.slice(0, 4).map((sz, i) => (
                              <span
                                key={i}
                                className="px-1.5 py-0.5 rounded bg-white/5 text-[10px] font-mono text-slate-300"
                              >
                                {sz}
                              </span>
                            ))}
                            {product.sizes.length > 4 && (
                              <span className="text-[10px] text-slate-500">
                                +{product.sizes.length - 4} más
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="pt-2 border-t border-white/5 grid grid-cols-2 gap-2">
                        {/* Copy Pitch Button */}
                        <button
                          onClick={() => handleCopyPitch(product)}
                          className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                            isCopied
                              ? 'bg-emerald-500 text-white'
                              : 'bg-[#141A28] hover:bg-[#1C2538] text-slate-200 border border-white/10'
                          }`}
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5 text-sky-400" />}
                          <span>{isCopied ? 'Copiado' : 'Copiar Ficha'}</span>
                        </button>

                        {/* Send to Quoter Button */}
                        <button
                          onClick={() => handleSendToQuoter(product)}
                          className="py-2 px-2.5 rounded-xl text-xs font-bold bg-[#FF1E27] hover:bg-[#FF414D] text-white transition-all flex items-center justify-center gap-1.5 shadow-md shadow-[#FF1E27]/20"
                        >
                          <Zap className="w-3.5 h-3.5" />
                          <span>Cotizar</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: COTIZADOR RÁPIDO RENACE PRO                        */}
        {/* ========================================================= */}
        {activeTab === 'quoter' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
            {/* Left Column: Form & Item Builder (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              {/* Client & Whaticket Conversation Picker */}
              <div className="bg-[#0F131E] border border-white/10 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono text-[#FF414D] uppercase font-bold tracking-wider flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" /> 1. Datos del Cliente / Conversación RENACE
                  </h3>
                  {whaticketTickets.length > 0 && (
                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      {whaticketTickets.length} chats abiertos
                    </span>
                  )}
                </div>

                {/* Whaticket ticket quick-fill selector if tickets exist */}
                {whaticketTickets.length > 0 && (
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Cargar datos de conversación abierta en RENACE:
                    </label>
                    <select
                      onChange={(e) => {
                        const ticket = whaticketTickets.find((t) => String(t.id) === e.target.value);
                        if (ticket) {
                          setCustomerName(ticket.contact?.name || ticket.name || '');
                          setCustomerPhone(ticket.contact?.number || ticket.lastMessage?.contact?.number || '');
                          showToast(`Datos de ${ticket.contact?.name || 'Cliente'} cargados`);
                        }
                      }}
                      className="w-full bg-[#080A10] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#FF1E27]"
                    >
                      <option value="">-- Seleccionar Chat de RENACE --</option>
                      {whaticketTickets.map((t) => (
                        <option key={t.id} value={t.id}>
                          #{t.id} - {t.contact?.name || 'Cliente'} ({t.contact?.number || 'Sin num'})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Nombre del Cliente:</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Ej. Juan Pérez"
                      className="w-full bg-[#080A10] border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm text-white placeholder-slate-600 outline-none focus:border-[#FF1E27]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">WhatsApp / Teléfono:</label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="Ej. 8096560219"
                      className="w-full bg-[#080A10] border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm text-white placeholder-slate-600 outline-none focus:border-[#FF1E27]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Dirección / Sector de Entrega:</label>
                  <input
                    type="text"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    placeholder="Ej. Calle 4ta #12, Los Mina, Santo Domingo Este"
                    className="w-full bg-[#080A10] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 outline-none focus:border-[#FF1E27]"
                  />
                </div>
              </div>

              {/* Product Selector & Item Configurator */}
              <div className="bg-[#0F131E] border border-white/10 rounded-2xl p-4 space-y-3">
                <h3 className="text-xs font-mono text-[#FF414D] uppercase font-bold tracking-wider flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5" /> 2. Selección de Prenda / Tenis
                </h3>

                {/* Search product within Quoter */}
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
                  <input
                    type="text"
                    value={quoterSearchQuery}
                    onChange={(e) => setQuoterSearchQuery(e.target.value)}
                    placeholder="Buscar producto para cotizar..."
                    className="w-full bg-[#080A10] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-[#FF1E27]"
                  />

                  {/* Dropdown Live Results */}
                  {quoterSearchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-[#141A28] border border-white/15 rounded-xl shadow-2xl z-20 max-h-56 overflow-y-auto divide-y divide-white/5">
                      {quoterSearchResults.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => {
                            setActiveQuoterProduct(p);
                            setSelectedSize(p.sizes?.[0] || '40 (8)');
                            setSelectedColor(p.colors?.[0]?.name || 'Original');
                            setCustomItemPrice(p.price ? String(p.price) : '');
                            setQuoterSearchQuery('');
                          }}
                          className="p-2.5 hover:bg-white/5 cursor-pointer flex items-center gap-2.5"
                        >
                          <img
                            src={p.images?.[0] || '/img/drop-1.jpg'}
                            alt={p.name}
                            className="w-8 h-8 rounded-lg object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-white truncate">{p.name}</p>
                            <p className="text-[10px] text-slate-400">RD$ {p.price?.toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Active Product Details */}
                {activeQuoterProduct && (
                  <div className="bg-[#080A10] border border-white/5 rounded-xl p-3 space-y-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={activeQuoterProduct.images?.[0] || '/img/drop-1.jpg'}
                        alt={activeQuoterProduct.name}
                        className="w-14 h-14 rounded-xl object-cover border border-white/10"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-white truncate">{activeQuoterProduct.name}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs font-black text-white font-mono">
                            RD$ {(activeQuoterProduct.price || 0).toLocaleString()}
                          </span>
                          <span className="text-[10px] text-emerald-400 font-bold">
                            Stock: {activeQuoterProduct.stockLeft ?? 5} pares
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-white/5">
                      {/* Size Selector */}
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1">Talla:</label>
                        <select
                          value={selectedSize}
                          onChange={(e) => setSelectedSize(e.target.value)}
                          className="w-full bg-[#141A28] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white outline-none"
                        >
                          {(activeQuoterProduct.sizes || ['38 (7)', '39 (7.5)', '40 (8)', '41 (8.5)', '42 (9)', '43 (10)', '44 (11)']).map((s, idx) => (
                            <option key={idx} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>

                      {/* Color Selector */}
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1">Color / Versión:</label>
                        <select
                          value={selectedColor}
                          onChange={(e) => setSelectedColor(e.target.value)}
                          className="w-full bg-[#141A28] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white outline-none"
                        >
                          {(activeQuoterProduct.colors?.map((c) => c.name) || ['Original', 'Black OG', 'White']).map((col, idx) => (
                            <option key={idx} value={col}>{col}</option>
                          ))}
                        </select>
                      </div>

                      {/* Quantity */}
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1">Cantidad:</label>
                        <input
                          type="number"
                          min="1"
                          max="20"
                          value={itemQuantity}
                          onChange={(e) => setItemQuantity(e.target.value)}
                          className="w-full bg-[#141A28] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white outline-none text-center font-bold"
                        />
                      </div>

                      {/* Custom Negotiated Price */}
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1">Precio Acordado:</label>
                        <input
                          type="number"
                          placeholder={String(activeQuoterProduct.price || 1790)}
                          value={customItemPrice}
                          onChange={(e) => setCustomItemPrice(e.target.value)}
                          className="w-full bg-[#141A28] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white outline-none font-mono text-center font-bold"
                        />
                      </div>
                    </div>

                    <button
                      onClick={handleAddItemToQuote}
                      className="w-full py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Agregar a la Lista de Cotización
                    </button>
                  </div>
                )}

                {/* Multi-Item Quote List */}
                {quoteItems.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-white/5">
                    <span className="text-[11px] font-mono text-slate-400 font-bold">
                      Prendas en esta cotización ({quoteItems.length}):
                    </span>
                    <div className="space-y-1.5">
                      {quoteItems.map((it) => (
                        <div
                          key={it.id}
                          className="p-2 rounded-xl bg-[#080A10] border border-white/5 flex items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <img src={it.image} alt={it.name} className="w-8 h-8 rounded-lg object-cover" />
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-white truncate">{it.name}</p>
                              <p className="text-[10px] text-slate-400">
                                {it.size} | {it.color} | Cant: {it.quantity} x RD$ {it.price?.toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveQuoteItem(it.id)}
                            className="p-1 text-slate-500 hover:text-rose-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Shipping & Distance Calculator & Discounts */}
              <div className="bg-[#0F131E] border border-white/10 rounded-2xl p-4 space-y-3.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono text-[#FF414D] uppercase font-bold tracking-wider flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5" /> 3. Envío Express COD & Calculador por KM
                  </h3>
                  <a
                    href={MVP_STORE_LOCATION.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 underline"
                  >
                    <MapPin className="w-3 h-3" />
                    <span>Origen: Los Mina, San Vicente</span>
                  </a>
                </div>

                {/* 🗺️ HERRAMIENTA: CALCULADOR DE ENVÍO POR GOOGLE MAPS / DISTANCIA (KM) */}
                <div className="bg-[#080A10] border border-amber-500/30 rounded-xl p-3 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5" />
                      Calculador de Envío por KM (Google Maps)
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowExtensionModal(true)}
                        className="text-[10px] text-amber-300 hover:text-amber-200 font-bold bg-amber-500/10 hover:bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1 transition-colors"
                      >
                        <Download className="w-3 h-3" />
                        <span>Extensión Chrome</span>
                      </button>
                      <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        Ruta en Tiempo Real
                      </span>
                    </div>
                  </div>

                  {/* Input URL Maps o WhatsApp */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-300 flex items-center justify-between">
                      <span>Pega aquí el enlace de Google Maps, WhatsApp o coordenadas del cliente:</span>
                      <span className="text-[10px] text-slate-500">Soporta ?q=, @lat,lng, goo.gl</span>
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <MapPin className="absolute left-3 top-2.5 text-amber-400 w-3.5 h-3.5" />
                        <input
                          type="text"
                          placeholder="Ej: https://maps.google.com/maps?q=18.4765,-69.9320 o 18.4861, -69.9312"
                          value={mapsLocationInput}
                          onChange={(e) => setMapsLocationInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleCalculateDistance();
                            }
                          }}
                          className="w-full bg-[#0E121D] border border-amber-400/40 focus:border-amber-400 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-slate-600 focus:outline-none"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCalculateDistance()}
                        className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs rounded-xl transition-all shadow-md flex items-center gap-1.5 shrink-0"
                      >
                        <Compass className="w-3.5 h-3.5" />
                        <span>Calcular KM</span>
                      </button>
                    </div>
                  </div>

                  {/* Reglas Tarifarias Escalonadas */}
                  <div className="bg-[#0E121D] p-2.5 rounded-xl border border-white/5 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider">Reglas Tarifarias Escalonadas:</span>
                      <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-bold">Redondeo a 25</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
                      <div className="bg-[#141A28] p-1.5 rounded-lg border border-white/5">
                        <span className="text-slate-400 block text-[9px]">0 a 10 KM</span>
                        <strong className="text-white font-black">RD$ 35 / km</strong>
                        <span className="text-[8px] text-emerald-400 block">Base RD$ 200</span>
                      </div>
                      <div className="bg-[#141A28] p-1.5 rounded-lg border border-white/5">
                        <span className="text-slate-400 block text-[9px]">10 a 20 KM</span>
                        <strong className="text-amber-300 font-black">RD$ 25 / km</strong>
                        <span className="text-[8px] text-slate-500 block">Medio tramo</span>
                      </div>
                      <div className="bg-[#141A28] p-1.5 rounded-lg border border-white/5">
                        <span className="text-slate-400 block text-[9px]">&gt; 20 KM</span>
                        <strong className="text-cyan-300 font-black">RD$ 15 / km</strong>
                        <span className="text-[8px] text-slate-500 block">Largo tramo</span>
                      </div>
                    </div>
                  </div>

                  {/* Sectores Frecuentes Presets */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block mb-1">Sectores Frecuentes (Cálculo Rápido con 1 clic):</span>
                    <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                      {NEIGHBORHOOD_PRESETS.map((preset) => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => handleSelectPresetNeighborhood(preset)}
                          className="px-2 py-1 bg-white/5 hover:bg-amber-500/20 hover:border-amber-400/50 border border-white/10 rounded-lg text-[10px] font-bold text-slate-300 hover:text-amber-300 whitespace-nowrap transition-colors"
                        >
                          {preset.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Error si falla el parseo */}
                  {calcError && (
                    <div className="p-2.5 bg-rose-500/20 border border-rose-500/50 rounded-xl text-xs text-white flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>{calcError}</span>
                    </div>
                  )}

                  {/* Resultado del Cálculo de Distancia */}
                  {distanceCalcResult && (
                    <div className="bg-gradient-to-r from-emerald-950/50 via-[#0E121D] to-emerald-950/40 border border-emerald-500/40 rounded-xl p-3 space-y-2.5">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center">
                        <div className="bg-black/50 p-2 rounded-lg border border-white/10">
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">Distancia de Ruta</span>
                          <span className="text-base sm:text-lg font-black text-white">{distanceCalcResult.distanceKm} KM</span>
                        </div>
                        <div className="bg-black/50 p-2 rounded-lg border border-white/10">
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">Tiempo Estimado</span>
                          <span className="text-xs font-bold text-amber-300">{distanceCalcResult.estimatedTime}</span>
                        </div>
                        <div className="bg-black/50 p-2 rounded-lg border border-emerald-500/30">
                          <span className="text-[10px] text-emerald-400 uppercase font-bold block">Tarifa Sugerida</span>
                          <span className="text-base sm:text-lg font-black text-emerald-400">RD$ {distanceCalcResult.suggestedFee}</span>
                        </div>
                      </div>

                      {distanceCalcResult.tierBreakdown && (
                        <p className="text-[10px] text-center text-emerald-300 font-bold bg-black/40 py-1 rounded-lg border border-emerald-500/20">
                          ⚡ {distanceCalcResult.tierBreakdown}
                        </p>
                      )}

                      <div className="flex flex-col sm:flex-row gap-2 pt-1">
                        <button
                          type="button"
                          onClick={handleApplyCalculatedShipping}
                          className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
                        >
                          <Check className="w-4 h-4" />
                          <span>Aplicar este Envío a la Cotización (RD$ {distanceCalcResult.suggestedFee})</span>
                        </button>

                        <a
                          href={distanceCalcResult.googleRouteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 border border-white/10"
                        >
                          <Navigation className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Ver Ruta Google Maps 🗺️</span>
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {/* Selector Manual de Zona o Tarifa Personalizada */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Zona / Tarifa de Envío RD (Manual):</label>
                    <select
                      value={selectedSector}
                      onChange={(e) => {
                        const sec = SECTORS.find((s) => s.name === e.target.value);
                        setSelectedSector(e.target.value);
                        if (sec) setDeliveryCost(sec.cost);
                      }}
                      className="w-full bg-[#080A10] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#FF1E27]"
                    >
                      {SECTORS.map((s, idx) => (
                        <option key={idx} value={s.name}>
                          {s.name} — {s.cost === 0 ? '¡GRATIS!' : `RD$ ${s.cost}`} ({s.time})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Descuento Especial (RD$):</label>
                    <input
                      type="number"
                      min="0"
                      value={extraDiscount}
                      onChange={(e) => setExtraDiscount(parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      className="w-full bg-[#080A10] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#FF1E27] font-mono font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Notas para el Mensajero / Empaque:</label>
                  <input
                    type="text"
                    value={quoteNotes}
                    onChange={(e) => setQuoteNotes(e.target.value)}
                    placeholder="Ej. Entregar después de las 3:00 PM o llevar cambio de RD$ 2,000"
                    className="w-full bg-[#080A10] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 outline-none focus:border-[#FF1E27]"
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Live WhatsApp Preview & Dispatch Actions (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              {/* WhatsApp Live Message Preview Card */}
              <div className="bg-[#0F131E] border border-white/10 rounded-2xl p-4 space-y-3 sticky top-28">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                      Vista Previa de Cotización
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">WhatsApp / RENACE</span>
                </div>

                {/* Formatted Message Box */}
                <div className="bg-[#07090E] border border-emerald-500/20 rounded-xl p-3.5 text-xs text-slate-200 font-mono whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto select-all">
                  {formattedQuoteText}
                </div>

                {/* Total Counter Box */}
                <div className="bg-gradient-to-r from-[#FF1E27]/20 to-sky-500/10 border border-[#FF1E27]/40 rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-slate-300 uppercase tracking-wider block">
                      Total a Cobrar al Cliente
                    </span>
                    <span className="text-2xl font-black text-white font-mono">
                      RD$ {total.toLocaleString()}
                    </span>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-[#FF1E27] text-white text-xs font-black uppercase tracking-wider">
                    COD RD
                  </span>
                </div>

                {/* Feedback Message */}
                {quoteSuccessMsg && (
                  <div className="p-3 bg-emerald-950/80 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-medium text-center animate-fade-in">
                    {quoteSuccessMsg}
                  </div>
                )}

                {createdOrderTicket && (
                  <div className="p-3 bg-sky-950/80 border border-sky-500/40 rounded-xl text-sky-300 text-xs font-medium text-center animate-fade-in">
                    🎉 Orden registrada: <strong>{createdOrderTicket}</strong>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-2">
                  {/* 1-Click Send to Whaticket API */}
                  <button
                    onClick={handleSendQuoteWhaticket}
                    disabled={isSendingQuote}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-900/30 transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
                  >
                    <Send className={`w-4 h-4 ${isSendingQuote ? 'animate-bounce' : ''}`} />
                    <span>{isSendingQuote ? 'Despachando...' : '1-Clic: Enviar por RENACE API'}</span>
                  </button>

                  {/* Direct WhatsApp Web Link */}
                  {customerPhone && (
                    <a
                      href={`https://wa.me/${customerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(formattedQuoteText)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 rounded-xl bg-[#141A28] hover:bg-[#1A2234] border border-white/10 text-emerald-400 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Abrir en WhatsApp Web / App</span>
                    </a>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    {/* Copy to Clipboard */}
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(formattedQuoteText);
                        showToast('📋 Cotización copiada al portapapeles');
                      }}
                      className="py-2.5 rounded-xl bg-[#141A28] hover:bg-[#1A2234] text-slate-200 border border-white/10 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                    >
                      <Copy className="w-3.5 h-3.5 text-sky-400" />
                      <span>Copiar Texto</span>
                    </button>

                    {/* Convert to COD Order */}
                    <button
                      onClick={handleConvertToOrder}
                      disabled={isConvertingOrder}
                      className="py-2.5 rounded-xl bg-[#FF1E27]/20 hover:bg-[#FF1E27]/30 border border-[#FF1E27]/50 text-[#FF414D] text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                    >
                      <Package className="w-3.5 h-3.5" />
                      <span>Crear Ticket COD</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: BANCO DE RESPUESTAS RÁPIDAS                         */}
        {/* ========================================================= */}
        {activeTab === 'replies' && (
          <div className="space-y-4">
            <div className="bg-[#0F131E] border border-white/10 rounded-2xl p-4">
              <h3 className="text-sm font-bold text-white mb-1">
                Banco de Respuestas Rápidas para RENACE & Instagram
              </h3>
              <p className="text-xs text-slate-400">
                Plantillas oficiales de atención personalizada con el nombre del asesor ({agentName}). Copia y envía en 1 clic.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {QUICK_REPLIES.map((reply) => (
                <div
                  key={reply.id}
                  className="bg-[#0E121D] border border-white/10 hover:border-white/20 rounded-2xl p-4 space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-md bg-[#FF1E27]/15 text-[#FF414D] font-mono text-[10px] font-bold">
                        {reply.shortcut}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">{reply.category}</span>
                    </div>
                    <h4 className="text-sm font-bold text-white">{reply.title}</h4>
                    <p className="text-xs text-slate-300 font-mono whitespace-pre-wrap bg-[#07090E] p-3 rounded-xl border border-white/5">
                      {reply.text}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(reply.text);
                      trackQuickReplyCopy(reply.shortcut, reply.title, agentName);
                      showToast(`✅ "${reply.title}" copiado`);
                    }}
                    className="w-full py-2 rounded-xl bg-[#141A28] hover:bg-[#1E273C] text-slate-200 text-xs font-bold border border-white/10 transition-all flex items-center justify-center gap-2"
                  >
                    <Copy className="w-3.5 h-3.5 text-sky-400" />
                    <span>Copiar Respuesta</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: GALERÍA MULTIMEDIA STAFF                           */}
        {/* ========================================================= */}
        {activeTab === 'album' && (
          <div className="space-y-4">
            {/* Album Toast */}
            {albumToast && (
              <div className="fixed top-20 right-4 z-50 bg-[#141A28] border border-amber-400/40 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-fade-in max-w-sm">
                <Camera className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{albumToast}</span>
              </div>
            )}

            {/* Header Bar */}
            <div className="bg-[#0F131E] border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white">Galería de Fotos & Contenido Staff</h3>
                <p className="text-xs text-slate-400">
                  Fotos en HD listas para copiar y pegar directo en WhatsApp, descargar o subir a historias.
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={loadAlbumItems}
                  disabled={isLoadingAlbum}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingAlbum ? 'animate-spin' : ''}`} />
                  Actualizar
                </button>
                <button
                  onClick={() => {
                    setShowShareUploadModal(true);
                    loadUploadLinks();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-sky-500/25"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Link de Subida Único</span>
                </button>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black flex items-center gap-1.5 shadow-md shadow-amber-500/25"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Subir Foto
                </button>
              </div>
            </div>

            {/* Search & Category Filter */}
            <div className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
                <input
                  type="text"
                  value={albumSearchQuery}
                  onChange={(e) => setAlbumSearchQuery(e.target.value)}
                  placeholder="Buscar fotos por título o etiqueta..."
                  className="w-full bg-[#0E121D] border border-white/10 focus:border-amber-400 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none"
                />
              </div>
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                {[
                  { id: 'all', label: 'Todas' },
                  { id: 'sneakers', label: '👟 Tenis' },
                  { id: 'combos', label: '🔥 Combos' },
                  { id: 'hoodies', label: '👕 Ropa' },
                  { id: 'store', label: '🏪 Tienda' },
                  { id: 'accessories', label: '🧢 Accesorios' },
                ].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setAlbumSelectedCategory(c.id)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all ${
                      albumSelectedCategory === c.id
                        ? 'bg-amber-500 text-black'
                        : 'bg-[#141A28] text-slate-400 hover:text-white'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Photos Grid */}
            {isLoadingAlbum ? (
              <div className="py-20 text-center space-y-3">
                <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
                <p className="text-sm font-semibold text-slate-400">Cargando fotos del álbum...</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {(() => {
                  // Build unified items list
                  let items = [];
                  if (albumItems.length > 0) {
                    items = albumItems.filter((item) => {
                      const matchesCat = albumSelectedCategory === 'all' || item.category === albumSelectedCategory;
                      const q = albumSearchQuery.toLowerCase().trim();
                      const matchesSearch =
                        q === '' ||
                        (item.title || '').toLowerCase().includes(q) ||
                        (Array.isArray(item.tags) && item.tags.some((t) => t.toLowerCase().includes(q)));
                      return matchesCat && matchesSearch;
                    });
                  } else {
                    // Fallback to product images
                    items = products
                      .flatMap((p) => (p.images || []).map((img) => ({ id: img, imageUrl: img, title: p.name, category: p.category, source: 'catalog' })))
                      .slice(0, 20);
                  }

                  if (items.length === 0) {
                    return (
                      <div className="col-span-4 py-16 text-center space-y-3">
                        <ImageIcon className="w-12 h-12 text-slate-600 mx-auto" />
                        <p className="text-sm font-bold text-white">No hay fotos que coincidan.</p>
                        <button onClick={() => { setAlbumSearchQuery(''); setAlbumSelectedCategory('all'); }} className="px-4 py-2 bg-amber-500 text-black text-xs font-black rounded-xl">Ver todas</button>
                      </div>
                    );
                  }

                  return items.map((item, idx) => {
                    const isCopied = copiedAlbumId === item.id;
                    return (
                      <div
                        key={item.id || idx}
                        className="bg-[#0E121D] border border-white/10 hover:border-amber-400/40 rounded-xl overflow-hidden group flex flex-col"
                      >
                        {/* Image */}
                        <div className="relative aspect-square overflow-hidden bg-black/50">
                          <img
                            src={item.imageUrl}
                            alt={item.title || 'Foto'}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                          {/* Category Badge */}
                          {item.category && (
                            <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-black/70 text-[10px] font-bold text-amber-300 backdrop-blur">
                              {item.category}
                            </span>
                          )}
                        </div>

                        {/* Info & Actions */}
                        <div className="p-2 space-y-2">
                          <p className="text-[11px] font-bold text-slate-200 truncate">{item.title || `Foto #${idx + 1}`}</p>
                          
                          {/* Copy to Clipboard (main action) */}
                          <button
                            onClick={() => handleCopyImageToClipboard(item)}
                            className={`w-full py-1.5 rounded-lg text-[11px] font-black flex items-center justify-center gap-1.5 transition-all ${
                              isCopied
                                ? 'bg-emerald-500 text-white'
                                : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black'
                            }`}
                            title="Copiar imagen para pegar directo en WhatsApp (Ctrl+V)"
                          >
                            {isCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            <span>{isCopied ? '¡Copiada!' : 'Copiar Foto'}</span>
                          </button>

                          {/* Download + Delete Row */}
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => handleDownloadPhoto(item)}
                              className="flex-1 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 text-[11px] font-bold flex items-center justify-center gap-1 transition-all"
                              title="Descargar foto HD"
                            >
                              <Download className="w-3 h-3" />
                              <span>Bajar HD</span>
                            </button>
                            {item.source === 'Subido por Asesora' && (
                              <button
                                onClick={() => handleDeleteAlbumItem(item.id)}
                                className="p-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/30 text-rose-400 transition-all"
                                title="Eliminar foto"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            )}

            {/* Upload Photo Modal */}
            {showUploadModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                <div className="bg-[#0F131E] border border-amber-500/40 w-full max-w-md rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xl">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                      <Camera className="w-4.5 h-4.5 text-amber-400" />
                      <h3 className="text-sm font-black text-white uppercase">Subir Foto al Álbum Staff</h3>
                    </div>
                    <button
                      onClick={() => setShowUploadModal(false)}
                      className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form onSubmit={handleUploadPhoto} className="space-y-3">
                    {/* File Picker */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-300 block mb-1">Seleccionar Imagen:</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        className="w-full text-xs text-slate-300 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-amber-500 file:text-black hover:file:bg-amber-400 cursor-pointer bg-[#07090E] p-2 rounded-2xl border border-white/10"
                      />
                    </div>

                    {/* Preview */}
                    {newPhotoPreview && (
                      <div className="relative aspect-video rounded-2xl overflow-hidden bg-black/60 border border-white/10">
                        <img src={newPhotoPreview} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}

                    {/* Title */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-300 block mb-1">Título del Modelo / Foto:</label>
                      <input
                        type="text"
                        placeholder="Ej. Tenis Retro Jordan 4 Black Cat (G5)"
                        value={newPhotoTitle}
                        onChange={(e) => setNewPhotoTitle(e.target.value)}
                        required
                        className="w-full bg-[#07090E] border border-white/10 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none"
                      />
                    </div>

                    {/* Category */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-300 block mb-1">Categoría:</label>
                      <select
                        value={newPhotoCategory}
                        onChange={(e) => setNewPhotoCategory(e.target.value)}
                        className="w-full bg-[#07090E] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                      >
                        <option value="sneakers">👟 Tenis & Sneakers</option>
                        <option value="combos">🩳 Combos & Boxers</option>
                        <option value="hoodies">👕 Ropa & Hoodies</option>
                        <option value="store">🏪 Tienda Física / Los Mina</option>
                        <option value="accessories">🧢 Accesorios & Gorras</option>
                      </select>
                    </div>

                    {/* Tags */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-300 block mb-1">Etiquetas (separadas por coma):</label>
                      <input
                        type="text"
                        placeholder="jordan, retro, g5, negro"
                        value={newPhotoTags}
                        onChange={(e) => setNewPhotoTags(e.target.value)}
                        className="w-full bg-[#07090E] border border-white/10 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none"
                      />
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowUploadModal(false)}
                        className="flex-1 py-2.5 bg-white/10 hover:bg-white/15 text-white font-bold text-xs rounded-xl"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={isUploadingPhoto || !newPhotoPreview}
                        className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-black font-black text-xs rounded-xl disabled:opacity-40 transition-all flex items-center justify-center gap-1.5 shadow-md"
                      >
                        {isUploadingPhoto ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                        <span>Guardar en Álbum</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}


        {/* ========================================================= */}
        {/* TAB 5: TARIFARIO DE ENVÍOS RD                             */}
        {/* ========================================================= */}
        {activeTab === 'shipping' && (
          <div className="space-y-4">
            <div className="bg-[#0F131E] border border-white/10 rounded-2xl p-4">
              <h3 className="text-sm font-bold text-white mb-1">
                Tarifario y Tiempos de Entrega COD República Dominicana
              </h3>
              <p className="text-xs text-slate-400">
                Tarifas estandarizadas de mensajería express y transporte interurbano desde Los Mina, Santo Domingo Este.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {SECTORS.map((sec, idx) => (
                <div
                  key={idx}
                  className="bg-[#0E121D] border border-white/10 rounded-xl p-4 flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <h4 className="text-xs sm:text-sm font-bold text-white">{sec.name}</h4>
                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                      <Clock className="w-3 h-3 text-sky-400" /> Tiempo: {sec.time}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm sm:text-base font-black text-[#FF414D] font-mono">
                      {sec.cost === 0 ? '¡GRATIS!' : `RD$ ${sec.cost}`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 6: MÉTRICAS & ANALYTICS PRO                           */}
        {/* ========================================================= */}
        {activeTab === 'metrics' && (
          <MetricsDashboard getAuthHeaders={getAuthHeaders} showToast={showToast} />
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0A0D15]/95 backdrop-blur-xl border-t border-white/10 px-2 py-1.5 flex items-center justify-around">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl text-[10px] font-bold ${
            activeTab === 'catalog' ? 'text-[#FF1E27]' : 'text-slate-400'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Stock</span>
        </button>

        <button
          onClick={() => setActiveTab('quoter')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl text-[10px] font-bold ${
            activeTab === 'quoter' ? 'text-[#FF1E27]' : 'text-slate-400'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Cotizar</span>
        </button>

        <button
          onClick={() => setActiveTab('replies')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl text-[10px] font-bold ${
            activeTab === 'replies' ? 'text-[#FF1E27]' : 'text-slate-400'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Respuestas</span>
        </button>

        <button
          onClick={() => setActiveTab('album')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl text-[10px] font-bold ${
            activeTab === 'album' ? 'text-[#FF1E27]' : 'text-slate-400'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Fotos</span>
        </button>

        <button
          onClick={() => setActiveTab('shipping')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl text-[10px] font-bold ${
            activeTab === 'shipping' ? 'text-[#FF1E27]' : 'text-slate-400'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Envíos</span>
        </button>

        <button
          onClick={() => setActiveTab('metrics')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl text-[10px] font-bold ${
            activeTab === 'metrics' ? 'text-[#FF1E27]' : 'text-slate-400'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Métricas</span>
        </button>
      </div>
      {/* Extension Installation Modal */}
      {showExtensionModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0E121D] border border-white/10 rounded-2xl max-w-lg w-full p-5 sm:p-6 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setShowExtensionModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                <Compass className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-white">
                  Extensión Chrome: RENACE Ubicaciones
                </h3>
                <p className="text-xs text-slate-400">
                  Calcula distancias y tarifas en 1 clic desde WhatsApp
                </p>
              </div>
            </div>

            {/* Download Action Card */}
            <div className="bg-gradient-to-r from-amber-500/10 to-amber-600/5 border border-amber-500/30 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-white block">
                  Paquete de la Extensión (.ZIP)
                </span>
                <span className="text-[11px] text-slate-400">
                  Listo para Google Chrome / Brave / Edge
                </span>
              </div>
              <a
                href={`/renace-extension.zip?v=${Date.now()}`}
                download="renace-ubicaciones-v1.2.0.zip"
                className="w-full sm:w-auto px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Descargar Extensión</span>
              </a>
            </div>

            {/* Step by step guide */}
            <div className="space-y-2.5">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Pasos para instalarla en Chrome (Toma 30 segundos):
              </span>

              <div className="space-y-2 text-xs text-slate-300">
                <div className="bg-[#141A28] border border-white/5 rounded-xl p-3 flex gap-3 items-start">
                  <span className="w-5 h-5 rounded-full bg-white/10 text-white font-black text-[11px] flex items-center justify-center shrink-0">
                    1
                  </span>
                  <div>
                    <strong className="text-white block">Descarga y descomprime el archivo</strong>
                    <span className="text-slate-400 text-[11px]">
                      Haz clic en el botón amarillo de arriba y descomprime la carpeta descargada.
                    </span>
                  </div>
                </div>

                <div className="bg-[#141A28] border border-white/5 rounded-xl p-3 flex gap-3 items-start">
                  <span className="w-5 h-5 rounded-full bg-white/10 text-white font-black text-[11px] flex items-center justify-center shrink-0">
                    2
                  </span>
                  <div>
                    <strong className="text-white block">Abre las extensiones en Chrome</strong>
                    <span className="text-slate-400 text-[11px]">
                      Escribe en la barra de Chrome <code className="bg-black/60 px-1 py-0.5 rounded text-amber-300">chrome://extensions/</code> y activa el interruptor <strong className="text-white">"Modo de desarrollador"</strong> (arriba a la derecha).
                    </span>
                  </div>
                </div>

                <div className="bg-[#141A28] border border-white/5 rounded-xl p-3 flex gap-3 items-start">
                  <span className="w-5 h-5 rounded-full bg-white/10 text-white font-black text-[11px] flex items-center justify-center shrink-0">
                    3
                  </span>
                  <div>
                    <strong className="text-white block">Cargar descomprimida</strong>
                    <span className="text-slate-400 text-[11px]">
                      Haz clic en el botón <strong className="text-white">"Cargar descomprimida"</strong> (arriba a la izquierda) y selecciona la carpeta <code className="bg-black/60 px-1 py-0.5 rounded text-amber-300">renace-ubicaciones</code>.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-white/5 flex justify-end">
              <button
                type="button"
                onClick={() => setShowExtensionModal(false)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Contact Sync Modal */}
      <ContactSyncModal
        isOpen={showContactSyncModal}
        onClose={() => setShowContactSyncModal(false)}
        getAuthHeaders={getAuthHeaders}
        showToast={showToast}
      />

      {/* Unique Upload Links Modal */}
      {showShareUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-[#0E121D] border border-white/10 rounded-2xl max-w-2xl w-full p-4 sm:p-6 space-y-5 shadow-2xl relative my-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400 shrink-0">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wider font-display">
                      Links de Subida Únicos
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-400 text-[10px] font-bold border border-sky-500/30">
                      1-Uso Seguro
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Crea enlaces temporales para que fotógrafos o asesores suban fotos HD directo al catálogo.
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowShareUploadModal(false);
                  setGeneratedLinkData(null);
                }}
                className="p-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sub-tabs */}
            <div className="flex items-center gap-2 border-b border-white/10 pb-2">
              <button
                onClick={() => setLinkModalTab('create')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  linkModalTab === 'create'
                    ? 'bg-sky-500 text-black shadow-md shadow-sky-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                + Generar Nuevo Link
              </button>
              <button
                onClick={() => {
                  setLinkModalTab('list');
                  loadUploadLinks();
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  linkModalTab === 'list'
                    ? 'bg-sky-500 text-black shadow-md shadow-sky-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>Historial de Enlaces</span>
                <span className="px-1.5 py-0.2 rounded-full bg-white/10 text-[10px] font-mono">
                  {uploadLinksList.length}
                </span>
              </button>
            </div>

            {/* TAB 1: CREATE LINK */}
            {linkModalTab === 'create' && (
              <div className="space-y-4">
                {generatedLinkData ? (
                  <div className="bg-gradient-to-br from-emerald-950/40 via-[#0C121E] to-sky-950/40 border border-emerald-500/40 rounded-2xl p-5 space-y-4 shadow-xl">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                      <span>¡Enlace listo para compartir!</span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-xs text-slate-400 block">
                        Destino: <strong className="text-white">{generatedLinkData.productName}</strong>
                      </span>
                      <span className="text-[11px] text-slate-400 block">
                        Expira el: <strong className="text-white font-mono">{new Date(generatedLinkData.expiresAt).toLocaleString()}</strong>
                      </span>
                    </div>

                    {/* URL Box */}
                    <div className="bg-black/60 border border-white/10 rounded-xl p-2.5 flex items-center justify-between gap-2">
                      <input
                        type="text"
                        readOnly
                        value={generatedLinkData.fullUrl}
                        className="bg-transparent text-xs text-sky-300 font-mono w-full outline-none select-all"
                      />
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(generatedLinkData.fullUrl);
                          showToast('✔ Enlace copiado al portapapeles');
                        }}
                        className="px-3 py-1.5 bg-sky-500 hover:bg-sky-400 text-black font-bold text-xs rounded-lg transition-colors shrink-0 flex items-center gap-1"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar</span>
                      </button>
                    </div>

                    {/* WhatsApp Action */}
                    <div className="flex flex-col sm:flex-row gap-2 pt-2">
                      <button
                        onClick={() => {
                          const waText = `📸 *¡Hola! Sube aquí las fotos de "${generatedLinkData.productName}":*\n👉 ${generatedLinkData.fullUrl}\n\n_Portal seguro oficial MVP FLOW BOUTIQUE._`;
                          navigator.clipboard.writeText(waText);
                          showToast('✔ Mensaje de WhatsApp copiado');
                        }}
                        className="flex-1 py-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>Copiar Mensaje para WhatsApp</span>
                      </button>

                      <a
                        href={generatedLinkData.fullUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2.5 bg-white/10 hover:bg-white/15 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
                      >
                        <ExternalLink className="w-4 h-4 text-sky-400" />
                        <span>Abrir Portal</span>
                      </a>
                    </div>

                    <div className="pt-2 text-right">
                      <button
                        onClick={() => setGeneratedLinkData(null)}
                        className="text-xs text-slate-400 hover:text-white underline"
                      >
                        Crear otro enlace
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleGenerateUploadLink} className="space-y-4">
                    {/* Product Selection */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                        Asignar a un Calzado / Drop:
                      </label>
                      <select
                        value={uploadLinkProductId}
                        onChange={(e) => setUploadLinkProductId(e.target.value)}
                        className="w-full bg-[#07090E] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-sky-500"
                      >
                        <option value="">Drop General / Fotos Múltiples de Tienda</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} · RD$ {Number(p.price).toLocaleString()} ({p.category})
                          </option>
                        ))}
                      </select>
                      <p className="text-[11px] text-slate-500">
                        Si seleccionas un modelo específico, las fotos se adjuntan automáticamente a su ficha en el catálogo.
                      </p>
                    </div>

                    {/* Custom Note */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                        Instrucción o Nota para quien tomará las fotos:
                      </label>
                      <input
                        type="text"
                        value={uploadLinkNote}
                        onChange={(e) => setUploadLinkNote(e.target.value)}
                        placeholder="Ej: Tomar fotos con luz de día, lado lateral y suela limpia..."
                        className="w-full bg-[#07090E] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-sky-500"
                      />
                    </div>

                    {/* Expiry Options */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                        Tiempo de Vigencia del Enlace:
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                          { id: '1', label: '1 Hora' },
                          { id: '12', label: '12 Horas' },
                          { id: '24', label: '24 Horas (Recomendado)' },
                          { id: '72', label: '3 Días' },
                        ].map((exp) => (
                          <button
                            type="button"
                            key={exp.id}
                            onClick={() => setUploadLinkExpiry(exp.id)}
                            className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all ${
                              uploadLinkExpiry === exp.id
                                ? 'bg-sky-500/20 border-sky-500 text-sky-300 shadow-md shadow-sky-500/10'
                                : 'bg-[#07090E] border-white/10 text-slate-400 hover:text-white'
                            }`}
                          >
                            {exp.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isCreatingLink}
                      className="w-full py-3 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>{isCreatingLink ? 'Generando Enlace...' : '⚡ Generar Enlace Único de Subida'}</span>
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* TAB 2: LINKS LIST */}
            {linkModalTab === 'list' && (
              <div className="space-y-3">
                {isLoadingUploadLinks ? (
                  <div className="py-12 text-center text-slate-400 text-xs">
                    Cargando enlaces generados...
                  </div>
                ) : uploadLinksList.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 text-xs">
                    No has generado enlaces de subida aún.
                  </div>
                ) : (
                  <div className="max-h-72 overflow-y-auto space-y-2.5 pr-1">
                    {uploadLinksList.map((link) => {
                      const isExpired = new Date(link.expiresAt) < new Date();
                      const fullUrl = `${window.location.origin}/subir-fotos?token=${link.token}`;
                      return (
                        <div
                          key={link.token}
                          className="bg-[#07090E] border border-white/5 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                        >
                          <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <strong className="text-white truncate block">{link.productName}</strong>
                              {link.isUsed ? (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold border border-emerald-500/30">
                                  ✔ Utilizado ({link.uploadedPhotosCount || 1} fotos)
                                </span>
                              ) : isExpired ? (
                                <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 font-mono text-[10px] font-bold border border-rose-500/30">
                                  Expirado
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-400 font-mono text-[10px] font-bold border border-sky-500/30">
                                  Activo (Válido)
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-2">
                              <span>Por: {link.createdBy}</span>
                              <span>•</span>
                              <span>Expira: {new Date(link.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({new Date(link.expiresAt).toLocaleDateString()})</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {!link.isUsed && !isExpired && (
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(fullUrl);
                                  showToast('✔ Enlace copiado al portapapeles');
                                }}
                                className="p-2 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 transition-colors"
                                title="Copiar enlace"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <a
                              href={fullUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
                              title="Abrir en pestaña"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                            <button
                              onClick={() => handleRevokeUploadLink(link.token)}
                              className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors"
                              title="Revocar enlace"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CatalogApp;
