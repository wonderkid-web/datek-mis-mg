import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export interface LaptopOsOption {
  id: number
  value: string
  createdAt?: Date
  updatedAt?: Date
}

export interface UpdateLaptopOsOptionData {
  value: string
}

export async function updateLaptopOsOption(id: number, data: UpdateLaptopOsOptionData): Promise<LaptopOsOption> {
  try {
    const laptopOsOption = await prisma.laptopOsOption.update({
      where: { id },
      data,
    })
    return laptopOsOption
  } catch (error) {
    console.error("Error updating laptop OS option:", error)
    throw error
  }
}

export async function deleteLaptopOsOption(id: number): Promise<void> {
  try {
    await prisma.laptopOsOption.delete({
      where: { id },
    })
  } catch (error) {
    console.error("Error deleting laptop OS option:", error)
    throw error
  }
}

export async function getLaptopOsOptionById(id: number): Promise<LaptopOsOption | null> {
  try {
    const laptopOsOption = await prisma.laptopOsOption.findUnique({
      where: { id },
    })
    return laptopOsOption
  } catch (error) {
    console.error("Error fetching laptop OS option:", error)
    throw error
  }
}

export async function getAllLaptopOsOptions(): Promise<LaptopOsOption[]> {
  try {
    const laptopOsOptions = await prisma.laptopOsOption.findMany({
      orderBy: { value: "asc" },
    })
    return laptopOsOptions
  } catch (error) {
    console.error("Error fetching laptop OS options:", error)
    throw error
  }
}
