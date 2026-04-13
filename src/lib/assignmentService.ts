// @ts-nocheck
"use server";
import { prisma } from "./prisma";
import { revalidatePath, revalidateTag } from "next/cache";
import { AssetAssignment, Prisma } from "@prisma/client";

const TRACKER_PATHS = [
  "/tracker/laptop",
  "/tracker/intel-nuc",
  "/tracker/pc",
  "/tracker/sparepart",
];

const revalidateAssignmentViews = () => {
  revalidateTag("asset-assignments");
  revalidateTag("asset-assignment-histories");
  revalidatePath("/data-center/assigned-assets");
  revalidatePath("/data-center/assets");
  TRACKER_PATHS.forEach((path) => revalidatePath(path));
};

const closeActiveAssignmentHistory = async (
  tx: Prisma.TransactionClient,
  assetId: number,
  endedAt: Date
) => {
  await tx.assetAssignmentHistory.updateMany({
    where: {
      assetId,
      endedAt: null,
    },
    data: {
      endedAt,
    },
  });
};

const createAssignmentHistory = async (
  tx: Prisma.TransactionClient,
  data: {
    assetId: number;
    userId: number;
    nomorAsset?: string | null;
    catatan?: string | null;
    startedAt: Date;
  }
) => {
  await tx.assetAssignmentHistory.create({
    data: {
      assetId: data.assetId,
      userId: data.userId,
      nomorAsset: data.nomorAsset ?? null,
      catatan: data.catatan ?? null,
      startedAt: data.startedAt,
    },
  });
};

export const getAssignments = async (): Promise<AssignmentWithRelations[]> => {
  return prisma.assetAssignment.findMany({
    include: {
      user: true,
      asset: {
        include: {
          category: true,
          officeAccount: true,
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
          pcSpecs: {
            include: {
              colorOption: true,
              graphicOption: true,
              licenseOption: true,
              microsoftOfficeOption: true,
              monitorOption: true,
              motherboardOption: true,
              osOption: true,
              powerOption: true,
              processorOption: true,
              ramOption: true,
              storageTypeOption: true,
              upsOption: true,
            },
          },
          printerSpecs: {
            include: {
              brandOption: true
            }
          }
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
          intelNucSpecs: {
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
          pcSpecs: {
            select: {
              casing: true,
              macLan: true,
              colorOption: { select: { value: true } },
              graphicOption: { select: { value: true } },
              licenseOption: { select: { value: true } },
              microsoftOfficeOption: { select: { value: true } },
              monitorOption: { select: { value: true } },
              motherboardOption: { select: { value: true } },
              osOption: { select: { value: true } },
              powerOption: { select: { value: true } },
              processorOption: { select: { value: true } },
              ramOption: { select: { value: true } },
              storageTypeOption: { select: { value: true } },
              upsOption: { select: { value: true } },
            },
          },
          officeAccount: {
            select: {
              email: true,
              password: true,
              licenseExpiry: true,
              isActive: true,
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
  const timestamp = new Date();

  const assignment = await prisma.$transaction(async (tx) => {
    const createdAssignment = await tx.assetAssignment.create({
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

    await createAssignmentHistory(tx, {
      assetId,
      userId,
      nomorAsset,
      catatan,
      startedAt: timestamp,
    });

    return createdAssignment;
  });

  revalidateAssignmentViews();
  return assignment;
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

  const timestamp = new Date();

  const updatedAssignment = await prisma.$transaction(async (tx) => {
    const existing = await tx.assetAssignment.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new Error("Assignment not found.");
    }

    const nextAssignment = await tx.assetAssignment.update({
      where: { id },
      data: updateData,
    });

    const identityChanged =
      nextAssignment.assetId !== existing.assetId ||
      nextAssignment.userId !== existing.userId;

    if (identityChanged) {
      await closeActiveAssignmentHistory(tx, existing.assetId, timestamp);
      await createAssignmentHistory(tx, {
        assetId: nextAssignment.assetId,
        userId: nextAssignment.userId,
        nomorAsset: nextAssignment.nomorAsset,
        catatan: nextAssignment.catatan,
        startedAt: timestamp,
      });
    } else {
      await tx.assetAssignmentHistory.updateMany({
        where: {
          assetId: nextAssignment.assetId,
          endedAt: null,
        },
        data: {
          userId: nextAssignment.userId,
          nomorAsset: nextAssignment.nomorAsset,
          catatan: nextAssignment.catatan,
        },
      });
    }

    return nextAssignment;
  });

  revalidateAssignmentViews();
  return updatedAssignment;
};

export const deleteAssignment = async (id: number): Promise<void> => {
  const timestamp = new Date();

  await prisma.$transaction(async (tx) => {
    const existing = await tx.assetAssignment.findUnique({
      where: { id },
    });

    if (!existing) {
      return;
    }

    await closeActiveAssignmentHistory(tx, existing.assetId, timestamp);
    await tx.assetAssignment.delete({
      where: { id },
    });
  });

  revalidateAssignmentViews();
};
