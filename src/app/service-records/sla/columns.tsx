"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  formatActualisation,
  formatDurationSeconds,
  getSlaMonthLabel,
} from "@/lib/ispSlaUtils";

import { IspSlaRecordWithIsp } from "./types";

interface ColumnsProps {
  handleView: (slaRecord: IspSlaRecordWithIsp) => void;
  handleEdit: (slaRecord: IspSlaRecordWithIsp) => void;
  handleDelete: (id: number) => void;
  isAdmin: boolean;
}

export const columns = ({
  handleView,
  handleEdit,
  handleDelete,
  isAdmin,
}: ColumnsProps): ColumnDef<IspSlaRecordWithIsp>[] => [
  {
    accessorKey: "no",
    header: "No.",
    cell: ({ row }) => row.index + 1,
  },
  {
    accessorKey: "sbu",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        SBU
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => row.original.sbu.replaceAll("_", " "),
  },
  {
    accessorKey: "isp.isp",
    header: "ISP",
    cell: ({ row }) => row.original.isp.isp,
  },
  {
    accessorKey: "month",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Month
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => getSlaMonthLabel(row.original.month),
  },
  {
    accessorKey: "year",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Year
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "contract",
    header: "Contract",
  },
  {
    accessorKey: "actualisation",
    header: "Actualisation",
    cell: ({ row }) => formatActualisation(row.original.actualisation),
  },
  {
    accessorKey: "uptimeSeconds",
    header: "Uptime",
    cell: ({ row }) => formatDurationSeconds(row.original.uptimeSeconds),
  },
  {
    accessorKey: "downtimeSeconds",
    header: "Downtime",
    cell: ({ row }) => formatDurationSeconds(row.original.downtimeSeconds),
  },
  // {
  //   accessorKey: "remarks",
  //   header: "Remarks",
  //   cell: ({ row }) => row.original.remarks || "-",
  // },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const slaRecord = row.original;

      return (
        <div className="flex justify-center gap-2">
          <Button variant="outline" size="sm" onClick={() => handleView(slaRecord)}>
            View
          </Button>
          {isAdmin && (
            <>
              <Button variant="outline" size="sm" onClick={() => handleEdit(slaRecord)}>
                Edit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(slaRecord.id)}
              >
                Delete
              </Button>
            </>
          )}
        </div>
      );
    },
  },
];
