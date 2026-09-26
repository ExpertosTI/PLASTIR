// ══════════════════════════════════════════════════════════════════
//  RENACE Ubicaciones & Calculador — Popup Logic
//  Calculadora Standalone de Envíos por KM para Whaticket / WhatsApp
// ══════════════════════════════════════════════════════════════════

const STORE_ORIGIN = {
  lat: 18.509674072265625,
  lng: -69.8631591796875,
  name: 'Los Mina, San Vicente de Paúl',
};

const DEFAULT_BASE_URL = 'https://mvpflowboutique.com/catalogo';

// ── Motor Matemático de Distancia y Tarifas ────────────────────────
function roundToStep25(val) {
  return Math.round(Number(val || 0) / 25) * 25;
}

function extractCoordinates(input) {
  if (!input || typeof input !== 'string') return null;
  let str = input.trim();
  try { str = decodeURIComponent(str); } catch {}

  // 1. Google Maps ?q=loc:lat,lng o ?q=lat,lng o ?query=lat,lng o ?center=lat,lng
  const qMatch = str.match(/[?&](?:q|query|center|ll|sll|destination|daddr)=(?:loc:)?(-?\d+\.\d+)[\s,%2C]+(-?\d+\.\d+)/i);
  if (qMatch) {
    const lat = parseFloat(qMatch[1]);
    const lng = parseFloat(qMatch[2]);
    if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return { lat, lng };
    }
  }

  // 2. Google Maps @lat,lng,zoom
  const atMatch = str.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (atMatch) {
    const lat = parseFloat(atMatch[1]);
    const lng = parseFloat(atMatch[2]);
    if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return { lat, lng };
    }
  }

  // 3. Coordenadas directas "18.5096, -69.8631"
  const directMatch = str.match(/(-?\d{1,2}\.\d{3,15})[\s,;|/]+(-?\d{1,3}\.\d{3,15})/);
  if (directMatch) {
    const lat = parseFloat(directMatch[1]);
    const lng = parseFloat(directMatch[2]);
    if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return { lat, lng };
    }
  }

  // 4. geo:lat,lng
  const geoMatch = str.match(/^geo:(-?\d+\.\d+)[\s,%2C]+(-?\d+\.\d+)/i);
  if (geoMatch) {
    const lat = parseFloat(geoMatch[1]);
    const lng = parseFloat(geoMatch[2]);
    if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return { lat, lng };
    }
  }

  // 5. Coordenadas DMS (Grados, Minutos, Segundos)
  const dmsMatch = str.match(/(\d{1,2})[°º\s]+(\d{1,2})['′\s]+([\d.]+)?["″\s]*([NSns])[\s,]+(\d{1,3})[°º\s]+(\d{1,2})['′\s]+([\d.]+)?["″\s]*([EWOewo])/i);
  if (dmsMatch) {
    let lat = parseInt(dmsMatch[1], 10) + parseInt(dmsMatch[2], 10)/60 + (parseFloat(dmsMatch[3]) || 0)/3600;
    if (dmsMatch[4].toUpperCase() === 'S') lat = -lat;
    let lng = parseInt(dmsMatch[5], 10) + parseInt(dmsMatch[6], 10)/60 + (parseFloat(dmsMatch[7]) || 0)/3600;
    if (dmsMatch[8].toUpperCase() === 'W' || dmsMatch[8].toUpperCase() === 'O') lng = -lng;
    if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return { lat, lng };
    }
  }

  return null;
}

function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radio de la Tierra en KM
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightLineKm = R * c;

  // Factor de ruta vial urbana en Santo Domingo (calles y puentes)
  const urbanRoadFactor = 1.28;
  return parseFloat((straightLineKm * urbanRoadFactor).toFixed(1));
}

