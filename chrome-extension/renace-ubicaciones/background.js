// ══════════════════════════════════════════════════════════════════
//  RENACE Ubicaciones — Background Service Worker
// ══════════════════════════════════════════════════════════════════

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'open_renace') {
    const targetUrl = msg.url;

    // Buscar si ya hay una pestaña del Cotizador abierta para reutilizarla o abrir una nueva
    chrome.tabs.query({}, (tabs) => {
      const existingTab = tabs.find((t) => t.url && (t.url.includes('/catalogo') || t.url.includes('mvpflowboutique.com/catalogo')));

      if (existingTab && existingTab.id) {
        chrome.tabs.update(existingTab.id, { url: targetUrl, active: true });
        if (existingTab.windowId) {
          chrome.windows.update(existingTab.windowId, { focused: true });
        }
      } else {
        chrome.tabs.create({ url: targetUrl, active: true });
      }
    });

    // Badge temporal con destello rojo RENACE
    chrome.action.setBadgeText({ text: '📍' });
    chrome.action.setBadgeBackgroundColor({ color: '#FF1E27' });
    setTimeout(() => {
      chrome.action.setBadgeText({ text: '' });
    }, 4000);

    sendResponse({ ok: true });
    return true;
  }
});

// Inicialización de valores por defecto al instalar o actualizar
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(['renace_base_url'], (res) => {
    if (!res.renace_base_url) {
      chrome.storage.local.set({
        renace_enabled: true,
        renace_history: [],
        renace_base_url: 'https://mvpflowboutique.com/catalogo',
      });
    }
  });
  console.log('[RENACE Ubicaciones] Service worker inicializado ✅');
});
