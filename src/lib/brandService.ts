import { prisma } from './prisma';
import { Brand } from '@prisma/client';
import { MasterDataItem } from './types';

const mapToMasterDataItem = (brand: Brand): MasterDataItem => ({
  id: brand.id.toString(),
  name: brand.nama,
  createdAt: brand.createdAt,
  updatedAt: brand.updatedAt,
});

// GET all brands
export const getBrands = async (): Promise<MasterDataItem[]> => {
  const brands = await prisma.brand.findMany();
  return brands.map(mapToMasterDataItem);
};

// CREATE brand
export const createBrand = async (data: { name: string }): Promise<MasterDataItem> => {
  const newBrand = await prisma.brand.create({
    data: {
      nama: data.name,
    },
  });
  return mapToMasterDataItem(newBrand);
};

// UPDATE brand
export const updateBrand = async (id: number, data: { name: string }): Promise<MasterDataItem> => {
  const updatedBrand = await prisma.brand.update({
    where: { id },
    data: {
      nama: data.name,
    },
  });
  return mapToMasterDataItem(updatedBrand);
};

// DELETE brand
export const deleteBrand = async (id: number): Promise<void> => {
  await prisma.brand.delete({
    where: { id },
  });
};