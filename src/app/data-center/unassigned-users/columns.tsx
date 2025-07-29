"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Asset } from "@prisma/client";

export const columns: ColumnDef<Asset>[] = [
  {
    accessorKey: "namaAsset",
    header: "Asset Name",
  },
  {
    accessorKey: "nomorSeri",
    header: "Serial Number",
  },
  {
    accessorKey: "merk",
    header: "Brand",
  },
  {
    accessorKey: "model",
    header: "Model",
  },
  {
    accessorKey: "statusAsset",
    header: "Status",
  },
  {
    accessorKey: "lokasiFisik",
    header: "Physical Location",
  },
];