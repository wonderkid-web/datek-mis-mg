"use server";
import { prisma } from "./prisma";
import { unstable_cache } from "next/cache";

export const getAssetAssignments = unstable_cache(
  async () => {
    try {
      const assetAssignments = await prisma.assetAssignment.findMany({
        include: {
          asset: {
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
            },
          },
          user: true, // Include related User
        },
        where: {
          // Optional: you might want to only show active assignments
          // tanggalPengembalian: null,
        },
      });
      return assetAssignments;
    } catch (error) {
      console.error("Error fetching asset assignments:", error);
      throw new Error("Could not fetch asset assignments.");
    }
  },
  ["asset-assignments"],
  {
    revalidate: 60,
    tags: ["asset-assignments"],
  }
);

export const getAssetAssignmentsPrinter = unstable_cache(
  async () => {
    try {
      const assetAssignmentsPrinter = await prisma.assetAssignment.findMany({
        where: {
          asset: {
            categoryId: 3,
          },
        },
        include: {
          asset: {
            include: {
              category: true,
              printerSpecs: {
                include: {
                  brandOption: true,
                  modelOption: true,
                  typeOption: true,
                },
              },
            },
          },
          user: true, // Include related User
        },
      });
      return assetAssignmentsPrinter;
    } catch (error) {
      console.error("Error fetching asset assignments:", error);
      throw new Error("Could not fetch asset assignments.");
    }
  },
  ["asset-assignments_printer"],
  {
    revalidate: 60,
    tags: ["asset-assignments_printer"],
  }
);
