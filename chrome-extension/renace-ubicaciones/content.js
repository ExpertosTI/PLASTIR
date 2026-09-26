// ══════════════════════════════════════════════════════════════════
//  RENACE Ubicaciones & Calculador — Content Script v1.2.0
//  Ultra-Robusto: Intercepta Links, Clics, Mapas y Coordenadas en Whaticket & WhatsApp
// ══════════════════════════════════════════════════════════════════

const DEFAULT_BASE = 'https://mvpflowboutique.com/catalogo';

// ── Parser Universal de Coordenadas GPS ────────────────────────────
function parseCoordinates(rawInput) {
  if (!rawInput) return null;
  
  let input = String(rawInput).trim();
  try {
    input = decodeURIComponent(input);
  } catch {}

  // 1. Google Maps ?q=loc:lat,lng o ?q=lat,lng o ?query=lat,lng o ?center=lat,lng
  const qMatch = input.match(/[?&](?:q|query|center|ll|sll|destination|daddr)=(?:loc:)?(-?\d+\.\d+)[\s,%2C]+(-?\d+\.\d+)/i);
  if (qMatch) {
    const lat = parseFloat(qMatch[1]);
    const lng = parseFloat(qMatch[2]);
    if (isValidLatLng(lat, lng)) return { lat, lng };
  }

  // 2. Google Maps @lat,lng,zoom (URL de navegación / place)
  const atMatch = input.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (atMatch) {
    const lat = parseFloat(atMatch[1]);
    const lng = parseFloat(atMatch[2]);
    if (isValidLatLng(lat, lng)) return { lat, lng };
  }

  // 3. Coordenadas directas en texto: "18.5096, -69.8631" o "18.5096 -69.8631"
  const directMatch = input.match(/(-?\d{1,2}\.\d{3,15})[\s,;|/]+(-?\d{1,3}\.\d{3,15})/);
  if (directMatch) {
    const lat = parseFloat(directMatch[1]);
    const lng = parseFloat(directMatch[2]);
    if (isValidLatLng(lat, lng)) return { lat, lng };
  }

  // 4. geo:lat,lng
  const geoMatch = input.match(/^geo:(-?\d+\.\d+)[\s,%2C]+(-?\d+\.\d+)/i);
  if (geoMatch) {
    const lat = parseFloat(geoMatch[1]);
    const lng = parseFloat(geoMatch[2]);
    if (isValidLatLng(lat, lng)) return { lat, lng };
  }

  // 5. Coordenadas DMS (Grados, Minutos, Segundos): 18°30'34"N 69°51'47"W
  const dmsMatch = input.match(/(\d{1,2})[°º\s]+(\d{1,2})['′\s]+([\d.]+)?["″\s]*([NSns])[\s,]+(\d{1,3})[°º\s]+(\d{1,2})['′\s]+([\d.]+)?["″\s]*([EWOewo])/i);
  if (dmsMatch) {
    let lat = parseInt(dmsMatch[1], 10) + parseInt(dmsMatch[2], 10)/60 + (parseFloat(dmsMatch[3]) || 0)/3600;
    if (dmsMatch[4].toUpperCase() === 'S') lat = -lat;
    let lng = parseInt(dmsMatch[5], 10) + parseInt(dmsMatch[6], 10)/60 + (parseFloat(dmsMatch[7]) || 0)/3600;
    if (dmsMatch[8].toUpperCase() === 'W' || dmsMatch[8].toUpperCase() === 'O') lng = -lng;
    if (isValidLatLng(lat, lng)) return { lat, lng };
  }

  return null;
}

function isValidLatLng(lat, lng) {
  return !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

function isMapsUrl(url) {
  if (!url || typeof url !== 'string') return false;
  const l = url.toLowerCase();
  return (
    l.includes('maps.google.') ||
    l.includes('google.com/maps') ||
    l.includes('maps.app.goo.gl') ||
    l.includes('goo.gl/maps') ||
    l.startsWith('geo:') ||
    l.includes('maps.apple.com') ||
    l.includes('waze.com/ul') ||
    l.includes('waze.com/live-map') ||
    l.includes('googleapis.com/maps/api/staticmap')
  );
}

// ── Toast Flotante de Notificación RENACE ──────────────────────────
let toastEl = null;

function showRenaceToast(title, subtitle, isError = false) {
  if (toastEl) toastEl.remove();

  toastEl = document.createElement('div');
  toastEl.id = 'renace-toast-box';
  toastEl.innerHTML = `
    <div style="
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 2147483647;
      background: #0B0E17;
      border: 1.5px solid ${isError ? '#ef4444' : '#FF1E27'};
      border-radius: 16px;
      padding: 12px 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Roboto, sans-serif;
      color: #FFFFFF;
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.85), 0 0 20px ${isError ? 'rgba(239,68,68,0.3)' : 'rgba(255,30,39,0.35)'};
      animation: renaceSlide 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      max-width: 380px;
    ">
      <div style="
        width: 34px;
        height: 34px;
        border-radius: 10px;
        background: ${isError ? 'rgba(239,68,68,0.2)' : 'rgba(255,30,39,0.2)'};
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        flex-shrink: 0;
      ">${isError ? '⚠️' : '⚡'}</div>
      <div style="flex: 1; min-width: 0;">
        <div style="font-size: 12.5px; font-weight: 800; color: #FFF; line-height: 1.2;">${title}</div>
        <div style="font-size: 10.5px; font-weight: 500; color: #94A3B8; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${subtitle}</div>
      </div>
      <div style="
        background: #FF1E27;
        color: #FFF;
        font-size: 9px;
        font-weight: 900;
        padding: 3px 6px;
        border-radius: 5px;
        letter-spacing: 0.5px;
        flex-shrink: 0;
      ">RENACE</div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    @keyframes renaceSlide {
      from { opacity: 0; transform: translateY(-16px) scale(0.95); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }
  `;
  toastEl.appendChild(style);
  document.body.appendChild(toastEl);

  setTimeout(() => {
    if (toastEl) {
      toastEl.remove();
      toastEl = null;
    }
  }, 3500);
}

// ── Procesar y Abrir en Cotizador RENACE ───────────────────────────
function handleOpenLocation(rawUrlOrText) {
  chrome.storage.local.get(['renace_enabled', 'renace_base_url', 'renace_history'], (data) => {
    if (data.renace_enabled === false) return; // Desactivada en switch

    const baseUrl = (data.renace_base_url || DEFAULT_BASE).trim();
    const coords = parseCoordinates(rawUrlOrText);

    let targetUrl = '';
    let displaySub = '';

    if (coords) {
      targetUrl = `${baseUrl}?lat=${coords.lat}&lng=${coords.lng}&tab=quoter&source=renace-ext`;
      displaySub = `GPS: ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)} → Cotizador`;
    } else {
      targetUrl = `${baseUrl}?loc=${encodeURIComponent(rawUrlOrText)}&tab=quoter&source=renace-ext`;
      displaySub = `Abriendo ruta en Cotizador RENACE...`;
    }

    // Guardar en historial
    const history = data.renace_history || [];
    history.unshift({
      lat: coords ? coords.lat : 0,
      lng: coords ? coords.lng : 0,
      source: rawUrlOrText.length > 80 ? rawUrlOrText.substring(0, 80) + '...' : rawUrlOrText,
      page: document.title || 'Chat',
      ts: Date.now(),
    });
    chrome.storage.local.set({ renace_history: history.slice(0, 30) });

    // Toast de confirmación
    showRenaceToast('¡Ubicación Interceptada!', displaySub);

    // Enviar a background service worker para abrir o enfocar la pestaña
    chrome.runtime.sendMessage({
      action: 'open_renace',
      url: targetUrl,
      coords: coords || null,
    });
  });
}

// ── Interceptor Global de Clics (Capture Phase) ─────────────────────
document.addEventListener(
  'click',
  (e) => {
    // 1. Comprobar si el clic fue en un <a> o dentro de un <a>
    const link = e.target.closest ? e.target.closest('a') : null;
    if (link) {
      const href = link.href || link.getAttribute('href') || '';
      if (isMapsUrl(href) || parseCoordinates(href)) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        handleOpenLocation(href);
        return false;
      }
    }

    // 2. Comprobar imágenes de mapas estáticos (comunes en Whaticket / WhatsApp)
    const img = e.target.closest ? e.target.closest('img') : null;
    if (img) {
      const src = img.src || '';
      if (isMapsUrl(src) && parseCoordinates(src)) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        handleOpenLocation(src);
        return false;
      }
    }

    // 3. Comprobar cualquier contenedor de mensaje con atributos data o texto
    const container = e.target.closest ? e.target.closest('[data-url], [data-href], .copyable-text, .message, .chat-message') : e.target;
    if (container) {
      const dataUrl = container.getAttribute('data-url') || container.getAttribute('data-href') || '';
      if (dataUrl && (isMapsUrl(dataUrl) || parseCoordinates(dataUrl))) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        handleOpenLocation(dataUrl);
        return false;
      }
    }

    // 4. Comprobar el texto del elemento cliqueado
    const text = (e.target.textContent || e.target.innerText || '').trim();
    if (text.length > 5 && text.length < 600) {
      if (isMapsUrl(text)) {
        const urlMatch = text.match(/(https?:\/\/[^\s]+)/i);
        if (urlMatch) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          handleOpenLocation(urlMatch[1]);
          return false;
        }
      } else {
        const coords = parseCoordinates(text);
        if (coords) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          handleOpenLocation(text);
          return false;
        }
      }
    }
  },
  true // TRUE = CAPTURING PHASE (Intercepta antes de que Whaticket o WhatsApp detengan la propagación)
);

// ── Observador de Nuevos Enlaces en el DOM ──────────────────────────
function markMapElements() {
  document.querySelectorAll('a[href]').forEach((a) => {
    if (a.dataset.renaceHooked) return;
    const href = a.href || '';
    if (isMapsUrl(href) || parseCoordinates(href)) {
      a.dataset.renaceHooked = '1';
      a.title = '⚡ Interceptado por RENACE Cotizador';
    }
  });
}

const observer = new MutationObserver(() => markMapElements());
observer.observe(document.documentElement, { childList: true, subtree: true });
markMapElements();

console.log('[RENACE Ubicaciones v1.2.0] Interceptor ultra-robusto activo 🚀');
