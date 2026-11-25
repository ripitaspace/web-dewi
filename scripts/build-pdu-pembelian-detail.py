#!/usr/bin/env python3
"""Read monthly purchase item books and retain invoice source amounts."""
import datetime
import json
import re
import sys
from decimal import Decimal, ROUND_HALF_UP
from pathlib import Path
import openpyxl

root = Path(sys.argv[1])
records = []
blocks = []
for category, name in [('ppn', 'BUKU-BELI-PPN-2023-PDU.xlsx'), ('bebas', 'BUKU-BELI-BEBAS-2023-PDU.xlsx')]:
    book = openpyxl.load_workbook(root / name, read_only=True, data_only=True)
    for sheet in book.worksheets:
        if not re.fullmatch(r'\d{2}', sheet.title):
            continue
        current = None
        block = None
        for line, cells in enumerate(sheet.iter_rows(), 1):
            row = [cell.value for cell in cells]
            if len(row) < 11:
                continue
            header = isinstance(row[0], datetime.datetime) and row[1] is not None
            if header:
                raw = str(row[1])
                digits = re.sub(r'\D', '', raw)
                if isinstance(row[1], int) and len(digits) == 15 and '000' in cells[1].number_format:
                    digits = digits.zfill(16)
                invoice = f'{digits[:3]}.{digits[3:6]}-{digits[6:8]}.{digits[8:]}' if len(digits) == 16 else raw
                current = dict(group=category, file=name, sheet=sheet.title,
                               date=row[0].date().isoformat(), invoice=invoice, invoiceRaw=raw,
                               supplier=str(row[2] or ''))
                block = dict(items=[], dpp=row[8], ppn=row[9], total=row[10])
                blocks.append(block)
            if current is None or (not header and (row[4] is None or not isinstance(row[7], (int, float)))):
                continue
            record = dict(**current, row=line, item=str(row[4] or ''), quantity=row[5],
                          unitPrice=row[6], amount=row[7], dpp=row[7], ppn=None,
                          total=row[10] if header else None,
                          invoiceDpp=row[8] if header else None,
                          invoicePpn=row[9] if header else None)
            block['items'].append(record)
            records.append(record)
    book.close()

for block in blocks:
    items = block['items']
    tax = block['ppn']
    if not isinstance(tax, (int, float)) or any(not isinstance(r['dpp'], (int, float)) for r in items):
        if items:
            items[0]['ppn'] = tax
        continue
    tax = Decimal(str(tax))
    basis = sum((Decimal(str(r['dpp'])) for r in items), Decimal(0))
    cumulative = allocated = Decimal(0)
    for i, record in enumerate(items):
        cumulative += Decimal(str(record['dpp']))
        target = tax if i == len(items)-1 else (tax*cumulative/basis).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP) if basis else Decimal(0)
        record['ppn'] = float(target-allocated)
        allocated = target
    assert abs(sum(r['ppn'] for r in items)-float(tax)) < .001

for record in records:
    record['invoiceTotal'] = record['total']
    record['total'] = float((Decimal(str(record['dpp'])) + Decimal(str(record['ppn']))).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)) if all(isinstance(record[k], (int, float)) for k in ('dpp', 'ppn')) else None
Path('public/tools/pdu/pembelian-data.js').write_text('// Rincian buku pembelian; PPN dialokasikan sesuai DPP detail.\nconst purchaseData = '+json.dumps(records, ensure_ascii=False, separators=(',', ':'), default=str)+';\n')
print(json.dumps(dict(rows=len(records), invoiceBlocks=len(blocks), items=sum(bool(r['item']) for r in records),
                     dpp=sum(r['dpp'] or 0 for r in records), sourceDpp=sum(b['dpp'] or 0 for b in blocks),
                     ppn=sum(r['ppn'] or 0 for r in records)), indent=2))
