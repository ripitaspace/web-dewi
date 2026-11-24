#!/usr/bin/env python3
"""Extract the user-provided, tab-separated sales book without altering it."""
import json
import re
import sys
from pathlib import Path

source = Path(sys.argv[1])
months = ['JANUARI', 'FEBRUARI', 'MARET', 'APRIL', 'MEI', 'JUNI', 'JULI', 'AGUSTUS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DESEMBER']
number = lambda text: float(text.replace('Rp', '').replace(',', '').strip()) if text.replace('Rp', '').replace(',', '').strip() else None
rows, monthly, pending = [], [], []
grand = None
for line_number, line in enumerate(source.read_text(encoding='utf-8').splitlines(), 1):
    cells = line.split('\t')
    if len(cells) < 9:
        continue
    cells = [c.strip() for c in cells]
    if cells[0].isdigit() and cells[3] == 'BAKUL':
        pending.append(dict(row=line_number, mitra=cells[1], tanggal=cells[2], keterangan=cells[3], kg=number(cells[4]), harga=number(cells[5]), jumlah=number(cells[6]), real=number(cells[7])))
    elif cells[2].startswith('TOTAL'):
        name = re.sub(r'^TOTAL\s+', '', cells[2])
        if name not in months:
            raise ValueError(f'Bulan tidak dikenal: {name}')
        month = months.index(name) + 1
        for row in pending:
            row['blockMonth'] = month
        rows.extend(pending)
        pending = []
        monthly.append(dict(month=month, jumlah=number(cells[6]), real=number(cells[7]), row=line_number))
    elif cells[8] and not any(cells[:8]):
        grand = number(cells[8])
if len(monthly) != 12 or pending or grand is None:
    raise ValueError('Struktur sumber tidak lengkap')
payload = dict(source='Buku Penjualan Kemitraan 2023 · data ditempel pengguna', rows=rows, months=monthly, total=grand)
Path('public/tools/pdu/penjualan-kemitraan.js').write_text('// Data buku penjualan kemitraan yang ditempel pengguna.\nconst partnershipSales = ' + json.dumps(payload, ensure_ascii=False, separators=(',', ':')) + ';\n', encoding='utf-8')
print(f'{len(rows)} baris, {len(monthly)} bulan, total {grand:,.0f}; total bulanan {sum(m["real"] for m in monthly):,.0f}')
