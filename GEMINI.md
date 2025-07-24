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


### SAMPLE DATA ###
type stockMoves = {
  assetNumber: string;
  createdAt: Date;
  department: string;
  guaranteeDate: Date;
  ipAddress: string;
  item: string;
  remote: string;
  sbu: string;
  user: string;
};

type Users = {
    createdAt: Date
    name: string
}

type Departments = {
    createdAt: Date
    name: string
}

type Items = {
  name: string;
  description: string;
  quantity: number;
  minQuantity: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
};



### FORM INPUT ITEMS
1. sekarang, form input items ini tidak lagi membutuhkan QTY atau Min QTY.. jadi alur form ini sbnrny gini,
kita ini engga menambahkan jenis asset baru, karna jenis-jenis asset itu, sudah di tetapkan di variable unit (dibawah ini kan ada aku buat variable Unit).. dimana setiap menambahkan informasi asset baru.. akan ada input2 dibawah ini, dimana masing2 input tersebut berbentuk select ya.. ditambah lagi select user yg didapat dari data user yah..

const Category = [
  { type: 1, description: "HO" },
  { type: 2, description: "RO" },
  { type: 3, description: "MILL" },
  { type: 4, description: "ESTATE" },
  { type: 5, description: "RAMP" },
  { type: 6, description: "REFINERY" }
];

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

const Location = [
  { type: 1, description: "OFFICE" },
  { type: 2, description: "MESS" },
  { type: 3, description: "PABRIK" },
  { type: 4, description: "KEBUN" },
  { type: 5, description: "AFDELING OFFICE" },
  { type: 6, description: "RAMP" },
  { type: 7, description: "REFINERY" }
];

const Status = [
  { type: "01", description: "GOOD" },
  { type: "02", description: "NEED REPARATION" },
  { type: "03", description: "BROKEN" },
  { type: "04", description: "MISSING" },
  { type: "05", description: "SELL" },
  { type: "06", description: "LEASED TO SBU" }
];

const Unit = [
  { type: "BL-G01", description: "AULA" },
  { type: "BL-G02", description: "BANGUNAN GUDANG" },
  { type: "BL-G03", description: "BANGUNAN KANTIN" },
  { type: "BL-G04", description: "BANGUN KANTOR" },
  // ... continue all the way to:
  { type: "MU-G12", description: "LINER" }
];