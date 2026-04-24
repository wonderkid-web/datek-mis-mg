"use server";
import { prisma } from "./prisma";
import { Asset } from "@prisma/client";
import { ALL_LOCATIONS } from "./constants";
import { revalidatePath, revalidateTag } from "next/cache";
import { getOrCreateAssetCategoryId } from "@/lib/assetCategoryResolver";
import { getUserFacingAssetError } from "@/lib/errorMessage";

interface CreateAssetData {
  namaAsset: string;
  categoryId: number;
  nomorSeri: string;
  tanggalPembelian?: Date | null;
  tanggalGaransi?: Date | null;
  statusAsset: string;
  lokasiFisik?: string | null;
}

interface CreateLaptopSpecsDataInput {
  processorOptionId?: number | null;
  ramOptionId?: number | null;
  storageTypeOptionId?: number | null;
  osOptionId?: number | null;
  portOptionId?: number | null;
  powerOptionId?: number | null;
  microsoftOfficeOptionId?: number | null;
  colorOptionId?: number | null;
  macWlan?: string | null;
  macLan?: string | null;
  brandOptionId?: number | null;
  typeOptionId?: number | null;
  graphicOptionId?: number | null;
  vgaOptionId?: number | null;
  licenseOptionId?: number | null;
  licenseKey?: string | null;
}

// UPDATE: Tambahkan field baru di interface ini
interface OfficeAccountData {
  email: string;
  password: string;
  licenseExpiry?: Date | null; // Baru
  isActive: boolean;           // Baru
}

export async function createAssetAndLaptopSpecs(
  assetData: CreateAssetData,
  laptopSpecsDataInput: CreateLaptopSpecsDataInput,
  officeAccountData?: OfficeAccountData | null
): Promise<Asset> {
  const categoryId = await getOrCreateAssetCategoryId("laptop");
  const laptopSpecsCreateData: any = {
    macWlan: laptopSpecsDataInput.macWlan,
    macLan: laptopSpecsDataInput.macLan,

  };

  if (laptopSpecsDataInput.processorOptionId) {
    laptopSpecsCreateData.processorOption = {
      connect: { id: laptopSpecsDataInput.processorOptionId },
    };
  }
  if (laptopSpecsDataInput.ramOptionId) {
    laptopSpecsCreateData.ramOption = {
      connect: { id: laptopSpecsDataInput.ramOptionId },
    };
  }
  if (laptopSpecsDataInput.storageTypeOptionId) {
    laptopSpecsCreateData.storageTypeOption = {
      connect: { id: laptopSpecsDataInput.storageTypeOptionId },
    };
  }
  if (laptopSpecsDataInput.osOptionId) {
    laptopSpecsCreateData.osOption = {
      connect: { id: laptopSpecsDataInput.osOptionId },
    };
  }
  if (laptopSpecsDataInput.portOptionId) {
    laptopSpecsCreateData.portOption = {
      connect: { id: laptopSpecsDataInput.portOptionId },
    };
  }
  if (laptopSpecsDataInput.powerOptionId) {
    laptopSpecsCreateData.powerOption = {
      connect: { id: laptopSpecsDataInput.powerOptionId },
    };
  }
  if (laptopSpecsDataInput.microsoftOfficeOptionId) {
    laptopSpecsCreateData.microsoftOfficeOption = {
      connect: { id: laptopSpecsDataInput.microsoftOfficeOptionId },
    };
  }
  if (laptopSpecsDataInput.colorOptionId) {
    laptopSpecsCreateData.colorOption = {
      connect: { id: laptopSpecsDataInput.colorOptionId },
    };
  }
  if (laptopSpecsDataInput.brandOptionId) {
    laptopSpecsCreateData.brandOption = {
      connect: { id: laptopSpecsDataInput.brandOptionId },
    };
  }
  if (laptopSpecsDataInput.typeOptionId) {
    laptopSpecsCreateData.typeOption = {
      connect: { id: laptopSpecsDataInput.typeOptionId },
    };
  }
  if (laptopSpecsDataInput.graphicOptionId) {
    laptopSpecsCreateData.graphicOption = {
      connect: { id: laptopSpecsDataInput.graphicOptionId },
    };
  }
  if (laptopSpecsDataInput.vgaOptionId) {
    laptopSpecsCreateData.vgaOption = {
      connect: { id: laptopSpecsDataInput.vgaOptionId },
    };
  }
  if (laptopSpecsDataInput.licenseOptionId) {
    laptopSpecsCreateData.licenseOption = {
      connect: { id: laptopSpecsDataInput.licenseOptionId },
    };
  }

  // Logic simpan asset + specs + akun office (UPDATED)
  try {
    const newAsset = await prisma.asset.create({
      data: {
        ...assetData,
        categoryId,
        laptopSpecs: {
          create: {
            ...laptopSpecsCreateData,
            licenseKey: laptopSpecsDataInput.licenseKey || null,
          },
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
        laptopSpecs: true,
        officeAccount: true,
      },
    });

    revalidatePath("/data-center/assets");
    revalidatePath("/data-center/assigned-assets");
    revalidateTag("asset-assignments");

    return newAsset;
  } catch (error) {
    console.error("Failed to create laptop asset:", error);
    throw new Error(
      getUserFacingAssetError(error, "Gagal menambahkan asset laptop.")
    );
  }
}

export async function getAssets(categoryId?: number): Promise<Asset[]> {
  const whereClause = categoryId ? { categoryId } : {};

  const assets = await prisma.asset.findMany({
    where: whereClause,
    include: {
      category: true,
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
          brandOption: true,
          typeOption: true,
          modelOption: true,
        },
      },
      officeAccount: true,
    },
  });

  return assets.map((asset) => ({
    ...asset,
  }));
}

