"use server";
import { prisma } from './prisma';
import { revalidatePath } from 'next/cache';
import { AssetAssignment, Prisma } from '@prisma/client';

export const getAssignments = async (): Promise<AssetAssignment[]> => {
  return await prisma.assetAssignment.findMany({
    include: {
      asset: { select: { namaAsset: true} },
      user: { select: { namaLengkap: true } },
    },
    orderBy: {
      tanggalPeminjaman: 'desc'
    }
  });
};

export const getAssignmentById = async (id: number): Promise<AssetAssignment | null> => {
  return await prisma.assetAssignment.findUnique({
    where: { id },
    include: {
      asset: true,
      user: true,
    },
  });
};

export const createAssignment = async (data: {
  assetId: number;
  userId: number;
  tanggalPeminjaman: Date;
  tanggalPengembalian?: Date | null;
  kondisiSaatPeminjaman?: string | null;
  kondisiSaatPengembalian?: string | null;
  catatan?: string | null;
  nomorAsset?: string; // Add nomorAsset here
}): Promise<AssetAssignment> => {
  const { assetId, userId, ...rest } = data; // Destructure userId
  return await prisma.assetAssignment.create({
    data: {
      ...rest,
      asset: {
        connect: { id: assetId },
      },
      user: {
        connect: { id: userId },
      },
    },
  });
  revalidatePath('/data-center/unassigned-users');
};

export const updateAssignment = async (id: number, data: {
  assetId?: number;
  userId?: number;
  tanggalPeminjaman?: Date;
  tanggalPengembalian?: Date | null;
  kondisiSaatPeminjaman?: string | null;
  kondisiSaatPengembalian?: string | null;
  catatan?: string | null;
  nomorAsset?: string; // Add nomorAsset here
}): Promise<AssetAssignment> => {
  const { assetId, userId, ...rest } = data;

  const updateData: Prisma.AssetAssignmentUpdateInput = { ...rest }; // Start with rest of the data

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
