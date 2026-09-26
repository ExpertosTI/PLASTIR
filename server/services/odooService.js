/**
 * Odoo ERP Integration Service (RENACE Core Engine)
 * Synchronizes inventory, product templates, stock levels, and pricing directly with Odoo 16/17/18 JSON-RPC.
 */

import https from 'https';
import http from 'http';

/**
 * Universal JSON-RPC client for Odoo
 */
export const callJsonRpc = (baseUrl, endpoint, params = {}) => {
  return new Promise((resolve, reject) => {
    try {
      const parsedUrl = new URL(endpoint, baseUrl);
      const isHttps = parsedUrl.protocol === 'https:';
      const client = isHttps ? https : http;

      const payload = JSON.stringify({
        jsonrpc: '2.0',
        method: 'call',
        params: params,
        id: Math.floor(Math.random() * 1000000),
      });

      const options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || (isHttps ? 443 : 80),
        path: parsedUrl.pathname + parsedUrl.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
          'User-Agent': 'RENACE-Catalog-Sync/2.0',
        },
        timeout: 25000,
      };

      const req = client.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            const data = JSON.parse(body);
            if (data.error) {
              const errMsg =
                data.error.data?.message ||
                data.error.message ||
                JSON.stringify(data.error);
              return reject(new Error(`Odoo RPC Error: ${errMsg}`));
            }
            resolve(data.result);
          } catch (e) {
            reject(new Error(`Respuesta Odoo no es JSON válido: ${body.substring(0, 150)}`));
          }
        });
      });

      req.on('error', (err) => reject(new Error(`Error de red con Odoo: ${err.message}`)));
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Timeout de conexión con Odoo (>25s)'));
      });

      req.write(payload);
      req.end();
    } catch (err) {
      reject(err);
    }
  });
};

/**
 * Test connection and authentication with Odoo instance
 */
export const testOdooConnection = async (config) => {
  const url = (config?.url || process.env.ODOO_URL || 'https://mvpflow.renace.tech').trim();
  const db = (config?.db || process.env.ODOO_DB || 'mvpflow').trim();
  const username = (config?.username || process.env.ODOO_USERNAME || 'info@mvpflowboutique.com').trim();
  const authSecret = (config?.apiKey || config?.password || process.env.ODOO_API_KEY || 'abf6067a002549afa0b3b5a6c925d78262658f5c').trim();

  if (!url || !db || !username || !authSecret) {
    return {
      success: false,
      message: 'Faltan parámetros de conexión (URL, Base de Datos, Usuario o API Key / Contraseña).',
    };
  }

  try {
    // 1. Check version info
    let serverVersion = 'Desconocida';
    try {
      const versionInfo = await callJsonRpc(url, '/jsonrpc', {
        service: 'common',
        method: 'version',
        args: [],
      });
      if (versionInfo?.server_version) {
        serverVersion = versionInfo.server_version;
      }
    } catch {}

    // 2. Authenticate
    let uid = null;
    try {
      const authResult = await callJsonRpc(url, '/jsonrpc', {
        service: 'common',
        method: 'authenticate',
        args: [db, username, authSecret, {}],
      });
      if (typeof authResult === 'number' && authResult > 0) {
        uid = authResult;
      }
    } catch (e) {
      console.log('[Odoo direct auth failed, trying web session]:', e.message);
    }

    if (!uid) {
      try {
        const session = await callJsonRpc(url, '/web/session/authenticate', {
          db,
          login: username,
          password: authSecret,
        });
        if (session?.uid) uid = session.uid;
      } catch {}
    }

    if (!uid) {
      return {
        success: false,
        message: `Credenciales rechazadas por Odoo (${db} en ${url}). Verifica usuario y API Key / Contraseña.`,
      };
    }

    // 3. Count total products in Odoo database
    let totalProductsCount = 0;
    try {
      totalProductsCount = await callJsonRpc(url, '/jsonrpc', {
        service: 'object',
        method: 'execute_kw',
        args: [
          db,
          uid,
          authSecret,
          'product.template',
          'search_count',
          [[['active', '=', true]]],
        ],
      });
    } catch (e) {
      console.log('[Odoo search_count warning]:', e.message);
    }

    return {
      success: true,
      uid,
      serverVersion,
      totalProductsInOdoo: totalProductsCount,
      message: `¡Conexión exitosa con Odoo ${serverVersion}! Base de datos: ${db} (${totalProductsCount} productos activos detectados).`,
    };
  } catch (err) {
    return {
      success: false,
      message: `No se pudo conectar con Odoo: ${err.message}`,
    };
  }
};