export async function getAssetById(id: number): Promise<Asset | null> {
  const asset = await prisma.asset.findUnique({
    where: { id },
    include: {
      category: true,
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
          brandOption: true,
          typeOption: true,
          modelOption: true,
        },
      },
      officeAccount: true,
    },
  });

  if (!asset) return null;

  return {
    ...asset,
  };
}

export async function updateBasicAssetInfo(
  id: number,
  data: Partial<CreateAssetData>
): Promise<Asset> {
  const updatedAsset = await prisma.asset.update({
    where: { id },
    data,
  });

  // --- TAMBAHKAN BLOCK INI ---
  revalidatePath("/data-center/assets");
  revalidatePath("/data-center/assigned-assets");
  revalidateTag("asset-assignments");
  revalidateTag("asset-assignments_printer"); // Jaga-jaga jika ini printer
  // ----------------------------
  return {
    ...updatedAsset,
  };
}

interface UpdateLaptopSpecsDataInput {
  processorOptionId?: number | null;
  ramOptionId?: number | null;
  storageTypeOptionId?: number | null;
  osOptionId?: number | null;
  portOptionId?: number | null;
  powerOptionId?: number | null;
  microsoftOfficeOptionId?: number | null;
  licenseKey?: string | null;
  colorOptionId?: number | null;
  macWlan?: string | null;
  macLan?: string | null;
  brandOptionId?: number | null;
  typeOptionId?: number | null;
  graphicOptionId?: number | null;
  vgaOptionId?: number | null;
  licenseOptionId?: number | null;
}

interface UpdatePrinterSpecsDataInput {
  brandOptionId?: number | null;
  typeOptionId?: number | null;
  modelOptionId?: number | null;
}

