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
import { LaptopMicrosoftOfficeOption } from "@prisma/client";
import { updateLaptopMicrosoftOffice } from "@/lib/laptopMicrosoftOfficeService";

interface EditMicrosoftOfficeDialogProps {
  microsoftOfficeOption: LaptopMicrosoftOfficeOption;
  onSave: () => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}

export function EditMicrosoftOfficeDialog({ microsoftOfficeOption, onSave, onOpenChange, open }: EditMicrosoftOfficeDialogProps) {
  const [value, setValue] = useState(microsoftOfficeOption.value);

  useEffect(() => {
    setValue(microsoftOfficeOption.value);
  }, [microsoftOfficeOption]);

  const handleSubmit = async () => {
    try {
      await updateLaptopMicrosoftOffice(microsoftOfficeOption.id, { value });

      console.log("Microsoft Office option updated successfully");
      onSave();
      onOpenChange(false);
    } catch (error) {
      console.error("An error occurred:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Microsoft Office Option</DialogTitle>
          <DialogDescription>
            Edit the value of the Microsoft Office option.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="value" className="text-right">
              Value
            </Label>
            <Input
              id="value"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}