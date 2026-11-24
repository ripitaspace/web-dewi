#!/usr/bin/env python3
"""Read the cached values of the supplied Ratna recap without modifying it."""
import json
import sys
from pathlib import Path
import openpyxl

source = Path(sys.argv[1])
workbook = openpyxl.load_workbook(source, data_only=True, read_only=True)
sheet = workbook['REKAP PAJAK-RATNA']
columns = {'sederhana': 'B', 'pk': 'C', 'dibebaskan': 'E', 'ppnDibebaskan': 'F',
           'telur': 'H', 'penghargaan': 'I', 'kemitraan': 'K', 'ppnKemitraan': 'L', 'belumDaging': 'N',
           'belumPakan': 'O', 'totalPenjualan': 'Q', 'beliB2': 'T', 'pmB2': 'U',
           'beliB3': 'W', 'ppnB3': 'X', 'totalPembelian': 'Z', 'pkMinusPm': 'AC', 'ssp': 'AD'}
rows = []
for month, row in enumerate(sheet.iter_rows(min_row=8, max_row=19), 1):
    cells = {cell.column_letter: cell.value for cell in row if cell.value is not None}
    rows.append({'month': month, 'row': month+7, **{key: cells.get(col) for key, col in columns.items()}})
totals = {key: sheet[f'{col}20'].value for key, col in columns.items()}
reconciliation = {'priorCompensation': sheet['AD22'].value, 'januaryCompensation': sheet['AH8'].value, 'decemberCompensation': sheet['AE19'].value}
payload = {'source': source.name, 'sheet': sheet.title, 'columns': columns, 'rows': rows, 'annual': totals, 'reconciliation': reconciliation}
workbook.close()
Path('public/tools/pdu/rekap-ratna-data.js').write_text('// Nilai tersimpan rekap Ratna; sumber tidak diubah.\nconst ratnaData = '+json.dumps(payload, ensure_ascii=False, separators=(',', ':'))+';\n', encoding='utf-8')
print(f'{len(rows)} masa; penjualan {totals["totalPenjualan"]:,.2f}; pembelian {totals["totalPembelian"]:,.0f}')
