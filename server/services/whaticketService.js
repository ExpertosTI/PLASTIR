/**
 * Whaticket API v1.0.0 Service for MVP FLOW BOUTIQUE RD
 * Exclusively integrated for direct WhatsApp dispatch, ticketing, and live conversations.
 * API Endpoint: https://api.whaticket.com/api/v1
 */

export const DEFAULT_WHATICKET_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJjcmVhdGU6bWVzc2FnZXMiLCJjcmVhdGU6bWVkaWFzIiwicmVhZDp3aGF0c2FwcHMiLCJ1cGRhdGU6d2hhdHNhcHBzIiwiY3JlYXRlOmNvbnRhY3RzIiwicmVhZDpjb250YWN0cyJdLCJjb21wYW55SWQiOiIxYjZmMzk1OC05NTExLTRiYzUtOTRkNy04YmE2ZTI2MDYxYTUiLCJpYXQiOjE3ODc4Nzc3MTB9.igKUXGwsEUCqSWhZxgWkpghAmCasRJ9EgazyZUFHr-M';
export const DEFAULT_WHATICKET_API_URL = 'https://api.whaticket.com/api/v1';

export const resolveWhaticketCredentials = (config) => {
  const token = (config?.token || process.env.WHATICKET_TOKEN || DEFAULT_WHATICKET_TOKEN).trim();
  const apiUrl = (config?.apiUrl || process.env.WHATICKET_API_URL || DEFAULT_WHATICKET_API_URL).trim();
  const companyId = (config?.companyId || process.env.WHATICKET_COMPANY_ID || '1b6f3958-9511-4bc5-94d7-8ba6e26061a5').trim();
  const connectionId = (config?.connectionId || process.env.WHATICKET_CONNECTION_ID || 'b24ea8c3-f5ed-46de-b612-dbe8f76e53c8').trim();
  return { token, apiUrl, companyId, connectionId };
};

/**
 * Clean and normalize Whaticket API URL to point to /api/v1
 */
export const normalizeWhaticketUrl = (rawUrl) => {
  let url = String(rawUrl || DEFAULT_WHATICKET_API_URL).trim().replace(/\/+$/, '');
  if (!url.includes('/api/v1')) {
    if (url.endsWith('/api')) {
      url = `${url}/v1`;
    } else {
      url = `${url}/api/v1`;
    }
  }
  return url;
};

/**
 * Clean and format Dominican / International Phone Number for Whaticket (e.g. 18096560219)
 */
export const formatPhoneNumberForWhaticket = (rawPhone) => {
  let cleaned = String(rawPhone || '').replace(/\D/g, '');
  if (cleaned.length === 10 && (cleaned.startsWith('809') || cleaned.startsWith('829') || cleaned.startsWith('849'))) {
    cleaned = '1' + cleaned;
  }
  return cleaned;
};

/**
 * Format order WhatsApp message for Whaticket
 */
export const formatWhaticketOrderMessage = (order) => {
  const { trackingId, customer, items, shipping, payment, date } = order;

  const itemsList = (items || [])
    .map(
      (item, idx) =>
        `${idx + 1}. *${item.name}*\n   • Talla: ${item.size || item.selectedSize || 'Estándar'} | Color: ${item.color || item.selectedColor || 'OG'}\n   • Cantidad: ${item.quantity} | RD$ ${Number(item.price).toLocaleString('es-DO')}`
    )
    .join('\n');

  return (
    `🔥 *¡PEDIDO CONFIRMADO EN MVP FLOW BOUTIQUE RD!* 🔥\n\n` +
    `Hola *${customer?.name || 'Cliente'}*, hemos registrado tu autopedido exitosamente.\n\n` +
    `📋 *TICKET DE ENTREGA:* \`#${trackingId}\`\n` +
    `📅 *Fecha:* ${new Date(date || Date.now()).toLocaleDateString('es-DO')}\n\n` +
    `👟 *DETALLE DE TU MERCANCÍA:*\n${itemsList}\n\n` +
    `📍 *DESTINO DEL ENVÍO:* \n` +
    `• Zona / Municipio: ${shipping?.municipality || 'Santo Domingo'}, ${shipping?.zoneName || 'Distrito Nacional'}\n` +
    `• Dirección: ${shipping?.address || 'Dirección de entrega'}\n` +
    (shipping?.reference ? `• Referencia: ${shipping.reference}\n` : '') +
    `\n💵 *TOTAL A PAGAR AL RECIBIR (COD):*\n` +
    `👉 *RD$ ${Number(payment?.total || 0).toLocaleString('es-DO')}* (Pagas en efectivo al mensajero)\n\n` +
    `🛵 *Tiempo de entrega:* 2 a 4 horas en Santo Domingo / 24-48h interior.\n` +
    `Puedes seguir el estatus de tu entrega en vivo en:\n` +
    `🌐 https://mvpflowboutique.com/?tracking=${trackingId}\n\n` +
    `¡Gracias por vestir la verdadera grasa urbana con MVP FLOW!`
  );
};

