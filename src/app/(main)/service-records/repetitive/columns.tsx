import { ColumnDef } from "@tanstack/react-table";
import { PrinterRepetitiveMaintenance } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Edit, Trash2 } from "lucide-react";
import { getNotesPrinter } from "@/lib/printerRepetitiveMaintenanceService";
import Inspect from "@/components/Inspect";
import React from "react";

interface ColumnsProps {
  handleEditClick: (record: PrinterRepetitiveMaintenance) => void;
  handleDeleteClick: (record: PrinterRepetitiveMaintenance) => void;
}

export const getColumns = ({
  handleEditClick,
  handleDeleteClick,
}: ColumnsProps): ColumnDef<PrinterRepetitiveMaintenance>[] => {
  // const notes = await prisma.

  return [
    {
      accessorKey: "no",
      header: () => <div className="text-center">No.</div>,
      cell: ({ row }) => <div className="text-center">{row.index + 1}</div>,
    },
    {
      accessorKey: "reportDate",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-center"
          >
            Report Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const date = new Date(row.getValue("reportDate"));
        return <div className="text-center">{date.toLocaleDateString()}</div>;
      },
    },
    {
      accessorKey: "assetDetails",
      header: () => <div className="text-center">Asset Details</div>,
      cell: ({ row }) => {
        const assetDetails = row.getValue("assetDetails") as string;
        // Extract NamaAsset from the assetDetails string
        const match = assetDetails.match(/Asset: ([^\-]+)/);
        const namaAsset = match ? match[1].trim() : "N/A";
        return <div className="text-center">{namaAsset}</div>;
      },
    },
    {
      accessorKey: "totalPages",
      header: () => <div className="text-center">Total Pages</div>,
      cell: ({ row }) => (
        <div className="text-center">{row.getValue("totalPages")}</div>
      ),
    },
    {
      accessorKey: "catatan",
      header: () => <div className="text-center">Notes</div>,
      cell: ({ row }) => (
        <div className="text-center">{row.getValue("catatan")}</div>
      ),
    },
    {
      accessorKey: "blackCount",
      header: () => <div className="text-center">Black</div>,
      cell: ({ row }) => (
        <div className="text-center">{row.getValue("blackCount")}</div>
      ),
    },
    {
      accessorKey: "yellowCount",
      header: () => <div className="text-center">Yellow</div>,
      cell: ({ row }) => (
        <div className="text-center">{row.getValue("yellowCount")}</div>
      ),
    },
    {
      accessorKey: "magentaCount",
      header: () => <div className="text-center">Magenta</div>,
      cell: ({ row }) => (
        <div className="text-center">{row.getValue("magentaCount")}</div>
      ),
    },
    {
      accessorKey: "cyanCount",
      header: () => <div className="text-center">Cyan</div>,
      cell: ({ row }) => (
        <div className="text-center">{row.getValue("cyanCount")}</div>
      ),
    },
    {
      accessorKey: "remarks",
      header: () => <div className="text-center">Remarks</div>,
      cell: ({ row }) => (
        <div className="text-center">{row.getValue("remarks")}</div>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-center">Actions</div>,
      cell: ({ row }) => {
        const record = row.original;

        return (
          <div className="flex space-x-2 justify-center">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleEditClick(record)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="destructive"
              size="icon"
              onClick={() => handleDeleteClick(record)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];
};

function NotesCell({ printerId }: { printerId: string }) {
  const [notes, setNotes] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  if (loading) return <div className="text-center">Loading...</div>;

  return <div className="text-center">{notes}</div>;
}
