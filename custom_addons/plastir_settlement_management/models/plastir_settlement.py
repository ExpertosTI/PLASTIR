# -*- coding: utf-8 -*-
from odoo import models, fields, api, _
from odoo.exceptions import UserError, ValidationError
import logging

_logger = logging.getLogger(__name__)

class PlastirSettlementType(models.Model):
    _name = 'plastir.settlement.type'
    _description = 'Tipo de Operación y Control de Liquidación'
    _order = 'sequence, id'

    name = fields.Char(string='Tipo de Operación', required=True, translate=True)
    sequence = fields.Integer(string='Secuencia', default=10)
    code = fields.Selection([
        ('in_transit', 'En Tránsito Marítimo / Aéreo'),
        ('customs', 'Gestión DGA / Aduanal'),
        ('draft', 'Pendientes de Prorrateo & Costeo'),
        ('done', 'Cierre Contable Tránsito & Inventario'),
        ('local', 'Compras Locales'),
    ], string='Código de Operación', required=True, default='in_transit')
    active = fields.Boolean(string='Activo', default=True)
    color = fields.Integer(string='Color', default=0)
    icon = fields.Char(string='Ícono FontAwesome', default='fa-ship')

    company_id = fields.Many2one(
        'res.company',
        string='Compañía',
        default=lambda self: self.env.company,
        required=True
    )
    currency_id = fields.Many2one(
        'res.currency',
        string='Moneda USD',
        default=lambda self: self.env.ref('base.USD', raise_if_not_found=False) or self.env.company.currency_id,
        required=True
    )
    company_currency_id = fields.Many2one(
        'res.currency',
        related='company_id.currency_id',
        string='Moneda Local (RD$)'
    )

    count_to_process = fields.Integer(string='Para Procesar', compute='_compute_settlement_counts')
    count_late = fields.Integer(string='Con Retraso', compute='_compute_settlement_counts')
    count_waiting = fields.Integer(string='En Espera', compute='_compute_settlement_counts')
    total_fob_usd = fields.Monetary(string='Total FOB (USD)', currency_field='currency_id', compute='_compute_settlement_counts')
    total_landed_rd = fields.Monetary(string='Total Landed (RD$)', currency_field='company_currency_id', compute='_compute_settlement_counts')

    def _compute_settlement_counts(self):
        Settlement = self.env['plastir.settlement']
        today = fields.Date.context_today(self)
        for rec in self:
            domain = [('company_id', '=', rec.company_id.id)]
            if rec.code == 'in_transit':
                domain += [('state', '=', 'in_transit')]
            elif rec.code == 'customs':
                domain += [('state', 'in', ('in_transit', 'liquidated'))]
            elif rec.code == 'draft':
                domain += [('state', '=', 'draft')]
            elif rec.code == 'done':
                domain += [('state', '=', 'done')]
            elif rec.code == 'local':
                po_domain = [('company_id', '=', rec.company_id.id), ('is_international_purchase', '=', False), ('state', 'in', ('draft', 'sent', 'to approve', 'purchase'))]
                orders = self.env['purchase.order'].search(po_domain)
                rec.count_to_process = len(orders)
                rec.count_late = len(orders.filtered(lambda p: p.date_order and p.date_order.date() < today and p.state != 'purchase'))
                rec.count_waiting = len(orders.filtered(lambda p: p.state in ('draft', 'sent')))
                rec.total_fob_usd = 0.0
                rec.total_landed_rd = sum(orders.mapped('amount_total'))
                continue

            records = Settlement.search(domain)
            rec.count_to_process = len(records)
            rec.count_late = len(records.filtered(lambda s: s.eta_date and s.eta_date < today and s.state != 'done'))
            rec.count_waiting = len(records.filtered(lambda s: s.state == 'draft'))
            rec.total_fob_usd = sum(records.mapped('total_fob_usd'))
            rec.total_landed_rd = sum(records.mapped('total_costo_inventario_rd'))

    def get_action_settlement_tree_ready(self):
        self.ensure_one()
        if self.code == 'local':
            return self.env.ref('plastir_settlement_management.action_purchase_order_local').read()[0]
        action = self.env.ref('plastir_settlement_management.action_plastir_settlement').read()[0]
        domain = [('company_id', '=', self.company_id.id)]
        if self.code == 'in_transit':
            domain += [('state', '=', 'in_transit')]
        elif self.code == 'customs':
            domain += [('state', 'in', ('in_transit', 'liquidated'))]
        elif self.code == 'draft':
            domain += [('state', '=', 'draft')]
        elif self.code == 'done':
            domain += [('state', '=', 'done')]
        action['domain'] = domain
        action['context'] = {'default_type_id': self.id}
        return action

    def action_create_new(self):
        self.ensure_one()
        if self.code == 'local':
            return {
                'type': 'ir.actions.act_window',
                'res_model': 'purchase.order',
                'view_mode': 'form',
                'context': {'default_is_international_purchase': False},
                'target': 'current',
            }
        return {
            'type': 'ir.actions.act_window',
            'res_model': 'plastir.settlement',
            'view_mode': 'form',
            'context': {'default_type_id': self.id},
            'target': 'current',
        }

    def action_open_wizard(self):
        self.ensure_one()
        return self.env.ref('plastir_settlement_management.action_plastir_settlement_import_wizard').read()[0]

    def action_view_activities(self):
        self.ensure_one()
        return {
            'name': _('Actividades y Seguimiento: %s') % self.name,
            'type': 'ir.actions.act_window',
            'res_model': 'mail.activity',
            'view_mode': 'list,form',
            'domain': [('res_model', '=', 'plastir.settlement')],
            'target': 'current',
        }


