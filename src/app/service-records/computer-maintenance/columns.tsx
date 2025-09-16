"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ComputerMaintenanceWithDetails } from "@/lib/types";

interface ColumnsProps {
  handleEditClick: (record: ComputerMaintenanceWithDetails) => void;
  handleDeleteClick: (record: ComputerMaintenanceWithDetails) => void;
}

export const getColumns = ({
  handleEditClick,
  handleDeleteClick,
}: ColumnsProps): ColumnDef<ComputerMaintenanceWithDetails>[] => [
  {
    accessorKey: "no",
    header: () => <div className="text-center">No.</div>,
    cell: ({ row }) => <div className="text-center">{row.index + 1}</div>,
  },
  {
    accessorKey: "periode",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="mx-auto"
      >
        Period
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const value = row.getValue("periode");
      const date = value ? new Date(value as string) : null;
      return (
        <div className="text-center">
          {date ? date.toLocaleDateString("id-ID") : "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "assetAssignment.nomorAsset",
    header: () => <div className="text-center">No Asset</div>,
    cell: ({ row }) => (
      <div className="text-center">
        {row.original.assetAssignment?.nomorAsset ?? "-"}
      </div>
    ),
  },
  {
    accessorKey: "assetAssignment.user.namaLengkap",
    header: () => <div className="text-center">Employee</div>,
    cell: ({ row }) => (
      <div className="text-center">
        {row.original.assetAssignment?.user?.namaLengkap ?? "-"}
      </div>
    ),
  },
  {
    accessorKey: "assetAssignment.asset.namaAsset",
    header: () => <div className="text-center">Asset</div>,
    cell: ({ row }) => (
      <div className="text-center">
        {row.original.assetAssignment?.asset?.namaAsset ?? "-"}
      </div>
    ),
  },
  {
    accessorKey: "connection",
    header: () => <div className="text-center">Connection</div>,
    cell: ({ row }) => (
      <div className="text-center">{row.getValue("connection") as string}</div>
    ),
  },
  {
    accessorKey: "storageSystemC",
    header: () => <div className="text-center">Storage C</div>,
    cell: ({ row }) => (
      <div className="text-center">{row.getValue("storageSystemC") || "-"}</div>
    ),
  },
  {
    accessorKey: "storageDataD",
    header: () => <div className="text-center">Storage D</div>,
    cell: ({ row }) => (
      <div className="text-center">{row.getValue("storageDataD") || "-"}</div>
    ),
  },
  {
    accessorKey: "health",
    header: () => <div className="text-center">Health</div>,
    cell: ({ row }) => (
      <div className="text-center">{row.getValue("health") || "-"}</div>
    ),
  },
  {
    accessorKey: "cpuFan",
    header: () => <div className="text-center">CPU Fan</div>,
    cell: ({ row }) => (
      <div className="text-center">{row.getValue("cpuFan") || "-"}</div>
    ),
  },
  {
    accessorKey: "temperature",
    header: () => <div className="text-center">Temperature</div>,
    cell: ({ row }) => {
      const value = row.getValue("temperature");
      if (value === null || value === undefined || value === "") {
        return <div className="text-center">-</div>;
      }
      const numeric = typeof value === "number" ? value : parseFloat(value as string);
      const formatted = Number.isNaN(numeric) ? "-" : `${numeric}°C`;
      return <div className="text-center">{formatted}</div>;
    },
  },
  {
    accessorKey: "windowsUpdate",
    header: () => <div className="text-center">Windows Update</div>,
    cell: ({ row }) => {
      const value = row.getValue("windowsUpdate");
      const date = value ? new Date(value as string) : null;
      return (
        <div className="text-center">
          {date ? date.toLocaleDateString("id-ID") : "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "remarks",
    header: () => <div className="text-center">Remarks</div>,
    cell: ({ row }) => (
      <div className="text-center">{row.getValue("remarks") || "-"}</div>
    ),
  },
  {
    id: "actions",
    header: () => <div className="text-center">Actions</div>,
    cell: ({ row }) => {
      const record = row.original;
      return (
        <div className="flex justify-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleEditClick(record)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="destructive"
            size="icon"
            onClick={() => handleDeleteClick(record)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];
