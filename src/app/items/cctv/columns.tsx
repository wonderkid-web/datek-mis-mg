"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Pencil, ArrowUpDown, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Asset } from "@/lib/types";

interface ColumnsProps {
  handleDelete: (assetId: number) => void;
  handleEdit: (asset: Asset) => void;
}

export const columns = ({
  handleDelete,
  handleEdit,
}: ColumnsProps): ColumnDef<Asset>[] => [
  {
    accessorKey: "id",
    header: () => <div className="text-center">No</div>,
    cell: ({ row }) => <div className="text-right">{row.index + 1}</div>,
  },
  {
    header: "CCTV Name",
    accessorFn: (row) => row.namaAsset ?? "-",
  },
  {
    accessorKey: "cctvSpecs.channelCamera.lokasi",
    cell: ({ row }) => <p>{row.original.cctvSpecs?.channelCamera?.sbu ?? "-"} - {row.original.cctvSpecs?.channelCamera?.lokasi ?? "-"}</p>,
    header: ({ column }) => {
      return (
        <div className="text-center">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Perusahaan (SBU)
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
  {
    header: "Brand",
    accessorFn: (row) => row.cctvSpecs?.brand?.value ?? "-",
  },
  {
    header: "Model",
    accessorFn: (row) => row.cctvSpecs?.model?.value ?? "-",
  },
  {
    header: "IP Address",
    accessorFn: (row) => row.cctvSpecs?.ipAddress ?? "-",
  },
  {
    id: "actions",
    header: () => <div className="text-center">Actions</div>,
    cell: ({ row }) => {
      const asset = row.original;

      return (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(asset);
            }}
          >
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(asset.id);
            }}
          >
            <Trash className="h-4 w-4" />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      );
    },
  },
];
