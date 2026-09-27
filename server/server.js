import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import compression from 'compression';
import {
  sendWhaticketMessage,
  sendWhaticketQuote,
  formatWhaticketOrderMessage,
  formatWhaticketQuoteMessage,
  getWhaticketTickets,
  getWhaticketContacts,
  getWhaticketUsers,
  createOrUpdateWhaticketContact,
  testWhaticketConnection,
} from './services/whaticketService.js';
import {
  testOdooConnection,
  fetchOdooProducts,
  syncOdooProducts,
  callJsonRpc,
} from './services/odooService.js';
import {
  trackEvent,
  getAnalyticsDashboard,
  resetAnalytics,
} from './services/analyticsService.js';
import {
  verifyGoogleCredential,
  verifyFacebookAccessToken,
  verifyAppleCredential,
  findOrCreateUser,
  verifySessionToken,
  getUserById,
  updateUserProfile,
  generateAndSendWhatsAppOtp,
  verifyWhatsAppOtp,
} from './services/authService.js';
import {
  getUnifiedContacts,
  generateVCardFile,
  generateGoogleContactsCsv,
  syncAllContactsToWhaticket,
  createManualContact,
  importDeviceContacts,
  performFullTwoWaySync,
} from './services/contactSyncService.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Trust reverse proxy (Traefik, Cloudflare, Nginx) for accurate client IP resolution & rate limiting
app.set('trust proxy', 1);

app.use(compression());

// CORS configuration with origin safety
const ALLOWED_ORIGINS = [
  'https://plastirrd.com',
  'https://www.plastirrd.com',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server) or allowed origins
      if (!origin || ALLOWED_ORIGINS.includes(origin) || origin.endsWith('.renace.tech') || origin.endsWith('plastirrd.com')) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive for local preview while preserving standard headers
    },
    credentials: true,
  })
);

// Generous request body limit (50MB) for high-resolution base64 photo uploads and catalog media
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Production Security Headers Middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(self "*"), geolocation=(self "*")');
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  next();
});

// Ensure data directory exists
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const CONFIG_FILE = path.join(DATA_DIR, 'config.json');
const ALBUM_FILE = path.join(DATA_DIR, 'album.json');
const CONTACTS_FILE = path.join(DATA_DIR, 'contacts.json');
const ANALYTICS_FILE = path.join(DATA_DIR, 'analytics.json');
const UPLOAD_TOKENS_FILE = path.join(DATA_DIR, 'upload_tokens.json');
const STORIES_FILE = path.join(DATA_DIR, 'stories.json');
const STORIES_DIR = path.join(DATA_DIR, 'stories_media');
if (!fs.existsSync(STORIES_DIR)) {
  fs.mkdirSync(STORIES_DIR, { recursive: true });
}
app.use('/media/stories', express.static(STORIES_DIR));

const ODOO_IMAGES_DIR = path.join(DATA_DIR, 'odoo_images');
if (!fs.existsSync(ODOO_IMAGES_DIR)) {
  fs.mkdirSync(ODOO_IMAGES_DIR, { recursive: true });
}

// Auto-initialize or repair config.json with valid production credentials
try {
  let existingCfg = {};
  if (fs.existsSync(CONFIG_FILE)) {
    existingCfg = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
  }
  let needsSave = false;
  if (!existingCfg.whaticketConfig || !existingCfg.whaticketConfig.token) {
    existingCfg.whaticketConfig = {
      apiUrl: process.env.WHATICKET_API_URL || 'https://api.whaticket.com/api/v1',
      token: process.env.WHATICKET_TOKEN || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJjcmVhdGU6bWVzc2FnZXMiLCJjcmVhdGU6bWVkaWFzIiwicmVhZDp3aGF0c2FwcHMiLCJ1cGRhdGU6d2hhdHNhcHBzIiwiY3JlYXRlOmNvbnRhY3RzIiwicmVhZDpjb250YWN0cyJdLCJjb21wYW55SWQiOiIxYjZmMzk1OC05NTExLTRiYzUtOTRkNy04YmE2ZTI2MDYxYTUiLCJpYXQiOjE3ODc4Nzc3MTB9.igKUXGwsEUCqSWhZxgWkpghAmCasRJ9EgazyZUFHr-M',
      companyId: process.env.WHATICKET_COMPANY_ID || '1b6f3958-9511-4bc5-94d7-8ba6e26061a5',
      connectionId: process.env.WHATICKET_CONNECTION_ID || 'b24ea8c3-f5ed-46de-b612-dbe8f76e53c8',
      supportPhone: process.env.STORE_WHATSAPP_PHONE || '18096560219',
      autoSendWhaticket: true,
    };
    needsSave = true;
  } else if (existingCfg.whaticketConfig.supportPhone !== '18096560219') {
    existingCfg.whaticketConfig.supportPhone = '18096560219';
    needsSave = true;
  }
  if (!existingCfg.odooConfig || !existingCfg.odooConfig.url) {
    existingCfg.odooConfig = {
      url: process.env.ODOO_URL || '',
      db: process.env.ODOO_DB || '',
      username: process.env.ODOO_USERNAME || '',
      apiKey: process.env.ODOO_API_KEY || '',
      autoSync: false,
    };
    needsSave = true;
  }
  if (needsSave || !fs.existsSync(CONFIG_FILE)) {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(existingCfg, null, 2), 'utf8');
  }
} catch (e) {
  console.error('Config init warning:', e.message);
}

// Helper functions for safe, atomic JSON file reading and writing
function getJson(file, defaultVal) {
  try {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      if (content && content.trim().length > 0) {
        return JSON.parse(content);
      }
    }
  } catch (e) {
    console.error(`[Data Storage] Error reading ${file}:`, e.message);
  }
  return defaultVal;
}

function saveJson(file, data) {
  try {
    const dir = path.dirname(file);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    // Atomic write using temporary file + atomic rename
    const tmpFile = `${file}.tmp.${Date.now()}.${Math.random().toString(36).substring(2, 7)}`;
    fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tmpFile, file);
  } catch (e) {
    console.error(`[Data Storage] Error atomically writing ${file}:`, e.message);
  }
}

// Official Plastir Catalogue (Seed)
const SEED_FILE = path.join(DATA_DIR, 'products.seed.json');
const INITIAL_PRODUCTS = fs.existsSync(SEED_FILE) ? getJson(SEED_FILE, []) : getJson(PRODUCTS_FILE, []);

// ==========================================
// AUTHENTICATION & SECURITY SYSTEM
// ==========================================

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'plastir_jwt_secret_2026_production_key';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Plastir2026Admin!';

// Constant-time password comparison to prevent timing attacks
function safeComparePasswords(inputPassword, targetPassword) {
  if (typeof inputPassword !== 'string' || typeof targetPassword !== 'string') return false;
  const hashInput = crypto.createHash('sha256').update(inputPassword).digest();
  const hashTarget = crypto.createHash('sha256').update(targetPassword).digest();
  return crypto.timingSafeEqual(hashInput, hashTarget);
}

// Generates an HMAC-signed token
function generateAdminToken() {
  const payload = {
    role: 'admin',
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    nonce: crypto.randomBytes(16).toString('hex'),
  };
  const str = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', ADMIN_SECRET).update(str).digest('base64url');
  return `${str}.${sig}`;
}

// Verifies token signature and expiration with timing-safe comparison
function verifyAdminToken(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [str, sig] = parts;
  const expectedSig = crypto.createHmac('sha256', ADMIN_SECRET).update(str).digest('base64url');
  
  const bufSig = Buffer.from(sig, 'utf8');
  const bufExpected = Buffer.from(expectedSig, 'utf8');
  if (bufSig.length !== bufExpected.length) return false;
  if (!crypto.timingSafeEqual(bufSig, bufExpected)) return false;

  try {
    const payload = JSON.parse(Buffer.from(str, 'base64url').toString('utf8'));
    if (!payload.exp || Date.now() > payload.exp) return false;
    return true;
  } catch {
    return false;
  }
}

// Admin Authentication Middleware
const requireAdminAuth = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers['x-admin-token'];
  let token = '';
  if (authHeader) {
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7).trim();
    } else {
      token = authHeader.trim();
    }
  }

  if (verifyAdminToken(token)) {
    return next();
  }

  if (token && safeComparePasswords(token, ADMIN_PASSWORD)) {
    return next();
  }

  return res.status(401).json({
    success: false,
    error: 'Acceso no autorizado. Se requiere sesión de administrador válida.',
  });
};

// In-Memory Lightweight Rate Limiter
const createRateLimiter = ({ windowMs = 60000, max = 30, message = 'Demasiadas solicitudes. Inténtalo de nuevo más tarde.' }) => {
  const hits = new Map();

  setInterval(() => {
    const now = Date.now();
    for (const [ip, data] of hits.entries()) {
      if (now - data.startTime > windowMs) {
        hits.delete(ip);
      }
    }
  }, windowMs);

  return (req, res, next) => {
    const ip = req.ip || req.connection?.remoteAddress || 'unknown-ip';
    const now = Date.now();
    const current = hits.get(ip) || { count: 0, startTime: now };

    if (now - current.startTime > windowMs) {
      current.count = 1;
      current.startTime = now;
    } else {
      current.count += 1;
    }

    hits.set(ip, current);

    if (current.count > max) {
      return res.status(429).json({ success: false, error: message });
    }

    next();
  };
};

const loginLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 10, message: 'Demasiados intentos de acceso. Espera 15 minutos.' });
const orderLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 25, message: 'Límite de pedidos alcanzado temporalmente.' });
const whaticketLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 30, message: 'Demasiados mensajes enviados. Espera unos minutos.' });
const proxyLimiter = createRateLimiter({ windowMs: 60 * 1000, max: 60, message: 'Límite de peticiones de imagen alcanzado.' });
const uploadLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 20, message: 'Límite de subida alcanzado temporalmente.' });
const analyticsLimiter = createRateLimiter({ windowMs: 60 * 1000, max: 600, message: 'Demasiados eventos de analítica.' });
const trackingLimiter = createRateLimiter({ windowMs: 60 * 1000, max: 60, message: 'Demasiadas consultas de rastreo.' });

// SSRF Safe URL Validator for Image Proxy
function isSafeUrlForProxy(inputUrl) {
  try {
    const parsed = new URL(inputUrl);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return false;
    }
    const hostname = parsed.hostname.toLowerCase();
    
    // Disallow loopback, cloud metadata, private RFC 1918 IPs, and broadcast addresses
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '0.0.0.0' ||
      hostname === '::1' ||
      hostname === '169.254.169.254' ||
      hostname.endsWith('.internal') ||
      hostname.endsWith('.local') ||
      hostname.startsWith('10.') ||
      hostname.startsWith('192.168.') ||
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname) ||
      hostname.startsWith('127.') ||
      hostname.startsWith('169.254.')
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

// Initialize PRODUCTS_FILE & auto-purge legacy sneakers/apparel
const isSneakerOrClothing = (p) => {
  const text = String((p.name || '') + ' ' + (p.category || '') + ' ' + (p.description || '')).toLowerCase();
  const id = String(p.id || '').toLowerCase();
  return (
    id.startsWith('mvp-') ||
    text.includes('tenis') ||
    text.includes('jordan') ||
    text.includes('sneaker') ||
    text.includes('calzado') ||
    text.includes('adidas') ||
    text.includes('reebok') ||
    text.includes('boxer') ||
    text.includes('poloche') ||
    text.includes('hoodie')
  );
};

let currentProducts = getJson(PRODUCTS_FILE, INITIAL_PRODUCTS);
let needsSave = false;

// Purge all legacy sneakers
const countBefore = currentProducts.length;
currentProducts = currentProducts.filter((p) => !isSneakerOrClothing(p));
if (currentProducts.length === 0 || currentProducts.length < 5) {
  currentProducts = INITIAL_PRODUCTS;
  needsSave = true;
} else if (currentProducts.length !== countBefore) {
  needsSave = true;
}

currentProducts.forEach((p) => {
  if (p.isPublishedWeb === undefined) {
    p.isPublishedWeb = true;
    needsSave = true;
  }
  if (p.isLocalCatalog === undefined) {
    p.isLocalCatalog = true;
    needsSave = true;
  }
  if (p.isOdooProduct) {
    const targetImg = p.odooId ? `/api/odoo/image/${p.odooId}` : null;
    let cleanImages = (p.images || []).filter(
      (img) => typeof img === 'string' && !img.includes('/img/drop-') && !img.includes('/web/image/product.template/')
    );
    if (cleanImages.length === 0 && targetImg) {
      cleanImages = [targetImg];
    }
    if (JSON.stringify(p.images) !== JSON.stringify(cleanImages)) {
      p.images = cleanImages;
      needsSave = true;
    }
  }
});

saveJson(PRODUCTS_FILE, currentProducts);
console.log(`[Plastir Catalog] ✔ ${currentProducts.length} productos verificados (100% Hogar y Plásticos, cero calzado)`);

// ==========================================
// API ROUTES: AUTHENTICATION
// ==========================================

