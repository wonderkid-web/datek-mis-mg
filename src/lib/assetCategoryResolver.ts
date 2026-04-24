import { prisma } from "@/lib/prisma";

type AssetCategoryKey = "laptop" | "intel-nuc" | "printer" | "pc";

const ASSET_CATEGORY_CONFIG: Record<
  AssetCategoryKey,
  {
    slug: string;
    nama: string;
    aliases: string[];
  }
> = {
  laptop: {
    slug: "laptop",
    nama: "Laptop",
    aliases: ["Asset Laptop"],
  },
  "intel-nuc": {
    slug: "intel-nuc",
    nama: "Intel NUC",
    aliases: ["Asset Intel NUC", "Intel Nuc"],
  },
  printer: {
    slug: "printer",
    nama: "Printer",
    aliases: ["Asset Printer"],
  },
  pc: {
    slug: "pc",
    nama: "Personal Computer",
    aliases: ["Asset PC", "PC"],
  },
};

export async function getOrCreateAssetCategoryId(key: AssetCategoryKey) {
  const config = ASSET_CATEGORY_CONFIG[key];

  const existingCategory = await prisma.assetCategory.findFirst({
    where: {
      OR: [
        { slug: config.slug },
        { nama: config.nama },
        { nama: { in: config.aliases } },
      ],
    },
  });

  if (existingCategory) {
    return existingCategory.id;
  }

  const createdCategory = await prisma.assetCategory.create({
    data: {
      nama: config.nama,
      slug: config.slug,
    },
  });

  return createdCategory.id;
}
