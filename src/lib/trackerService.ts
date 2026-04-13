"use server";

import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import type { TrackerDeviceFamily } from "@/lib/types";

const trackerWhereMap: Record<TrackerDeviceFamily, Prisma.AssetWhereInput> = {
  LAPTOP: {
    OR: [
      { category: { slug: "laptop" } },
      { category: { nama: "Laptop" } },
    ],
  },
  INTEL_NUC: {
    OR: [
      { category: { slug: "intel-nuc" } },
      { category: { nama: "Intel NUC" } },
    ],
  },
  PC: {
    OR: [
      { category: { slug: "pc" } },
      { category: { slug: "personal-computer" } },
      { category: { nama: "Personal Computer" } },
    ],
  },
};

const trackerInclude = {
  category: true,
  officeAccount: true,
  assignments: {
    include: {
      user: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  },
  assignmentHistories: {
    include: {
      user: true,
    },
    orderBy: {
      startedAt: "asc",
    },
  },
  laptopSpecs: {
    include: {
      brandOption: true,
      typeOption: true,
      processorOption: true,
      ramOption: true,
      storageTypeOption: true,
      osOption: true,
    },
  },
  intelNucSpecs: {
    include: {
      brandOption: true,
      typeOption: true,
      processorOption: true,
      ramOption: true,
      storageTypeOption: true,
      osOption: true,
    },
  },
  pcSpecs: {
    include: {
      colorOption: true,
      processorOption: true,
      ramOption: true,
      storageTypeOption: true,
      osOption: true,
      monitorOption: true,
      motherboardOption: true,
      upsOption: true,
    },
  },
} satisfies Prisma.AssetInclude;

export async function getTrackedAssets(deviceFamily: TrackerDeviceFamily) {
  try {
    return await prisma.asset.findMany({
      where: trackerWhereMap[deviceFamily],
      include: trackerInclude,
      orderBy: [{ namaAsset: "asc" }, { nomorSeri: "asc" }],
    });
  } catch (error) {
    console.error(`Error fetching tracker assets for ${deviceFamily}:`, error);
    throw new Error("Could not fetch tracker assets.");
  }
}
