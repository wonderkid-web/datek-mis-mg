"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Asset, AssetCategory } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Pencil, Trash, Edit } from "lucide-react";
import { useRouter } from "next/navigation";

interface ColumnsProps {
  handleEdit: (asset: Asset) => void;
  handleDelete: (id: number) => void;
}

export const columns = ({
  handleEdit,
  handleDelete,
}: ColumnsProps): ColumnDef<Asset>[] => [
  {
    accessorKey: "id",
    header: () => <div className="text-center">No</div>,
    cell: ({ row }) => <div className="text-right">{row.index + 1}</div>,
  },
   {
    accessorKey: "category",
    header: () => <div className="text-center">Type</div>,
    cell: ({ row }) => <p className="text-center">{row.original.categoryId == 1 ? "Laptop" : "Intel NUC"}</p>,
  },
   {
    accessorKey: "brand",
    header: () => <div className="text-center">Brand</div>,
    cell: ({ row }) => <p className="text-center">{row.original.laptopSpecs?.brandOption?.value || row.original.intelNucSpecs?.brandOption?.value || "N/A"}</p>,
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
    accessorKey: "processor",
    header: () => <div className="text-center">Processor</div>,
    cell: ({ row }) => <p className="text-center">{row.original.laptopSpecs?.processorOption?.value || row.original.intelNucSpecs?.processorOption?.value || "N/A"}</p>,
   },
   {
    accessorKey: "ram",
    header: () => <div className="text-center">RAM</div>,
    cell: ({ row }) => <p className="text-center">{row.original.laptopSpecs?.ramOption?.value || row.original.intelNucSpecs?.ramOption?.value || "N/A"}</p>,
   },
   {
    accessorKey: "storage",
    header: () => <div className="text-center">Storage</div>,
    cell: ({ row }) => <p className="text-center">{row.original.laptopSpecs?.storageTypeOption?.value || row.original.intelNucSpecs?.storageTypeOption?.value || "N/A"}</p>,
   },
 
  // {
  //   accessorKey: "category.name",
  //   header: "Category",
  //   cell: ({ row }) => {
  //       const category = row.original.category as AssetCategory;
  //       return category ? category.name : 'N/A';
  //     },
  // },
 
  {
    accessorKey: "statusAsset",
    header: () => <div className="text-center">Status</div>,
    cell: ({ row }) => <p className="text-center">{row.original.statusAsset}</p>,
  },
  {
    id: "actions",
    header: () => <div className="text-center">Actions</div>,
    cell: ({ row }) => {
      const asset = row.original;
      const router = useRouter();

      const handleEditLaptopSpecs = () => {
        router.push(`/items/laptop/${asset.id}/edit`);
      };

      const handleEditIntelNucSpecs = () => {
        router.push(`/items/intel-nuc/${asset.id}/edit`);
      };

      return (
        <div className="flex items-center justify-center space-x-2">
          <Button variant="ghost" size="icon" onClick={() => handleEdit(asset)}>
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </Button>
          {asset.category?.slug === "laptop" && (
            <Button variant="ghost" size="icon" onClick={handleEditLaptopSpecs}>
              <Edit className="h-4 w-4" />
              <span className="sr-only">Edit Laptop Specs</span>
            </Button>
          )}
          {asset.category?.slug === "intel-nuc" && (
            <Button variant="ghost" size="icon" onClick={handleEditIntelNucSpecs}>
              <Edit className="h-4 w-4" />
              <span className="sr-only">Edit Intel NUC Specs</span>
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