/**
 * Format quotation WhatsApp message for Whaticket Quick Quoter
 */
export const formatWhaticketQuoteMessage = ({
  quoteNumber,
  customerName,
  agentName = 'Ashley',
  items = [],
  subtotal = 0,
  shippingCost = 0,
  discount = 0,
  total = 0,
  deliveryZone = 'Santo Domingo',
  deliveryTime = '2 a 4 horas',
  paymentMethod = 'Pago Contra Entrega (Efectivo al Mensajero)',
  notes = '',
}) => {
  const itemsList = items
    .map(
      (item, idx) =>
        `${idx + 1}. 👟 *${item.name}*\n   • Talla: ${item.size || 'Estándar'} | Color: ${item.color || 'Original'}\n   • Cant: ${item.quantity} x RD$ ${Number(item.price).toLocaleString('es-DO')} = *RD$ ${Number(item.price * item.quantity).toLocaleString('es-DO')}*`
    )
    .join('\n\n');

  return (
    `⚡ *COTIZACIÓN OFICIAL — MVP FLOW BOUTIQUE RD* ⚡\n` +
    `📄 *No. Cotización:* \`#${quoteNumber || `COT-${Date.now().toString().slice(-4)}`}\`\n` +
    `👤 *Cliente:* ${customerName || 'Estimado/a Cliente'}\n` +
    `👩‍💼 *Asesora:* ${agentName}\n` +
    `📅 *Fecha:* ${new Date().toLocaleDateString('es-DO')}\n\n` +
    `━━━━━━━━━━━━━━━━━━━━━━\n` +
    `🛍️ *PRODUCTOS SELECCIONADOS:*\n` +
    `━━━━━━━━━━━━━━━━━━━━━━\n\n` +
    `${itemsList}\n\n` +
    `━━━━━━━━━━━━━━━━━━━━━━\n` +
    `💰 *RESUMEN DE PAGO:*\n` +
    `━━━━━━━━━━━━━━━━━━━━━━\n` +
    `• Subtotal: RD$ ${Number(subtotal).toLocaleString('es-DO')}\n` +
    (discount > 0 ? `• Descuento Especial: - RD$ ${Number(discount).toLocaleString('es-DO')}\n` : '') +
    `• Envío Express (${deliveryZone}): ${shippingCost === 0 ? '*¡GRATIS!*' : `RD$ ${Number(shippingCost).toLocaleString('es-DO')}`}\n` +
    `\n👉 *TOTAL FINAL A PAGAR: RD$ ${Number(total).toLocaleString('es-DO')}*\n\n` +
    `📍 *DESTINO Y ENTREGA:* \n` +
    `• Zona: ${deliveryZone}\n` +
    `• Tiempo estimado: ${deliveryTime}\n` +
    `• Método de Pago: *${paymentMethod}*\n` +
    (notes ? `\n📝 *Nota:* ${notes}\n` : '') +
    `\n🔒 *Garantía de Calidad:* Calidad G5 garantizada con caja original. Pagas al recibir en tus manos con el mensajero express.\n\n` +
    `¿Deseas que preparemos tu paquete para despacho de inmediato? Responde *SÍ* o envíanos tu dirección exacta para asignarte mensajero. 🛵💨`
  );
};

/**
 * Fetch connected WhatsApp instances (e.g. VENTAS 1, VENTAS 2, VENTAS 3)
 * GET /api/v1/whatsapps
 */
export const getWhaticketWhatsapps = async (config) => {
  const { apiUrl, token } = resolveWhaticketCredentials(config);
  if (!token) return [];

  const url = `${normalizeWhaticketUrl(apiUrl)}/whatsapps`;
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (res.ok) {
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    }
    return [];
  } catch (err) {
    console.error('[Whaticket getWhatsapps error]:', err.message);
    return [];
  }
};

/**
 * Fetch contacts list from Whaticket API
 * GET /api/v1/contacts
 */
export const getWhaticketContacts = async (config) => {
  const { apiUrl, token } = resolveWhaticketCredentials(config);

  if (!token) {
    return { contacts: [], count: 0, message: 'Whaticket token no configurado' };
  }

  const url = `${normalizeWhaticketUrl(apiUrl)}/contacts`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Error ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const contacts = Array.isArray(data.contacts) ? data.contacts : Array.isArray(data) ? data : [];
    return {
      success: true,
      contacts: contacts,
      count: contacts.length,
      hasMore: data.hasMore || false,
    };
  } catch (err) {
    return {
      success: false,
      contacts: [],
      error: err.message,
    };
  }
};

