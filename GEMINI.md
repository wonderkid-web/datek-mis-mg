# Konteks Proyek untuk Gemini

Dokumen ini bertujuan untuk memberikan konteks yang diperlukan kepada Gemini agar dapat membantu pengembangan proyek ini secara efisien.

## 1. Deskripsi Proyek

*   **Tujuan Utama:**
    `aku ingin ngebuat aplikasi web yang manage dan monitoring stock move dari suatu barang (umumnya sih barang barang IT di kantor gitu) antar SBU, karna aku ini bekerja di   perusahaan PKS dimana aku ini di holding nya`
*   **Fitur Inti:** 
    1.  Authentikasi pengguna.
    2.  Halaman dasbor modern dengan visualisasi data (grafik) untuk memonitor aktivitas stok.
    3.  Manajemen data barang (CRUD).
    4.  Manajemen dan pelacakan riwayat pergerakan stok (CRUD).
    5.  Peringatan stok rendah.

## 2. Tumpukan Teknologi (Tech Stack)

*   **Bahasa Pemrograman:** TypeScript
*   **Framework/Library Utama:**
    *   Next.js 15 (App Router)
    *   React
    *   Recharts (untuk visualisasi data/grafik)
*   **Database:** Firestore (dengan operasi data real-time)
*   **Package Manager:** bun
*   **Styling:**
    *   Tailwind CSS
    *   shadcn/ui

## 3. Struktur Proyek

    ├── src/
    │   ├── app/
    │   │   ├── (halaman-utama)/
    │   │   │   ├── page.tsx        # Halaman Dasbor Utama
    │   │   ├── items/
    │   │   │   └── page.tsx        # Halaman Manajemen Item
    │   │   └── stock-moves/
    │   │       └── page.tsx        # Halaman Manajemen Pergerakan Stok
    │   ├── components/
    │   │   ├── charts/             # Komponen grafik Recharts
    │   │   │   ├── ItemsBySbuChart.tsx
    │   │   │   ├── FrequentItemsChart.tsx
    │   │   │   └── StockMoveTrendChart.tsx
    │   │   └── ui/                 # Komponen dari shadcn/ui
    │   └── lib/
    │       ├── firebase.ts         # Konfigurasi koneksi Firebase
    │       ├── itemService.ts      # Logika bisnis untuk data item
    │       ├── stockMoveService.ts # Logika bisnis untuk pergerakan stok
    │       └── types.ts            # Definisi tipe data TypeScript
    ├── public/
    └── package.json

## 4. Perintah-Perintah Penting

*   **Instalasi Dependensi:** `bun install`
*   **Menjalankan Proyek (Development):** `bun run dev`
*   **Membangun Proyek (Build):** `bun run build`
*   **Linting & Formatting:** `bun run lint`

## 5. Arsitektur & Konvensi Koding

*   **Gaya Koding:** Kode yang bersih dan mudah dibaca.
*   **Konvensi Penamaan:** `camelCase` untuk variabel dan fungsi.
*   **Komentar:** Komentar yang jelas dan ringkas untuk logika yang kompleks.
*   **Integritas Data:**
    *   **Soft Deletes:** Item tidak dihapus secara permanen dari database. Sebaliknya, mereka ditandai dengan `isDeleted: true` untuk menjaga integritas data historis.
    *   **Denormalisasi:** Untuk memastikan data historis tidak berubah, nama item (`itemName`) disalin dan disimpan di dalam setiap catatan `stock_move` pada saat transaksi dibuat.

## 6. Informasi Tambahan
    1. Nama aplikasi: Datek Holding
    2. Warna primer: `#00612c`
