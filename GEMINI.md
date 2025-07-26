# Konteks Proyek untuk Gemini

Dokumen ini bertujuan untuk memberikan konteks yang diperlukan kepada Gemini agar dapat membantu pengembangan proyek ini secara efisien.

## 1. Deskripsi Proyek

*   **Tujuan Utama:**
    Aplikasi web ini dirancang untuk mengelola dan memantau pergerakan stok barang (umumnya barang IT kantor) antar Satuan Bisnis Unit (SBU) dalam sebuah perusahaan holding. Aplikasi ini membantu dalam inventarisasi, manajemen aset, dan pelacakan riwayat pergerakan barang.
*   **Fitur Inti:**
    1.  Authentikasi pengguna.
    2.  Halaman dasbor modern dengan visualisasi data (grafik) untuk memonitor aktivitas stok.
    3.  Manajemen data barang (CRUD).
    4.  Manajemen dan pelacakan riwayat pergerakan stok (CRUD).
    

## 2. Tumpukan Teknologi (Tech Stack)

*   **Bahasa pemrograman:** TypeScript
*   **Framework/Library Utama:**
    *   Next.js 15 (App Router)
    *   React
    *   Recharts (untuk visualisasi data/grafik)
    *   @tanstack/react-table (untuk manajemen tabel data)
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
    │   │   │   └── [assetType]/
    │   │   │       └── page.tsx    # Halaman Manajemen Item
    │   │   ├── manufaktur/
    │   │   │   ├── page.tsx
    │   │   │   └── [assetType]/
    │   │   │       └── page.tsx    # Halaman Manufaktur Item
    │   │   ├── master-data/
    │   │   │   └── [assetType]/
    │   │   │       └── page.tsx    # Halaman Master Data Item
    │   │   └── users/
    │   │       └── page.tsx        # Halaman Manajemen Pengguna
    │   ├── components/
    │   │   ├── charts/             # Komponen grafik Recharts
    │   │   │   ├── ItemsBySbuChart.tsx
    │   │   │   ├── FrequentItemsChart.tsx
    │   │   │   └── StockMoveTrendChart.tsx
    │   │   └── ui/                 # Komponen dari shadcn/ui
    │   ├── lib/
    │   │   ├── firebase.ts         # Konfigurasi koneksi Firebase
    │   │   ├── itemService.ts      # Logika bisnis untuk data item
    │   │   ├── stockMoveService.ts # Logika bisnis untuk pergerakan stok
    │   │   ├── userService.ts      # Logika bisnis untuk data pengguna
    │   │   ├── switchService.ts    # Logika bisnis untuk data switch
    │   │   ├── manufactureService.ts # Logika bisnis untuk data manufaktur
    │   │   ├── navigation.ts       # Data navigasi untuk Navbar
    │   │   └── types.ts            # Definisi tipe data TypeScript
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
type Users = {
    createdAt: Date
    name: string
}

type Departments = {
    createdAt: Date
    name: string
}


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


### Children Master Data
TELEPON

SYNOLOGY

NVR CCTV

CAMERA CCTV

SCANNER

FINGERPRINT

SWITCH
  - Type : input
  - Brand: input
  - Port: input
  - Power: input


RADIO

UPS

ROUTER

KOMPUTER

ACCESS POINT

PRINTER

LAPTOP



### Children Manufaktur
TELEPON

SYNOLOGY

NVR CCTV

CAMERA CCTV

SCANNER

FINGERPRINT

SWITCH
  - Type : dropdown yg data nya diambil dari menu children yg ada pada Master Data Switch
  - Brand: dropdown yg data nya diambil dari menu children yg ada pada Master Data Switch
  - Port: dropdown yg data nya diambil dari menu children yg ada pada Master Data Switch
  - Power: dropdown yg data nya diambil dari menu children yg ada pada Master Data Switch
Error saving manufactured switch: ReferenceError: createManufacture is not defined
    at handleSubmit

RADIO

UPS

ROUTER

KOMPUTER

ACCESS POINT

PRINTER

LAPTOP

## 7. Koleksi Firestore

Berikut adalah daftar koleksi Firestore yang digunakan dalam aplikasi ini:

*   **`users`**
    *   **Tujuan:** Menyimpan data pengguna yang dapat mengakses aplikasi.
    *   **Field Penting:** `name` (nama pengguna), `sbu` (Satuan Bisnis Unit), `department` (departemen).

*   **`switches`**
    *   **Tujuan:** Menyimpan master data untuk aset Switch. Data ini digunakan sebagai referensi saat menambahkan aset Switch baru ke inventaris.
    *   **Field Penting:** `type`, `brand`, `port`, `power`.

*   **`manufactures`**
    *   **Tujuan:** Menyimpan data aset yang telah dimanufaktur atau diinventarisasi. Setiap dokumen merepresentasikan satu unit aset fisik.
    *   **Field Penting:** `assetCategory` (kategori aset, misal 'switch', 'komputer'), `model`, `serialNumber`, dan field spesifik lainnya sesuai `assetCategory` (misal `type`, `brand`, `port`, `power` untuk Switch).

*   **`service_records`**
    *   **Tujuan:** Mencatat riwayat servis atau perbaikan untuk aset-aset tertentu.
    *   **Field Penting:** (Perlu dikonfirmasi dari implementasi, namun umumnya akan ada `assetId`, `description`, `serviceDate`, `status`).

*   **`[assetType]` (Koleksi Master Data Dinamis)**
    *   **Tujuan:** Koleksi ini akan menyimpan master data untuk setiap jenis aset yang berbeda (misalnya, `printers`, `laptops`, `telepons`, dll.). Setiap koleksi akan memiliki skema data yang unik sesuai dengan atribut spesifik jenis aset tersebut.
    *   **Contoh:**
        *   `printers`: `brand`, `model`, `type` (misal, inkjet, laser), `color` (misal, mono, color).
        *   `laptops`: `brand`, `model`, `processor`, `ram`, `storage`, `screenSize`.
    *   **Field Penting:** Bergantung pada jenis aset.
