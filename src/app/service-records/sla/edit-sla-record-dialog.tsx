"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { SlaRecordForm } from "./sla-record-form";
import { IspSlaRecordWithIsp } from "./types";

interface EditSlaRecordDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  slaRecord: IspSlaRecordWithIsp | null;
}

export function EditSlaRecordDialog({
  isOpen,
  onOpenChange,
  slaRecord,
}: EditSlaRecordDialogProps) {
  if (!slaRecord) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Data SLA</DialogTitle>
        </DialogHeader>
        <SlaRecordForm onSave={() => onOpenChange(false)} initialData={slaRecord} />
      </DialogContent>
    </Dialog>
  );
}
