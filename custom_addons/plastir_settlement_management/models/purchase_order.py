# -*- coding: utf-8 -*-
from odoo import models, fields, api, _

class PurchaseOrder(models.Model):
    _inherit = 'purchase.order'

    is_international_purchase = fields.Boolean(
        string='Es Compra Internacional',
        compute='_compute_is_international_purchase',
        store=True,
        help='Indica si la compra está en moneda extranjera o requiere liquidación aduanal'
    )
    settlement_ids = fields.Many2many(
        'plastir.settlement',
        'plastir_settlement_po_rel',
        'order_id', 'settlement_id',
        string='Liquidaciones de Mercancías'
    )
    settlement_count = fields.Integer(
        string='No. Liquidaciones',
        compute='_compute_settlement_count'
    )

    @api.depends('currency_id', 'company_id')
    def _compute_is_international_purchase(self):
        for rec in self:
            comp_curr = rec.company_id.currency_id
            rec.is_international_purchase = bool(rec.currency_id and rec.currency_id != comp_curr)

    @api.depends('settlement_ids')
    def _compute_settlement_count(self):
        for rec in self:
            rec.settlement_count = len(rec.settlement_ids)

    def action_view_settlements(self):
        self.ensure_one()
        action = self.env.ref('plastir_settlement_management.action_plastir_settlement').read()[0]
        if len(self.settlement_ids) == 1:
            action['views'] = [(self.env.ref('plastir_settlement_management.view_plastir_settlement_form').id, 'form')]
            action['res_id'] = self.settlement_ids.id
        else:
            action['domain'] = [('id', 'in', self.settlement_ids.ids)]
        return action

    def action_create_settlement(self):
        """Crea un expediente de liquidación a partir de esta orden de compra"""
        self.ensure_one()
        settlement_vals = {
            'operation_code': self.name,
            'partner_id': self.partner_id.id,
            'currency_id': self.currency_id.id,
            'company_id': self.company_id.id,
            'purchase_order_ids': [(4, self.id)],
        }
        settlement = self.env['plastir.settlement'].create(settlement_vals)
        self.settlement_ids = [(4, settlement.id)]

        # Crear líneas de mercancías a partir de las líneas de la orden
        lines_vals = []
        for line in self.order_line.filtered(lambda l: not l.display_type):
            lines_vals.append((0, 0, {
                'settlement_id': settlement.id,
                'product_id': line.product_id.id,
                'sku': line.product_id.default_code,
                'name': line.name,
                'uom_id': line.product_uom.id,
                'quantity': line.product_qty,
                'fob_unit_usd': line.price_unit,
            }))
        settlement.write({'line_ids': lines_vals})

        return {
            'name': _('Liquidación de Importación'),
            'type': 'ir.actions.act_window',
            'res_model': 'plastir.settlement',
            'view_mode': 'form',
            'res_id': settlement.id,
        }
