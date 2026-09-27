# -*- coding: utf-8 -*-
from odoo import models, fields, api, _
from odoo.exceptions import UserError
import base64
import io
import logging

_logger = logging.getLogger(__name__)

try:
    import openpyxl
except ImportError:
    openpyxl = None

class PlastirSettlementImportWizard(models.TransientModel):
    _name = 'plastir.settlement.import.wizard'
    _description = 'Asistente de Importación de Liquidación desde Excel'

    settlement_id = fields.Many2one(
        'plastir.settlement',
        string='Liquidación Destino',
        required=True
    )
    excel_file = fields.Binary(
        string='Archivo Excel (.xlsx)',
        required=True,
        help='Seleccione la plantilla oficial de liquidación o el modelo de liquidación PLASTIR'
    )
    file_name = fields.Char(string='Nombre de Archivo')

    auto_create_products = fields.Boolean(
        string='Crear Productos Inexistentes en Odoo',
        default=True,
        help='Si el SKU o nombre no existe en el catálogo de Odoo, se creará automáticamente como producto almacenable'
    )
    auto_compute_proration = fields.Boolean(
        string='Calcular Prorrateo Automáticamente tras Cargar',
        default=True,
        help='Calcula de inmediato el prorrateo de flete, seguro, gastos RD$ y costos unitarios'
    )

    def action_import(self):
        self.ensure_one()
        if not openpyxl:
            raise UserError(_("La librería openpyxl no está instalada en el entorno de Python de Odoo."))

        if not self.excel_file:
            raise UserError(_("Por favor seleccione un archivo Excel válido."))

        try:
            file_data = base64.b64decode(self.excel_file)
            workbook = openpyxl.load_workbook(io.BytesIO(file_data), data_only=True)
        except Exception as e:
            raise UserError(_("Error al leer el archivo Excel: %s") % str(e))

        sheetnames = workbook.sheetnames

        # Detectar el formato del archivo:
        # Formato 1: Plantilla Multi-Pestaña con 'Facturas y gastos' y 'Mercancias'
        if 'Facturas y gastos' in sheetnames or 'Mercancias' in sheetnames:
            return self._import_multi_sheet_template(workbook)
        # Formato 2: Modelo simple de liquidación (Sheet1 con columnas CIF, Gravamen, ISC, ITBIS...)
        else:
            return self._import_single_sheet_model(workbook[sheetnames[0]])

    def _import_multi_sheet_template(self, workbook):
        settlement = self.settlement_id
        Product = self.env['product.product']
        Invoice = self.env['plastir.settlement.invoice']
        Line = self.env['plastir.settlement.line']

        # 1. Leer hoja 'Facturas y gastos' si existe
        if 'Facturas y gastos' in workbook.sheetnames:
            fg_sheet = workbook['Facturas y gastos']

            # Tasa de cambio (B5) y Operación (B4)
            op_code = fg_sheet['B4'].value
            if op_code and not settlement.operation_code:
                settlement.operation_code = str(op_code).strip()

            rate = fg_sheet['B5'].value
            if rate and isinstance(rate, (int, float)) and rate > 0:
                settlement.exchange_rate = float(rate)

            # Leer tabla de facturas de proveedores (filas 10 en adelante hasta fila vacía o 'Total')
            invoices_created = {}
            for r in range(10, 20):
                inv_name = fg_sheet[f'A{r}'].value
                if not inv_name or str(inv_name).strip().lower().startswith('total'):
                    break
                inv_name = str(inv_name).strip()

                inv_vals = {
                    'settlement_id': settlement.id,
                    'name': inv_name,
                    'fob_usd': float(fg_sheet[f'D{r}'].value or 0.0),
                    'discount_usd': float(fg_sheet[f'G{r}'].value or 0.0),
                    'commission_usd': float(fg_sheet[f'H{r}'].value or 0.0),
                    'freight_usd': float(fg_sheet[f'I{r}'].value or 0.0),
                    'insurance_usd': float(fg_sheet[f'J{r}'].value or 0.0),
                    'cartons': int(fg_sheet[f'N{r}'].value or 0) if fg_sheet[f'N{r}'].value else 0,
                }
                # Buscar si ya existe la factura en la liquidación o crear
                existing_inv = Invoice.search([('settlement_id', '=', settlement.id), ('name', '=', inv_name)], limit=1)
                if existing_inv:
                    existing_inv.write(inv_vals)
                    invoices_created[inv_name] = existing_inv
                else:
                    new_inv = Invoice.create(inv_vals)
                    invoices_created[inv_name] = new_inv

            # Leer gastos locales en RD$ (filas 24 a 32)
            for r in range(24, 34):
                concept = str(fg_sheet[f'A{r}'].value or '').strip().lower()
                val = float(fg_sheet[f'B{r}'].value or 0.0)
                if not concept or val <= 0:
                    continue
                if 'arancel' in concept or 'gravamen' in concept:
                    settlement.arancel_dop = val
                elif 'selectivo' in concept:
                    settlement.selectivo_dop = val
                elif 'portuario' in concept:
                    settlement.tasas_portuarias_dop = val
                elif 'agente' in concept or 'aduanal' in concept:
                    settlement.agente_aduanal_dop = val
                elif 'transporte' in concept:
                    settlement.transporte_local_dop = val
                elif 'almacen' in concept:
                    settlement.almacenaje_dop = val
                elif 'inspeccion' in concept:
                    settlement.inspeccion_dop = val
                elif 'otros' in concept:
                    if not settlement.otros_gastos_1_dop:
                        settlement.otros_gastos_1_dop = val
                    else:
                        settlement.otros_gastos_2_dop = val

            # Leer ITBIS DUA (B39) e ITBIS recuperable (B40)
            itbis_dua = fg_sheet['B39'].value
            itbis_rec = fg_sheet['B40'].value
            if itbis_dua is not None and isinstance(itbis_dua, (int, float)):
                settlement.itbis_pagado_dua = float(itbis_dua)
            if itbis_rec is not None and isinstance(itbis_rec, (int, float)):
                settlement.itbis_recuperable = float(itbis_rec)

        # 2. Leer hoja 'Mercancias'
        if 'Mercancias' in workbook.sheetnames:
            m_sheet = workbook['Mercancias']
            # Limpiar líneas previas para evitar duplicados si se reimporta
            settlement.line_ids.unlink()

            lines_to_create = []
            for r in range(8, m_sheet.max_row + 1):
                inv_code = m_sheet[f'A{r}'].value
                sku = m_sheet[f'C{r}'].value
                desc = m_sheet[f'D{r}'].value
                uom_name = m_sheet[f'E{r}'].value
                units = m_sheet[f'F{r}'].value
                cartons = m_sheet[f'G{r}'].value
                fob_unit = m_sheet[f'H{r}'].value

                if not sku and not desc:
                    continue
                if not units or float(units or 0.0) <= 0:
                    continue

                sku_clean = str(sku).strip() if sku else ''
                desc_clean = str(desc).strip() if desc else (sku_clean or 'Mercancía Importada')

                # Buscar o crear producto en Odoo
                product = False
                if sku_clean:
                    product = Product.search([('default_code', '=', sku_clean)], limit=1)
                if not product and desc_clean:
                    product = Product.search([('name', '=', desc_clean)], limit=1)

                if not product and self.auto_create_products:
                    # Crear producto almacenable
                    prod_vals = {
                        'name': desc_clean,
                        'default_code': sku_clean,
                        'sale_ok': True,
                        'purchase_ok': True,
                    }
                    if hasattr(Product, 'is_storable'):
                        prod_vals['is_storable'] = True
                    elif hasattr(Product, 'detailed_type'):
                        prod_vals['detailed_type'] = 'product'
                    product = Product.create(prod_vals)

                # Buscar factura padre
                inv_obj = False
                if inv_code:
                    inv_obj = Invoice.search([
                        ('settlement_id', '=', settlement.id),
                        ('name', '=', str(inv_code).strip())
                    ], limit=1)

                lines_to_create.append({
                    'settlement_id': settlement.id,
                    'invoice_id': inv_obj.id if inv_obj else False,
                    'product_id': product.id if product else False,
                    'sku': sku_clean,
                    'name': desc_clean,
                    'quantity': float(units or 0.0),
                    'cartons': int(cartons or 0) if cartons else 0,
                    'fob_unit_usd': float(fob_unit or 0.0),
                })

            if lines_to_create:
                Line.create(lines_to_create)

        if self.auto_compute_proration:
            settlement.action_compute_proration()

        return {
            'type': 'ir.actions.client',
            'tag': 'display_notification',
            'params': {
                'title': _('Importación Exitosa'),
                'message': _('Se importaron los datos y se procesó el prorrateo de la liquidación %s.') % settlement.name,
                'type': 'success',
                'sticky': False,
                'next': {'type': 'ir.actions.act_window_close'}
            }
        }

    def _import_single_sheet_model(self, sheet):
        """Importa desde el modelo simplificado de liquidación (Sheet1)"""
        settlement = self.settlement_id
        Product = self.env['product.product']
        Line = self.env['plastir.settlement.line']

        settlement.line_ids.unlink()

        # Encontrar fila de encabezados
        header_row = 8
        lines_to_create = []

        total_seguro = 0.0
        total_flete = 0.0
        total_gravamen = 0.0
        total_isc = 0.0
        total_itbis = 0.0
        total_aduanal = 0.0
        total_transporte = 0.0
        total_viaje = 0.0

        for r in range(header_row + 1, sheet.max_row + 1):
            desc = sheet[f'A{r}'].value
            if not desc or str(desc).strip().lower().startswith('total'):
                break

            qty = float(sheet[f'B{r}'].value or 0.0)
            cost_unit = float(sheet[f'C{r}'].value or 0.0)
            seguro = float(sheet[f'E{r}'].value or 0.0)
            flete = float(sheet[f'F{r}'].value or 0.0)
            gravamen = float(sheet[f'I{r}'].value or 0.0)
            isc = float(sheet[f'J{r}'].value or 0.0)
            itbis = float(sheet[f'K{r}'].value or 0.0)
            aduanal = float(sheet[f'L{r}'].value or 0.0)
            transporte = float(sheet[f'M{r}'].value or 0.0)
            viaje = float(sheet[f'N{r}'].value or 0.0)

            total_seguro += seguro
            total_flete += flete
            total_gravamen += gravamen
            total_isc += isc
            total_itbis += itbis
            total_aduanal += aduanal
            total_transporte += transporte
            total_viaje += viaje

            desc_clean = str(desc).strip()
            product = Product.search([('name', '=', desc_clean)], limit=1)
            if not product and self.auto_create_products:
                prod_vals = {
                    'name': desc_clean,
                    'sale_ok': True,
                    'purchase_ok': True,
                }
                if hasattr(Product, 'is_storable'):
                    prod_vals['is_storable'] = True
                elif hasattr(Product, 'detailed_type'):
                    prod_vals['detailed_type'] = 'product'
                product = Product.create(prod_vals)

            lines_to_create.append({
                'settlement_id': settlement.id,
                'product_id': product.id if product else False,
                'name': desc_clean,
                'quantity': qty,
                'fob_unit_usd': cost_unit,
                'insurance_usd': seguro,
                'freight_usd': flete,
            })

        if lines_to_create:
            Line.create(lines_to_create)

        # Actualizar gastos globales de la liquidación
        settlement.write({
            'arancel_dop': total_gravamen,
            'selectivo_dop': total_isc,
            'agente_aduanal_dop': total_aduanal,
            'transporte_local_dop': total_transporte,
            'gastos_viajes_dop': total_viaje,
            'itbis_pagado_dua': total_itbis,
            'itbis_recuperable': total_itbis, # Asumido crédito fiscal salvo que se ajuste
        })

        if self.auto_compute_proration:
            settlement.action_compute_proration()

        return {
            'type': 'ir.actions.client',
            'tag': 'display_notification',
            'params': {
                'title': _('Importación Exitosa'),
                'message': _('Se importaron las mercancías y gastos del modelo de liquidación.'),
                'type': 'success',
                'sticky': False,
                'next': {'type': 'ir.actions.act_window_close'}
            }
        }
