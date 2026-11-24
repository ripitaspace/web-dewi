#!/usr/bin/env python3
"""Extract invoice-level purchase book rows from the supplied workbooks, read-only."""
import datetime
import json
import re
import sys
from pathlib import Path
import openpyxl

root = Path(sys.argv[1])
files = [('ppn', 'BELI-PPN-2023-PDU (FIX)-dpm.xlsx'), ('bebas', 'BELI-BEBAS-2023-PDU FIX-dpm.xlsx')]
records = []
for category, name in files:
    book = openpyxl.load_workbook(root / name, read_only=True, data_only=True)
    sheet = book['sort beli']
    for line, cells in enumerate(sheet.iter_rows(), 1):
        row = [cell.value for cell in cells]
        if len(row) < 8 or not isinstance(row[1], datetime.datetime) or not isinstance(row[5], (int, float)):
            continue
        raw = str(row[2]) if row[2] is not None else ''
        digits = re.sub(r'\D', '', raw)
        # A numeric 15-digit identifier gets its leading zero only when the
        # workbook explicitly applies its 16-digit invoice number format.
        if isinstance(row[2], int) and len(digits) == 15 and cells[2].number_format == '000"."000"-"00"."00000000':
            digits = digits.zfill(16)
        invoice = f'{digits[:3]}.{digits[3:6]}-{digits[6:8]}.{digits[8:]}' if len(digits) == 16 and re.fullmatch(r'[\d.\- ]+', raw) else raw
        records.append(dict(group=category, file=name, sheet=sheet.title, row=line,
                            date=row[1].date().isoformat(), invoice=invoice, invoiceRaw=raw,
                            supplier=str(row[3]) if row[3] is not None else '',
                            dpp=row[5], ppn=row[6], total=row[7]))
    book.close()
Path('public/tools/pdu/pembelian-data.js').write_text('// Data buku pembelian, diekstrak tanpa mengubah sumber.\nconst purchaseData = '+json.dumps(records, ensure_ascii=False, separators=(',', ':'))+';\n', encoding='utf-8')
print(f'{len(records)} baris; DPP {sum(r["dpp"] for r in records):,.0f}')
