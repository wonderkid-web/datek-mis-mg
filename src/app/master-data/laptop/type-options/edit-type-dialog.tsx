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
import { LaptopTypeOption } from "@prisma/client";
import { updateLaptopTypeOption } from "@/lib/laptopTypeService";

interface EditTypeDialogProps {
  typeOption: LaptopTypeOption;
  onSave: () => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}

export function EditTypeDialog({ typeOption, onSave, onOpenChange, open }: EditTypeDialogProps) {
  const [value, setValue] = useState(typeOption.value);

  useEffect(() => {
    setValue(typeOption.value);
  }, [typeOption]);

  const handleSubmit = async () => {
    try {
      await updateLaptopTypeOption(typeOption.id, { value });

      console.log("Type option updated successfully");
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
          <DialogTitle>Edit Type Option</DialogTitle>
          <DialogDescription>
            Edit the value of the Type option.
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
