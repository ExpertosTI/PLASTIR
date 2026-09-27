/**
 * Contact Sync & Address Book Engine (WhatsApp Status & Mobile Contact Sync)
 * Generates universal vCard (.vcf) and Google Contacts CSV for instant import on iPhone/Android,
 * ensuring all customers see WhatsApp Stories/Status, plus two-way sync with Whaticket.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  formatPhoneNumberForWhaticket,
  getWhaticketContacts,
  createOrUpdateWhaticketContact
} from './whaticketService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../data');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const CONFIG_FILE = path.join(DATA_DIR, 'config.json');
const CONTACTS_FILE = path.join(DATA_DIR, 'contacts.json');

const getJson = (filePath, fallback = []) => {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err.message);
  }
  return fallback;
};

const saveJson = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err.message);
  }
};

const DEFAULT_WHATICKET_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJjcmVhdGU6bWVzc2FnZXMiLCJjcmVhdGU6bWVkaWFzIiwicmVhZDp3aGF0c2FwcHMiLCJ1cGRhdGU6d2hhdHNhcHBzIiwiY3JlYXRlOmNvbnRhY3RzIiwicmVhZDpjb250YWN0cyJdLCJjb21wYW55SWQiOiIxYjZmMzk1OC05NTExLTRiYzUtOTRkNy04YmE2ZTI2MDYxYTUiLCJpYXQiOjE3ODc4Nzc3MTB9.igKUXGwsEUCqSWhZxgWkpghAmCasRJ9EgazyZUFHr-M';

export const getActiveWhaticketConfig = () => {
  const config = getJson(CONFIG_FILE, {});
  const wc = config.whaticketConfig || {};
  return {
    apiUrl: (wc.apiUrl || process.env.WHATICKET_API_URL || 'https://api.whaticket.com/api/v1').trim(),
    token: (wc.token || process.env.WHATICKET_TOKEN || DEFAULT_WHATICKET_TOKEN).trim(),
    companyId: wc.companyId || process.env.WHATICKET_COMPANY_ID || '1b6f3958-9511-4bc5-94d7-8ba6e26061a5',
    connectionId: wc.connectionId || process.env.WHATICKET_CONNECTION_ID || 'b24ea8c3-f5ed-46de-b612-dbe8f76e53c8',
  };
};

// In-memory cache for Whaticket contacts to make /api/contacts/list ultra fast
let whaticketContactsCache = {
  timestamp: 0,
  contacts: [],
};

export const invalidateWhaticketCache = () => {
  whaticketContactsCache = { timestamp: 0, contacts: [] };
};

/**
 * Extract unified, de-duplicated list of contacts from Orders, Contacts file and Whaticket
 */
