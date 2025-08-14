# Konteks Proyek untuk Gemini

Dokumen ini bertujuan untuk memberikan konteks dari website ini, agar dapat membantu pengembangan proyek ini secara efisien.

## 1. Deskripsi Proyek

- **Tujuan Utama:**
  Membangun website tracking aset dengan fokus utama mencatat aset apa saja yang dimiliki oleh setiap user (karyawan) di perusahaan kelapa sawit.

- **Alur Kerja Aset:**
  - **Penambahan Aset Baru:** Dilakukan melalui halaman `/items/laptop` (untuk aset jenis laptop) dan `/items/intel-nuc` (untuk aset jenis Intel NUC). Halaman-halaman ini berfungsi sebagai formulir lengkap untuk menambahkan detail aset dan spesifikasi masing-masing.
  - **Manajemen Aset Umum:** Dilakukan melalui halaman `/data-center/assets`. Halaman ini menampilkan daftar semua aset, memungkinkan pengeditan dasar aset, penghapusan aset, dan penugasan aset kepada pengguna.
  - **Manajemen Penugasan Aset:** Dilakukan melalui halaman `/data-center/assigned-assets`. Halaman ini menampilkan daftar semua penugasan aset (aset yang sudah diberikan kepada pengguna) dengan fungsionalitas CRUD penuh untuk penugasan tersebut.

- **Tantangan Atribut Bervariasi & Pendekatan Hibrida:**
  Jenis aset yang berbeda (laptop, Intel NUC, printer, dll.) memiliki spesifikasi yang berbeda-beda (misal: RAM di laptop tapi tidak di printer). Menggunakan satu tabel `assets` untuk atribut umum, dan tabel terpisah (`laptop_specs`, `intel_nuc_specs`, `printer_specs`, dll.) untuk atribut spesifik yang unik per kategori aset. Ini menjaga integritas data dan performa query.

- **Klarifikasi Kebutuhan Input Standar & Lookup Tables:**
  Nilai untuk spesifikasi tertentu (misal: RAM) tidak boleh berupa input bebas, melainkan select dropdown dari daftar nilai yang bisa di-CRUD oleh admin. Untuk setiap atribut yang membutuhkan select dan CRUD pada opsi-opsinya (misal: `ram_options`, `processor_options`, `storage_type_options`), akan dibuat tabel terpisah. Tabel spesifikasi aset (misal `laptop_specs`) kemudian akan memiliki Foreign Key ke tabel-tabel lookup ini.

## 2. Tumpukan Teknologi (Tech Stack)

- **Bahasa pemrograman:** TypeScript
- **Framework/Library Utama:**
  - Next.js 15 (App Router)
  - React
  - Recharts (untuk visualisasi data/grafik)
  - @tanstack/react-table (untuk manajemen tabel data)
  - Sonner (untuk notifikasi toast)
- **Database:** MySQL
- **ORM:** Prisma
- **Package Manager:** bun
- **Styling:**
  - Tailwind CSS
  - shadcn/ui

## 3. Struktur Proyek

```
app/
├── (auth)/ 
│ ├── login/
│ │ └── page.tsx
│ ├── register/
│ │ └── page.tsx
│
├── (main)/
│ ├── layout.tsx 
│ ├── dashboard/
│ │ └── page.tsx 
│ │
│ ├── items/
│ │ └── laptop/
│ │     ├── page.tsx <-- /items/laptop (Form tambah aset laptop baru)
│ │     └── [laptopId]/
│ │         └── edit/
│ │             └── page.tsx <-- /items/laptop/[laptopId]/edit (Form edit spesifikasi laptop)
│ │ └── intel-nuc/
│ │     ├── page.tsx <-- /items/intel-nuc (Form tambah aset Intel NUC baru)
│ │     └── [intelNucId]/
│ │         └── edit/
│ │             └── page.tsx <-- /items/intel-nuc/[intelNucId]/edit (Form edit spesifikasi Intel NUC)
│ │
│ ├── employee/
│ │ ├── add-user-dialog.tsx
│ │ ├── columns.tsx
│ │ ├── edit-user-dialog.tsx
│ │ └── page.tsx <-- /employee (Daftar semua karyawan/pengguna)
│ │
│ ├── data-center/
│ │ ├── page.tsx
│ │ ├── assets/
│ │ │   ├── page.tsx <-- /data-center/assets (Daftar semua aset, edit dasar, hapus, assign)
│ │ │   ├── columns.tsx
│ │ │   ├── edit-asset-dialog.tsx
│ │ │   └── assign-asset-dialog.tsx
│ │ └── assigned-assets/
│ │     ├── page.tsx <-- /data-center/assigned-assets (Daftar semua penugasan aset, CRUD penugasan)
│ │     ├── columns.tsx
│ │     ├── edit-assignment-dialog.tsx
│ │     └── view-assignment-dialog.tsx
│ │
│ ├── master-data/
│ │   ├── asset-categories/
│ │   │   └── page.tsx
│ │   └── laptop/
│ │       └── page.tsx
│ │
│ └── service-records/
│     ├── columns.tsx
│     └── page.tsx
│
├── favicon.ico
├── globals.css
└── page.tsx
```

## 4. Perintah-Perintah Penting

- **Instalasi Dependensi:** `bun install`
- **Menjalankan Proyek (Development):** `bun run dev`
- **Membangun Proyek (Build):** `bun run build`
- **Linting & Formatting:** `bun run lint`
- **Migrasi Prisma:** `bun prisma migrate dev` (diperlukan setelah perubahan skema di `prisma/schema.prisma`)

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

```typescript
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
  { type: "58", description: "SMI" }
];

const Status = [
  "GOOD",
  "NEED REPARATION",
  "BROKEN",
  "MISSING",
  "SELL"
];
```