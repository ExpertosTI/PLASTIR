# -*- coding: utf-8 -*-
from odoo import models, fields, api, _

class PlastirSettlementLine(models.Model):
    _name = 'plastir.settlement.line'
    _description = 'Línea de Liquidación de Mercancías'
    _order = 'invoice_id asc, id asc'

    settlement_id = fields.Many2one(
        'plastir.settlement',
        string='Liquidación',
        required=True,
        ondelete='cascade',
        index=True
    )
    invoice_id = fields.Many2one(
        'plastir.settlement.invoice',
        string='Factura Proveedor',
        ondelete='set null',
        index=True
    )
    invoice_name = fields.Char(related='invoice_id.name', string='No. Factura', store=True)

    product_id = fields.Many2one(
        'product.product',
        string='Producto',
        index=True
    )
    sku = fields.Char(string='Código SKU', index=True)
    name = fields.Char(string='Descripción', required=True)
    uom_id = fields.Many2one('uom.uom', string='Unidad')
    
    quantity = fields.Float(string='Unidades', default=1.0, required=True)
    cartons = fields.Integer(string='Cajas', default=0)

    fob_unit_usd = fields.Float(string='Precio FOB USD', digits='Product Price', default=0.0)
    fob_total_usd = fields.Float(
        string='FOB Total USD',
        compute='_compute_fob_total_usd',
        store=True,
        digits='Product Price'
    )

    # Prorrateos en USD
    discount_usd = fields.Float(string='Descuento USD', digits='Product Price', default=0.0)
    commission_usd = fields.Float(string='Comisión USD', digits='Product Price', default=0.0)
    freight_usd = fields.Float(string='Flete USD', digits='Product Price', default=0.0)
    insurance_usd = fields.Float(string='Seguro USD', digits='Product Price', default=0.0)

    cif_usd = fields.Float(
        string='Costo Puesto USD',
        compute='_compute_cif_usd',
        store=True,
        digits='Product Price'
    )

    # Prorrateos en RD$
    cif_dop = fields.Float(
        string='CIF RD$',
        compute='_compute_rd_costs',
        store=True,
        digits='Product Price'
    )
    gastos_rd = fields.Float(
        string='Gastos Locales RD$',
        digits='Product Price',
        default=0.0
    )
    costo_total_rd = fields.Float(
        string='Costo Total RD$',
        compute='_compute_rd_costs',
        store=True,
        digits='Product Price'
    )
    costo_unitario_rd = fields.Float(
        string='Costo Unitario RD$',
        compute='_compute_rd_costs',
        store=True,
        digits='Product Price'
    )

    current_standard_price = fields.Float(
        string='Costo Actual Odoo (RD$)',
        related='product_id.standard_price',
        digits='Product Price'
    )
    cost_variance = fields.Float(
        string='Variación Costo RD$',
        compute='_compute_cost_variance',
        digits='Product Price'
    )

    @api.depends('quantity', 'fob_unit_usd')
    def _compute_fob_total_usd(self):
        for rec in self:
            rec.fob_total_usd = rec.quantity * rec.fob_unit_usd

    @api.depends('fob_total_usd', 'discount_usd', 'commission_usd', 'freight_usd', 'insurance_usd')
    def _compute_cif_usd(self):
        for rec in self:
            rec.cif_usd = (rec.fob_total_usd - rec.discount_usd + rec.commission_usd + rec.freight_usd + rec.insurance_usd)

    @api.depends('cif_usd', 'gastos_rd', 'quantity', 'settlement_id.exchange_rate')
    def _compute_rd_costs(self):
        for rec in self:
            rate = rec.settlement_id.exchange_rate or 1.0
            rec.cif_dop = rec.cif_usd * rate
            rec.costo_total_rd = rec.cif_dop + rec.gastos_rd
            rec.costo_unitario_rd = (rec.costo_total_rd / rec.quantity) if rec.quantity else 0.0

    @api.depends('costo_unitario_rd', 'product_id.standard_price')
    def _compute_cost_variance(self):
        for rec in self:
            rec.cost_variance = rec.costo_unitario_rd - (rec.product_id.standard_price or 0.0)

    @api.onchange('product_id')
    def _onchange_product_id(self):
        if self.product_id:
            self.sku = self.product_id.default_code
            self.name = self.product_id.name
            self.uom_id = self.product_id.uom_id
