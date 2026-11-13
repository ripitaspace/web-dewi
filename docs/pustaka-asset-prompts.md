# Pustaka hero: prompt per komponen

Kanvas scene: **2560 × 1440 (16:9)**. Area aman 3:2 di tengah (x 200–2360) untuk Pus dan papan; sisanya hanya latar yang boleh terpotong di layar sempit.
Lampirkan `public/illustrations/pustaka/master.webp` sebagai **style + character reference** di setiap generate.

## Aturan umum

**Style block** (tempel di awal setiap prompt):

> Hand-painted gouache and watercolor storybook illustration, vintage editorial ink & wash × Nusantara storybook. Expressive navy ink linework, warm aged-paper texture, fine paper grain, visible brush strokes, controlled maximalism, warm natural light coming from the upper left. Palette: navy #10283B, maroon #781B34, terracotta #C47B65, cream #F6E6D0, gold #D39129, plus natural colors from the reference. Not anime, not flat vector, not 3D, not a photo filter.

**Transparansi.** Kebanyakan generator tidak menghasilkan alpha asli. Untuk semua komponen *selain latar penuh*, minta objek di atas **latar hijau chroma solid `#00FF00` polos tanpa bayangan, tanpa gradasi, tanpa tekstur**, lalu kirim file-nya; saya yang menghapus hijau dan menghasilkan WebP transparan. Jangan pakai hijau pada objek (daun: pakai hijau zaitun/tua, bukan hijau neon).

**Tambahkan di akhir setiap prompt komponen:** `Single isolated object, fully inside the frame with a small margin, nothing cropped, no other objects, no text, no watermark, no cast shadow on the background.`

**Konsistensi.** Pakai seed/reference yang sama, arah cahaya sama (kiri atas), outline tinta navy dengan ketebalan sama.

**Pemberian nama file:** simpan sebagai `<id>.png` (atau .webp) dan taruh di `public/illustrations/pustaka/_incoming/`.

Urutan: kerjakan satu per satu, kirim hasilnya, saya cek dan pasang sebelum lanjut.

---

## 1. `background-wall` (latar penuh, tanpa chroma)
Ukuran 2560×1440. Tanpa Pus, tanpa objek.

> [Style block] Empty interior wall of a vintage Nusantara library, warm cream plaster with soft watercolor wash variations and aged-paper grain, a faint warm light gradient from the upper left, subtle stains and brush texture. Completely empty wall, no furniture, no window, no people, no objects, no text. Full-bleed 16:9 composition.

## 2. `background-window` (jendela + candi, satu gambar)
Rasio ±3:4, tinggi ±1100 px. Chroma hijau di luar bingkai jendela.

> [Style block] A tall arched wooden window frame seen straight-on, warm brown wood with ink outlines, looking out onto a soft pastel watercolor landscape: a Javanese candi temple gate with tiered roof and smaller temple structures on a gentle hill with stone steps, distant trees, pale blue sky with soft clouds, hazy atmospheric perspective. The view inside the arch is fully painted (no empty sky gaps). Isolated on flat #00FF00. [+ kalimat akhir dari Aturan umum]

## 3. `bookshelf-right` (revisi: miring seperti di master, kucing terpisah)
Di master, rak dilihat dari sudut tiga perempat: sisi depan rak miring menjauh ke kanan, dan bagian bawahnya terpotong tumpukan buku tempat kucing tidur. Kucing **bukan** bagian rak; ia komponen 10 + 11 yang diletakkan di depan rak.

Rasio ±1:1.1, menempel ke tepi kanan. Lampirkan master sebagai reference sudut pandang.

> [Style block] A tall dark wooden bookshelf seen from a three-quarter angle looking slightly from the left: the shelf front recedes in perspective toward the right (vertical lines converge gently, the right edge of the shelves is smaller and the left side is closer to the viewer), same viewing angle as the bookshelf in the reference illustration. Three shelves packed with vintage hardcover books in maroon, navy, ochre, green and cream with gold spine details, some books leaning, a small carved Javanese stone statue head on the top shelf, rich brown wood grain with ink outlines. The lowest shelf is empty of any cat or objects on its front edge: books only, so another layer can be placed in front. Show the whole shelf, not cropped by the frame. Isolated on flat #00FF00. [+ kalimat akhir dari Aturan umum]

Rak lurus (versi sekarang) dipakai sementara sampai versi miring ini ada.

## 4. `hanging-vines`
Rasio ±1:2.

> [Style block] A long trailing ivy/pothos vine hanging down from the top, heart-shaped leaves in olive and sage green with ink outlines, thin stems, several leaves overlapping, gentle S-curve, hanging free with no support visible. Leaves must be olive/dark green, NOT neon green. Isolated on flat #00FF00. [+ kalimat akhir dari Aturan umum]

## 5. `curtain-left`
Rasio ±1:2.3, menempel ke tepi kiri.

> [Style block] A heavy blue batik-style curtain drawn back and tied at the side, deep navy fabric with gold and terracotta floral batik motifs, soft folds and tassel, hanging from the top. Seen straight-on, full curtain visible, no window behind it. Isolated on flat #00FF00. [+ kalimat akhir dari Aturan umum]

## 6. `floor-rug`
Ukuran 2560×500. Tanpa chroma jika memenuhi lebar; boleh full-bleed.

> [Style block] Top-down-to-slight-perspective view of a worn Persian-Javanese woven rug with maroon, navy, gold and cream geometric floral pattern, faded watercolor texture, fringe at the edges. Wide horizontal strip, fills the whole frame edge to edge, empty (no feet, no objects).

## 7. `flower-vase`
Rasio ±1:1.3.

