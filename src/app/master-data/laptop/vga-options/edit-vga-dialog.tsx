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
import { LaptopVgaOption } from "@prisma/client";
import { updateVga } from "@/lib/vgaService";

interface EditVgaDialogProps {
  vgaOption: LaptopVgaOption;
  onSave: () => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}

export function EditVgaDialog({ vgaOption, onSave, onOpenChange, open }: EditVgaDialogProps) {
  const [value, setValue] = useState(vgaOption.value);

  useEffect(() => {
    setValue(vgaOption.value);
  }, [vgaOption]);

  const handleSubmit = async () => {
    try {
      await updateVga(vgaOption.id, { name: value });

      console.log("VGA option updated successfully");
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
          <DialogTitle>Edit VGA Option</DialogTitle>
          <DialogDescription>
            Edit the value of the VGA option.
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