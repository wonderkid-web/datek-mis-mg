"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Laptop,
  Tag,
  Calendar,
  CheckCircle,
  MapPin,
  MemoryStick,
  Cpu,
  HardDrive,
  Monitor,
  BatteryCharging,
  Palette,
  Building,
  Type,
  CircuitBoard,
  Key,
  Wifi,
  Cable,
  User,
  FileText,
  Hash,
} from "lucide-react";
import { AssetAssignment } from "@prisma/client";

interface ViewAssignmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: AssetAssignment;
}

export function ViewAssignmentDialog({ isOpen, onClose, assignment }: ViewAssignmentDialogProps) {
  const asset = assignment.asset;
  const laptopSpecs = asset?.laptopSpecs;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assignment Details</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-6 py-4">
          {/* Assignment Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center"><User className="mr-2" />Assignment Info</h3>
            <Table>
              <TableBody>
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
              
              </TableBody>
            </Table>
          </div>

          {/* Asset Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center"><Laptop className="mr-2" />Asset Info</h3>
            <Table>
              <TableBody>
                  <TableRow>
                  <TableCell className="font-medium">Asset Number</TableCell>
                  <TableCell>{assignment.nomorAsset || "-"}</TableCell>
                </TableRow>
                 <TableRow>
                  <TableCell className="font-medium">Category</TableCell>
                  <TableCell>{asset.category?.nama || "Laptop"}</TableCell>
                </TableRow>
                 <TableRow>
                    <TableCell className="font-medium flex items-center">Brand</TableCell>
                    <TableCell>{laptopSpecs?.brandOption?.value || "-"}</TableCell>
                  </TableRow>
                    <TableRow>
                    <TableCell className="font-medium flex items-center ">Color </TableCell>
                    <TableCell>{laptopSpecs?.colorOption?.value || "-"}</TableCell>
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
                  <TableCell>{asset.tanggalPembelian ? new Date(asset.tanggalPembelian).toLocaleDateString() : "-"}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Warranty Date:</TableCell>
                  <TableCell>{asset.tanggalGaransi ? new Date(asset.tanggalGaransi).toLocaleDateString() : "-"}</TableCell>
                </TableRow>
                
                <TableRow>
                  <TableCell className="font-medium">Status:</TableCell>
                  <TableCell>{asset.statusAsset}</TableCell>
                </TableRow>
                {/* <TableRow>
                  <TableCell className="font-medium">Notes</TableCell>
                  <TableCell>{assignment.catatan || "-"}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Assigned Date</TableCell>
                  <TableCell>{new Date(assignment.createdAt).toLocaleDateString()}</TableCell>
                </TableRow> */}
               
               
              </TableBody>
            </Table>
          </div>

          {/* Laptop Specific Details */}
          {laptopSpecs && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center"><Laptop className="mr-2" />Laptop Specifications</h3>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium flex items-center"><Cpu className="mr-2" />Processor</TableCell>
                    <TableCell>{laptopSpecs?.processorOption?.value || "-"}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium flex items-center"><MemoryStick className="mr-2" />RAM</TableCell>
                    <TableCell>{laptopSpecs?.ramOption?.value || "-"}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium flex items-center"><HardDrive className="mr-2" />Storage Type</TableCell>
                    <TableCell>{laptopSpecs?.storageTypeOption?.value || "-"}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium flex items-center"><CircuitBoard className="mr-2" />Graphic</TableCell>
                    <TableCell>{laptopSpecs?.graphicOption?.value || "-"}</TableCell>
                  </TableRow>
                    <TableRow>
                    <TableCell className="font-medium flex items-center"><Wifi className="mr-2" />MAC WLAN</TableCell>
                    <TableCell>{laptopSpecs?.macWlan || "-"}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium flex items-center"><Cable className="mr-2" />MAC LAN</TableCell>
                    <TableCell>{laptopSpecs?.macLan || "-"}</TableCell>
                  </TableRow>
                    <TableRow>
                    <TableCell className="font-medium flex items-center"><BatteryCharging className="mr-2" />Power</TableCell>
                    <TableCell>{laptopSpecs?.powerOption?.value || "-"}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium flex items-center"><Monitor className="mr-2" />OS</TableCell>
                    <TableCell>{laptopSpecs?.osOption?.value || "-"}</TableCell>
                  </TableRow>
                   <TableRow>
                    <TableCell className="font-medium flex items-center"><Key className="mr-2" />License</TableCell>
                    <TableCell>{laptopSpecs?.licenseOption?.value || "-"}</TableCell>
                  </TableRow>
                
                
                  <TableRow>
                    <TableCell className="font-medium flex items-center"><FileText className="mr-2" />Microsoft Office</TableCell>
                    <TableCell>{laptopSpecs?.microsoftOfficeOption?.value || "-"}</TableCell>
                  </TableRow>
                
                 
                  
                 

                </TableBody>
              </Table>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

