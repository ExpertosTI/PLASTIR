# -*- coding: utf-8 -*-
from odoo import models, fields, api, _

class PlastirSettlementInvoice(models.Model):
    _name = 'plastir.settlement.invoice'
    _description = 'Factura de Proveedor para Liquidación de Importación'
    _order = 'name asc'

    settlement_id = fields.Many2one(
        'plastir.settlement',
        string='Liquidación',
        required=True,
        ondelete='cascade',
        index=True
    )
    name = fields.Char(string='No. Factura', required=True, index=True)
    date = fields.Date(string='Fecha', default=fields.Date.context_today)
    partner_id = fields.Many2one('res.partner', string='Destinatario / Proveedor')
    recipient = fields.Char(string='Destinatario / Entidad')
    
    fob_usd = fields.Float(string='FOB USD', digits='Product Price', required=True, default=0.0)
    discount_usd = fields.Float(string='Descuento USD', digits='Product Price', default=0.0)
    commission_usd = fields.Float(string='Comisión USD', digits='Product Price', default=0.0)
    freight_usd = fields.Float(string='Flete USD', digits='Product Price', default=0.0)
    insurance_usd = fields.Float(string='Seguro USD', digits='Product Price', default=0.0)
    cif_usd = fields.Float(
        string='CIF Factura USD',
        compute='_compute_total_usd',
        store=True,
        digits='Product Price'
    )
    cartons = fields.Integer(string='Cajas', default=0)

    total_usd = fields.Float(
        string='Total Factura USD',
        compute='_compute_total_usd',
        store=True,
        digits='Product Price'
    )

    detail_fob_sum = fields.Float(
        string='FOB Detalle Líneas USD',
        compute='_compute_detail_fob',
        digits='Product Price'
    )
    fob_diff = fields.Float(
        string='Diferencia FOB USD',
        compute='_compute_detail_fob',
        digits='Product Price'
    )

    line_ids = fields.One2many(
        'plastir.settlement.line',
        'invoice_id',
        string='Líneas de Mercancías'
    )

    @api.depends('fob_usd', 'discount_usd', 'commission_usd', 'freight_usd', 'insurance_usd')
    def _compute_total_usd(self):
        for rec in self:
            val = (rec.fob_usd - rec.discount_usd + rec.commission_usd + rec.freight_usd + rec.insurance_usd)
            rec.total_usd = val
            rec.cif_usd = val

    @api.depends('line_ids.fob_total_usd', 'fob_usd')
    def _compute_detail_fob(self):
        for rec in self:
            total_detail = sum(rec.line_ids.mapped('fob_total_usd'))
            rec.detail_fob_sum = total_detail
            rec.fob_diff = total_detail - rec.fob_usd
