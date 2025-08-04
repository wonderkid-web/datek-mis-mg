"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { updateLaptopLicenseOption } from "@/lib/laptopLicenseService";
import { LaptopLicenseOption } from "@prisma/client";

interface EditLicenseDialogProps {
  licenseOption: LaptopLicenseOption;
  onSave: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditLicenseDialog({
  licenseOption,
  onSave,
  open,
  onOpenChange,
}: EditLicenseDialogProps) {
  const [value, setValue] = useState(licenseOption.value);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setValue(licenseOption.value);
  }, [licenseOption]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateLaptopLicenseOption(licenseOption.id.toString(), { value });
      onSave();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update license option:", error);
      alert("Failed to update license option.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit License Option</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="value" className="text-right">
              Value
            </Label>
            <Input
              id="value"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="col-span-3"
              required
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
