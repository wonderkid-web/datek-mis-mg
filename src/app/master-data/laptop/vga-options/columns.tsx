
// @ts-nocheck
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { LaptopVgaOption } from "@prisma/client";
import { ArrowUpDown, Pencil, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ColumnsProps {
  handleDelete: (id: string) => void;
  handleEdit: (vgaOption: LaptopVgaOption) => void;
}

export const columns = ({ handleDelete, handleEdit }: ColumnsProps): ColumnDef<LaptopVgaOption>[] => [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "value",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Value
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-center">Actions</div>,
    cell: ({ row }) => {
      const vgaOption = row.original;

      return (
        <div className="flex items-center justify-center space-x-2">
          <Button variant="ghost" size="icon" onClick={() => handleEdit(vgaOption)}>
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleDelete(vgaOption.id)}>
            <Trash className="h-4 w-4 text-red-600" />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      );
    },
  },
];
