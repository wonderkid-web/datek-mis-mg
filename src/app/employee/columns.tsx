"use client";

import { ColumnDef } from "@tanstack/react-table";
import { User } from "@prisma/client";
import { Pencil, ArrowUpDown, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ColumnsProps {
  handleDelete: (id: string) => void;
  handleEdit: (user: User) => void;
}

export const columns = ({
  handleDelete,
  handleEdit,
}: ColumnsProps): ColumnDef<User>[] => [
  {
    accessorKey: "id",
    header: () => <div className="text-center">No</div>,
    cell: ({ row }) => <div className="text-right">{row.index + 1}</div>,
  },
  // {
  //   accessorKey: "nik",
  //   header: ({ column }) => {
  //     return (
  //       <div className="text-center">
  //         <Button
  //           variant="ghost"
  //           onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
  //         >
  //           NIK
  //           <ArrowUpDown className="ml-2 h-4 w-4" />
  //         </Button>
  //       </div>
  //     );
  //   },
  // },
  {
    accessorKey: "namaLengkap",
    header: ({ column }) => {
      return (
        <div className="text-center">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Full Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
  {
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <div className="text-center">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Email
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => <div className="text-center">{row.original.email}</div>,
  },
  {
    accessorKey: "departemen",
    header: () => <div className="text-center">Department</div>,
    cell: ({ row }) => (
      <div className="text-center">{row.original.departemen}</div>
    ),
  },
  {
    accessorKey: "lokasiKantor",
    header: () => <div className="text-center">Corporate</div>,
    cell: ({ row }) => (
      <div className="text-center">{row.original.lokasiKantor}</div>
    ),
  },
  {
    accessorKey: "jabatan",
    header: () => <div className="text-center">Home Base</div>,
    cell: ({ row }) => (
      <div className="text-center">{row.original.jabatan}</div>
    ),
  },
  {
    accessorKey: "isActive",
    header: () => <div className="text-center">Active</div>,
    cell: ({ row }) => (
      <div
        className={`text-center px-2 py-1 rounded-full text-white ${
          row.original.isActive ? "bg-green-500" : "bg-red-500"
        }`}
      >
        {row.original.isActive ? "Yes" : "No"}
      </div>
    ),
  },
  {
    id: "actions",
    header: () => <div className="text-center">Actions</div>,
    cell: ({ row }) => {
      const user = row.original;

      return (
        <div className="flex items-center justify-center space-x-2">
          {/* <Button variant="ghost" size="icon" onClick={() => handleView(user)}>
            <Eye className="h-4 w-4" />
            <span className="sr-only">View</span>
          </Button> */}
          <Button variant="ghost" size="icon" onClick={() => handleEdit(user)}>
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleDelete(user.id)}>
            <Trash className="h-4 w-4" />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      );
    },
  },
];