function calculateShippingQuote(inputString) {
  const coords = extractCoordinates(inputString);
  if (!coords) {
    return {
      success: false,
      error: 'No se encontraron coordenadas válidas. Pega un enlace de Google Maps o WhatsApp.',
    };
  }

  const distanceKm = calculateDistanceKm(
    STORE_ORIGIN.lat,
    STORE_ORIGIN.lng,
    coords.lat,
    coords.lng
  );

  let rawCost = 0;
  let breakdown = '';
  let estimatedTime = '2 a 4 horas';

  if (distanceKm <= 10) {
    // Tramo 1: 0 a 10 KM @ RD$ 35/KM (Mínimo RD$ 200)
    rawCost = Math.max(200, distanceKm * 35);
    breakdown = `${distanceKm} km · Tramo 1 (RD$ 35/km)`;
    estimatedTime = '2 a 4 hrs Express';
  } else if (distanceKm <= 20) {
    // Tramo 2: Primeros 10 KM = 350 + (KM excedentes * 25)
    const base10 = 350;
    const extraKm = distanceKm - 10;
    rawCost = base10 + extraKm * 25;
    breakdown = `10km (RD$350) + ${extraKm.toFixed(1)}km a RD$25`;
    estimatedTime = 'Mismo día (3 a 5 hrs)';
  } else {
    // Tramo 3: Primeros 10 KM (350) + Siguientes 10 KM (250) + Excedentes (>20) * 15
    const base20 = 600;
    const extraKm = distanceKm - 20;
    rawCost = base20 + extraKm * 15;
    breakdown = `20km (RD$600) + ${extraKm.toFixed(1)}km a RD$15`;
    estimatedTime = distanceKm > 50 ? '24 hrs (Nacional)' : 'Mismo día';
  }

  // Redondeo obligatorio a múltiplos de RD$ 25
  const suggestedFee = roundToStep25(rawCost);

  return {
    success: true,
    distanceKm,
    suggestedFee,
    estimatedTime,
    breakdown,
    coords,
  };
}

// ── Estado Global del Popup ────────────────────────────────────────
let currentCalcResult = null;
let appBaseUrl = DEFAULT_BASE_URL;

// ── UI Elements ────────────────────────────────────────────────────
const locationInput = document.getElementById('locationInput');
const calcBtn = document.getElementById('calcBtn');
const calcErrorBox = document.getElementById('calcErrorBox');
const calcErrorText = document.getElementById('calcErrorText');
const calcResultBox = document.getElementById('calcResultBox');
const resDistance = document.getElementById('resDistance');
const resTime = document.getElementById('resTime');
const resFee = document.getElementById('resFee');
const resBreakdown = document.getElementById('resBreakdown');
const copyMsgBtn = document.getElementById('copyMsgBtn');
const pasteChatBtn = document.getElementById('pasteChatBtn');
const openQuoterBtn = document.getElementById('openQuoterBtn');
const enableToggle = document.getElementById('enableToggle');
const popupToast = document.getElementById('popupToast');
const popupToastMsg = document.getElementById('popupToastMsg');
const tabCount = document.getElementById('tabCount');
const historyList = document.getElementById('historyList');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');
const baseUrlInput = document.getElementById('baseUrlInput');
const saveUrlBtn = document.getElementById('saveUrlBtn');
const statusAutoCapture = document.getElementById('statusAutoCapture');

// ── Helpers de UI ──────────────────────────────────────────────────
function showToast(msg) {
  popupToastMsg.textContent = msg;
  popupToast.classList.remove('hidden');
  setTimeout(() => popupToast.classList.add('hidden'), 2500);
}

