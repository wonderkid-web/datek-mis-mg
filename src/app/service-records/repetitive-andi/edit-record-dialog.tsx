"use client";

import { useEffect, useState, FormEvent } from "react";
import { toast } from "sonner";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { updatePrinterRepetitiveMaintenance } from "@/lib/printerRepetitiveMaintenanceService";
import { PrinterRepetitiveMaintenance } from "@/lib/types";

interface EditRecordDialogProps {
  record: PrinterRepetitiveMaintenance | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}

export function EditRecordDialog({
  record,
  open,
  onOpenChange,
  onSave,
}: EditRecordDialogProps) {
  const [reportDate, setReportDate] = useState<string>("");
  const [totalPages, setTotalPages] = useState<number | null>(null);
  const [blackCount, setBlackCount] = useState<number | null>(null);
  const [yellowCount, setYellowCount] = useState<number | null>(null);
  const [magentaCount, setMagentaCount] = useState<number | null>(null);
  const [cyanCount, setCyanCount] = useState<number | null>(null);
  const [remarks, setRemarks] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (record) {
      setReportDate(
        record.reportDate
          ? format(new Date(record.reportDate), "yyyy-MM-dd")
          : ""
      );
      setTotalPages(record.totalPages);
      setBlackCount(record.blackCount);
      setYellowCount(record.yellowCount);
      setMagentaCount(record.magentaCount);
      setCyanCount(record.cyanCount);
      setRemarks(record.remarks);
    } else {
      resetForm();
    }
  }, [record]);

  const resetForm = () => {
    setReportDate("");
    setTotalPages(null);
    setBlackCount(null);
    setYellowCount(null);
    setMagentaCount(null);
    setCyanCount(null);
    setRemarks(null);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!record || typeof record.id !== 'number') {
      toast.error("Invalid record for update.");
      return;
    }

    setIsSubmitting(true);
    try {
      await updatePrinterRepetitiveMaintenance(record.id, {
        reportDate: new Date(reportDate),
        totalPages: totalPages,
        blackCount: blackCount,
        yellowCount: yellowCount,
        magentaCount: magentaCount,
        cyanCount: cyanCount,
        remarks: remarks,
      });
      toast.success("Record updated successfully!");
      onSave(); // Refresh data in parent component
      onOpenChange(false); // Close dialog
    } catch (error) {
      console.error("Failed to update record:", error);
      toast.error("Failed to update the record.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Repetitive Maintenance Record</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="reportDate" className="text-right">
              Report Date
            </Label>
            <Input
              id="reportDate"
              type="date"
              value={reportDate}
              onChange={(e) => setReportDate(e.target.value)}
              className="col-span-3"
            />
          </div>

          {/* Asset Details field removed from here */}

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="totalPages" className="text-right">
              Total Pages
            </Label>
            <Input
              id="totalPages"
              type="number"
              value={totalPages ?? ""}
              onChange={(e) => setTotalPages(e.target.value ? parseInt(e.target.value, 10) : null)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="blackCount" className="text-right">
              Black Count
            </Label>
            <Input
              id="blackCount"
              type="number"
              value={blackCount ?? ""}
              onChange={(e) => setBlackCount(e.target.value ? parseInt(e.target.value, 10) : null)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="yellowCount" className="text-right">
              Yellow Count
            </Label>
            <Input
              id="yellowCount"
              type="number"
              value={yellowCount ?? ""}
              onChange={(e) => setYellowCount(e.target.value ? parseInt(e.target.value, 10) : null)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="magentaCount" className="text-right">
              Magenta Count
            </Label>
            <Input
              id="magentaCount"
              type="number"
              value={magentaCount ?? ""}
              onChange={(e) => setMagentaCount(e.target.value ? parseInt(e.target.value, 10) : null)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="cyanCount" className="text-right">
              Cyan Count
            </Label>
            <Input
              id="cyanCount"
              type="number"
              value={cyanCount ?? ""}
              onChange={(e) => setCyanCount(e.target.value ? parseInt(e.target.value, 10) : null)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="remarks" className="text-right">
              Remarks
            </Label>
            <Textarea
              id="remarks"
              value={remarks ?? ""}
              onChange={(e) => setRemarks(e.target.value)}
              className="col-span-3"
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
