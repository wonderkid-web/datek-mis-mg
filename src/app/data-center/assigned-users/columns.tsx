"use client";

import { ColumnDef } from "@tanstack/react-table";
import { AssetAssignment } from "@prisma/client";
import { Pencil, Archive, Eye } from "lucide-react"; // Import icons
import { Button } from "@/components/ui/button";

interface ColumnsProps {
  handleEdit: (assignment: AssetAssignment) => void;
  handleReturn: (assignment: AssetAssignment) => void;
  handleView: (assignment: AssetAssignment) => void; // New prop
}

export const columns = ({ handleEdit, handleReturn, handleView }: ColumnsProps): ColumnDef<AssetAssignment>[] => [
  {
    accessorKey: "id",
    header: () => <div className="text-center">No</div>,
    cell: ({ row }) => <div className="text-right">{row.index + 1}</div>,
  },
  {
    accessorKey: "nomorAsset",
    header: "Asset Number",
  },
  {
    accessorKey: "asset.namaAsset",
    header: "Asset Name",
  },
  {
    accessorKey: "user.namaLengkap",
    header: "Assigned To",
  },
  {
    accessorKey: "tanggalPeminjaman",
    header: "Assignment Date",
    cell: ({ row }) => {
        {/* @ts-expect-error its okay */}
      const date = new Date(row.original.tanggalPeminjaman);
      return date.toLocaleDateString();
    },
  },
  {
    accessorKey: "catatan",
    header: "Notes",
  },
  {
    id: "actions",
    header: () => <div className="text-center">Actions</div>,
    cell: ({ row }) => {
      const assignment = row.original;

      return (
        <div className="flex items-center justify-center space-x-2">
          <Button variant="ghost" size="icon" onClick={() => handleView(assignment)}> {/* View button */}
            <Eye className="h-4 w-4" />
            <span className="sr-only">View</span>
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleEdit(assignment)}>
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleReturn(assignment)}>
            <Archive className="h-4 w-4" />
            <span className="sr-only">Return</span>
          </Button>
        </div>
      );
    },
  },
];