> [Style block] A blue-and-white porcelain vase with a bouquet of cream lilies, red-maroon blossoms, small white flowers and long olive leaves arching out, ink outlines, painterly petals. Seen straight-on at eye level. Isolated on flat #00FF00. [+ kalimat akhir dari Aturan umum]

## 8. `book-stack-left`
Rasio ±1:1.6, menempel ke tepi kiri.

> [Style block] A tall tidy stack of vintage hardcover books laid flat, spines facing the viewer on the right side, maroon, navy, green, ochre with gold embossing and worn page edges, plus a draped batik cloth over one corner. Top of the stack flat and empty (the cup is a separate object). Isolated on flat #00FF00. [+ kalimat akhir dari Aturan umum]

## 9. `tea-cup`
Rasio ±1:1.

> [Style block] A small blue-and-white porcelain teacup on a matching saucer with a thin curl of steam, ink outlines, seen slightly from the side. Isolated on flat #00FF00. [+ kalimat akhir dari Aturan umum]

## 10. `book-stack-right`
Rasio ±3:2.

> [Style block] A stack of four vintage hardcover books laid flat, spines facing the viewer on the left side, maroon, navy, ochre and cream with gold details; the top book has a completely flat empty top surface (a cat sleeps there in another layer). Isolated on flat #00FF00. [+ kalimat akhir dari Aturan umum]

## 11. `sleeping-cat`
Rasio ±2:1.

> [Style block] A calico cat (white, orange and brown patches) curled up asleep, eyes closed, relaxed, seen from the front-left, loaf-like pose, painterly fur strokes with ink outline. Resting pose that would sit on top of a book stack; show only the cat. Isolated on flat #00FF00. [+ kalimat akhir dari Aturan umum]

## 12. `writing-tools`
Rasio ±1:2.

> [Style block] A blue-and-white porcelain jar holding several paintbrushes and quills of different sizes with wooden handles, bristles in ochre and maroon, seen straight-on. Isolated on flat #00FF00. [+ kalimat akhir dari Aturan umum]

## 13. `open-book`
Rasio ±2:1.

> [Style block] A large vintage book lying open, aged cream pages with a botanical flower illustration on the left page and handwritten-looking lines (illegible, no readable words) on the right, worn edges, leather cover visible beneath. Seen from slightly above. Isolated on flat #00FF00. [+ kalimat akhir dari Aturan umum]

## 14. `foreground-plants`
Rasio ±1:1, menempel ke sudut kanan bawah.

> [Style block] Large broad tropical leaves of a houseplant in the foreground corner, deep olive green with lighter veins and ink outlines, a few leaves overlapping, cut from a single pot rim at the bottom. Leaves olive/dark green, NOT neon green. Isolated on flat #00FF00. [+ kalimat akhir dari Aturan umum]

---

## Pus (karakter): paling penting, kerjakan setelah latar

Lampirkan master sebagai **character reference**; pertahankan wajah, rambut, baju, dan sepatu persis.

### 15. `pus-body`
Rasio ±1:1.15. Tanpa lengan.

> [Style block] Same character as the reference: Pus, a young woman with an oval face, large expressive eyes, thick natural eyebrows, straight nose, full lips, long wavy brown hair with caramel highlights, warm confident smile, wearing a maroon batik-print jacket over a dark brown top and loose cream wide-leg pants and cream sneakers, sitting cross-legged facing the viewer. **No arms and no hands: both shoulders end in a clean rounded shoulder cap as if the arms were removed (sleeves cut at the shoulder seam).** Full body from hair top to shoes. Isolated on flat #00FF00. [+ kalimat akhir dari Aturan umum]

### 16. `pus-left-arm` dan 17. `pus-right-arm` (perspektif Pus)
Satu per satu, masing-masing rasio ±1:2.

> [Style block] The [left/right] arm of Pus (same character, maroon batik jacket sleeve with the same print), extended forward and slightly outward as if pushing a large board toward the viewer, from the shoulder seam to the wrist, ending in an **open palm facing the viewer, fingers pointing up** (the palm will be hidden behind a board). Sleeve cuff at the wrist. Isolated on flat #00FF00. [+ kalimat akhir dari Aturan umum]

Catatan: jika bahu pada `pus-body` dan lengan tidak cocok, saya bisa menyesuaikan pada tahap pemasangan.

## Papan dan tangan

### 18. `board-surface` dan `board-frame`
Rasio 2.1:1, 2100×1000.

> [Style block] A large rectangular sheet of handmade cream paper with a deckled, slightly burnt edge, ornamental border of terracotta, gold and navy floral batik corner motifs and a thin gold line frame, flat straight-on view, **completely blank in the middle, no text**. Isolated on flat #00FF00. [+ kalimat akhir dari Aturan umum]

Jika memungkinkan, buat dua: (a) papan polos tanpa bingkai ornamen (`board-surface`), (b) hanya bingkai ornamen dengan tengah hijau (`board-frame`).

### 19. `pus-left-hands` dan 20. `pus-right-hands`
Rasio ±1:1.5. Boleh digenerate bersama arm jika konsisten.

> [Style block] The [left/right] hand of Pus: four fingers curled over the edge of a board gripping it, seen from the front, slender fingers with soft pink nails, thin navy ink outline, warm skin tone matching the reference. Thumb hidden behind the board. Wrist cut off cleanly. Isolated on flat #00FF00. [+ kalimat akhir dari Aturan umum]

---

## Kriteria cek per gambar
1. Gaya dan palet sama dengan master.
2. Hijau chroma rata, objek tidak mengandung hijau neon.
3. Tidak ada objek lain, tidak ada teks, tidak terpotong.
4. Wajah/rambut/pakaian Pus tetap konsisten (komponen 15–17, 19–20).
