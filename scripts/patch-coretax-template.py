import re, sys, html as H
SRC = '/Users/ricoaw/Downloads/SPT_OP_Coretax_F4_Lengkap_17_Halaman.html'
OUT = '/Users/ricoaw/Documents/ChatGPT/PuspiWebsite/web-dewi/scripts/coretax-template.html'
s = open(SRC).read()
i = s.index('</style>')
head, body = s[:i], s[i:]
old = re.split(r'(?=<section class="sheet")', body)[1:]
old = [re.sub(r'</body>.*$', '', x, flags=re.S) for x in old]
old[-1] = re.sub(r'</section>.*$', '</section>', old[-1], flags=re.S)
O = lambda n: old[n - 1]

EMPTY = '<td class="empty"></td>'

def tables(sec):
    return list(re.finditer(r'<table class="[^"]*">.*?</table>', sec, re.S))

def replace_table(sec, idx, fn):
    t = tables(sec)[idx]
    return sec[:t.start()] + fn(t.group(0)) + sec[t.end():]

def data_rows(tbl):
    """(start,end) of the contiguous block of fully-empty data rows in tbody."""
    tb = tbl.index('<tbody>') + 7
    rows = [(m.start() + tb, m.end() + tb, m.group(0)) for m in re.finditer(r'<tr[^>]*>.*?</tr>', tbl[tb:], re.S)]
    block = [r for r in rows if re.sub(r'<td class="empty"></td>', '', r[2]).replace('<tr>', '').replace('</tr>', '') == '']
    return block

def set_rows(tbl, n, style=None, edit=None):
    block = data_rows(tbl)
    first = block[0][2]
    if style:
        first = first.replace('<tr>', '<tr style="%s">' % style, 1)
    if edit:
        first = edit(first)
    return tbl[:block[0][0]] + first * n + tbl[block[-1][1]:]

def sub(col, labels):
    """Mark column `col` of every data row with pre-printed sub labels."""
    def edit(row):
        cells = re.findall(r'<td[^>]*></td>', row)
        k = 0
        out = row
        parts = re.split(r'(<td class="empty"></td>)', row)
        res = []
        for p in parts:
            if p == EMPTY:
                if k == col:
                    p = '<td class="empty" data-sub="%s"></td>' % labels
                k += 1
            res.append(p)
        return ''.join(res)
    return edit

def renumber(sec, n, label=None):
    sec = re.sub(r'data-sheet="\d+"', 'data-sheet="%d"' % n, sec, 1)
    if label:
        sec = re.sub(r'aria-label="[^"]*"', 'aria-label="%s"' % label, sec, 1)
    return sec

def landscape(sec):
    return sec.replace('<section class="sheet"', '<section class="sheet landscape"', 1)

def tag(sec, tags):
    """Give successive JUMLAH sum cells an arrow tag label."""
    it = iter(tags)
    def r(m):
        try: return m.group(0).replace('class="sumtag"', 'class="sumtag" data-tag="%s"' % next(it), 1)
        except StopIteration: return m.group(0)
    return re.sub(r'<td class="sumtag"></td>', r, sec)

# ---------------------------------------------------------------- petunjuk (halaman 1-2)
def li(x): return '<li>%s</li>' % x
text1 = '''<section class="sheet text" data-sheet="1" aria-label="Petunjuk dan persyaratan"><h1>FORMULIR SURAT PEMBERITAHUAN TAHUNAN PAJAK PENGHASILAN<br>WAJIB PAJAK ORANG PRIBADI</h1><div class="criteria"><p>WAJIB PAJAK YANG DAPAT MENYAMPAIKAN SURAT PEMBERITAHUAN TAHUNAN PAJAK PENGHASILAN DALAM BENTUK KERTAS HARUS MEMENUHI KRITERIA SEBAGAI BERIKUT:</p><ol>%s</ol></div><h2>PETUNJUK UMUM</h2><p>Berdasarkan ketentuan Undang-Undang Nomor 6 Tahun 1983 tentang Ketentuan Umum dan Tata Cara Perpajakan beserta perubahannya (Undang-Undang KUP) dan Undang-Undang Nomor 7 Tahun 1983 tentang Pajak Penghasilan beserta perubahannya (Undang-Undang PPh), hal-hal yang perlu diperhatikan oleh Wajib Pajak adalah sebagai berikut:</p><ol class="guide"><li>Bentuk formulir Surat Pemberitahuan (SPT) Tahunan ini telah sesuai dengan Peraturan Direktur Jenderal Pajak Nomor PER-11/PJ/2025 tentang Ketentuan Pelaporan Pajak Penghasilan, Pajak Pertambahan Nilai, Pajak Penjualan Atas Barang Mewah, dan Bea Meterai dalam Rangka Pelaksanaan Sistem Inti Administrasi Perpajakan. <b>Formulir ini digunakan untuk pengisian SPT Tahunan Pajak Penghasilan Wajib Pajak Orang Pribadi Tahun Pajak 2025 dan seterusnya</b>;</li><li>Wajib Pajak orang pribadi mengunduh dokumen SPT Tahunan PPh dalam bentuk kertas melalui laman www.pajak.go.id atau mengambil secara langsung di Kantor Pelayanan Pajak atau tempat lain yang ditetapkan oleh Direktur Jenderal Pajak dan menyampaikannya paling lambat 3 (tiga) bulan setelah Tahun Pajak berakhir;</li><li>Agar formulir dapat dibaca dengan jelas oleh mesin pemindai (scanner), perlu diperhatikan hal-hal sebagai berikut:<ol class="alpha"><li>Formulir dicetak menggunakan kertas F4/Folio (8,5 x 13 inci atau 21,59 x 33,02 cm) dengan berat minimal 70 gram;</li><li>Kertas tidak boleh terlipat, kusut, sobek, atau kotor.</li></ol></li><li>Pengisian SPT Tahunan PPh Wajib Pajak orang pribadi menggunakan huruf Latin, angka Arab, dan satuan mata uang rupiah sebesar nilai yang sebenarnya dan/atau seharusnya serta disusun dalam bahasa Indonesia;</li><li><b>Pengisian SPT Tahunan PPh Wajib Pajak orang pribadi dimulai dari induk</b>. Terdapat lampiran SPT Tahunan PPh yang bersifat wajib diisi oleh semua Wajib Pajak orang pribadi serta lampiran yang wajib diisi dan disampaikan hanya dalam kondisi tertentu.</li></ol></section>''' % ''.join(map(li, [
    'WAJIB PAJAK ORANG PRIBADI;',
    'SURAT PEMBERITAHUAN TAHUNAN PAJAK PENGHASILAN YANG DISAMPAIKAN BERSTATUS NIHIL ATAU KURANG BAYAR;',
    'TIDAK DIWAJIBKAN MENYAMPAIKAN SURAT PEMBERITAHUAN MASA DALAM BENTUK DOKUMEN ELEKTRONIK;',
    'BELUM PERNAH MENYAMPAIKAN SURAT PEMBERITAHUAN TAHUNAN DALAM DOKUMEN ELEKTRONIK;',
    'TERDAFTAR DI KANTOR PELAYANAN PAJAK PRATAMA;',
    'TIDAK MENGGUNAKAN JASA KONSULTAN PAJAK DALAM PEMENUHAN KEWAJIBAN PENGISIAN SURAT PEMBERITAHUAN TAHUNAN PAJAK PENGHASILAN;',
    'LAPORAN KEUANGANNYA TIDAK DIAUDIT OLEH AKUNTAN PUBLIK; DAN',
    'SURAT PEMBERITAHUAN TAHUNAN PAJAK PENGHASILAN YANG DISAMPAIKAN BUKAN UNTUK BAGIAN TAHUN PAJAK.']))
