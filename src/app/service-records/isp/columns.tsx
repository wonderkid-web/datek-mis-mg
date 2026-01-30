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
import { formattedDateDay } from "@/helper";

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
    cell: ({ row }) => {
      const value = row.getValue("reportDate");
      const date = value ? new Date(value as string) : null;
      return (
        <div className="text-center">
          {date ? formattedDateDay(date).split("-")[0] : "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "sbu",
    header: ({ column }) => {
      return (
        <div
          className="text-center"
        >

          <Button

            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            SBU
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => row.original.sbu.replaceAll("_", " "),
  },
  {
    accessorKey: "isp.isp", // Access nested ISP name
    header: () => (
      <div className="text-center">
        ISP Name
      </div>
    ),
    cell: ({ row }) => (<div className="text-center">
      <p>{row.original.isp.isp}</p>
    </div>),
  },
  {
    accessorKey: "bandwidth",
    header: "Bandwidth",
  },
  {
    accessorKey: "downloadSpeed",
    header: () => (
      <div className="text-center">
        Download (Mbps)
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-center">
        {row.original.downloadSpeed} Mbps
      </div>
    ),
  },
  {
    accessorKey: "uploadSpeed",
    header: () => (
      <div className="text-center">
        Upload (Mbps)
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-center">
        {row.original.uploadSpeed} Mbps
      </div>
    ),
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
