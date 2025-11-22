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
import { Badge } from "@/components/ui/badge"; // <-- IMPORT BADGE
import { formattedDate } from "@/helper";
import { LaptopSpecs, OfficeAccount } from "@/lib/types"; // <-- IMPORT OfficeAccount (optional if typed inline)

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
      // Tambahkan definisi tipe officeAccount di props (atau gunakan interface AssetAssignment lengkap)
      officeAccount?: {
        email: string;
        password: string;
        licenseExpiry: Date | null;
        isActive: boolean;
      } | null;
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
  const officeAccount = asset?.officeAccount; // <-- Variable for easier access

  const calculateDaysRemaining = (dateVal: Date | string) => {
    const today = new Date();
    const expiryDate = new Date(dateVal);

    // Reset jam ke 00:00:00 agar hitungan hari akurat
    today.setHours(0, 0, 0, 0);
    expiryDate.setHours(0, 0, 0, 0);

    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return <span className="text-red-500 font-bold text-xs ml-1">(Expired {Math.abs(diffDays)} hari lalu)</span>;
    } else if (diffDays === 0) {
      return <span className="text-orange-500 font-bold text-xs ml-1">(Expired hari ini)</span>;
    } else {
      // Jika kurang dari 30 hari, beri warna kuning/orange sebagai warning
      const colorClass = diffDays <= 30 ? "text-orange-500" : "text-green-600";
      return <span className={`${colorClass} font-semibold text-xs ml-1`}>({diffDays} hari lagi)</span>;
    }
  };

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
                    ? formattedDate(asset.tanggalPembelian)
                    : "-"}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Warranty Date</TableCell>
                <TableCell>
                  {asset.tanggalGaransi
                    ? formattedDate(asset.tanggalGaransi)
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
              {/* Office Account Credential Section */}
              {officeAccount && (
                <>
                  <TableRow>
                    <TableCell colSpan={2} className="bg-muted/50 text-center font-semibold pt-4">
                      Office Account Credential
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Office Email</TableCell>
                    <TableCell>{officeAccount.email}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Office Password</TableCell>
                    <TableCell>{officeAccount.password}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">License Expiry</TableCell>
                    <TableCell>
                      {officeAccount.licenseExpiry ? (
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                          <span>{formattedDate(officeAccount.licenseExpiry)}</span>
                          {calculateDaysRemaining(officeAccount.licenseExpiry)}
                        </div>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Account Status</TableCell>
                    <TableCell>
                      <Badge variant={officeAccount.isActive ? "default" : "destructive"}>
                        {officeAccount.isActive ? "Active" : "Inactive"}
                      </Badge>
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