export const getUnifiedContacts = async () => {
  const orders = getJson(ORDERS_FILE, []);
  const manualContacts = getJson(CONTACTS_FILE, []);
  const whaticketConfig = getActiveWhaticketConfig();

  const contactsMap = new Map(); // phone -> contact object

  // 0. Ingest from dedicated contacts.json
  manualContacts.forEach((c) => {
    const cleanPhone = formatPhoneNumberForWhaticket(c.phone || c.number || '');
    if (!cleanPhone || cleanPhone.length < 8) return;
    contactsMap.set(cleanPhone, {
      id: c.id || `manual_${cleanPhone}`,
      name: (c.name || '').trim() || `Cliente +${cleanPhone.slice(-4)}`,
      phone: cleanPhone,
      rawPhone: c.rawPhone || c.phone || cleanPhone,
      city: c.city || 'Santo Domingo',
      address: c.address || '',
      source: c.source || 'Catálogo / Manual',
      orderCount: c.orderCount || 0,
      totalSpent: Number(c.totalSpent || 0),
      lastOrderDate: c.createdAt || c.lastOrderDate || '',
      inWhaticket: !!c.inWhaticket,
      note: c.note || '',
    });
  });

  // 1. Ingest from Orders
  orders.forEach((o) => {
    const rawPhone = o.customer?.phone || o.shipping?.phone || '';
    const cleanPhone = formatPhoneNumberForWhaticket(rawPhone);
    if (!cleanPhone || cleanPhone.length < 8) return;

    const name = (o.customer?.name || '').trim() || 'Cliente MVP Flow';
    const city = o.shipping?.municipality || o.shipping?.zoneName || 'Santo Domingo';
    const address = o.shipping?.address || '';
    const lastOrderDate = o.date || o.createdAt || '';
    const totalSpent = Number(o.payment?.total || 0);

    if (!contactsMap.has(cleanPhone)) {
      contactsMap.set(cleanPhone, {
        id: `ord_${cleanPhone}`,
        name,
        phone: cleanPhone,
        rawPhone,
        city,
        address,
        source: 'Pedido Web / Catálogo',
        orderCount: 1,
        totalSpent,
        lastOrderDate,
        inWhaticket: false,
      });
    } else {
      const existing = contactsMap.get(cleanPhone);
      existing.orderCount += 1;
      existing.totalSpent += totalSpent;
      if (name && existing.name === 'Cliente MVP Flow') existing.name = name;
      if (address && !existing.address) existing.address = address;
    }
  });

  // 2. Ingest from Whaticket API (cached for 60 seconds for instant UI response)
  if (whaticketConfig.token) {
    try {
      let wtContacts = [];
      const now = Date.now();
      if (whaticketContactsCache.timestamp && (now - whaticketContactsCache.timestamp < 60000) && whaticketContactsCache.contacts.length > 0) {
        wtContacts = whaticketContactsCache.contacts;
      } else {
        const whaticketRes = await getWhaticketContacts(whaticketConfig);
        if (whaticketRes.success && Array.isArray(whaticketRes.contacts)) {
          wtContacts = whaticketRes.contacts;
          whaticketContactsCache = {
            timestamp: now,
            contacts: wtContacts,
          };
        }
      }

      wtContacts.forEach((c) => {
        const cleanPhone = formatPhoneNumberForWhaticket(c.number || '');
        if (!cleanPhone) return;

        if (contactsMap.has(cleanPhone)) {
          const existing = contactsMap.get(cleanPhone);
          existing.inWhaticket = true;
          if (c.name && (!existing.name || existing.name === 'Cliente MVP Flow')) {
            existing.name = c.name;
          }
        } else {
          contactsMap.set(cleanPhone, {
            id: `wt_${c.id || cleanPhone}`,
            name: c.name || `Cliente WhatsApp (+${cleanPhone})`,
            phone: cleanPhone,
            rawPhone: c.number,
            city: 'Santo Domingo',
            address: '',
            source: 'Whaticket Chat',
            orderCount: 0,
            totalSpent: 0,
            lastOrderDate: c.updatedAt || '',
            inWhaticket: true,
          });
        }
      });
    } catch (err) {
      console.log('[Whaticket Contacts Ingest Warning]:', err.message);
    }
  }

  const result = Array.from(contactsMap.values()).map((c) => {
    let category = 'lead';
    let categoryLabel = 'Prospecto WhatsApp';
    if (c.totalSpent >= 5000 || c.orderCount >= 2) {
      category = 'vip';
      categoryLabel = 'Cliente VIP';
    } else if (c.orderCount >= 1 || c.totalSpent > 0) {
      category = 'buyer';
      categoryLabel = 'Comprador Frecuente';
    } else if (c.source === 'Catálogo / Manual' || c.source?.includes('Manual')) {
      category = 'manual';
      categoryLabel = 'Registro Manual';
    }
    return {
      ...c,
      category,
      categoryLabel,
    };
  }).sort((a, b) => b.totalSpent - a.totalSpent || b.orderCount - a.orderCount);
  return result;
};

/**
 * Generate standard vCard 3.0 (.vcf) buffer/string
 * Imports directly into iPhone Contacts, iCloud, Android Address Book & Google Contacts
 */
