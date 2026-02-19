"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ProblemSequenceWithIsp } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Edit, Trash2 } from "lucide-react";

interface ColumnOptions {
  onEdit: (record: ProblemSequenceWithIsp) => void;
  onDelete: (record: ProblemSequenceWithIsp) => void;
}

export const getColumns = ({ onEdit, onDelete }: ColumnOptions): ColumnDef<ProblemSequenceWithIsp>[] => [
  {
    accessorKey: "ticketNumber",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        No Tiket
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="text-center">
        {row.getValue("ticketNumber") || "-"}
      </div>
    ),
  },
  {
    accessorKey: "sbu",
    header: "SBU",
    cell: ({ row }) => row.original.sbu.replaceAll("_", " "),
  },
  {
    accessorKey: "isp.isp",
    header: "ISP",
  },
  {
    accessorKey: "dateDown",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Date Down
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const value = row.getValue<Date>("dateDown");
      return value ? new Date(value).toLocaleString("id-ID") : "-";
    },
  },
  {
    accessorKey: "dateDoneUp",
    header: "Done Up",
    cell: ({ row }) => {
      const value = row.getValue<Date>("dateDoneUp");
      return value ? new Date(value).toLocaleString("id-ID") : "-";
    },
  },
  {
    id: "sla",
    header: "SLA",
    cell: ({ row }) => {
      const down = new Date(row.original.dateDown).getTime();
      const up = new Date(row.original.dateDoneUp).getTime();
      if (Number.isNaN(down) || Number.isNaN(up)) return "-";
      const diffMs = Math.abs(up - down);
      const diffSec = Math.floor(diffMs / 1000);
      const days = Math.floor(diffSec / 86400);
      const hours = Math.floor((diffSec % 86400) / 3600);
      const minutes = Math.floor((diffSec % 3600) / 60);
      const seconds = diffSec % 60;
      return `${days}d ${hours}h ${minutes}m ${seconds}s`;
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <div className="flex gap-2 justify-center">
        <Button
          variant="outline"
          size="icon"
          onClick={(event) => {
            event.stopPropagation();
            onEdit(row.original);
          }}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="destructive"
          size="icon"
          onClick={(event) => {
            event.stopPropagation();
            onDelete(row.original);
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    ),
  },
];
