"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { IspReport, Isp } from "@prisma/client";
import { format } from "date-fns";
import Link from "next/link";

interface ViewIspReportDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  ispReport: (IspReport & { isp: Isp }) | null;
}

export function ViewIspReportDialog({ isOpen, onOpenChange, ispReport }: ViewIspReportDialogProps) {
  if (!ispReport) return null;

  const detailRows = [
    { label: "Report Date", value: ispReport.reportDate ? format(new Date(ispReport.reportDate), "PPP") : "N/A" },
    { label: "SBU", value: ispReport.sbu.replaceAll("_", " ") },
    { label: "ISP Name", value: ispReport.isp?.isp || "N/A" },
    { label: "Bandwidth Type", value: ispReport.bandwidth },
    { label: "Download Speed", value: `${ispReport.downloadSpeed} Mbps` },
    { label: "Upload Speed", value: `${ispReport.uploadSpeed} Mbps` },
    {
      label: "Link",
      value: ispReport.link ? (
        <Link href={ispReport.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
          View Link
        </Link>
      ) : (
        "N/A"
      ),
    },
    { label: "Created At", value: ispReport.createdAt ? format(new Date(ispReport.createdAt), "PPP p") : "N/A" },
    { label: "Updated At", value: ispReport.updatedAt ? format(new Date(ispReport.updatedAt), "PPP p") : "N/A" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>ISP Report Details</DialogTitle>
          <DialogDescription>Detailed information about the ISP speed test report.</DialogDescription>
        </DialogHeader>
        <div className="border rounded-lg">
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
