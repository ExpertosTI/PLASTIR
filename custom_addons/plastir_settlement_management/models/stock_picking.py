# -*- coding: utf-8 -*-
from odoo import models, fields, api, _

class StockPicking(models.Model):
    _inherit = 'stock.picking'

    settlement_ids = fields.Many2many(
        'plastir.settlement',
        'plastir_settlement_picking_rel',
        'picking_id', 'settlement_id',
        string='Liquidaciones de Mercancías'
    )
