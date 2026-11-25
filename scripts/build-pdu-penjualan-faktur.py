#!/usr/bin/env python3
"""Extract the supplied sales invoice book as stored, without altering it."""
import datetime
import json
import re
import sys
from decimal import Decimal, ROUND_HALF_UP
from pathlib import Path
import openpyxl

source = Path(sys.argv[1])
book = openpyxl.load_workbook(source, read_only=True, data_only=True)
records = []
for sheet in book.worksheets:
    current = None
    for line, cells in enumerate(sheet.iter_rows(), 1):
        row = [cell.value for cell in cells]
        if sheet.title == 'sort':
            if len(row) < 8 or not isinstance(row[0], datetime.datetime) or not isinstance(row[5], (int, float)):
                continue
            raw = str(row[1]) if row[1] is not None else ''
            digits = re.sub(r'\D', '', raw)
            if isinstance(row[1], int) and len(digits) == 15 and cells[1].number_format == '000"."000"-"00"."00000000':
                digits = digits.zfill(16)
            invoice = f'{digits[:3]}.{digits[3:6]}-{digits[6:8]}.{digits[8:]}' if len(digits) == 16 and re.fullmatch(r'[\d.\- ]+', raw) else raw
            records.append(dict(group='jual_bebas', file=source.name, sheet=sheet.title, row=line,
                                date=row[0].date().isoformat(), invoice=invoice, invoiceRaw=raw,
                                supplier=str(row[2]) if row[2] is not None else '',
                                item=str(row[4]) if row[4] is not None else '', dpp=row[5], ppn=row[6], total=row[7]))
            continue

        is_invoice = len(row) >= 11 and isinstance(row[0], datetime.datetime) and row[1] is not None
        if is_invoice:
            raw = str(row[1])
            current = dict(date=row[0].date().isoformat(), invoice=raw, invoiceRaw=raw,
                           supplier=str(row[2]) if row[2] is not None else '')
        if not current or len(row) < 11 or row[4] is None or not isinstance(row[5], (int, float)):
            continue
        records.append(dict(group='jual_bebas', file=source.name, sheet=sheet.title, row=line,
                            **current, item=str(row[4]), quantity=row[5], unitPrice=row[6], amount=row[7],
                            dpp=row[7], invoiceDpp=row[8] if is_invoice else None,
                            ppn=row[9] if is_invoice else None, invoicePpn=row[9] if is_invoice else None,
                            total=row[10] if is_invoice else None))
book.close()
# Allocate the source invoice tax across its item rows, preserving its total.
groups = {}
for record in records:
    if 'invoicePpn' in record:
        groups.setdefault((record['sheet'], record['invoice']), []).append(record)
for items in groups.values():
    taxes = [r['invoicePpn'] for r in items if isinstance(r['invoicePpn'], (int, float))]
    if not taxes or any(not isinstance(r['dpp'], (int, float)) for r in items):
        continue
    tax = sum((Decimal(str(v)) for v in taxes), Decimal(0))
    basis = sum((Decimal(str(r['dpp'])) for r in items), Decimal(0))
    if basis == 0:
        if tax == 0:
            for record in items:
                record['ppn'] = 0
        continue
    cumulative = Decimal(0)
    allocated = Decimal(0)
    for index, record in enumerate(items):
        cumulative += Decimal(str(record['dpp']))
        target = tax if index == len(items) - 1 else (tax * cumulative / basis).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        record['ppn'] = float(target - allocated)
        allocated = target
for record in records:
    record['invoiceTotal'] = record['total']
    record['total'] = float((Decimal(str(record['dpp'])) + Decimal(str(record['ppn']))).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)) if all(isinstance(record[k], (int, float)) for k in ('dpp', 'ppn')) else None
Path('public/tools/pdu/faktur-penjualan-data.js').write_text('// Buku faktur penjualan sesuai sumber, tanpa mengubah workbook.\nconst salesInvoiceData = '+json.dumps(records, ensure_ascii=False, separators=(',', ':'))+';\n', encoding='utf-8')
print(f'{len(records)} baris; DPP {sum(r["dpp"] or 0 for r in records):,.0f}')