text2 = '''<section class="sheet text" data-sheet="2" aria-label="Petunjuk umum (lanjutan)"><ol class="guide cont alpha"><li>Lampiran SPT Tahunan PPh Wajib Pajak orang pribadi yang wajib diisi oleh semua Wajib Pajak orang pribadi meliputi:<ol class="num"><li>Lampiran 1 Bagian A (Harta pada Akhir Tahun Pajak); dan</li><li>Lampiran 1 Bagian C (Daftar Anggota Keluarga yang Menjadi Tanggungan). Dalam hal tidak terdapat tanggungan, bagian ini diisi dengan tanda hubung ( - ).</li></ol></li><li>Lampiran yang wajib disampaikan dalam kondisi tertentu yaitu lampiran yang wajib diisi dan dilampirkan tergantung pada pilihan jawaban Wajib Pajak atas pertanyaan pada induk SPT Tahunan PPh.</li></ol><ol class="guide" start="6"><li>Kekurangan pembayaran pajak yang terutang berdasarkan SPT Tahunan PPh Wajib Pajak orang pribadi dapat dilunasi dengan cara penggunaan deposit pajak melalui penyetoran pajak dengan menggunakan surat setoran pajak, pemindahbukuan, atau pengembalian kelebihan pembayaran pajak ke akun deposit pajak, sebelum SPT Tahunan PPh disampaikan, sesuai dengan jumlah kurang bayar. Bukti pembayaran wajib dilampirkan sebagai lampiran tambahan SPT Tahunan PPh Orang Pribadi;</li><li>Penyampaian SPT Tahunan PPh Orang Pribadi dalam bentuk kertas dapat dilakukan:<ol class="alpha"><li>secara langsung ke Kantor Pelayanan Pajak, Kantor Pelayanan, Penyuluhan, dan Konsultasi Perpajakan atau tempat lain meliputi Pojok Pajak, Mobil Pajak dan Tempat Khusus Penerimaan Surat Pemberitahuan Tahunan (Drop Box); atau</li><li>melalui pos atau Perusahaan Jasa Ekspedisi atau Jasa Kurir dengan bukti pengiriman surat ke Kantor Pelayanan Pajak tempat Wajib Pajak terdaftar atau tempat lain yang ditetapkan oleh Direktur Jenderal Pajak.</li></ol></li><li>SPT Tahunan PPh Wajib Pajak orang pribadi dianggap tidak disampaikan apabila tidak ditandatangani, tidak sepenuhnya dilampiri keterangan dan/atau dokumen, atau kondisi lainnya sebagaimana dimaksud dalam Pasal 3 ayat (7) Undang-Undang KUP.</li></ol></section>'''

new = [text1, text2]

# ---------------------------------------------------------------- Induk (3-4)
new.append(renumber(O(1), 3)); new.append(renumber(O(2), 4))

# ---------------------------------------------------------------- Lampiran 1 (5-7)
s5 = renumber(O(3), 5, 'Lampiran 1 halaman 1 – harta 1 sampai 4')
s5 = replace_table(s5, 1, lambda t: set_rows(t, 5, 'height:5.9mm', sub(3, 'NIK/NPWP:|NAMA:')))
s5 = replace_table(s5, 2, lambda t: set_rows(t, 5, 'height:7.3mm', sub(3, 'NPWP:|NAMA:')))
def movable(row):
    row = sub(1, 'TIPE:||MEREK/MODEL:')(row)
    return sub(2, '[ ] ATAS NAMA SENDIRI|[ ] ATAS NAMA PIHAK LAIN|NIK/NPWP:|NAMA:')(row)
s5 = replace_table(s5, 3, lambda t: set_rows(t, 5, 'height:15mm', movable))
s5 = tag(s5, ['1', '2', '3.6', '3.8', '4'])
new.append(s5)

