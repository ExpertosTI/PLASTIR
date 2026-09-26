#!/usr/bin/env node
/**
 * Test script to verify Odoo ERP connection and product extraction
 * Usage:
 *   node test_odoo.js
 */

const cliHost = process.argv[2];

const hosts = [
  ...(cliHost ? [cliHost] : []),
  process.env.ODOO_URL,
  'https://mvpflow.renace.tech',
  'http://127.0.0.1:8069',
  'http://localhost:8069',
  'http://odoo:8069'
].filter(Boolean);

const db = process.env.ODOO_DB || 'mvpflow';
const login = process.env.ODOO_USERNAME || 'info@mvpflowboutique.com';
const apiKey = process.env.ODOO_API_KEY || '';
if (!apiKey) {
  console.warn('\x1b[33m⚠ Advertencia: ODOO_API_KEY no está definida en las variables de entorno.\x1b[0m');
}

async function runTest() {
  console.log('\x1b[36m⚡ [MVP FLOW BOUTIQUE] — Probando conexión con Odoo ERP...\x1b[0m');
  console.log('   Base de datos:', db);
  console.log('   Usuario:', login);
  console.log('   Filtro requerido: Stock > 2 unidades\n');

  for (const url of hosts) {
    try {
      console.log(`\x1b[33m📡 Probando endpoint: ${url} ...\x1b[0m`);
      
      const authRes = await fetch(url + '/jsonrpc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'call',
          params: { service: 'common', method: 'authenticate', args: [db, login, apiKey, {}] },
          id: 1
        })
      });

      const text = await authRes.text();
      let authData;
      try {
        authData = JSON.parse(text);
      } catch {
        console.log(`   ⚠ ${url} respondió con HTML (código ${authRes.status}).`);
        continue;
      }

      const uid = authData.result;
      if (uid && typeof uid === 'number') {
        console.log(`\x1b[32m✔ ¡CONEXIÓN Y AUTENTICACIÓN EXITOSA! (UID: ${uid})\x1b[0m\n`);

        // 1. Obtener categorías
        const catRes = await fetch(url + '/jsonrpc', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'call',
            params: {
              service: 'object',
              method: 'execute_kw',
              args: [db, uid, apiKey, 'product.category', 'search_read', [[]], { fields: ['id', 'name'] }]
            },
            id: 2
          })
        });
        const catData = await catRes.json();
        console.log('\x1b[35m📂 CATEGORÍAS ENCONTRADAS EN ODOO:\x1b[0m');
        console.table(catData.result || []);

        // 2. Obtener productos
        console.log('\n\x1b[36m👟 Consultando productos activos...\x1b[0m');
        const prodRes = await fetch(url + '/jsonrpc', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'call',
            params: {
              service: 'object',
              method: 'execute_kw',
              args: [
                db, uid, apiKey, 'product.template', 'search_read',
                [[['sale_ok', '=', true]]],
                {
                  fields: ['id', 'name', 'default_code', 'list_price', 'qty_available', 'categ_id'],
                  limit: 150,
                  order: 'write_date desc'
                }
              ]
            },
            id: 3
          })
        });

        const prodData = await prodRes.json();
        const allProducts = prodData.result || [];
        const stockOver2 = allProducts.filter(p => Number(p.qty_available || 0) > 2);

        console.log(`\x1b[33m📦 Total de modelos leídos en Odoo:\x1b[0m ${allProducts.length}`);
        console.log(`\x1b[32m✔ Total de modelos CON STOCK > 2 UNIDADES:\x1b[0m ${stockOver2.length}\n`);

        console.log('\x1b[32m📋 PRIMEROS 20 PRODUCTOS QUE ENTRARÁN AL CATÁLOGO WEB:\x1b[0m');
        console.table(stockOver2.slice(0, 20).map(p => ({
          ID: p.id,
          Nombre: String(p.name || '').slice(0, 26),
          SKU: p.default_code || 'N/A',
          Precio: 'RD$ ' + Number(p.list_price || 0).toLocaleString('es-DO'),
          'Stock Disponible': p.qty_available,
          Categoría: Array.isArray(p.categ_id) ? p.categ_id[1] : 'N/A'
        })));

        return;
      } else {
        console.log(`   ❌ Error de credenciales en ${url}:`, authData.error?.data?.message || authData.error?.message);
      }
    } catch (err) {
      console.log(`   ❌ No se pudo conectar a ${url}: ${err.message}`);
    }
  }

  console.log('\n\x1b[31m❌ No se pudo completar la prueba con los endpoints probados.\x1b[0m');
}

runTest();