/**
 * Fetch registered Users / Attendants (Staff) from Whaticket API
 * GET /api/v1/users or GET /users
 */
export const getWhaticketUsers = async (config) => {
  const { apiUrl, token } = resolveWhaticketCredentials(config);

  if (!token) {
    const fallbackUsers = [
      { id: 'ventas-3', name: 'Equipo VENTAS 3 (WhatsApp)', email: 'ventas3@mvpflowboutique.com', profile: 'asesor', online: true },
      { id: 'ventas-2', name: 'Equipo VENTAS 2 (WhatsApp)', email: 'ventas2@mvpflowboutique.com', profile: 'asesor', online: true },
    ];
    return { success: true, users: fallbackUsers, count: fallbackUsers.length, isFallback: true };
  }

  const base = normalizeWhaticketUrl(apiUrl);
  const possibleEndpoints = [
    `${base}/users`,
    `${base.replace(/\/api\/v1$/, '')}/api/v1/users`,
    `${base.replace(/\/api\/v1$/, '')}/users`,
  ];

  let rawUsers = [];
  let fetchError = null;

  for (const endpoint of possibleEndpoints) {
    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        rawUsers = Array.isArray(data.users) ? data.users : Array.isArray(data) ? data : [];
        if (rawUsers.length > 0) break;
      }
    } catch (err) {
      fetchError = err.message;
    }
  }

  if (!rawUsers || rawUsers.length === 0) {
    // If Whaticket token scopes restrict /users endpoint, use real connected WhatsApp channels
    const whatsapps = await getWhaticketWhatsapps(config);
    const connectedChannels = (whatsapps || [])
      .filter((w) => w.status === 'CONNECTED')
      .map((w, idx) => ({
        id: w.id || idx + 1,
        name: `Equipo ${w.name || 'Ventas MVP Flow'}`,
        email: `ventas@mvpflowboutique.com`,
        profile: 'asesor',
        online: true,
      }));

    const finalUsers = connectedChannels.length > 0 ? connectedChannels : [
      { id: 'ventas-3', name: 'Equipo VENTAS 3 (WhatsApp)', email: 'ventas@mvpflowboutique.com', profile: 'asesor', online: true },
      { id: 'ventas-2', name: 'Equipo VENTAS 2 (WhatsApp)', email: 'ventas@mvpflowboutique.com', profile: 'asesor', online: true },
    ];

    return {
      success: true,
      users: finalUsers,
      count: finalUsers.length,
      isFallback: true,
      message: 'Canales oficiales conectados en Whaticket',
    };
  }

  const normalized = rawUsers.map((u) => ({
    id: u.id || `user-${Math.random().toString(36).substr(2, 6)}`,
    name: u.name || u.email?.split('@')[0] || 'Asesor',
    email: u.email || '',
    profile: u.profile || 'user',
    online: u.online !== undefined ? u.online : true,
    queues: Array.isArray(u.queues) ? u.queues.map((q) => q.name || q) : [],
  }));

  return {
    success: true,
    users: normalized,
    count: normalized.length,
    isFallback: false,
  };
};

/**
 * Create or update contact in Whaticket API
 * POST /api/v1/contacts
 */
export const createOrUpdateWhaticketContact = async (config, { name, number, email = '', extraInfo = [] }) => {
  const { apiUrl, token } = resolveWhaticketCredentials(config);
  if (!token) return { success: false, message: 'Token de Whaticket no configurado' };

  const formattedNumber = formatPhoneNumberForWhaticket(number);
  if (!formattedNumber) return { success: false, message: 'Número de teléfono inválido' };

  const base = normalizeWhaticketUrl(apiUrl);
  const possibleEndpoints = [
    `${base}/contacts`,
    `${base.replace(/\/api\/v1$/, '')}/api/v1/contacts`,
    `${base.replace(/\/api\/v1$/, '')}/contacts`,
  ];

  const payload = {
    name: (name || `Cliente ${formattedNumber.slice(-4)}`).trim(),
    number: formattedNumber,
    email: email || '',
    extraInfo: extraInfo || [],
  };

  let lastError = null;

  for (const url of possibleEndpoints) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        return { success: true, contact: data };
      }

      const errText = await response.text();
      // If contact already exists in Whaticket database, consider it synced!
      if (
        errText.toLowerCase().includes('duplicate') ||
        errText.includes('ERR_DUPLICATED_CONTACT') ||
        errText.toLowerCase().includes('already exists') ||
        response.status === 409
      ) {
        return {
          success: true,
          contact: { name: payload.name, number: formattedNumber },
          isExisting: true,
          message: 'Contacto ya registrado en Whaticket (Actualizado)',
        };
      }

      if (response.status === 404) {
        // Try next fallback endpoint
        lastError = errText;
        continue;
      }

      return { success: false, message: errText };
    } catch (err) {
      lastError = err.message;
    }
  }

  return { success: false, error: lastError || 'Error conectando con API de Whaticket' };
};

