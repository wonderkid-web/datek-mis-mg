// @ts-nocheck
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MaintenanceWithDetails } from "./columns"; // Assuming this type is exported and comprehensive
import {
  Calendar,
  Building,
  Fingerprint,
  Camera,
  Monitor,
  Eye,
  Tags,
  Package,
  Type,
  GitBranch,
  Power,
  Network,
  Shield,
  Key,
  Info,
  MapPin,
} from "lucide-react";
import React from "react";
import { Badge } from "@/components/ui/badge";
import { CCTVStatus } from "@prisma/client";
import CCTVViewLink from "@/components/cctv";

interface MaintenanceDetailDialogProps {
  maintenance: MaintenanceWithDetails | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const DetailItem = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) => (
  <div className="flex items-start space-x-3 py-2 border-b">
    <div className="text-muted-foreground mt-1">{icon}</div>
    <div className="flex-1">
      <p className="text-xs font-semibold text-muted-foreground">{label}</p>
      <div className="text-md font-semibold">{value}</div>
    </div>
  </div>
);

const StatusBadge = ({ status }: { status: CCTVStatus }) => {
  const getStatusClass = () => {
    switch (status) {
      case "GOOD":
        return "bg-green-100 text-green-800 border-green-400";
      case "TROUBLE":
        return "bg-yellow-100 text-yellow-800 border-yellow-400";
      case "BROKEN":
        return "bg-red-100 text-red-800 border-red-400";
      default:
        return "bg-gray-100 text-gray-800 border-gray-400";
    }
  };
  return <Badge className={getStatusClass()}>{status}</Badge>;
};

export function MaintenanceDetailDialog({
  maintenance,
  isOpen,
  onOpenChange,
}: MaintenanceDetailDialogProps) {
  if (!maintenance) return null;

  const spec = maintenance.channelCamera?.cctvSpecs[0];
  // @ts-expect-error its about name site that i was deleted
  const asset = spec?.asset;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {/* Saya ubah size jadi max-w-2xl agar pas untuk tampilan list vertical */}
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Maintenance Record Details</DialogTitle>
        </DialogHeader>
        
        {/* Container utama diubah jadi flex column (vertical list) */}
        <div className="flex flex-col gap-4 mt-2 overflow-y-auto pr-2">
          
          {/* 1. Record Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-base">
                <Info className="mr-2 h-5 w-5" />
                Record Info
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              <DetailItem icon={<Calendar />} label="Report Date" value={new Date(maintenance.periode).toLocaleDateString()} />
              <DetailItem icon={<Building />} label="Perusahaan" value={maintenance.perusahaan.replace(/_/g, " ")} />
              <DetailItem icon={<MapPin />} label="Name Site" value={spec?.channelCamera?.lokasi ?? '-'} />
              <DetailItem icon={<Eye />} label="View Camera" value={<CCTVViewLink link={spec?.viewCamera ?? '#'} />} />
              <DetailItem icon={<Info />} label="Status" value={<StatusBadge status={maintenance.status} />} />
              {/* Note: Label sebelumnya 'Status Recorded' dobel, saya sesuaikan label remarks */}
              <DetailItem icon={<Info />} label="Remarks" value={maintenance.remarks || '-'} />
            </CardContent>
          </Card>

          {/* 2. Placement */}
          {/* <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-base">
                <Monitor className="mr-2 h-5 w-5" />
                Placement
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              <DetailItem 
                icon={<Camera />} 
                label="Channel Camera" 
                value={`${maintenance.channelCamera.sbu.replace(/_/g, " ")} - ${maintenance.channelCamera.lokasi}`} 
              />
              
              
            </CardContent>
          </Card> */}

          {/* 3. Asset & Specifications */}
          {/* <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-base">
                <Package className="mr-2 h-5 w-5" />
                Asset & Specifications
              </CardTitle>
            </CardHeader>

            <CardContent className="grid gap-3 text-sm">
              <DetailItem icon={<Fingerprint />} label="Serial Number" value={asset?.nomorSeri ?? '-'} />
              <DetailItem icon={<Tags />} label="Brand" value={spec?.brand?.value ?? '-'} />
              <DetailItem icon={<Package />} label="Model" value={spec?.model?.value ?? '-'} />
              <DetailItem icon={<Type />} label="Device Type" value={spec?.deviceType?.value ?? '-'} />
              <DetailItem icon={<GitBranch />} label="System Version" value={spec?.systemVersion ?? '-'} />
              <DetailItem icon={<Power />} label="Power" value={spec?.power ?? '-'} />
            </CardContent>
          </Card> */}

          {/* 4. Network & Credentials */}
          {/* <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-base">
                <Shield className="mr-2 h-5 w-5" />
                Network & Credentials
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm">
              <DetailItem icon={<Network />} label="IP Address" value={spec?.ipAddress ?? '-'} />
              <DetailItem icon={<Fingerprint />} label="MAC Address" value={spec?.macAddress ?? '-'} />
              <DetailItem icon={<Key />} label="Username" value={spec?.username ?? '-'} />
              <DetailItem icon={<Key />} label="Password" value={"********"} />
            </CardContent>
          </Card> */}

        </div>
      </DialogContent>
    </Dialog>
  );
}

