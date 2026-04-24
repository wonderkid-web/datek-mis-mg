"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { Asset } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getUserFacingAssetError } from "@/lib/errorMessage";

interface CreatePcAssetData {
  namaAsset: string;
  nomorSeri: string;
  tanggalPembelian?: Date | null;
  tanggalGaransi?: Date | null;
  statusAsset: string;
  lokasiFisik?: string | null;
}

interface PcSpecsInput {
  processorOptionId?: number | null;
  ramOptionId?: number | null;
  storageTypeOptionId?: number | null;
  licenseOptionId?: number | null;
  licenseKey?: string | null;
  osOptionId?: number | null;
  powerOptionId?: number | null;
  microsoftOfficeOptionId?: number | null;
  colorOptionId?: number | null;
  graphicOptionId?: number | null;
  monitorOptionId?: number | null;
  motherboardOptionId?: number | null;
  upsOptionId?: number | null;
  casing?: string | null;
  macLan?: string | null;
}

interface OfficeAccountData {
  email: string;
  password: string;
  licenseExpiry?: Date | null;
  isActive: boolean;
}

const PC_CATEGORY_SLUGS = ["pc", "personal-computer"];
const PC_CATEGORY_NAMES = ["Personal Computer", "Asset PC", "PC"];

async function getOrCreatePcCategoryId() {
  const existingCategory = await prisma.assetCategory.findFirst({
    where: {
      OR: [
        { slug: { in: PC_CATEGORY_SLUGS } },
        { nama: { in: PC_CATEGORY_NAMES } },
      ],
    },
  });

  if (existingCategory) {
    return existingCategory.id;
  }

  const createdCategory = await prisma.assetCategory.create({
    data: {
      nama: "Personal Computer",
      slug: "pc",
    },
  });

  return createdCategory.id;
}

function buildPcSpecsCreateData(input: PcSpecsInput) {
  const data: Record<string, unknown> = {
    casing: input.casing || null,
    macLan: input.macLan || null,
    licenseKey: input.licenseKey || null,
  };

  const relationFields: Array<[keyof PcSpecsInput, string]> = [
    ["processorOptionId", "processorOption"],
    ["ramOptionId", "ramOption"],
    ["storageTypeOptionId", "storageTypeOption"],
    ["licenseOptionId", "licenseOption"],
    ["osOptionId", "osOption"],
    ["powerOptionId", "powerOption"],
    ["microsoftOfficeOptionId", "microsoftOfficeOption"],
    ["colorOptionId", "colorOption"],
    ["graphicOptionId", "graphicOption"],
    ["monitorOptionId", "monitorOption"],
    ["motherboardOptionId", "motherboardOption"],
    ["upsOptionId", "upsOption"],
  ];

  relationFields.forEach(([field, relation]) => {
    const value = input[field];
    if (typeof value === "number") {
      data[relation] = {
        connect: { id: value },
      };
    }
  });

  return data;
}

function buildPcSpecsUpdateData(input: PcSpecsInput) {
  const data: Record<string, unknown> = {};

  if (input.casing !== undefined) {
    data.casing = input.casing || null;
  }
  if (input.macLan !== undefined) {
    data.macLan = input.macLan || null;
  }
  if (input.licenseKey !== undefined) {
    data.licenseKey = input.licenseKey || null;
  }

  const relationFields: Array<[keyof PcSpecsInput, string]> = [
    ["processorOptionId", "processorOption"],
    ["ramOptionId", "ramOption"],
    ["storageTypeOptionId", "storageTypeOption"],
    ["licenseOptionId", "licenseOption"],
    ["osOptionId", "osOption"],
    ["powerOptionId", "powerOption"],
    ["microsoftOfficeOptionId", "microsoftOfficeOption"],
    ["colorOptionId", "colorOption"],
    ["graphicOptionId", "graphicOption"],
    ["monitorOptionId", "monitorOption"],
    ["motherboardOptionId", "motherboardOption"],
    ["upsOptionId", "upsOption"],
  ];

  relationFields.forEach(([field, relation]) => {
    const value = input[field];
    if (value !== undefined) {
      data[relation] =
        value === null
          ? { disconnect: true }
          : {
              connect: { id: value },
            };
    }
  });

  return data;
}

export async function createAssetAndPcSpecs(
  assetData: CreatePcAssetData,
  pcSpecsData: PcSpecsInput,
  officeAccountData?: OfficeAccountData | null
): Promise<Asset> {
  const categoryId = await getOrCreatePcCategoryId();

  try {
    const asset = await prisma.asset.create({
      data: {
        ...assetData,
        categoryId,
        pcSpecs: {
          create: buildPcSpecsCreateData(pcSpecsData),
        },
        officeAccount: officeAccountData
          ? {
              create: {
                email: officeAccountData.email,
                password: officeAccountData.password,
                licenseExpiry: officeAccountData.licenseExpiry,
                isActive: officeAccountData.isActive,
              },
            }
          : undefined,
      },
      include: {
        pcSpecs: true,
        officeAccount: true,
      },
    });

    revalidatePath("/data-center/assets");
    revalidatePath("/data-center/assigned-assets");
    revalidateTag("asset-assignments");

    return asset;
  } catch (error) {
    console.error("Failed to create PC asset:", error);
    throw new Error(
      getUserFacingAssetError(error, "Gagal menambahkan asset PC.")
    );
  }
}

export async function updateAssetAndPcSpecs(
  id: number,
  assetData: Partial<CreatePcAssetData>,
  pcSpecsData: PcSpecsInput,
  officeAccountData?: OfficeAccountData | null
): Promise<Asset> {
  const categoryId = await getOrCreatePcCategoryId();
  const existingOfficeAccount = await prisma.officeAccount.findUnique({
    where: { assetId: id },
    select: { id: true },
  });

  const asset = await prisma.asset.update({
    where: { id },
    data: {
      ...assetData,
      categoryId,
      pcSpecs: {
        upsert: {
          create: buildPcSpecsCreateData(pcSpecsData),
          update: buildPcSpecsUpdateData(pcSpecsData),
        },
      },
      officeAccount:
        officeAccountData === undefined
          ? undefined
          : officeAccountData === null
            ? existingOfficeAccount
              ? { delete: true }
              : undefined
            : {
                upsert: {
                  create: {
                    email: officeAccountData.email,
                    password: officeAccountData.password,
                    licenseExpiry: officeAccountData.licenseExpiry,
                    isActive: officeAccountData.isActive,
                  },
                  update: {
                    email: officeAccountData.email,
                    password: officeAccountData.password,
                    licenseExpiry: officeAccountData.licenseExpiry,
                    isActive: officeAccountData.isActive,
                  },
                },
              },
    },
    include: {
      pcSpecs: true,
      officeAccount: true,
    },
  });

  revalidatePath("/data-center/assets");
  revalidatePath("/data-center/assigned-assets");
  revalidateTag("asset-assignments");

  return asset;
}