export const generateVCardFile = async (prefix = 'MVP Cliente - ') => {
  const contacts = await getUnifiedContacts();

  let vcfContent = '';

  contacts.forEach((c) => {
    const displayName = `${prefix}${c.name.replace(/;/g, ' ')}`.trim();
    const formattedPhone = c.phone.startsWith('1') ? `+${c.phone}` : `+1${c.phone}`;
    const cleanAddress = (c.address || '').replace(/[\r\n]+/g, ', ');
    const cleanCity = (c.city || 'Santo Domingo').replace(/[\r\n]+/g, ' ');

    vcfContent += 'BEGIN:VCARD\r\n';
    vcfContent += 'VERSION:3.0\r\n';
    vcfContent += `FN:${displayName}\r\n`;
    vcfContent += `N:${c.name};;;;\r\n`;
    vcfContent += `TEL;TYPE=CELL,VOICE,PREF:${formattedPhone}\r\n`;
    vcfContent += `ORG:MVP FLOW Boutique RD\r\n`;
    vcfContent += `TITLE:Cliente Verificado WhatsApp\r\n`;
    if (cleanAddress || cleanCity) {
      vcfContent += `ADR;TYPE=HOME:;;${cleanAddress};${cleanCity};;Dominican Republic\r\n`;
    }
    vcfContent += `NOTE:Cliente MVP FLOW | Pedidos: ${c.orderCount} | Gasto: RD$ ${c.totalSpent.toLocaleString()} | WhatsApp Status Activo\r\n`;
    vcfContent += `CATEGORIES:Clientes MVP FLOW,WhatsApp Status\r\n`;
    vcfContent += 'END:VCARD\r\n';
  });

  return vcfContent;
};

/**
 * Generate Google Contacts CSV format for web import on contacts.google.com
 */
