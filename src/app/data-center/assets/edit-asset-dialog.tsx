"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Asset } from "@prisma/client";
import { updateBasicAssetInfo } from "@/lib/assetService";

interface EditAssetDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  asset: Asset;
}

const StatusOptions = [
  "GOOD",
  "NEED REPARATION",
  "BROKEN",
  "MISSING",
  "SELL",
];

export function EditAssetDialog({ isOpen, onClose, onSave, asset }: EditAssetDialogProps) {
  const [formData, setFormData] = useState<Partial<Asset>>(asset);

  useEffect(() => {
    setFormData(asset);
  }, [asset]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      const dataToUpdate = {
        namaAsset: formData.namaAsset,
        nomorSeri: formData.nomorSeri,
        statusAsset: formData.statusAsset,
        // Add other fields as needed from CreateAssetData
      };
      await updateBasicAssetInfo(asset.id, dataToUpdate);
      onSave();
    } catch (error) {
      console.error("Failed to update asset:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Asset</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="namaAsset" className="text-right">
              Asset Name
            </Label>
            <Input id="namaAsset" name="namaAsset" value={formData.namaAsset || ''} onChange={handleChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="nomorSeri" className="text-right">
              Serial Number
            </Label>
            <Input id="nomorSeri" name="nomorSeri" value={formData.nomorSeri || ''} onChange={handleChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="statusAsset" className="text-right">
              Status
            </Label>
            <Select onValueChange={(value) => handleSelectChange("statusAsset", value)} value={formData.statusAsset || ""}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                {StatusOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onClose} variant="outline">Cancel</Button>
          <Button onClick={handleSubmit}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
