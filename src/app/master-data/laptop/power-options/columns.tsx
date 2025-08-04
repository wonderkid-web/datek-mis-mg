// @ts-nocheck
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { LaptopPowerOption } from "@prisma/client";
import { ArrowUpDown, Pencil, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ColumnsProps {
  handleDelete: (id: string) => void;
  handleEdit: (powerOption: LaptopPowerOption) => void;
}

export const columns = ({ handleDelete, handleEdit }: ColumnsProps): ColumnDef<LaptopPowerOption>[] => [
    {
    accessorKey: "id",
    header: () => <div className="text-center">No</div>,
    cell: ({ row }) => <div className="text-right">{row.index + 1}</div>,
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
      const powerOption = row.original;

      return (
        <div className="flex items-center justify-center space-x-2">
          <Button variant="ghost" size="icon" onClick={() => handleEdit(powerOption)}>
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </Button>
            {/* @ts-expect-error its okay */}
          <Button variant="ghost" size="icon" onClick={() => handleDelete(powerOption.id)}>
            <Trash className="h-4 w-4 text-red-600" />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      );
    },
  },
];
