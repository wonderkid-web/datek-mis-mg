"use server";

import { Prisma } from "@prisma/client";
import { unstable_cache, revalidateTag } from "next/cache";

import { prisma } from "@/lib/prisma";
import type {
  MasterDataOption,
  SparepartAdjustmentDirection,
  SparepartDeviceFamily,
  SparepartMovementType,
  SparepartPartType,
  SparepartSourceAssignmentOption,
} from "@/lib/types";
import { SPAREPART_PART_TYPE_OPTIONS } from "@/lib/sparepartTrackerConfig";

const REVALIDATE_TAG = "sparepart-movements";

const optionLoaders: Record<
  SparepartDeviceFamily,
  Partial<Record<SparepartPartType, () => Promise<MasterDataOption[]>>>
> = {
  LAPTOP: {
    BRAND: () => prisma.laptopBrandOption.findMany({ orderBy: { value: "asc" } }),
    TYPE: () => prisma.laptopTypeOption.findMany({ orderBy: { value: "asc" } }),
    PROCESSOR: () =>
      prisma.laptopProcessorOption.findMany({ orderBy: { value: "asc" } }),
    RAM: () => prisma.laptopRamOption.findMany({ orderBy: { value: "asc" } }),
    STORAGE: () =>
      prisma.laptopStorageTypeOption.findMany({ orderBy: { value: "asc" } }),
    OS: () => prisma.laptopOsOption.findMany({ orderBy: { value: "asc" } }),
    POWER: () => prisma.laptopPowerOption.findMany({ orderBy: { value: "asc" } }),
    LICENSE: () =>
      prisma.laptopLicenseOption.findMany({ orderBy: { value: "asc" } }),
    MICROSOFT_OFFICE: () =>
      prisma.laptopMicrosoftOfficeOption.findMany({ orderBy: { value: "asc" } }),
    COLOR: () => prisma.laptopColorOption.findMany({ orderBy: { value: "asc" } }),
    GRAPHIC: () =>
      prisma.laptopGraphicOption.findMany({ orderBy: { value: "asc" } }),
    VGA: () => prisma.laptopVgaOption.findMany({ orderBy: { value: "asc" } }),
  },
  INTEL_NUC: {
    BRAND: () => prisma.laptopBrandOption.findMany({ orderBy: { value: "asc" } }),
    TYPE: () => prisma.laptopTypeOption.findMany({ orderBy: { value: "asc" } }),
    PROCESSOR: () =>
      prisma.laptopProcessorOption.findMany({ orderBy: { value: "asc" } }),
    RAM: () => prisma.laptopRamOption.findMany({ orderBy: { value: "asc" } }),
    STORAGE: () =>
      prisma.laptopStorageTypeOption.findMany({ orderBy: { value: "asc" } }),
    OS: () => prisma.laptopOsOption.findMany({ orderBy: { value: "asc" } }),
    POWER: () => prisma.laptopPowerOption.findMany({ orderBy: { value: "asc" } }),
    LICENSE: () =>
      prisma.laptopLicenseOption.findMany({ orderBy: { value: "asc" } }),
    MICROSOFT_OFFICE: () =>
      prisma.laptopMicrosoftOfficeOption.findMany({ orderBy: { value: "asc" } }),
    COLOR: () => prisma.laptopColorOption.findMany({ orderBy: { value: "asc" } }),
    GRAPHIC: () =>
      prisma.laptopGraphicOption.findMany({ orderBy: { value: "asc" } }),
    VGA: () => prisma.laptopVgaOption.findMany({ orderBy: { value: "asc" } }),
  },
  PC: {
    BRAND: () => prisma.laptopBrandOption.findMany({ orderBy: { value: "asc" } }),
    PROCESSOR: () =>
      prisma.laptopProcessorOption.findMany({ orderBy: { value: "asc" } }),
    RAM: () => prisma.laptopRamOption.findMany({ orderBy: { value: "asc" } }),
    STORAGE: () =>
      prisma.laptopStorageTypeOption.findMany({ orderBy: { value: "asc" } }),
    OS: () => prisma.laptopOsOption.findMany({ orderBy: { value: "asc" } }),
    POWER: () => prisma.laptopPowerOption.findMany({ orderBy: { value: "asc" } }),
    LICENSE: () =>
      prisma.laptopLicenseOption.findMany({ orderBy: { value: "asc" } }),
    MICROSOFT_OFFICE: () =>
      prisma.laptopMicrosoftOfficeOption.findMany({ orderBy: { value: "asc" } }),
    COLOR: () => prisma.laptopColorOption.findMany({ orderBy: { value: "asc" } }),
    GRAPHIC: () =>
      prisma.laptopGraphicOption.findMany({ orderBy: { value: "asc" } }),
    MONITOR: () => prisma.pcMonitorOption.findMany({ orderBy: { value: "asc" } }),
    MOTHERBOARD: () =>
      prisma.pcMotherboardOption.findMany({ orderBy: { value: "asc" } }),
    UPS: () => prisma.pcUpsOption.findMany({ orderBy: { value: "asc" } }),
  },
};

