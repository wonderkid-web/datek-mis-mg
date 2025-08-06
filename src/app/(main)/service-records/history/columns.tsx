"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Asset, AssetAssignment, ServiceRecord, User } from "@prisma/client";

// Extends ServiceRecord to include nested details for the table
export type ServiceRecordWithDetails = ServiceRecord & {
  assetAssignment: AssetAssignment & {
    asset: Asset;
    user: User;
  };
};


export const getColumns = ({
  handleEditClick,
  handleDeleteClick,
}: any): ColumnDef<any>[] => [
  {
    accessorKey: "no",
    header: () => <div className="text-center">No</div>,
    cell: ({ row }) => <p className="text-right">{row.index + 1}</p>,
  },
  {
    accessorKey: "ticketHelpdesk",
    header: () => <div className="text-center">No. Tiket</div>,
  },
  {
    accessorKey: "assetAssignment.nomorAsset",
    header: () => <div className="text-center">Asset Number</div>,
  },
  {
    accessorKey: "assetAssignment.user.namaLengkap",
    header: () => <div className="text-center">Full Name</div>,
  },
  {
    accessorKey: "repairType",
    header: () => <div className="text-center">Type</div>,
    cell: ({ row }) => (
      <div className="text-center">{row.getValue("repairType")}</div>
    ),
  },
  {
    accessorKey: "cost",
    header: () => <div className="text-center">Cost</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("cost"));
      const formatted = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
      }).format(amount);
      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "remarks",
    header: () => <div className="text-center">Remarks</div>,
  },
  {
    accessorKey: "createdAt",
    header: () => <div className="text-center">Created At</div>,
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      const formatted = date.toLocaleDateString("id-ID");
      return <div className="text-center">{formatted}</div>;
    },
  },
  {
    id: "actions",
    header: () => <div className="text-center">Actions</div>,
    cell: ({ row }) => {
      const serviceRecord = row.original;

      return (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleEditClick(serviceRecord)}
          >
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDeleteClick(serviceRecord)}
          >
            <Trash className="h-4 w-4" />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      );
    },
  },
];
