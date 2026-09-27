# -*- coding: utf-8 -*-
from odoo import models, fields, api

class ResCompany(models.Model):
    _inherit = 'res.company'

    settlement_transit_account_id = fields.Many2one(
        'account.account',
        string='Cuenta por Defecto de Mercancías en Tránsito'
    )
    settlement_stock_account_id = fields.Many2one(
        'account.account',
        string='Cuenta por Defecto de Inventario'
    )
    settlement_itbis_account_id = fields.Many2one(
        'account.account',
        string='Cuenta por Defecto de ITBIS Crédito Fiscal DGA'
    )
    settlement_journal_id = fields.Many2one(
        'account.journal',
        string='Diario Contable de Liquidación'
    )

class ResConfigSettings(models.TransientModel):
    _inherit = 'res.config.settings'

    settlement_transit_account_id = fields.Many2one(
        'account.account',
        related='company_id.settlement_transit_account_id',
        readonly=False,
        string='Cuenta de Mercancías en Tránsito'
    )
    settlement_stock_account_id = fields.Many2one(
        'account.account',
        related='company_id.settlement_stock_account_id',
        readonly=False,
        string='Cuenta de Inventario / Existencias'
    )
    settlement_itbis_account_id = fields.Many2one(
        'account.account',
        related='company_id.settlement_itbis_account_id',
        readonly=False,
        string='Cuenta de ITBIS Crédito Fiscal DGA'
    )
    settlement_journal_id = fields.Many2one(
        'account.journal',
        related='company_id.settlement_journal_id',
        readonly=False,
        string='Diario de Liquidaciones'
    )
