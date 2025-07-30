import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // ==========================
  // 1. USERS
  // ==========================
  const users = await prisma.user.createMany({
    data: [
      { namaLengkap: "Wahyu Ramadhan", email: "wahyu@test.com", departemen: "IT", jabatan: "Developer", lokasiKantor: "HO" },
      { namaLengkap: "Rina Santoso", email: "rina@test.com", departemen: "Finance", jabatan: "Staff", lokasiKantor: "HO" },
    ],
    skipDuplicates: true,
  })

  // ==========================
  // 2. ASSET CATEGORIES
  // ==========================
  const laptopCategory = await prisma.assetCategory.upsert({
    where: { slug: "laptop" },
    update: {},
    create: { nama: "Laptop", slug: "laptop" },
  })

  // ==========================
  // 3. LAPTOP OPTION TABLES (MINIMAL)
  // ==========================
  const brand = await prisma.laptopBrandOption.upsert({
    where: { value: "Dell" },
    update: {},
    create: { value: "Dell" },
  })

  const processor = await prisma.laptopProcessorOption.upsert({
    where: { value: "Intel i5" },
    update: {},
    create: { value: "Intel i5" },
  })

  const ram = await prisma.laptopRamOption.upsert({
    where: { value: "16GB" },
    update: {},
    create: { value: "16GB" },
  })

  const storage = await prisma.laptopStorageTypeOption.upsert({
    where: { value: "SSD" },
    update: {},
    create: { value: "SSD" },
  })

  const os = await prisma.laptopOsOption.upsert({
    where: { value: "Windows 11 Pro" },
    update: {},
    create: { value: "Windows 11 Pro" },
  })

  // ==========================
  // 4. ASSET + LAPTOP SPECS
  // ==========================
  const asset = await prisma.asset.create({
    data: {
      namaAsset: "Laptop Dell XPS 13",
      categoryId: laptopCategory.id,
      merk: "Dell",
      model: "XPS 13 2022",
      nomorSeri: "SN123456789",
      statusAsset: "TERSEDIA",
      lokasiFisik: "Gudang HO",
      laptopSpecs: {
        create: {
          brandOptionId: brand.id,
          processorOptionId: processor.id,
          ramOptionId: ram.id,
          storageTypeOptionId: storage.id,
          osOptionId: os.id,
          macWlan: "AA:BB:CC:DD:EE:01",
          macLan: "AA:BB:CC:DD:EE:02",
        }
      }
    }
  })

  // ==========================
  // 5. ASSET ASSIGNMENT
  // ==========================
  const assignment = await prisma.assetAssignment.create({
    data: {
      assetId: asset.id,
      userId: 1, // Wahyu
      tanggalPeminjaman: new Date(),
      kondisiSaatPeminjaman: "Baik",
      nomorAsset: "AST-001",
    }
  })

  // ==========================
  // 6. SERVICE RECORD
  // ==========================
  await prisma.serviceRecord.create({
    data: {
      ticketHelpdesk: "HD-0001",
      repairType: "INTERNAL",
      cost: 0,
      remarks: "Cek rutin",
      assetAssignmentId: assignment.id,
    }
  })

  console.log("✅ Seed berhasil dijalankan!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