export async function updateAssetAndLaptopSpecs(
  id: number,
  assetData: Partial<CreateAssetData>,
  laptopSpecsDataInput: UpdateLaptopSpecsDataInput,
  officeAccountData?: OfficeAccountData | null
): Promise<Asset> {
  const categoryId = await getOrCreateAssetCategoryId("laptop");
  const laptopSpecsUpdateData: any = {};

  if (laptopSpecsDataInput.macWlan !== undefined) {
    laptopSpecsUpdateData.macWlan = laptopSpecsDataInput.macWlan;
  }
  if (laptopSpecsDataInput.macLan !== undefined) {
    laptopSpecsUpdateData.macLan = laptopSpecsDataInput.macLan;
  }

  if (laptopSpecsDataInput.processorOptionId !== undefined) {
    laptopSpecsUpdateData.processorOption = laptopSpecsDataInput.processorOptionId === null ? { disconnect: true } : { connect: { id: laptopSpecsDataInput.processorOptionId } };
  }
  if (laptopSpecsDataInput.ramOptionId !== undefined) {
    laptopSpecsUpdateData.ramOption = laptopSpecsDataInput.ramOptionId === null ? { disconnect: true } : { connect: { id: laptopSpecsDataInput.ramOptionId } };
  }
  if (laptopSpecsDataInput.storageTypeOptionId !== undefined) {
    laptopSpecsUpdateData.storageTypeOption = laptopSpecsDataInput.storageTypeOptionId === null ? { disconnect: true } : { connect: { id: laptopSpecsDataInput.storageTypeOptionId } };
  }
  if (laptopSpecsDataInput.osOptionId !== undefined) {
    laptopSpecsUpdateData.osOption = laptopSpecsDataInput.osOptionId === null ? { disconnect: true } : { connect: { id: laptopSpecsDataInput.osOptionId } };
  }
  if (laptopSpecsDataInput.portOptionId !== undefined) {
    laptopSpecsUpdateData.portOption = laptopSpecsDataInput.portOptionId === null ? { disconnect: true } : { connect: { id: laptopSpecsDataInput.portOptionId } };
  }
  if (laptopSpecsDataInput.powerOptionId !== undefined) {
    laptopSpecsUpdateData.powerOption = laptopSpecsDataInput.powerOptionId === null ? { disconnect: true } : { connect: { id: laptopSpecsDataInput.powerOptionId } };
  }
  if (laptopSpecsDataInput.microsoftOfficeOptionId !== undefined) {
    laptopSpecsUpdateData.microsoftOfficeOption = laptopSpecsDataInput.microsoftOfficeOptionId === null ? { disconnect: true } : { connect: { id: laptopSpecsDataInput.microsoftOfficeOptionId } };
  }
  if (laptopSpecsDataInput.colorOptionId !== undefined) {
    laptopSpecsUpdateData.colorOption = laptopSpecsDataInput.colorOptionId === null ? { disconnect: true } : { connect: { id: laptopSpecsDataInput.colorOptionId } };
  }
  if (laptopSpecsDataInput.brandOptionId !== undefined) {
    laptopSpecsUpdateData.brandOption = laptopSpecsDataInput.brandOptionId === null ? { disconnect: true } : { connect: { id: laptopSpecsDataInput.brandOptionId } };
  }
  if (laptopSpecsDataInput.typeOptionId !== undefined) {
    laptopSpecsUpdateData.typeOption = laptopSpecsDataInput.typeOptionId === null ? { disconnect: true } : { connect: { id: laptopSpecsDataInput.typeOptionId } };
  }
  if (laptopSpecsDataInput.graphicOptionId !== undefined) {
    laptopSpecsUpdateData.graphicOption = laptopSpecsDataInput.graphicOptionId === null ? { disconnect: true } : { connect: { id: laptopSpecsDataInput.graphicOptionId } };
  }
  if (laptopSpecsDataInput.vgaOptionId !== undefined) {
    laptopSpecsUpdateData.vgaOption = laptopSpecsDataInput.vgaOptionId === null ? { disconnect: true } : { connect: { id: laptopSpecsDataInput.vgaOptionId } };
  }
  if (laptopSpecsDataInput.licenseOptionId !== undefined) {
    laptopSpecsUpdateData.licenseOption = laptopSpecsDataInput.licenseOptionId === null ? { disconnect: true } : { connect: { id: laptopSpecsDataInput.licenseOptionId } };
  }

  // 1. Fetch the existing asset to check for the presence of a nested OfficeAccount
  const existingAsset = await prisma.asset.findUnique({
    where: { id },
    include: { officeAccount: true },
  });

  if (!existingAsset) {
    throw new Error("Asset not found");
  }

  // 2. Define the Logic Update for Office Account
  let officeAccountUpdateLogic: any = undefined;

  if (officeAccountData) {
    // If data exists, we UPSERT (Update if exists, Create if not)
    officeAccountUpdateLogic = {
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
    };
  } else if (officeAccountData === null && existingAsset.officeAccount) {
    // ONLY attempt delete if the user sent null AND a record currently exists
    officeAccountUpdateLogic = {
      delete: true,
    };
  }

  // 3. Execute the Update
  try {
    const updatedAsset = await prisma.asset.update({
      where: { id },
      data: {
        ...assetData,
        categoryId,
        laptopSpecs: {
          update: {
            ...laptopSpecsUpdateData,
            licenseKey: laptopSpecsDataInput.licenseKey || null,
          },
        },
        // Pass the logic we calculated above
        officeAccount: officeAccountUpdateLogic,
      },
      include: {
        laptopSpecs: true,
        officeAccount: true,
      },
    });

    // --- TAMBAHKAN BLOCK INI ---
    revalidatePath("/data-center/assets");
    revalidatePath("/data-center/assigned-assets");
    revalidateTag("asset-assignments"); // PENTING: Reset cache

    return updatedAsset;

  } catch (error) {
    console.error('Failed to update laptop asset:', error);
    throw new Error(
      getUserFacingAssetError(error, "Gagal memperbarui asset laptop.")
    );
  }

}

