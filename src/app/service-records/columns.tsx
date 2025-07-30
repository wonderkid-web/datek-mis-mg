
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
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "ticketHelpdesk",
    header: "Ticket Helpdesk",
  },
  {
    accessorKey: "assetAssignment.nomorAsset",
    header: "Asset Number",
  },
  {
    accessorKey: "assetAssignment.user.namaLengkap",
    header: "User",
  },
  {
    accessorKey: "repairType",
    header: "Repair Type",
  },
  {
    accessorKey: "cost",
    header: "Cost",
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
    header: "Remarks",
  },
    {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      const formatted = date.toLocaleDateString("id-ID");
      return <div>{formatted}</div>;
    },
  },
];