s6 = renumber(O(4), 6, 'Lampiran 1 halaman 2 – harta 5–7 dan utang')
s6 = replace_table(s6, 0, lambda t: set_rows(t, 6, 'height:5.9mm', sub(3, 'TANAH:|BANGUNAN:')))
s6 = replace_table(s6, 1, lambda t: set_rows(t, 16))
s6 = replace_table(s6, 3, lambda t: set_rows(t, 8, 'height:6.4mm', sub(2, 'NIK/NPWP:|NAMA:')))
s6 = tag(s6, ['5', '6', '7', 'B'])
new.append(s6)

s7 = renumber(O(5), 7, 'Lampiran 1 halaman 3 – keluarga, pekerjaan, bukti potong')
s7 = replace_table(s7, 1, lambda t: set_rows(t, 5))
s7 = replace_table(s7, 2, lambda t: set_rows(t, 15, 'height:7.1mm', lambda r: sub(2, 'NOMOR:|TANGGAL:')(sub(1, 'NIK/NPWP:|NAMA:')(r))))
s7 = tag(s7, ['D', '16', '17', 'E'])
new.append(s7)

# ---------------------------------------------------------------- Lampiran 2 (8)
s8 = renumber(O(6), 8)
s8 = replace_table(s8, 0, lambda t: set_rows(t, 16, 'height:7.5mm', sub(1, 'NIK/NPWP:|NAMA:')))
s8 = replace_table(s8, 1, lambda t: set_rows(t, 6))
s8 = replace_table(s8, 2, lambda t: set_rows(t, 6))
s8 = tag(s8, ['A', 'B', 'C.6'])
new.append(s8)

# ---------------------------------------------------------------- Lampiran 3A (9-12)
for k, n in ((7, 9), (8, 10), (9, 11), (10, 12)):
    new.append(renumber(O(k), n))

# ---------------------------------------------------------------- Lampiran 3B (13) landscape, one sheet
a, b = O(11), O(12)
s13 = renumber(a, 13, 'Lampiran 3B – rekapitulasi peredaran bruto')
s13 = replace_table(s13, 0, lambda t: set_rows(t, 4))
s13 = replace_table(s13, 1, lambda t: set_rows(t, 3))
tail = b[b.index('<div class="section">B.'):b.rindex('</section>')]
tail = replace_table(tail, 0, lambda t: set_rows(t, 4))
tail = replace_table(tail, 1, lambda t: set_rows(t, 4))
s13 = s13[:s13.rindex('</section>')] + tail + '</section>'
new.append(landscape(s13))

# ---------------------------------------------------------------- Lampiran 3C (14) landscape, rebuilt body
c = O(13)
cols = 9
def tr(cells, cls=''):
    return '<tr%s>%s</tr>' % (' class="%s"' % cls if cls else '', ''.join(cells))
def lead_row(label, lead=None):
    cells = ['<td></td>', '<td class="indent%s" %s>%s</td>' % ('', '', label)] + ['<td></td>'] * 7
    return tr(cells)
def item_row(lead):
    cells = ['<td style="height:2.45mm"></td>', '<td style="height:2.45mm" class="itemlabel" data-lead="%s"></td>' % lead] + ['<td style="height:2.45mm"></td>'] * 7
    return tr(cells)
def sum_row(label, tagtext=None):
    return '<tr class="sum"><td colspan="7" class="sumlabel">%s</td><td class="sumval"></td><td></td></tr>' % label
rows = [lead_row('I. HARTA BERWUJUD')]
for g in ['A. KELOMPOK 1', 'B. KELOMPOK 2', 'C. KELOMPOK 3', 'D. KELOMPOK 4', 'E. KELOMPOK LAINNYA']:
    rows.append(lead_row(g)); rows += [item_row(str(j)) for j in (1, 2, 3)]
rows.append(lead_row('II. BANGUNAN'))
rows.append(lead_row('A. PERMANEN')); rows += [item_row(str(j)) for j in (1, 2, 3)]
rows.append(lead_row('B. TIDAK PERMANEN')); rows += [item_row(str(j)) for j in (1, 2)]
rows += [sum_row('A. JUMLAH PENYUSUTAN FISKAL'), sum_row('B. JUMLAH PENYUSUTAN KOMERSIAL'), sum_row('C. SELISIH PENYUSUTAN (A–B)')]
rows.append(lead_row('III. HARTA TIDAK BERWUJUD'))
for g in ['A. KELOMPOK 1', 'B. KELOMPOK 2', 'C. KELOMPOK 3', 'D. KELOMPOK 4', 'E. KELOMPOK LAINNYA']:
    rows.append(lead_row(g)); rows.append(item_row('1'))
rows += [sum_row('D. JUMLAH AMORTISASI FISKAL'), sum_row('E. JUMLAH AMORTISASI KOMERSIAL'), sum_row('F. SELISIH AMORTISASI (D–E)')]
thead = ('<thead><tr><th rowspan="2">KODE HARTA</th><th rowspan="2">KELOMPOK / JENIS HARTA</th><th rowspan="2">BULAN / TAHUN PEROLEHAN</th><th rowspan="2">HARGA PEROLEHAN (RUPIAH)</th>'
         '<th rowspan="2">NILAI SISA BUKU FISKAL AWAL TAHUN (RUPIAH)</th><th colspan="2">METODE PENYUSUTAN / AMORTISASI</th><th rowspan="2">PENYUSUTAN / AMORTISASI FISKAL PADA TAHUN INI (RUPIAH)</th><th rowspan="2">KETERANGAN</th></tr>'
         '<tr><th>KOMERSIAL</th><th>FISKAL</th></tr><tr class="nums">%s</tr></thead>' % ''.join('<td>(%d)</td>' % k for k in range(1, 10)))
colgroup = '<colgroup><col style="width:5%"><col style="width:20%"><col style="width:9.5%"><col style="width:14%"><col style="width:13%"><col style="width:7.5%"><col style="width:7.5%"><col style="width:14%"><col style="width:10%"></colgroup>'
head_c = c[:c.index('<table')]
s14 = head_c + '<table class="reg compact">' + colgroup + thead + '<tbody>' + ''.join(rows) + '</tbody></table></section>'
new.append(landscape(renumber(s14, 14)))

