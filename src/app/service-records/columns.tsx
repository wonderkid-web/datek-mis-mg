"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ServiceRecord, AssetAssignment, Asset, User } from "@prisma/client";

// Extends ServiceRecord to include nested details for the table
export type ServiceRecordWithDetails = ServiceRecord & {
  assetAssignment: AssetAssignment & {
    asset: Asset;
    user: User;
  };
};

export const columns: ColumnDef<ServiceRecordWithDetails>[] = [
  {
    accessorKey: "no",
    header: () => <div className="text-center">No</div>,
    cell: ({ row }) => <p className="text-right">{row.index + 1}</p>,
  },
  {
    accessorKey: "ticketHelpdesk",
    header: () => <div className="text-center">No</div>,
  },
  {
    accessorKey: "assetAssignment.nomorAsset",
    header: () => <div className="text-center">No</div>,
  },
  {
    accessorKey: "assetAssignment.user.namaLengkap",
    header: () => <div className="text-center">No</div>,
  },
  {
    accessorKey: "repairType",
    header: () => <div className="text-center">No</div>,
    cell: ({ row }) => (
      <div className="text-center">{row.getValue("repairType")}</div>
    ),
  },
  {
    accessorKey: "cost",
    header: () => <div className="text-center">No</div>,
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
    header: () => <div className="text-center">No</div>,
  },
  {
    accessorKey: "createdAt",
    header: () => <div className="text-center">No</div>,
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      const formatted = date.toLocaleDateString("id-ID");
      return <div className="text-center">{formatted}</div>;
    },
  },
];
