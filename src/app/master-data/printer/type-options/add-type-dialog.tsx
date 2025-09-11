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
import { createPrinterTypeOption } from "@/lib/printerTypeService";

export function AddTypeDialog({ onSave }: { onSave: () => void }) {
  const { data: session } = useSession();
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);
  const isAdmin = (session?.user as any)?.role === "administrator";
  if (!isAdmin) return null;

  const handleSave = async () => {
    try {
      await createPrinterTypeOption({ value });
      onSave();
      setOpen(false);
      setValue("");
    } catch (error) {
      console.error("Failed to create type option", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Type</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Type</DialogTitle>
          <DialogDescription>
            Add a new type option for printers.
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
