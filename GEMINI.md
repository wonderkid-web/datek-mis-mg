# Konteks Proyek untuk Gemini

Dokumen ini bertujuan untuk memberikan konteks yang diperlukan kepada Gemini agar dapat membantu pengembangan proyek ini secara efisien.

## 1. Deskripsi Proyek

- **Tujuan Utama:**
  Ingin membangun website tracking aset dengan fokus utama mencatat aset apa saja yang dimiliki oleh setiap user (karyawan) di perusahaan kelapa sawitmu.
- **Tantangan Atribut Bervariasi**
  kemudian mengangkat tantangan utama: jenis aset yang berbeda (laptop, printer, dll.) memiliki spesifikasi yang berbeda-beda (misal: RAM di laptop tapi tidak di printer). Kamu bertanya apakah ini berarti harus ada tabel terpisah per jenis aset (table_asset_laptop, table_asset_printer).
- **Pendekatan Hibrida (Common + Specific Tables - Direkomendasikan)**
  Menggunakan satu tabel assets untuk atribut umum, dan tabel terpisah (laptop_specs, printer_specs, dll.) untuk atribut spesifik yang unik per kategori aset. Ini menjaga integritas data dan performa query.
- **Klarifikasi Kebutuhan Input Standar**
  Kamu mengklarifikasi bahwa nilai untuk spesifikasi tertentu (misal: RAM) tidak boleh berupa input bebas, melainkan select dropdown dari daftar nilai yang bisa di-CRUD oleh admin.
- **Refinasi Skema dengan Lookup Tables:**
  Berdasarkan klarifikasi ini, Pendekatan Hibrida diperkuat dengan penambahan Tabel Lookup (Master Data). Untuk setiap atribut yang membutuhkan select dan CRUD pada opsi-opsinya (misal: ram_options, processor_options, storage_type_options), akan dibuat tabel terpisah. Tabel spesifikasi aset (misal laptop_specs) kemudian akan memiliki Foreign Key ke tabel-tabel lookup ini.

## 2. Tumpukan Teknologi (Tech Stack)

- **Bahasa pemrograman:** TypeScript
- **Framework/Library Utama:**
  - Next.js 15 (App Router)
  - React
  - Recharts (untuk visualisasi data/grafik)
  - @tanstack/react-table (untuk manajemen tabel data)
- **Database:** MySQL
- **ORM:** Prisma
- **Package Manager:** bun
- **Styling:**
  - Tailwind CSS
  - shadcn/ui

## 3. Struktur Proyek

app/
├── (auth)/ <-- Kelompok routing untuk autentikasi
│ ├── login/
│ │ └── page.tsx
│ ├── register/ <-- Opsional, jika ada pendaftaran user
│ │ └── page.tsx
│
├── (main)/ <-- Kelompok routing utama aplikasi
│ ├── layout.tsx <-- Layout utama aplikasi (sidebar, header, footer)
│ ├── dashboard/
│ │ └── page.tsx <-- Halaman utama setelah login
│ │
│ ├── assets/
│ │ ├── page.tsx <-- /assets (Daftar semua aset)
│ │ ├── add/
│ │ │ └── page.tsx <-- /assets/add (Form tambah aset baru)
│ │ └── [assetId]/
│ │ ├── page.tsx <-- /assets/[assetId] (Detail aset)
│ │ └── edit/
│ │ └── page.tsx <-- /assets/[assetId]/edit (Form edit aset)
│ │
│ ├── users/
│ │ ├── page.tsx <-- /users (Daftar semua karyawan/pengguna)
│ │ ├── add/
│ │ │ └── page.tsx <-- /users/add (Form tambah karyawan baru)
│ │ └── [userId]/
│ │ ├── page.tsx <-- /users/[userId] (Detail karyawan)
│ │ └── edit/
│ │ └── page.tsx <-- /users/[userId]/edit (Form edit karyawan)
│ │
│ ├── assignments/
│ │ ├── page.tsx <-- /assignments (Daftar semua peminjaman/assignment)
│ │ ├── new/
│ │ │ └── page.tsx <-- /assignments/new (Form buat assignment baru)
│ │ └── [assignmentId]/
│ │ └── page.tsx <-- /assignments/[assignmentId] (Detail assignment)
│ │
(admin)/
└── master-data/
    ├── asset-categories/
    │   └── page.tsx        <-- Tetap terpisah karena ini kategori umum
    │
    ├── laptop/
    │   └── page.tsx        <-- /admin/master-data/laptop
    │                       <-- Halaman ini akan berisi Tabs:
    │                       <--   - Tab "RAM Options"
    │                       <--   - Tab "Processor Options"
    │                       <--   - Tab "Storage Type Options"
    │                       <--   - Tab "OS Options"
    │                       <--   - Tab "Port Options"
    │                       <--   - Tab "Power Options"
    │                       <--   - Tab "Microsoft Office Options"
    │                       <--   - Tab "Color Options"
    │
    # ... nanti jika ada jenis aset lain dengan master data spesifik (misal: printer)
    # ├── printer/
    # │   └── page.tsx      <-- /admin/master-data/printer (jika ada spesifikasi khusus printer yang pakai lookup)