class PlastirSettlement(models.Model):
    _name = 'plastir.settlement'
    _description = 'Expediente de Liquidación de Mercancías e Importación'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'date desc, id desc'

    name = fields.Char(
        string='Control de Liquidación',
        required=True,
        copy=False,
        readonly=True,
        default=lambda self: _('Nuevo'),
        tracking=True,
        help='Formato único: Mes/Año/REF de embarque (ej. 07/2026/A26TM06007)'
    )
    operation_code = fields.Char(
        string='Código de Operación / Embarque',
        required=True,
        tracking=True,
        help='Referencia de operación (ej. A26TM06007 o BL-984712)'
    )
    shipping_ref = fields.Char(
        string='No. B/L / Contenedor / Guía',
        tracking=True
    )
    date = fields.Date(
        string='Fecha de Liquidación',
        default=fields.Date.context_today,
        required=True,
        tracking=True
    )
    state = fields.Selection([
        ('draft', 'Borrador'),
        ('in_transit', 'En Tránsito'),
        ('liquidated', 'Liquidado'),
        ('done', 'Cerrado / Contabilizado'),
        ('cancel', 'Cancelado')
    ], string='Estado', default='draft', tracking=True)

    company_id = fields.Many2one(
        'res.company',
        string='Compañía',
        default=lambda self: self.env.company,
        required=True
    )
    type_id = fields.Many2one(
        'plastir.settlement.type',
        string='Tipo de Operación',
        tracking=True
    )
    eta_date = fields.Date(
        string='Fecha Estimada de Llegada (ETA)',
        tracking=True,
        help='Fecha estimada de arribo a puerto / aduana'
    )
    partner_id = fields.Many2one(
        'res.partner',
        string='Proveedor Internacional',
        tracking=True,
        help='Proveedor principal del embarque (ej. NINGBO TOPWIN CO., LTD)'
    )

    currency_id = fields.Many2one(
        'res.currency',
        string='Moneda Origen',
        default=lambda self: self.env.ref('base.USD', raise_if_not_found=False) or self.env.company.currency_id,
        required=True
    )
    company_currency_id = fields.Many2one(
        'res.currency',
        related='company_id.currency_id',
        string='Moneda Local (RD$)'
    )
    exchange_rate = fields.Float(
        string='Tasa USD / RD$',
        digits=(12, 4),
        default=60.00,
        required=True,
        tracking=True,
        help='Tasa efectiva usada para la liquidación aduanal'
    )

    notes = fields.Text(string='Observaciones y Notas')

    # Facturas y Líneas de Mercancías
    invoice_ids = fields.One2many(
        'plastir.settlement.invoice',
        'settlement_id',
        string='Facturas del Proveedor'
    )
    line_ids = fields.One2many(
        'plastir.settlement.line',
        'settlement_id',
        string='Detalle de Mercancías'
    )

    # Documentos vinculados en Odoo
    purchase_order_ids = fields.Many2many(
        'purchase.order',
        'plastir_settlement_po_rel',
        'settlement_id', 'order_id',
        string='Órdenes de Compra (USD)'
    )
    picking_ids = fields.Many2many(
        'stock.picking',
        'plastir_settlement_picking_rel',
        'settlement_id', 'picking_id',
        string='Recepciones de Inventario'
    )
    vendor_bill_ids = fields.Many2many(
        'account.move',
        'plastir_settlement_bill_rel',
        'settlement_id', 'move_id',
        domain="[('move_type', '=', 'in_invoice')]",
        string='Facturas de Gastos / Proveedor'
    )

    # Contabilidad y Cuentas de Enlace
    transit_account_id = fields.Many2one(
        'account.account',
        string='Cuenta Mercancías en Tránsito',
        help='Cuenta transitoria donde se acumulan los pagos y anticipos antes de liquidar'
    )
    stock_valuation_account_id = fields.Many2one(
        'account.account',
        string='Cuenta de Existencias / Inventario',
        help='Cuenta de valoración de inventario a cargar con el costo landed total'
    )
    customs_itbis_account_id = fields.Many2one(
        'account.account',
        string='Cuenta ITBIS Crédito Fiscal DGA',
        help='Cuenta de impuestos recuperables en aduana'
    )
    journal_id = fields.Many2one(
        'account.journal',
        string='Diario Contable de Liquidaciones',
        domain="[('type', 'in', ('general', 'purchase'))]"
    )
    account_move_id = fields.Many2one(
        'account.move',
        string='Asiento Contable de Cierre',
        readonly=True,
        ondelete='restrict'
    )

    # Totales en USD
    total_fob_usd = fields.Float(
        string='Total FOB USD',
        compute='_compute_totals_usd',
        store=True,
        digits='Product Price'
    )
    total_discount_usd = fields.Float(
        string='Total Descuento USD',
        compute='_compute_totals_usd',
        store=True,
        digits='Product Price'
    )
    total_commission_usd = fields.Float(
        string='Total Comisión USD',
        compute='_compute_totals_usd',
        store=True,
        digits='Product Price'
    )
    total_freight_usd = fields.Float(
        string='Total Flete USD',
        compute='_compute_totals_usd',
        store=True,
        digits='Product Price'
    )
    total_insurance_usd = fields.Float(
        string='Total Seguro USD',
        compute='_compute_totals_usd',
        store=True,
        digits='Product Price'
    )
    total_cif_usd = fields.Float(
        string='Total Puesto USD (CIF)',
        compute='_compute_totals_usd',
        store=True,
        digits='Product Price'
    )
    total_cartons = fields.Integer(
        string='Total Cajas',
        compute='_compute_totals_usd',
        store=True
    )
    total_units = fields.Float(
        string='Total Unidades',
        compute='_compute_totals_usd',
        store=True
    )

    # Gastos Locales y Tributos Pagados en RD$ (Documentados)
    arancel_dop = fields.Float(string='Arancel / Gravamen DGA (RD$)', default=0.0)
    selectivo_dop = fields.Float(string='Impuesto Selectivo al Consumo (RD$)', default=0.0)
    tasas_portuarias_dop = fields.Float(string='Tasas y Servicios Portuarios (RD$)', default=0.0)
    agente_aduanal_dop = fields.Float(string='Agente Aduanal y Despacho (RD$)', default=0.0)
    transporte_local_dop = fields.Float(string='Transporte Terrestre Local (RD$)', default=0.0)
    almacenaje_dop = fields.Float(string='Almacenaje en Puerto (RD$)', default=0.0)
    inspeccion_dop = fields.Float(string='Inspección y Manipulación (RD$)', default=0.0)
    gastos_viajes_dop = fields.Float(string='Gastos de Viajes / Negociación (RD$)', default=0.0)
    otros_gastos_1_dop = fields.Float(string='Otros Gastos Atribuibles 1 (RD$)', default=0.0)
    otros_gastos_2_dop = fields.Float(string='Otros Gastos Atribuibles 2 (RD$)', default=0.0)

    subtotal_gastos_rd = fields.Float(
        string='Subtotal Gastos y Tributos RD$',
        compute='_compute_subtotal_gastos_rd',
        store=True
    )

    # Control de ITBIS Aduanal
    itbis_pagado_dua = fields.Float(string='ITBIS Pagado DUA (RD$)', default=0.0)
    itbis_recuperable = fields.Float(string='ITBIS Recuperable / Crédito Fiscal (RD$)', default=0.0)
    itbis_no_recuperable = fields.Float(
        string='ITBIS No Recuperable / Costo (RD$)',
        compute='_compute_itbis_control',
        store=True
    )
    itbis_status = fields.Char(
        string='Control ITBIS',
        compute='_compute_itbis_control',
        store=True
    )

    # Totales Finales Capitalizables
    total_gastos_capitalizables_rd = fields.Float(
        string='Gastos Capitalizables RD$',
        compute='_compute_grand_totals',
        store=True
    )
    total_cif_dop = fields.Float(
        string='Total Puesto RD$ (FOB+Int.)',
        compute='_compute_grand_totals',
        store=True
    )
    total_costo_inventario_rd = fields.Float(
        string='Costo Total Inventario RD$',
        compute='_compute_grand_totals',
        store=True
    )

    @api.model_create_multi
    def create(self, vals_list):
        for vals in vals_list:
            if vals.get('name', _('Nuevo')) == _('Nuevo'):
                date_val = fields.Date.from_string(vals.get('date')) or fields.Date.today()
                op_code = vals.get('operation_code', 'IMP').strip().upper()
                # Formato: MM/AAAA/REF_EMBARQUE
                vals['name'] = f"{date_val.strftime('%m/%Y')}/{op_code}"
        return super(PlastirSettlement, self).create(vals_list)

    @api.depends('invoice_ids.fob_usd', 'invoice_ids.discount_usd', 'invoice_ids.commission_usd',
                 'invoice_ids.freight_usd', 'invoice_ids.insurance_usd', 'invoice_ids.cartons',
                 'line_ids.quantity')
    def _compute_totals_usd(self):
        for rec in self:
            rec.total_fob_usd = sum(rec.invoice_ids.mapped('fob_usd'))
            rec.total_discount_usd = sum(rec.invoice_ids.mapped('discount_usd'))
            rec.total_commission_usd = sum(rec.invoice_ids.mapped('commission_usd'))
            rec.total_freight_usd = sum(rec.invoice_ids.mapped('freight_usd'))
            rec.total_insurance_usd = sum(rec.invoice_ids.mapped('insurance_usd'))
            rec.total_cif_usd = (rec.total_fob_usd - rec.total_discount_usd + rec.total_commission_usd +
                                 rec.total_freight_usd + rec.total_insurance_usd)
            rec.total_cartons = sum(rec.invoice_ids.mapped('cartons'))
            rec.total_units = sum(rec.line_ids.mapped('quantity'))

    @api.depends('arancel_dop', 'selectivo_dop', 'tasas_portuarias_dop', 'agente_aduanal_dop',
                 'transporte_local_dop', 'almacenaje_dop', 'inspeccion_dop', 'gastos_viajes_dop',
                 'otros_gastos_1_dop', 'otros_gastos_2_dop')
    def _compute_subtotal_gastos_rd(self):
        for rec in self:
            rec.subtotal_gastos_rd = (
                rec.arancel_dop + rec.selectivo_dop + rec.tasas_portuarias_dop +
                rec.agente_aduanal_dop + rec.transporte_local_dop + rec.almacenaje_dop +
                rec.inspeccion_dop + rec.gastos_viajes_dop + rec.otros_gastos_1_dop +
                rec.otros_gastos_2_dop
            )

    @api.depends('itbis_pagado_dua', 'itbis_recuperable')
    def _compute_itbis_control(self):
        for rec in self:
            if not rec.itbis_pagado_dua and not rec.itbis_recuperable:
                rec.itbis_no_recuperable = 0.0
                rec.itbis_status = 'PENDIENTE ITBIS'
            elif rec.itbis_recuperable > rec.itbis_pagado_dua:
                rec.itbis_no_recuperable = 0.0
                rec.itbis_status = 'REVISAR RECUPERABLE'
            else:
                rec.itbis_no_recuperable = max(0.0, rec.itbis_pagado_dua - rec.itbis_recuperable)
                rec.itbis_status = 'OK'

    @api.depends('subtotal_gastos_rd', 'itbis_no_recuperable', 'total_cif_usd', 'exchange_rate')
    def _compute_grand_totals(self):
        for rec in self:
            rate = rec.exchange_rate or 1.0
            rec.total_gastos_capitalizables_rd = rec.subtotal_gastos_rd + (rec.itbis_no_recuperable or 0.0)
            rec.total_cif_dop = rec.total_cif_usd * rate
            rec.total_costo_inventario_rd = rec.total_cif_dop + rec.total_gastos_capitalizables_rd

    # ---------------------------------------------------------
    # ACCIONES Y MOTOR MATEMÁTICO DE PRORRATEO
    # ---------------------------------------------------------
    def action_compute_proration(self):
        """
        Distribución y Prorrateo de Costos según la plantilla oficial PLASTIR SRL:
        1. Para cada línea, calcula su parte proporcional de descuento, comisión, flete y seguro
           dentro de su factura correspondiente:
           factor_linea = line.fob_total_usd / invoice.fob_usd
        2. Costo puesto USD = FOB - Descuento + Comisión + Flete + Seguro
        3. Gastos locales en RD$ proporcionales al Costo Puesto USD total:
           factor_rd = line.cif_usd / sum(lines.cif_usd)
           line.gastos_rd = total_gastos_capitalizables_rd * factor_rd
        4. Costo Total RD$ = (line.cif_usd * exchange_rate) + line.gastos_rd
        5. Costo Unitario RD$ = Costo Total RD$ / line.quantity
        """
        for rec in self:
            if not rec.line_ids:
                raise UserError(_("No hay líneas de mercancías para liquidar."))

            # 1. Prorrateo por Factura (Descuento, Comisión, Flete, Seguro)
            for inv in rec.invoice_ids:
                inv_lines = rec.line_ids.filtered(lambda l: l.invoice_id == inv)
                inv_fob = sum(inv_lines.mapped('fob_total_usd')) or inv.fob_usd or 1.0

                for line in inv_lines:
                    share = line.fob_total_usd / inv_fob if inv_fob else 0.0
                    line.discount_usd = inv.discount_usd * share
                    line.commission_usd = inv.commission_usd * share
                    line.freight_usd = inv.freight_usd * share
                    line.insurance_usd = inv.insurance_usd * share

            # Caso de líneas sin factura asignada: prorratear del total general
            orphan_lines = rec.line_ids.filtered(lambda l: not l.invoice_id)
            if orphan_lines:
                total_fob = sum(orphan_lines.mapped('fob_total_usd')) or 1.0
                for line in orphan_lines:
                    share = line.fob_total_usd / total_fob
                    line.discount_usd = rec.total_discount_usd * share
                    line.commission_usd = rec.total_commission_usd * share
                    line.freight_usd = rec.total_freight_usd * share
                    line.insurance_usd = rec.total_insurance_usd * share

            # Forzar recálculo de CIF USD
            rec.line_ids._compute_cif_usd()

            # 2. Prorrateo de Gastos Locales Capitalizables en RD$
            total_cif = sum(rec.line_ids.mapped('cif_usd')) or 1.0
            total_gastos_rd = rec.total_gastos_capitalizables_rd

            for line in rec.line_ids:
                share_rd = line.cif_usd / total_cif if total_cif else 0.0
                line.gastos_rd = total_gastos_rd * share_rd

            # Recalcular costos RD$ y unitarios
            rec.line_ids._compute_rd_costs()

            rec.state = 'liquidated'
            rec.message_post(
                body=_("""
                    <div style="font-family: inherit;">
                        <h4 style="color: #059669; margin: 0 0 8px 0;">✅ Prorrateo de Costos Landed Calculado</h4>
                        <ul style="margin: 0; padding-left: 20px;">
                            <li><strong>FOB Total:</strong> USD %s</li>
                            <li><strong>CIF Total:</strong> USD %s (RD$ %s)</li>
                            <li><strong>Gastos Aduanales / DGA:</strong> RD$ %s</li>
                            <li><strong>Costo Total Inventario:</strong> <span style="font-size: 1.1em; color: #059669; font-weight: bold;">RD$ %s</span></li>
                        </ul>
                    </div>
                """) % (
                    format(rec.total_fob_usd, ',.2f'),
                    format(rec.total_cif_usd, ',.2f'),
                    format(rec.total_cif_dop, ',.2f'),
                    format(rec.total_gastos_capitalizables_rd, ',.2f'),
                    format(rec.total_costo_inventario_rd, ',.2f')
                ),
                message_type='notification'
            )

            # Planificar Actividad para Validación DGA
            act_dga = self.env.ref('plastir_settlement_management.mail_act_settlement_dga', raise_if_not_found=False) \
                or self.env.ref('mail.mail_activity_data_todo', raise_if_not_found=False)
            if act_dga:
                rec.activity_schedule(
                    activity_type_id=act_dga.id,
                    summary=_('Validación DUA e Impuestos DGA'),
                    note=_('Verificar aranceles, gravamen e ITBIS DUA para cierre contable de tránsito.'),
                    date_deadline=fields.Date.context_today(rec),
                )

        return {
            'effect': {
                'fadeout': 'slow',
                'message': _('¡Prorrateo de importación calculado y validado exitosamente!'),
                'type': 'rainbow_man',
            }
        }

    def action_set_in_transit(self):
        """Pasa la liquidación a estado En Tránsito y planifica actividad de monitoreo"""
        self.write({'state': 'in_transit'})
        for rec in self:
            act_eta = self.env.ref('plastir_settlement_management.mail_act_settlement_eta', raise_if_not_found=False) \
                or self.env.ref('mail.mail_activity_data_todo', raise_if_not_found=False)
            if act_eta:
                rec.activity_schedule(
                    activity_type_id=act_eta.id,
                    summary=_('Monitoreo de Arribo / ETA'),
                    note=_('Seguimiento al arribo del contenedor/embarque %s (B/L: %s).') % (rec.operation_code, rec.shipping_ref or 'N/A'),
                    date_deadline=rec.eta_date or fields.Date.context_today(rec),
                )
            rec.message_post(
                body=_("🚢 <strong>Embarque marcado En Tránsito</strong>. B/L / Contenedor: %s. ETA programada: %s.") %
                     (rec.shipping_ref or 'N/A', rec.eta_date or _('No especificada')),
                message_type='notification'
            )

    def action_update_product_costs(self):
        """Actualiza el costo estándar (standard_price) en Odoo para cada producto liquidado"""
        self.ensure_one()
        if self.state not in ('liquidated', 'done'):
            raise UserError(_("Debe calcular el prorrateo de la liquidación antes de actualizar costos."))

        updated_count = 0
        for line in self.line_ids:
            if line.product_id and line.costo_unitario_rd > 0:
                line.product_id.standard_price = line.costo_unitario_rd
                updated_count += 1

        self.message_post(
            body=_("📦 <strong>Actualización de Catálogo Odoo:</strong> Se actualizó el costo estándar (standard_price) de %d productos con el nuevo costo landed.") % updated_count,
            message_type='notification'
        )

        return {
            'effect': {
                'fadeout': 'slow',
                'message': _('¡Se actualizaron %d costos de productos en el catálogo de Odoo!') % updated_count,
                'type': 'rainbow_man',
            }
        }

    def action_create_accounting_entry(self):
        """
        Genera el asiento contable de cierre de Mercancías en Tránsito:
        - Débito: Inventario / Existencias (Valor total landed en RD$)
        - Débito: ITBIS Crédito Fiscal DGA (ITBIS recuperable)
        - Crédito: Mercancías en Tránsito (Cierra la cuenta de tránsito por el valor total acumulado)
        """
        self.ensure_one()
        if self.account_move_id:
            raise UserError(_("Ya existe un asiento contable vinculado a esta liquidación (%s).") % self.account_move_id.name)

        if not self.transit_account_id or not self.stock_valuation_account_id:
            raise UserError(_("Debe configurar la Cuenta de Mercancías en Tránsito y la Cuenta de Inventario en la pestaña de Contabilidad."))

        journal = self.journal_id or self.env['account.journal'].search([
            ('type', 'in', ('general', 'purchase')),
            ('company_id', '=', self.company_id.id)
        ], limit=1)
        if not journal:
            raise UserError(_("No se encontró un diario contable adecuado para registrar la liquidación."))

        move_lines = []
        # Línea 1: Débito a Inventario por el costo real landed
        move_lines.append((0, 0, {
            'name': _("Costo Landed Importación: %s") % self.name,
            'account_id': self.stock_valuation_account_id.id,
            'debit': self.total_costo_inventario_rd,
            'credit': 0.0,
            'currency_id': self.company_currency_id.id,
        }))

        # Línea 2: Débito a ITBIS Crédito Fiscal si existe
        if self.itbis_recuperable > 0 and self.customs_itbis_account_id:
            move_lines.append((0, 0, {
                'name': _("ITBIS Crédito Fiscal DGA: %s") % self.name,
                'account_id': self.customs_itbis_account_id.id,
                'debit': self.itbis_recuperable,
                'credit': 0.0,
                'currency_id': self.company_currency_id.id,
            }))

        # Línea 3: Crédito a Mercancías en Tránsito cancelando el saldo
        total_credit = self.total_costo_inventario_rd + (self.itbis_recuperable if self.customs_itbis_account_id else 0.0)
        move_lines.append((0, 0, {
            'name': _("Liquidación Mercancías en Tránsito: %s") % self.name,
            'account_id': self.transit_account_id.id,
            'debit': 0.0,
            'credit': total_credit,
            'currency_id': self.company_currency_id.id,
        }))

        move_vals = {
            'ref': _("Liquidación de Mercancías: %s") % self.name,
            'date': self.date,
            'journal_id': journal.id,
            'company_id': self.company_id.id,
            'line_ids': move_lines,
        }

        move = self.env['account.move'].create(move_vals)
        move.action_post()

        self.write({
            'account_move_id': move.id,
            'state': 'done'
        })
        self.message_post(body=_("Asiento contable de cierre generado y publicado: %s") % move.name)

    def action_cancel(self):
        """Cancela la liquidación si no tiene asiento publicado"""
        for rec in self:
            if rec.account_move_id and rec.account_move_id.state == 'posted':
                raise UserError(_("No puede cancelar una liquidación con asiento contable publicado. Primero anule el asiento %s.") % rec.account_move_id.name)
            rec.state = 'cancel'

    def action_draft(self):
        self.write({'state': 'draft'})

    def action_open_import_wizard(self):
        """Abre el asistente de importación desde Excel"""
        self.ensure_one()
        return {
            'name': _('Cargar Liquidación desde Excel'),
            'type': 'ir.actions.act_window',
            'res_model': 'plastir.settlement.import.wizard',
            'view_mode': 'form',
            'target': 'new',
            'context': {
                'default_settlement_id': self.id,
                'default_operation_code': self.operation_code,
                'default_exchange_rate': self.exchange_rate,
            }
        }