/**
 * Fetch and normalize ALL products from Odoo ERP without arbitrary limits
 */
export const fetchOdooProducts = async (config) => {
  const url = (config?.url || process.env.ODOO_URL || 'https://mvpflow.renace.tech').trim();
  const db = (config?.db || process.env.ODOO_DB || 'mvpflow').trim();
  const username = (config?.username || process.env.ODOO_USERNAME || 'info@mvpflowboutique.com').trim();
  const authSecret = (config?.apiKey || config?.password || process.env.ODOO_API_KEY || 'abf6067a002549afa0b3b5a6c925d78262658f5c').trim();
  const limit = Number(config?.limit || 0);
  const minStockVal = config?.minStock !== undefined ? Number(config.minStock) : 0;

  if (!url || !db || !username || !authSecret) {
    throw new Error('Configuración de Odoo incompleta.');
  }

  // Authenticate
  let uid = null;
  try {
    const authResult = await callJsonRpc(url, '/jsonrpc', {
      service: 'common',
      method: 'authenticate',
      args: [db, username, authSecret, {}],
    });
    if (typeof authResult === 'number' && authResult > 0) uid = authResult;
  } catch (e) {
    console.log('[Odoo jsonrpc auth error]:', e.message);
  }

  if (!uid) {
    try {
      const session = await callJsonRpc(url, '/web/session/authenticate', {
        db,
        login: username,
        password: authSecret,
      });
      if (session?.uid) uid = session.uid;
    } catch {}
  }

  if (!uid) {
    throw new Error('Autenticación fallida con Odoo en ' + url);
  }

  // High-performance lightweight fields
  const fields = [
    'id',
    'name',
    'default_code',
    'barcode',
    'list_price',
    'standard_price',
    'qty_available',
    'categ_id',
    'description_sale',
    'write_date',
    'product_variant_ids',
    'image_128',
  ];

  // Search domain: Fetch ALL active products
  const searchDomain = [
    ['active', '=', true],
  ];

  const searchOptions = {
    fields: fields,
    order: 'write_date desc',
  };

  // Only apply limit if positive number specified
  if (Number(limit) > 0) {
    searchOptions.limit = Number(limit);
  }

  let rawProducts = [];
  try {
    rawProducts = await callJsonRpc(url, '/jsonrpc', {
      service: 'object',
      method: 'execute_kw',
      args: [
        db,
        uid,
        authSecret,
        'product.template',
        'search_read',
        [searchDomain],
        searchOptions,
      ],
    });
  } catch (err) {
    console.error('[Odoo search_read error]:', err.message);
    throw err;
  }

  if (!Array.isArray(rawProducts)) {
    rawProducts = [];
  }

  // Strictly filter products that HAVE REAL PHOTOS (ignore products without photo)
  const productsWithImages = rawProducts.filter(
    (p) => Boolean(p.image_128) && p.image_128 !== false && String(p.image_128).trim() !== ''
  );

  // Filter by minStockVal if specified
  const eligibleProducts = minStockVal > 0
    ? productsWithImages.filter((p) => Number(p.qty_available || 0) >= minStockVal)
    : productsWithImages;

  console.log(`[Odoo Sync] ✔ ${rawProducts.length} productos en Odoo, ${eligibleProducts.length} importados con fotos reales (excluidos ${rawProducts.length - eligibleProducts.length} sin foto)`);

  // Normalize products to RENACE / Catalog format
  return eligibleProducts.map((p, index) => {
    const rawName = String(p.name || '').trim();
    const lowerName = rawName.toLowerCase();

    // Accurate category classification based on actual product name for Plastir RD
    let category = 'organizacion';
    let department = 'Organización & Clóset';

    if (
      lowerName.includes('hermet') || lowerName.includes('recip') || lowerName.includes('dispens') ||
      lowerName.includes('grano') || lowerName.includes('cereal') || lowerName.includes('especier') ||
      lowerName.includes('escurridor') || lowerName.includes('nevera') || lowerName.includes('taper') ||
      lowerName.includes('bowl') || lowerName.includes('ensalad') || lowerName.includes('alimento')
    ) {
      category = 'cocina';
      department = 'Cocina & Despensa';
    } else if (
      lowerName.includes('cesto') || lowerName.includes('ropa') || lowerName.includes('balde') ||
      lowerName.includes('cubo') || lowerName.includes('exprimid') || lowerName.includes('atomiz') ||
      lowerName.includes('ponchera') || lowerName.includes('limpieza') || lowerName.includes('bano')
    ) {
      category = 'lavanderia';
      department = 'Lavandería & Baño';
    } else if (
      lowerName.includes('jarra') || lowerName.includes('vaso') || lowerName.includes('copa') ||
      lowerName.includes('bandeja') || lowerName.includes('plato') || lowerName.includes('cubierto') ||
      lowerName.includes('vajilla') || lowerName.includes('maceta')
    ) {
      category = 'mesa_hogar';
      department = 'Mesa, Hogar & Terraza';
    } else if (
      lowerName.includes('zafac') || lowerName.includes('basura') || lowerName.includes('agricola') ||
      lowerName.includes('tarima') || lowerName.includes('carga') || lowerName.includes('industrial') ||
      lowerName.includes('contenedor')
    ) {
      category = 'industrial';
      department = 'Industrial & Comercial B2B';
    } else if (
      lowerName.includes('bebe') || lowerName.includes('infantil') || lowerName.includes('juguet') ||
      lowerName.includes('banera') || lowerName.includes('escolar')
    ) {
      category = 'infantil';
      department = 'Infantil & Bebé';
    } else if (
      lowerName.includes('silla') || lowerName.includes('mesa') || lowerName.includes('banco') ||
      lowerName.includes('taburet') || lowerName.includes('mueble')
    ) {
      category = 'muebles';
      department = 'Muebles & Sillas';
    } else {
      category = 'organizacion';
      department = 'Organización & Clóset';
    }

    // High-resolution image served with local caching and authenticated proxy
    const mainImage = `/api/odoo/image/${p.id}`;

    const price = Number(p.list_price) > 0 ? Math.round(Number(p.list_price)) : 850;
    const stock = Math.round(Number(p.qty_available || 0));

    // Dynamic discount percentages
    const discountModifiers = [20, 25, 15, 30, 28, 35, 22, 27];
    const discountPercent = discountModifiers[(p.id * 3 + index) % discountModifiers.length];
    const originalPrice = Math.round(price / (1 - (discountPercent / 100) * 0.7));

    // Tags & Stock status
    let tag = '🔥 DISPONIBLE';
    let urgencyBadge = '✔ Stock Central Disponible';
    let soldRate = 75;

    if (stock <= 0) {
      tag = '⚠️ SOBRE PEDIDO';
      urgencyBadge = '📦 Pedido Especial Fábrica (Disponible)';
      soldRate = 98;
    } else if (stock <= 5) {
      tag = '🚨 ÚLTIMAS UNIDADES';
      urgencyBadge = '⚡ ¡Pocas Unidades en Almacén!';
      soldRate = 94;
    } else if (stock <= 15) {
      tag = '⭐ TOP VENTAS';
      urgencyBadge = '🔥 Alta Demanda';
      soldRate = 88;
    } else {
      tag = '✨ DISEÑO FUNCIONAL';
      urgencyBadge = '✔ Entrega Express Inmediata';
      soldRate = 65;
    }

    return {
      id: `odoo-${p.id}`,
      odooId: p.id,
      name: rawName,
      sku: p.default_code || `SKU-PLAS-${p.id}`,
      barcode: p.barcode || '',
      category: category,
      department: department,
      tag: tag,
      urgencyBadge: urgencyBadge,
      price: price,
      originalPrice: originalPrice,
      discountPercent: discountPercent,
      stockLeft: Math.max(0, stock),
      qtyAvailable: stock,
      soldPercent: soldRate,
      rating: (4.8 + ((p.id % 3) * 0.1)).toFixed(1),
      reviewsCount: 20 + ((p.id * 7) % 180),
      isFlashDeal: index < 4 || ((p.id % 5) === 0),
      flashEndHours: 2.5 + ((p.id % 4) * 0.8),
      sizes: ['1 Unidad', 'Pack x3 Ahorro', 'Bulto Mayorista'],
      colors: [
        { name: 'Transparente / Blanco', hex: '#FFFFFF' },
        { name: 'Azul Plastir', hex: '#0058A3' },
        { name: 'Gris Grafito', hex: '#334155' }
      ],
      images: [mainImage],
      description: p.description_sale || `${rawName} con diseño funcional nórdico, elaborado con polipropileno virgen libre de BPA. Calidad Plastir garantizada.`,
      features: [
        `Inventario verificado en Almacén Central (${stock > 0 ? `${stock} unidades listas` : 'Disponible sobre pedido'})`,
        '100% Plásticos vírgenes de alta resistencia libres de BPA',
        'Envío Express a todo RD con Pago Contra Entrega (COD)'
      ],
      isPublishedWeb: true,
      isLocalCatalog: true,
      isOdooProduct: true,
      lastSyncedAt: new Date().toISOString(),
    };
  });
};

