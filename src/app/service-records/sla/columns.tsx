"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  formatActualisation,
  formatDurationSeconds,
  formatSlaSbuLabel,
  getSlaMonthLabel,
} from "@/lib/ispSlaUtils";

import { IspSlaRecordWithIsp } from "./types";

type SlaColumnDef = ColumnDef<IspSlaRecordWithIsp> & {
  headerClassName?: string;
  cellClassName?: string;
};

interface ColumnsProps {
  handleEdit: (slaRecord: IspSlaRecordWithIsp) => void;
  handleDelete: (id: number) => void;
  isAdmin: boolean;
}

export const columns = ({
  handleEdit,
  handleDelete,
  isAdmin,
}: ColumnsProps): SlaColumnDef[] => [
  {
    accessorKey: "no",
    header: "No.",
    cell: ({ row, table }) => {
      const rows = table.getRowModel().rows;
      const currentIndex = rows.findIndex((currentRow) => currentRow.id === row.id);
      const { pageIndex, pageSize } = table.getState().pagination;

      if (currentIndex < 0) {
        return row.index + 1;
      }

      return pageIndex * pageSize + currentIndex + 1;
    },
    headerClassName: "text-center",
    cellClassName: "text-center",
  },
  {
    accessorKey: "sbu",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="w-full justify-center"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        SBU
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => formatSlaSbuLabel(row.original.sbu),
    headerClassName: "text-center",
  },
  {
    accessorKey: "isp.isp",
    header: () => <div className="text-center">ISP</div>,
    cell: ({ row }) => row.original.isp.isp,
    headerClassName: "text-center",
  },
  {
    accessorKey: "month",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="w-full justify-center"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Month
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => getSlaMonthLabel(row.original.month),
    headerClassName: "text-center",
    cellClassName: "text-center",
  },
  {
    accessorKey: "year",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="w-full justify-center"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Year
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    headerClassName: "text-center",
    cellClassName: "text-center",
  },
  {
    accessorKey: "contract",
    header: () => <div className="text-center">Contract</div>,
    headerClassName: "text-center",
    cellClassName: "text-center",
  },
  {
    accessorKey: "actualisation",
    header: () => <div className="text-center">Actualisation</div>,
    cell: ({ row }) => formatActualisation(row.original.actualisation),
    headerClassName: "text-center",
    cellClassName: "text-center",
  },
  {
    accessorKey: "uptimeSeconds",
    header: () => <div className="text-center">Uptime</div>,
    cell: ({ row }) => formatDurationSeconds(row.original.uptimeSeconds),
    headerClassName: "text-center",
    cellClassName: "text-center",
  },
  {
    accessorKey: "downtimeSeconds",
    header: () => <div className="text-center">Downtime</div>,
    cell: ({ row }) => formatDurationSeconds(row.original.downtimeSeconds),
    headerClassName: "text-center",
    cellClassName: "text-center",
  },
  {
    id: "actions",
    enableHiding: false,
    header: () => <div className="text-center">Actions</div>,
    headerClassName: "text-center",
    cellClassName: "text-center",
    cell: ({ row }) => {
      const slaRecord = row.original;

      return (
        <div className="flex justify-center gap-2">
          {isAdmin && (
            <>
              <Button
                variant="outline"
                size="icon"
                aria-label="Edit SLA"
                onClick={(event) => {
                  event.stopPropagation();
                  handleEdit(slaRecord);
                }}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="destructive"
                size="icon"
                aria-label="Delete SLA"
                onClick={(event) => {
                  event.stopPropagation();
                  handleDelete(slaRecord.id);
                }}
              >
                <Trash2 className="h-4 w-4 text-white" />
              </Button>
            </>
          )}
        </div>
      );
    },
  },
];
