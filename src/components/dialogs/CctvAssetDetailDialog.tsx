"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Asset } from "@/lib/types";
import { Skeleton } from "../ui/skeleton";
import {
  Package,
  Fingerprint,
  Building,
  Camera,
  Monitor,
  Eye,
  Tags,
  Cpu,
  Type,
  Server,
  Power,
  Network,
  Shield,
  User,
  Clock,
  Info,
  Key,
} from "lucide-react";
import React from "react";
import { Badge } from "../ui/badge";
import CCTVViewLink from "../cctv";

interface CctvAssetDetailDialogProps {
  asset: Asset | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const DetailRow = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) => (
  <div className="flex items-center space-x-4 py-2 border-b">
    <div className="text-muted-foreground">{icon}</div>
    <div className="flex-1">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="text-md font-semibold">{value}</p>
    </div>
  </div>
);

const StatusBadge = ({ status }: { status: string }) => {
  const getStatusClass = () => {
    switch (status) {
      case "GOOD":
        return "bg-green-100 text-green-800 border-green-400";
      case "RUSAK":
        return "bg-red-100 text-red-800 border-red-400";
      case "SERVICE":
        return "bg-yellow-100 text-yellow-800 border-yellow-400";
      default:
        return "bg-gray-100 text-gray-800 border-gray-400";
    }
  };
  return <Badge className={getStatusClass()}>{status}</Badge>;
};

export function CctvAssetDetailDialog({
  asset,
  isOpen,
  onOpenChange,
}: CctvAssetDetailDialogProps) {
  const { data: cctvDetails, isLoading } = useQuery({
    queryKey: ["cctv-asset", asset?.id],
    queryFn: async () => {
      if (!asset) return null;
      const res = await fetch(`/api/assets/${asset.id}`);
      if (!res.ok) {
        throw new Error("Failed to fetch asset details");
      }
      return res.json();
    },
    enabled: !!asset,
  });

  const renderSkeleton = () => (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-1/2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-1/2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    </div>
  );

  const renderDetails = () => {
    if (isLoading) {
      return renderSkeleton();
    }

    if (!cctvDetails) {
      return <div>No details available.</div>;
    }

    const {
      namaAsset,
      nomorSeri,
      cctvSpecs,
      statusAsset,
      assignments,
      createdAt,
      updatedAt,
    } = cctvDetails.data;

    const spec = cctvSpecs;

    return (
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Info className="mr-2" /> General Info
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* <DetailRow icon={<Package />} label="Nama Asset" value={namaAsset} /> */}
            <DetailRow icon={<Fingerprint />} label="Nomor Seri" value={nomorSeri} />
            <DetailRow
              icon={<Info />}
              label="Status"
              value={<StatusBadge status={statusAsset} />}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Cpu className="mr-2" /> Specifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DetailRow
              icon={<Tags />}
              label="Brand"
              value={spec?.brand?.value ?? "-"}
            />
            <DetailRow
              icon={<Package />}
              label="Model"
              value={spec?.model?.value ?? "-"}
            />
            <DetailRow
              icon={<Type />}
              label="Device Type"
              value={spec?.deviceType?.value ?? "-"}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Monitor className="mr-2" /> Placement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DetailRow
              icon={<Building />}
              label="Perusahaan (SBU)"
              value={spec?.sbu?.replace(/_/g, " ") ?? "-"}
            />
            <DetailRow
              icon={<Camera />}
              label="Channel Camera"
              value={`${spec?.channelCamera?.sbu ?? ""} - ${
                spec?.channelCamera?.lokasi ?? ""
              }`}
            />
            <DetailRow
              icon={<Eye />}
              label="View Camera"
              value={<CCTVViewLink link={spec?.viewCamera ?? "#"} />}
            />
             <DetailRow
              icon={<Eye />}
              label="Name Site"
              value={spec?.nameSite ?? "-"}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Server className="mr-2" /> System & Network
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DetailRow
              icon={<Info />}
              label="System Version"
              value={spec?.systemVersion ?? "-"}
            />
            <DetailRow
              icon={<Power />}
              label="Power"
              value={spec?.power ?? "-"}
            />
            <DetailRow
              icon={<Network />}
              label="IP Address"
              value={spec?.ipAddress ?? "-"}
            />
            <DetailRow
              icon={<Fingerprint />}
              label="MAC Address"
              value={spec?.macAddress ?? "-"}
            />
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="mr-2" /> Assignment & History
            </CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-6">
             <div>
                <DetailRow
                icon={<User />}
                label="Assigned To"
                value={assignments?.[0]?.user?.namaLengkap ?? "Not Assigned"}
                />
             </div>
             <div>
                <DetailRow
                icon={<Clock />}
                label="Created At"
                value={new Date(createdAt).toLocaleString()}
                />
             </div>
             <div>
                <DetailRow
                icon={<Clock />}
                label="Updated At"
                value={new Date(updatedAt).toLocaleString()}
                />
             </div>
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Key className="mr-2" /> Credentials
            </CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6">
             <div>
                <DetailRow
                icon={<User />}
                label="Username"
                value={spec?.username ?? "-"}
                />
             </div>
             <div>
                <DetailRow
                icon={<Key />}
                label="Password"
                value={"********"}
                />
             </div>
          </CardContent>
        </Card>

      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent size="6xl">
        <DialogHeader>
          <DialogTitle>CCTV Asset Details</DialogTitle>
        </DialogHeader>
        {renderDetails()}
      </DialogContent>
    </Dialog>
  );
}