# ---------------------------------------------------------------- Lampiran 3D (15) one portrait sheet
d, e = O(14), O(15)
s15 = renumber(d, 15, 'Lampiran 3D – rincian biaya tertentu')
s15 = replace_table(s15, 0, lambda t: set_rows(t, 7, 'height:5.4mm'))
s15 = replace_table(s15, 1, lambda t: set_rows(t, 8, 'height:10.8mm'))
tailc = e[e.index('<div class="section">C.'):e.rindex('</section>')]
tailc = replace_table(tailc, 0, lambda t: set_rows(t, 5, 'height:13mm'))
s15 = s15[:s15.rindex('</section>')] + tailc + '</section>'
# grouped headers like the official form
def regroup_a(t):
    th = re.search(r'<thead>.*?</thead>', t, re.S).group(0)
    new_th = ('<thead><tr><th rowspan="2">NO</th><th colspan="5">PEMBERIAN <i>ENTERTAINMENT</i></th><th colspan="4">RELASI USAHA YANG DIBERIKAN <i>ENTERTAINMENT</i></th><th rowspan="2">KETERANGAN</th></tr>'
              '<tr><th>TANGGAL</th><th>NAMA TEMPAT</th><th>ALAMAT</th><th>JENIS</th><th>JUMLAH</th><th>NAMA</th><th>POSISI</th><th>NAMA PERUSAHAAN</th><th>JENIS USAHA</th></tr>'
              '<tr class="nums">%s</tr></thead>' % ''.join('<td>(%d)</td>' % k for k in range(1, 12)))
    return t.replace(th, new_th)
def regroup_b(t):
    th = re.search(r'<thead>.*?</thead>', t, re.S).group(0)
    new_th = ('<thead><tr><th rowspan="2">NO</th><th colspan="7">DATA PENERIMA</th><th colspan="2">PEMOTONGAN/PEMUNGUTAN PPh</th></tr>'
              '<tr><th>NOMOR IDENTITAS</th><th>NAMA</th><th>ALAMAT</th><th>TANGGAL</th><th>BENTUK DAN JENIS BIAYA</th><th>NILAI</th><th>KETERANGAN</th><th>JUMLAH</th><th>NOMOR BUKTI POTONG</th></tr>'
              '<tr class="nums">%s</tr></thead>' % ''.join('<td>(%d)</td>' % k for k in range(1, 11)))
    return t.replace(th, new_th)
s15 = replace_table(s15, 0, regroup_a)
s15 = replace_table(s15, 1, regroup_b)
new.append(s15)

# ---------------------------------------------------------------- Lampiran 4 (16)
new.append(renumber(O(16), 16))

# ---------------------------------------------------------------- Lampiran 5 (17) landscape
s17 = renumber(O(17), 17)
s17 = replace_table(s17, 0, lambda t: set_rows(t, 5))
s17 = replace_table(s17, 1, lambda t: set_rows(t, 4))
s17 = replace_table(s17, 2, lambda t: set_rows(t, 6))
# B and C side by side
m = re.search(r'(<div class="section">B\..*?</table>.*?)(<div class="section">C\.)', s17, re.S)
if m:
    b_end = s17.index('<div class="section">C.')
    b_start = s17.index('<div class="section">B.')
    s17 = s17[:b_start] + '<div class="two-col"><div class="col">' + s17[b_start:b_end] + '</div><div class="col">' + s17[b_end:s17.rindex('</section>')] + '</div></div></section>'
new.append(landscape(s17))


