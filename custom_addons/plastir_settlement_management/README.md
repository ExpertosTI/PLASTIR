# PLASTIR RD — Liquidación de Mercancías, Compras y Contabilidad

Módulo compuesto para Odoo 18 diseñado bajo los estándares empresariales de **RENACE.tech** para **PLASTIR SRL**.

## Características Principales

1. **Gestión de Compras Locales e Internacionales:**
   - Flujo de compras locales con NCF y proveedores nacionales en RD$.
   - Flujo de compras internacionales en moneda extranjera (USD).

2. **Control de Liquidación e Importación:**
   - Código único estandarizado con formato: `Mes/Año/REF de embarque` (ej: `07/2026/A26TM06007`).
   - Trazabilidad y acumulación en la cuenta transitoria **Mercancías en Tránsito**.

3. **Prorrateo Matemático Landed:**
   - Flete internacional, Seguro, Comisiones, Descuentos.
   - Tributos DGA: Arancel / Gravamen, Impuesto Selectivo al Consumo (ISC).
   - Gastos locales: Tasas portuarias, Agente aduanal, Transporte local, Gastos de viajes y almacenaje.
   - **Control de ITBIS DGA:** Distingue el ITBIS con derecho a crédito fiscal (activo recuperable) del ITBIS no recuperable que se capitaliza en inventario.

4. **Cierre Contable y Valoración:**
   - Asiento contable automatizado de liquidación (Débito a Inventario e ITBIS Crédito, Crédito a Mercancías en Tránsito).
   - Actualización directa de costos estándar (`standard_price`) en el catálogo de productos.

5. **Carga Inteligente desde Excel:**
   - Asistente para cargar la plantilla oficial `Plantilla_Liquidacion_Mercancias_PLASTIR_SRL.xlsx` y `Modelo de liquidacion de plastir.xlsx`.
   - Auto-creación de productos y SKUs no existentes.

6. **Interfaz Visual 2026:**
   - Vistas Kanban, Lista, Formulario con Micro-Dashboard KPI, Gráficos de barras y Matriz Pivot.