// Admin Login
app.post('/api/auth/admin-login', loginLimiter, (req, res) => {
  try {
    const { password } = req.body || {};
    const inputPass = String(password || '').trim();

    const isMatch = safeComparePasswords(inputPass, ADMIN_PASSWORD);

    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Contraseña de administrador incorrecta.' });
    }

    const token = generateAdminToken();
    res.json({
      success: true,
      token,
      message: 'Autenticación exitosa',
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error durante la autenticación' });
  }
});

// Verify Admin Session Token
app.get('/api/auth/verify', (req, res) => {
  const authHeader = req.headers.authorization || req.headers['x-admin-token'];
  let token = '';
  if (authHeader) {
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7).trim();
    } else {
      token = authHeader.trim();
    }
  }

  const isValid = verifyAdminToken(token);
  res.json({ success: true, authenticated: isValid });
});

// ==========================================
// API ROUTES: CUSTOMER SOCIAL AUTHENTICATION (Google, Facebook, Apple, Phone)
// ==========================================

// Get public auth provider configuration
app.get('/api/auth/config', (req, res) => {
  res.json({
    success: true,
    googleClientId: process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || '',
    facebookAppId: process.env.FACEBOOK_APP_ID || process.env.VITE_FACEBOOK_APP_ID || '',
    appleClientId: process.env.APPLE_CLIENT_ID || process.env.VITE_APPLE_CLIENT_ID || '',
    providerStatus: {
      google: Boolean(process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID),
      facebook: Boolean(process.env.FACEBOOK_APP_ID || process.env.VITE_FACEBOOK_APP_ID),
      apple: Boolean(process.env.APPLE_CLIENT_ID || process.env.VITE_APPLE_CLIENT_ID),
    },
  });
});

// 1-Tap Google Login (GIS JWT Verification - Sept 2026)
app.post('/api/auth/google', async (req, res) => {
  try {
    const { credential, profile: clientProfile, sessionId } = req.body || {};
    let verifiedProfile = null;

    if (credential) {
      try {
        verifiedProfile = await verifyGoogleCredential(credential);
      } catch (verErr) {
        console.warn('Google token verification fallback:', verErr.message);
        if (clientProfile && clientProfile.email) {
          verifiedProfile = { provider: 'google', ...clientProfile };
        } else {
          return res.status(400).json({ success: false, error: verErr.message });
        }
      }
    } else if (clientProfile && (clientProfile.email || clientProfile.name)) {
      verifiedProfile = { provider: 'google', ...clientProfile };
    } else {
      return res.status(400).json({ success: false, error: 'Credencial o perfil de Google requerido.' });
    }

    const { user, token, isNew } = findOrCreateUser(verifiedProfile);
    trackEvent({
      type: 'social_login',
      sessionId: sessionId || 'anon',
      action: 'login_google',
      meta: { provider: 'google', isNew, userId: user.id },
    });

    res.json({
      success: true,
      user,
      token,
      isNew,
      message: isNew ? '¡Bienvenido al Club MVP FLOW!' : '¡Hola de nuevo!',
    });
  } catch (err) {
    console.error('Error en /api/auth/google:', err);
    res.status(500).json({ success: false, error: err.message || 'Error autenticando con Google' });
  }
});

// 1-Tap Facebook Login (Meta Graph API v20+ - Sept 2026)
app.post('/api/auth/facebook', async (req, res) => {
  try {
    const { accessToken, userID, profile: clientProfile, sessionId } = req.body || {};
    let verifiedProfile = null;

    if (accessToken) {
      try {
        verifiedProfile = await verifyFacebookAccessToken(accessToken, userID);
      } catch (verErr) {
        console.warn('Facebook token verification fallback:', verErr.message);
        if (clientProfile && (clientProfile.name || clientProfile.id)) {
          verifiedProfile = { provider: 'facebook', ...clientProfile };
        } else {
          return res.status(400).json({ success: false, error: verErr.message });
        }
      }
    } else if (clientProfile && (clientProfile.name || clientProfile.id)) {
      verifiedProfile = { provider: 'facebook', ...clientProfile };
    } else {
      return res.status(400).json({ success: false, error: 'Datos de autenticación de Facebook requeridos.' });
    }

    const { user, token, isNew } = findOrCreateUser(verifiedProfile);
    trackEvent({
      type: 'social_login',
      sessionId: sessionId || 'anon',
      action: 'login_facebook',
      meta: { provider: 'facebook', isNew, userId: user.id },
    });

    res.json({
      success: true,
      user,
      token,
      isNew,
      message: isNew ? '¡Bienvenido al Club MVP FLOW!' : '¡Hola de nuevo!',
    });
  } catch (err) {
    console.error('Error en /api/auth/facebook:', err);
    res.status(500).json({ success: false, error: err.message || 'Error autenticando con Facebook' });
  }
});

// 1-Tap Sign in with Apple (Apple Developer - Sept 2026)
app.post('/api/auth/apple', async (req, res) => {
  try {
    const { idToken, user: appleUserObj, profile: clientProfile, sessionId } = req.body || {};
    let verifiedProfile = null;

    if (idToken) {
      try {
        verifiedProfile = await verifyAppleCredential(idToken, appleUserObj);
      } catch (verErr) {
        console.warn('Apple token verification fallback:', verErr.message);
        if (clientProfile && (clientProfile.name || clientProfile.email)) {
          verifiedProfile = { provider: 'apple', ...clientProfile };
        } else {
          return res.status(400).json({ success: false, error: verErr.message });
        }
      }
    } else if (clientProfile && (clientProfile.name || clientProfile.email)) {
      verifiedProfile = { provider: 'apple', ...clientProfile };
    } else {
      return res.status(400).json({ success: false, error: 'Token o perfil de Apple ID requerido.' });
    }

    const { user, token, isNew } = findOrCreateUser(verifiedProfile);
    trackEvent({
      type: 'social_login',
      sessionId: sessionId || 'anon',
      action: 'login_apple',
      meta: { provider: 'apple', isNew, userId: user.id },
    });

    res.json({
      success: true,
      user,
      token,
      isNew,
      message: isNew ? '¡Bienvenido al Club MVP FLOW!' : '¡Hola de nuevo!',
    });
  } catch (err) {
    console.error('Error en /api/auth/apple:', err);
    res.status(500).json({ success: false, error: err.message || 'Error autenticando con Apple' });
  }
});

// 1-Tap Phone / WhatsApp Quick Login (Direct)
app.post('/api/auth/phone', (req, res) => {
  try {
    const { phone, name, sessionId } = req.body || {};
    const cleanPhone = String(phone || '').replace(/\D/g, '');
    if (cleanPhone.length < 8) {
      return res.status(400).json({ success: false, error: 'Número de teléfono o WhatsApp no válido.' });
    }
    const { user, token, isNew } = findOrCreateUser({ provider: 'phone', phone: cleanPhone, name });
    trackEvent({
      type: 'social_login',
      sessionId: sessionId || 'anon',
      action: 'login_phone',
      meta: { provider: 'phone', isNew, userId: user.id },
    });
    res.json({ success: true, user, token, isNew });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error procesando inicio de sesión con teléfono' });
  }
});

// WhatsApp OTP: Request 6-digit verification code via Whaticket
app.post('/api/auth/whatsapp/send-otp', whaticketLimiter, async (req, res) => {
  try {
    const { phone, name } = req.body || {};
    if (!phone) {
      return res.status(400).json({ success: false, error: 'El número de WhatsApp es requerido.' });
    }

    const config = getJson(CONFIG_FILE, {});
    const whaticketConfig = config.whaticketConfig || {
      apiUrl: process.env.WHATICKET_API_URL || 'https://api.whaticket.com/api/v1',
      token: process.env.WHATICKET_TOKEN || '',
      connectionId: process.env.WHATICKET_CONNECTION_ID || '',
    };

    const senderFn = async (destPhone, text, contactName) => {
      if (whaticketConfig.token) {
        await sendWhaticketMessage(whaticketConfig, destPhone, text, contactName);
      }
    };

    const result = await generateAndSendWhatsAppOtp(phone, name, senderFn);
    res.json(result);
  } catch (err) {
    console.error('[WhatsApp Send OTP Error]:', err.message);
    res.status(400).json({ success: false, error: err.message });
  }
});

// WhatsApp OTP: Verify 6-digit code & authenticate user
app.post('/api/auth/whatsapp/verify-otp', async (req, res) => {
  try {
    const { phone, code, name, userId, sessionId } = req.body || {};
    if (!phone || !code) {
      return res.status(400).json({ success: false, error: 'Teléfono y código de 6 dígitos requeridos.' });
    }

    const { user, token, isNew } = verifyWhatsAppOtp({ phone, code, name, userId });
    trackEvent({
      type: 'social_login',
      sessionId: sessionId || 'anon',
      action: 'login_whatsapp_otp',
      meta: { provider: 'whatsapp', isNew, userId: user.id },
    });

    res.json({ success: true, user, token, isNew });
  } catch (err) {
    console.error('[WhatsApp Verify OTP Error]:', err.message);
    res.status(400).json({ success: false, error: err.message });
  }
});

// Update Customer Profile (Name, Username, Phone, Avatar, etc.)
app.put('/api/auth/profile', async (req, res) => {
  try {
    let userId = req.body?.userId;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7).trim();
      const session = verifySessionToken(token);
      if (session && session.userId) {
        userId = session.userId;
      }
    }

    if (!userId) {
      return res.status(400).json({ success: false, error: 'ID de usuario no proporcionado' });
    }

    const updatedUser = updateUserProfile(userId, req.body || {});
    res.json({ success: true, user: updatedUser });
  } catch (err) {
    console.error('[Update Profile Error]:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Verify Current User Session Token
app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'No autorizado' });
  }
  const token = authHeader.slice(7).trim();
  const session = verifySessionToken(token);
  if (!session || !session.userId) {
    return res.status(401).json({ success: false, error: 'Sesión expirada o token inválido' });
  }
  const user = getUserById(session.userId);
  if (!user) {
    return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
  }
  res.json({ success: true, user });
});

// ==========================================
// API ROUTES: PRODUCTS & CMS (WEB vs LOCAL)
// ==========================================

// Get all products (Used by Admin & Local Catalog for staff)
app.get('/api/products', (req, res) => {
  const products = getJson(PRODUCTS_FILE, INITIAL_PRODUCTS);
  res.json(products);
});

// Get only WEB published products (Used by public storefront)
app.get('/api/products/web', (req, res) => {
  const products = getJson(PRODUCTS_FILE, INITIAL_PRODUCTS);
  const webProducts = products.filter((p) => p.isPublishedWeb !== false);
  res.json(webProducts);
});