// export function MaintenanceDetailDialog({
//   maintenance,
//   isOpen,
//   onOpenChange,
// }: MaintenanceDetailDialogProps) {
//   if (!maintenance) return null;

//   const spec = maintenance.channelCamera.cctvSpecs[0];
//   // @ts-expect-error its about name site that i was deleted
//   const asset = spec?.asset;

//   return (
//     <Dialog open={isOpen} onOpenChange={onOpenChange}>
//       <DialogContent size="6xl">
//         <DialogHeader>
//           <DialogTitle>Maintenance Record Details</DialogTitle>
//         </DialogHeader>
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4 max-h-[80vh] overflow-y-auto p-2">
//           <Card>
//             <CardHeader><CardTitle className="flex items-center"><Info className="mr-2" />Record Info</CardTitle></CardHeader>
//             <CardContent>
//               <DetailItem icon={<Calendar />} label="Report Date" value={new Date(maintenance.periode).toLocaleDateString()} />
//               <DetailItem icon={<Building />} label="Perusahaan" value={maintenance.perusahaan.replace(/_/g, " ")} />
//               <DetailItem icon={<Info />} label="Status Recorded" value={<StatusBadge status={maintenance.status} />} />
//               <DetailItem icon={<Info />} label="Status Recorded" value={<StatusBadge status={maintenance.remarks} />} />
//             </CardContent>
//           </Card>
//           <Card>
//             <CardHeader><CardTitle className="flex items-center"><Monitor className="mr-2" />Placement</CardTitle></CardHeader>
//             <CardContent>
//               <DetailItem icon={<Camera />} label="Channel Camera" value={`${maintenance.channelCamera.sbu.replace(/_/g, " ")} - ${maintenance.channelCamera.lokasi}`} />
//               <DetailItem icon={<MapPin />} label="Name Site" value={spec?.nameSite ?? '-'} />
//               <DetailItem icon={<Eye />} label="View Camera" value={<CCTVViewLink link={spec?.viewCamera ?? '#'} />} />
//             </CardContent>
//           </Card>
//           <Card className="lg:col-span-2">
//             <CardHeader><CardTitle className="flex items-center"><Package className="mr-2" />Asset & Specifications</CardTitle></CardHeader>
//             <CardContent className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2 text-sm">
//               <DetailItem icon={<Fingerprint />} label="Serial Number" value={asset?.nomorSeri ?? '-'} />
//               <DetailItem icon={<Tags />} label="Brand" value={spec?.brand?.value ?? '-'} />
//               <DetailItem icon={<Package />} label="Model" value={spec?.model?.value ?? '-'} />
//               <DetailItem icon={<Type />} label="Device Type" value={spec?.deviceType?.value ?? '-'} />
//               <DetailItem icon={<GitBranch />} label="System Version" value={spec?.systemVersion ?? '-'} />
//               <DetailItem icon={<Power />} label="Power" value={spec?.power ?? '-'} />
//             </CardContent>
//           </Card>
//           <Card className="lg:col-span-2">
//             <CardHeader><CardTitle className="flex items-center"><Shield className="mr-2" />Network & Credentials</CardTitle></CardHeader>
//             <CardContent className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2 text-sm">
//               <DetailItem icon={<Network />} label="IP Address" value={spec?.ipAddress ?? '-'} />
//               <DetailItem icon={<Fingerprint />} label="MAC Address" value={spec?.macAddress ?? '-'} />
//               <DetailItem icon={<Key />} label="Username" value={spec?.username ?? '-'} />
//               <DetailItem icon={<Key />} label="Password" value={"********"} />
//             </CardContent>
//           </Card>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }
