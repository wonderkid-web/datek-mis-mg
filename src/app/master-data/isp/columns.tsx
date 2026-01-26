"use client";

import { ColumnDef } from "@tanstack/react-table";
import { IspClient } from "./page";
import { ArrowUpDown, Edit, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ColumnsProps {
  handleView: (isp: IspClient) => void;
  handleEdit: (isp: IspClient) => void;
  handleDelete: (id: number) => void;
}

export const columns = ({ handleView, handleEdit, handleDelete }: ColumnsProps): ColumnDef<IspClient>[] => [
  {
    id: "no",
    header: () => <div className="text-center">No</div>,
    cell: ({ row }) => {
        const rowIndex = row.index + 1;
        return <div className="text-center">{rowIndex}</div>;
    }
  },
  // {
  //   accessorKey: "sbu",
  //   header: ({ column }) => (
  //     <Button
  //       variant="ghost"
  //       onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
  //       className="w-full justify-center"
  //     >
  //       SBU
  //       <ArrowUpDown className="ml-2 h-4 w-4" />
  //     </Button>
  //   ),
  //   cell: ({ row }) => <div className="text-center">{row.original.sbu.replace(/_/g, " ")}</div>,
  // },
  {
    accessorKey: "isp",
    header: () => <div className="text-center">ISP</div>,
    cell: ({ row }) => <div className="text-center">{row.original.isp}</div>,
  },
  {
    accessorKey: "transmisi",
    header: () => <div className="text-center">Transmisi</div>,
    cell: ({ row }) => <div className="text-center">{row.original.transmisi}</div>,
  },
  {
    accessorKey: "bandwidth",
    header: () => <div className="text-center">Bandwidth</div>,
    cell: ({ row }) => <div className="text-center">{row.original.bandwidth}</div>,
  },
  {
    accessorKey: "ipPublic",
    header: () => <div className="text-center">IP Public</div>,
    cell: ({ row }) => <div className="text-center">{row.original.ipPublic}</div>,
  },
  {
    accessorKey: "productService",
    header: () => <div className="text-center">Product Service</div>,
    cell: ({ row }) => <div className="text-center">{row.original.productService}</div>,
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const isp = row.original;
      return (
        <div className="flex justify-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleView(isp)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleEdit(isp)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="destructive"
            size="icon"
            onClick={() => handleDelete(isp.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];
