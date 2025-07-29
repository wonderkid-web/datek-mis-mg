"use client";

import { ColumnDef } from "@tanstack/react-table";
import { AssetAssignment } from "@prisma/client";

export const columns: ColumnDef<AssetAssignment>[] = [
  {
    accessorKey: "asset.namaAsset",
    header: "Asset Name",
  },
  {
    accessorKey: "nomorAsset",
    header: "Asset Number",
  },
  {
    accessorKey: "user.namaLengkap",
    header: "Assigned To",
  },
  {
    accessorKey: "tanggalPeminjaman",
    header: "Assignment Date",
    cell: ({ row }) => {
      const date = new Date(row.original.tanggalPeminjaman);
      return date.toLocaleDateString();
    },
  },
  {
    accessorKey: "tanggalPengembalian",
    header: "Return Date",
    cell: ({ row }) => {
      const date = row.original.tanggalPengembalian;
      return date ? new Date(date).toLocaleDateString() : "-";
    },
  },
  {
    accessorKey: "kondisiSaatPeminjaman",
    header: "Condition at Assignment",
  },
  {
    accessorKey: "kondisiSaatPengembalian",
    header: "Condition at Return",
  },
  {
    accessorKey: "catatan",
    header: "Notes",
  },
];