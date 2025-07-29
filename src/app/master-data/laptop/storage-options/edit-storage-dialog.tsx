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
import { LaptopStorageTypeOption } from "@prisma/client";
import { updateLaptopStorageOption } from "@/lib/laptopStorageService";

interface EditStorageDialogProps {
  storageOption: LaptopStorageTypeOption;
  onSave: () => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}

export function EditStorageDialog({ storageOption, onSave, onOpenChange, open }: EditStorageDialogProps) {
  const [value, setValue] = useState(storageOption.value);

  useEffect(() => {
    setValue(storageOption.value);
  }, [storageOption]);

  const handleSubmit = async () => {
    try {
      await updateLaptopStorageOption(storageOption.id, { value });

      console.log("Storage option updated successfully");
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
          <DialogTitle>Edit Storage Option</DialogTitle>
          <DialogDescription>
            Edit the value of the Storage option.
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