# ---------------------------------------------------------------- Induk 3-4: exact wording of the official form
def induk_text(sec):
    R = [
     ('Ya, saya termasuk WP OP dengan peredaran bruto tertentu yang dikenai pajak bersifat final. (Isi Lampiran 3B Bagian A)', 'Ya, saya termasuk Wajib Pajak Orang Pribadi yang memiliki peredaran bruto tertentu yang dikenai pajak bersifat final. (Isi Lampiran 3B Bagian A, lalu ke pertanyaan selanjutnya)'),
     ('Ya, saya termasuk Wajib Pajak OPPT. (Isi Lampiran 3B Bagian B)', 'Ya, saya termasuk Wajib Pajak OPPT. (Isi Lampiran 3B Bagian B, lalu ke pertanyaan selanjutnya)'),
     ('Tidak, saya menyelenggarakan pembukuan.<', 'Tidak, saya menyelenggarakan pembukuan. (Lanjut ke pertanyaan selanjutnya)<'),
     ('tidak menyelenggarakan pembukuan.<', 'tidak menyelenggarakan pembukuan. (Lanjut ke pertanyaan 1c)<'),
     ('(Isi Lampiran 3B Bagian C dan Lampiran 3A-4 Bagian A)', '(Isi Lampiran 3B Bagian C, Lampiran 3A-4 Bagian A, lalu ke pertanyaan 1c)'),
     ('Dagang. (Lampiran 3A-1)', 'Dagang. (Isi Lampiran 3A-1, lalu ke pertanyaan selanjutnya)'),
     ('Jasa. (Lampiran 3A-2)', 'Jasa. (Isi Lampiran 3A-2, lalu ke pertanyaan selanjutnya)'),
     ('Industri. (Lampiran 3A-3)', 'Industri. (Isi Lampiran 3A-3, lalu ke pertanyaan selanjutnya)'),
     ('Ya. (Isi Lampiran 2 Bagian B)</p></div><div class="question"><div class="badge"></div><div class="badge">h</div>', 'Ya. (Pastikan Anda sudah menyampaikan laporan realisasi investasi secara terpisah)</p></div><div class="question"><div class="badge"></div><div class="badge">h</div>'),
     ('PENGHASILAN NETO SETELAH PENGURANGAN PENGHASILAN NETO', 'PENGHASILAN NETO SETELAH PENGURANG PENGHASILAN NETO'),
     ('PPh TERUTANG SETELAH PENGURANGAN PPh TERUTANG', 'PPh TERUTANG SETELAH PENGURANG PPh TERUTANG'),
     ('Tidak, saya tidak memilikinya.<', 'Tidak, saya tidak memilikinya. (Lanjut ke pertanyaan selanjutnya)<'),
     ('diangsur/ditunda)', 'diangsur/ditunda, lalu ke pertanyaan selanjutnya)'),
     ('KELEBIHAN PPh FINAL ATAS PENGHASILAN DARI USAHA DENGAN PEREDARAN BRUTO TERTENTU YANG DAPAT DIMINTAKAN PENGEMBALIAN</span>', 'KELEBIHAN PPh FINAL ATAS PENGHASILAN DARI USAHA DENGAN PEREDARAN BRUTO TERTENTU YANG DAPAT DIMINTAKAN PENGEMBALIAN.<br><small>(Silakan mengajukan permohonan pengembalian pajak yang seharusnya tidak terutang secara terpisah)</small></span>'),
     ('Ya, angsuran PPh Pasal 25-nya adalah</p>', 'Ya, angsuran PPh Pasal 25-nya adalah <span class="inline-formula">(1/<span class="inbox"></span> x ( 9 - 10a ))</span></p>'),
     ('<span style="min-width:0;flex:1">PPh KURANG/LEBIH BAYAR PADA SPT YANG DIBETULKAN</span>', '<span style="min-width:0;flex:1">PPh KURANG/LEBIH BAYAR PADA SPT YANG DIBETULKAN</span><span class="gantispt"><span class="cbx"></span>GANTI SPT SEBELUMNYA</span>'),
    ]
    for a, b in R:
        sec = sec.replace(a, b)
    sec = re.sub(r'</span>Tidak\.</p>', '</span>Tidak. (Lanjut ke pertanyaan selanjutnya)</p>', sec)
    sec = re.sub(r'\(Isi (Lampiran (?![^)]*lalu)(?!4 Bagian A\))[^)]*?)\)', lambda m: '(Isi %s, lalu ke pertanyaan selanjutnya)' % m.group(1), sec)
    return sec

new[2] = induk_text(new[2]); new[3] = induk_text(new[3])
def tag_refs(sec):
    # official form prints formula operands (1a, 10b, 9...) as small orange tags
    def fix(m):
        inner = re.sub(r'\b(\d+[a-d]?)\b', r'<i class="ref">\1</i>', m.group(2))
        return m.group(1) + inner + m.group(3)
    sec = re.sub(r'(<span class="r-formula">)(.*?)(</span>)', fix, sec)
    sec = re.sub(r'(<span class="inline-formula">\(1/<span class="inbox"></span> x \()(.*?)(\)\)</span>)', fix, sec)
    sec = re.sub(r'<b>([a-h])</b>', r'<b class="l">\1</b>', sec)
    sec = re.sub(r'<div class="section">([A-K])\.', lambda m: '<div class="section" data-sec="%s">%s.' % (m.group(1), m.group(1)), sec)
    return sec
new[2] = tag_refs(new[2]); new[3] = tag_refs(new[3])
new[2] = new[2].replace('<p>BULAN MULAI &nbsp; BULAN AKHIR</p>', '<p class="pl a">BULAN<br>MULAI</p><p class="pl b">BULAN<br>AKHIR</p>').replace('</span> s.d. <span class="digitrow', '</span><span class="sd">S.D.</span><span class="digitrow')
new[3] = new[3].replace('<div style="background:var(--yellow);padding:2mm 4mm;', '<div class="kbanner" style="background:var(--yellow);padding:2mm 4mm;').replace('<div style="border:1px solid #3775bd;height:10mm;', '<div class="kbox" style="border:1px solid #3775bd;height:10mm;')
# PTKP status box next to row 5 (PENGHASILAN TIDAK KENA PAJAK)
new[2] = new[2].replace('<span style="min-width:0;flex:1">PENGHASILAN TIDAK KENA PAJAK</span>', '<span style="min-width:0;flex:1">PENGHASILAN TIDAK KENA PAJAK</span><span class="emptybox ptkpbox" style="width:26mm"></span>')

assert len(new) == 17, len(new)

