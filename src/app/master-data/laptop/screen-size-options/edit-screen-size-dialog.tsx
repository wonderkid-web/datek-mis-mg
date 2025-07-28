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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LaptopScreenSizeOption } from "@prisma/client";
import { updateScreenSize } from "@/lib/screenSizeService";

interface EditScreenSizeDialogProps {
  screenSizeOption: LaptopScreenSizeOption;
  onSave: () => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}

export function EditScreenSizeDialog({ screenSizeOption, onSave, onOpenChange, open }: EditScreenSizeDialogProps) {
  const [value, setValue] = useState(screenSizeOption.value);

  useEffect(() => {
    setValue(screenSizeOption.value);
  }, [screenSizeOption]);

  const handleSubmit = async () => {
    try {
      await updateScreenSize(screenSizeOption.id, { name: value });

      console.log("Screen Size option updated successfully");
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
          <DialogTitle>Edit Screen Size Option</DialogTitle>
          <DialogDescription>
            Edit the value of the Screen Size option.
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