/**
 * Smart Sync: Merges Odoo products into current product database
 */
export const syncOdooProducts = async (config, existingProducts = []) => {
  const odooProducts = await fetchOdooProducts(config);

  const merged = [...odooProducts];

  // Preserve local non-Odoo products and preserve staff overrides for isPublishedWeb
  existingProducts.forEach((localP) => {
    if (!localP.isOdooProduct) {
      merged.push(localP);
    } else {
      const matchIndex = merged.findIndex((m) => m.id === localP.id);
      if (matchIndex !== -1) {
        if (localP.isPublishedWeb !== undefined) {
          merged[matchIndex].isPublishedWeb = localP.isPublishedWeb;
        }
        if (localP.tag && !localP.tag.includes('STOCK')) {
          merged[matchIndex].tag = localP.tag;
        }
        if (localP.images && localP.images.length > merged[matchIndex].images.length) {
          merged[matchIndex].images = localP.images;
        }
      }
    }
  });

  // Calculate department statistics for Plastir
  const catStats = {
    organizacion: merged.filter((p) => p.category === 'organizacion').length,
    cocina: merged.filter((p) => p.category === 'cocina').length,
    lavanderia: merged.filter((p) => p.category === 'lavanderia').length,
    mesa_hogar: merged.filter((p) => p.category === 'mesa_hogar').length,
    industrial: merged.filter((p) => p.category === 'industrial').length,
    infantil: merged.filter((p) => p.category === 'infantil').length,
    muebles: merged.filter((p) => p.category === 'muebles').length,
  };

  const inStockCount = merged.filter((p) => Number(p.qtyAvailable || 0) > 0).length;
  const onDemandCount = merged.length - inStockCount;

  return {
    success: true,
    totalSynced: odooProducts.length,
    totalProducts: merged.length,
    inStockCount,
    onDemandCount,
    categories: catStats,
    products: merged,
    syncedAt: new Date().toISOString(),
  };
};