type SparepartMovementInput = {
  deviceFamily: SparepartDeviceFamily;
  partType: SparepartPartType;
  sourceOptionId: number;
  sourceOptionValue: string;
  movementType: SparepartMovementType;
  adjustmentDirection?: SparepartAdjustmentDirection | null;
  quantity: number;
  movedAt: string | Date;
  userId?: number | null;
  stockOwnerUserId?: number | null;
  sourceAssignmentId?: number | null;
  notes?: string | null;
};

const assignmentFamilyWhere: Record<SparepartDeviceFamily, Prisma.AssetAssignmentWhereInput> = {
  LAPTOP: {
    asset: {
      laptopSpecs: {
        isNot: null,
      },
    },
  },
  INTEL_NUC: {
    asset: {
      intelNucSpecs: {
        isNot: null,
      },
    },
  },
  PC: {
    asset: {
      pcSpecs: {
        isNot: null,
      },
    },
  },
};

const normalizeMovedAt = (value: string | Date) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid moved at value.");
  }
  return date;
};

const validateInput = (data: SparepartMovementInput) => {
  if (data.quantity <= 0) {
    throw new Error("Quantity must be greater than zero.");
  }

  const allowedPartTypes = SPAREPART_PART_TYPE_OPTIONS[data.deviceFamily].map(
    (item) => item.value
  );
  if (!allowedPartTypes.includes(data.partType)) {
    throw new Error("Part type is not available for the selected device family.");
  }

  if (data.movementType === "PAKAI" && !data.userId) {
    throw new Error("User is required for usage tracking.");
  }

  if ((data.movementType === "MASUK" || data.movementType === "PAKAI") && !data.stockOwnerUserId) {
    throw new Error("Stock owner is required for incoming and usage tracking.");
  }

  if (data.movementType !== "PAKAI") {
    data.userId = null;
  }

  if (data.movementType !== "MASUK") {
    data.sourceAssignmentId = null;
  }

  if (data.movementType === "ADJUSTMENT" && !data.adjustmentDirection) {
    throw new Error("Adjustment direction is required.");
  }

  if (data.movementType !== "ADJUSTMENT") {
    data.adjustmentDirection = null;
  }
};

export async function getSparepartSourceOptions(
  deviceFamily: SparepartDeviceFamily,
  partType: SparepartPartType
) {
  const loader = optionLoaders[deviceFamily]?.[partType];
  if (!loader) {
    return [];
  }

  return loader();
}

export async function getSparepartSourceAssignments(
  deviceFamily: SparepartDeviceFamily
): Promise<SparepartSourceAssignmentOption[]> {
  const rows = await prisma.assetAssignment.findMany({
    where: assignmentFamilyWhere[deviceFamily],
    include: {
      user: {
        select: {
          id: true,
          namaLengkap: true,
        },
      },
      asset: {
        select: {
          id: true,
          namaAsset: true,
          nomorSeri: true,
        },
      },
    },
    orderBy: [
      { user: { namaLengkap: "asc" } },
      { nomorAsset: "asc" },
    ],
  });

  return rows.map((row) => ({
    id: row.id,
    userId: row.userId,
    userName: row.user.namaLengkap,
    assetId: row.assetId,
    assetName: row.asset.namaAsset,
    serialNumber: row.asset.nomorSeri,
    nomorAsset: row.nomorAsset,
    label: `${row.user.namaLengkap} - ${row.asset.namaAsset} (${row.nomorAsset})`,
  }));
}

export const getSparepartMovements = unstable_cache(
  async (options: Prisma.SparepartMovementFindManyArgs = {}) => {
    try {
      const { include, orderBy, ...rest } = options;
      return await prisma.sparepartMovement.findMany({
        ...rest,
        include: {
          user: true,
          stockOwner: {
            select: {
              id: true,
              namaLengkap: true,
            },
          },
          sourceAssignment: {
            select: {
              id: true,
              nomorAsset: true,
              userId: true,
              assetId: true,
              user: {
                select: {
                  id: true,
                  namaLengkap: true,
                },
              },
              asset: {
                select: {
                  id: true,
                  namaAsset: true,
                  nomorSeri: true,
                },
              },
            },
          },
          ...(include ?? {}),
        },
        orderBy: orderBy ?? { movedAt: "desc" },
      });
    } catch (error) {
      console.error("Error fetching sparepart movements:", error);
      throw new Error("Could not fetch sparepart movements.");
    }
  },
  [REVALIDATE_TAG],
  { tags: [REVALIDATE_TAG] }
);

