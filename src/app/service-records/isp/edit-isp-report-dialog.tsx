"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Isp, IspReport } from "@prisma/client";
import { IspReportForm } from "./isp-report-form";

interface EditIspReportDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  ispReport: (IspReport & { isp: Isp }) | null;
}

export function EditIspReportDialog({ isOpen, onOpenChange, ispReport }: EditIspReportDialogProps) {
  if (!ispReport) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit ISP Report</DialogTitle>
        </DialogHeader>
        <IspReportForm onSave={() => onOpenChange(false)} initialData={ispReport} />
      </DialogContent>
    </Dialog>
  );
}