export async function updateAssetAndPrinterSpecs(
  id: number,
  assetData: Partial<CreateAssetData>,
  printerSpecsDataInput: UpdatePrinterSpecsDataInput
): Promise<Asset> {
  const categoryId = await getOrCreateAssetCategoryId("printer");
  const printerSpecsUpdateData: any = {};
  const printerSpecsCreateData: any = {};

  if (printerSpecsDataInput.brandOptionId !== undefined) {
    printerSpecsUpdateData.brandOption =
      printerSpecsDataInput.brandOptionId === null
        ? { disconnect: true }
        : { connect: { id: printerSpecsDataInput.brandOptionId } };

    if (printerSpecsDataInput.brandOptionId !== null) {
      printerSpecsCreateData.brandOption = {
        connect: { id: printerSpecsDataInput.brandOptionId },
      };
    }
  }

  if (printerSpecsDataInput.typeOptionId !== undefined) {
    printerSpecsUpdateData.typeOption =
      printerSpecsDataInput.typeOptionId === null
        ? { disconnect: true }
        : { connect: { id: printerSpecsDataInput.typeOptionId } };

    if (printerSpecsDataInput.typeOptionId !== null) {
      printerSpecsCreateData.typeOption = {
        connect: { id: printerSpecsDataInput.typeOptionId },
      };
    }
  }

  if (printerSpecsDataInput.modelOptionId !== undefined) {
    printerSpecsUpdateData.modelOption =
      printerSpecsDataInput.modelOptionId === null
        ? { disconnect: true }
        : { connect: { id: printerSpecsDataInput.modelOptionId } };

    if (printerSpecsDataInput.modelOptionId !== null) {
      printerSpecsCreateData.modelOption = {
        connect: { id: printerSpecsDataInput.modelOptionId },
      };
    }
  }

  try {
    const updatedAsset = await prisma.asset.update({
      where: { id },
      data: {
        ...assetData,
        categoryId,
        printerSpecs: {
          upsert: {
            create: printerSpecsCreateData,
            update: printerSpecsUpdateData,
          },
        },
      },
      include: {
        printerSpecs: {
          include: {
            brandOption: true,
            modelOption: true,
            typeOption: true,
          },
        },
      },
    });

    revalidatePath("/data-center/assets");
    revalidatePath("/data-center/assigned-assets");
    revalidateTag("asset-assignments");
    revalidateTag("asset-assignments_printer");

    return updatedAsset;
  } catch (error) {
    console.error("Failed to update printer asset:", error);
    throw new Error(
      getUserFacingAssetError(error, "Gagal memperbarui asset printer.")
    );
  }
}

