"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ServiceRecordWithDetails } from "@/lib/types";

interface ViewRecordDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  record: ServiceRecordWithDetails | null;
}

const formatterIDR = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

function formatDateTime(date: Date | string) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  }).format(new Date(date));
}

export function ViewRecordDialog({
  isOpen,
  onOpenChange,
  record,
}: ViewRecordDialogProps) {
  if (!record) return null;

  const detailRows = [
    { label: "Created At", value: formatDateTime(record.createdAt) },
    { label: "No. Tiket", value: record.ticketHelpdesk || "-" },
    {
      label: "Asset Number",
      value: record.assetAssignment?.nomorAsset || "-",
    },
    {
      label: "Full Name",
      value: record.assetAssignment?.user?.namaLengkap || "-",
    },
    {
      label: "Asset Name",
      value: record.assetAssignment?.asset?.namaAsset || "-",
    },
    { label: "Type", value: record.repairType || "-" },
    { label: "Cost", value: formatterIDR.format(Number(record.cost ?? 0)) },
    { label: "Remarks", value: record.remarks?.trim() || "-" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detail Service Record</DialogTitle>
          <DialogDescription>
            Informasi detail service record dan remarks.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border">
          <table className="w-full text-sm">
            <tbody>
              {detailRows.map((row) => (
                <tr key={row.label} className="border-b last:border-b-0">
                  <td className="w-1/3 px-4 py-3 align-top font-semibold">
                    {row.label}
                  </td>
                  <td className="whitespace-pre-wrap break-words px-4 py-3">
                    {row.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
