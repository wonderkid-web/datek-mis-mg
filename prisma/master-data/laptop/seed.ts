import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // Laptop RAM Options
  const ramOptions = ["4GB", "8GB", "16GB", "32GB", "64GB"]
  for (const value of ramOptions) {
    await prisma.laptopRamOption.upsert({
      where: { value },
      update: {},
      create: { value },
    })
  }

  // Laptop Processor Options
  const processorOptions = [
    "Intel i3", "Intel i5", "Intel i7", "Intel i9",
    "AMD Ryzen 3", "AMD Ryzen 5", "AMD Ryzen 7", "Apple M1", "Apple M2"
  ]
  for (const value of processorOptions) {
    await prisma.laptopProcessorOption.upsert({
      where: { value },
      update: {},
      create: { value },
    })
  }

  // Laptop Storage Type Options
  const storageOptions = ["HDD", "SSD", "Hybrid SSHD", "NVMe SSD"]
  for (const value of storageOptions) {
    await prisma.laptopStorageTypeOption.upsert({
      where: { value },
      update: {},
      create: { value },
    })
  }

  // Laptop OS Options
  const osOptions = [
    "Windows 10 Pro", "Windows 11 Pro",
    "Ubuntu 22.04", "MacOS Ventura", "MacOS Sonoma"
  ]
  for (const value of osOptions) {
    await prisma.laptopOsOption.upsert({
      where: { value },
      update: {},
      create: { value },
    })
  }

  // Laptop Power Options (adaptor / daya)
  const powerOptions = ["45W", "65W", "90W", "120W", "USB-C 65W PD"]
  for (const value of powerOptions) {
    await prisma.laptopPowerOption.upsert({
      where: { value },
      update: {},
      create: { value },
    })
  }

  // Laptop Microsoft Office Options
  const officeOptions = [
    "Office 2016", "Office 2019", "Office 2021", "Office 365", "LibreOffice"
  ]
  for (const value of officeOptions) {
    await prisma.laptopMicrosoftOfficeOption.upsert({
      where: { value },
      update: {},
      create: { value },
    })
  }

  // Laptop Color Options
  const colorOptions = ["Black", "Silver", "Gray", "White", "Blue"]
  for (const value of colorOptions) {
    await prisma.laptopColorOption.upsert({
      where: { value },
      update: {},
      create: { value },
    })
  }

  // Laptop Brand Options
  const brandOptions = [
    "Acer", "Asus", "Dell", "HP", "Lenovo", "MSI", "Apple"
  ]
  for (const value of brandOptions) {
    await prisma.laptopBrandOption.upsert({
      where: { value },
      update: {},
      create: { value },
    })
  }

  // Laptop Type Options
  const typeOptions = ["Ultrabook", "Gaming", "Workstation", "2-in-1", "Netbook"]
  for (const value of typeOptions) {
    await prisma.laptopTypeOption.upsert({
      where: { value },
      update: {},
      create: { value },
    })
  }

  // Laptop Graphic Options
  const graphicOptions = [
    "Intel UHD Graphics", "Intel Iris Xe", "NVIDIA GTX 1650", 
    "NVIDIA RTX 3050", "AMD Radeon RX 6600M", "Apple M1 GPU"
  ]
  for (const value of graphicOptions) {
    await prisma.laptopGraphicOption.upsert({
      where: { value },
      update: {},
      create: { value },
    })
  }

  // Laptop VGA Options
  const vgaOptions = [
    "HDMI", "Mini DisplayPort", "DisplayPort", "USB-C Alt Mode", "VGA Legacy"
  ]
  for (const value of vgaOptions) {
    await prisma.laptopVgaOption.upsert({
      where: { value },
      update: {},
      create: { value },
    })
  }

  console.log("✅ Seeder Laptop Options berhasil dijalankan!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
