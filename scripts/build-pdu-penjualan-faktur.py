#!/usr/bin/env python3
"""Extract the supplied sales invoice book as stored, without altering it."""
import datetime
import json
import re
import sys
from pathlib import Path
import openpyxl

source = Path(sys.argv[1])
book = openpyxl.load_workbook(source, read_only=True, data_only=True)
sheet = book['sort']
records = []
for line, cells in enumerate(sheet.iter_rows(), 1):
    row = [cell.value for cell in cells]
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
book.close()
Path('public/tools/pdu/faktur-penjualan-data.js').write_text('// Buku faktur penjualan sesuai sumber, tanpa mengubah workbook.\nconst salesInvoiceData = '+json.dumps(records, ensure_ascii=False, separators=(',', ':'))+';\n', encoding='utf-8')
print(f'{len(records)} baris; DPP {sum(r["dpp"] for r in records):,.0f}')
