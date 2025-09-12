import { ColumnDef } from "@tanstack/react-table";
import { Asset } from "@/lib/types";

// Read-only columns definition for export
export const exportColumns: ColumnDef<Asset>[] = [
  {
    accessorKey: "id",
    header: "No.",
    cell: ({ row, table }) => {
      const { pageIndex, pageSize } = table.getState().pagination;
      return pageIndex * pageSize + row.index + 1;
    },
  },
  {
    accessorKey: "namaAsset",
    header: "Asset Name",
  },
  {
    accessorKey: "category.nama",
    header: "Category",
    cell: ({ row }) => row.original.category?.nama || "N/A",
  },
  {
    accessorKey: "nomorSeri",
    header: "Serial Number",
  },
  {
    accessorKey: "statusAsset",
    header: "Status",
  },
  {
    accessorKey: "assignedTo",
    header: "Assigned To",
    cell: ({ row }) =>
      // @ts-expect-error its okay
      row.original.assignments?.[0]?.user?.namaLengkap || "Not Assigned",
  },
];
