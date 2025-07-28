import { prisma } from './prisma';
import { AssetCategory } from '@prisma/client';
import { MasterDataItem } from './types';

const mapToMasterDataItem = (assetType: AssetCategory): MasterDataItem => ({
  id: assetType.id.toString(),
  name: assetType.nama,
  createdAt: assetType.createdAt,
  updatedAt: assetType.updatedAt,
});

// GET all asset types
export const getAssetTypes = async (): Promise<MasterDataItem[]> => {
  const assetTypes = await prisma.assetCategory.findMany();
  return assetTypes.map(mapToMasterDataItem);
};

// CREATE asset type
export const createAssetType = async (data: { name: string }): Promise<MasterDataItem> => {
  const newAssetType = await prisma.assetCategory.create({
    data: {
      nama: data.name,
      slug: data.name.toLowerCase().replace(/ /g, '-'), // Generate slug from name
    },
  });
  return mapToMasterDataItem(newAssetType);
};

// UPDATE asset type
export const updateAssetType = async (id: number, data: { name: string }): Promise<MasterDataItem> => {
  const updatedAssetType = await prisma.assetCategory.update({
    where: { id },
    data: {
      nama: data.name,
      slug: data.name.toLowerCase().replace(/ /g, '-'), // Update slug as well
    },
  });
  return mapToMasterDataItem(updatedAssetType);
};

// DELETE asset type
export const deleteAssetType = async (id: number): Promise<void> => {
  await prisma.assetCategory.delete({
    where: { id },
  });
};