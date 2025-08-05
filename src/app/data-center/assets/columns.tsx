"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Asset } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Pencil, Trash, Edit } from "lucide-react";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import Inspect from "@/components/Inspect";

interface ColumnsProps {
  handleEdit: (asset: Asset) => void;
  handleDelete: (id: number) => void;
  router: AppRouterInstance;
}

export const columns = ({
  handleEdit,
  handleDelete,
  router,
}: ColumnsProps): ColumnDef<Asset>[] => [
  {
    accessorKey: "id",
    header: () => <div className="text-center">No</div>,
    cell: ({ row }) => <div className="text-right">{row.index + 1}</div>,
  },
  {
    accessorKey: "category",
    header: () => <div className="text-center">Type</div>,
    cell: ({ row }) => {
      let category;
      if (row.original.category?.slug === "laptop") {
        category = "Laptop";
      } else if (row.original.category?.slug === "intel-nuc") {
        category = "Intel NUC";
      } else if (row.original.category?.slug === "printer") {
        category = "Printer";
      }
      return <p className="text-center">{category || "N/A"}</p>;
    },
  },
  {
    accessorKey: "brand",
    header: () => <div className="text-center">Brand</div>,
    cell: ({ row }) => (
      <p className="text-center">
        {row.original.laptopSpecs?.brandOption?.value ||
          row.original.intelNucSpecs?.brandOption?.value ||
          row.original.printerSpecs?.brandOption?.value ||
          "N/A"}
      </p>
    ),
  },
  {
    accessorKey: "namaAsset",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="mx-auto"
      >
        Asset Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <p className="text-center">{row.original.namaAsset}</p>,
  },
  {
    accessorKey: "nomorSeri",
    header: () => <div className="text-center">Serial Number</div>,
    cell: ({ row }) => <p className="text-center">{row.original.nomorSeri}</p>,
  },
  {
    accessorKey: "model",
    header: () => <div className="text-center">Model</div>,
    cell: ({ row }) => {
      const asset = row.original;
      const model =
        asset?.laptopSpecs?.brandOption?.value ||
        asset?.intelNucSpecs?.brandOption?.value ||
        asset?.printerSpecs?.brandOption?.value ||
        "Unknown";
      return (
        <p className="text-center">
          {model}
        </p>
      );
    },
  },

  {
    accessorKey: "statusAsset",
    header: () => <div className="text-center">Status</div>,
    cell: ({ row }) => (
      <p className="text-center">{row.original.statusAsset}</p>
    ),
  },
  {
    id: "actions",
    header: () => <div className="text-center">Actions</div>,
    cell: ({ row }) => {
      const asset = row.original;

      const handleEditLaptopSpecs = () => {
        router.push(`/items/laptop/${asset.id}/edit`);
      };

      const handleEditIntelNucSpecs = () => {
        router.push(`/items/intel-nuc/${asset.id}/edit`);
      };

      const handleEditPrinterSpecs = () => {
        router.push(`/items/printer/${asset.id}/edit`);
      };

      return (
        <div className="flex items-center justify-center space-x-2">
          <Button variant="ghost" size="icon" onClick={() => handleEdit(asset)}>
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </Button>
          {asset.category?.slug.toLowerCase() === "laptop" && (
            <Button variant="ghost" size="icon" onClick={handleEditLaptopSpecs}>
              <Edit className="h-4 w-4" />
              <span className="sr-only">Edit Laptop Specs</span>
            </Button>
          )}
          {asset.category?.slug.toLowerCase() === "intel-nuc" && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleEditIntelNucSpecs}
            >
              <Edit className="h-4 w-4" />
              <span className="sr-only">Edit Intel NUC Specs</span>
            </Button>
          )}
          {asset.category?.slug.toLowerCase() === "printer" && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleEditPrinterSpecs}
            >
              <Edit className="h-4 w-4" />
              <span className="sr-only">Edit Printer Specs</span>
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDelete(asset.id)}
          >
            <Trash className="h-4 w-4" />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      );
    },
  },
];
