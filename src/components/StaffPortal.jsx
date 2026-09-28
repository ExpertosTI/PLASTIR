import React, { useState, useMemo, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
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
  Image,
  Upload,
  Download,
  Camera,
  FileImage,
  Share2,
  Film
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { DOMINICAN_ZONES } from '../data/locationsRD';
import { 
  MVP_STORE_LOCATION, 
  NEIGHBORHOOD_PRESETS, 
  calculateShippingQuote, 
  extractCoordinates 
} from '../utils/distanceCalculator';

const QUICK_REPLIES = [
  {
    shortcut: 'bienvenida',
    title: 'Saludo & Bienvenida Oficial',
    message: `¡Hola! 👋✨ Bienvenido a *PLASTIR RD* — Tienda por departamentos de artículos para el hogar y plásticos en Av. San Vicente de Paúl No. 108, Los Mina, Santo Domingo Este.\n\nTe atiende el equipo oficial de ventas. ¿En qué artículo, gavetero o producto para el hogar te podemos ayudar hoy? 🏡📦`,
  },
  {
    shortcut: 'envio',
    title: 'Política de Envíos y Tiempos de Entrega',
    message: `🛵 *ENVÍOS Y ENTREGAS PLASTIR RD:*
• *Santo Domingo (DN y SDE):* Entrega el mismo día (2 a 4 horas) por mensajería express COD.
• *Interior del país:* 24 a 48 horas con envío asegurado.
• *Pago Contra Entrega (COD):* Pagas en efectivo o transferencia al recibir tu paquete en mano.`,
  },
  {
    shortcut: 'pago',
    title: 'Métodos de Pago Aceptados',
    message: `💵 *FORMAS DE PAGO:*
1. *Efectivo contra entrega (COD)* al recibir en tus manos.
2. *Transferencia bancaria instantánea:*
   • Banreservas / Popular / BHD
3. *Tarjeta de crédito/débito* en tienda física.`,
  },
  {
    shortcut: 'garantia',
    title: 'Garantía de Calidad y Libre de BPA',
    message: `🛡️ *GARANTÍA PLASTIR RD:*
Todos nuestros productos son plásticos vírgenes certificados *100% libres de BPA* y con garantía de durabilidad. Puedes verificar tu paquete antes de pagarle al mensajero.`,
  },
  {
    shortcut: 'tienda',
    title: 'Ubicación de Tienda Física',
    message: `📍 *UBICACIÓN TIENDA FÍSICA PLASTIR RD:*
Av. San Vicente de Paúl No. 108, Los Mina, Santo Domingo Este (próximo a estación Metro Trina de Moya).
🕒 *Horario:* Lunes a Sábado de 8:00 AM a 7:00 PM, Domingos de 9:00 AM a 2:00 PM.
🗺️ *Google Maps:* https://maps.google.com/?q=Av.+San+Vicente+de+Pa%C3%BAl+No.+108,+Santo+Domingo+Este`,
  },
];

const STAFF_PASSCODE = 'PlastirAdmin2026!';
const AUTH_STORAGE_KEY = 'plastir_staff_auth_v1';

const SECTORS = [
  { name: 'Santo Domingo Este (Los Mina, San Vicente, Invivienda)', cost: 200, time: '2 a 4 hrs' },
  { name: 'Distrito Nacional (Naco, Piantini, Bella Vista, Gazcue)', cost: 250, time: '2 a 4 hrs' },
  { name: 'Santo Domingo Norte / Oeste (Villa Mella, Herrera, Alcarrizos)', cost: 300, time: 'Mismo día' },
  { name: 'Santiago de los Caballeros', cost: 350, time: '24 hrs Express' },
  { name: 'San Cristóbal / Baní', cost: 300, time: '24 hrs' },
  { name: 'Zona Este (La Romana, San Pedro, Punta Cana)', cost: 350, time: '24 hrs' },
  { name: 'Resto del País (Caribe Tour / Metro Pac / Aptra)', cost: 350, time: '24 hrs' },
  { name: 'Personalizado / Gratis', cost: 0, time: 'Acordado' },
];

export const StaffPortal = ({ isOpen, onClose, allProducts = [] }) => {
  const { formatMoney } = useCart();
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return localStorage.getItem(AUTH_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState(false);

  // Tabs: 'catalog' | 'quoter' | 'replies'
  const [activeTab, setActiveTab] = useState('catalog');

  // Search & Filter in Catalog Tab
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [copiedId, setCopiedId] = useState(null);

  // ==========================================
  // ADVANCED COTIZADOR STATE (FULL LEVEL)
  // ==========================================
  const [agentName, setAgentName] = useState(() => localStorage.getItem('plastir_agent_name') || localStorage.getItem('mvpflow_agent_name') || 'Asesor Plastir');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');

  // Whaticket Open Conversations
  const [whaticketTickets, setWhaticketTickets] = useState([]);
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);

  // Live product search inside Cotizador
  const [quoterSearchQuery, setQuoterSearchQuery] = useState('');
  const [activeQuoterProduct, setActiveQuoterProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('Estándar');
  const [selectedColor, setSelectedColor] = useState('Original');
  const [itemQuantity, setItemQuantity] = useState(1);
  const [customItemPrice, setCustomItemPrice] = useState('');

  // Multi-item Quote List
  const [quoteItems, setQuoteItems] = useState([]);

  // ==========================================
  // GOOGLE MAPS KM DISTANCE CALCULATOR STATE
  // ==========================================
  const [mapsLocationInput, setMapsLocationInput] = useState('');
  const [pricePerKm, setPricePerKm] = useState(35);
  const [minBaseFee, setMinBaseFee] = useState(200);
  const [distanceCalcResult, setDistanceCalcResult] = useState(null);
  const [calcError, setCalcError] = useState(null);
  const [showDistanceSection, setShowDistanceSection] = useState(true);

  // Shipping, Discount & Notes
  const [selectedSector, setSelectedSector] = useState(SECTORS[0].name);
  const [deliveryCost, setDeliveryCost] = useState(SECTORS[0].cost);
  const [extraDiscount, setExtraDiscount] = useState(0);
  const [quoteNotes, setQuoteNotes] = useState('');

  // Feedback & Action states
  const [isSendingQuote, setIsSendingQuote] = useState(false);
  const [quoteSuccessMsg, setQuoteSuccessMsg] = useState(null);
  const [isConvertingOrder, setIsConvertingOrder] = useState(false);
  const [createdOrderTicket, setCreatedOrderTicket] = useState(null);

  // Initial load of first product into Cotizador if empty
  useEffect(() => {
    if (allProducts.length > 0 && !activeQuoterProduct) {
      handleSelectQuoterProduct(allProducts[0]);
    }
  }, [allProducts, activeQuoterProduct]);

  // Load Whaticket open tickets when entering Cotizador
  useEffect(() => {
    if (isAuthenticated && activeTab === 'quoter') {
      loadWhaticketTickets();
    }
  }, [isAuthenticated, activeTab]);

  const loadWhaticketTickets = async () => {
    setIsLoadingTickets(true);
    try {
      const token = sessionStorage.getItem('plastir_admin_token') || sessionStorage.getItem('mvpflow_admin_token') || '';
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
    } catch (err) {
      console.error('Error loading whaticket tickets:', err);
    } finally {
      setIsLoadingTickets(false);
    }
  };
  // ==========================================
  // ÁLBUM DE FOTOS / MULTIMEDIA STAFF STATE
  // ==========================================
  const [albumItems, setAlbumItems] = useState([]);
  const [isLoadingAlbum, setIsLoadingAlbum] = useState(false);
  const [albumSearchQuery, setAlbumSearchQuery] = useState('');
  const [albumSelectedCategory, setAlbumSelectedCategory] = useState('all');
  const [copiedAlbumId, setCopiedAlbumId] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newPhotoTitle, setNewPhotoTitle] = useState('');
  const [newPhotoCategory, setNewPhotoCategory] = useState('sneakers');
  const [newPhotoTags, setNewPhotoTags] = useState('');
  const [newPhotoPreview, setNewPhotoPreview] = useState('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [albumToast, setAlbumToast] = useState(null);

  // Load Album photos from backend
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
    } catch (e) {
      console.error('Error loading album items:', e);
    } finally {
      setIsLoadingAlbum(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadAlbumItems();
    }
  }, [isAuthenticated, activeTab]);

  const handleCopyImageToClipboard = async (item) => {
    setCopiedAlbumId(item.id);
    setAlbumToast(`📸 Copiando "${item.title || 'Foto'}" al portapapeles...`);

    // Determine CORS-safe image URL
    const targetUrl = item.imageUrl.startsWith('http')
      ? `/api/image-proxy?url=${encodeURIComponent(item.imageUrl)}`
      : item.imageUrl;

    try {
      // 1. Try fetching via Proxy / direct fetch as Blob
      const response = await fetch(targetUrl);
      if (!response.ok) throw new Error('Fetch failed');
      const imageBlob = await response.blob();

      // Convert to standard PNG Blob via ImageBitmap / Canvas for maximum clipboard compatibility
      const imgBitmap = await createImageBitmap(imageBlob);
      const canvas = document.createElement('canvas');
      canvas.width = imgBitmap.width;
      canvas.height = imgBitmap.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(imgBitmap, 0, 0);

      canvas.toBlob(async (pngBlob) => {
        if (pngBlob && navigator.clipboard && window.ClipboardItem) {
          try {
            await navigator.clipboard.write([
              new ClipboardItem({ 'image/png': pngBlob })
            ]);
            setAlbumToast(`✔ ¡Foto de "${item.title || 'Producto'}" copiada! Pégala en WhatsApp con Ctrl+V.`);
            setTimeout(() => {
              setCopiedAlbumId(null);
              setAlbumToast(null);
            }, 4000);
            return;
          } catch (clipErr) {
            console.log('Clipboard direct blob write fallback:', clipErr);
          }
        }
        
        // Fallback: Copy direct URL
        await navigator.clipboard.writeText(item.imageUrl);
        setAlbumToast(`✔ ¡Enlace de "${item.title}" copiado al portapapeles!`);
        setTimeout(() => {
          setCopiedAlbumId(null);
          setAlbumToast(null);
        }, 3000);
      }, 'image/png');

    } catch (fetchErr) {
      console.warn('Canvas/fetch copy fallback:', fetchErr);
      try {
        await navigator.clipboard.writeText(item.imageUrl);
        setAlbumToast(`✔ ¡Enlace de "${item.title}" copiado al portapapeles!`);
      } catch {}
      setTimeout(() => {
        setCopiedAlbumId(null);
        setAlbumToast(null);
      }, 3000);
    }
  };

  const handleDownloadPhoto = (item) => {
    const a = document.createElement('a');
    a.href = item.imageUrl;
    a.download = `${(item.title || 'foto-plastir').replace(/[^a-zA-Z0-9_-]/g, '_')}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setAlbumToast(`✔ Descargando foto HD de "${item.title || 'Producto'}"...`);
    setTimeout(() => setAlbumToast(null), 2500);
  };

  const getAuthHeaders = () => {
    const token = sessionStorage.getItem('plastir_admin_token') || localStorage.getItem('plastir_admin_token') || sessionStorage.getItem('mvpflow_admin_token') || '';
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
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
          imageUrl: newPhotoPreview
        })
      });
      const data = await res.json();
      if (data.success && data.item) {
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
      reader.onload = (uploadEvent) => {
        setNewPhotoPreview(uploadEvent.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

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
        try {
          localStorage.setItem(AUTH_STORAGE_KEY, 'true');
          sessionStorage.setItem('plastir_admin_token', data.token);
          localStorage.setItem('plastir_admin_token', data.token);
        } catch {}
        return;
      }
    } catch {}

    setAuthError(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      sessionStorage.removeItem('plastir_admin_token');
      localStorage.removeItem('plastir_admin_token');
      sessionStorage.removeItem('mvpflow_admin_token');
      localStorage.removeItem('mvpflow_admin_token');
    } catch {}
  };

  // Filter products for Catalog Tab
  const filteredCatalogProducts = useMemo(() => {
    return allProducts.filter((p) => {
      const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch =
        term === '' ||
        p.name.toLowerCase().includes(term) ||
        (p.sku && p.sku.toLowerCase().includes(term)) ||
        (p.description && p.description.toLowerCase().includes(term));
      return matchesCategory && matchesSearch;
    });
  }, [allProducts, selectedCategory, searchTerm]);

  // Filter products for Cotizador live search dropdown
  const filteredQuoterProducts = useMemo(() => {
    if (!quoterSearchQuery.trim()) {
      return allProducts.slice(0, 10);
    }
    const q = quoterSearchQuery.toLowerCase().trim();
    return allProducts.filter((p) =>
      p.name?.toLowerCase().includes(q) ||
      p.sku?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q)
    );
  }, [allProducts, quoterSearchQuery]);

  // Filter album items by search and category
  const filteredAlbumItems = useMemo(() => {
    return albumItems.filter((item) => {
      const matchesCategory = albumSelectedCategory === 'all' || item.category === albumSelectedCategory;
      const term = albumSearchQuery.toLowerCase().trim();
      const matchesSearch =
        term === '' ||
        (item.title && item.title.toLowerCase().includes(term)) ||
        (Array.isArray(item.tags) && item.tags.some((t) => t.toLowerCase().includes(term)));
      return matchesCategory && matchesSearch;
    });
  }, [albumItems, albumSelectedCategory, albumSearchQuery]);

  // Select a product to configure in Cotizador
  const handleSelectQuoterProduct = (prod) => {
    setActiveQuoterProduct(prod);
    setSelectedSize(prod.sizes?.[0] || '40 (8)');
    setSelectedColor(prod.colors?.[0]?.name || 'Original');
    setCustomItemPrice(String(prod.price));
    setItemQuantity(1);
  };

  // Add configured product to the Cotizador items list
  const handleAddItemToQuote = () => {
    if (!activeQuoterProduct) return;

    const price = Number(customItemPrice) > 0 ? Number(customItemPrice) : activeQuoterProduct.price;
    const newItem = {
      id: `${activeQuoterProduct.id}-${selectedSize}-${selectedColor}-${Date.now()}`,
      productId: activeQuoterProduct.id,
      name: activeQuoterProduct.name,
      price: price,
      size: selectedSize,
      color: selectedColor,
      quantity: Number(itemQuantity) || 1,
      image: activeQuoterProduct.images?.[0] || '/img/drop-1.jpg',
      stock: activeQuoterProduct.stockLeft || activeQuoterProduct.qtyAvailable || 0,
    };

    setQuoteItems((prev) => [...prev, newItem]);
  };

  // Remove item from Cotizador
  const handleRemoveQuoteItem = (itemId) => {
    setQuoteItems((prev) => prev.filter((it) => it.id !== itemId));
  };

  // Start quote directly from Catalog Tab
  const handleStartQuoteFromCatalog = (product) => {
    handleSelectQuoterProduct(product);
    const defaultItem = {
      id: `${product.id}-${Date.now()}`,
      productId: product.id,
      name: product.name,
      price: Number(product.price),
      size: product.sizes?.[0] || '40 (8)',
      color: product.colors?.[0]?.name || 'Original',
      quantity: 1,
      image: product.images?.[0] || '/img/drop-1.jpg',
      stock: product.stockLeft || product.qtyAvailable || 0,
    };
    setQuoteItems([defaultItem]);
    setActiveTab('quoter');
  };

  // Calculate Great-Circle Distance from pasted Google Maps location
  const handleCalculateDistance = (inputString = mapsLocationInput) => {
    setCalcError(null);
    const input = (inputString || '').trim();
    if (!input) {
      setCalcError('Pega un enlace de Google Maps, ubicación de WhatsApp o coordenadas.');
      return;
    }

    const result = calculateShippingQuote({
      destinationInput: input,
      pricePerKm: Number(pricePerKm) || 25,
      minBaseFee: Number(minBaseFee) || 150,
    });

    if (result.success) {
      setDistanceCalcResult(result);
    } else {
      setCalcError(result.error);
    }
  };

  // Apply distance calculator result to the quote
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
    setTimeout(() => setQuoteSuccessMsg(null), 3500);
  };

  // Quick Preset Selection
  const handleSelectPresetNeighborhood = (preset) => {
    const coordString = `${preset.lat}, ${preset.lng}`;
    setMapsLocationInput(coordString);
    handleCalculateDistance(coordString);
  };

  // Calculate totals
  const subtotal = useMemo(() => {
    return quoteItems.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);
  }, [quoteItems]);

  const totalCalculated = Math.max(0, subtotal - Number(extraDiscount || 0) + Number(deliveryCost || 0));

  // Generate formatted commercial WhatsApp pitch
  const generateQuoteText = () => {
    const itemsList = quoteItems.length > 0
      ? quoteItems.map((item, idx) => 
          `${idx + 1}. 👟 *${item.name}*\n   • Talla: *${item.size}* | Color: *${item.color}*\n   • Cantidad: ${item.quantity} x RD$ ${Number(item.price).toLocaleString('es-DO')} = *RD$ ${Number(item.price * item.quantity).toLocaleString('es-DO')}*`
        ).join('\n\n')
      : `1. 👟 *${activeQuoterProduct?.name || 'Producto'}*\n   • Talla: *${selectedSize}* | Color: *${selectedColor}*\n   • Precio: *RD$ ${Number(customItemPrice || activeQuoterProduct?.price || 0).toLocaleString('es-DO')}*`;

    return (
      `⚡ *COTIZACIÓN OFICIAL — MVP FLOW BOUTIQUE RD* ⚡\n` +
      `Hola ${customerName ? `*${customerName}*` : 'mi líder'}, aquí tienes el detalle de tu cotización express:\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━━\n` +
      `🛍️ *MERCANCÍA SELECCIONADA:*\n` +
      `━━━━━━━━━━━━━━━━━━━━━━\n\n` +
      `${itemsList}\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━━\n` +
      `💰 *DETALLE DEL PAGO:*\n` +
      `━━━━━━━━━━━━━━━━━━━━━━\n` +
      `• Subtotal: RD$ ${Number(subtotal || customItemPrice || 0).toLocaleString('es-DO')}\n` +
      (extraDiscount > 0 ? `• Descuento Especial: - RD$ ${Number(extraDiscount).toLocaleString('es-DO')}\n` : '') +
      `• Envío Express (${selectedSector}): ${Number(deliveryCost) === 0 ? '*¡GRATIS (RD$ 0)!*' : `*RD$ ${Number(deliveryCost).toLocaleString('es-DO')}*`}\n` +
      (distanceCalcResult ? `• Distancia Calculada: *${distanceCalcResult.distanceKm} km* (Ruta desde Los Mina)\n` : '') +
      `\n👉 *TOTAL A PAGAR AL RECIBIR (COD): RD$ ${totalCalculated.toLocaleString('es-DO')}*\n\n` +
      `📍 *Destino:* ${selectedSector} ${customerAddress ? `(${customerAddress})` : ''}\n` +
      `🛵 *Tiempo de entrega:* ${distanceCalcResult ? distanceCalcResult.estimatedTime : '2 a 4 horas en Santo Domingo / 24h interior'}.\n` +
      `🛡️ *Garantía G5:* Calidad garantizada con caja original. Pagas en efectivo al recibir y verificar en mano.\n\n` +
      `¿Deseas que programemos el despacho de tu pedido ahora mismo? 📦💨`
    );
  };

  // Copy full quote to clipboard
  const handleCopyQuote = () => {
    const text = generateQuoteText();
    navigator.clipboard.writeText(text);
    setQuoteSuccessMsg('¡Cotización copiada al portapapeles!');
    setTimeout(() => setQuoteSuccessMsg(null), 3000);
  };

  // Send via Whaticket API and fallback to WhatsApp
  const handleSendWhaticket = async () => {
    if (isSendingQuote) return;
    const cleanPhone = customerPhone.replace(/\D/g, '');
    const quoteText = generateQuoteText();

    setIsSendingQuote(true);

    // 1. Envío directo por API de Whaticket si hay teléfono
    if (cleanPhone.length >= 10) {
      try {
        const token = sessionStorage.getItem('plastir_admin_token') || sessionStorage.getItem('mvpflow_admin_token') || '';
        const headers = {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        };

        const res = await fetch('/api/whaticket/send-quote', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            phoneNumber: cleanPhone,
            customerName: customerName || 'Cliente MVP Flow',
            agentName: agentName,
            quoteData: {
              quoteNumber: `COT-${Date.now().toString().slice(-4)}`,
              items: quoteItems.length > 0 ? quoteItems : [{
                name: activeQuoterProduct?.name,
                price: Number(customItemPrice || activeQuoterProduct?.price),
                quantity: itemQuantity,
                size: selectedSize,
                color: selectedColor
              }],
              subtotal: subtotal || Number(customItemPrice),
              shippingCost: Number(deliveryCost),
              discount: Number(extraDiscount || 0),
              total: totalCalculated,
              deliveryZone: selectedSector,
              deliveryTime: distanceCalcResult?.estimatedTime || '2 a 4 horas (COD)',
              paymentMethod: 'Pago Contra Entrega (Efectivo / Transferencia)',
              notes: quoteNotes
            }
          })
        });

        const data = await res.json();
        if (data.success) {
          setQuoteSuccessMsg('✔ ¡Cotización enviada a Whaticket exitosamente!');
          setTimeout(() => setQuoteSuccessMsg(null), 4000);
          setIsSendingQuote(false);
          return;
        }
      } catch (err) {
        console.error('Error enviando cotización por Whaticket API:', err);
      }
    }

    // 2. Fallback a WhatsApp Directo
    const targetUrl = cleanPhone.length >= 10
      ? `https://api.whatsapp.com/send?phone=${cleanPhone.startsWith('1') ? cleanPhone : '1' + cleanPhone}&text=${encodeURIComponent(quoteText)}`
      : `https://api.whatsapp.com/send?phone=18096560219&text=${encodeURIComponent(quoteText)}`;

    window.open(targetUrl, '_blank');
    setIsSendingQuote(false);
  };

  // Convert Quote into a real COD order in the database
  const handleConvertToOrder = async () => {
    if (isConvertingOrder) return;
    setIsConvertingOrder(true);

    try {
      const itemsToOrder = quoteItems.length > 0 ? quoteItems : [{
        id: activeQuoterProduct?.id,
        name: activeQuoterProduct?.name,
        price: Number(customItemPrice || activeQuoterProduct?.price),
        size: selectedSize,
        color: selectedColor,
        quantity: itemQuantity,
        image: activeQuoterProduct?.images?.[0]
      }];

      const trackingId = `TRA-${Math.floor(100000 + Math.random() * 900000)}`;

      const orderPayload = {
        trackingId,
        customer: {
          name: customerName || 'Cliente Asesoría',
          phone: customerPhone || '8096560219',
          email: ''
        },
        shipping: {
          address: customerAddress || 'Acordada con vendedor',
          municipality: selectedSector,
          zoneName: selectedSector,
          cost: Number(deliveryCost)
        },
        payment: {
          method: 'cod',
          subtotal: subtotal || Number(customItemPrice),
          shippingCost: Number(deliveryCost),
          discount: Number(extraDiscount || 0),
          total: totalCalculated
        },
        items: itemsToOrder,
        notes: `Cotización convertida por asesora ${agentName}. ${quoteNotes} ${distanceCalcResult ? `(Ruta Google Maps: ${distanceCalcResult.distanceKm} km)` : ''}`,
        date: new Date().toISOString()
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      if (res.ok) {
        setCreatedOrderTicket(trackingId);
        setQuoteSuccessMsg(`✔ ¡Pedido #${trackingId} creado en el sistema con despacho COD!`);
      }
    } catch (err) {
      alert('Error creando el pedido: ' + err.message);
    } finally {
      setIsConvertingOrder(false);
    }
  };

  // Copy commercial pitch to clipboard from Catalog Tab
  const handleCopyPitch = (product) => {
    const stockCount = product.stockLeft || product.qtyAvailable || 0;
    const pitch = `🔥 *${product.name.toUpperCase()}* 🔥
💵 *Precio Especial:* RD$ ${Number(product.price).toLocaleString('es-DO')}
📦 *Stock disponible:* ${stockCount} pares en mano
📏 *Tallas disponibles:* ${(product.sizes || []).slice(0, 6).join(', ')}
🛵 *Envío Express:* Mismo día en Santo Domingo (Pago Contra Entrega COD).
🛡️ *Garantía G5 con caja original.*

¿Qué talla te apartamos para envío hoy? 👟`;

    navigator.clipboard.writeText(pitch);
    setCopiedId(product.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/90 backdrop-blur-xl animate-fade-in overflow-hidden">
      <div className="relative w-full h-full sm:h-auto sm:max-h-[94vh] sm:max-w-6xl bg-mvp-dark sm:border sm:border-amber-500/40 sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-amber-950/60 via-mvp-card to-amber-950/50 border-b border-amber-500/30 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-400 flex-shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.25)]">
              <ShieldCheck size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-black text-white font-display tracking-wider">PORTAL DE VENTAS & STOCK</h2>
                <span className="bg-amber-500 text-black text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 rounded-full uppercase">Staff Only</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Conectado a Odoo ERP • {allProducts.length} Productos en Vivo</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="text-[11px] font-bold text-mvp-muted hover:text-white px-2.5 py-1 rounded-lg border border-white/10"
              >
                Cerrar Sesión
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Auth Gate */}
        {!isAuthenticated ? (
          <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
            <form onSubmit={handleLogin} className="w-full max-w-md bg-mvp-card border border-amber-500/30 rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-2xl">
              <div className="w-14 h-14 mx-auto rounded-full bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-400">
                <ShieldCheck size={28} />
              </div>
              <div>
                <h3 className="text-lg font-black text-white uppercase font-display">Acceso al Portal del Personal</h3>
                <p className="text-xs text-mvp-silver mt-1">Ingresa la contraseña para ver existencias de Odoo, cotizador express y atajos.</p>
              </div>

              <div>
                <input
                  type="password"
                  placeholder="Introduce tu contraseña de acceso"
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    setAuthError(false);
                  }}
                  className="w-full bg-mvp-black border border-white/10 focus:border-amber-400 rounded-2xl px-4 py-3 text-sm text-white text-center tracking-widest focus:outline-none"
                  autoFocus
                />
                {authError && (
                  <p className="text-xs text-rose-500 font-bold mt-2">Contraseña incorrecta. Contacta al administrador.</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-black text-sm rounded-2xl transition-all shadow-[0_4px_20px_rgba(245,158,11,0.4)] hover:scale-[1.02] active:scale-[0.98]"
              >
                INGRESAR AL PORTAL
              </button>
            </form>
          </div>
        ) : (
          /* Main Authenticated Interface */
          <div className="flex flex-col flex-1 overflow-hidden">
            
            {/* Tabs Bar */}
            <div className="flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-2.5 bg-mvp-black/70 border-b border-white/10 overflow-x-auto no-scrollbar flex-shrink-0">
              <button
                onClick={() => setActiveTab('catalog')}
                className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-black transition-all flex-shrink-0 ${
                  activeTab === 'catalog'
                    ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.35)]'
                    : 'text-mvp-silver hover:text-white bg-white/5'
                }`}
              >
                <Package size={14} />
                <span>CATÁLOGO & STOCK ({allProducts.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('quoter')}
                className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-black transition-all flex-shrink-0 ${
                  activeTab === 'quoter'
                    ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.35)]'
                    : 'text-mvp-silver hover:text-white bg-white/5'
                }`}
              >
                <Calculator size={14} />
                <span>COTIZADOR EXPRESS & CALCULADOR KM</span>
                {quoteItems.length > 0 && (
                  <span className="bg-mvp-red text-white text-[10px] px-1.5 py-0.2 rounded-full font-black ml-1">
                    {quoteItems.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('album')}
                className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-black transition-all flex-shrink-0 ${
                  activeTab === 'album'
                    ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.35)]'
                    : 'text-mvp-silver hover:text-white bg-white/5'
                }`}
              >
                <Image size={14} />
                <span>📸 ÁLBUM FOTOS ({albumItems.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('replies')}
                className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-black transition-all flex-shrink-0 ${
                  activeTab === 'replies'
                    ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.35)]'
                    : 'text-mvp-silver hover:text-white bg-white/5'
                }`}
              >
                <MessageSquare size={14} />
                <span>ATAJOS DE VENTA (/)</span>
              </button>

              <a
                href="/subir-historias"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-black transition-all flex-shrink-0 bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 text-white shadow-md hover:opacity-95"
                title="Subir Historias y Shorts de Video (TikTok / Instagram)"
              >
                <Film size={14} />
                <span>🎬 SUBIR HISTORIAS / TIKTOK</span>
              </a>
            </div>

            {/* TAB 1: CATALOG & STOCK */}
            {activeTab === 'catalog' && (
              <div className="flex-1 flex flex-col overflow-hidden p-3 sm:p-5">
                {/* Search & Category Filter Bar */}
                <div className="flex flex-col sm:flex-row gap-2 mb-3 flex-shrink-0">
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-2.5 text-mvp-muted" size={15} />
                    <input
                      type="text"
                      placeholder="Buscar por modelo, marca, SKU o código en Odoo..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-mvp-black border border-white/10 focus:border-amber-400 rounded-xl py-2 pl-10 pr-4 text-xs text-white placeholder-mvp-muted focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
                    {[
                      { id: 'all', label: 'Todos' },
                      { id: 'sneakers', label: 'Sneakers' },
                      { id: 'combos', label: 'Combos' },
                      { id: 'hoodies', label: 'Ropa Urbana' },
                      { id: 'accessories', label: 'Accesorios' },
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                          selectedCategory === cat.id
                            ? 'bg-amber-500 text-black'
                            : 'bg-white/5 text-mvp-silver hover:text-white'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Products Grid */}
                <div className="flex-1 overflow-y-auto pr-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3">
                    {filteredCatalogProducts.map((p) => {
                      const stockCount = p.stockLeft || p.qtyAvailable || 0;
                      return (
                        <div
                          key={p.id}
                          className="bg-mvp-card border border-white/10 hover:border-amber-400/50 rounded-2xl p-2.5 sm:p-3 transition-all flex flex-col justify-between"
                        >
                          <div className="flex gap-2.5 items-start">
                            <img
                              src={p.images?.[0]}
                              alt={p.name}
                              className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover bg-black flex-shrink-0 border border-white/10"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <span className="text-[10px] text-mvp-muted truncate font-mono">{p.sku || 'SKU'}</span>
                                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                                  stockCount > 10 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                }`}>
                                  Stock: {stockCount}
                                </span>
                              </div>
                              <h4 className="text-xs font-bold text-white truncate mt-0.5">{p.name}</h4>
                              <div className="flex items-baseline gap-1.5 mt-1">
                                <span className="text-sm font-black text-amber-400">RD$ {Number(p.price).toLocaleString('es-DO')}</span>
                                {p.originalPrice && (
                                  <span className="text-[10px] text-mvp-muted line-through">RD$ {Number(p.originalPrice).toLocaleString('es-DO')}</span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-1.5 mt-2.5 pt-2 border-t border-white/10">
                            <button
                              onClick={() => handleStartQuoteFromCatalog(p)}
                              className="py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-black text-[11px] rounded-lg transition-colors flex items-center justify-center gap-1"
                            >
                              <Zap size={12} />
                              <span>Cotizar</span>
                            </button>
                            <button
                              onClick={() => handleCopyPitch(p)}
                              className="py-1.5 bg-white/10 hover:bg-white/20 text-white font-bold text-[11px] rounded-lg transition-colors flex items-center justify-center gap-1"
                            >
                              {copiedId === p.id ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                              <span>{copiedId === p.id ? 'Copiado' : 'Ficha'}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: ADVANCED COTIZADOR & GOOGLE MAPS KM CALCULATOR */}
            {activeTab === 'quoter' && (
              <div className="flex-1 overflow-y-auto p-3 sm:p-5">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 max-w-6xl mx-auto">
                  
                  {/* LEFT COLUMN: PRODUCTS, CLIENT & GOOGLE MAPS CALCULATOR (7 cols) */}
                  <div className="lg:col-span-7 space-y-3.5">
                    
                    {/* Whaticket Tickets Quick Select */}
                    {whaticketTickets.length > 0 && (
                      <div className="bg-mvp-card/90 border border-emerald-500/30 rounded-2xl p-3">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[11px] font-black text-emerald-400 flex items-center gap-1">
                            <MessageSquare size={13} />
                            <span>Bandeja Whaticket: Cargar Cliente Activo</span>
                          </span>
                          <span className="text-[10px] text-mvp-muted">{whaticketTickets.length} chats abiertos</span>
                        </div>
                        <select
                          onChange={(e) => {
                            const found = whaticketTickets.find((t) => String(t.id) === e.target.value);
                            if (found) {
                              setCustomerName(found.contact?.name || found.name || '');
                              setCustomerPhone(found.contact?.number || found.number || '');
                            }
                          }}
                          className="w-full bg-mvp-black border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-400"
                        >
                          <option value="">Seleccionar conversación abierta...</option>
                          {whaticketTickets.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.contact?.name || t.name || 'Cliente'} — (+{t.contact?.number || t.number})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Customer Info Card */}
                    <div className="bg-mvp-card border border-white/10 rounded-2xl p-3.5 space-y-2.5">
                      <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                        <User size={14} className="text-amber-400" />
                        <span>Datos del Cliente & Asesora</span>
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div>
                          <label className="text-[10px] text-mvp-silver font-bold block mb-1">Asesora:</label>
                          <input
                            type="text"
                            value={agentName}
                            onChange={(e) => setAgentName(e.target.value)}
                            className="w-full bg-mvp-black border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-amber-300 font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-mvp-silver font-bold block mb-1">Nombre Cliente:</label>
                          <input
                            type="text"
                            placeholder="Ej. Juan Pérez"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            className="w-full bg-mvp-black border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-mvp-silver font-bold block mb-1">WhatsApp Cliente:</label>
                          <input
                            type="tel"
                            placeholder="8096560219"
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                            className="w-full bg-mvp-black border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                          />
                        </div>
                      </div>
                    </div>

                    {/* 🗺️ HERRAMIENTA DESTACADA: CALCULADOR DE ENVÍO POR GOOGLE MAPS / DISTANCIA (KM) */}
                    <div className="bg-gradient-to-r from-amber-950/40 via-mvp-card to-amber-950/30 border-2 border-amber-400/60 rounded-2xl p-4 space-y-3 shadow-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/60 flex items-center justify-center text-amber-400">
                            <Navigation size={18} />
                          </div>
                          <div>
                            <h4 className="text-xs font-black text-white uppercase tracking-wider">
                              CALCULADOR DE ENVÍO POR KM (GOOGLE MAPS)
                            </h4>
                            <p className="text-[10px] text-amber-300/90 font-medium">
                              📍 Base: Tienda Los Mina (San Vicente de Paúl) → Ubicación del Cliente
                            </p>
                          </div>
                        </div>

                        <a
                          href={MVP_STORE_LOCATION.mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] font-bold text-amber-300 hover:text-white flex items-center gap-1 underline"
                        >
                          <span>Ver Tienda</span>
                          <ExternalLink size={10} />
                        </a>
                      </div>

                      {/* Google Maps Location Input */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-white flex items-center justify-between">
                          <span>Pega aquí el enlace de Google Maps o WhatsApp del cliente:</span>
                          <span className="text-[10px] text-mvp-silver font-normal">Soporta enlaces, ?q=, @lat,lng</span>
                        </label>
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <MapPin className="absolute left-3 top-2.5 text-amber-400" size={15} />
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
                              className="w-full bg-mvp-black border border-amber-400/40 focus:border-amber-400 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-mvp-muted focus:outline-none"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCalculateDistance()}
                            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs rounded-xl transition-all shadow-md flex items-center gap-1.5 flex-shrink-0"
                          >
                            <Compass size={14} />
                            <span>Calcular KM</span>
                          </button>
                        </div>
                      </div>

                      {/* Pricing Rules Visual Badge (Calibradas: Local 200, Duarte 275, Distrito 325-375, Alcarrizos/Pantoja 450-500 máx) */}
                      <div className="bg-mvp-black/60 p-2.5 rounded-xl border border-white/10 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider">Reglas Tarifarias Calibradas:</span>
                          <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-bold">Redondeo a 25</span>
                        </div>
                        <div className="grid grid-cols-4 gap-1.5 text-center text-[10px]">
                          <div className="bg-mvp-card p-1.5 rounded-lg border border-white/5">
                            <span className="text-mvp-silver block text-[9px]">0 a 5 KM</span>
                            <strong className="text-white font-black">RD$ 200</strong>
                            <span className="text-[8px] text-emerald-400 block">Base Local</span>
                          </div>
                          <div className="bg-mvp-card p-1.5 rounded-lg border border-white/5">
                            <span className="text-mvp-silver block text-[9px]">6 a 7 KM</span>
                            <strong className="text-amber-300 font-black">RD$ 275</strong>
                            <span className="text-[8px] text-mvp-muted block">Av. Duarte</span>
                          </div>
                          <div className="bg-mvp-card p-1.5 rounded-lg border border-white/5">
                            <span className="text-mvp-silver block text-[9px]">8 a 14 KM</span>
                            <strong className="text-amber-300 font-black">RD$ 325-375</strong>
                            <span className="text-[8px] text-mvp-muted block">Distrito Nac.</span>
                          </div>
                          <div className="bg-mvp-card p-1.5 rounded-lg border border-white/5">
                            <span className="text-mvp-silver block text-[9px]">15 a 25 KM</span>
                            <strong className="text-cyan-300 font-black">RD$ 450-500</strong>
                            <span className="text-[8px] text-cyan-400 block">Tope Máximo</span>
                          </div>
                        </div>
                      </div>

                      {/* Neighborhood Quick Presets Chips */}
                      <div>
                        <span className="text-[10px] font-bold text-mvp-silver block mb-1">Sectores Frecuentes (Cálculo Rápido con 1 clic):</span>
                        <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                          {NEIGHBORHOOD_PRESETS.map((preset) => (
                            <button
                              key={preset.name}
                              type="button"
                              onClick={() => handleSelectPresetNeighborhood(preset)}
                              className="px-2.5 py-1 bg-white/5 hover:bg-amber-500/20 hover:border-amber-400/50 border border-white/10 rounded-lg text-[10px] font-bold text-mvp-silver hover:text-amber-300 whitespace-nowrap transition-colors"
                            >
                              {preset.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Calculation Results Card */}
                      {calcError && (
                        <div className="p-2.5 bg-mvp-red/20 border border-mvp-red/50 rounded-xl text-xs text-white flex items-center gap-2">
                          <AlertCircle size={15} className="text-mvp-red flex-shrink-0" />
                          <span>{calcError}</span>
                        </div>
                      )}

                      {distanceCalcResult && (
                        <div className="bg-gradient-to-r from-emerald-950/50 via-mvp-card to-emerald-950/40 border border-emerald-500/40 rounded-2xl p-3 space-y-2.5 animate-fade-in">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center">
                            <div className="bg-black/50 p-2 rounded-xl border border-white/10">
                              <span className="text-[10px] text-mvp-muted uppercase font-bold block">Distancia de Ruta</span>
                              <span className="text-base sm:text-lg font-black text-white">{distanceCalcResult.distanceKm} KM</span>
                            </div>
                            <div className="bg-black/50 p-2 rounded-xl border border-white/10">
                              <span className="text-[10px] text-mvp-muted uppercase font-bold block">Tiempo Estimado</span>
                              <span className="text-xs font-bold text-amber-300">{distanceCalcResult.estimatedTime}</span>
                            </div>
                            <div className="bg-black/50 p-2 rounded-xl border border-emerald-500/30">
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
                              <Check size={15} />
                              <span>Aplicar este Envío a la Cotización (RD$ {distanceCalcResult.suggestedFee})</span>
                            </button>

                            <a
                              href={distanceCalcResult.googleRouteUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 border border-white/10"
                            >
                              <Navigation size={13} className="text-cyan-400" />
                              <span>Ver Ruta Google Maps 🗺️</span>
                            </a>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* LIVE SEARCH PRODUCT SELECTOR */}
                    <div className="bg-mvp-card border border-amber-500/30 rounded-2xl p-3.5 space-y-3 shadow-md">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                          <Search size={14} className="text-amber-400" />
                          <span>Buscar & Configurar Producto para Cotizar</span>
                        </h4>
                        <span className="text-[10px] text-amber-400 font-bold">{allProducts.length} productos en Odoo</span>
                      </div>

                      {/* Search Bar Input */}
                      <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-mvp-muted" size={14} />
                        <input
                          type="text"
                          placeholder="Buscar por tenis, marca o SKU (ej. Jordan, Campus, Louis Vuitton, Boxer)..."
                          value={quoterSearchQuery}
                          onChange={(e) => setQuoterSearchQuery(e.target.value)}
                          className="w-full bg-mvp-black border border-white/10 focus:border-amber-400 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-mvp-muted focus:outline-none"
                        />
                      </div>

                      {/* Search Results Quick Pills */}
                      <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                        {filteredQuoterProducts.slice(0, 6).map((p) => {
                          const isSelected = activeQuoterProduct?.id === p.id;
                          return (
                            <button
                              key={p.id}
                              onClick={() => handleSelectQuoterProduct(p)}
                              className={`flex items-center gap-2 p-1.5 rounded-xl border text-left flex-shrink-0 transition-all ${
                                isSelected
                                  ? 'bg-amber-500/20 border-amber-400 text-white'
                                  : 'bg-mvp-black border-white/10 text-mvp-silver hover:border-white/30'
                              }`}
                            >
                              <img src={p.images?.[0]} alt={p.name} className="w-8 h-8 rounded-lg object-cover bg-black" />
                              <div className="pr-2">
                                <p className="text-[11px] font-bold truncate max-w-[120px]">{p.name}</p>
                                <p className="text-[10px] text-amber-400 font-black">RD$ {Number(p.price).toLocaleString('es-DO')}</p>
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {/* Active Product Configuration Card */}
                      {activeQuoterProduct && (
                        <div className="bg-mvp-black/80 border border-white/10 rounded-2xl p-3 space-y-2.5">
                          <div className="flex items-center gap-3">
                            <img
                              src={activeQuoterProduct.images?.[0]}
                              alt={activeQuoterProduct.name}
                              className="w-14 h-14 rounded-xl object-cover bg-black border border-white/10 flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <h5 className="text-xs font-bold text-white truncate">{activeQuoterProduct.name}</h5>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs font-black text-amber-400">RD$ {Number(activeQuoterProduct.price).toLocaleString('es-DO')}</span>
                                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded font-bold">
                                  Stock: {activeQuoterProduct.stockLeft || activeQuoterProduct.qtyAvailable || 0} pares
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Size, Color, Price & Quantity Configuration */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-white/10">
                            <div>
                              <label className="text-[10px] text-mvp-silver font-bold block mb-1">Talla:</label>
                              <select
                                value={selectedSize}
                                onChange={(e) => setSelectedSize(e.target.value)}
                                className="w-full bg-mvp-card border border-white/10 rounded-xl px-2 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                              >
                                {(activeQuoterProduct.sizes || ['38 (7)', '39 (7.5)', '40 (8)', '41 (8.5)', '42 (9)', '43 (10)', '44 (11)']).map((s) => (
                                  <option key={s} value={s}>{s}</option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="text-[10px] text-mvp-silver font-bold block mb-1">Color:</label>
                              <select
                                value={selectedColor}
                                onChange={(e) => setSelectedColor(e.target.value)}
                                className="w-full bg-mvp-card border border-white/10 rounded-xl px-2 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                              >
                                {(activeQuoterProduct.colors || [{ name: 'Original' }]).map((c) => (
                                  <option key={c.name} value={c.name}>{c.name}</option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="text-[10px] text-amber-300 font-bold block mb-1">Precio Acordado:</label>
                              <input
                                type="number"
                                value={customItemPrice}
                                onChange={(e) => setCustomItemPrice(e.target.value)}
                                className="w-full bg-mvp-card border border-amber-500/40 rounded-xl px-2 py-1.5 text-xs text-amber-300 font-black focus:outline-none focus:border-amber-400"
                              />
                            </div>

                            <div>
                              <label className="text-[10px] text-mvp-silver font-bold block mb-1">Cantidad:</label>
                              <div className="flex items-center bg-mvp-card border border-white/10 rounded-xl">
                                <button
                                  type="button"
                                  onClick={() => setItemQuantity(Math.max(1, itemQuantity - 1))}
                                  className="px-2 py-1 text-white hover:text-amber-400 font-bold"
                                >
                                  -
                                </button>
                                <span className="flex-1 text-center text-xs font-bold text-white">{itemQuantity}</span>
                                <button
                                  type="button"
                                  onClick={() => setItemQuantity(itemQuantity + 1)}
                                  className="px-2 py-1 text-white hover:text-amber-400 font-bold"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={handleAddItemToQuote}
                            className="w-full py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-black text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm"
                          >
                            <Plus size={14} />
                            <span>AGREGAR ESTE PRODUCTO A LA COTIZACIÓN</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Sector, Shipping & Address Configuration */}
                    <div className="bg-mvp-card border border-white/10 rounded-2xl p-3.5 space-y-2.5">
                      <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                        <Truck size={14} className="text-amber-400" />
                        <span>Destino & Costo de Envío Aplicado</span>
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div className="sm:col-span-2">
                          <label className="text-[10px] text-mvp-silver font-bold block mb-1">Sector / Provincia:</label>
                          <select
                            value={selectedSector}
                            onChange={(e) => {
                              setSelectedSector(e.target.value);
                              const matched = SECTORS.find((s) => s.name === e.target.value);
                              if (matched) setDeliveryCost(matched.cost);
                            }}
                            className="w-full bg-mvp-black border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                          >
                            {SECTORS.map((s) => (
                              <option key={s.name} value={s.name}>
                                {s.name} ({s.time})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] text-amber-300 font-bold block mb-1">Envío (RD$ editable):</label>
                          <input
                            type="number"
                            value={deliveryCost}
                            onChange={(e) => setDeliveryCost(Number(e.target.value) || 0)}
                            className="w-full bg-mvp-black border border-amber-500/40 rounded-xl px-2.5 py-1.5 text-xs text-amber-300 font-black focus:outline-none focus:border-amber-400"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-mvp-silver font-bold block mb-1">Dirección Exacta / Sector:</label>
                          <input
                            type="text"
                            placeholder="Ej. C/ San Vicente #45, Los Mina"
                            value={customerAddress}
                            onChange={(e) => setCustomerAddress(e.target.value)}
                            className="w-full bg-mvp-black border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-mvp-silver font-bold block mb-1">Descuento Especial (RD$):</label>
                          <input
                            type="number"
                            placeholder="0"
                            value={extraDiscount}
                            onChange={(e) => setExtraDiscount(Number(e.target.value) || 0)}
                            className="w-full bg-mvp-black border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT COLUMN: QUOTE SUMMARY, PREVIEW & DISPATCH (5 cols) */}
                  <div className="lg:col-span-5 space-y-3.5">
                    
                    {/* Items inside Quote Box */}
                    <div className="bg-mvp-card border border-white/10 rounded-2xl p-3.5 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                          <ShoppingBag size={14} className="text-amber-400" />
                          <span>Productos en la Cotización ({quoteItems.length})</span>
                        </h4>
                        {quoteItems.length > 0 && (
                          <button
                            onClick={() => setQuoteItems([])}
                            className="text-[10px] text-mvp-red hover:underline font-bold"
                          >
                            Limpiar
                          </button>
                        )}
                      </div>

                      {quoteItems.length === 0 ? (
                        <div className="text-center py-4 bg-mvp-black/40 rounded-xl border border-dashed border-white/10">
                          <p className="text-xs text-mvp-silver">No has agregado items a la cotización.</p>
                          <p className="text-[10px] text-mvp-muted mt-0.5">Selecciona un producto a la izquierda y pulsa "+ Agregar".</p>
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                          {quoteItems.map((item) => (
                            <div
                              key={item.id}
                              className="bg-mvp-black/60 border border-white/10 rounded-xl p-2 flex items-center justify-between gap-2"
                            >
                              <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover bg-black flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <h6 className="text-[11px] font-bold text-white truncate">{item.name}</h6>
                                <p className="text-[10px] text-mvp-silver">Talla: {item.size} • Color: {item.color} • x{item.quantity}</p>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className="text-xs font-black text-amber-400">RD$ {Number(item.price * item.quantity).toLocaleString('es-DO')}</p>
                                <button
                                  onClick={() => handleRemoveQuoteItem(item.id)}
                                  className="text-[10px] text-mvp-red hover:text-white"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Totals Summary */}
                      <div className="bg-gradient-to-r from-amber-950/40 to-mvp-black border border-amber-500/30 rounded-xl p-3 space-y-1.5">
                        <div className="flex justify-between text-xs text-mvp-silver">
                          <span>Subtotal Mercancía:</span>
                          <span className="font-bold text-white">RD$ {Number(subtotal).toLocaleString('es-DO')}</span>
                        </div>
                        {Number(extraDiscount) > 0 && (
                          <div className="flex justify-between text-xs text-mvp-neonGreen">
                            <span>Descuento Especial:</span>
                            <span className="font-bold">- RD$ {Number(extraDiscount).toLocaleString('es-DO')}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-xs text-mvp-silver">
                          <span>Costo de Envío:</span>
                          <span className="font-bold text-white">
                            {Number(deliveryCost) === 0 ? '¡GRATIS (RD$ 0)!' : `RD$ ${Number(deliveryCost).toLocaleString('es-DO')}`}
                          </span>
                        </div>
                        <div className="border-t border-white/10 pt-2 flex justify-between items-baseline">
                          <span className="text-xs font-black text-amber-300">TOTAL A COBRAR (COD):</span>
                          <span className="text-lg font-black text-amber-400">RD$ {totalCalculated.toLocaleString('es-DO')}</span>
                        </div>
                      </div>
                    </div>

                    {/* Formatted Text Preview */}
                    <div className="bg-mvp-card border border-white/10 rounded-2xl p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black text-white uppercase">Vista Previa Mensaje WhatsApp</span>
                        <button
                          onClick={handleCopyQuote}
                          className="text-[10px] font-bold text-amber-300 hover:text-white flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-lg"
                        >
                          <Copy size={11} />
                          <span>Copiar Texto</span>
                        </button>
                      </div>
                      <pre className="text-[10px] text-mvp-silver whitespace-pre-wrap font-sans bg-mvp-black/80 p-2.5 rounded-xl border border-white/5 max-h-36 overflow-y-auto leading-relaxed">
                        {generateQuoteText()}
                      </pre>
                    </div>

                    {/* Status Alert */}
                    {quoteSuccessMsg && (
                      <div className="p-3 bg-emerald-500/20 border border-emerald-400 rounded-xl text-xs text-emerald-300 font-bold flex items-center gap-2 animate-fade-in">
                        <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
                        <span>{quoteSuccessMsg}</span>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="space-y-2 pt-1">
                      <button
                        onClick={handleSendWhaticket}
                        disabled={isSendingQuote}
                        className="w-full py-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-[0_4px_15px_rgba(16,185,129,0.35)] flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                      >
                        <Send size={15} />
                        <span>{isSendingQuote ? 'Enviando...' : 'ENVIAR COTIZACIÓN A WHATICKET / WHATSAPP'}</span>
                      </button>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={handleCopyQuote}
                          className="py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Copy size={13} />
                          <span>Copiar Texto</span>
                        </button>

                        <button
                          onClick={handleConvertToOrder}
                          disabled={isConvertingOrder}
                          className="py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 text-black font-black text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <ShoppingBag size={13} />
                          <span>{isConvertingOrder ? 'Creando...' : 'Convertir a Pedido COD'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: ÁLBUM DE FOTOS / MULTIMEDIA */}
            {activeTab === 'album' && (
              <div className="flex-1 flex flex-col overflow-hidden p-3 sm:p-5">
                {/* Search & Actions Bar */}
                <div className="flex flex-col sm:flex-row gap-2 mb-3 flex-shrink-0">
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-2.5 text-mvp-muted" size={15} />
                    <input
                      type="text"
                      placeholder="Buscar foto por nombre, modelo, drop o etiqueta (Jordan, Campus, Boxer, Tienda)..."
                      value={albumSearchQuery}
                      onChange={(e) => setAlbumSearchQuery(e.target.value)}
                      className="w-full bg-mvp-black border border-white/10 focus:border-amber-400 rounded-xl py-2 pl-10 pr-4 text-xs text-white placeholder-mvp-muted focus:outline-none"
                    />
                  </div>

                  {/* Categories */}
                  <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
                    {[
                      { id: 'all', label: 'Todas' },
                      { id: 'sneakers', label: 'Tenis G5' },
                      { id: 'combos', label: 'Combos' },
                      { id: 'hoodies', label: 'Ropa' },
                      { id: 'store', label: 'Tienda Física' },
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setAlbumSelectedCategory(cat.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                          albumSelectedCategory === cat.id
                            ? 'bg-amber-500 text-black font-black shadow-sm'
                            : 'bg-mvp-card hover:bg-mvp-cardHover text-mvp-silver border border-white/5'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}

                    <button
                      onClick={() => setShowUploadModal(true)}
                      className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-black font-black text-xs rounded-xl flex items-center gap-1.5 whitespace-nowrap shadow-sm ml-1"
                    >
                      <Upload size={13} />
                      <span>+ Subir Foto</span>
                    </button>
                  </div>

                  {/* Popular Search Tags Bar */}
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-2 mb-1">
                    <span className="text-[10px] text-mvp-muted font-bold flex-shrink-0">Etiquetas:</span>
                    {[
                      'vans', 'jordan', 'campus', 'adidas', 'reebok', 'boxers', 'franela', 'croki', 'g5', 'los mina'
                    ].map((tag) => (
                      <button
                        key={tag}
                        onClick={() => setAlbumSearchQuery(albumSearchQuery.toLowerCase() === tag ? '' : tag)}
                        className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold transition-all flex-shrink-0 ${
                          albumSearchQuery.toLowerCase() === tag
                            ? 'bg-amber-400 text-black font-black shadow-sm'
                            : 'bg-white/5 hover:bg-white/10 text-amber-300/80 border border-amber-500/20'
                        }`}
                      >
                        #{tag}
                      </button>
                    ))}
                    {albumSearchQuery && (
                      <button
                        onClick={() => setAlbumSearchQuery('')}
                        className="text-[10px] text-rose-400 hover:text-rose-300 font-bold px-2 py-0.5 flex-shrink-0"
                      >
                        ✕ Limpiar
                      </button>
                    )}
                  </div>
                </div>

                {/* Floating Toast Notification */}
                {albumToast && (
                  <div className="mb-2 p-2.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold rounded-xl flex items-center gap-2 animate-fade-in">
                    <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
                    <span>{albumToast}</span>
                  </div>
                )}

                {/* Photos Grid */}
                <div className="flex-1 overflow-y-auto pr-1">
                  {filteredAlbumItems.length === 0 ? (
                    <div className="text-center py-16 space-y-3 bg-mvp-card/30 rounded-3xl border border-white/5">
                      <Image size={40} className="mx-auto text-mvp-muted" />
                      <p className="text-sm font-bold text-white">No se encontraron fotos en esta categoría.</p>
                      <button
                        onClick={() => setShowUploadModal(true)}
                        className="px-4 py-2 bg-amber-500 text-black text-xs font-black rounded-xl"
                      >
                        Subir la primera foto
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                      {filteredAlbumItems.map((item) => (
                        <div
                          key={item.id}
                          className="group bg-mvp-card border border-white/10 hover:border-amber-400/50 rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-300 shadow-md hover:shadow-glow-sm"
                        >
                          {/* Image Container */}
                          <div className="relative aspect-square bg-black/60 overflow-hidden cursor-pointer" onClick={() => handleCopyImageToClipboard(item)}>
                            <img
                              src={item.imageUrl}
                              alt={item.title}
                              loading="lazy"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            
                            {/* Overlay hover quick copy prompt */}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2 text-center pointer-events-none">
                              <span className="bg-amber-500 text-black font-black text-[10px] px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1">
                                <Copy size={11} /> Clic para Copiar
                              </span>
                            </div>

                            {/* Tags badge */}
                            {item.tags?.[0] && (
                              <span className="absolute top-1.5 left-1.5 bg-black/80 text-amber-300 text-[9px] font-bold px-1.5 py-0.5 rounded-md border border-amber-500/30 uppercase">
                                #{item.tags[0]}
                              </span>
                            )}
                          </div>

                          {/* Info & Action Buttons */}
                          <div className="p-2.5 space-y-2">
                            <h4 className="text-[11px] font-bold text-white line-clamp-1" title={item.title}>
                              {item.title}
                            </h4>

                            <div className="flex items-center gap-1">
                              {/* 1-Click Copy Image Button (For WhatsApp pasting) */}
                              <button
                                onClick={() => handleCopyImageToClipboard(item)}
                                className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-black transition-all flex items-center justify-center gap-1 shadow-sm ${
                                  copiedAlbumId === item.id
                                    ? 'bg-emerald-500 text-black'
                                    : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black'
                                }`}
                                title="Copiar imagen para pegar directamente en WhatsApp (Ctrl+V)"
                              >
                                {copiedAlbumId === item.id ? <Check size={12} /> : <Copy size={12} />}
                                <span>{copiedAlbumId === item.id ? '¡Copiada!' : 'Copiar Foto'}</span>
                              </button>

                              {/* Download Button */}
                              <button
                                onClick={() => handleDownloadPhoto(item)}
                                className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                                title="Descargar foto HD"
                              >
                                <Download size={13} />
                              </button>

                              {/* Delete button if uploaded */}
                              {item.source === 'Subido por Asesora' && (
                                <button
                                  onClick={() => handleDeleteAlbumItem(item.id)}
                                  className="p-1.5 bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 rounded-lg transition-colors"
                                  title="Eliminar foto"
                                >
                                  <Trash2 size={12} />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 4: REPLIES */}
            {activeTab === 'replies' && (
              <div className="flex-1 overflow-y-auto p-3 sm:p-6 max-w-3xl mx-auto w-full space-y-3">
                {QUICK_REPLIES.map((r) => (
                  <div
                    key={r.shortcut}
                    className="bg-mvp-card border border-white/10 hover:border-amber-400/40 rounded-2xl p-3.5 sm:p-4 transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-amber-400 font-mono">/{r.shortcut}</span>
                        <h4 className="text-xs font-bold text-white">{r.title}</h4>
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(r.message);
                          setCopiedId(r.shortcut);
                          setTimeout(() => setCopiedId(null), 2000);
                        }}
                        className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors"
                      >
                        {copiedId === r.shortcut ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                        <span>{copiedId === r.shortcut ? '¡Copiado!' : 'Copiar'}</span>
                      </button>
                    </div>
                    <pre className="text-xs text-mvp-silver whitespace-pre-wrap font-sans bg-mvp-black/60 p-3 rounded-xl border border-white/5 leading-relaxed">
                      {r.message}
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Photo Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
            <div className="bg-mvp-dark border border-amber-500/40 w-full max-w-md rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xl animate-scale-up">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Camera size={18} className="text-amber-400" />
                  <h3 className="text-sm font-black text-white uppercase font-display">Subir Foto al Álbum</h3>
                </div>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleUploadPhoto} className="space-y-3">
                {/* File picker / drop zone */}
                <div>
                  <label className="text-[11px] font-bold text-mvp-silver block mb-1">Seleccionar Imagen:</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="w-full text-xs text-mvp-silver file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-500 file:text-black hover:file:bg-amber-400 cursor-pointer bg-mvp-black p-2 rounded-2xl border border-white/10"
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
                  <label className="text-[11px] font-bold text-mvp-silver block mb-1">Título del Modelo / Foto:</label>
                  <input
                    type="text"
                    placeholder="Ej. Tenis Retro Jordan 4 Black Cat (G5)"
                    value={newPhotoTitle}
                    onChange={(e) => setNewPhotoTitle(e.target.value)}
                    required
                    className="w-full bg-mvp-black border border-white/10 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-white placeholder-mvp-muted focus:outline-none"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="text-[11px] font-bold text-mvp-silver block mb-1">Categoría:</label>
                  <select
                    value={newPhotoCategory}
                    onChange={(e) => setNewPhotoCategory(e.target.value)}
                    className="w-full bg-mvp-black border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
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
                  <label className="text-[11px] font-bold text-mvp-silver block mb-1">Etiquetas (separadas por coma):</label>
                  <input
                    type="text"
                    placeholder="jordan, retro, g5, negro"
                    value={newPhotoTags}
                    onChange={(e) => setNewPhotoTags(e.target.value)}
                    className="w-full bg-mvp-black border border-white/10 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-white placeholder-mvp-muted focus:outline-none"
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
                    {isUploadingPhoto ? <RefreshCw size={14} className="animate-spin" /> : <Upload size={14} />}
                    <span>Guardar en Álbum</span>
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
