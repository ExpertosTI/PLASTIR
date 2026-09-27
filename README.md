# PLASTIR RD | Tienda por Departamentos (Shopify + IKEA Experience)

Plataforma de comercio electrónico y tienda departamental para **PLASTIR RD** (`https://plastirrd.com`), especializada en soluciones de organización, almacenamiento, cocina, lavandería y plásticos industriales de alta resistencia.

Inspirada en la estética nórdica minimalista de **IKEA** y la experiencia de compra ágil de **Shopify**, con integración completa de sincronización empresarial **Odoo ERP** y canal directo de **Whaticket / WhatsApp**.

---

## 🏬 Características Principales

### 1. Experiencia Departamental & Showrooms IKEA
- **7 Departamentos de Especialidad:**
  - 📦 *Organización & Clóset* (Cajas con broches, gaveteros modulares, zapateras magnéticas).
  - 🍳 *Cocina & Despensa* (Herméticos Click-Lock 100% libres de BPA, dispensadores de granos).
  - 🧺 *Lavandería & Baño* (Cestos ventilados ergonómicos, baldes con exprimidor de mopa).
  - 🌿 *Mesa, Hogar & Terraza* (Jarras herméticas para nevera, vasos y vajilla irrompible).
  - 🏭 *Industrial & Comercial B2B* (Zafacones con pedal y ruedas de 120L, cajas agrícolas).
  - 👶 *Infantil & Bebé* (Gaveteros pastel anticolisión, bañeras y jugueteros apilables).
  - 🪑 *Mobiliario & Sillas* (Sillas monoblock reforzadas, mesas desmontables para terraza).
- **Showrooms "Inspírate por Espacios":**
  - Explora ambientes reales (Cocina, Clóset, Lavandería, Almacén) con opción de **"Comprar Ambiente Completo"** con un solo clic y 25% de ahorro.

### 2. Experiencia de Compra Shopify
- **Drawer de Carrito Instantáneo:** Barra de envío gratis progresiva, selección de packs y cupones.
- **Filtros Facetados & Búsqueda Fonética Predictiva:** Búsqueda rápida con tolerancia a errores ortográficos comunes en español (`cajas`, `hermeticos`, `zafacones`, `cestos`, etc.).
- **Ficha Técnica & Dimensiones:** Medidas exactas, capacidad en litros, certificaciones BPA Free y precios por volumen.

### 3. Venta Mayorista & B2B
- **Cotizador Rápido Integrado:** Generación de cotizaciones instantáneas por docena y bultos con precios especiales por volumen para el hogar y negocios.
- **Chat en Vivo & WhatsApp Directo:** Asesoría personalizada con un toque para ventas mayoristas.

### 4. Arquitectura y Sincronización ERP (RENACE Core Engine)
- **Odoo ERP Integration:** Sincronización continua de inventario, stock en almacén central, precios y variantes vía JSON-RPC.
- **Whaticket API REST:** Canales de mensajería automatizados para confirmación de pedidos.
- **PWA & Offline Ready:** Catálogo accesible y guardado de pedidos con fallback sin conexión.

---

## 🚀 Despliegue en Producción (Docker Swarm / PM2)

El despliegue está automatizado para el VPS mediante Docker Swarm y proxy reverso Traefik con certificados SSL automáticos Let's Encrypt para `plastirrd.com`:

```bash
# En el VPS:
cd /var/www/plastir
bash deploy.sh
```

---

## 🛠️ Desarrollo Local

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Compilar para producción
npm run build

# Iniciar servidor Node backend
npm run server
```

---

© 2026 **PLASTIR RD** (`plastirrd.com`) • Desarrollado con el ecosistema de tecnología **RENACE**.
