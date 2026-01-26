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

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>ISP Report Details</DialogTitle>
          <DialogDescription>
            Detailed information about the ISP speed test report.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-3 items-center gap-4">
            <span className="text-sm font-medium">Report Date:</span>
            <span className="col-span-2 text-sm">
              {ispReport.reportDate ? format(new Date(ispReport.reportDate), "PPP") : "N/A"}
            </span>
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <span className="text-sm font-medium">SBU:</span>
            <span className="col-span-2 text-sm">{ispReport.sbu.replaceAll("_", " ")}</span>
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <span className="text-sm font-medium">ISP Name:</span>
            <span className="col-span-2 text-sm">{ispReport.isp?.isp || "N/A"}</span>
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <span className="text-sm font-medium">Bandwidth Type:</span>
            <span className="col-span-2 text-sm">{ispReport.bandwidth}</span>
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <span className="text-sm font-medium">Download Speed:</span>
            <span className="col-span-2 text-sm">{ispReport.downloadSpeed} Mbps</span>
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <span className="text-sm font-medium">Upload Speed:</span>
            <span className="col-span-2 text-sm">{ispReport.uploadSpeed} Mbps</span>
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <span className="text-sm font-medium">Link:</span>
            <span className="col-span-2 text-sm">
                {ispReport.link ? (
                    <Link href={ispReport.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                        {/* {ispReport.link} */}
                        View Link
                    </Link>
                ) : (
                    "N/A"
                )}
            </span>
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <span className="text-sm font-medium">Created At:</span>
            <span className="col-span-2 text-sm">
              {ispReport.createdAt ? format(new Date(ispReport.createdAt), "PPP p") : "N/A"}
            </span>
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <span className="text-sm font-medium">Updated At:</span>
            <span className="col-span-2 text-sm">
              {ispReport.updatedAt ? format(new Date(ispReport.updatedAt), "PPP p") : "N/A"}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
