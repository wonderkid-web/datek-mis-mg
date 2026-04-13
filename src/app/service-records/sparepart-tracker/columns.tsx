"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Edit, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SparepartMovementWithUser } from "@/lib/types";
import {
  SPAREPART_DEVICE_FAMILY_OPTIONS,
  SPAREPART_MOVEMENT_TYPE_OPTIONS,
  SPAREPART_PART_TYPE_LABELS,
  getSparepartItemKey,
} from "@/lib/sparepartTrackerConfig";

const familyLabelMap = Object.fromEntries(
  SPAREPART_DEVICE_FAMILY_OPTIONS.map((option) => [option.value, option.label])
);

const movementTypeLabelMap = Object.fromEntries(
  SPAREPART_MOVEMENT_TYPE_OPTIONS.map((option) => [option.value, option.label])
);

const getMovementLabel = (record: SparepartMovementWithUser) => {
  if (record.movementType !== "ADJUSTMENT") {
    return movementTypeLabelMap[record.movementType];
  }

  return record.adjustmentDirection === "DECREASE"
    ? "Adjustment -"
    : "Adjustment +";
};

interface ColumnsProps {
  onEdit: (record: SparepartMovementWithUser) => void;
  onDelete: (record: SparepartMovementWithUser) => void;
  stockByItemKey: Record<string, number>;
}

export const getColumns = ({
  onEdit,
  onDelete,
  stockByItemKey,
}: ColumnsProps): ColumnDef<SparepartMovementWithUser>[] => [
  {
    accessorKey: "no",
    header: () => <div className="text-center">No.</div>,
    cell: ({ row }) => <div className="text-center">{row.index + 1}</div>,
  },
  {
    accessorKey: "movedAt",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="px-0"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Waktu Pindah
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="text-sm">
        {new Date(row.original.movedAt).toLocaleString("id-ID")}
      </div>
    ),
  },
  {
    accessorKey: "deviceFamily",
    header: "Device",
    cell: ({ row }) => familyLabelMap[row.original.deviceFamily] ?? row.original.deviceFamily,
  },
  {
    accessorKey: "partType",
    header: "Jenis Sparepart",
    cell: ({ row }) => SPAREPART_PART_TYPE_LABELS[row.original.partType],
  },
  {
    accessorKey: "sourceOptionValue",
    header: "Sparepart",
  },
  {
    accessorKey: "movementType",
    header: "Mutasi",
    cell: ({ row }) => getMovementLabel(row.original),
  },
  {
    accessorKey: "quantity",
    header: () => <div className="text-center">Qty</div>,
    cell: ({ row }) => (
      <div className="text-center">{row.original.quantity.toLocaleString("id-ID")}</div>
    ),
  },
  {
    id: "currentStock",
    header: () => <div className="text-center">Stock Saat Ini</div>,
    cell: ({ row }) => {
      const itemKey = getSparepartItemKey(
        row.original.deviceFamily,
        row.original.partType,
        row.original.sourceOptionId
      );
      return (
        <div className="text-center">
          {(stockByItemKey[itemKey] ?? 0).toLocaleString("id-ID")}
        </div>
      );
    },
  },
  {
    id: "user",
    header: "User Pakai",
    cell: ({ row }) => row.original.user?.namaLengkap ?? "-",
  },
  {
    accessorKey: "notes",
    header: "Notes",
    cell: ({ row }) => row.original.notes || "-",
  },
  {
    id: "actions",
    header: () => <div className="text-center">Actions</div>,
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