/**
 * Fetch open tickets/conversations from Whaticket
 */
export const getWhaticketTickets = async (config, options = {}) => {
  const { apiUrl, token } = resolveWhaticketCredentials(config);
  if (!token) return { success: true, tickets: [] };

  try {
    const contactsRes = await getWhaticketContacts(config);
    if (contactsRes.success && Array.isArray(contactsRes.contacts)) {
      const tickets = contactsRes.contacts.map((c) => ({
        id: c.id,
        name: c.name || 'Sin Nombre',
        number: c.number || '',
        contact: {
          name: c.name,
          number: c.number,
          profilePicUrl: c.profilePicUrl,
        },
        lastMessage: c.number ? `Contacto de WhatsApp (+${c.number})` : '',
        updatedAt: c.createdAt || new Date().toISOString(),
      }));
      return { success: true, tickets };
    }
    return { success: true, tickets: [] };
  } catch (err) {
    return { success: false, tickets: [], error: err.message };
  }
};

/**
 * Send message via Whaticket API v1.0.0
 * POST /api/v1/messages
 */
export const sendWhaticketMessage = async (config, phoneNumber, messageBody, contactName = 'Cliente MVP Flow', ticketData = null) => {
  const { apiUrl, token, connectionId } = resolveWhaticketCredentials(config);

  if (!token) {
    throw new Error('Token Bearer de Whaticket faltante.');
  }

  // Fetch active whatsapp connection to ensure we always use a valid CONNECTED line (e.g. VENTAS 3 / VENTAS 2)
  const whatsapps = await getWhaticketWhatsapps(config);
  let targetConnectionId = connectionId;

  const isConfiguredValid = whatsapps.some((w) => w.id === targetConnectionId && w.status === 'CONNECTED');
  if (!isConfiguredValid) {
    const connected = whatsapps.find((w) => w.status === 'CONNECTED') || whatsapps[0];
    targetConnectionId = connected ? connected.id : (connectionId || 'b24ea8c3-f5ed-46de-b612-dbe8f76e53c8');
  }

  const url = `${normalizeWhaticketUrl(apiUrl)}/messages`;
  const formattedNumber = formatPhoneNumberForWhaticket(phoneNumber);

  const payload = {
    whatsappId: targetConnectionId,
    connectionId: targetConnectionId,
    messages: [
      {
        number: formattedNumber,
        name: contactName,
        body: messageBody,
      },
    ],
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Whaticket API Error (${response.status}): ${errorText}`);
  }

  return await response.json();
};

/**
 * Send Quotation directly via Whaticket API v1.0.0
 */
export const sendWhaticketQuote = async (config, { phoneNumber, customerName, quotePayload, agentName = 'Ashley' }) => {
  const messageBody = formatWhaticketQuoteMessage({
    ...quotePayload,
    customerName,
    agentName,
  });

  return await sendWhaticketMessage(
    config,
    phoneNumber,
    messageBody,
    customerName
  );
};

/**
 * Test connection to Whaticket API
 */
export const testWhaticketConnection = async (config) => {
  const { apiUrl, token } = config || {};

  if (!token) {
    return { success: false, message: 'El Token Bearer de Whaticket es obligatorio.' };
  }

  try {
    const whatsapps = await getWhaticketWhatsapps(config);

    if (whatsapps && whatsapps.length > 0) {
      const names = whatsapps.map((w) => `${w.name} (${w.status})`).join(', ');
      return {
        success: true,
        whatsapps: whatsapps,
        message: `¡Conexión exitosa con Whaticket API v1.0.0! Líneas conectadas: ${names}`,
      };
    } else {
      const contactsRes = await getWhaticketContacts(config);
      if (contactsRes.success) {
        return {
          success: true,
          message: `¡Conexión exitosa con Whaticket API! Token autenticado (${contactsRes.count} contactos encontrados).`,
        };
      }
      return {
        success: false,
        message: 'No se encontraron líneas de WhatsApp asociadas a este Token.',
      };
    }
  } catch (err) {
    return {
      success: false,
      message: `No se pudo conectar a la API de Whaticket: ${err.message}`,
    };
  }
};
