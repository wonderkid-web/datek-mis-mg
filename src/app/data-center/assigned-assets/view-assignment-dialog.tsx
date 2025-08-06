// @ts-nocheck
"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { LaptopSpecs } from "@/lib/types";

interface ViewAssignmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: {
    asset: {
      id: number;
      assetId: number;
      userId: number;
      catatan: string | null;
      createdAt: Date;
      updatedAt: Date;
      nomorAsset: string;
      laptopSpecs: LaptopSpecs;
    };
    user: {
      namaLengkap: string;
      departemen: string | null;
      lokasiKantor: string | null;
      jabatan: string | null;
    };
  };
}

export function ViewAssignmentDialog({
  isOpen,
  onClose,
  assignment,
}: ViewAssignmentDialogProps) {
  const asset = assignment.asset;
  const laptopSpecs = asset?.laptopSpecs;
  const printerSpecs = asset?.printerSpecs;
  const intelNucSpecs = asset?.intelNucSpecs;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assignment Details</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Table>
            <TableBody>
              {/* Assignment Info */}
              <TableRow>
                <TableCell className="font-medium">User</TableCell>
                <TableCell>{assignment.user.namaLengkap}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Department</TableCell>
                <TableCell>{assignment.user.departemen || "-"}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Company</TableCell>
                <TableCell>{assignment.user.lokasiKantor || "-"}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Position</TableCell>
                <TableCell>{assignment.user.jabatan || "-"}</TableCell>
              </TableRow>

              {/* Asset Info */}
              <TableRow>
                <TableCell className="font-medium">Asset Number</TableCell>
                <TableCell>{assignment.nomorAsset || "-"}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Category</TableCell>
                <TableCell>{asset.category?.nama || "Laptop"}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Brand</TableCell>
                <TableCell>
                  {printerSpecs?.brandOption?.value || laptopSpecs?.brandOption?.value || intelNucSpecs?.brandOption?.value || "-"}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Color</TableCell>
                <TableCell>
                  {printerSpecs?.colorOption?.value || laptopSpecs?.colorOption?.value || intelNucSpecs?.colorOption?.value || "-"}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Asset Name</TableCell>
                <TableCell>{asset.namaAsset}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Serial Number</TableCell>
                <TableCell>{asset.nomorSeri}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Purchase Date</TableCell>
                <TableCell>
                  {asset.tanggalPembelian
                    ? new Date(asset.tanggalPembelian).toLocaleDateString()
                    : "-"}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Warranty Date</TableCell>
                <TableCell>
                  {asset.tanggalGaransi
                    ? new Date(asset.tanggalGaransi).toLocaleDateString()
                    : "-"}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Status</TableCell>
                <TableCell>{asset.statusAsset}</TableCell>
              </TableRow>

              {/* Specifications */}
              {(laptopSpecs || intelNucSpecs) && (
                <>
                  <TableRow>
                    <TableCell className="font-medium">Processor</TableCell>
                    <TableCell>
                      {laptopSpecs?.processorOption?.value || intelNucSpecs?.processorOption?.value || "-"}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">RAM</TableCell>
                    <TableCell>
                      {laptopSpecs?.ramOption?.value || intelNucSpecs?.ramOption?.value || "-"}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Storage Type</TableCell>
                    <TableCell>
                      {laptopSpecs?.storageTypeOption?.value || intelNucSpecs?.storageTypeOption?.value || "-"}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Graphic</TableCell>
                    <TableCell>
                      {laptopSpecs?.graphicOption?.value || intelNucSpecs?.graphicOption?.value || "-"}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">MAC WLAN</TableCell>
                    <TableCell>{laptopSpecs?.macWlan || intelNucSpecs?.macWlan || "-"}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">MAC LAN</TableCell>
                    <TableCell>{laptopSpecs?.macLan || intelNucSpecs?.macLan || "-"}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Power</TableCell>
                    <TableCell>
                      {laptopSpecs?.powerOption?.value || intelNucSpecs?.powerOption?.value || "-"}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">OS</TableCell>
                    <TableCell>{laptopSpecs?.osOption?.value || intelNucSpecs?.osOption?.value || "-"}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">License</TableCell>
                    <TableCell>
                      {laptopSpecs?.licenseOption?.value || intelNucSpecs?.licenseOption?.value || "-"}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Microsoft Office</TableCell>
                    <TableCell>
                      {laptopSpecs?.microsoftOfficeOption?.value || intelNucSpecs?.microsoftOfficeOption?.value || "-"}
                    </TableCell>
                  </TableRow>
                </>
              )}
            </TableBody>
          </Table>
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
