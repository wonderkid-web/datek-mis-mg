// @ts-nocheck
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { AssetAssignment } from "@prisma/client";
import { Button } from "@/components/ui/button";
import {
  ArrowUpDown,
  Pencil,
  Eye,
  Trash,
  CalendarX,
  CalendarCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Inspect from "@/components/Inspect";
import { formattedDate } from "@/helper";

interface ColumnsProps {
  handleEdit: (assignment: AssetAssignment) => void;
  handleView: (assignment: AssetAssignment) => void;
  handleDelete: (id: number) => void;
}

export const columns = ({
  handleEdit,
  handleView,
  handleDelete,
}: ColumnsProps): ColumnDef<AssetAssignment>[] => [
  {
    accessorKey: "id",
    header: () => <div className="text-center">No</div>,
    cell: ({ row }) => <div className="text-right">{row.index + 1}</div>,
  },

  {
    accessorKey: "nomorAsset",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Asset Number
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "user.namaLengkap",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        User Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => row.original.user.namaLengkap,
  },
  {
    accessorKey: "asset.category.nama",
    header: "Kategori",
    cell: ({ row }) => {
      const categoryId = row.original.asset.categoryId;
      if (categoryId == 1) return "Laptop";
      else if (categoryId == 2) return "Intel NUC";
      else if (categoryId == 3) return "Printer";
    },
  },
  {
    accessorKey: "brand",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Brand
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const asset = row.original.asset;
      const brand =
        asset.laptopSpecs?.brandOption?.value ||
        asset.intelNucSpecs?.brandOption?.value ||
        asset.printerSpecs?.brandOption?.value ||
        "Unknown";
      return (
        <p className="text-center">
          {brand}
        </p>
      );
    },
  },
  {
    accessorKey: "asset.namaAsset",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Asset Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <p className="text-center">{row.original.asset.namaAsset}</p>
    ),
  },
  {
    accessorKey: "asset.tanggalPembelian",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Purchase Date
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const purchaseDate = row.original.asset.tanggalPembelian;
      return (
        <p className="text-center">
          {purchaseDate ? formattedDate(purchaseDate) : "-"}
        </p>
      );
    },
  },
  {
    accessorKey: "asset.tanggalGaransi",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Warranty Date
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const warrantyDate = row.original.asset.tanggalGaransi;
      if (!warrantyDate) return "-";

      const isExpired = new Date(warrantyDate) < new Date();
      const dateString = formattedDate(warrantyDate);

      return (
        <Badge
          variant={isExpired ? "destructive" : "default"}
          className="flex mx-auto items-center justify-center"
        >
          {isExpired ? (
            <CalendarX className="h-3 w-3 mr-1" />
          ) : (
            <CalendarCheck className="h-3 w-3 mr-1" />
          )}
          {dateString}
        </Badge>
      );
    },
  },

  {
    accessorKey: "catatan",
    header: "Notes",
  },
  {
    id: "actions",
    header: () => <div className="text-center">Actions</div>,
    cell: ({ row }) => {
      const assignment = row.original;

      return (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleView(assignment)}
          >
            <Eye className="h-4 w-4" />
            <span className="sr-only">View</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleEdit(assignment)}
          >
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDelete(assignment.id)}
          >
            <Trash className="h-4 w-4" />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      );
    },
  },
];
