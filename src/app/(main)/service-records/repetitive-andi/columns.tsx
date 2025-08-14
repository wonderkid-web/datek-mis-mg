import { ColumnDef } from "@tanstack/react-table";
import { PrinterRepetitiveMaintenance } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Edit, Trash2 } from "lucide-react";

const TooltipItem = ({
  color,
  value,
  label,
}: {
  color: string;
  value: number | string;
  label: string;
}) => (
  <div className="relative group cursor-pointer w-fit">
    <div className="text-lg">
      {color} {value}
    </div>
    <div
      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block 
                    bg-gray-800 text-white text-xs rounded px-2 py-1 z-10 whitespace-nowrap"
    >
      {label}
    </div>
  </div>
);

interface ColumnsProps {
  handleEditClick: (record: PrinterRepetitiveMaintenance) => void;
  handleDeleteClick: (record: PrinterRepetitiveMaintenance) => void;
}

export const getColumns = ({
  handleEditClick,
  handleDeleteClick,
}: ColumnsProps): ColumnDef<PrinterRepetitiveMaintenance>[] => {
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
      accessorKey: "tonerCounts",
      header: () => <div className="text-center">Toner Usage</div>,
      cell: ({ row }) => {
        const black = row.original.blackCount || "";
        const yellow = row.original.yellowCount || "";
        const magenta = row.original.magentaCount || "";
        const cyan = row.original.cyanCount || "";

        return (
          // Di dalam cell:
          <div className="grid grid-cols-2 gap-2">
            <TooltipItem color="⚫" value={black} label="Black" />
            <TooltipItem color="🟡" value={yellow} label="Yellow" />
            <TooltipItem color="🟣" value={magenta} label="Magenta" />
            <TooltipItem color="🔵" value={cyan} label="Cyan" />
          </div>
        );
      },
    },
    {
      accessorKey: "tonerCounts",
      header: () => <div className="text-center">Toner Usage</div>,
      cell: ({ row }) => {
        const black = row.original.blackCount || "";
        const yellow = row.original.yellowCount || "";
        const magenta = row.original.magentaCount || "";
        const cyan = row.original.cyanCount || "";

        return (
          // Di dalam cell:
          <div className="grid grid-cols-2 gap-2">
            <TooltipItem color="⚫" value={black} label="Black" />
            <TooltipItem color="🟡" value={yellow} label="Yellow" />
            <TooltipItem color="🟣" value={magenta} label="Magenta" />
            <TooltipItem color="🔵" value={cyan} label="Cyan" />
          </div>
        );
      },
    },
    {
      accessorKey: "tonerCounts",
      header: () => <div className="text-center">Toner Usage</div>,
      cell: ({ row }) => {
        const black = row.original.blackCount || "";
        const yellow = row.original.yellowCount || "";
        const magenta = row.original.magentaCount || "";
        const cyan = row.original.cyanCount || "";

        return (
          // Di dalam cell:
          <div className="grid grid-cols-2 gap-2">
            <TooltipItem color="⚫" value={black} label="Black" />
            <TooltipItem color="🟡" value={yellow} label="Yellow" />
            <TooltipItem color="🟣" value={magenta} label="Magenta" />
            <TooltipItem color="🔵" value={cyan} label="Cyan" />
          </div>
        );
      },
    },
    {
      accessorKey: "tonerCounts",
      header: () => <div className="text-center">Toner Usage</div>,
      cell: ({ row }) => {
        const black = row.original.blackCount || "";
        const yellow = row.original.yellowCount || "";
        const magenta = row.original.magentaCount || "";
        const cyan = row.original.cyanCount || "";

        return (
          // Di dalam cell:
          <div className="grid grid-cols-2 gap-2">
            <TooltipItem color="⚫" value={black} label="Black" />
            <TooltipItem color="🟡" value={yellow} label="Yellow" />
            <TooltipItem color="🟣" value={magenta} label="Magenta" />
            <TooltipItem color="🔵" value={cyan} label="Cyan" />
          </div>
        );
      },
    },
    {
      accessorKey: "tonerCounts",
      header: () => <div className="text-center">Toner Usage</div>,
      cell: ({ row }) => {
        const black = row.original.blackCount || "";
        const yellow = row.original.yellowCount || "";
        const magenta = row.original.magentaCount || "";
        const cyan = row.original.cyanCount || "";

        return (
          // Di dalam cell:
          <div className="grid grid-cols-2 gap-2">
            <TooltipItem color="⚫" value={black} label="Black" />
            <TooltipItem color="🟡" value={yellow} label="Yellow" />
            <TooltipItem color="🟣" value={magenta} label="Magenta" />
            <TooltipItem color="🔵" value={cyan} label="Cyan" />
          </div>
        );
      },
    },
    {
      accessorKey: "tonerCounts",
      header: () => <div className="text-center">Toner Usage</div>,
      cell: ({ row }) => {
        const black = row.original.blackCount || "";
        const yellow = row.original.yellowCount || "";
        const magenta = row.original.magentaCount || "";
        const cyan = row.original.cyanCount || "";

        return (
          // Di dalam cell:
          <div className="grid grid-cols-2 gap-2">
            <TooltipItem color="⚫" value={black} label="Black" />
            <TooltipItem color="🟡" value={yellow} label="Yellow" />
            <TooltipItem color="🟣" value={magenta} label="Magenta" />
            <TooltipItem color="🔵" value={cyan} label="Cyan" />
          </div>
        );
      },
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
