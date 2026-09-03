import { Asset } from "@/lib/types";
import { resolveAssetCompanyLabel } from "@/lib/assetCompany";

type AssetWithAssignment = Asset & {
  assignments?: Array<{
    nomorAsset?: string | null;
    user?: { namaLengkap?: string | null } | null;
  }>;
};

// Read-only columns definition for export (Excel & PDF)
export const exportColumns: Array<{
  header: string;
  accessorKey?: string;
  accessorFn?: (row: Asset, index: number) => unknown;
}> = [
  {
    header: "No.",
    accessorFn: (_row, index) => index + 1,
  },
  {
    header: "Asset Name",
    accessorFn: (row) =>
      row.category?.slug === "cctv"
        ? row.cctvSpecs?.channelCamera?.lokasi ?? row.namaAsset
        : row.namaAsset,
  },
  {
    header: "Asset Number",
    accessorFn: (row) =>
      (row as AssetWithAssignment).assignments?.[0]?.nomorAsset || "-",
  },
  {
    header: "Category",
    accessorFn: (row) => row.category?.nama || "N/A",
  },
  {
    header: "Serial Number",
    accessorKey: "nomorSeri",
  },
  {
    header: "Status",
    accessorKey: "statusAsset",
  },
  {
    header: "Lokasi Fisik",
    accessorFn: (row) => row.lokasiFisik || "-",
  },
  {
    header: "Company",
    accessorFn: (row) => resolveAssetCompanyLabel(row),
  },
  {
    header: "Assigned To",
    accessorFn: (row) =>
      (row as AssetWithAssignment).assignments?.[0]?.user?.namaLengkap ||
      "Not Assigned",
  },
];
