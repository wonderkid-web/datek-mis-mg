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
import { updatePrinterBrandOption } from "@/lib/printerBrandService";
import { PrinterBrandOption } from "@prisma/client";

interface EditBrandDialogProps {
  brandOption: PrinterBrandOption;
  onSave: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditBrandDialog({ brandOption, onSave, open, onOpenChange }: EditBrandDialogProps) {
  const [value, setValue] = useState(brandOption.value);

  useEffect(() => {
    setValue(brandOption.value);
  }, [brandOption]);

  const handleSave = async () => {
    try {
      await updatePrinterBrandOption(brandOption.id, { value });
      onSave();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update brand option", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Brand</DialogTitle>
          <DialogDescription>
            Update the brand option for printers.
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
