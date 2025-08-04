// @ts-nocheck
"use server";
import { prisma } from "./prisma";
import { revalidatePath } from "next/cache";
import { AssetAssignment, Prisma } from "@prisma/client";

export const getAssignments = async (): Promise<AssignmentWithRelations[]> => {
  return prisma.assetAssignment.findMany({
    include: {
      user: true,
      asset: {
        include: {
          laptopSpecs: {
            include: {
              brandOption: true,
              colorOption: true,
              microsoftOfficeOption: true,
              osOption: true,
              powerOption: true,
              processorOption: true,
              ramOption: true,
              storageTypeOption: true,
              typeOption: true,
              graphicOption: true,
              vgaOption: true,
              licenseOption: true,
            },
          },
          intelNucSpecs: {
            include: {
              brandOption: true,
              colorOption: true,
              microsoftOfficeOption: true,
              osOption: true,
              powerOption: true,
              processorOption: true,
              ramOption: true,
              storageTypeOption: true,
              typeOption: true,
              graphicOption: true,
              vgaOption: true,
              licenseOption: true,
            },
          },
        },
      },
    },
  });
};


export const getAssignmentById = async (
  id: number
): Promise<AssetAssignment | null> => {
  return await prisma.assetAssignment.findUnique({
    where: { id },
    include: {
      asset: {
        select: {
          id: true,
          namaAsset: true,
          categoryId: true,
          nomorSeri: true,
          tanggalPembelian: true,
          tanggalGaransi: true,
          statusAsset: true,
          lokasiFisik: true,
          createdAt: true,
          updatedAt: true,
          category: { select: { id: true, nama: true, slug: true } },
          laptopSpecs: {
            select: {
              macWlan: true,
              macLan: true,
              brandOption: { select: { value: true } },
              colorOption: { select: { value: true } },
              microsoftOfficeOption: { select: { value: true } },
              osOption: { select: { value: true } },
              powerOption: { select: { value: true } },
              processorOption: { select: { value: true } },
              ramOption: { select: { value: true } },
              storageTypeOption: { select: { value: true } },
              typeOption: { select: { value: true } },
              graphicOption: { select: { value: true } },
              vgaOption: { select: { value: true } },
              licenseOption: { select: { value: true } },
            },
          },
        },
      },
      user: {
        select: {
          id: true,
          namaLengkap: true,
          email: true,
          departemen: true,
          jabatan: true,
        },
      },
    },
  });
};

export const createAssignment = async (data: {
  assetId: number;
  userId: number;
  catatan?: string | null;
  nomorAsset?: string | null;
}): Promise<AssetAssignment> => {
  const { assetId, userId, catatan, nomorAsset } = data;
  return await prisma.assetAssignment.create({
    data: {
      catatan,
      nomorAsset,
      asset: {
        connect: { id: assetId },
      },
      user: {
        connect: { id: userId },
      },
    },
  });
  revalidatePath("/data-center/assets");
};

export const updateAssignment = async (
  id: number,
  data: {
    assetId?: number;
    userId?: number;
    catatan?: string | null;
    nomorAsset?: string | null;
  }
): Promise<AssetAssignment> => {
  const { assetId, userId, catatan, nomorAsset } = data;

  const updateData: Prisma.AssetAssignmentUpdateInput = { catatan, nomorAsset }; // Start with rest of the data

  if (assetId !== undefined) {
    updateData.asset = { connect: { id: assetId } };
  }
  if (userId !== undefined) {
    updateData.user = { connect: { id: userId } };
  }

  return await prisma.assetAssignment.update({
    where: { id },
    data: updateData,
  });
};

export const deleteAssignment = async (id: number): Promise<void> => {
  await prisma.assetAssignment.delete({
    where: { id },
  });
};
