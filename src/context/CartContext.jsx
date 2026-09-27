import React, { createContext, useContext, useState, useEffect } from 'react';
import { trackAddToCart, trackDraftCart, trackWhatsAppClick, trackWheelSpin } from '../utils/tracker';

const CartContext = createContext();

const STORAGE_KEY = 'plastir_cart_v1';
const COUPON_KEY = 'plastir_coupon_v1';
const WHEEL_KEY = 'plastir_wheel_won_v1';
const WISHLIST_KEY = 'plastir_wishlist_v1';
const SOUND_KEY = 'plastir_sound_v1';

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
  const [isWhaticketChatOpen, setIsWhaticketChatOpen] = useState(false);
  const [whaticketChatProduct, setWhaticketChatProduct] = useState(null);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isComboBuilderOpen, setIsComboBuilderOpen] = useState(false);
  const [selectedProduct, setSelectedProductState] = useState(null);
  const [quoterInitialProduct, setQuoterInitialProduct] = useState(null);
  const [currentTrackingId, setCurrentTrackingId] = useState(null);

  // Behavior tracking: Viewed Products History
  const [viewedProducts, setViewedProducts] = useState(() => {
    try {
      const saved = localStorage.getItem('plastir_viewed_history_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const recordProductView = (prod) => {
    if (!prod || !prod.id) return;
    setViewedProducts((prev) => {
      const filtered = prev.filter((p) => p.id !== prod.id);
      const updated = [{
        id: prod.id,
        name: prod.name,
        price: prod.price,
        originalPrice: prod.originalPrice,
        image: prod.images?.[0] || prod.image,
        category: prod.category,
        department: prod.department,
        dimensions: prod.dimensions,
        capacity: prod.capacity,
        material: prod.material,
        description: prod.description,
        timestamp: Date.now()
      }, ...filtered].slice(0, 10);
      try {
        localStorage.setItem('plastir_viewed_history_v1', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const setSelectedProduct = (prod) => {
    if (prod) recordProductView(prod);
    setSelectedProductState(prod);
  };

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
      `¡Hola PLASTIR RD! 👋📦\n\n` +
      `Deseo ordenar este artículo para entrega express:\n\n` +
      `⭐ *${prod.name}*\n` +
      `💵 *Precio:* RD$ ${priceText}\n` +
      `📐 *Presentación / Medida:* ${selectedSize}\n` +
      `🎨 *Color:* ${selectedColor}\n` +
      (prod.sku ? `🏷️ *SKU:* ${prod.sku}\n` : '') +
      `\n📦 *Modalidad:* Pago Contra Entrega (al recibir)\n` +
      `🌐 *Web:* https://plastirrd.com\n\n` +
      `¿Tienen disponibilidad para despacho hoy?`;

    const url = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
    trackWhatsAppClick('direct_whatsapp_order', prod, 'Customer');
  };

  const promptQuickOrder = (prod, defaultSize = null, defaultColor = null) => {
    setQuickChoiceProduct({
      ...prod,
      initialSize: defaultSize || (prod.sizes && prod.sizes[0]) || 'Estándar',
      initialColor: defaultColor || (prod.colors && prod.colors[0]) || { name: 'Original', image: prod.images?.[0] },
    });
  };

  const openLiveChat = (prod = null) => {
    if (prod) {
      recordProductView(prod);
      setWhaticketChatProduct(prod);
      trackWhatsAppClick('chat_product', prod, 'Plastir AI');
    } else {
      trackWhatsAppClick('chat_general', null, 'Plastir AI');
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

  // Disable automatic spin wheel popup to keep interaction clean and non-intrusive
  useEffect(() => {
    // Wheel only opened manually if needed
  }, []);

  // Sound effects generator (disabled by default for clean browsing)
  const playBeep = () => {};

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
    const selectedSize = size || (product.sizes && product.sizes[0]) || 'Estándar';
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
        viewedProducts,
        recordProductView,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