export const generateGoogleContactsCsv = async () => {
  const contacts = await getUnifiedContacts();

  const headers = [
    'Name',
    'Given Name',
    'Family Name',
    'Group Membership',
    'Phone 1 - Type',
    'Phone 1 - Value',
    'Address 1 - Formatted',
    'Address 1 - City',
    'Organization 1 - Name',
    'Notes'
  ];

  const escapeCsv = (str) => {
    const clean = String(str || '').replace(/"/g, '""');
    return `"${clean}"`;
  };

  const rows = [headers.join(',')];

  contacts.forEach((c) => {
    const formattedPhone = c.phone.startsWith('1') ? `+${c.phone}` : `+1${c.phone}`;
    rows.push([
      escapeCsv(`MVP Cliente - ${c.name}`),
      escapeCsv(c.name.split(' ')[0] || c.name),
      escapeCsv(c.name.split(' ').slice(1).join(' ') || ''),
      escapeCsv('* myContacts ::: Clientes MVP FLOW'),
      escapeCsv('Mobile'),
      escapeCsv(formattedPhone),
      escapeCsv(c.address || c.city || 'Santo Domingo, RD'),
      escapeCsv(c.city || 'Santo Domingo'),
      escapeCsv('MVP FLOW Boutique RD'),
      escapeCsv(`Pedidos: ${c.orderCount} | Total: RD$ ${c.totalSpent.toLocaleString()} | WhatsApp Status Sync`),
    ].join(','));
  });

  return rows.join('\r\n');
};

/**
 * Batch Push Unsynced Contacts to Whaticket API
 */
export const syncAllContactsToWhaticket = async () => {
  const whaticketConfig = getActiveWhaticketConfig();

  if (!whaticketConfig.token) {
    return { success: false, message: 'Token de Whaticket no configurado.' };
  }

  const contacts = await getUnifiedContacts();
  let syncedCount = 0;
  let errorCount = 0;

  for (const c of contacts) {
    try {
      const res = await createOrUpdateWhaticketContact(whaticketConfig, {
        name: c.name,
        number: c.phone,
        extraInfo: [
          { name: 'Origen', value: c.source },
          { name: 'Pedidos', value: String(c.orderCount) },
          { name: 'Total Gastado', value: `RD$ ${c.totalSpent.toLocaleString()}` },
          { name: 'Ciudad', value: c.city },
        ],
      });
      if (res.success) syncedCount += 1;
      else errorCount += 1;
    } catch {
      errorCount += 1;
    }
  }

  invalidateWhaticketCache();
  return {
    success: true,
    syncedCount,
    errorCount,
    message: `✔ ${syncedCount} contactos sincronizados exitosamente con Whaticket.`,
  };
};

/**
 * Manually create and save a new contact, immediately syncing with Whaticket
 */
export const createManualContact = async ({ name, phone, city = 'Santo Domingo', address = '', note = '', email = '' }) => {
  const cleanPhone = formatPhoneNumberForWhaticket(phone);
  if (!cleanPhone || cleanPhone.length < 8) {
    throw new Error('Número de teléfono inválido (debe contener al menos 8 dígitos numéricos).');
  }

  const cleanName = (name || '').trim() || `Cliente +${cleanPhone.slice(-4)}`;
  const config = getJson(CONFIG_FILE, {});
  const whaticketConfig = config.whaticketConfig || {
    apiUrl: process.env.WHATICKET_API_URL || 'https://api.whaticket.com/api/v1',
    token: process.env.WHATICKET_TOKEN || '',
  };

  // 1. Sync to Whaticket
  let whaticketResult = null;
  if (whaticketConfig.token) {
    try {
      whaticketResult = await createOrUpdateWhaticketContact(whaticketConfig, {
        name: cleanName,
        number: cleanPhone,
        email,
        extraInfo: [
          { name: 'Ciudad', value: city },
          { name: 'Origen', value: 'Catálogo / Manual' },
          ...(note ? [{ name: 'Nota', value: note }] : []),
        ],
      });
    } catch (err) {
      console.error('[Whaticket contact creation error]:', err.message);
    }
  }

  // 2. Persist to contacts.json
  const contacts = getJson(CONTACTS_FILE, []);
  const existingIdx = contacts.findIndex((c) => formatPhoneNumberForWhaticket(c.phone) === cleanPhone);

  const contactData = {
    id: `contact_${cleanPhone}_${Date.now()}`,
    name: cleanName,
    phone: cleanPhone,
    rawPhone: phone,
    city: city || 'Santo Domingo',
    address: address || '',
    email: email || '',
    note: note || '',
    source: 'Catálogo / Manual',
    orderCount: 0,
    totalSpent: 0,
    inWhaticket: whaticketResult?.success || false,
    createdAt: new Date().toISOString(),
  };

  if (existingIdx >= 0) {
    contacts[existingIdx] = { ...contacts[existingIdx], ...contactData, id: contacts[existingIdx].id };
  } else {
    contacts.unshift(contactData);
  }

  saveJson(CONTACTS_FILE, contacts);
  invalidateWhaticketCache();

  return {
    success: true,
    contact: contactData,
    whaticketSynced: whaticketResult?.success || false,
    message: whaticketResult?.success
      ? `✔ Contacto "${cleanName}" guardado y sincronizado con Whaticket exitosamente.`
      : `✔ Contacto "${cleanName}" guardado localmente (Whaticket no conectado).`,
  };
};

/**
 * Parse vCard 2.1 / 3.0 / 4.0 (.vcf) content exported from iPhone, Android or Google
 */
export const parseVcfText = (vcfText) => {
  if (!vcfText || typeof vcfText !== 'string') return [];

  // Unfold folded lines (RFC 2426 / 6350)
  const unfolded = vcfText.replace(/\r\n[ \t]/g, '').replace(/\n[ \t]/g, '');
  const vcardRegex = /BEGIN:VCARD[\s\S]*?END:VCARD/gi;
  const matches = unfolded.match(vcardRegex) || [];

  const parsed = [];

  for (const card of matches) {
    let name = '';
    let phone = '';
    let email = '';
    let city = '';
    let address = '';
    let note = '';

    const lines = card.split(/\r?\n/);
    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) continue;

      if (/^FN(;.*)?:/i.test(line)) {
        name = line.replace(/^FN(;.*)?:/i, '').trim();
      } else if (!name && /^N(;.*)?:/i.test(line)) {
        const parts = line.replace(/^N(;.*)?:/i, '').split(';').map((p) => p.trim()).filter(Boolean);
        name = parts.reverse().join(' ').trim();
      } else if (!phone && /^TEL(;.*)?:/i.test(line)) {
        phone = line.replace(/^TEL(;.*)?:/i, '').trim();
      } else if (!email && /^EMAIL(;.*)?:/i.test(line)) {
        email = line.replace(/^EMAIL(;.*)?:/i, '').trim();
      } else if (!address && /^ADR(;.*)?:/i.test(line)) {
        const parts = line.replace(/^ADR(;.*)?:/i, '').split(';').map((p) => p.trim()).filter(Boolean);
        if (parts.length > 0) {
          address = parts.join(', ');
          city = parts[parts.length - 2] || parts[parts.length - 1] || '';
        }
      } else if (!note && /^NOTE(;.*)?:/i.test(line)) {
        note = line.replace(/^NOTE(;.*)?:/i, '').trim();
      }
    }

    const cleanPhone = formatPhoneNumberForWhaticket(phone);
    if (cleanPhone && cleanPhone.length >= 8) {
      parsed.push({
        name: name || `Contacto +${cleanPhone.slice(-4)}`,
        phone: cleanPhone,
        rawPhone: phone,
        email,
        city: city || 'Santo Domingo',
        address,
        note,
        source: 'Importado de Dispositivo (.vcf)',
      });
    }
  }

  return parsed;
};

