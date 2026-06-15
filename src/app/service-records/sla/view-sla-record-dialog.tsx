"use client";

import { format } from "date-fns";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  formatActualisation,
  formatDurationSeconds,
  getSlaMonthLabel,
} from "@/lib/ispSlaUtils";

import { IspSlaRecordWithIsp } from "./types";

interface ViewSlaRecordDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  slaRecord: IspSlaRecordWithIsp | null;
}

export function ViewSlaRecordDialog({
  isOpen,
  onOpenChange,
  slaRecord,
}: ViewSlaRecordDialogProps) {
  if (!slaRecord) return null;

  const detailRows = [
    { label: "SBU", value: slaRecord.sbu.replaceAll("_", " ") },
    { label: "ISP", value: slaRecord.isp.isp },
    { label: "Month", value: getSlaMonthLabel(slaRecord.month) },
    { label: "Year", value: slaRecord.year },
    { label: "Contract", value: slaRecord.contract },
    { label: "Actualisation", value: formatActualisation(slaRecord.actualisation) },
    { label: "Uptime", value: formatDurationSeconds(slaRecord.uptimeSeconds) },
    { label: "Downtime", value: formatDurationSeconds(slaRecord.downtimeSeconds) },
    { label: "Remarks", value: slaRecord.remarks || "-" },
    {
      label: "Created At",
      value: format(new Date(slaRecord.createdAt), "PPP p"),
    },
    {
      label: "Updated At",
      value: format(new Date(slaRecord.updatedAt), "PPP p"),
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detail SLA</DialogTitle>
          <DialogDescription>Informasi detail data SLA bulanan ISP.</DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border">
          <table className="w-full text-sm">
            <tbody>
              {detailRows.map((row) => (
                <tr key={row.label} className="border-b last:border-b-0">
                  <td className="w-1/3 px-4 py-3 font-semibold align-top">{row.label}</td>
                  <td className="px-4 py-3">{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