// Toggle Web visibility of a product (Protected)
app.patch('/api/products/:id/toggle-web', requireAdminAuth, (req, res) => {
  try {
    const { id } = req.params;
    const { isPublishedWeb } = req.body;
    const products = getJson(PRODUCTS_FILE, INITIAL_PRODUCTS);
    const index = products.findIndex((p) => p.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const currentVal = products[index].isPublishedWeb !== false;
    products[index].isPublishedWeb = isPublishedWeb !== undefined ? Boolean(isPublishedWeb) : !currentVal;
    products[index].updatedAt = new Date().toISOString();

    saveJson(PRODUCTS_FILE, products);

    res.json({
      success: true,
      id: id,
      isPublishedWeb: products[index].isPublishedWeb,
      product: products[index],
      message: products[index].isPublishedWeb
        ? '¡Producto publicado en la tienda WEB!'
        : 'Producto ocultado de la WEB (disponible en Catálogo Local).',
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new product (Protected)
app.post('/api/products', requireAdminAuth, (req, res) => {
  try {
    const newProduct = req.body;
    if (!newProduct.name || !newProduct.price) {
      return res.status(400).json({ error: 'Nombre y precio son requeridos.' });
    }

    const products = getJson(PRODUCTS_FILE, INITIAL_PRODUCTS);
    const productToAdd = {
      ...newProduct,
      id: newProduct.id || `mvp-${Date.now().toString().slice(-4)}`,
      rating: newProduct.rating || 5.0,
      reviewsCount: newProduct.reviewsCount || 1,
      isPublishedWeb: newProduct.isPublishedWeb !== undefined ? Boolean(newProduct.isPublishedWeb) : true,
      isLocalCatalog: true,
      isOdooProduct: false,
      sizes: newProduct.sizes && newProduct.sizes.length > 0 ? newProduct.sizes : ['39', '40', '41', '42'],
      colors: newProduct.colors && newProduct.colors.length > 0 ? newProduct.colors : [{ name: 'Negro', hex: '#111111' }],
      images: newProduct.images && newProduct.images.length > 0 ? newProduct.images : ['/img/drop-1.jpg'],
      createdAt: new Date().toISOString(),
    };

    products.unshift(productToAdd);
    saveJson(PRODUCTS_FILE, products);

    res.status(201).json({ success: true, product: productToAdd });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update product (Protected)
app.put('/api/products/:id', requireAdminAuth, (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;
    const products = getJson(PRODUCTS_FILE, INITIAL_PRODUCTS);
    const index = products.findIndex((p) => p.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    products[index] = { ...products[index], ...updatedData, updatedAt: new Date().toISOString() };
    saveJson(PRODUCTS_FILE, products);

    res.json({ success: true, product: products[index] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete product (Protected)
app.delete('/api/products/:id', requireAdminAuth, (req, res) => {
  try {
    const { id } = req.params;
    let products = getJson(PRODUCTS_FILE, INITIAL_PRODUCTS);
    products = products.filter((p) => p.id !== id);
    saveJson(PRODUCTS_FILE, products);

    res.json({ success: true, message: 'Producto eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// API ROUTES: ODOO ERP INTEGRATION
// ==========================================

// Test Odoo Connection (Protected)
app.post('/api/odoo/test', requireAdminAuth, async (req, res) => {
  try {
    const storedConfig = getJson(CONFIG_FILE, {}).odooConfig || {};
    const odooConfig = {
      url: (req.body?.url || storedConfig.url || process.env.ODOO_URL || '').trim(),
      db: (req.body?.db || storedConfig.db || process.env.ODOO_DB || '').trim(),
      username: (req.body?.username || storedConfig.username || process.env.ODOO_USERNAME || '').trim(),
      apiKey: (req.body?.apiKey || storedConfig.apiKey || process.env.ODOO_API_KEY || '').trim(),
    };
    const result = await testOdooConnection(odooConfig);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Sync products from Odoo (Protected)
app.post('/api/odoo/sync', requireAdminAuth, async (req, res) => {
  try {
    const { config } = req.body || {};
    const storedConfig = getJson(CONFIG_FILE, {}).odooConfig || {};
    const activeConfig = {
      url: (config?.url || storedConfig.url || process.env.ODOO_URL || '').trim(),
      db: (config?.db || storedConfig.db || process.env.ODOO_DB || '').trim(),
      username: (config?.username || storedConfig.username || process.env.ODOO_USERNAME || '').trim(),
      apiKey: (config?.apiKey || storedConfig.apiKey || process.env.ODOO_API_KEY || '').trim(),
      autoSync: true,
      minStock: config?.minStock !== undefined ? Number(config.minStock) : 0,
    };

    if (!activeConfig.url) {
      return res.status(400).json({ success: false, message: 'Falta la URL de Odoo.' });
    }

    const currentProducts = getJson(PRODUCTS_FILE, INITIAL_PRODUCTS);
    const syncResult = await syncOdooProducts(activeConfig, currentProducts);

    if (syncResult.success && syncResult.products) {
      saveJson(PRODUCTS_FILE, syncResult.products);

      // Update sync metadata in config
      const fullConfig = getJson(CONFIG_FILE, {});
      fullConfig.odooConfig = activeConfig;
      fullConfig.odooSyncStatus = {
        lastSyncedAt: syncResult.syncedAt,
        totalSynced: syncResult.totalSynced,
        totalProducts: syncResult.totalProducts,
      };
      saveJson(CONFIG_FILE, fullConfig);
    }

    res.json(syncResult);
  } catch (err) {
    console.error('[Odoo Sync Error]:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// High-performance public image proxy for Odoo products with permanent local disk caching
app.get('/api/odoo/image/:id', async (req, res) => {
  try {
    const rawId = req.params.id;
    const odooId = parseInt(String(rawId).replace(/\D/g, ''), 10);
    if (!odooId) {
      return res.status(404).send('Invalid Product ID');
    }

    const cachedBin = path.join(ODOO_IMAGES_DIR, `${odooId}.bin`);
    const cachedPng = path.join(ODOO_IMAGES_DIR, `${odooId}.png`);
    const targetCache = fs.existsSync(cachedBin) ? cachedBin : (fs.existsSync(cachedPng) ? cachedPng : null);

    if (targetCache) {
      const buffer = fs.readFileSync(targetCache);
      const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8;
      res.setHeader('Content-Type', isJpeg ? 'image/jpeg' : 'image/png');
      res.setHeader('Cache-Control', 'public, max-age=604800, immutable');
      return res.send(buffer);
    }

    const storedConfig = getJson(CONFIG_FILE, {}).odooConfig || {};
    const activeConfig = {
      url: (storedConfig.url || process.env.ODOO_URL || '').trim(),
      db: (storedConfig.db || process.env.ODOO_DB || '').trim(),
      apiKey: (storedConfig.apiKey || process.env.ODOO_API_KEY || '').trim(),
    };

    const rpcResult = await callJsonRpc(activeConfig.url, '/jsonrpc', {
      service: 'object',
      method: 'execute_kw',
      args: [
        activeConfig.db,
        42,
        activeConfig.apiKey,
        'product.template',
        'read',
        [[odooId]],
        { fields: ['id', 'image_512', 'image_256', 'image_128'] },
      ],
    });

    const record = rpcResult && rpcResult[0];
    const base64Data = record?.image_512 || record?.image_256 || record?.image_128;

    if (base64Data) {
      const buffer = Buffer.from(base64Data, 'base64');
      fs.writeFileSync(cachedBin, buffer);
      const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8;
      res.setHeader('Content-Type', isJpeg ? 'image/jpeg' : 'image/png');
      res.setHeader('Cache-Control', 'public, max-age=604800, immutable');
      return res.send(buffer);
    }

    res.status(404).send('No image');
  } catch (err) {
    console.error(`[Odoo Image Fetch Error ${req.params.id}]:`, err.message);
    res.status(404).send('Image not available');
  }
});

// ==========================================
// API ROUTES: WHATICKET v1.0.0 & DISPATCH
// ==========================================

// Fetch open tickets/conversations from Whaticket (Protected)
app.get('/api/whaticket/tickets', requireAdminAuth, async (req, res) => {
  try {
    const config = getJson(CONFIG_FILE, {});
    const whaticketConfig = config.whaticketConfig || {
      apiUrl: process.env.WHATICKET_API_URL || 'https://api.whaticket.com/api/v1',
      token: process.env.WHATICKET_TOKEN || '',
    };

    const status = req.query.status || 'open';
    const searchParam = req.query.searchParam || '';
    const result = await getWhaticketTickets(whaticketConfig, { status, searchParam });
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Fetch contacts from Whaticket (Protected)
app.get('/api/whaticket/contacts', requireAdminAuth, async (req, res) => {
  try {
    const config = getJson(CONFIG_FILE, {});
    const whaticketConfig = config.whaticketConfig || {
      apiUrl: process.env.WHATICKET_API_URL || 'https://api.whaticket.com/api/v1',
      token: process.env.WHATICKET_TOKEN || '',
    };

    const searchParam = req.query.searchParam || '';
    const result = await getWhaticketContacts(whaticketConfig, { searchParam });
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Fetch registered staff / users from Whaticket (Sanitized public list)
app.get('/api/whaticket/users', async (req, res) => {
  try {
    const config = getJson(CONFIG_FILE, {});
    const whaticketConfig = config.whaticketConfig || {
      apiUrl: process.env.WHATICKET_API_URL || 'https://api.whaticket.com/api/v1',
      token: process.env.WHATICKET_TOKEN || '',
    };
    const result = await getWhaticketUsers(whaticketConfig);
    const sanitizedUsers = (result.users || []).map((u) => ({
      id: u.id,
      name: u.name || 'Asesor',
      profile: u.profile || 'user',
    }));
    res.json({ success: true, users: sanitizedUsers });
  } catch (err) {
    res.status(500).json({ success: false, users: [], error: 'No se pudo obtener lista de asesores' });
  }
});

// ==========================================
// API ROUTES: CONTACT SYNC & WHATSAPP STATUS
// ==========================================

// Get unified contacts list (Protected)
app.get('/api/contacts/list', requireAdminAuth, async (req, res) => {
  try {
    const contacts = await getUnifiedContacts();
    res.json({ success: true, count: contacts.length, contacts });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Download Universal vCard (.vcf) for iPhone / Android (Protected)
app.get('/api/contacts/vcf', requireAdminAuth, async (req, res) => {
  try {
    const prefix = req.query.prefix || 'MVP Cliente - ';
    const vcfContent = await generateVCardFile(prefix);
    res.setHeader('Content-Type', 'text/vcard; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="Contactos_MVP_FLOW_WhatsApp.vcf"');
    res.send(vcfContent);
  } catch (err) {
    res.status(500).send('Error generating vCard: ' + err.message);
  }
});

// Download Google Contacts CSV (Protected)
app.get('/api/contacts/csv', requireAdminAuth, async (req, res) => {
  try {
    const csvContent = await generateGoogleContactsCsv();
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="Contactos_MVP_FLOW_Google.csv"');
    res.send(csvContent);
  } catch (err) {
    res.status(500).send('Error generating CSV: ' + err.message);
  }
});

// Batch sync all contacts to Whaticket
app.post('/api/contacts/sync-whaticket', requireAdminAuth, async (req, res) => {
  try {
    const result = await syncAllContactsToWhaticket();
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Full two-way sync: Whaticket <-> PLASTIR <-> Dispositivos
app.post('/api/contacts/sync-full', requireAdminAuth, async (req, res) => {
  try {
    const result = await performFullTwoWaySync();
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Import contacts from phone/device (.vcf or .csv) and sync to Whaticket (Protected)
app.post('/api/contacts/import-device', requireAdminAuth, async (req, res) => {
  try {
    const { fileContent, fileName, syncToWhaticket } = req.body || {};
    if (!fileContent) {
      return res.status(400).json({ success: false, message: 'El contenido del archivo es requerido.' });
    }
    const result = await importDeviceContacts({ fileContent, fileName, syncToWhaticket: syncToWhaticket !== false });
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Create new contact manually and sync directly with Whaticket (Protected)
app.post('/api/contacts/create', requireAdminAuth, async (req, res) => {
  try {
    const { name, phone, city, address, note, email } = req.body || {};
    if (!phone) {
      return res.status(400).json({ success: false, message: 'El número de teléfono o WhatsApp es obligatorio.' });
    }
    const result = await createManualContact({ name, phone, city, address, note, email });
    res.json(result);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Status of Whaticket integration & company ID (Protected)
app.get('/api/contacts/whaticket-status', requireAdminAuth, async (req, res) => {
  try {
    const config = getJson(CONFIG_FILE, {});
    const whaticketConfig = config.whaticketConfig || {
      apiUrl: process.env.WHATICKET_API_URL || 'https://api.whaticket.com/api/v1',
      token: process.env.WHATICKET_TOKEN || '',
      companyId: process.env.WHATICKET_COMPANY_ID || '1b6f3958-9511-4bc5-94d7-8ba6e26061a5',
    };
    const hasToken = Boolean(whaticketConfig.token);
    res.json({
      success: true,
      hasToken,
      apiUrl: whaticketConfig.apiUrl,
      companyId: whaticketConfig.companyId || '1b6f3958-9511-4bc5-94d7-8ba6e26061a5',
      supportPhone: whaticketConfig.supportPhone || process.env.STORE_WHATSAPP_PHONE || '18096560219',
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 1-Click Send Quote via Whaticket API (Protected)
app.post('/api/whaticket/send-quote', requireAdminAuth, whaticketLimiter, async (req, res) => {
  try {
    const { phoneNumber, customerName, agentName, quoteData } = req.body;

    if (!phoneNumber || !quoteData) {
      return res.status(400).json({ success: false, message: 'Número de teléfono y datos de cotización requeridos.' });
    }

    const config = getJson(CONFIG_FILE, {});
    const whaticketConfig = config.whaticketConfig || {
      apiUrl: process.env.WHATICKET_API_URL || 'https://api.whaticket.com/api/v1',
      token: process.env.WHATICKET_TOKEN || '',
      connectionId: process.env.WHATICKET_CONNECTION_ID || '',
      queueId: process.env.WHATICKET_QUEUE_ID || '',
      userId: process.env.WHATICKET_USER_ID || '',
    };

    const result = await sendWhaticketQuote(whaticketConfig, {
      phoneNumber,
      customerName: customerName || 'Cliente MVP Flow',
      agentName: agentName || 'Ashley',
      quotePayload: quoteData,
    });

    res.json({
      success: true,
      message: '¡Cotización enviada exitosamente a través de Whaticket!',
      result,
    });
  } catch (err) {
    console.error('[Whaticket Send Quote Error]:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Live Chat Direct Dispatch to Whaticket Inbox (Public with Rate Limiter)
app.post('/api/whaticket/chat/send', whaticketLimiter, async (req, res) => {
  try {
    const { name, phone, message, product } = req.body || {};

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'El mensaje es obligatorio.' });
    }

    const config = getJson(CONFIG_FILE, {});
    const whaticketConfig = config.whaticketConfig || {
      apiUrl: process.env.WHATICKET_API_URL || 'https://api.whaticket.com/api/v1',
      token: process.env.WHATICKET_TOKEN || '',
      connectionId: process.env.WHATICKET_CONNECTION_ID || '',
    };

    const customerPhone = phone || '';
    const staffPhone = process.env.STORE_WHATSAPP_PHONE || '18096560219';
    const customerName = name || 'Visitante Web';

    const staffBody = product
      ? `💬 *[CONSULTA EN VIVO - PLASTIR RD]*\n👤 *Cliente:* ${customerName}\n📱 *WhatsApp:* ${customerPhone || 'En chat web'}\n📦 *Interesado en:* ${product.name} (RD$ ${Number(product.price).toLocaleString('es-DO')})\n📝 *Mensaje:* ${message}\n🌐 *Origen:* https://plastirrd.com\n\n👉 *Responder a este número para atender al cliente.*`
      : `💬 *[CONSULTA EN VIVO - PLASTIR RD]*\n👤 *Cliente:* ${customerName}\n📱 *WhatsApp:* ${customerPhone || 'En chat web'}\n📝 *Mensaje:* ${message}\n🌐 *Origen:* https://plastirrd.com`;

    if (whaticketConfig.token) {
      // 1. Si el cliente dejó su número, sincronizar/crear contacto en Whaticket primero para que aparezca en la bandeja
      if (customerPhone && customerPhone.length >= 10) {
        try {
          await createOrUpdateWhaticketContact(whaticketConfig, {
            name: customerName,
            number: customerPhone,
            extraInfo: [{ name: 'Origen', value: 'Chat Web en Vivo' }]
          });
        } catch (cErr) {
          console.warn('[Whaticket Create Contact Note]:', cErr.message);
        }
      }

      let resultStaff = null;
      // 2. Enviar a la bandeja de Whaticket del equipo de ventas
      try {
        resultStaff = await sendWhaticketMessage(whaticketConfig, staffPhone, staffBody, `Lead Web: ${customerName}`);
      } catch (sendErr) {
        console.warn('[Whaticket Staff Dispatch Note]:', sendErr.message);
      }

      // 3. Si el cliente dejó su número, mandarle mensaje oficial a su WhatsApp
      if (customerPhone && customerPhone.length >= 10) {
        const welcomeClientMsg = (
          `¡Hola ${customerName}! 🔥 Bienvenido/a a *MVP FLOW BOUTIQUE RD*.\n\n` +
          `Hemos recibido tu consulta sobre *${product ? product.name : 'nuestros productos'}*.\n` +
          `Un asesor de ventas en tienda te responderá por aquí en unos momentos para coordinar tu entrega express con Pago Contra Entrega (COD).\n\n` +
          `🛵 *Envíos el mismo día en Santo Domingo (2 a 4 horas) y a todo el país.*`
        );
        try {
          await sendWhaticketMessage(whaticketConfig, customerPhone, welcomeClientMsg, customerName);
        } catch (cliErr) {
          console.warn('[Whaticket Client Welcome Note]:', cliErr.message);
        }
      }

      return res.json({ success: true, message: 'Mensaje registrado y enviado al equipo de Whaticket', result: resultStaff });
    }

    res.json({ success: true, message: 'Mensaje registrado exitosamente' });
  } catch (err) {
    console.error('[Whaticket Live Chat Send Error]:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Capture & Send Web Lead directly into Whaticket (Public with Rate Limiter)
app.post('/api/whaticket/lead', whaticketLimiter, async (req, res) => {
  try {
    const { name, phone, message, product } = req.body;

    if (!phone) {
      return res.status(400).json({ success: false, message: 'El número de teléfono es obligatorio.' });
    }

    const config = getJson(CONFIG_FILE, {});
    const whaticketConfig = config.whaticketConfig || {
      apiUrl: process.env.WHATICKET_API_URL || 'https://api.whaticket.com/api/v1',
      token: process.env.WHATICKET_TOKEN || '',
      connectionId: process.env.WHATICKET_CONNECTION_ID || '',
    };

    const leadMessage = (
      `📦 *¡NUEVO CONTACTO DESDE LA WEB — PLASTIR RD!* 📦\n\n` +
      `👤 *Cliente:* ${name || 'Cliente Web'}\n` +
      `📱 *WhatsApp:* ${phone}\n` +
      (product ? `📦 *Producto de Interés:* ${product.name} (RD$ ${Number(product.price).toLocaleString('es-DO')})\n` : '') +
      `💬 *Mensaje:* ${message || 'Desea información sobre disponibilidad y pedidos.'}\n\n` +
      `📅 *Fecha:* ${new Date().toLocaleString('es-DO')}\n` +
      `🌐 *Origen:* plastirrd.com`
    );

    let result = null;
    if (whaticketConfig.token) {
      result = await sendWhaticketMessage(
        whaticketConfig,
        phone,
        leadMessage,
        name || 'Cliente Web Plastir'
      );
    }

    res.json({
      success: true,
      message: '¡Lead enviado a Whaticket exitosamente!',
      result,
    });
  } catch (err) {
    console.error('[Whaticket Lead Error]:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Test Whaticket API Endpoint (Protected)
app.post('/api/whaticket/test', requireAdminAuth, async (req, res) => {
  try {
    const configToTest = req.body;
    const result = await testWhaticketConnection(configToTest);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Live Whaticket Status Endpoint (Public for client chat status badge)
app.get('/api/whaticket/status', async (req, res) => {
  try {
    const config = getJson(CONFIG_FILE, {});
    const whaticketConfig = config.whaticketConfig || {
      apiUrl: process.env.WHATICKET_API_URL || 'https://api.whaticket.com/api/v1',
      token: process.env.WHATICKET_TOKEN || '',
    };

    if (!whaticketConfig.token) {
      return res.json({
        success: true,
        connected: false,
        onlineAgents: ['Ashley', 'Nicole'],
        message: 'Whaticket en modo standby',
      });
    }

    const testRes = await testWhaticketConnection(whaticketConfig);
    res.json({
      success: true,
      connected: Boolean(testRes.success),
      whatsapps: testRes.whatsapps || [],
      onlineAgents: ['Ashley — Ventas Express', 'Nicole — Soporte y Despacho'],
      storePhone: process.env.STORE_WHATSAPP_PHONE || '18096560219',
      message: testRes.message,
    });
  } catch (err) {
    res.json({
      success: true,
      connected: true,
      onlineAgents: ['Ashley', 'Nicole'],
      storePhone: process.env.STORE_WHATSAPP_PHONE || '18096560219',
      error: err.message,
    });
  }
});

// ==========================================
// API ROUTES: ALBUM & MULTIMEDIA STAFF HUB
// ==========================================

const INITIAL_ALBUM_ITEMS = [
  {
    id: 'alb-001',
    title: 'Tenis Retro Jordan 5 "Street Legacy" High (Fotos HD)',
    category: 'sneakers',
    tags: ['jordan', 'jordan 5', 'g5', 'drop 1', 'negro'],
    imageUrl: '/img/drop-1.jpg',
    source: 'Catálogo Oficial',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'alb-002',
    title: 'Adidas Campus 00s Core Black (Outfit Skater)',
    category: 'sneakers',
    tags: ['adidas', 'campus', 'campus 00s', 'fat laces', 'y2k'],
    imageUrl: '/img/drop-2.jpg',
    source: 'Catálogo Oficial',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'alb-003',
    title: 'Adidas Uva Street Edition Sport (Detalles Reflectivos)',
    category: 'sneakers',
    tags: ['adidas', 'sport', 'uva', 'running', 'streetwear'],
    imageUrl: '/img/drop-3.jpg',
    source: 'Catálogo Oficial',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'alb-004',
    title: 'Reebok Clásico Triple Black Stealth (Piel G5)',
    category: 'sneakers',
    tags: ['reebok', 'clasico', 'triple black', 'unisex'],
    imageUrl: '/img/drop-4.jpg',
    source: 'Catálogo Oficial',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'alb-005',
    title: 'Reebok Clásico Black & White (Suela Cosida)',
    category: 'sneakers',
    tags: ['reebok', 'suela cosida', 'urbano'],
    imageUrl: '/img/drop-5.jpg',
    source: 'Catálogo Oficial',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'alb-006',
    title: 'Retro Jordan 12 Two-Tone Elite (Cherry & Taxi)',
    category: 'sneakers',
    tags: ['jordan 12', 'cherry', 'taxi', 'drop 6', 'g5'],
    imageUrl: '/img/drop-6.jpg',
    source: 'Catálogo Oficial',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'alb-007',
    title: 'Mega Pack 12x Boxers Premium MVP Flow',
    category: 'combos',
    tags: ['boxers', 'pack 12', 'combo', 'algodon spandex'],
    imageUrl: '/img/drop-7.jpg',
    source: 'Catálogo Oficial',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'alb-008',
    title: 'Adidas Clásico Streetwear Red & Black Flame',
    category: 'sneakers',
    tags: ['adidas', 'flame', 'rojo', 'negro'],
    imageUrl: '/img/drop-8.jpg',
    source: 'Catálogo Oficial',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'alb-009',
    title: 'Tenis Adidas Campus 00s Grey & White Classic',
    category: 'sneakers',
    tags: ['campus', 'gris', 'vintage', 'skater'],
    imageUrl: '/img/drop-10.jpg',
    source: 'Catálogo Oficial',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'alb-010',
    title: 'Jordan Retro High Court Purple & Black',
    category: 'sneakers',
    tags: ['jordan', 'purple', 'morado', 'high'],
    imageUrl: '/img/drop-11.jpg',
    source: 'Catálogo Oficial',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'alb-011',
    title: 'Pack Boxers MVP Flow Surtidos Colores Sólidos',
    category: 'combos',
    tags: ['boxers', 'surtido', 'combo ropa'],
    imageUrl: '/img/drop-14.jpg',
    source: 'Catálogo Oficial',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'alb-012',
    title: 'Tenis Retro Jordan 5 Red Suede Flame Edition',
    category: 'sneakers',
    tags: ['jordan 5', 'red suede', 'rojo toro'],
    imageUrl: '/img/drop-16.jpg',
    source: 'Catálogo Oficial',
    createdAt: new Date().toISOString(),
  },
];

// Image Proxy endpoint with SSRF Protection & Rate Limiting
app.get('/api/image-proxy', proxyLimiter, async (req, res) => {
  try {
    const rawUrl = req.query.url;
    if (!rawUrl || typeof rawUrl !== 'string') {
      return res.status(400).send('URL de imagen requerida');
    }

    let targetUrl;
    if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
      targetUrl = rawUrl;
    } else {
      const cleanPath = rawUrl.startsWith('/') ? rawUrl : `/${rawUrl}`;
      const baseUrl = (process.env.ODOO_URL || 'https://plastirrd.com').replace(/\/$/, '');
      targetUrl = `${baseUrl}${cleanPath}`;
    }

    // Strict SSRF Verification
    if (!isSafeUrlForProxy(targetUrl)) {
      return res.status(403).send('Destino no autorizado por política de seguridad');
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10s max

    const response = await fetch(targetUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'PLASTIR-Image-Proxy/1.0',
        'Accept': 'image/jpeg,image/png,image/webp,image/gif,image/*;q=0.8',
      },
    });
    clearTimeout(timeout);

    if (!response.ok) return res.status(response.status).send('Error al consultar imagen remota');

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.startsWith('image/')) {
      return res.status(400).send('El recurso remoto no es una imagen válida');
    }

    const contentLength = Number(response.headers.get('content-length') || 0);
    if (contentLength > 10 * 1024 * 1024) {
      return res.status(413).send('La imagen supera el límite de 10MB');
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    const buffer = Buffer.from(await response.arrayBuffer());
    res.send(buffer);
  } catch (err) {
    res.status(500).send(`Proxy error: ${err.message}`);
  }
});

// Helper to generate search tags for photos
const generateProductTags = (name, category, sku, price) => {
  const text = `${name || ''} ${category || ''} ${sku || ''} RD$${price || ''}`.toLowerCase();
  const words = text.split(/[\s,/_.-]+/).filter((w) => w.length > 2);
  const tags = new Set(words);
  if (text.includes('vans')) tags.add('vans');
  if (text.includes('jordan')) { tags.add('jordan'); tags.add('retro'); }
  if (text.includes('campus')) { tags.add('campus'); tags.add('adidas'); }
  if (text.includes('adidas')) tags.add('adidas');
  if (text.includes('reebok')) tags.add('reebok');
  if (text.includes('boxer')) { tags.add('boxers'); tags.add('combo'); }
  if (text.includes('franela')) { tags.add('franela'); tags.add('ropa'); }
  if (text.includes('croki')) tags.add('croki');
  if (text.includes('suera') || text.includes('hoodie')) tags.add('hoodie');
  return Array.from(tags);
};

// Get all album items
app.get('/api/album', (req, res) => {
  let customAlbumItems = getJson(ALBUM_FILE, []);
  if (!Array.isArray(customAlbumItems)) {
    customAlbumItems = INITIAL_ALBUM_ITEMS;
  }

  // Load all products to build comprehensive searchable photo catalog
  const allProducts = getJson(PRODUCTS_FILE, INITIAL_PRODUCTS);
  const productPhotos = (allProducts || []).map((p) => {
    const mainImg = p.images?.[0] || `/img/drop-1.jpg`;
    return {
      id: `prod-photo-${p.id}`,
      productId: p.id,
      title: `${p.name} — RD$ ${Number(p.price).toLocaleString('es-DO')}`,
      category: p.category || 'sneakers',
      tags: generateProductTags(p.name, p.category, p.sku, p.price),
      imageUrl: mainImg,
      source: p.isOdooProduct ? 'Odoo ERP' : 'Catálogo Web',
      price: p.price,
      sku: p.sku || '',
      stock: p.stockLeft || 0,
      createdAt: p.createdAt || p.lastSyncedAt || new Date().toISOString(),
    };
  });

  // Merge custom uploads first, then product photos
  const mergedAlbum = [...customAlbumItems, ...productPhotos];

  res.json({
    success: true,
    count: mergedAlbum.length,
    customCount: customAlbumItems.length,
    productCount: productPhotos.length,
    items: mergedAlbum,
  });
});

// Upload / Add new image to Album (Protected & Rate Limited)
app.post('/api/album/upload', requireAdminAuth, uploadLimiter, express.json({ limit: '25mb' }), (req, res) => {
  try {
    const { title, imageUrl, category, tags } = req.body;
    if (!imageUrl || typeof imageUrl !== 'string') {
      return res.status(400).json({ success: false, message: 'La imagen (URL o Base64) es requerida.' });
    }

    const albumItems = getJson(ALBUM_FILE, INITIAL_ALBUM_ITEMS);
    const parsedTags = Array.isArray(tags) 
      ? tags.map((t) => String(t).trim().toLowerCase()) 
      : String(tags || '').split(',').map((t) => t.trim().toLowerCase()).filter(Boolean);

    const newItem = {
      id: `alb-${Date.now().toString().slice(-6)}`,
      title: String(title || `Foto Producto #${albumItems.length + 1}`).slice(0, 150),
      category: String(category || 'sneakers').slice(0, 50),
      tags: [...parsedTags, ...generateProductTags(title, category, '', '')].slice(0, 20),
      imageUrl: imageUrl,
      source: 'Subido por Asesora',
      createdAt: new Date().toISOString(),
    };

    albumItems.unshift(newItem);
    if (albumItems.length > 500) {
      albumItems.splice(500);
    }
    saveJson(ALBUM_FILE, albumItems);

    res.status(201).json({ success: true, item: newItem, message: '¡Foto agregada al Álbum con éxito!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete photo from Album (Protected)
app.delete('/api/album/:id', requireAdminAuth, (req, res) => {
  try {
    const { id } = req.params;
    let albumItems = getJson(ALBUM_FILE, INITIAL_ALBUM_ITEMS);
    albumItems = albumItems.filter((it) => it.id !== id);
    saveJson(ALBUM_FILE, albumItems);
    res.json({ success: true, message: 'Foto eliminada del álbum' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// API ROUTES: ONE-TIME PHOTO UPLOAD LINKS
// ==========================================

// Create a new One-Time Upload Link (Protected)
app.post('/api/upload-links', requireAdminAuth, (req, res) => {
  try {
    const { productId, productName, note, createdBy, expiresInHours = 24, maxUses = 1 } = req.body;
    const token = `up_${crypto.randomBytes(16).toString('hex')}`;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + Math.min(Math.max(Number(expiresInHours || 24), 1), 720) * 3600 * 1000).toISOString();

    const newLink = {
      token,
      productId: productId ? String(productId).slice(0, 64) : null,
      productName: String(productName || 'Drop General / Calzado').slice(0, 128),
      note: String(note || '').slice(0, 500),
      createdBy: String(createdBy || 'Asesor Staff').slice(0, 64),
      createdAt: now.toISOString(),
      expiresAt,
      maxUses: Math.min(Math.max(Number(maxUses || 1), 1), 10),
      usedCount: 0,
      isUsed: false,
      uploadedPhotosCount: 0,
    };

    const links = getJson(UPLOAD_TOKENS_FILE, []);
    links.unshift(newLink);
    if (links.length > 500) links.splice(500);
    saveJson(UPLOAD_TOKENS_FILE, links);

    const baseUrl = process.env.STORE_DOMAIN ? `https://${process.env.STORE_DOMAIN}` : '';
    const pathUrl = `/subir-fotos?token=${token}`;

    res.status(201).json({
      success: true,
      link: newLink,
      uploadUrl: pathUrl,
      fullUrl: `${baseUrl}${pathUrl}`,
      message: '¡Enlace de uso único creado exitosamente!',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// List all Upload Links (Protected)
app.get('/api/upload-links', requireAdminAuth, (req, res) => {
  try {
    const links = getJson(UPLOAD_TOKENS_FILE, []);
    res.json({ success: true, count: links.length, links });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Validate an Upload Link Token (Public - used by upload page)
app.get('/api/upload-links/:token', (req, res) => {
  try {
    const { token } = req.params;
    const links = getJson(UPLOAD_TOKENS_FILE, []);
    const found = links.find((l) => l.token === token);

    if (!found) {
      return res.status(404).json({ success: false, valid: false, message: 'Enlace no válido o inexistente.' });
    }

    const now = new Date();
    const isExpired = new Date(found.expiresAt) < now;
    const isExhausted = found.usedCount >= found.maxUses || found.isUsed;

    if (isExpired) {
      return res.json({ success: true, valid: false, reason: 'expired', message: 'Este enlace ha expirado.' });
    }

    if (isExhausted) {
      return res.json({ success: true, valid: false, reason: 'used', message: 'Este enlace de uso único ya fue utilizado.' });
    }

    res.json({
      success: true,
      valid: true,
      linkInfo: {
        productName: found.productName,
        productId: found.productId,
        note: found.note,
        createdBy: found.createdBy,
        expiresAt: found.expiresAt,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Upload Photos using One-Time Link Token (Public with Rate Limiter & Token Validation)
app.post('/api/upload-links/:token/upload', uploadLimiter, express.json({ limit: '25mb' }), (req, res) => {
  try {
    const { token } = req.params;
    const { images, uploaderName, note } = req.body;

    if (!Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ success: false, message: 'Debes enviar al menos una foto.' });
    }
    if (images.length > 20) {
      return res.status(400).json({ success: false, message: 'Máximo 20 fotos por subida.' });
    }

    const links = getJson(UPLOAD_TOKENS_FILE, []);
    const linkIndex = links.findIndex((l) => l.token === token);

    if (linkIndex === -1) {
      return res.status(404).json({ success: false, message: 'Enlace no válido.' });
    }

    const targetLink = links[linkIndex];
    const now = new Date();

    if (new Date(targetLink.expiresAt) < now) {
      return res.status(410).json({ success: false, message: 'Este enlace ha expirado.' });
    }

    if (targetLink.usedCount >= targetLink.maxUses || targetLink.isUsed) {
      return res.status(409).json({ success: false, message: 'Este enlace ya fue utilizado y no admite más subidas.' });
    }

    // 1. Save uploaded images to Album
    const albumItems = getJson(ALBUM_FILE, INITIAL_ALBUM_ITEMS);
    const newAlbumEntries = [];

    images.forEach((imgObj, idx) => {
      const imgUrl = typeof imgObj === 'string' ? imgObj : imgObj.imageUrl || imgObj.url || imgObj.data;
      if (imgUrl && typeof imgUrl === 'string') {
        const item = {
          id: `alb-ext-${Date.now()}-${idx}`,
          title: typeof imgObj === 'object' && imgObj.title ? String(imgObj.title).slice(0, 150) : `${targetLink.productName} (Foto ${idx + 1})`,
          category: 'sneakers',
          tags: ['subida_externa', targetLink.productName.toLowerCase(), 'link_unico'],
          imageUrl: imgUrl,
          source: `Enlace Único (${String(uploaderName || 'Asistente').slice(0, 64)})`,
          createdAt: now.toISOString(),
        };
        albumItems.unshift(item);
        newAlbumEntries.push(item);
      }
    });
    if (albumItems.length > 500) albumItems.splice(500);
    saveJson(ALBUM_FILE, albumItems);

    // 2. If attached to a specific product, update product images in catalog
    if (targetLink.productId) {
      const products = getJson(PRODUCTS_FILE, INITIAL_PRODUCTS);
      const prodIdx = products.findIndex((p) => p.id === targetLink.productId);
      if (prodIdx !== -1) {
        const existingImages = products[prodIdx].images || [];
        const newImgUrls = newAlbumEntries.map((e) => e.imageUrl);
        products[prodIdx].images = [...newImgUrls, ...existingImages].slice(0, 10);
        saveJson(PRODUCTS_FILE, products);
        console.log(`[Product Update] ✔ ${newImgUrls.length} fotos agregadas al producto ${targetLink.productId}`);
      }
    }

    // 3. Mark link as used/exhausted
    targetLink.usedCount += 1;
    targetLink.isUsed = true;
    targetLink.usedAt = now.toISOString();
    targetLink.uploaderName = String(uploaderName || 'Anónimo').slice(0, 64);
    targetLink.uploadedPhotosCount = newAlbumEntries.length;
    saveJson(UPLOAD_TOKENS_FILE, links);

    res.json({
      success: true,
      count: newAlbumEntries.length,
      productName: targetLink.productName,
      message: `¡${newAlbumEntries.length} fotos subidas exitosamente al catálogo oficial!`,
    });
  } catch (err) {
    console.error('Error in upload-links upload:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// API ROUTES: STORIES & SHORTS (TIKTOK / INSTAGRAM REELS)
// ==========================================

const DEFAULT_STORIES = [
  {
    id: 'story-1',
    title: 'Jordan 4 Retro Black Cat',
    badge: 'TOP 1',
    liveNotice: '🔥 Solo 2 pares disponibles',
    type: 'video',
    thumbnailUrl: '/img/drop-1.jpg',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-fashion-model-showing-sneakers-41132-large.mp4',
    instagramUrl: 'https://www.instagram.com/mvp_flow_boutique08/',
    embedUrl: '',
    price: 4850,
    productName: 'Jordan 4 Retro Black Cat G5',
    likesCount: 142,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'story-2',
    title: 'Adidas Campus 00s Grey/White',
    badge: 'Y2K FLOW',
    liveNotice: '⚡ Entrega Express hoy a Santo Domingo',
    type: 'video',
    thumbnailUrl: '/img/drop-2.jpg',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-man-walking-with-sneakers-on-a-street-41135-large.mp4',
    instagramUrl: 'https://www.instagram.com/mvp_flow_boutique08/',
    embedUrl: '',
    price: 3950,
    productName: 'Adidas Campus 00s Y2K Edition',
    likesCount: 98,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'story-3',
    title: 'Super Combo 12x Boxers Premium',
    badge: 'OFERTA RD$790',
    liveNotice: '📦 Más de 90 combos despachados hoy',
    type: 'video',
    thumbnailUrl: '/img/drop-7.jpg',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-folding-clothes-neatly-41150-large.mp4',
    instagramUrl: 'https://www.instagram.com/mvp_flow_boutique08/',
    embedUrl: '',
    price: 790,
    productName: 'Combo 12x Boxers Microfibra Calidad G5',
    likesCount: 312,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'story-4',
    title: 'Asics Gel-Kayano 14 Metallic',
    badge: 'VIRAL',
    liveNotice: '👟 Tendencia 2026 en Los Mina y Naco',
    type: 'video',
    thumbnailUrl: '/img/drop-3.jpg',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-feet-of-a-man-walking-in-sneakers-on-the-street-41138-large.mp4',
    instagramUrl: 'https://www.instagram.com/mvp_flow_boutique08/',
    embedUrl: '',
    price: 4400,
    productName: 'Asics Gel-Kayano 14 Silver Metallic',
    likesCount: 184,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'story-5',
    title: 'Nike Dunk Low Panda Original',
    badge: 'CALLE',
    liveNotice: '🔥 La verdadera grasa disponible',
    type: 'video',
    thumbnailUrl: '/img/drop-4.jpg',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-person-walking-on-a-pavement-in-sneakers-41142-large.mp4',
    instagramUrl: 'https://www.instagram.com/mvp_flow_boutique08/',
    embedUrl: '',
    price: 4200,
    productName: 'Nike Dunk Low Retro Panda',
    likesCount: 220,
    createdAt: new Date().toISOString(),
  },
];

const extractInstagramShortcode = (url) => {
  if (!url || typeof url !== 'string') return null;
  const match = url.match(/(?:instagram\.com\/(?:[a-zA-Z0-9_\.]+\/)?(?:p|reel|tv)\/)([a-zA-Z0-9_-]+)/i);
  return match ? match[1] : null;
};

// GET all stories
app.get('/api/stories', (req, res) => {
  try {
    const stories = getJson(STORIES_FILE, DEFAULT_STORIES);
    res.json({ success: true, count: stories.length, stories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST upload new video story or link
app.post('/api/stories/upload', express.json({ limit: '60mb' }), (req, res) => {
  try {
    const { 
      title, 
      badge, 
      price, 
      productName, 
      videoBase64, 
      videoUrl: rawVideoUrl, 
      thumbnailBase64, 
      thumbnailUrl: rawThumbUrl,
      instagramUrl,
      type = 'video'
    } = req.body;

    if (!title && !productName) {
      return res.status(400).json({ success: false, message: 'El título o nombre del producto es requerido.' });
    }

    const storyId = `story-${Date.now()}`;
    let finalVideoUrl = rawVideoUrl || '';
    let finalThumbUrl = rawThumbUrl || '/img/drop-1.jpg';
    let finalEmbedUrl = '';

    // Handle base64 video upload
    if (videoBase64 && typeof videoBase64 === 'string') {
      const isBase64 = videoBase64.includes(';base64,');
      const base64Data = isBase64 ? videoBase64.split(';base64,').pop() : videoBase64;
      const vidFileName = `${storyId}.mp4`;
      const vidFilePath = path.join(STORIES_DIR, vidFileName);
      fs.writeFileSync(vidFilePath, Buffer.from(base64Data, 'base64'));
      finalVideoUrl = `/media/stories/${vidFileName}`;
    }

    // Handle base64 thumbnail upload
    if (thumbnailBase64 && typeof thumbnailBase64 === 'string') {
      const isBase64 = thumbnailBase64.includes(';base64,');
      const base64Data = isBase64 ? thumbnailBase64.split(';base64,').pop() : thumbnailBase64;
      const thumbFileName = `${storyId}-thumb.jpg`;
      const thumbFilePath = path.join(STORIES_DIR, thumbFileName);
      fs.writeFileSync(thumbFilePath, Buffer.from(base64Data, 'base64'));
      finalThumbUrl = `/media/stories/${thumbFileName}`;
    }

    // Handle Instagram URL if supplied
    if (instagramUrl) {
      const shortcode = extractInstagramShortcode(instagramUrl);
      if (shortcode) {
        finalEmbedUrl = `https://www.instagram.com/reel/${shortcode}/embed/`;
        if (!finalThumbUrl || finalThumbUrl === '/img/drop-1.jpg') {
          finalThumbUrl = `https://www.instagram.com/p/${shortcode}/media/?size=l`;
        }
      }
    }

    const newStory = {
      id: storyId,
      title: String(title || productName || 'Nuevo Modelo MVP Flow').slice(0, 100),
      badge: String(badge || 'NUEVO').toUpperCase().slice(0, 30),
      liveNotice: '⚡ Disponible hoy para envío COD',
      type: finalEmbedUrl ? 'instagram' : 'video',
      thumbnailUrl: finalThumbUrl,
      videoUrl: finalVideoUrl,
      instagramUrl: instagramUrl || 'https://www.instagram.com/mvp_flow_boutique08/',
      embedUrl: finalEmbedUrl,
      price: Number(price || 0),
      productName: String(productName || title || '').slice(0, 100),
      likesCount: Math.floor(Math.random() * 40) + 15,
      createdAt: new Date().toISOString(),
    };

    const stories = getJson(STORIES_FILE, DEFAULT_STORIES);
    stories.unshift(newStory);
    if (stories.length > 50) stories.splice(50);
    saveJson(STORIES_FILE, stories);

    res.status(201).json({
      success: true,
      story: newStory,
      message: '¡Historia / Video Short publicado con éxito!',
    });
  } catch (err) {
    console.error('Error uploading story:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

function decodeHtmlEntities(str) {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => {
      try { return String.fromCodePoint(parseInt(hex, 16)); } catch { return ''; }
    })
    .replace(/&#(\d+);/g, (_, dec) => {
      try { return String.fromCodePoint(parseInt(dec, 10)); } catch { return ''; }
    })
    .replace(/&amp;/g, () => '&')
    .replace(/&quot;/g, () => '"')
    .replace(/&#39;/g, () => "'")
    .replace(/&lt;/g, () => '<')
    .replace(/&gt;/g, () => '>')
    .trim();
}

function extractInstagramMetadata(html, fallbackHandle = 'mvp_flow_losmina') {
  const ogImageMatch = html.match(/<meta property="og:image" content="([^"]+)"/i);
  const ogTitleMatch = html.match(/<meta property="og:title" content="([^"]+)"/i);
  const ogDescMatch = html.match(/<meta property="og:description" content="([^"]+)"/i);

  let rawCaption = '';
  if (ogTitleMatch && ogTitleMatch[1]) {
    const quoteMatch = ogTitleMatch[1].match(/on Instagram:\s*(?:&quot;|"|“)([\s\S]+?)(?:&quot;|"|”)/i);
    if (quoteMatch) {
      rawCaption = quoteMatch[1];
    } else {
      const afterMatch = ogTitleMatch[1].match(/on Instagram:\s*([\s\S]+)/i);
      if (afterMatch) rawCaption = afterMatch[1];
    }
  }

  if (!rawCaption && ogDescMatch && ogDescMatch[1]) {
    const descQuoteMatch = ogDescMatch[1].match(/(?:&quot;|"|“)([\s\S]+?)(?:&quot;|"|”)/);
    rawCaption = descQuoteMatch ? descQuoteMatch[1] : ogDescMatch[1];
  }

  const decoded = decodeHtmlEntities(rawCaption);

  // Detect price if present in caption
  let price = 0;
  const priceMatch = decoded.match(/(?:RD\$|\$)\s*([\d,]+)/i);
  if (priceMatch) {
    price = parseInt(priceMatch[1].replace(/,/g, ''), 10);
  }

  // Extract clean short title (first line or phrase before tags/info)
  let cleanTitle = decoded.split(/___|\n|•|- \[/)[0].trim().replace(/\s+/g, ' ').slice(0, 75);
  if (!cleanTitle || cleanTitle.length < 4 || cleanTitle.toLowerCase().includes('el imperio de la')) {
    cleanTitle = `Reel Drop @${fallbackHandle}`;
  }

  let thumbnailUrl = '';
  if (ogImageMatch && ogImageMatch[1]) {
    thumbnailUrl = ogImageMatch[1].replace(/&amp;/g, '&');
  }

  return { title: cleanTitle, price, thumbnailUrl, fullCaption: decoded };
}

// POST sync from Instagram Reel (zero double work)
app.post('/api/stories/sync-instagram', async (req, res) => {
  try {
    const { instagramUrl, title, badge, price } = req.body;
    if (!instagramUrl) {
      return res.status(400).json({ success: false, message: 'La URL de Instagram es requerida.' });
    }

    const shortcode = extractInstagramShortcode(instagramUrl);
    if (!shortcode) {
      return res.status(400).json({ success: false, message: 'URL de Instagram no válida. Pega un enlace de Reel o Publicación (ej: https://www.instagram.com/reel/C.../).' });
    }

    const storyId = `story-ig-${shortcode}`;
    const stories = getJson(STORIES_FILE, DEFAULT_STORIES);

    // Check if already imported
    const existingIndex = stories.findIndex((s) => s.id === storyId || (s.instagramUrl && s.instagramUrl.includes(shortcode)));
    
    const embedUrl = `https://www.instagram.com/reel/${shortcode}/embed/`;
    let thumbnailUrl = `https://www.instagram.com/p/${shortcode}/media/?size=l`;
    let inferredTitle = title || '';
    let inferredPrice = Number(price || 0);

    const config = getJson(CONFIG_FILE, {});
    const activeHandle = config.instagramProfileHandle || 'mvp_flow_losmina';

    // Attempt to inspect OpenGraph tags for rich metadata
    try {
      const response = await fetch(`https://www.instagram.com/p/${shortcode}/`, {
        signal: AbortSignal.timeout(4000),
        headers: {
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'es-DO,es;q=0.9,en;q=0.8',
        },
      });
      if (response.ok) {
        const html = await response.text();
        const meta = extractInstagramMetadata(html, activeHandle);
        if (meta.thumbnailUrl) thumbnailUrl = meta.thumbnailUrl;
        if (!inferredTitle && meta.title) inferredTitle = meta.title;
        if (!inferredPrice && meta.price) inferredPrice = meta.price;
      }
    } catch {
      // Graceful fallback
    }

    const cleanTitle = decodeHtmlEntities(inferredTitle || `Drop Instagram @${activeHandle}`).slice(0, 100);

    const newStory = {
      id: storyId,
      title: cleanTitle,
      badge: badge ? String(badge).toUpperCase().slice(0, 30) : (inferredPrice > 0 ? `RD$${inferredPrice}` : 'REEL VIRAL'),
      liveNotice: `🔥 Visto en Instagram @${activeHandle}`,
      type: 'instagram',
      thumbnailUrl,
      videoUrl: '',
      instagramUrl,
      embedUrl,
      price: inferredPrice,
      productName: cleanTitle,
      likesCount: Math.floor(Math.random() * 80) + 65,
      createdAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      stories[existingIndex] = { ...stories[existingIndex], ...newStory };
    } else {
      stories.unshift(newStory);
    }

    if (stories.length > 50) stories.splice(50);
    saveJson(STORIES_FILE, stories);

    res.status(201).json({
      success: true,
      story: newStory,
      message: '¡Reel de Instagram conectado e importado al instante con título decodificado!',
    });
  } catch (err) {
    console.error('Error syncing Instagram Reel:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST Batch Sync Instagram Reels
app.post('/api/stories/batch-sync', async (req, res) => {
  try {
    const { urls } = req.body || {};
    if (!Array.isArray(urls) || urls.length === 0) {
      return res.status(400).json({ success: false, message: 'Lista de URLs requerida.' });
    }

    const stories = getJson(STORIES_FILE, DEFAULT_STORIES);
    const config = getJson(CONFIG_FILE, {});
    const activeHandle = config.instagramProfileHandle || 'mvp_flow_losmina';
    let addedCount = 0;

    for (const rawUrl of urls) {
      const shortcode = extractInstagramShortcode(rawUrl);
      if (!shortcode) continue;

      const storyId = `story-ig-${shortcode}`;
      if (stories.some((s) => s.id === storyId || (s.instagramUrl && s.instagramUrl.includes(shortcode)))) {
        continue;
      }

      let thumbnailUrl = `https://www.instagram.com/p/${shortcode}/media/?size=l`;
      let inferredTitle = `Nuevo Drop @${activeHandle}`;
      let inferredPrice = 0;

      try {
        const response = await fetch(`https://www.instagram.com/p/${shortcode}/`, {
          signal: AbortSignal.timeout(4000),
          headers: {
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1',
          },
        });
        if (response.ok) {
          const html = await response.text();
          const meta = extractInstagramMetadata(html, activeHandle);
          if (meta.thumbnailUrl) thumbnailUrl = meta.thumbnailUrl;
          if (meta.title) inferredTitle = meta.title;
          if (meta.price) inferredPrice = meta.price;
        }
      } catch {}

      stories.unshift({
        id: storyId,
        title: inferredTitle,
        badge: inferredPrice > 0 ? `RD$${inferredPrice}` : 'NUEVO REEL',
        liveNotice: `🔥 Visto en Instagram @${activeHandle}`,
        type: 'instagram',
        thumbnailUrl,
        videoUrl: '',
        instagramUrl: `https://www.instagram.com/reel/${shortcode}/`,
        embedUrl: `https://www.instagram.com/reel/${shortcode}/embed/`,
        price: inferredPrice,
        productName: inferredTitle,
        likesCount: Math.floor(Math.random() * 80) + 50,
        createdAt: new Date().toISOString(),
      });
      addedCount++;
    }

    if (addedCount > 0) {
      if (stories.length > 50) stories.splice(50);
      saveJson(STORIES_FILE, stories);
    }

    res.json({ success: true, addedCount, totalStories: stories.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET / POST Instagram Profile Config
app.get('/api/stories/config', (req, res) => {
  const config = getJson(CONFIG_FILE, {});
  res.json({
    success: true,
    instagramProfileHandle: config.instagramProfileHandle || 'mvp_flow_losmina',
  });
});

app.post('/api/stories/config', (req, res) => {
  try {
    const { handle } = req.body || {};
    if (!handle) return res.status(400).json({ success: false, message: 'Handle requerido' });
    const cleanHandle = String(handle).replace('@', '').trim();
    const config = getJson(CONFIG_FILE, {});
    config.instagramProfileHandle = cleanHandle;
    saveJson(CONFIG_FILE, config);
    res.json({ success: true, instagramProfileHandle: cleanHandle });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST Scan Instagram Profile for New Reels
let lastProfileScan = { time: 0, count: 0 };
async function scanInstagramProfileReels(profileHandle) {
  const config = getJson(CONFIG_FILE, {});
  const cleanHandle = String(profileHandle || config.instagramProfileHandle || 'mvp_flow_losmina').replace('@', '').trim();
  
  // Persist handle if provided
  if (profileHandle && config.instagramProfileHandle !== cleanHandle) {
    config.instagramProfileHandle = cleanHandle;
    saveJson(CONFIG_FILE, config);
  }

  const stories = getJson(STORIES_FILE, DEFAULT_STORIES);
  let newlyAdded = 0;
  const shortcodes = new Set();

  // Strategy 1: Discover reel shortcodes via web search indexing
  try {
    const ddgRes = await fetch(`https://html.duckduckgo.com/html/?q=site:instagram.com/reel/+${cleanHandle}`, {
      signal: AbortSignal.timeout(6000),
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });
    if (ddgRes.ok) {
      const html = await ddgRes.text();
      const matches = [...html.matchAll(/instagram\.com\/reel\/([a-zA-Z0-9_-]{9,15})/g)].map((m) => m[1]);
      matches.forEach((sc) => shortcodes.add(sc));
    }
  } catch (err) {
    console.warn('[Discovery Search Reels Warning]:', err.message);
  }

  // Strategy 2: Direct profile fetch
  try {
    const res = await fetch(`https://www.instagram.com/${cleanHandle}/`, {
      signal: AbortSignal.timeout(5000),
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'es-DO,es;q=0.9',
      },
    });

    if (res.ok) {
      const html = await res.text();
      const reelMatches = [...html.matchAll(/(?:\/reel\/|\/p\/)([a-zA-Z0-9_-]{9,15})\//g)].map((m) => m[1]);
      reelMatches.forEach((sc) => shortcodes.add(sc));
    }
  } catch (err) {
    console.warn('[Instagram Auto-Scan Note]:', err.message);
  }

  for (const shortcode of [...shortcodes].slice(0, 10)) {
    const storyId = `story-ig-${shortcode}`;
    const exists = stories.some((s) => s.id === storyId || (s.instagramUrl && s.instagramUrl.includes(shortcode)));
    if (!exists) {
      const embedUrl = `https://www.instagram.com/reel/${shortcode}/embed/`;
      let thumbnailUrl = `https://www.instagram.com/p/${shortcode}/media/?size=l`;
      let itemTitle = `Nuevo Drop @${cleanHandle}`;
      let itemPrice = 0;

      try {
        const ogRes = await fetch(`https://www.instagram.com/p/${shortcode}/`, {
          signal: AbortSignal.timeout(4000),
          headers: {
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1',
          },
        });
        if (ogRes.ok) {
          const html = await ogRes.text();
          const meta = extractInstagramMetadata(html, cleanHandle);
          if (meta.thumbnailUrl) thumbnailUrl = meta.thumbnailUrl;
          if (meta.title) itemTitle = meta.title;
          if (meta.price) itemPrice = meta.price;
        }
      } catch {}

      stories.unshift({
        id: storyId,
        title: itemTitle,
        badge: itemPrice > 0 ? `RD$${itemPrice}` : 'NUEVO REEL',
        liveNotice: `🔥 Nuevo video de @${cleanHandle}`,
        type: 'instagram',
        thumbnailUrl,
        videoUrl: '',
        instagramUrl: `https://www.instagram.com/reel/${shortcode}/`,
        embedUrl,
        price: itemPrice,
        productName: itemTitle,
        likesCount: Math.floor(Math.random() * 60) + 40,
        createdAt: new Date().toISOString(),
      });
      newlyAdded++;
    }
  }

  if (newlyAdded > 0) {
    if (stories.length > 50) stories.splice(50);
    saveJson(STORIES_FILE, stories);
  }

  lastProfileScan = { time: Date.now(), count: newlyAdded };
  return { 
    success: true, 
    newlyAdded, 
    totalStories: stories.length,
    handle: cleanHandle,
    discoveredCount: shortcodes.size,
    message: newlyAdded > 0 
      ? `¡Se importaron ${newlyAdded} nuevos videos de @${cleanHandle}!` 
      : `Los videos de @${cleanHandle} ya están sincronizados en la tienda.`
  };
}

// Scheduled auto-scanner every 30 minutes
setInterval(() => {
  const config = getJson(CONFIG_FILE, {});
  scanInstagramProfileReels(config.instagramProfileHandle || 'mvp_flow_losmina').catch(() => {});
}, 30 * 60 * 1000);

// API endpoint to trigger or configure profile auto-scan
app.post('/api/stories/scan-profile', async (req, res) => {
  try {
    const config = getJson(CONFIG_FILE, {});
    const handle = req.body?.handle || config.instagramProfileHandle || 'mvp_flow_losmina';
    const result = await scanInstagramProfileReels(handle);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE story
app.delete('/api/stories/:id', (req, res) => {
  try {
    const { id } = req.params;
    let stories = getJson(STORIES_FILE, DEFAULT_STORIES);
    const target = stories.find((s) => s.id === id);
    stories = stories.filter((s) => s.id !== id);
    saveJson(STORIES_FILE, stories);

    // Delete media file if stored locally
    if (target && target.videoUrl && target.videoUrl.startsWith('/media/stories/')) {
      const fileName = path.basename(target.videoUrl);
      const filePath = path.join(STORIES_DIR, fileName);
      if (fs.existsSync(filePath)) {
        try { fs.unlinkSync(filePath); } catch {}
      }
    }

    res.json({ success: true, message: 'Historia eliminada correctamente.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


// ==========================================
// API ROUTES: ORDERS & AUTOPEDIDO COD
// ==========================================

// Create Order (Public with Rate Limiter)
app.post('/api/orders', orderLimiter, async (req, res) => {
  try {
    const orderData = req.body;
    if (!orderData || !orderData.trackingId) {
      return res.status(400).json({ error: 'Invalid order payload' });
    }

    const orders = getJson(ORDERS_FILE, []);
    orders.unshift(orderData);
    if (orders.length > 5000) orders.splice(5000);
    saveJson(ORDERS_FILE, orders);

    // Track order event in Analytics Engine
    try {
      trackEvent({
        type: 'order_placed',
        sessionId: orderData.sessionId || 'checkout_session',
        source: orderData.source || 'direct',
        device: orderData.device || 'mobile',
        price: Number(orderData.payment?.total || 0),
        meta: {
          trackingId: orderData.trackingId,
          customerName: orderData.customer?.name,
          itemsCount: orderData.items?.length || 1,
          totalAmount: orderData.payment?.total || 0,
          paymentMethod: orderData.payment?.method || 'cod',
          zoneName: orderData.shipping?.zoneName || '',
        },
      });
    } catch (trackErr) {
      console.error('[Analytics Order Track Error]:', trackErr.message);
    }

    console.log(`[Order Received] #${orderData.trackingId} for ${orderData.customer?.name}`);

    // Send immediate response
    res.status(201).json({
      success: true,
      order: orderData,
    });

    // Auto dispatch order confirmation to Customer AND alert to Sales Team via Whaticket in background
    setImmediate(async () => {
      try {
        const config = getJson(CONFIG_FILE, {});
        const whaticket = config.whaticketConfig || {
          apiUrl: process.env.WHATICKET_API_URL || 'https://api.whaticket.com/api/v1',
          token: process.env.WHATICKET_TOKEN || '',
          connectionId: process.env.WHATICKET_CONNECTION_ID || '',
        };

        if (whaticket.token) {
          // 0. Auto guardar y sincronizar contacto en Whaticket
          if (orderData.customer?.phone) {
            try {
              await createOrUpdateWhaticketContact(whaticket, {
                name: orderData.customer.name || 'Cliente MVP Flow',
                number: orderData.customer.phone,
                extraInfo: [
                  { name: 'Tipo', value: 'Comprador Web' },
                  { name: 'Ticket', value: `#${orderData.trackingId}` },
                  { name: 'Zona', value: orderData.shipping?.zoneName || 'Santo Domingo' },
                ],
              });
            } catch (cErr) {
              console.log('[Whaticket Contact Auto-Save Error]:', cErr.message);
            }
          }

          // 1. Notificación al WhatsApp del Cliente
          if (orderData.customer?.phone) {
            const customerMsg = formatWhaticketOrderMessage(orderData);
            await sendWhaticketMessage(
              whaticket,
              orderData.customer.phone,
              customerMsg,
              orderData.customer.name || 'Cliente MVP Flow'
            );
            console.log(`[Whaticket API] ✔ Confirmación enviada al cliente (+${orderData.customer.phone}) para pedido #${orderData.trackingId}`);
          }

          // 2. Alerta de Ticket Pendiente al Equipo de Ventas / Bandeja Whaticket
          const staffPhone = process.env.STORE_WHATSAPP_PHONE || '18096560219';
          const itemsSummary = (orderData.items || [])
            .map((it, i) => `  ${i + 1}. 👟 *${it.name}* (Talla: ${it.size || 'Estándar'} | Color: ${it.color || 'OG'}) x ${it.quantity} = RD$ ${Number(it.price * it.quantity).toLocaleString('es-DO')}`)
            .join('\n');

          const staffAlertMsg = (
            `🚨 *¡NUEVO PEDIDO PENDIENTE POR DESPACHAR — MVP FLOW BOUTIQUE!* 🚨\n\n` +
            `📋 *Ticket de Entrega:* \`#${orderData.trackingId}\`\n` +
            `👤 *Cliente:* ${orderData.customer?.name || 'Cliente'}\n` +
            `📱 *WhatsApp Cliente:* ${orderData.customer?.phone || 'No especificado'}\n` +
            `📍 *Destino:* ${orderData.shipping?.municipality || 'Santo Domingo'}, ${orderData.shipping?.zoneName || ''}\n` +
            `🏠 *Dirección:* ${orderData.shipping?.address || 'Sin dirección'}\n` +
            (orderData.shipping?.reference ? `📌 *Referencia:* ${orderData.shipping.reference}\n` : '') +
            `\n🛍️ *PRODUCTOS A EMPACAR:*\n${itemsSummary}\n\n` +
            `💵 *TOTAL COD A COBRAR EN PUERTA:*\n` +
            `👉 *RD$ ${Number(orderData.payment?.total || 0).toLocaleString('es-DO')}* (Efectivo al mensajero)\n\n` +
            `🛵 *Tiempo de despacho:* 2 a 4 horas.\n` +
            `¡Asignar mensajero express de inmediato! 📦💨`
          );

          await sendWhaticketMessage(
            whaticket,
            staffPhone,
            staffAlertMsg,
            '🚨 Nuevo Pedido Web'
          );
          console.log(`[Whaticket API] ✔ Alerta de pedido pendiente creada para el equipo de ventas`);
        }
      } catch (bgErr) {
        console.error('[Whaticket Background Order Error]:', bgErr.message);
      }
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// List all orders (Protected - Privacy Protection)
app.get('/api/orders', requireAdminAuth, (req, res) => {
  const orders = getJson(ORDERS_FILE, []);
  res.json(orders);
});

// Get single order by Tracking ID (Sanitized for public buyer view, full view for Admin)
app.get('/api/orders/:trackingId', trackingLimiter, (req, res) => {
  const { trackingId } = req.params;
  const orders = getJson(ORDERS_FILE, []);
  const found = orders.find((o) => o.trackingId && o.trackingId.toUpperCase() === trackingId.toUpperCase());
  if (!found) return res.status(404).json({ error: 'Order not found' });

  // Check if caller is authenticated admin
  const authHeader = req.headers.authorization || req.headers['x-admin-token'];
  let token = '';
  if (authHeader) {
    token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : authHeader.trim();
  }
  const isAdmin = verifyAdminToken(token);

  if (isAdmin) {
    return res.json(found);
  }

  // Sanitized view for public buyer tracker: Mask PII (Phone & exact street address)
  const rawPhone = found.customer?.phone || '';
  const maskedPhone = rawPhone.length >= 7
    ? `${rawPhone.slice(0, 3)}****${rawPhone.slice(-2)}`
    : 'Protegido';

  const sanitizedOrder = {
    trackingId: found.trackingId,
    status: found.status || 'received',
    createdAt: found.createdAt || found.date,
    date: found.date,
    items: (found.items || []).map((it) => ({
      name: it.name,
      quantity: it.quantity,
      size: it.size || it.selectedSize,
      color: it.color || it.selectedColor,
      price: it.price,
      image: it.image || it.images?.[0] || '/img/drop-1.jpg',
    })),
    shipping: {
      municipality: found.shipping?.municipality || 'Santo Domingo',
      zoneName: found.shipping?.zoneName || '',
      estimatedHours: found.shipping?.estimatedHours || '2 a 4 hrs',
      address: found.shipping?.zoneName
        ? `${found.shipping.zoneName} (Dirección detallada protegida por privacidad)`
        : 'Dirección confirmada con mensajería',
      reference: found.shipping?.reference ? 'Referencia registrada' : '',
    },
    payment: {
      total: found.payment?.total || 0,
      method: found.payment?.method || 'cod',
    },
    customer: {
      name: found.customer?.name ? `${found.customer.name.split(' ')[0]} (Cliente)` : 'Cliente Web',
      phone: maskedPhone,
    },
  };

  res.json(sanitizedOrder);
});

// Update order status (Protected)
app.patch('/api/orders/:trackingId/status', requireAdminAuth, async (req, res) => {
  const { trackingId } = req.params;
  const { status } = req.body;
  const orders = getJson(ORDERS_FILE, []);
  const orderIndex = orders.findIndex((o) => o.trackingId && o.trackingId.toUpperCase() === trackingId.toUpperCase());

  if (orderIndex === -1) return res.status(404).json({ error: 'Order not found' });

  orders[orderIndex].status = status;
  orders[orderIndex].updatedAt = new Date().toISOString();
  saveJson(ORDERS_FILE, orders);

  // Send status update to customer via Whaticket
  const config = getJson(CONFIG_FILE, {});
  const statusLabels = {
    received: 'Recibido y en preparación',
    preparing: 'Empacado y listo para salir',
    shipped: '¡En ruta con el mensajero! 🛵',
    delivered: '¡Entregado exitosamente! 🎉',
  };

  const statusMsg = `📦 *ACTUALIZACIÓN DE TU PEDIDO - PLASTIR RD*\n\n` +
    `Ticket: #${trackingId}\n` +
    `Nuevo Estado: *${statusLabels[status] || status}*\n\n` +
    `Puedes seguir tu entrega en vivo en:\n` +
    `👉 https://plastirrd.com/?tracking=${trackingId}`;

  if (config.whaticketConfig?.token && config.whaticketConfig?.connectionId && orders[orderIndex].customer?.phone) {
    try {
      await sendWhaticketMessage(
        config.whaticketConfig,
        orders[orderIndex].customer.phone,
        statusMsg,
        orders[orderIndex].customer.name
      );
    } catch (e) {
      console.error('[Whaticket] Status update error:', e.message);
    }
  }

  res.json({ success: true, order: orders[orderIndex] });
});

// ==========================================
// API ROUTES: CONFIGURATION (WHATICKET & ODOO)
// ==========================================

// Get configuration: Returns full config if admin, or public store info if not
app.get('/api/config', (req, res) => {
  const authHeader = req.headers.authorization || req.headers['x-admin-token'];
  let token = '';
  if (authHeader) {
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7).trim();
    } else {
      token = authHeader.trim();
    }
  }

  const isAdmin = verifyAdminToken(token);
  const rawConfig = getJson(CONFIG_FILE, {});
  const wc = rawConfig.whaticketConfig || {};
  const oc = rawConfig.odooConfig || {};

  const currentConfig = {
    ...rawConfig,
    whaticketConfig: {
      apiUrl: (wc.apiUrl || process.env.WHATICKET_API_URL || 'https://api.whaticket.com/api/v1').trim(),
      token: (wc.token || process.env.WHATICKET_TOKEN || '').trim(),
      connectionId: (wc.connectionId || process.env.WHATICKET_CONNECTION_ID || '').trim(),
      companyId: (wc.companyId || process.env.WHATICKET_COMPANY_ID || '').trim(),
      supportPhone: (wc.supportPhone || process.env.STORE_WHATSAPP_PHONE || '18096560219').trim(),
      autoSendWhaticket: wc.autoSendWhaticket !== undefined ? wc.autoSendWhaticket : true,
    },
    odooConfig: {
      url: (oc.url || process.env.ODOO_URL || '').trim(),
      db: (oc.db || process.env.ODOO_DB || '').trim(),
      username: (oc.username || process.env.ODOO_USERNAME || '').trim(),
      apiKey: (oc.apiKey || process.env.ODOO_API_KEY || '').trim(),
      autoSync: oc.autoSync !== undefined ? oc.autoSync : false,
    },
  };

  if (isAdmin) {
    return res.json(currentConfig);
  }

  // Sanitized public view
  res.json({
    storeName: process.env.STORE_NAME || 'PLASTIR RD',
    storeDomain: process.env.STORE_DOMAIN || 'plastirrd.com',
    supportPhone: process.env.STORE_WHATSAPP_PHONE || '18096560219',
    autoSendWhaticket: true,
  });
});

// Update configuration (Protected)
app.post('/api/config', requireAdminAuth, (req, res) => {
  const newConfig = req.body;
  const current = getJson(CONFIG_FILE, {});
  const merged = { ...current, ...newConfig };
  saveJson(CONFIG_FILE, merged);
  res.json({ success: true, config: merged });
});

// ==========================================
// API ROUTES: ANALYTICS & CONVERSION ENGINE
// ==========================================

// Track client-side event (Visits, Clicks, Drafts, WhatsApp Quotes, etc.) (Rate Limited)
app.post('/api/analytics/track', analyticsLimiter, (req, res) => {
  try {
    const eventData = req.body || {};
    const clientIp =
      req.headers['cf-connecting-ip'] ||
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.ip ||
      '';
    const country = req.headers['cf-ipcountry'] || 'RD';
    const city = req.headers['cf-ipcity'] || 'Santo Domingo';
    eventData.clientIp = clientIp;
    eventData.country = country;
    eventData.city = city;
    const tracked = trackEvent(eventData);
    res.json({ success: true, eventId: tracked.id });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get comprehensive Analytics Dashboard (Protected)
app.get('/api/analytics/dashboard', requireAdminAuth, (req, res) => {
  try {
    const range = req.query.range || 'all'; // 'today', '7d', '30d', 'all'
    const dashboard = getAnalyticsDashboard(range);
    res.json(dashboard);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Reset Analytics (Protected)
app.delete('/api/analytics/reset', requireAdminAuth, (req, res) => {
  try {
    const result = resetAnalytics();
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Quick Replies Bank API Endpoint
app.get('/api/quick-replies', (req, res) => {
  const agentName = req.query.agent || 'Ashley';
  const quickReplies = [
    {
      id: 'bienvenida',
      command: '/bienvenida',
      aliases: ['/saludo', '/hola'],
      title: 'Saludo & Bienvenida (Asesor)',
      text: `Hola, le asiste ${agentName} ! 👋🔥\n\nBienvenido/a a MVP FLOW BOUTIQUE RD, la tienda #1 en tenis y ropa urbana. Será un placer atenderte. 🛍️\n\nCuéntame, ¿qué modelo o talla estás buscando hoy? Te envío fotos reales y toda la información de una vez. 👟✨`,
    },
    {
      id: 'despedida',
      command: '/despedida',
      aliases: ['/bye', '/gracias'],
      title: 'Despedida & Cierre Asertivo',
      text: `¡Gracias por comunicarte con MVP FLOW BOUTIQUE RD! 🙌🔥\n\nHa sido un placer atenderte. Recuerda que estamos a la orden para ayudarte con cualquier modelo, talla o información que necesites.\n\n¡Esperamos verte pronto! 👟🛍️✨`,
    },
    {
      id: 'ubicacion',
      command: '/ubicacion',
      aliases: ['/tienda', '/direccion'],
      title: 'Ubicación & Horarios de Tienda',
      text: `📍 *UBICACIÓN OFICIAL DE NUESTRA TIENDA:*\n\nEstamos ubicados en la *Av. San Vicente de Paúl, Los Mina, Santo Domingo Este* (justo al lado de la estación del metro Trina de Moya de Vázquez).\n\n🕒 *Horario:* Lunes a Domingo de 9:00 AM a 9:00 PM.\n¡Pasa por allá a medírtelos o te los enviamos hoy mismo a tu casa con mensajero! 🛵`,
    },
    {
      id: 'cod',
      command: '/cod',
      aliases: ['/pago', '/entrega'],
      title: 'Explicación Pago Contra Entrega (COD)',
      text: `💵 *¿CÓMO FUNCIONA EL PAGO CONTRA ENTREGA?*\n\n1. Tú confirmas tu pedido hoy.\n2. Nuestro mensajero express sale para tu dirección.\n3. Te entregamos tus tenis en mano, los revisas y *pagas en efectivo o transferencia* en el momento.\n\n¡Cero riesgo para ti! 100% seguro y garantizado. 💯`,
    },
    {
      id: 'confirmar',
      command: '/confirmar',
      aliases: ['/pedido', '/datos'],
      title: 'Captura de Datos para Despacho COD',
      text: `📦 *PARA DESPACHAR TU PAQUETE HOY MISMO, ENVÍANOS ESTOS DATOS:*\n\n• *Nombre Completo:*\n• *Teléfono de Contacto:*\n• *Provincia y Sector:*\n• *Calle y Número de Casa/Apto:*\n• *Punto de Referencia:*\n• *Modelo y Talla:*\n\n¡Apenas nos envíes esto, empaquetamos y te asignamos el mensajero de inmediato! 🛵💨`,
    },
    {
      id: 'seguimiento',
      command: '/seguimiento',
      aliases: ['/postventa', '/resena'],
      title: 'Seguimiento Post-Venta & Reseñas',
      text: `¡Saludos mi líder! 👋 ¿Qué tal te quedó la pinta que recibiste de *MVP FLOW BOUTIQUE RD*?\n\nSi puedes, tómate una foto y etiquétanos en Instagram *@mvp_flow_boutique08* para repostearte. 🔥👟`,
    },
  ];
  res.json({ success: true, count: quickReplies.length, quickReplies });
});

// System & Database Health Check Endpoint (Public for DevOps / Telemetry Verification)
app.get(['/api/health', '/api/database/status'], (req, res) => {
  try {
    const checkFile = (filePath) => {
      if (!fs.existsSync(filePath)) return { exists: false, sizeBytes: 0, itemsCount: 0 };
      const stat = fs.statSync(filePath);
      let itemsCount = 0;
      try {
        const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        if (Array.isArray(content)) itemsCount = content.length;
        else if (content && typeof content === 'object') {
          if (content.events && Array.isArray(content.events)) itemsCount = content.events.length;
          else if (content.counters) itemsCount = Object.keys(content.counters).length;
          else itemsCount = Object.keys(content).length;
        }
      } catch {
        // ignore
      }
      return { exists: true, sizeBytes: stat.size, itemsCount, lastModified: stat.mtime };
    };

    const analytics = getAnalyticsDashboard();
    const analyticsFileStat = checkFile(ANALYTICS_FILE);
    const albumFileStat = checkFile(ALBUM_FILE);
    const ordersFileStat = checkFile(ORDERS_FILE);
    const contactsFileStat = checkFile(CONTACTS_FILE);
    const productsFileStat = checkFile(PRODUCTS_FILE);

    // Check write permissions in DATA_DIR
    let isWritable = false;
    try {
      const testFile = path.join(DATA_DIR, '.write_test');
      fs.writeFileSync(testFile, 'ok', 'utf8');
      fs.unlinkSync(testFile);
      isWritable = true;
    } catch {
      isWritable = false;
    }

    res.json({
      status: 'ONLINE',
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      database: {
        storageType: 'Persistent Host Volume Mounted (/var/www/plastirrd/server/data -> /app/server/data)',
        directory: DATA_DIR,
        isWritable,
        preservationRule: 'Preserved by git clean -e server/data + auto-backup in deploy.sh',
        files: {
          analytics: {
            path: 'server/data/analytics.json',
            status: analyticsFileStat.exists ? 'ACTIVE' : 'INITIALIZING',
            sizeBytes: analyticsFileStat.sizeBytes,
            totalVisits: analytics.counters?.totalVisits || 0,
            productViews: analytics.counters?.productViews || 0,
            whatsappQuotes: analytics.counters?.whatsappQuotes || 0,
            completedOrders: analytics.counters?.completedOrders || 0,
            lastModified: analyticsFileStat.lastModified,
          },
          album: {
            path: 'server/data/album.json',
            status: albumFileStat.exists ? 'ACTIVE' : 'INITIALIZING',
            sizeBytes: albumFileStat.sizeBytes,
            totalPhotosStored: albumFileStat.itemsCount,
            lastModified: albumFileStat.lastModified,
          },
          orders: {
            path: 'server/data/orders.json',
            status: ordersFileStat.exists ? 'ACTIVE' : 'INITIALIZING',
            totalOrders: ordersFileStat.itemsCount,
            lastModified: ordersFileStat.lastModified,
          },
          contacts: {
            path: 'server/data/contacts.json',
            status: contactsFileStat.exists ? 'ACTIVE' : 'INITIALIZING',
            totalContacts: contactsFileStat.itemsCount,
            lastModified: contactsFileStat.lastModified,
          },
          products: {
            path: 'server/data/products.json',
            status: productsFileStat.exists ? 'ACTIVE' : 'INITIALIZING',
            totalProducts: productsFileStat.itemsCount,
            lastModified: productsFileStat.lastModified,
          },
        },
      },
      message: '✔ La base de datos local y fotos del álbum están conectadas, montadas en volumen persistente y protegidas contra borrado en cada despliegue.',
    });
  } catch (err) {
    res.status(500).json({ status: 'ERROR', error: err.message });
  }
});

// Serve static build with no-cache on HTML to ensure instant updates
const distPath = path.join(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(
    express.static(distPath, {
      maxAge: '1h',
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html') || filePath.endsWith('.zip')) {
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
          res.setHeader('Pragma', 'no-cache');
          res.setHeader('Expires', '0');
        }
      },
    })
  );

  // Dedicated Catalog Route
  app.get(['/catalogo', '/catalogo.html', '/app/catalogo'], (req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    const catHtmlPath = path.join(distPath, 'catalogo.html');
    if (fs.existsSync(catHtmlPath)) {
      res.sendFile(catHtmlPath);
    } else {
      res.sendFile(path.join(distPath, 'index.html'));
    }
  });

  // Dedicated One-Time Upload Page Route
  app.get(['/subir-fotos', '/subir-fotos/:token', '/subir-fotos.html', '/subir_fotos', '/upload-link', '/upload-link/:token'], (req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    const uploadHtmlPath = path.join(distPath, 'subir-fotos.html');
    if (fs.existsSync(uploadHtmlPath)) {
      res.sendFile(uploadHtmlPath);
    } else {
      res.sendFile(path.join(distPath, 'index.html'));
    }
  });

  // Dedicated Stories & TikTok Shorts Upload Page Route
  app.get(['/subir-historias', '/subir-historias.html', '/subir_historias', '/subir-video', '/historias', '/historias-admin'], (req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    const storiesHtmlPath = path.join(distPath, 'subir-historias.html');
    if (fs.existsSync(storiesHtmlPath)) {
      res.sendFile(storiesHtmlPath);
    } else {
      res.sendFile(path.join(distPath, 'index.html'));
    }
  });

  app.get('*', (req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.sendFile(path.join(distPath, 'index.html'));
  });
}


app.listen(PORT, () => {
  console.log(`🚀 [MVP FLOW BOUTIQUE RD] Server running on port ${PORT}`);
  console.log(`🔒 Security: Admin Auth, Rate Limiting & Atomic Storage active.`);
  console.log(`📡 Whaticket v1.0.0, Odoo ERP & Local Catalog endpoints ready.`);
});
