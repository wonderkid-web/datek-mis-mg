"use client";
// @ts-nocheck

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { AssetAssignment, Asset, Prisma } from "@prisma/client";
import { getAssetById } from "@/lib/assetService";
import {
  Laptop,
  HardDrive,
  Cpu,
  MemoryStick,
  Monitor,
  Network,
  Palette,
  Tag,
  Calendar,
  DollarSign,
  MapPin,
  CheckCircle,
  Building,
  Key,
  Power,
  BookOpen,
  Type,
  Image,
} from "lucide-react"; // Import all necessary icons

// Define a more specific type for LaptopSpecs with included relations
type LaptopSpecsWithRelations = Prisma.LaptopSpecsGetPayload<{
  include: {
    brandOption: true;
    colorOption: true;
    microsoftOfficeOption: true;
    osOption: true;
    powerOption: true;
    processorOption: true;
    ramOption: true;
    storageTypeOption: true;
    typeOption: true;
    graphicOption: true;
    vgaOption: true;
    licenseOption: true;
  };
}>;

interface ViewAssignmentDialogProps {
  assignment: AssetAssignment;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}

export function ViewAssignmentDialog({
  assignment,
  onOpenChange,
  open,
}: ViewAssignmentDialogProps) {
  const [assetDetails, setAssetDetails] = useState<Asset | null>(null);
  const [laptopSpecs, setLaptopSpecs] =
    useState<LaptopSpecsWithRelations | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssetDetails = async () => {
      setLoading(true);
      try {
        const asset = await getAssetById(assignment.assetId);
        if (asset) {
          setAssetDetails(asset);
          {
          }
          /* @ts-expect-error its okay */
          if (asset.laptopSpecs) {
            {
            }
            /* @ts-expect-error its okay */
            setLaptopSpecs(asset.laptopSpecs as LaptopSpecsWithRelations);
          }
        }
      } catch (error) {
        console.error("Failed to fetch asset details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      fetchAssetDetails();
    }
  }, [open, assignment.assetId]);

  useEffect(() => {
    if (laptopSpecs) {
      console.log("Laptop Specs in dialog:", laptopSpecs);
    }
  }, [laptopSpecs]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Asset Details</DialogTitle>
          <DialogDescription>
            Detailed information about the assigned asset and its
            specifications.
          </DialogDescription>
        </DialogHeader>
        {loading ? (
          <div>Loading asset details...</div>
        ) : assetDetails ? (
          <div className="grid grid-cols-2 gap-4 py-4">
            <Label className="text-right flex items-center justify-end space-x-2">
              <Laptop className="h-4 w-4" />
              <span>Asset Name:</span>
            </Label>
            <div>{assetDetails.namaAsset}</div>

            <Label className="text-right flex items-center justify-end space-x-2">
              <Tag className="h-4 w-4" />
              <span>Serial Number:</span>
            </Label>
            <div>{assetDetails.nomorSeri}</div>

            <Label className="text-right flex items-center justify-end space-x-2">
              <Tag className="h-4 w-4" />
              <span>Category:</span>
            </Label>
            {/* @ts-expect-error its okay */}
            <div>{assetDetails.category?.nama || "N/A"}</div>

            <Label className="text-right flex items-center justify-end space-x-2">
              <Building className="h-4 w-4" />
              <span>Merk:</span>
            </Label>
            <div>{assetDetails.merk || "N/A"}</div>

            <Label className="text-right flex items-center justify-end space-x-2">
              <Laptop className="h-4 w-4" />
              <span>Model:</span>
            </Label>
            <div>{assetDetails.model || "N/A"}</div>

            <Label className="text-right flex items-center justify-end space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Purchase Date:</span>
            </Label>
            <div>
              {assetDetails.tanggalPembelian?.toLocaleDateString() || "N/A"}
            </div>

            <Label className="text-right flex items-center justify-end space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Warranty Date:</span>
            </Label>
            <div>
              {assetDetails.tanggalGaransi?.toLocaleDateString() || "N/A"}
            </div>

            <Label className="text-right flex items-center justify-end space-x-2">
              <DollarSign className="h-4 w-4" />
              <span>Acquisition Value:</span>
            </Label>
            <div>{assetDetails.nilaiPerolehan?.toString() || "N/A"}</div>

            <Label className="text-right flex items-center justify-end space-x-2">
              <CheckCircle className="h-4 w-4" />
              <span>Status:</span>
            </Label>
            <div>{assetDetails.statusAsset || "N/A"}</div>

            <Label className="text-right flex items-center justify-end space-x-2">
              <MapPin className="h-4 w-4" />
              <span>Physical Location:</span>
            </Label>
            <div>{assetDetails.lokasiFisik || "N/A"}</div>

            {laptopSpecs && (
              <>
                <h3 className="text-lg font-semibold col-span-2 mt-4">
                  Laptop Specifications
                </h3>
                <Label className="text-right flex items-center justify-end space-x-2">
                  <Cpu className="h-4 w-4" />
                  <span>Processor:</span>
                </Label>
                <div>{laptopSpecs.processorOption?.value || "N/A"}</div>

                <Label className="text-right flex items-center justify-end space-x-2">
                  <MemoryStick className="h-4 w-4" />
                  <span>RAM:</span>
                </Label>
                <div>{laptopSpecs.ramOption?.value || "N/A"}</div>

                <Label className="text-right flex items-center justify-end space-x-2">
                  <HardDrive className="h-4 w-4" />
                  <span>Storage Type:</span>
                </Label>
                <div>{laptopSpecs.storageTypeOption?.value || "N/A"}</div>

                <Label className="text-right flex items-center justify-end space-x-2">
                  <Monitor className="h-4 w-4" />
                  <span>Operating System:</span>
                </Label>
                <div>{laptopSpecs.osOption?.value || "N/A"}</div>

                <Label className="text-right flex items-center justify-end space-x-2">
                  <Network className="h-4 w-4" />
                  <span>MAC WLAN:</span>
                </Label>
                <div>{laptopSpecs.macWlan || "N/A"}</div>

                <Label className="text-right flex items-center justify-end space-x-2">
                  <Network className="h-4 w-4" />
                  <span>MAC LAN:</span>
                </Label>
                <div>{laptopSpecs.macLan || "N/A"}</div>

                <Label className="text-right flex items-center justify-end space-x-2">
                  <Building className="h-4 w-4" />
                  <span>Brand:</span>
                </Label>
                <div>{laptopSpecs.brandOption?.value || "N/A"}</div>

                <Label className="text-right flex items-center justify-end space-x-2">
                  <Type className="h-4 w-4" />
                  <span>Type:</span>
                </Label>
                <div>{laptopSpecs.typeOption?.value || "N/A"}</div>

                <Label className="text-right flex items-center justify-end space-x-2">
                  <Image className="h-4 w-4" />
                  <span>Graphic:</span>
                </Label>
                <div>{laptopSpecs.graphicOption?.value || "N/A"}</div>

                <Label className="text-right flex items-center justify-end space-x-2">
                  <Monitor className="h-4 w-4" />
                  <span>VGA:</span>
                </Label>
                <div>{laptopSpecs.vgaOption?.value || "N/A"}</div>

                <Label className="text-right flex items-center justify-end space-x-2">
                  <BookOpen className="h-4 w-4" />
                  <span>License Type:</span>
                </Label>
                <div>{laptopSpecs.licenseOption?.value || "N/A"}</div>

                <Label className="text-right flex items-center justify-end space-x-2">
                  <Key className="h-4 w-4" />
                  <span>License Key:</span>
                </Label>
                {/* @ts-expect-error its okay */}
                <div>{laptopSpecs.licenseKey || "N/A"}</div>

                <Label className="text-right flex items-center justify-end space-x-2">
                  <Power className="h-4 w-4" />
                  <span>Power Adaptor:</span>
                </Label>
                <div>{laptopSpecs.powerOption?.value || "N/A"}</div>

                <Label className="text-right flex items-center justify-end space-x-2">
                  <Power className="h-4 w-4" />
                  <span>Microsoft Office:</span>
                </Label>
                <div>{laptopSpecs.microsoftOfficeOption?.value || "N/A"}</div>

                <Label className="text-right flex items-center justify-end space-x-2">
                  <Palette className="h-4 w-4" />
                  <span>Color:</span>
                </Label>
                <div>{laptopSpecs.colorOption?.value || "N/A"}</div>
              </>
            )}
          </div>
        ) : (
          <div>Failed to load asset details.</div>
        )}
        <Button onClick={() => onOpenChange(false)}>Close</Button>
      </DialogContent>
    </Dialog>
  );
}
