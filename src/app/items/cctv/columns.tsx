"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Pencil, ArrowUpDown, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Asset } from "@/lib/types";


const StatusBadge = ({ status }: { status: string }) => {
  const getStatusClass = () => {
    switch (status) {
      case "GOOD":
        return "bg-green-100 text-green-800 border-green-400";
      case "SERVICE":
        return "bg-yellow-100 text-yellow-800 border-yellow-400";
      case "RUSAK":
      case "BROKEN":
        return "bg-red-100 text-red-800 border-red-400";
      case "TROUBLE":
        return "bg-orange-100 text-orange-800 border-orange-400";
      default:
        return "bg-gray-100 text-gray-800 border-gray-400";
    }
  };
  return <Badge className={getStatusClass()}>{status}</Badge>;
};

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
    // {
    //   header: "CCTV Name",
    //   accessorFn: (row) => row.namaAsset ?? "-",
    // },
    {
      accessorKey: "cctvSpecs.id",
      cell: ({ row }) => <p className="text-center">{row.original.cctvSpecs?.channelCamera?.sbu.replaceAll("_", " ") ?? "-"}</p>,
      header: ({ column }) => {
        return (
          <div className="text-center">
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Perusahaan
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
    {
      accessorKey: "cctvSpecs.channelCamera.lokasi",
      cell: ({ row }) => <p className="text-left">{row.original.cctvSpecs?.channelCamera?.lokasi ?? "-"} </p>,
      header: ({ column }) => {
        return (
          <div className="text-center">
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Site Camera
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
    {
      accessorKey: "deviceType",
      header: ({ column }) => {
        return (
          <div className="text-center">
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Device Type
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        );
      },
      // accessorFn: (row) => ,
      cell: ({ row }) => <p className="text-center">{row.original.cctvSpecs?.deviceType?.value ?? "-"}</p>


    },
    {
      accessorKey: "power",
      header: ({ column }) => {
        return (
          <div className="text-center">
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Power
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        );
      },
      // accessorFn: (row) => ,
      cell: ({ row }) => <p className="text-center">{row.original.cctvSpecs?.power ?? "-"}</p>


      // cell: ({ row }) => <p className="text-center">{row.original.cctvSpecs?.power ?? "-"}</p>
    },
    {
      header: "IP Address",
      accessorFn: (row) => row.cctvSpecs?.ipAddress ?? "-",
    },
    // {
    //   accessorKey: "statusAsset",
    //   header: "Status",
    //   cell: ({ row }) => <StatusBadge status={row.original.statusAsset} />,
    // },
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