export async function getPaginatedAssets({
  page = 1,
  pageSize = 10,
  namaAsset,
  statusAsset,
  lokasiFisik,
  company,
  homebase,
  categoryId,
  categorySlug,
  osValue,
  idleOnly,
  assignedOnly,
  unassignedOnly,
}: {
  page?: number;
  pageSize?: number;
  namaAsset?: string;
  statusAsset?: string;
  lokasiFisik?: string;
  company?: string;
  homebase?: string;
  categoryId?: number;
  categorySlug?: string;
  osValue?: string;
  idleOnly?: boolean;
  assignedOnly?: boolean;
  unassignedOnly?: boolean;
}) {
  const skip = (page - 1) * pageSize;
  const take = pageSize;

  const AND = [];

  if (namaAsset) {
    AND.push({ namaAsset: { contains: namaAsset } });
  }
  if (statusAsset) {
    AND.push({ statusAsset });
  }
  if (lokasiFisik) {
    if (lokasiFisik === "PT Intan Sejati Andalan (Group)") {
      AND.push({
        lokasiFisik: {
          startsWith: "PT Intan Sejati Andalan",
        },
      });
    } else if (lokasiFisik === "Unassigned" || lokasiFisik === "Tanpa Lokasi") {
      AND.push({
        OR: [
          { lokasiFisik: null },
          { lokasiFisik: "" },
        ],
      });
    } else {
      AND.push({
        lokasiFisik,
      });
    }
  }
  if (company) {
    if (company === "PT Intan Sejati Andalan (Group)") {
      AND.push({
        assignments: {
          some: {
            user: {
              lokasiKantor: {
                startsWith: "PT Intan Sejati Andalan",
              },
            },
          },
        },
      });
    } else if (company === "Unassigned" || company === "Tanpa Lokasi") {
      AND.push({
        OR: [
          {
            assignments: {
              none: {},
            },
          },
          {
            assignments: {
              some: {
                user: {
                  OR: [{ lokasiKantor: null }, { lokasiKantor: "" }],
                },
              },
            },
          },
        ],
      });
    } else {
      AND.push({
        assignments: {
          some: {
            user: {
              lokasiKantor: company,
            },
          },
        },
      });
    }
  }
  if (homebase) {
    AND.push({
      assignments: {
        some: {
          user: {
            jabatan: homebase,
          },
        },
      },
    });
  }
  if (typeof categoryId === "number") {
    AND.push({ categoryId });
  }
  if (categorySlug) {
    AND.push({ category: { is: { slug: categorySlug } } });
  }

  if (osValue) {
    AND.push({
      OR: [
        { laptopSpecs: { is: { osOption: { is: { value: osValue } } } } },
        { intelNucSpecs: { is: { osOption: { is: { value: osValue } } } } },
        { pcSpecs: { is: { osOption: { is: { value: osValue } } } } },
      ],
    });
  }

  if (idleOnly) {
    AND.push({
      assignments: {
        some: {
          user: { isActive: false },
        },
      },
    });
  }

  if (assignedOnly) {
    AND.push({
      assignments: {
        some: {},
      },
    });
  }

  if (unassignedOnly) {
    AND.push({
      assignments: {
        none: {},
      },
    });
  }

  const where = AND.length ? { AND } : {};

  const [assets, total] = await prisma.$transaction([
    prisma.asset.findMany({
      where,
      skip,
      take,
      orderBy: { id: "desc" },
      include: {
        category: true,
        laptopSpecs: { select: { osOption: { select: { value: true } } } },
        intelNucSpecs: { select: { osOption: { select: { value: true } } } },
        pcSpecs: { select: { osOption: { select: { value: true } } } },
        assignments: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { user: { select: { namaLengkap: true } } },
        },
      },
    }),
    prisma.asset.count({ where }),
  ]);

  return {
    data: assets,
    total,
    page,
    pageSize,
    pageCount: Math.ceil(total / pageSize),
  };
}

