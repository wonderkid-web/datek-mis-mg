
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
    header: "No",
    headerClassName: "text-center",
    cell: ({ row }) => <p className="text-right">{row.index + 1}</p>,
  },
  {
    accessorKey: "ticketHelpdesk",
    header: "Ticket Helpdesk",
    headerClassName: "text-center",
  },
  {
    accessorKey: "assetAssignment.nomorAsset",
    header: "Asset Number",
    headerClassName: "text-center",
  },
  {
    accessorKey: "assetAssignment.user.namaLengkap",
    header: "User",
    headerClassName: "text-center",
  },
  {
    accessorKey: "repairType",
    header: "Repair Type",
    headerClassName: "text-center",
    cell: ({ row }) => <div className="text-center">{row.getValue("repairType")}</div>,
  },
  {
    accessorKey: "cost",
    header: "Cost",
    headerClassName: "text-center",
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
    headerClassName: "text-center",
  },
    {
    accessorKey: "createdAt",
    header: "Date",
    headerClassName: "text-center",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      const formatted = date.toLocaleDateString("id-ID");
      return <div className="text-center">{formatted}</div>;
    },
  },
];
