const fs = require('fs');
const path = require('path');

const serverFile = path.join(__dirname, '..', 'server', 'server.js');
let code = fs.readFileSync(serverFile, 'utf8');

// Load clean Plastir products
const cleanProducts = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'server', 'data', 'products.json'), 'utf8'));

// Find start of INITIAL_PRODUCTS and helper functions
const startIdx = code.indexOf('// REAL GERSON MVP FLOW PRODUCTS (SEED)');
const helpersIdx = code.indexOf('// Helper functions for safe, atomic JSON file reading and writing');

if (startIdx === -1 || helpersIdx === -1) {
  console.error('Indices not found! start:', startIdx, 'helpers:', helpersIdx);
  process.exit(1);
}

const beforeHelpers = code.substring(0, startIdx);
const helpersAndAfter = code.substring(helpersIdx);

// Build new INITIAL_PRODUCTS
const newBlock = '// CATÁLOGO OFICIAL DE PRODUCTOS PLASTIR RD (ORGANIZACIÓN & HOGAR)\n' +
  'const INITIAL_PRODUCTS = ' + JSON.stringify(cleanProducts, null, 2) + ';\n\n';

code = beforeHelpers + newBlock + helpersAndAfter;

// Now let's fix the startup check (where it forced sneakers)
const initCheckStart = code.indexOf('// Initialize PRODUCTS_FILE if not present & auto-repair categories and image endpoints');
const initCheckEnd = code.indexOf('// ==========================================\n// API ROUTES: AUTHENTICATION');

if (initCheckStart !== -1 && initCheckEnd !== -1) {
  const newInitCheck = `// Initialize PRODUCTS_FILE & purge any legacy MVP Flow products
let current = getJson(PRODUCTS_FILE, INITIAL_PRODUCTS);
let hasLegacyMvp = current.some(p => String(p.id).startsWith('mvp-') || (p.images && p.images.some(img => typeof img === 'string' && img.includes('/img/drop-'))));

if (!fs.existsSync(PRODUCTS_FILE) || hasLegacyMvp || current.length === 0) {
  saveJson(PRODUCTS_FILE, INITIAL_PRODUCTS);
  current = INITIAL_PRODUCTS;
  console.log('[Plastir Catalog] ✔ Catálogo de PLASTIR RD inicializado con 15 productos de organización y hogar.');
} else {
  let modified = false;
  current.forEach((p) => {
    if (p.isPublishedWeb === undefined) { p.isPublishedWeb = true; modified = true; }
    if (p.isLocalCatalog === undefined) { p.isLocalCatalog = true; modified = true; }
  });
  if (modified) {
    saveJson(PRODUCTS_FILE, current);
  }
}
\n`;

  code = code.substring(0, initCheckStart) + newInitCheck + code.substring(initCheckEnd);
}

fs.writeFileSync(serverFile, code, 'utf8');
console.log('Successfully updated server/server.js! Purged all sneakers, boxers, and MVP flow logic.');
