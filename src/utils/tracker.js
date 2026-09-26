/**
 * RENACE Universal Event Tracker
 * Non-blocking client-side telemetry for visits, product clicks, draft carts, WhatsApp interactions, staff photo copying & distance calculations.
 */

// Helper to get or create Session ID
const getSessionId = () => {
  try {
    let sId = sessionStorage.getItem('renace_session_id');
    if (!sId) {
      sId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 7)}`;
      sessionStorage.setItem('renace_session_id', sId);
    }
    return sId;
  } catch {
    return 'anon_session';
  }
};

// Helper for Session Start and Duration
const getSessionStartTime = () => {
  try {
    let t = sessionStorage.getItem('renace_session_start');
    if (!t) {
      t = String(Date.now());
      sessionStorage.setItem('renace_session_start', t);
    }
    return Number(t);
  } catch {
    return Date.now();
  }
};

export const getSessionDurationSeconds = () => {
  const start = getSessionStartTime();
  return Math.max(0, Math.round((Date.now() - start) / 1000));
};

// Helper to get active agent name or Customer
const getActiveAgentName = () => {
  try {
    const isStaffPath =
      window.location.pathname.includes('/catalogo') ||
      window.location.pathname.includes('/cotizador') ||
      window.location.pathname.includes('/staff') ||
      window.location.search.includes('staff') ||
      window.location.search.includes('catalogo');

    if (isStaffPath) {
      return localStorage.getItem('mvpflow_agent_name') || 'Ashley';
    }
    return 'Cliente';
  } catch {
    return 'Cliente';
  }
};

// Detect Detailed Device, OS & Screen
const getDetailedDevice = () => {
  try {
    const ua = navigator.userAgent || '';
    let os = 'Desktop';
    let deviceName = 'PC / Escritorio';

    if (/iPhone/i.test(ua)) {
      os = 'iOS';
      deviceName = 'iPhone';
    } else if (/iPad/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
      os = 'iPadOS';
      deviceName = 'iPad';
    } else if (/Android/i.test(ua)) {
      os = 'Android';
      deviceName = /Mobile/i.test(ua) ? 'Android (Móvil)' : 'Android (Tablet)';
    } else if (/Macintosh|Mac OS X/i.test(ua)) {
      os = 'macOS';
      deviceName = 'Mac';
    } else if (/Windows/i.test(ua)) {
      os = 'Windows';
      deviceName = 'Windows PC';
    }

    const type = /Mobile|Android.*Mobile|iPhone/i.test(ua) ? 'mobile' : (/Tablet|iPad/i.test(ua) ? 'tablet' : 'desktop');
    return {
      type,
      label: deviceName,
      os,
      screen: `${window.screen?.width || 0}x${window.screen?.height || 0}`,
    };
  } catch {
    return { type: 'desktop', label: 'Escritorio', os: 'PC', screen: '1920x1080' };
  }
};

// Detect Detailed Traffic Source & Social Campaign
const getTrafficSource = () => {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const sourceParam = urlParams.get('source') || urlParams.get('utm_source');
    if (sourceParam) {
      const s = sourceParam.toLowerCase();
      if (s.includes('ext')) return 'Extensión Chrome';
      if (s.includes('what') || s.includes('wa')) return 'WhatsApp';
      if (s.includes('ig') || s.includes('insta')) return 'Instagram Stories / Reels';
      if (s.includes('fb') || s.includes('face')) return 'Facebook';
      if (s.includes('tk') || s.includes('tik')) return 'TikTok';
      return sourceParam;
    }

    const ref = document.referrer.toLowerCase();
    if (ref.includes('whatsapp') || ref.includes('wa.me') || ref.includes('api.whatsapp')) return 'WhatsApp';
    if (ref.includes('instagram.com') || ref.includes('l.instagram')) return 'Instagram';
    if (ref.includes('facebook.com') || ref.includes('fb.com') || ref.includes('l.facebook')) return 'Facebook';
    if (ref.includes('tiktok.com')) return 'TikTok';
    if (ref.includes('google.')) return 'Google Search';
    if (window.location.pathname.includes('/catalogo')) return 'Catálogo Personal';
    return 'Directo / Navegador';
  } catch {
    return 'Directo / Navegador';
  }
};

// Throttled event queue to eliminate 429 rate limit errors
let lastSentTime = 0;
const eventQueue = [];
let isProcessingQueue = false;

const processQueue = () => {
  if (eventQueue.length === 0) {
    isProcessingQueue = false;
    return;
  }
  isProcessingQueue = true;
  const now = Date.now();
  const wait = Math.max(0, 150 - (now - lastSentTime));

  setTimeout(() => {
    const nextItem = eventQueue.shift();
    if (!nextItem) {
      isProcessingQueue = false;
      return;
    }
    lastSentTime = Date.now();

    try {
      if (navigator.sendBeacon) {
        const blob = new Blob([JSON.stringify(nextItem)], { type: 'application/json' });
        navigator.sendBeacon('/api/analytics/track', blob);
      } else {
        fetch('/api/analytics/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(nextItem),
          keepalive: true,
        }).catch(() => {});
      }
    } catch {
      // Safe fallback: never crash UI
    }

    if (eventQueue.length > 0) {
      processQueue();
    } else {
      isProcessingQueue = false;
    }
  }, wait);
};

/**
 * Universal safe track dispatcher with queue throttling & duration tracking
 */
export const trackEvent = (eventType, payload = {}) => {
  try {
    const detailedDev = getDetailedDevice();
    const duration = payload.durationSeconds ?? getSessionDurationSeconds();

    const body = {
      type: eventType,
      sessionId: getSessionId(),
      agentName: payload.agentName || getActiveAgentName(),
      path: window.location.pathname || '/',
      title: document.title || '',
      referrer: document.referrer || '',
      device: payload.device || detailedDev.label,
      deviceType: detailedDev.type,
      os: detailedDev.os,
      screen: detailedDev.screen,
      source: payload.source || getTrafficSource(),
      durationSeconds: duration,
      timestamp: new Date().toISOString(),
      ...payload,
    };

    if (eventQueue.length < 50) {
      eventQueue.push(body);
      if (!isProcessingQueue) {
        processQueue();
      }
    }
  } catch (err) {
    // Never crash UI for telemetry
  }
};

// Standard Tracking Helpers
export const trackPageView = (path = window.location.pathname, title = document.title) => {
  trackEvent('page_view', { path, title });
};

export const trackProductView = (product) => {
  if (!product) return;
  trackEvent('product_view', {
    productId: product.id,
    productName: product.name,
    category: product.category,
    price: Number(product.price || 0),
  });
};

export const trackProductClick = (product, action = 'open_detail') => {
  if (!product) return;
  trackEvent('product_click', {
    productId: product.id,
    productName: product.name,
    category: product.category,
    price: Number(product.price || 0),
    action,
  });
};

export const trackAddToCart = (product, size = '', color = '') => {
  if (!product) return;
  trackEvent('add_to_cart', {
    productId: product.id,
    productName: product.name,
    category: product.category,
    price: Number(product.price || 0),
    meta: { size, color },
  });
};

export const trackDraftCart = (items = [], totalAmount = 0) => {
  trackEvent('draft_cart', {
    price: Number(totalAmount || 0),
    meta: {
      itemsCount: items.length,
      totalAmount: Number(totalAmount || 0),
      itemsSummary: items.map((i) => `${i.name} (x${i.quantity || 1})`).join(', '),
    },
  });
};

export const trackWhatsAppClick = (type = 'quote', product = null, agentName = 'Ashley') => {
  trackEvent('whatsapp_click', {
    productId: product?.id || null,
    productName: product?.name || 'Consulta General',
    agentName,
    action: type,
    meta: {
      type,
      agentName,
    },
  });
};

export const trackDistanceCalc = (distanceKm, fee, destination = '', agentName = 'Ashley') => {
  trackEvent('distance_calc', {
    agentName,
    meta: {
      distanceKm,
      fee,
      destination,
      agentName,
    },
  });
};

export const trackPhotoCopy = (photo, agentName = 'Ashley') => {
  trackEvent('photo_copy', {
    productId: photo?.id || null,
    productName: photo?.title || 'Foto de Catálogo',
    agentName,
    meta: {
      photoId: photo?.id,
      title: photo?.title,
      category: photo?.category,
    },
  });
};

export const trackPhotoUpload = (count = 1, agentName = 'Ashley') => {
  trackEvent('photo_upload', {
    agentName,
    meta: {
      count,
      agentName,
    },
  });
};

export const trackQuickReplyCopy = (command, title, agentName = 'Ashley') => {
  trackEvent('quick_reply_copy', {
    agentName,
    meta: {
      command,
      title,
      agentName,
    },
  });
};

export const trackUploadLinkCreated = (productName, agentName = 'Ashley') => {
  trackEvent('upload_link_created', {
    productName,
    agentName,
    meta: {
      productName,
      agentName,
    },
  });
};

// Customer Telemetry Helpers
export const trackSearchQuery = (searchQuery, resultsCount = 0, category = 'all') => {
  if (!searchQuery || !searchQuery.trim()) return;
  trackEvent('search_query', {
    searchQuery: searchQuery.trim(),
    resultsCount: Number(resultsCount || 0),
    meta: {
      searchQuery: searchQuery.trim(),
      resultsCount: Number(resultsCount || 0),
      category,
      hasResults: Number(resultsCount || 0) > 0,
    },
  });
};

export const trackCategoryClick = (category) => {
  trackEvent('category_click', {
    category,
    action: 'filter_category',
    meta: { category },
  });
};

export const trackCustomerAction = (action, meta = {}) => {
  trackEvent(action, {
    action,
    productId: meta.productId || null,
    productName: meta.productName || null,
    category: meta.category || null,
    price: Number(meta.price || 0),
    size: meta.selectedSize || meta.size || null,
    color: meta.selectedColor || meta.color || null,
    meta,
  });
};

export const trackStoryView = (story) => {
  if (!story) return;
  trackEvent('story_view', {
    action: 'view_story_reel',
    title: story.title || 'Historia / Reel',
    meta: {
      storyId: story.id,
      title: story.title,
      source: story.source || 'upload',
      hasVideo: Boolean(story.videoUrl),
    },
  });
};

export const trackWheelSpin = (discountWon) => {
  trackEvent('wheel_spin', {
    action: 'spin_wheel_discount',
    meta: {
      discount: discountWon,
    },
  });
};

export const trackWishlistToggle = (product, isAdded = true) => {
  if (!product) return;
  trackEvent('wishlist_toggle', {
    productId: product.id,
    productName: product.name,
    category: product.category,
    price: Number(product.price || 0),
    action: isAdded ? 'add_to_wishlist' : 'remove_from_wishlist',
    meta: {
      isAdded,
    },
  });
};

// Granular Click & Time Telemetry Helpers
export const trackSizeSelect = (size, product = null) => {
  if (!size) return;
  trackEvent('size_select', {
    productId: product?.id || null,
    productName: product?.name || null,
    category: product?.category || null,
    size: String(size),
    action: `Seleccionó Talla ${size}`,
    meta: {
      size: String(size),
      productId: product?.id,
      productName: product?.name,
    },
  });
};

export const trackColorSelect = (colorName, product = null) => {
  if (!colorName) return;
  trackEvent('color_select', {
    productId: product?.id || null,
    productName: product?.name || null,
    color: String(colorName),
    action: `Seleccionó Variante ${colorName}`,
    meta: {
      color: String(colorName),
      productId: product?.id,
      productName: product?.name,
    },
  });
};

export const trackProductModalDuration = (product, durationSeconds) => {
  if (!product || !durationSeconds) return;
  trackEvent('product_modal_time', {
    productId: product.id,
    productName: product.name,
    category: product.category,
    durationSeconds: Number(durationSeconds),
    action: `Vio ficha técnica durante ${durationSeconds}s`,
    meta: {
      productId: product.id,
      productName: product.name,
      durationSeconds: Number(durationSeconds),
    },
  });
};

export const trackBannerClick = (bannerName, details = {}) => {
  trackEvent('banner_click', {
    action: `Clic en Banner: ${bannerName}`,
    meta: {
      bannerName,
      ...details,
    },
  });
};

// Periodic Session Heartbeat & Auto-Exit Tracking
let isSessionTrackingInitialized = false;
export const initSessionTracking = () => {
  if (typeof window === 'undefined' || isSessionTrackingInitialized) return;
  isSessionTrackingInitialized = true;

  getSessionStartTime();

  // Send a heartbeat every 25 seconds
  setInterval(() => {
    const dur = getSessionDurationSeconds();
    trackEvent('session_heartbeat', {
      durationSeconds: dur,
      silent: true,
    });
  }, 25000);

  // Send exit duration beacon when leaving
  window.addEventListener('beforeunload', () => {
    try {
      const dur = getSessionDurationSeconds();
      const dev = getDetailedDevice();
      const body = {
        type: 'session_exit',
        sessionId: getSessionId(),
        durationSeconds: dur,
        device: dev.label,
        source: getTrafficSource(),
        timestamp: new Date().toISOString(),
      };
      if (navigator.sendBeacon) {
        const blob = new Blob([JSON.stringify(body)], { type: 'application/json' });
        navigator.sendBeacon('/api/analytics/track', blob);
      }
    } catch {}
  });
};

