"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Eye, Pencil, Trash } from "lucide-react";

export interface IpAddressRow {
  id: number;
  ip: string;
  macWlan: string | null;
  connection: "WIFI" | "ETHERNET";
  status: "EMPLOYEE" | "GUEST_LAPTOP" | "GUEST_PHONE";
  role: "LIST" | "FULL_ACCESS";
  company: string | null;
  user: { id: number; namaLengkap: string };
  assetAssignment?: {
    id: number;
    nomorAsset: string | null;
    asset?: {
      id: number;
      namaAsset: string;
      nomorSeri: string;
      laptopSpecs?: { brandOption?: { value: string } | null; macWlan: string | null } | null;
      intelNucSpecs?: { brandOption?: { value: string } | null; macWlan: string | null } | null;
      printerSpecs?: { brandOption?: { value: string } | null } | null;
    } | null;
  } | null;
}

interface ColumnsProps {
  onView: (row: IpAddressRow) => void;
  onEdit: (row: IpAddressRow) => void;
  onDelete: (id: number) => void;
}

const pretty = {
  connection: (v: string) => v,
  status: (v: string) =>
    v === "EMPLOYEE" ? "Employee" : v === "GUEST_LAPTOP" ? "Guest Laptop" : "Guest Phone",
  role: (v: string) => (v === "FULL_ACCESS" ? "Full Access" : "List"),
};

export const columns = ({ onView, onEdit, onDelete }: ColumnsProps): ColumnDef<IpAddressRow>[] => [
  {
    accessorKey: "id",
    header: () => <div className="text-center">No</div>,
    cell: ({ row }) => <div className="text-right">{row.index + 1}</div>,
  },
  {
    accessorKey: "user.namaLengkap",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="mx-auto"
      >
        User
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <p className="text-center">{row.original.user?.namaLengkap}</p>,
  },
  {
    accessorKey: "ip",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="mx-auto"
      >
        IP Address
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <p className="text-center font-mono">{row.original.ip}</p>,
  },
  {
    accessorKey: "macWlan",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="mx-auto"
      >
        Mac WLAN
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const { status, macWlan, assetAssignment } = row.original;
      const assetMac =
        assetAssignment?.asset?.laptopSpecs?.macWlan ||
        assetAssignment?.asset?.intelNucSpecs?.macWlan ||
        null;
      const value =
        status === "EMPLOYEE"
          ? assetMac || macWlan || "-"
          : macWlan || "-";
      return <p className="text-center font-mono">{value}</p>;
    },
  },
  {
    accessorKey: "connection",
    header: () => <div className="text-center">Connection</div>,
    cell: ({ row }) => <p className="text-center">{pretty.connection(row.original.connection)}</p>,
  },
  {
    accessorKey: "role",
    header: () => <div className="text-center">Role</div>,
    cell: ({ row }) => <p className="text-center">{pretty.role(row.original.role)}</p>,
  },
  {
    accessorKey: "status",
    header: () => <div className="text-center">Status</div>,
    cell: ({ row }) => <p className="text-center">{pretty.status(row.original.status)}</p>,
  },
  {
    accessorKey: "company",
    header: () => <div className="text-center">Company</div>,
    cell: ({ row }) => <p className="text-center">{row.original.company || "-"}</p>,
  },
  {
    accessorKey: "assetAssignment",
    header: () => <div className="text-center">Asset</div>,
    cell: ({ row }) => {
      const a = row.original.assetAssignment;
      if (!a) return <p className="text-center">-</p>;
      const brand =
        a.asset?.laptopSpecs?.brandOption?.value ||
        a.asset?.intelNucSpecs?.brandOption?.value ||
        a.asset?.printerSpecs?.brandOption?.value ||
        "";
      const label = [a.nomorAsset, a.asset?.namaAsset, brand].filter(Boolean).join(" • ");
      return <p className="text-center">{label || "-"}</p>;
    },
  },
  {
    id: "actions",
    header: () => <div className="text-center">Actions</div>,
    cell: ({ row }) => {
      const item = row.original;
      return (
        <div className="flex items-center justify-center space-x-2">
          <Button variant="ghost" size="icon" onClick={() => onView(item)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onEdit(item)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(item.id)}>
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];