css = '''
.ref{font-style:normal;display:inline-block;background:var(--yellow);color:#111;font-weight:500;font-size:6.2pt;line-height:1;padding:.7mm 1.1mm;margin:0 .5mm}
.r-formula{font-weight:400}

.sheet:is([data-sheet="3"],[data-sheet="4"]) .section{margin:1mm 0 .4mm;padding:.6mm 1mm;font-size:8pt;letter-spacing:.04em}
.sheet[data-sheet="4"] .opts p{font-size:6.2pt}
.sheet[data-sheet="4"] .induk-head{margin-bottom:3.7mm!important}
.sheet[data-sheet="3"] .idgrid .r{margin:.5mm 0}
.sheet[data-sheet="3"] .idgrid .r em{height:3.9mm}
.sheet[data-sheet="3"] .top-fields{margin-bottom:3.4mm;height:23mm}
.sheet[data-sheet="4"] .form-body[style]{margin-top:1mm!important}
.kbanner{padding:1.3mm 3mm!important;font-size:5.9pt!important;line-height:1.25!important;gap:2mm!important}
.kbox{height:7.5mm!important;padding-top:2.2mm!important}
.sheet:is([data-sheet="3"],[data-sheet="4"]) .induk-head{height:16mm;margin-bottom:.9mm}
.sheet:is([data-sheet="3"],[data-sheet="4"]) .induk-id img{width:14mm;height:14mm}
.sheet:is([data-sheet="3"],[data-sheet="4"]) .induk-box{height:15mm;padding-top:2mm}
.sheet[data-sheet="3"] .idgrid{min-height:30mm}
.ptkpbox{margin-left:auto;margin-right:1.5mm}
.inline-formula{font-size:6.4pt}
.inbox{display:inline-block;width:6mm;height:3.4mm;border:.3mm solid #3276d7;background:#fff;vertical-align:middle}
.gantispt{display:inline-flex;align-items:center;gap:1.2mm;font-size:7pt;margin-left:2mm}
.cbx{display:inline-block;width:3.5mm;height:3.5mm;border:.35mm solid #2464bf;background:#fff}
.sheet small{font-size:6.2pt}
.sheet:nth-child(n+5):nth-child(-n+7) .notice,.sheet:nth-child(15) .notice{font-size:5.3pt;line-height:1.22;padding:1.8mm 2.4mm 0}
.sheet:nth-child(n+5):nth-child(-n+7) .notice b{font-size:7pt}
.sheet:nth-child(14) .reg td{padding-top:.2mm;padding-bottom:.2mm}
.sheet{width:215.9mm;height:330.2mm;page:portrait}
.sheet.landscape{width:330.2mm;height:215.9mm;page:landscape}
@page{size:215.9mm 330.2mm;margin:0}
@page portrait{size:215.9mm 330.2mm;margin:0}
@page landscape{size:330.2mm 215.9mm;margin:0}
.supmain{grid-template-rows:minmax(18mm,auto) 6mm}
.suptop{min-height:24mm}
.landscape .suptop{grid-template-columns:22% 78%}
.landscape .supmain{grid-template-columns:minmax(0,1fr) 52mm}
.landscape .section{font-size:8.6pt}
.landscape .reg td.empty{height:5.4mm}
.landscape .reg.compact td.empty{height:4.4mm}
.sheet.text{padding:16mm 14mm;font-size:10.6pt;line-height:1.55;color:#111}
.sheet.text h1{font-size:13pt;font-weight:400;text-align:center;letter-spacing:.06em;line-height:1.5;margin:6mm 0 9mm}
.sheet.text h2{font-size:12pt;font-weight:400;text-align:center;letter-spacing:.1em;margin:7mm 0 6mm}
.sheet.text .criteria{border:.3mm solid #111;padding:5mm 6mm 4mm;margin:0 0 4mm}
.sheet.text .criteria p{margin:0 0 2mm;letter-spacing:.07em;text-align:justify;font-size:10.2pt}
.sheet.text ol{margin:0;padding-left:9mm}.sheet.text .criteria ol{padding-left:7mm;font-size:10.2pt;letter-spacing:.07em;text-align:justify}
.sheet.text .guide{padding-left:8mm}.sheet.text .guide li{margin:0 0 3.2mm;text-align:justify;padding-left:3mm}
.sheet.text ol.alpha{list-style:lower-alpha;margin-top:2mm}.sheet.text ol.num{list-style:decimal;margin-top:1mm}
.sheet.text .guide.cont{list-style:lower-alpha}
.sheet.text p{margin:0 0 4mm;text-align:justify}
.sheet.text b{font-weight:600}
.reg tr[style*="height"] td.empty{height:auto!important;vertical-align:top}
.reg td[data-sub]{font-size:4.9pt;line-height:1.3;vertical-align:top;letter-spacing:.04em;font-weight:300}
.reg .sum td{height:3.8mm;background:#e5e8e8;font-weight:300;letter-spacing:.07em}
.reg .sumtag{position:relative;background:#fff!important;text-align:right;padding-right:1mm}
.reg .sumtag[data-tag]::before{content:attr(data-tag);position:absolute;left:-6mm;top:50%;transform:translateY(-50%);background:var(--yellow);color:#111;font-weight:700;font-size:5.4pt;line-height:3mm;height:3mm;padding:0 2.2mm 0 1.6mm;clip-path:polygon(0 0,82% 0,100% 50%,82% 100%,0 100%);white-space:nowrap}
.reg td.itemlabel::before{content:attr(data-lead) ". ··································";color:#555;font-size:5.6pt;letter-spacing:.02em}
.reg tr.sum td.sumlabel{text-align:left;padding-left:1.5mm}
.two-col{display:grid;grid-template-columns:1fr 1fr;gap:3mm;align-items:start}
.two-col .col>.section{margin-top:1.4mm}
.two-col .col .note{text-align:right}
.reg td,.reg th{font-weight:400}
.sheet[data-sheet="3"] .top-fields{margin-bottom:2.7mm}
.sheet[data-sheet="3"] .idgrid{min-height:28.7mm}
.sheet[data-sheet="3"] .idgrid .r{margin:.39mm 0!important}
.sheet[data-sheet="3"] .section[data-sec="C"]{margin-top:4.2mm}
.sheet[data-sheet="3"] .section[data-sec="D"]{margin-top:3.2mm}
.sheet[data-sheet="4"] .induk-head{margin-bottom:1.6mm!important}
.sheet[data-sheet="4"] .section[data-sec="F"]{margin-top:3.4mm}
.sheet[data-sheet="4"] .section[data-sec="G"]{margin-top:.6mm}
.sheet[data-sheet="4"] .section[data-sec="G"]+.form-body{padding-top:.2mm;padding-bottom:.2mm}
.sheet[data-sheet="4"] .section[data-sec="G"]+.form-body .line-row{min-height:0}
.sheet[data-sheet="4"] .section[data-sec="G"]+.form-body .line-row>div{line-height:3.5mm;font-size:6.6pt}
.sheet[data-sheet="4"] .section[data-sec="G"]+.form-body .emptybox{height:3.1mm}
.sheet[data-sheet="4"] .section[data-sec="H"]{margin-top:-.3mm}
.sheet[data-sheet="4"] .section[data-sec="I"]{margin-top:1.4mm}
.sheet[data-sheet="4"] .section[data-sec="J"]{margin-top:3.7mm}
.sheet[data-sheet="4"] .section[data-sec="K"]{margin-top:.5mm}
'''
head2 = head.replace('@page{size:215mm 330mm;margin:0}', '')
head2 = head2.replace('.sheet:nth-child(-n+2)', '.sheet:nth-child(n+3):nth-child(-n+4)')
head2 = re.sub(r'\.sheet:nth-child\(([2-6])\)', lambda m: '.sheet:nth-child(%d)' % (int(m.group(1)) + 2), head2)
head2 = head2.replace('.sheet{width:215mm;height:330mm;', '.sheet{').replace('</style>', '')