/**
 * Parse CSV contacts exported from Google Contacts, Excel or phone apps
 */
export const parseCsvText = (csvText) => {
  if (!csvText || typeof csvText !== 'string') return [];

  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  // Simple CSV line splitter that respects quotes
  const splitCsvLine = (line) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if ((char === ',' || char === ';') && !inQuotes) {
        result.push(current.trim().replace(/^"(.*)"$/, '$1'));
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim().replace(/^"(.*)"$/, '$1'));
    return result;
  };

  const header = splitCsvLine(lines[0].toLowerCase());
  const nameIdx = header.findIndex((h) => h.includes('name') || h.includes('nombre') || h.includes('display'));
  const phoneIdx = header.findIndex((h) => h.includes('phone') || h.includes('tel') || h.includes('cel') || h.includes('mobile') || h.includes('numero'));
  const emailIdx = header.findIndex((h) => h.includes('mail') || h.includes('correo'));
  const cityIdx = header.findIndex((h) => h.includes('city') || h.includes('ciudad') || h.includes('municip'));
  const addrIdx = header.findIndex((h) => h.includes('address') || h.includes('direcc'));

  const parsed = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = splitCsvLine(lines[i]);
    if (cols.length === 0) continue;

    const phoneRaw = phoneIdx >= 0 ? cols[phoneIdx] : '';
    const cleanPhone = formatPhoneNumberForWhaticket(phoneRaw);
    if (!cleanPhone || cleanPhone.length < 8) continue;

    const name = nameIdx >= 0 ? cols[nameIdx] : '';
    const email = emailIdx >= 0 ? cols[emailIdx] : '';
    const city = cityIdx >= 0 ? cols[cityIdx] : 'Santo Domingo';
    const address = addrIdx >= 0 ? cols[addrIdx] : '';

    parsed.push({
      name: name || `Contacto +${cleanPhone.slice(-4)}`,
      phone: cleanPhone,
      rawPhone: phoneRaw,
      email,
      city,
      address,
      source: 'Importado de Dispositivo (.csv)',
    });
  }

  return parsed;
};

/**
 * Import contacts from a phone / device file (.vcf or .csv) and sync them to Whaticket
 */
