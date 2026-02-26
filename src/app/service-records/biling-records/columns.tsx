"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BilingRecordWithUser } from "@/lib/types";

interface ColumnOptions {
  onEdit: (record: BilingRecordWithUser) => void;
  onDelete: (record: BilingRecordWithUser) => void;
}

const formatCost = (value: unknown) => {
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) return "-";
  return new Intl.NumberFormat("id-ID").format(numberValue);
};

export const getColumns = ({
  onEdit,
  onDelete,
}: ColumnOptions): ColumnDef<BilingRecordWithUser>[] => [
  {
    accessorKey: "callDate",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        DATE
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const value = row.getValue<Date>("callDate");
      return value ? new Date(value).toLocaleDateString("id-ID") : "-";
    },
  },
  {
    id: "time",
    header: "TIME",
    cell: ({ row }) =>
      new Date(row.original.callDate).toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      }),
  },
  {
    accessorKey: "extension",
    header: "EXT",
  },
  {
    accessorKey: "user.namaLengkap",
    header: "NAME",
    cell: ({ row }) => row.original.user.namaLengkap,
  },
  {
    accessorKey: "dial",
    header: "DIAL",
  },
  {
    accessorKey: "duration",
    header: "DURATION",
  },
  {
    accessorKey: "trunk",
    header: "TRUNK",
  },
  {
    accessorKey: "pstn",
    header: "PSTN",
  },
  {
    accessorKey: "cost",
    header: "COST",
    cell: ({ row }) => formatCost(row.original.cost),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <div className="flex justify-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={(event) => {
            event.stopPropagation();
            onEdit(row.original);
          }}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="destructive"
          size="icon"
          onClick={(event) => {
            event.stopPropagation();
            onDelete(row.original);
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    ),
  },
];