def R(x): return 'calc(var(--pw) * %s)' % x
ratio_css = """
.sheet:is([data-sheet="3"],[data-sheet="4"]){--pw:215.9mm}
.sheet:is([data-sheet="3"],[data-sheet="4"]) .form-body{padding-left:%(pl)s;padding-right:%(pr)s}
.sheet:is([data-sheet="3"],[data-sheet="4"]) .question{grid-template-columns:%(b)s %(b)s minmax(0,1fr) %(a)s;column-gap:%(g)s}
.sheet:is([data-sheet="3"],[data-sheet="4"]) .question .badge{box-sizing:border-box;justify-self:stretch;align-self:start;width:100%%;height:%(bh)s;padding:0;display:flex;align-items:center;justify-content:center;line-height:1;font-size:7pt;font-weight:700;margin-top:%(bm)s}
.sheet:is([data-sheet="3"],[data-sheet="4"]) .question .badge:empty{background:transparent;border:0}
.sheet:is([data-sheet="3"],[data-sheet="4"]) .question .qval{width:%(a)s;height:%(ah)s;min-height:0}
.sheet:is([data-sheet="3"],[data-sheet="4"]) .line-row b{min-width:0;width:%(b)s;height:%(bh)s;padding:0;display:flex;align-items:center;justify-content:center;line-height:1}
.sheet:is([data-sheet="3"],[data-sheet="4"]) .line-row b.l{margin-left:%(b2)s}
.sheet:is([data-sheet="3"],[data-sheet="4"]) .r-val{width:%(a)s;height:%(ah)s}
.sheet:is([data-sheet="3"],[data-sheet="4"]) .ref{min-width:%(rw)s;height:%(rh)s;padding:0;margin:0 .4mm;display:inline-flex;align-items:center;justify-content:center;line-height:1}
.sheet:is([data-sheet="3"],[data-sheet="4"]) .opts{margin-left:%(om)s}
.sheet:is([data-sheet="3"],[data-sheet="4"]) .opts .tick{width:%(tw)s;height:%(th)s;margin-right:%(tg)s}
.sheet:is([data-sheet="3"],[data-sheet="4"]) .induk-box{width:%(ib)s;height:%(ibh)s;margin-left:auto;margin-right:%(ibm)s;padding-top:0;display:flex;flex-direction:column;justify-content:center}
.sheet[data-sheet="4"] .emptybox[style*="37mm"]{width:%(e1)s!important;height:%(eh)s}
.sheet[data-sheet="4"] .emptybox[style*="38mm"]{width:%(e2)s!important;height:%(eh)s}
.sheet[data-sheet="4"] .emptybox[style*="50mm"]{width:%(e3)s!important;height:%(eh)s}
.sheet[data-sheet="4"] .emptybox[style*="65mm"]{width:%(e4)s!important}
.kbanner{margin-left:%(kl)s;width:%(kw)s;min-height:%(kh)s;box-sizing:border-box}
.kbox{width:%(kbw)s;height:%(kbh)s!important;box-sizing:border-box}
.sheet:is([data-sheet="3"],[data-sheet="4"]) .form-body{padding-top:%(fp)s;padding-bottom:%(fp)s;margin-bottom:0}
.sheet:is([data-sheet="3"],[data-sheet="4"]) .line-row{min-height:%(lr)s;gap:%(lg)s;font-size:7.2pt;line-height:%(L)s}
.sheet:is([data-sheet="3"],[data-sheet="4"]) .question{font-size:7.2pt;margin-top:%(qm)s}
.sheet:is([data-sheet="3"],[data-sheet="4"]) .qtext{line-height:%(L)s;padding:0 .8mm;font-weight:500}
.sheet:is([data-sheet="3"],[data-sheet="4"]) .opts{margin-top:0;margin-bottom:%(qm)s;margin-right:%(or)s}
.sheet:is([data-sheet="3"],[data-sheet="4"]) .opts p{line-height:%(L)s;margin:0;font-size:7.2pt}
.sheet:is([data-sheet="3"],[data-sheet="4"]) .opts .tick{vertical-align:middle;margin-top:-.3mm}
.sheet[data-sheet="4"] .opts{margin-right:%(or4)s}
.sheet[data-sheet="4"] .opts p{font-size:6.2pt;line-height:%(L4)s}
.sheet[data-sheet="4"] .qtext{line-height:%(L4)s}
""" % dict(pl=R(.0282), pr=R(.0270), b=R(.0204), b2=R(.0217), bh=R(.0143), g=R(.0013), a=R(.2570), ah=R(.0150),
           rw=R(.0200), rh=R(.0139), om=R(.0429), tw=R(.0208), th=R(.0155), tg=R(.0092), ib=R(.1789), ibh=R(.0666), ibm=R(.0078),
           e1=R(.1340), e2=R(.1479), e3=R(.4085), e4=R(.3386), eh=R(.0151), kl=R(.0061), kw=R(.9171), kh=R(.0441), kbw=R(.2537), kbh=R(.0364), fp=R(.0023), bm=R(.0007), lr=R(.0195), lg=R(.0065), L=R(.0157), qm=R(.0019), L4=R(.0153), or4=R(.2150), **{'or': R(.2750)})
