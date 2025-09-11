
"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
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
import { createLaptopVgaOption } from "@/lib/laptopVgaService";

interface AddVgaDialogProps {
  onSave: () => void;
}

export function AddVgaDialog({ onSave }: AddVgaDialogProps) {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const isAdmin = (session?.user as any)?.role === "administrator";
  if (!isAdmin) return null;

  const handleSubmit = async () => {
    try {
      await createLaptopVgaOption({ value });
      console.log("VGA option added successfully");
      onSave();
      setOpen(false);
      setValue(""); // Clear form
    } catch (error) {
      console.error("An error occurred:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Add New VGA Option</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New VGA Option</DialogTitle>
          <DialogDescription>
            Add a new VGA option. Click save when {"you're"} done.
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