function renderCalculation(inputVal) {
  calcErrorBox.classList.add('hidden');
  calcResultBox.classList.add('hidden');

  const val = (inputVal || locationInput.value || '').trim();
  if (!val) {
    calcErrorText.textContent = 'Por favor pega un enlace de Google Maps o coordenadas GPS.';
    calcErrorBox.classList.remove('hidden');
    return;
  }

  const res = calculateShippingQuote(val);
  if (!res.success) {
    calcErrorText.textContent = res.error;
    calcErrorBox.classList.remove('hidden');
    currentCalcResult = null;
    return;
  }

  currentCalcResult = res;
  resDistance.textContent = `${res.distanceKm} KM`;
  resTime.textContent = res.estimatedTime;
  resFee.textContent = `RD$ ${res.suggestedFee.toLocaleString('es-DO')}`;
  resBreakdown.textContent = `⚡ ${res.breakdown} → RD$ ${res.suggestedFee}`;
  calcResultBox.classList.remove('hidden');

  // Guardar en historial
  saveToHistory(res.coords, val);
}

function getFormattedMessage() {
  if (!currentCalcResult) return '';
  return (
    `🛵 *COTIZACIÓN DE ENVÍO EXPRESS — RENACE*\n` +
    `📍 *Distancia:* ${currentCalcResult.distanceKm} KM (desde Tienda Central)\n` +
    `⏱️ *Tiempo estimado:* ${currentCalcResult.estimatedTime}\n` +
    `💰 *Costo de Envío:* *RD$ ${currentCalcResult.suggestedFee.toLocaleString('es-DO')}*\n` +
    `💵 *Método de Pago:* Contra Entrega (COD) en Efectivo o Transferencia al recibir.\n\n` +
    `¿Deseas que confirmemos tu despacho de una vez? 🛵💨`
  );
}

// ── Guardar Historial ──────────────────────────────────────────────
function saveToHistory(coords, rawInput) {
  chrome.storage.local.get(['renace_history'], (data) => {
    const list = data.renace_history || [];
    list.unshift({
      lat: coords.lat,
      lng: coords.lng,
      source: rawInput,
      ts: Date.now(),
    });
    const trimmed = list.slice(0, 25);
    chrome.storage.local.set({ renace_history: trimmed });
    updateHistoryUI(trimmed);
  });
}

function updateHistoryUI(list) {
  tabCount.textContent = list.length;
  if (list.length === 0) {
    historyList.innerHTML = '<div class="empty-state">No hay ubicaciones registradas aún.</div>';
    return;
  }

  historyList.innerHTML = list
    .map(
      (item, idx) => `
      <div class="history-item">
        <div class="history-info">
          <div class="history-coords">${item.lat.toFixed(4)}, ${item.lng.toFixed(4)}</div>
          <div class="history-meta">${new Date(item.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · ${item.source}</div>
        </div>
        <button class="btn-hist-load" data-idx="${idx}" data-coords="${item.lat},${item.lng}">
          Cargar
        </button>
      </div>
    `
    )
    .join('');

  historyList.querySelectorAll('.btn-hist-load').forEach((btn) => {
    btn.addEventListener('click', () => {
      const coords = btn.dataset.coords;
      locationInput.value = coords;
      switchTab('calculator');
      renderCalculation(coords);
    });
  });
}

// ── Cambiar Pestañas ───────────────────────────────────────────────
function switchTab(tabId) {
  document.querySelectorAll('.nav-tab').forEach((t) => {
    t.classList.toggle('active', t.dataset.tab === tabId);
  });
  document.querySelectorAll('.tab-content').forEach((c) => {
    c.classList.toggle('active', c.id === `tab-${tabId}`);
  });
}

// ── Inyectar Mensaje en Chat de Whaticket / WhatsApp Web ────────────
async function pasteInActiveChat() {
  const text = getFormattedMessage();
  if (!text) return;

  try {
    // 1. Copiar primero al portapapeles
    await navigator.clipboard.writeText(text);

    // 2. Buscar la pestaña activa
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.id) {
      showToast('✔ Copiado al portapapeles');
      return;
    }

    // 3. Ejecutar script en la pestaña activa para insertar el texto en el input
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (msgToPaste) => {
        // Buscar inputs comunes de Whaticket, WhatsApp Web y chats
        const target =
          document.querySelector('div[contenteditable="true"]') ||
          document.querySelector('footer div[contenteditable="true"]') ||
          document.querySelector('textarea') ||
          document.activeElement;

        if (target) {
          target.focus();
          if (target.isContentEditable) {
            // WhatsApp / Whaticket Rich Text
            document.execCommand('insertText', false, msgToPaste);
          } else {
            target.value = (target.value ? target.value + '\n' : '') + msgToPaste;
            target.dispatchEvent(new Event('input', { bubbles: true }));
          }
          return true;
        }
        return false;
      },
      args: [text],
    });

    showToast('✔ ¡Pegado en el chat de Whaticket!');
  } catch (err) {
    console.error('Error al pegar:', err);
    showToast('✔ Copiado al portapapeles (Pégalo con Ctrl+V)');
  }
}

