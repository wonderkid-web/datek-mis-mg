"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ServiceRecordWithDetails } from "./columns";

const formatterIDR = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export const exportColumns: ColumnDef<ServiceRecordWithDetails>[] = [
  {
    accessorKey: "no",
    header: "No",
    cell: ({ row }) => row.index + 1,
  },
  {
    accessorKey: "ticketHelpdesk",
    header: "No. Tiket",
  },
  {
    accessorKey: "assetAssignment.nomorAsset",
    header: "Asset Number",
  },
  {
    accessorKey: "assetAssignment.user.namaLengkap",
    header: "Full Name",
  },
  {
    accessorKey: "repairType",
    header: "Type",
  },
  {
    accessorKey: "cost",
    header: "Cost",
    cell: ({ row }) => {
      const amount = Number(row.getValue("cost") ?? 0);
      return formatterIDR.format(amount);
    },
  },
  {
    accessorKey: "remarks",
    header: "Remarks",
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return date.toLocaleDateString("id-ID");
    },
  },
];