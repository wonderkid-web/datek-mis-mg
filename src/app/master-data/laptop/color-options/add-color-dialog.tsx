"use client";

import { useState } from "react";
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
import { createLaptopColor } from "@/lib/laptopColorService";

interface AddColorDialogProps {
  onSave: () => void;
}

export function AddColorDialog({ onSave }: AddColorDialogProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  const handleSubmit = async () => {
    try {
      await createLaptopColor({ value });

      console.log("Color option added successfully");
      onSave();
      setOpen(false);
    } catch (error) {
      console.error("An error occurred:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Add New Color</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Color Option</DialogTitle>
          <DialogDescription>
            Add a new Color option to the list. Click save when {"you're"} done.
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