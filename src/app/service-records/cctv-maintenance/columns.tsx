"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CctvRepetitiveMaintenance, CCTVStatus } from "@prisma/client";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Extend the type to include the nested relations we will fetch
export type MaintenanceWithDetails = CctvRepetitiveMaintenance & {
  channelCamera: {
    lokasi: string;
    sbu: string;
  };
};

const StatusBadge = ({ status }: { status: CCTVStatus }) => {
    const getStatusClass = () => {
      switch (status) {
        case "GOOD":
          return "bg-green-100 text-green-800 border-green-400";
        case "TROUBLE":
          return "bg-yellow-100 text-yellow-800 border-yellow-400";
        case "BROKEN":
            return "bg-red-100 text-red-800 border-red-400";
        default:
          return "bg-gray-100 text-gray-800 border-gray-400";
      }
    };
    return <Badge className={getStatusClass()}>{status}</Badge>;
  };

interface ColumnsProps {
  handleView: (maintenance: MaintenanceWithDetails) => void;
  handleEdit: (maintenance: MaintenanceWithDetails) => void;
  handleDelete: (id: number) => void;
}

export const columns = ({ handleView, handleEdit, handleDelete }: ColumnsProps): ColumnDef<MaintenanceWithDetails>[] => [
  {
    id: "no",
    header: "No",
    cell: ({ row, table }) => {
        const rowIndex = row.index + 1;
        return <div>{rowIndex}</div>;
    }
  },
  {
    accessorKey: "periode",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Report Date
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => new Date(row.original.periode).toLocaleDateString(),
  },
  {
    accessorKey: "perusahaan",
    header: "Perusahaan",
    cell: ({ row }) => row.original.perusahaan.replace(/_/g, " "),
  },
  {
    accessorKey: "channelCamera.lokasi",
    header: "Channel Camera",
    cell: ({ row }) => `${row.original.channelCamera.lokasi}`,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const maintenance = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => handleView(maintenance)}>
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleEdit(maintenance)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleDelete(maintenance.id)}
              className="text-red-600"
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];