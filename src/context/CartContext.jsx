import React, { createContext, useContext, useState, useEffect } from 'react';
import { trackAddToCart, trackDraftCart, trackWhatsAppClick, trackWheelSpin } from '../utils/tracker';

const CartContext = createContext();

const STORAGE_KEY = 'mvpflow_cart_v1';
const COUPON_KEY = 'mvpflow_coupon_v1';
const WHEEL_KEY = 'mvpflow_wheel_won_v1';
const WISHLIST_KEY = 'mvpflow_wishlist_v1';
const SOUND_KEY = 'mvpflow_sound_v1';

export const CartProvider = ({ children }) => {
  // Cart items
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Wishlist / Favorites
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem(WISHLIST_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Dynamic catalog products for real-time favorites and story linking
  const [catalogProducts, setCatalogProducts] = useState([]);

  // Sound effects setting
  const [soundEnabled, setSoundEnabled] = useState(() => {
    try {
      const saved = localStorage.getItem(SOUND_KEY);
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  // Currency: 'DOP' (RD$) or 'USD' ($)
  const [currency, setCurrency] = useState('DOP');
  const DOP_USD_RATE = 60.5;

  // Modals state
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isWheelOpen, setIsWheelOpen] = useState(false);
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [isQuickRepliesOpen, setIsQuickRepliesOpen] = useState(false);
  const [isQuickQuoterOpen, setIsQuickQuoterOpen] = useState(false);
  const [isLocalCatalogOpen, setIsLocalCatalogOpen] = useState(false);
  const [isWhaticketChatOpen, setIsWhaticketChatOpen] = useState(false);
  const [whaticketChatProduct, setWhaticketChatProduct] = useState(null);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isComboBuilderOpen, setIsComboBuilderOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quoterInitialProduct, setQuoterInitialProduct] = useState(null);
  const [currentTrackingId, setCurrentTrackingId] = useState(null);

  const [quickChoiceProduct, setQuickChoiceProduct] = useState(null);
  const [storePhone, setStorePhone] = useState('18096560219');

  useEffect(() => {
    fetch('/api/config')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.supportPhone) {
          const clean = String(data.supportPhone).replace(/\D/g, '');
          if (clean) setStorePhone(clean);
        }
      })
      .catch(() => {});
  }, []);

  const openDirectWhatsAppForProduct = (prod, size, color) => {
    if (!prod) return;
    const cleanPhone = storePhone.replace(/\D/g, '') || '18096560219';
    const formattedPhone = cleanPhone.length === 10 ? `1${cleanPhone}` : cleanPhone;
    const selectedSize = size || (prod.sizes && prod.sizes[0]) || 'Estándar';
    const selectedColor = typeof color === 'string' ? color : (color?.name || (prod.colors && prod.colors[0]?.name) || 'Original');
    const priceText = Number(prod.price || 0).toLocaleString('es-DO');

    const msg =
      `¡Hola MVP FLOW Boutique! 👋👟\n\n` +
      `Quiero pedir este modelo para entrega express:\n\n` +
      `🔥 *${prod.name}*\n` +
      `💵 *Precio:* RD$ ${priceText}\n` +
      `📏 *Talla:* ${selectedSize}\n` +
      `🎨 *Color:* ${selectedColor}\n` +
      (prod.sku ? `🏷️ *SKU:* ${prod.sku}\n` : '') +
      `\n📦 *Modalidad:* Pago Contra Entrega (COD al recibir)\n` +
      `🌐 *Web:* https://mvpflowboutique.com\n\n` +
      `¿Tienen disponibilidad para enviármelo hoy?`;

    const url = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
    trackWhatsAppClick('direct_whatsapp_order', prod, 'Customer');
  };

  const promptQuickOrder = (prod, defaultSize = null, defaultColor = null) => {
    setQuickChoiceProduct({
      ...prod,
      initialSize: defaultSize || (prod.sizes && prod.sizes[0]) || '40 (8)',
      initialColor: defaultColor || (prod.colors && prod.colors[0]) || { name: 'Original', image: prod.images?.[0] },
    });
  };

  const openLiveChat = (prod = null) => {
    if (prod) {
      setWhaticketChatProduct(prod);
      trackWhatsAppClick('chat_product', prod, 'Ashley');
    } else {
      trackWhatsAppClick('chat_general', null, 'Ashley');
    }
    setIsWhaticketChatOpen(true);
  };

  const openWhaticketWithProduct = (prod) => {
    openLiveChat(prod);
  };

  // Active coupon / Wheel reward
  const [activeCoupon, setActiveCoupon] = useState(() => {
    try {
      const saved = localStorage.getItem(COUPON_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [hasSpunWheel, setHasSpunWheel] = useState(() => {
    try {
      return localStorage.getItem(WHEEL_KEY) === 'true';
    } catch {
      return false;
    }
  });

  // Persist cart and track draft carts
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
      if (cart.length > 0) {
        const total = cart.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1), 0);
        trackDraftCart(cart, total);
      }
    } catch (e) {
      console.error('Error saving cart', e);
    }
  }, [cart]);

  // Persist wishlist
  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
    } catch (e) {
      console.error('Error saving wishlist', e);
    }
  }, [wishlist]);

  // Persist sound setting
  useEffect(() => {
    try {
      localStorage.setItem(SOUND_KEY, soundEnabled.toString());
    } catch (e) {
      console.error('Error saving sound setting', e);
    }
  }, [soundEnabled]);

  // Persist active coupon
  useEffect(() => {
    try {
      if (activeCoupon) {
        localStorage.setItem(COUPON_KEY, JSON.stringify(activeCoupon));
      } else {
        localStorage.removeItem(COUPON_KEY);
      }
    } catch (e) {
      console.error('Error saving coupon', e);
    }
  }, [activeCoupon]);

  // Trigger spin wheel on first visit after 2.5 seconds
  useEffect(() => {
    if (!hasSpunWheel) {
      const timer = setTimeout(() => {
        setIsWheelOpen(true);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [hasSpunWheel]);

  // Sound effects generator using Web Audio API
  const playBeep = (type = 'add') => {
    if (!soundEnabled) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'add') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } else if (type === 'win') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } else if (type === 'heart') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.setValueAtTime(900, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      }
    } catch {
      // Fallback
    }
  };

  const toggleFavorite = (productId) => {
    setWishlist((prev) => {
      const exists = prev.some((id) => String(id) === String(productId));
      playBeep('heart');
      if (exists) {
        return prev.filter((id) => String(id) !== String(productId));
      } else {
        return [...prev, productId];
      }
    });
  };

  const isFavorite = (productId) => wishlist.some((id) => String(id) === String(productId));

  const addToCart = (product, size, color, quantity = 1, openCartDrawer = true) => {
    const selectedSize = size || (product.sizes && product.sizes[0]) || '40 (8)';
    const selectedColor = typeof color === 'string' ? color : (color?.name || (product.colors && product.colors[0]?.name) || 'Original');
    const cartItemId = `${product.id}-${selectedSize}-${selectedColor}`;

    setCart((prev) => {
      const existing = prev.find((item) => item.cartItemId === cartItemId);
      if (existing) {
        return prev.map((item) =>
          item.cartItemId === cartItemId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [
        ...prev,
        {
          ...product,
          cartItemId,
          selectedSize,
          selectedColor,
          quantity,
        },
      ];
    });

    playBeep('add');
    trackAddToCart(product, selectedSize, selectedColor);
    if (openCartDrawer) {
      setIsCartOpen(true);
    }
  };

  const removeFromCart = (cartItemId) => {
    setCart((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  };

  const updateQuantity = (cartItemId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.cartItemId === cartItemId ? { ...item, quantity: newQty } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  // Open Quoter directly with a given product
  const openQuoterWithProduct = (product) => {
    setQuoterInitialProduct(product);
    setIsQuickQuoterOpen(true);
  };

  // Coupons dictionary (Corporate & Retail Plastir)
  const VALID_COUPONS = {
    PLASTIR10: { code: 'PLASTIR10', percent: 10, description: '10% OFF Bienvenida Plastir' },
    HOGAR15: { code: 'HOGAR15', percent: 15, description: '15% OFF Especial Hogar & Cocina' },
    B2B20: { code: 'B2B20', percent: 20, description: '20% OFF Descuento Corporativo B2B' },
    ENVIOGRATIS: { code: 'ENVIOGRATIS', freeShipping: true, description: 'Envío Gratis a Todo RD' },
    PLASTIR500: { code: 'PLASTIR500', fixedDiscount: 500, description: 'Bono Directo RD$ 500 OFF' },
  };

  const applyCoupon = (code) => {
    const clean = code.trim().toUpperCase();
    if (VALID_COUPONS[clean]) {
      setActiveCoupon(VALID_COUPONS[clean]);
      playBeep('win');
      return { success: true, message: `¡Cupón ${clean} aplicado con éxito!` };
    }
    return { success: false, message: 'Cupón no válido o expirado.' };
  };

  const removeCoupon = () => {
    setActiveCoupon(null);
  };

  const recordWheelSpin = (reward) => {
    setHasSpunWheel(true);
    localStorage.setItem(WHEEL_KEY, 'true');
    if (reward?.couponCode && VALID_COUPONS[reward.couponCode]) {
      setActiveCoupon(VALID_COUPONS[reward.couponCode]);
    }
    playBeep('win');
    trackWheelSpin(reward?.label || '30% OFF');
  };

  // Pricing calculations
  const subtotalDOP = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const originalSubtotalDOP = cart.reduce(
    (sum, item) => sum + (item.originalPrice || item.price * 1.5) * item.quantity,
    0
  );
  const totalSavingsDOP = originalSubtotalDOP - subtotalDOP;

  let couponDiscountDOP = 0;
  if (activeCoupon?.percent) {
    couponDiscountDOP = Math.round((subtotalDOP * activeCoupon.percent) / 100);
  } else if (activeCoupon?.fixedDiscount) {
    couponDiscountDOP = Math.min(subtotalDOP, activeCoupon.fixedDiscount);
  }

  const itemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Formatter helper
  const formatMoney = (amountDOP) => {
    if (currency === 'USD') {
      const usd = (amountDOP / DOP_USD_RATE).toFixed(2);
      return `$${usd} USD`;
    }
    return `RD$ ${Number(amountDOP).toLocaleString('es-DO')}`;
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        wishlist,
        catalogProducts,
        setCatalogProducts,
        toggleFavorite,
        isFavorite,
        soundEnabled,
        setSoundEnabled,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        itemsCount,
        subtotalDOP,
        originalSubtotalDOP,
        totalSavingsDOP,
        couponDiscountDOP,
        activeCoupon,
        applyCoupon,
        removeCoupon,
        currency,
        setCurrency,
        formatMoney,
        isCartOpen,
        setIsCartOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        isWheelOpen,
        setIsWheelOpen,
        isTrackerOpen,
        setIsTrackerOpen,
        isAdminOpen,
        setIsAdminOpen,
        isManualOpen,
        setIsManualOpen,
        isQuickRepliesOpen,
        setIsQuickRepliesOpen,
        isQuickQuoterOpen,
        setIsQuickQuoterOpen,
        isLocalCatalogOpen,
        setIsLocalCatalogOpen,
        isWhaticketChatOpen,
        setIsWhaticketChatOpen,
        whaticketChatProduct,
        setWhaticketChatProduct,
        openWhaticketWithProduct,
        openLiveChat,
        quoterInitialProduct,
        setQuoterInitialProduct,
        openQuoterWithProduct,
        isWishlistOpen,
        setIsWishlistOpen,
        isComboBuilderOpen,
        setIsComboBuilderOpen,
        selectedProduct,
        setSelectedProduct,
        quickChoiceProduct,
        setQuickChoiceProduct,
        promptQuickOrder,
        openDirectWhatsAppForProduct,
        storePhone,
        currentTrackingId,
        setCurrentTrackingId,
        hasSpunWheel,
        recordWheelSpin,
        playBeep,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