│ │
│ └── reports/ <-- Opsional: Halaman laporan khusus admin
│ ├── page.tsx <-- /admin/reports (Dashboard laporan)
│ ├── by-department/
│ │ └── page.tsx
│ └── overdue/
│ └── page.tsx
│
├── favicon.ico
├── globals.css
└── page.tsx

## 4. Perintah-Perintah Penting

- **Instalasi Dependensi:** `bun install`
- **Menjalankan Proyek (Development):** `bun run dev`
- **Membangun Proyek (Build):** `bun run build`
- **Linting & Formatting:** `bun run lint`

## 5. Arsitektur & Konvensi Koding

- **Gaya Koding:** Kode yang bersih dan mudah dibaca.
- **Konvensi Penamaan:** `camelCase` untuk variabel dan fungsi.
- **Komentar:** Komentar yang jelas dan ringkas untuk logika yang kompleks.
- **Integritas Data:**
  - **Soft Deletes:** Item tidak dihapus secara permanen dari database. Sebaliknya, mereka ditandai dengan `isDeleted: true` untuk menjaga integritas data historis.
  - **Denormalisasi:** Untuk memastikan data historis tidak berubah, nama item (`itemName`) disalin dan disimpan di dalam setiap catatan `stock_move` pada saat transaksi dibuat.

## 6. Informasi Tambahan

    1. Nama aplikasi: Datek Holding
    2. Warna primer: `#00612c`

const Company = [
{ type: "BIP", description: "BIM PALEMBANG" },
{ type: "BIR", description: "BIM R" },
{ type: "BIS", description: "BIM S" },
{ type: "DPA", description: "DPA" },
{ type: "ISA", description: "ISA" },
{ type: "ISR", description: "REFINERY" },
{ type: "KCR", description: "KCRI" },
{ type: "KMA", description: "KMA" },
{ type: "KPN", description: "KPNJ" },
{ type: "MAS", description: "MAS" },
{ type: "MGP", description: "MG" },
{ type: "MUL", description: "MUL" },
{ type: "YMI", description: "YMI" }
];

const Department = [
{ type: "01", description: "PROPERTI UMUM" },
{ type: "02", description: "MANAGER" },
{ type: "03", description: "WORKSHOP" },
{ type: "04", description: "ADM & GENERAL" },
{ type: "05", description: "MAINTENANCE" },
// ...continue until "58": "SMI"
{ type: "58", description: "SMI" }
];

const Status = [
,"GOOD"
,"NEED REPARATION"
,"BROKEN"
,"MISSING"
,"SELL"

];