def datasheet(css_text):
    css_text = css_text.replace('.sheet:nth-child(n+3):nth-child(-n+4)', '.sheet:is([data-sheet="3"],[data-sheet="4"])')
    css_text = css_text.replace('.sheet:nth-child(n+5):nth-child(-n+7)', '.sheet:is([data-sheet="5"],[data-sheet="6"],[data-sheet="7"])')
    return re.sub(r'\.sheet:nth-child\((\d+)\)', lambda m: '.sheet[data-sheet="%s"]' % m.group(1), css_text)
css += ratio_css

# Header band of Induk page 1 (TAHUN PAJAK / PERIODE / STATUS / ...): positions are ratios of page width taken from the PDF.
band = dict(h=R(.1118), mb='1.6mm', ml=R(.0058), mr=R(.0032), tt=R(.0045), sh=R(.0358), lh=R(.0179), sep=R(.0050), sw=R(.0014),
            pl=R(.0224), th=R(.0167), tw=R(.0217), tg=R(.0075), r1=R(.0432), r2=R(.0628), r3=R(.0824),
            yl=R(.0224), yw=R(.0443), yh=R(.0253), mw=R(.0217), m1=R(.0214), m2=R(.0868), pw=R(.0433), plt=R(.0424), sdl=R(.0755), sdt=R(.0895),
            c2=R(.2220), c3=R(.3747), c4=R(.5111), c5=R(.6825), w1=R(.2220), w2=R(.1527), w3=R(.1364), w4=R(.1714), w5=R(.2391))
top_css = """
.sheet[data-sheet="3"]{--pw:215.9mm}
.sheet[data-sheet="3"] .top-fields{display:block!important;position:relative;height:%(h)s!important;margin:0 %(mr)s %(mb)s %(ml)s!important;padding:0!important}
.sheet[data-sheet="3"] .tf{position:absolute;top:0;bottom:0;border:0!important;padding:0!important;font-size:6.4pt}
.sheet[data-sheet="3"] .tf:nth-child(1){left:0;width:%(w1)s}
.sheet[data-sheet="3"] .tf:nth-child(2){left:%(c2)s;width:%(w2)s}
.sheet[data-sheet="3"] .tf:nth-child(3){left:%(c3)s;width:%(w3)s}
.sheet[data-sheet="3"] .tf:nth-child(4){left:%(c4)s;width:%(w4)s}
.sheet[data-sheet="3"] .tf:nth-child(5){left:%(c5)s;width:%(w5)s}
.sheet[data-sheet="3"] .tf:not(:first-child)::before{content:"";position:absolute;left:0;top:%(sep)s;bottom:%(sep)s;width:%(sw)s;background:var(--yellow)}
.sheet[data-sheet="3"] .tf>strong{position:absolute;left:0;right:0;top:%(tt)s;height:%(sh)s;display:flex;align-items:center;justify-content:center;text-align:center;font-size:7.2pt;line-height:%(lh)s;margin:0!important}
.sheet[data-sheet="3"] .tf p:not(.pl){position:absolute;left:%(pl)s;margin:0!important;height:%(th)s;display:flex;align-items:center;font-size:6.4pt;line-height:1;white-space:nowrap}
.sheet[data-sheet="3"] .tf p:not(.pl):nth-of-type(1){top:%(r1)s}
.sheet[data-sheet="3"] .tf p:not(.pl):nth-of-type(2){top:%(r2)s}
.sheet[data-sheet="3"] .tf p:not(.pl):nth-of-type(3){top:%(r3)s}
.sheet[data-sheet="3"] .tf .tick{flex:none;width:%(tw)s;height:%(th)s;margin:0 %(tg)s 0 0}
.sheet[data-sheet="3"] .tf:nth-child(1) .digitrow{position:absolute;left:%(yl)s;top:%(r3)s}
.sheet[data-sheet="3"] .tf:nth-child(1) .digitrow i{width:%(yw)s;height:%(yh)s}
.sheet[data-sheet="3"] .tf:nth-child(2) .digitrow{position:absolute;top:%(r3)s}
.sheet[data-sheet="3"] .tf:nth-child(2) .digitrow:nth-of-type(1){left:%(m1)s}
.sheet[data-sheet="3"] .tf:nth-child(2) .digitrow:nth-of-type(3){left:%(m2)s}
.sheet[data-sheet="3"] .tf:nth-child(2) .digitrow i{width:%(mw)s;height:%(yh)s}
.sheet[data-sheet="3"] .tf .pl{position:absolute;margin:0!important;width:%(pw)s;top:%(plt)s;text-align:center;font-size:6.4pt;line-height:%(lh)s}
.sheet[data-sheet="3"] .tf .pl.a{left:%(m1)s}
.sheet[data-sheet="3"] .tf .pl.b{left:%(m2)s}
.sheet[data-sheet="3"] .tf .digitrow i{border-color:#2e6fc4;background:#fff}
.sheet[data-sheet="3"] .top-fields::before{content:"";position:absolute;left:0;right:0;bottom:calc(var(--pw) * -.0062);height:calc(var(--pw) * .0020);background:#0e0e0e}
.sheet[data-sheet="3"] .top-fields::after{content:"";position:absolute;left:0;right:0;bottom:calc(var(--pw) * -.0096);height:calc(var(--pw) * .0009);background:#0e0e0e}
.sheet[data-sheet="3"] .tf .sd{position:absolute;left:%(sdl)s;top:%(sdt)s;transform:translateX(-50%%);font-size:5.2pt}
""" % band
css += top_css
head2 = datasheet(head2); css = datasheet(css)
head2 = chr(10).join(l for l in head2.split(chr(10)) if not (l.startswith('.sheet:is([data-sheet="3"],[data-sheet="4"])') or l.startswith('.sheet[data-sheet="4"] .')))
out = head2 + css + '</style>' + ''.join(new) + '</body></html>'
open(OUT, 'w').write(out)
print('wrote', OUT, len(out))