export const importDeviceContacts = async ({ fileContent, fileName = '', syncToWhaticket = true }) => {
  if (!fileContent) {
    throw new Error('El archivo está vacío o no contiene datos válidos.');
  }

  const isVcf = fileName.toLowerCase().endsWith('.vcf') || fileContent.includes('BEGIN:VCARD');
  const parsedList = isVcf ? parseVcfText(fileContent) : parseCsvText(fileContent);

  if (parsedList.length === 0) {
    return {
      success: false,
      message: 'No se encontraron números de teléfono válidos en el archivo proporcionado.',
      parsedCount: 0,
      addedCount: 0,
      syncedCount: 0,
    };
  }

  const existingContacts = getJson(CONTACTS_FILE, []);
  const existingMap = new Map();
  existingContacts.forEach((c) => {
    const p = formatPhoneNumberForWhaticket(c.phone || c.rawPhone);
    if (p) existingMap.set(p, c);
  });

  let addedCount = 0;
  let updatedCount = 0;

  for (const item of parsedList) {
    const p = item.phone;
    if (existingMap.has(p)) {
      const current = existingMap.get(p);
      let changed = false;
      if ((!current.name || current.name.startsWith('Cliente +')) && item.name) {
        current.name = item.name;
        changed = true;
      }
      if (!current.address && item.address) {
        current.address = item.address;
        changed = true;
      }
      if (!current.email && item.email) {
        current.email = item.email;
        changed = true;
      }
      if (changed) updatedCount += 1;
    } else {
      const newEntry = {
        id: `device_${p}_${Date.now()}`,
        name: item.name,
        phone: p,
        rawPhone: item.rawPhone,
        city: item.city || 'Santo Domingo',
        address: item.address || '',
        email: item.email || '',
        note: item.note || 'Importado desde dispositivo',
        source: item.source || 'Dispositivo Móvil',
        orderCount: 0,
        totalSpent: 0,
        inWhaticket: false,
        createdAt: new Date().toISOString(),
      };
      existingContacts.unshift(newEntry);
      existingMap.set(p, newEntry);
      addedCount += 1;
    }
  }

  saveJson(CONTACTS_FILE, existingContacts);
  invalidateWhaticketCache();

  // Sync to Whaticket if requested
  let whaticketSyncedCount = 0;
  const whaticketConfig = getActiveWhaticketConfig();

  if (syncToWhaticket && whaticketConfig.token) {
    for (const item of parsedList) {
      try {
        const res = await createOrUpdateWhaticketContact(whaticketConfig, {
          name: item.name,
          number: item.phone,
          email: item.email,
          extraInfo: [
            { name: 'Origen', value: item.source || 'Dispositivo Móvil' },
            { name: 'Ciudad', value: item.city || 'Santo Domingo' },
            ...(item.note ? [{ name: 'Nota', value: item.note }] : []),
          ],
        });
        if (res.success) {
          whaticketSyncedCount += 1;
          const entry = existingMap.get(item.phone);
          if (entry) entry.inWhaticket = true;
        }
      } catch (err) {
        console.warn(`[Whaticket sync device contact warn: ${item.phone}]:`, err.message);
      }
    }
    saveJson(CONTACTS_FILE, existingContacts);
    invalidateWhaticketCache();
  }

  return {
    success: true,
    totalParsed: parsedList.length,
    addedCount,
    updatedCount,
    whaticketSyncedCount,
    message: `✔ ${parsedList.length} contactos procesados (+${addedCount} nuevos, ${updatedCount} actualizados, ${whaticketSyncedCount} sincronizados con Whaticket).`,
  };
};

/**
 * Perform Full Two-Way Synchronization:
 * Whaticket ⇄ PLASTIR ⇄ Dispositivos
 */
export const performFullTwoWaySync = async () => {
  const whaticketConfig = getActiveWhaticketConfig();
  const stepResults = [];

  // Step 1: Pull from Whaticket
  let pulledFromWhaticket = 0;
  if (whaticketConfig.token) {
    try {
      const res = await getWhaticketContacts(whaticketConfig);
      if (res.success && Array.isArray(res.contacts)) {
        pulledFromWhaticket = res.contacts.length;
        stepResults.push(`✔ ${pulledFromWhaticket} contactos recibidos desde Whaticket.`);
      }
    } catch (err) {
      stepResults.push(`⚠ Advertencia al consultar Whaticket: ${err.message}`);
    }
  }

  // Step 2: Push all local unsynced contacts to Whaticket
  let pushedToWhaticket = 0;
  if (whaticketConfig.token) {
    const pushRes = await syncAllContactsToWhaticket();
    pushedToWhaticket = pushRes.syncedCount || 0;
    stepResults.push(`✔ ${pushedToWhaticket} contactos locales subidos y asegurados en Whaticket.`);
  }

  // Step 3: Get unified clean contacts list
  const unified = await getUnifiedContacts();

  return {
    success: true,
    totalContacts: unified.length,
    pulledFromWhaticket,
    pushedToWhaticket,
    steps: stepResults,
    message: `✔ Sincronización bidireccional completada: ${unified.length} contactos unificados listos para todos los dispositivos y Whaticket.`,
  };
};

