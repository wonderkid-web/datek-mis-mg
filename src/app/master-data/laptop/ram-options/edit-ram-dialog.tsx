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
import { LaptopRamOption } from "@prisma/client";

interface EditRamDialogProps {
  ramOption: LaptopRamOption;
  onSave: () => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}

export function EditRamDialog({ ramOption, onSave, onOpenChange, open }: EditRamDialogProps) {
  const [value, setValue] = useState(ramOption.value);

  useEffect(() => {
    setValue(ramOption.value);
  }, [ramOption]);

  const handleSubmit = async () => {
    try {
      const response = await fetch(`/api/master-data/laptop/ram/${ramOption.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: value }), // Use 'name' as per MasterDataItem
      });

      if (response.ok) {
        console.log("RAM option updated successfully");
        onSave(); // Trigger data refresh
        onOpenChange(false); // Close dialog
      } else {
        console.error("Failed to update RAM option");
      }
    } catch (error) {
      console.error("An error occurred:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit RAM Option</DialogTitle>
          <DialogDescription>
            Edit the value of the RAM option.
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