// ── Event Listeners ────────────────────────────────────────────────
calcBtn.addEventListener('click', () => renderCalculation());
locationInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    renderCalculation();
  }
});
locationInput.addEventListener('paste', () => {
  setTimeout(() => renderCalculation(), 100);
});

// Preset Chips
document.querySelectorAll('.preset-chip').forEach((chip) => {
  chip.addEventListener('click', () => {
    const coords = chip.dataset.coords;
    locationInput.value = coords;
    renderCalculation(coords);
  });
});

// Copiar Mensaje
copyMsgBtn.addEventListener('click', async () => {
  const text = getFormattedMessage();
  if (text) {
    await navigator.clipboard.writeText(text);
    showToast('✔ Cotización copiada para WhatsApp');
  }
});

// Pegar en Chat
pasteChatBtn.addEventListener('click', pasteInActiveChat);

// Abrir en Cotizador RENACE Completo
openQuoterBtn.addEventListener('click', () => {
  if (!currentCalcResult) return;
  const lat = currentCalcResult.coords.lat;
  const lng = currentCalcResult.coords.lng;
  const targetUrl = `${appBaseUrl}?lat=${lat}&lng=${lng}&tab=quoter&source=renace-ext`;

  chrome.tabs.create({ url: targetUrl, active: true });
  window.close();
});

// Navigation Tabs
document.querySelectorAll('.nav-tab').forEach((tab) => {
  tab.addEventListener('click', () => switchTab(tab.dataset.tab));
});

// Toggle Automático
enableToggle.addEventListener('change', () => {
  const enabled = enableToggle.checked;
  chrome.storage.local.set({ renace_enabled: enabled });
  statusAutoCapture.textContent = enabled ? 'Activa' : 'Desactivada';
  statusAutoCapture.className = enabled ? 'text-green' : 'text-slate-400';
  showToast(enabled ? 'Intercepción activada' : 'Intercepción pausada');
});

// Clear History
clearHistoryBtn.addEventListener('click', () => {
  chrome.storage.local.set({ renace_history: [] });
  updateHistoryUI([]);
  showToast('Historial limpiado');
});

// Save Settings URL
saveUrlBtn.addEventListener('click', () => {
  const val = baseUrlInput.value.trim();
  if (val) {
    appBaseUrl = val;
    chrome.storage.local.set({ renace_base_url: val });
    showToast('URL guardada');
  }
});

// ── Inicialización ─────────────────────────────────────────────────
chrome.storage.local.get(
  ['renace_enabled', 'renace_history', 'renace_base_url'],
  (data) => {
    const enabled = data.renace_enabled !== false;
    enableToggle.checked = enabled;
    statusAutoCapture.textContent = enabled ? 'Activa' : 'Desactivada';
    statusAutoCapture.className = enabled ? 'text-green' : 'text-slate-400';

    appBaseUrl = (data.renace_base_url || DEFAULT_BASE_URL).trim();
    baseUrlInput.value = appBaseUrl;

    const history = data.renace_history || [];
    updateHistoryUI(history);

    // Si hay una última ubicación reciente, calcularla por defecto
    if (history.length > 0) {
      locationInput.value = `${history[0].lat}, ${history[0].lng}`;
      renderCalculation(locationInput.value);
    }
  }
);
