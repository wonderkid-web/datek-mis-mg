"use server";
import { prisma } from './prisma';
import { AssetCategory } from '@prisma/client';

// GET all asset categories
export const getAssetCategories = async (): Promise<AssetCategory[]> => {
  return await prisma.assetCategory.findMany();
};

// CREATE asset category
export const createAssetCategory = async (data: { nama: string }): Promise<AssetCategory> => {
  return await prisma.assetCategory.create({
    data: {
      nama: data.nama,
      slug: data.nama.toLowerCase().replace(/ /g, '-'), // Generate slug from name
    },
  });
};

// UPDATE asset category
export const updateAssetCategory = async (id: number, data: { nama: string }): Promise<AssetCategory> => {
  return await prisma.assetCategory.update({
    where: { id },
    data: {
      nama: data.nama,
      slug: data.nama.toLowerCase().replace(/ /g, '-'), // Update slug as well
    },
  });
};

// DELETE asset category (soft delete)
export const deleteAssetCategory = async (id: string): Promise<AssetCategory> => {
  return await prisma.assetCategory.update({
    where: { id },
    data: { isDeleted: true, deletedAt: new Date() },
  });
};