"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IspClient } from "./page";
import {
  Building,
  Fingerprint,
  Globe,
  MapPin,
  Server,
  DollarSign,
  Shield,
  User,
  Key,
  Network,
  Info,
  Zap,
  Phone,
  BarChart,
  FileText
} from "lucide-react";
import React from "react";
import Link from "next/link";

interface IspDetailDialogProps {
  isp: IspClient | null;
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

export function IspDetailDialog({
  isp,
  isOpen,
  onOpenChange,
}: IspDetailDialogProps) {
  if (!isp) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>ISP Details</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col gap-4 mt-2 overflow-y-auto pr-2">
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-base">
                <Info className="mr-2 h-5 w-5" />
                ISP Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-1 gap-3">
              <DetailItem icon={<Server />} label="ISP" value={isp.isp} />
              <DetailItem icon={<Fingerprint />} label="AS Number" value={isp.asNumber} />
              <DetailItem icon={<Zap />} label="Product Service" value={isp.productService} />
              {/* <DetailItem icon={<BarChart />} label="Bandwidth" value={isp.bandwidth} /> */}
              <DetailItem icon={<Network />} label="IP Public" value={isp.ipPublic} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-base">
                <MapPin className="mr-2 h-5 w-5" />
                Location
              </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-1 gap-3">
              <DetailItem icon={<FileText />} label="Address" value={isp.address} />
              <DetailItem icon={<Globe />} label="Maps" value={<Link className="text-blue-600 italic" href={isp.maps} target="_blank" rel="noopener noreferrer">Link Maps</Link>} />
              <DetailItem icon={<Server />} label="POP" value={isp.pop} />
              <DetailItem icon={<Zap />} label="Transmisi" value={isp.transmisi} />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-base">
                <DollarSign className="mr-2 h-5 w-5" />
                Pricing and SLA
              </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-1 gap-3">
                {/* <DetailItem icon={<DollarSign />} label="Price" value={new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(Number(isp.price))} /> */}
                <DetailItem icon={<Shield />} label="SLA" value={isp.sla} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-base">
                <User className="mr-2 h-5 w-5" />
                Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-1 gap-3">
                <DetailItem icon={<User />} label="PIC NOC" value={isp.picNoc} />
                <DetailItem icon={<Phone />} label="HP NOC" value={isp.hpNoc} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-base">
                <Key className="mr-2 h-5 w-5" />
                Credentials
              </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-1 gap-3">
                <DetailItem icon={<BarChart />} label="PRTG" value={isp.prtg} />
                <DetailItem icon={<User />} label="Username" value={isp.username} />
                <DetailItem icon={<Key />} label="Password" value={"********"} />
            </CardContent>
          </Card>

        </div>
      </DialogContent>
    </Dialog>
  );
}
