"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CctvRepetitiveMaintenance, CCTVStatus, CctvChannelCamera, CctvSpecs, Asset, CctvBrand, CctvModel, CctvDeviceType } from "@prisma/client";
import { ArrowUpDown, Edit, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Extend the type to include the nested relations we will fetch
export type MaintenanceWithDetails = CctvRepetitiveMaintenance & {
  channelCamera: (CctvChannelCamera & {
    cctvSpecs: (CctvSpecs & {
      brand: CctvBrand | null;
      model: CctvModel | null;
      deviceType: CctvDeviceType | null;
      asset: Asset;
      channelCamera: {
        lokasi: string;
      } | null;
    })[];
  }) | null;
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
    // Tengahin Header
    header: () => <div className="text-center">No</div>,
    // Tengahin Cell
    cell: ({ row }) => {
        const rowIndex = row.index + 1;
        return <div className="text-center">{rowIndex}</div>;
    }
  },
  {
    accessorKey: "periode",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        // Tambahkan w-full dan justify-center agar tombol ke tengah
        className="w-full justify-center"
      >
        Report Date
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    // Tengahin tanggal
    cell: ({ row }) => (
      <div className="text-center">
        {new Date(row.original.periode).toLocaleDateString()}
      </div>
    ),
  },
  {
    accessorKey: "perusahaan",
    // Tengahin Header String
    header: () => <div className="text-center">Perusahaan</div>,
    // Tengahin Cell
    cell: ({ row }) => (
      <div className="text-center">
        {row.original.perusahaan.replace(/_/g, " ")}
      </div>
    ),
  },
  {
    accessorKey: "channelCamera.cctvSpecs[0].channelCamera.lokasi",
    // Tengahin Header String
    header: () => <div className="text-center">Channel Camera</div>,
    // Tengahin Cell
    cell: ({ row }) => (
      <div className="text-center">
        {row.original.channelCamera?.cctvSpecs?.[0]?.channelCamera?.lokasi ?? "-"}
      </div>
    ),
  },
  {
    accessorKey: "status",
    // Tengahin Header String
    header: () => <div className="text-center">Status</div>,
    // Gunakan flex justify-center untuk komponen Badge
    cell: ({ row }) => (
      <div className="flex justify-center">
        <StatusBadge status={row.original.status} />
      </div>
    ),
  },
  {
    id: "actions",
    // Actions dibiarkan sesuai request (sudah ada flex justify-center di dalamnya)
    cell: ({ row }) => {
      const maintenance = row.original;
      return (
        <div className="flex justify-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleView(maintenance)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleEdit(maintenance)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="destructive"
            size="icon"
            onClick={() => handleDelete(maintenance.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];