export async function createSparepartMovement(data: SparepartMovementInput) {
  try {
    validateInput(data);
    const record = await prisma.sparepartMovement.create({
      data: {
        deviceFamily: data.deviceFamily,
        partType: data.partType,
        sourceOptionId: data.sourceOptionId,
        sourceOptionValue: data.sourceOptionValue,
        movementType: data.movementType,
        adjustmentDirection: data.adjustmentDirection ?? null,
        quantity: data.quantity,
        movedAt: normalizeMovedAt(data.movedAt),
        userId: data.userId ?? null,
        stockOwnerUserId: data.stockOwnerUserId ?? null,
        notes: data.notes?.trim() || null,
        sourceAssignmentId: data.sourceAssignmentId ?? null,
      },
      include: {
        user: true,
        stockOwner: {
          select: {
            id: true,
            namaLengkap: true,
          },
        },
        sourceAssignment: {
          select: {
            id: true,
            nomorAsset: true,
            userId: true,
            assetId: true,
            user: {
              select: {
                id: true,
                namaLengkap: true,
              },
            },
            asset: {
              select: {
                id: true,
                namaAsset: true,
                nomorSeri: true,
              },
            },
          },
        },
      },
    });
    revalidateTag(REVALIDATE_TAG);
    return record;
  } catch (error) {
    console.error("Error creating sparepart movement:", error);
    throw new Error("Could not create sparepart movement.");
  }
}

export async function updateSparepartMovement(
  id: number,
  data: Partial<SparepartMovementInput>
) {
  try {
    const existing = await prisma.sparepartMovement.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new Error("Sparepart movement not found.");
    }

    const payload: SparepartMovementInput = {
      deviceFamily: (data.deviceFamily ?? existing.deviceFamily) as SparepartDeviceFamily,
      partType: (data.partType ?? existing.partType) as SparepartPartType,
      sourceOptionId: data.sourceOptionId ?? existing.sourceOptionId,
      sourceOptionValue: data.sourceOptionValue ?? existing.sourceOptionValue,
      movementType: (data.movementType ?? existing.movementType) as SparepartMovementType,
      adjustmentDirection:
        data.adjustmentDirection !== undefined
          ? data.adjustmentDirection
          : (existing.adjustmentDirection as SparepartAdjustmentDirection | null),
      quantity: data.quantity ?? existing.quantity,
      movedAt: data.movedAt ?? existing.movedAt,
      userId: data.userId !== undefined ? data.userId : existing.userId,
      stockOwnerUserId:
        data.stockOwnerUserId !== undefined
          ? data.stockOwnerUserId
          : existing.stockOwnerUserId,
      sourceAssignmentId:
        data.sourceAssignmentId !== undefined
          ? data.sourceAssignmentId
          : existing.sourceAssignmentId,
      notes: data.notes !== undefined ? data.notes : existing.notes,
    };

    validateInput(payload);

    const record = await prisma.sparepartMovement.update({
      where: { id },
      data: {
        deviceFamily: payload.deviceFamily,
        partType: payload.partType,
        sourceOptionId: payload.sourceOptionId,
        sourceOptionValue: payload.sourceOptionValue,
        movementType: payload.movementType,
        adjustmentDirection: payload.adjustmentDirection ?? null,
        quantity: payload.quantity,
        movedAt: normalizeMovedAt(payload.movedAt),
        userId: payload.userId ?? null,
        stockOwnerUserId: payload.stockOwnerUserId ?? null,
        sourceAssignmentId: payload.sourceAssignmentId ?? null,
        notes: payload.notes?.trim() || null,
      },
      include: {
        user: true,
        stockOwner: {
          select: {
            id: true,
            namaLengkap: true,
          },
        },
        sourceAssignment: {
          select: {
            id: true,
            nomorAsset: true,
            userId: true,
            assetId: true,
            user: {
              select: {
                id: true,
                namaLengkap: true,
              },
            },
            asset: {
              select: {
                id: true,
                namaAsset: true,
                nomorSeri: true,
              },
            },
          },
        },
      },
    });
    revalidateTag(REVALIDATE_TAG);
    return record;
  } catch (error) {
    console.error(`Error updating sparepart movement ${id}:`, error);
    throw new Error("Could not update sparepart movement.");
  }
}

export async function deleteSparepartMovement(id: number) {
  try {
    const record = await prisma.sparepartMovement.delete({
      where: { id },
    });
    revalidateTag(REVALIDATE_TAG);
    return record;
  } catch (error) {
    console.error(`Error deleting sparepart movement ${id}:`, error);
    throw new Error("Could not delete sparepart movement.");
  }
}
