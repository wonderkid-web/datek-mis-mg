"use client";

import { ColumnDef } from "@tanstack/react-table";
import { IspReport, Isp } from "@prisma/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { format } from "date-fns";

// Define a type that includes the related ISP for display
export type IspReportWithIsp = IspReport & { isp: Isp };

interface ColumnsProps {
  handleView: (ispReport: IspReportWithIsp) => void;
  handleEdit: (ispReport: IspReportWithIsp) => void;
  handleDelete: (id: number) => void;
}

export const columns = ({ handleView, handleEdit, handleDelete }: ColumnsProps): ColumnDef<IspReportWithIsp>[] => [
  {
    accessorKey: "no",
    header: "No.",
    cell: ({ row }) => row.index + 1,
  },
  {
    accessorKey: "reportDate",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Report Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => format(new Date(row.original.reportDate), "PPP"),
  },
  {
    accessorKey: "sbu",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          SBU
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => row.original.sbu.replaceAll("_", " "),
  },
  {
    accessorKey: "isp.isp", // Access nested ISP name
    header: "ISP Name",
  },
  {
    accessorKey: "bandwidth",
    header: "Bandwidth",
  },
  {
    accessorKey: "downloadSpeed",
    header: "Download (Mbps)",
    cell: ({ row }) => {
      return <span className="mx-auto">{row.original.downloadSpeed} Mbps</span>;
    },
  },
  {
    accessorKey: "uploadSpeed",
    header: "Upload (Mbps)",
     cell: ({ row }) => {
      return <span className="mx-auto">{row.original.uploadSpeed} Mbps</span>;
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const ispReport = row.original;

      return (
        <div className="flex space-x-2 justify-center">
          <Button variant="outline" size="sm" onClick={() => handleView(ispReport)}>
            View
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleEdit(ispReport)}>
            Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={() => handleDelete(ispReport.id)}>
            Delete
          </Button>
        </div>
      );
    },
  },
];
