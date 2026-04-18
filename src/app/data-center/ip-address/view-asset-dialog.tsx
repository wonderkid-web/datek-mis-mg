"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import type { IpAddressRow } from "./columns";

interface ViewAssetDialogProps {
  isOpen: boolean;
  onClose: () => void;
  item: IpAddressRow | null;
}

export function ViewAssetDialog({ isOpen, onClose, item }: ViewAssetDialogProps) {
  const a = item?.assetAssignment;
  const asset = a?.asset;
  const isPcAsset = Boolean(asset?.pcSpecs);
  const primarySpecLabel = isPcAsset ? "Motherboard" : "Brand";
  const primarySpecValue =
    asset?.laptopSpecs?.brandOption?.value ||
    asset?.intelNucSpecs?.brandOption?.value ||
    asset?.pcSpecs?.motherboardOption?.value ||
    asset?.printerSpecs?.brandOption?.value ||
    "-";
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Asset Details</DialogTitle>
          <DialogDescription>Asset terkait IP Address</DialogDescription>
        </DialogHeader>
        {item?.status !== "EMPLOYEE" && (
          <div className="grid grid-cols-3 items-center gap-2 mb-4">
            <Label>MAC WLAN</Label>
            <div className="col-span-2 font-mono">{item?.resolvedMacWlan || "-"}</div>
          </div>
        )}
        {a ? (
          <div className="grid gap-3 py-2">
            <div className="grid grid-cols-3 items-center gap-2">
              <Label>Asset Number</Label>
              <div className="col-span-2">{a.nomorAsset || '-'}</div>
            </div>
            <div className="grid grid-cols-3 items-center gap-2">
              <Label>Asset Name</Label>
              <div className="col-span-2">{asset?.namaAsset || '-'}</div>
            </div>
            <div className="grid grid-cols-3 items-center gap-2">
              <Label>Serial Number</Label>
              <div className="col-span-2">{asset?.nomorSeri || '-'}</div>
            </div>
            <div className="grid grid-cols-3 items-center gap-2">
              <Label>{primarySpecLabel}</Label>
              <div className="col-span-2">{primarySpecValue}</div>
            </div>
            <div className="grid grid-cols-3 items-center gap-2">
              <Label>MAC WLAN</Label>
              <div className="col-span-2 font-mono">{item?.resolvedMacWlan || "-"}</div>
            </div>
            <div className="grid grid-cols-3 items-center gap-2">
              <Label>MAC LAN</Label>
              <div className="col-span-2 font-mono">{item?.resolvedMacLan || "-"}</div>
            </div>
          </div>
        ) : (
          <div className="py-2 text-sm">Tidak ada asset terkait.</div>
        )}
      </DialogContent>
    </Dialog>
  );
}
