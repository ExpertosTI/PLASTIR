# -*- coding: utf-8 -*-
{
    'name': 'PLASTIR RD - Liquidación de Mercancías, Compras y Contabilidad',
    'version': '18.0.1.1.0',
    'category': 'Inventory/Accounting/Purchases',
    'summary': 'Gestión nativa de importaciones, compras locales, liquidación aduanal DGA, prorrateo de costos, mercancías en tránsito y dashboard operativo.',
    'description': """
Módulo Compuesto PLASTIR RD: Liquidación de Mercancías y Flujo de Compras (App Nativa)
======================================================================================

Este módulo resuelve de forma integral la gestión de compras y la contabilidad de importaciones para PLASTIR SRL:

1. **Dashboard Operativo Nativo (Estilo Inventory / Stock Manager):**
   - Panel de Información General con tarjetas de operaciones:
     * Liquidaciones en Tránsito Marítimo / Aéreo
     * Gestión DGA & Despacho Aduanal
     * Pendientes de Prorrateo & Costeo Landed
     * Cierre Contable Tránsito & Inventario
     * Compras Locales (RD$)
   - Métricas en tiempo real: Contadores para procesar, alertas de retraso (ETA), FOB total USD y Landed RD$.
   - Acceso rápido a importación desde Excel y creación manual.

2. **Notificaciones y Seguimiento de Actividades:**
   - Tipos de actividad especializados para importaciones (Seguimiento ETA, Revisión DUA/DGA, Validación de Prorrateo).
   - Programación automática de actividades por cambio de estado.
   - Historial completo en Chatter con notificaciones enriquecidas.
   - Menú centralizado de Actividades Pendientes.

3. **Compras Locales e Internacionales:**
   - Compras locales en RD$ con recepción y comprobantes fiscales (NCF).
   - Compras internacionales en USD con enlace a liquidaciones y cuenta de Mercancías en Tránsito.

4. **Prorrateo Matemático Exacto (Plantillas PLASTIR SRL):**
   - Distribución proporcional por factura de flete, seguro, descuentos y comisiones.
   - Prorrateo de gastos aduanales en RD$ (arancel, ISC, DGA, transporte local).
   - Control de ITBIS DUA (Crédito Fiscal vs ITBIS No Recuperable capitalizable).
   - Asiento automático de cierre contable y actualización del costo estándar en el catálogo Odoo.

5. **Carga Inteligente desde Excel:**
   - Asistente compatible con `Plantilla_Liquidacion_Mercancias_PLASTIR_SRL.xlsx` y `Modelo de liquidacion de plastir.xlsx`.
    """,
    'author': 'RENACE.tech / PLASTIR RD',
    'website': 'https://plastirrd.com',
    'license': 'LGPL-3',
    'depends': [
        'base',
        'purchase',
        'stock',
        'account',
        'mail',
    ],
    'external_dependencies': {
        'python': ['openpyxl'],
    },
    'data': [
        'security/settlement_security.xml',
        'security/ir.model.access.csv',
        'data/plastir_settlement_data.xml',
        'views/plastir_settlement_views.xml',
        'wizard/plastir_settlement_import_wizard_views.xml',
        'views/purchase_order_views.xml',
        'views/res_config_settings_views.xml',
        'views/menus.xml',
    ],
    'assets': {
        'web.assets_backend': [
            'plastir_settlement_management/static/src/scss/settlement_modern.scss',
        ],
    },
    'application': True,
    'installable': True,
    'auto_install': False,
}