export async function deleteAsset(id: number): Promise<Asset> {
  const asset = await prisma.asset.findUnique({
    where: { id },
    include: { category: true },
  });

  if (!asset) {
    throw new Error("Asset not found");
  }

  return await prisma.$transaction(async (tx) => {
    await tx.assetAssignment.deleteMany({ where: { assetId: id } });

    if (asset.category.slug === "laptop") {
      await tx.laptopSpecs.deleteMany({ where: { assetId: id } });
    } else if (asset.category.slug === "intel-nuc") {
      await tx.intelNucSpecs.deleteMany({ where: { assetId: id } });
    } else if (asset.category.slug === "pc" || asset.category.slug === "personal-computer") {
      await tx.pcSpecs.deleteMany({ where: { assetId: id } });
    } else if (asset.category.slug === "printer") {
      await tx.printerSpecs.deleteMany({ where: { assetId: id } });
    }

    const deletedAsset = await tx.asset.delete({
      where: { id },
    });

    // --- TAMBAHKAN BLOCK INI ---
    revalidatePath("/data-center/assets");
    revalidatePath("/data-center/assigned-assets");
    revalidateTag("asset-assignments");
    revalidateTag("asset-assignments_printer");
    // ----------------------------

    return deletedAsset;
  });
}

export async function getAssetTotal(): Promise<number> {
  return await prisma.asset.count();
}

export async function getAssetBreakdownByLocation() {
  const mergedIsaName = "PT Intan Sejati Andalan (Group)";
  const finalLocations = [
    ...ALL_LOCATIONS.filter(l => !l.startsWith("PT Intan Sejati Andalan")),
    mergedIsaName
  ];

  const breakdown: Record<string, Record<string, number>> = {};
  finalLocations.forEach(loc => breakdown[loc] = {});


  const assignments = await prisma.assetAssignment.findMany({
    select: {
      user: { select: { lokasiKantor: true } },
      asset: { select: { category: { select: { nama: true } } } },
    },
  });

  assignments.forEach(assignment => {
    let location = assignment.user.lokasiKantor ?? "Unassigned";
    if (location.startsWith("PT Intan Sejati Andalan")) {
      location = mergedIsaName;
    }

    if (breakdown[location]) {
      const category = assignment.asset.category.nama;
      breakdown[location][category] = (breakdown[location][category] || 0) + 1;
    }
  });

  return Object.entries(breakdown).map(([location, categories]) => ({
    location,
    data: Object.entries(categories).map(([name, total]) => ({ name, total })),
  }));
}

export async function getOperatingSystemBreakdown() {
  const laptopCounts = await prisma.laptopSpecs.groupBy({
    by: ["osOptionId"],
    _count: {
      assetId: true,
    },
  });

  const nucCounts = await prisma.intelNucSpecs.groupBy({
    by: ["osOptionId"],
    _count: {
      assetId: true,
    },
  });

  const pcCounts = await prisma.pcSpecs.groupBy({
    by: ["osOptionId"],
    _count: {
      assetId: true,
    },
  });

  const mergedCounts: Record<number, number> = {};

  laptopCounts.forEach((item) => {
    if (item.osOptionId) {
      mergedCounts[item.osOptionId] =
        (mergedCounts[item.osOptionId] || 0) + item._count.assetId;
    }
  });

  nucCounts.forEach((item) => {
    if (item.osOptionId) {
      mergedCounts[item.osOptionId] =
        (mergedCounts[item.osOptionId] || 0) + item._count.assetId;
    }
  });

  pcCounts.forEach((item) => {
    if (item.osOptionId) {
      mergedCounts[item.osOptionId] =
        (mergedCounts[item.osOptionId] || 0) + item._count.assetId;
    }
  });

  const osOptions = await prisma.laptopOsOption.findMany({
    where: {
      id: {
        in: Object.keys(mergedCounts).map(Number),
      },
      value: {
        in: [
          "Windows 11 Pro 64 Bit",
          "Windows 10 Pro 64 Bit",
          "Windows 11 Home SL 64 Bit",
          "Windows 10 Home SL 64 Bit",
        ],
      },
    },
  });

  return osOptions.map((option) => ({
    name: option.value,
    total: mergedCounts[option.id] || 0,
  }));
}

export async function getTotalIdleAssets() {
  const count = await prisma.assetAssignment.count({
    where: {
      user: {
        isActive: false,
      },
    },
  });
  return count;
}
