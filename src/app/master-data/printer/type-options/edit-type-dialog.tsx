"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updatePrinterTypeOption } from "@/lib/printerTypeService";
import { PrinterTypeOption } from "@prisma/client";

interface EditTypeDialogProps {
  typeOption: PrinterTypeOption;
  onSave: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditTypeDialog({ typeOption, onSave, open, onOpenChange }: EditTypeDialogProps) {
  const [value, setValue] = useState(typeOption.value);

  useEffect(() => {
    setValue(typeOption.value);
  }, [typeOption]);

  const handleSave = async () => {
    try {
      await updatePrinterTypeOption(typeOption.id, { value });
      onSave();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update type option", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Type</DialogTitle>
          <DialogDescription>
            Update the type option for printers.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSave}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
