# 📦 Modular Notion CMS

Modul CMS Notion portabel dan self-contained untuk Next.js App Router (14 / 15 / 16).
Mudah di-copy-paste ke repository lain tanpa dependensi tersembunyi ke luar modul.

---

## 📁 Struktur Direktori

```
modules/cms/
├── index.ts                     # Barrel export utama (Public API)
├── README.md                    # Dokumentasi & panduan portabilitas
├── core/
│   ├── client.ts                # Inisialisasi official Notion SDK & NotionX
│   ├── config.ts                # Validasi env variables
│   ├── constants.ts             # Default fallback & cache constants
│   ├── cache.ts                 # Abstraksi caching SQLite/Prisma
│   └── utils.ts                 # Parser properti Notion & Image proxy URL
├── types/
│   ├── blog.types.ts            # Interface BlogPost
│   ├── product.types.ts         # Interface Product
│   ├── content.types.ts         # Interface LandingContent
│   ├── notion.types.ts          # Raw Notion API types
│   └── index.ts                 # Export seluruh types
├── services/
│   ├── blog.service.ts          # Query, caching, mapper, dan fallback Blog
│   ├── product.service.ts       # Query, caching, mapper, dan fallback Product
│   └── content.service.ts       # Query dan fallback dynamic key-value content
├── components/
│   └── notion-body.tsx          # Wrapper react-notion-x dengan styling terisolasi
└── api/
    ├── image-proxy-handler.ts   # Handler reusable untuk /api/notion-image
    └── renew-cache-handler.ts   # Handler reusable untuk /api/renew
```

---

## 🚀 Panduan Copy-Paste ke Repository Baru

### 1. Salin Folder
Salin folder `src/modules/cms` ke dalam project baru Anda (misalnya di `src/modules/cms` atau `modules/cms`).

### 2. Install Dependensi
Jalankan perintah berikut di project tujuan:

```bash
pnpm add @notionhq/client notion-client react-notion-x
```

### 3. Konfigurasi Environment Variables (`.env`)
Tambahkan variabel berikut ke file `.env` project:

```env
# Notion Integration Token (Internal Integration Secret)
NOTION_TOKEN="ntn_xxxxxxxxxxxxxxxxxxxxxxxx"

# Database IDs
NOTION_BLOG_DB_ID="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
NOTION_PRODUCT_DB_ID="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
NOTION_CONTENT_DB_ID="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

### 4. Tambahkan Model Prisma Cache (Opsional tapi Direkomendasikan)
Jika menggunakan Prisma + SQLite/Postgres/MySQL untuk caching lokal, tambahkan model berikut ke `prisma/schema.prisma`:

```prisma
model NotionCache {
  key       String   @id
  data      String   // JSON string of cached payload
  updatedAt DateTime @updatedAt
}
```

Jalankan migrasi / update skema:
```bash
npx prisma generate
npx prisma db push
```

---

## 📝 Panduan Konfigurasi di Notion

Untuk menghubungkan modul CMS ini dengan Notion, ikuti langkah-langkah persiapan berikut:

### 1. Buat Notion Integration Token
1. Buka [Notion Developers / Integrations](https://www.notion.so/my-integrations).
2. Klik tombol **"+ New integration"**.
3. Beri nama integrasi (misal: *Web CMS*) dan pilih workspace Anda.
4. Salin **Internal Integration Secret** (`ntn_...` atau `secret_...`) dan simpan ke variabel `NOTION_TOKEN` di file `.env`.

> [!IMPORTANT]
> **Hubungkan Integration ke Setiap Database**:
> Buka masing-masing database di Notion yang ingin diakses -> Klik ikon **`...`** di pojok kanan atas halaman -> Pilih **Connections** / **Connect to** -> Pilih integrasi yang baru saja dibuat. Tanpa langkah ini, API tidak memiliki izin untuk membaca database.

---

### 2. Struktur Database Notion

Berikut daftar kolom/properti yang harus dibuat untuk masing-masing database:

#### A. Database Blog (`NOTION_BLOG_DB_ID`)
Digunakan untuk artikel blog dan berita perusahaan.

| Nama Properti | Tipe Kolom (Notion) | Keterangan / Contoh Nilai |
| :--- | :--- | :--- |
| `Title` | **Title** *(Default)* | Judul artikel (e.g. *Tips Memilih Mutu Beton*) |
| `Slug` | **Rich Text** | URL slug unik (e.g. *tips-memilih-beton*) |
| `Excerpt` | **Rich Text** | Ringkasan singkat untuk kartu preview |
| `Status` | **Status** / **Select** | Status publikasi. Modul memfilter record dengan nilai `Published` |
| `Published Date` | **Date** | Tanggal publikasi (digunakan untuk pengurutan terbaru) |
| `Author` | **Rich Text** / **Select** | Nama penulis artikel (e.g. *Admin*, *Tim Teknis*) |
| `Category` | **Select** | Kategori artikel (e.g. *Tips Konstruksi*, *Inovasi*) |
| `Cover Image` | **Files & media** | Foto sampul (opsional, fallback ke page cover Notion) |

*Catatan: Konten utama / isi lengkap artikel ditulis langsung di dalam **Page Body** (badan halaman) Notion. Modul akan otomatis me-render blok Notion menggunakan komponen `<NotionBody />`.*

---

#### B. Database Produk (`NOTION_PRODUCT_DB_ID`)
Digunakan untuk katalog produk material / precast.

| Nama Properti | Tipe Kolom (Notion) | Keterangan / Contoh Nilai |
| :--- | :--- | :--- |
| `Product Name` / `Title` | **Title** *(Default)* | Nama produk (e.g. *U-Ditch Beton*, *Box Culvert*) |
| `Slug` | **Rich Text** | URL slug produk (e.g. *u-ditch*) |
| `Short Description` | **Rich Text** | Deskripsi singkat produk |
| `Category` | **Select** | Kategori produk (e.g. *Materials*, *Precast*) |
| `Price` | **Number** | Harga satuan produk (e.g. `450000`) |
| `Status` | **Select** / **Status** | Status visibilitas (e.g. `Visible`) |
| `Display Order` | **Number** | Urutan tampilan katalog (e.g. `1`, `2`, `3`) |
| `Features` | **Multi-select** / **Rich Text** | Poin keunggulan (dipisahkan baris baru jika text) |
| `Specifications` | **Rich Text** | Spesifikasi teknis (format baris `Kunci: Nilai` atau format JSON) |
| `Main Image` | **Files & media** | Foto utama produk |
| `Gallery` | **Files & media** | Kumpulan foto produk tambahan (Multiple files) |

---

#### C. Database Landing Content (`NOTION_CONTENT_DB_ID`)
Struktur sederhana berbasis *Key-Value* untuk konten teks dinamis landing page.

| Nama Properti | Tipe Kolom (Notion) | Keterangan |
| :--- | :--- | :--- |
| `Name` | **Title** *(Default)* | Nama kunci konten (Lihat daftar kunci di bawah) |
| `Content` | **Rich Text** | Teks konten yang akan ditampilkan |

**Daftar Baris `Name` yang Didukung:**
- `Hero Title`
- `Hero Subtitle`
- `Nomor HP`
- `Email`
- `Alamat`
- `Linkedin`
- `Facebook`
- `Instagram`

---

### 3. Cara Mendapatkan Database ID
Buka database yang bersangkutan di web browser. Salin ID 32-karakter dari URL database:
```
https://www.notion.so/workspace-name/a8aec43384f447ed84390e8e42c2e089?v=...
                                      ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                                           Ini adalah Database ID
```

---

## 🛠 Setup API Routes di Next.js App Router

### 1. Notion Image Proxy: `src/app/api/notion-image/route.ts`
```typescript
import { NextRequest } from "next/server";
import { handleNotionImageProxy } from "@/modules/cms";

export async function GET(request: NextRequest) {
  return handleNotionImageProxy(request);
}
```

### 2. Cache Renew Handler: `src/app/api/renew/route.ts`
```typescript
import { NextRequest } from "next/server";
import { handleGetCacheStatus, handlePostRenewCache } from "@/modules/cms";

export const dynamic = "force-dynamic";

export async function GET() {
  return handleGetCacheStatus();
}

export async function POST(request: NextRequest) {
  return handlePostRenewCache(request);
}
```

---

## 📖 Contoh Penggunaan di Komponen & Halaman

### Mengambil Data Blog
```typescript
import { getBlogPosts, getBlogPostBySlug } from "@/modules/cms";

export default async function BlogPage() {
  const posts = await getBlogPosts();
  return (
    <div>
      {posts.map((post) => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.excerpt}</p>
        </article>
      ))}
    </div>
  );
}
```

### Render Rich Content Notion di Halaman Detail
```typescript
import { getBlogPostBySlug, NotionBody } from "@/modules/cms";
import { notFound } from "next/navigation";

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getBlogPostBySlug(params.slug);
  if (!post) notFound();

  return (
    <div>
      <h1>{post.title}</h1>
      {post.recordMap && <NotionBody recordMap={post.recordMap} />}
    </div>
  );
}
```

### Mengambil Katalog Produk
```typescript
import { getProducts, getProductBySlug } from "@/modules/cms";

export default async function ProductsPage() {
  const products = await getProducts();
  return (
    <div>
      {products.map((product) => (
        <div key={product.id}>
          <h3>{product.title}</h3>
          <p>{product.description}</p>
        </div>
      ))}
    </div>
  );
}
```
