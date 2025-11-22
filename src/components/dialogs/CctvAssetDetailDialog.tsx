"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Asset } from "@/lib/types";
import { Skeleton } from "../ui/skeleton";
import React from "react";
import CCTVViewLink from "../cctv";
import Image from "next/image";

interface CctvAssetDetailDialogProps {
  asset: Asset | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

// Komponen baris sederhana
const DetailRow = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <div className="grid grid-cols-3 items-center py-3 border-b last:border-0">
    <div className="font-medium text-muted-foreground col-span-1">{label}</div>
    <div className="font-semibold col-span-2 text-foreground break-words">
      {value}
    </div>
  </div>
);

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

  const renderDetails = () => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      );
    }

    if (!cctvDetails) {
      return <div>No details available.</div>;
    }

    const { nomorSeri, cctvSpecs } = cctvDetails.data;
    const spec = cctvSpecs;

    return (
      <Card className="border-none shadow-none">
        <CardContent className="p-0">
          <DetailRow
            label="Perusahaan (SBU)"
            value={spec?.sbu?.replace(/_/g, " ") ?? "-"}
          />
          <DetailRow 
            label="Site Name" 
            value={spec?.nameSite ?? "-"} 
          />
          <DetailRow
            label="View Kamera"
            value={<CCTVViewLink link={spec?.viewCamera ?? "#"} />}
          />
          <DetailRow 
            label="Brand" 
            value={spec?.brand?.value ?? "-"} 
          />
          <DetailRow 
            label="Model" 
            value={spec?.model?.value ?? "-"} 
          />
          <DetailRow
            label="Device Type"
            value={spec?.deviceType?.value ?? "-"}
          />
          <DetailRow 
            label="Serial Number" 
            value={nomorSeri ?? "-"} 
          />
          <DetailRow
            label="System Version"
            value={spec?.systemVersion ?? "-"}
          />
          <DetailRow 
            label="Power" 
            value={spec?.power ?? "-"} 
          />
          <DetailRow 
            label="Mac Address" 
            value={spec?.macAddress ?? "-"} 
          />
          <DetailRow 
            label="Username" 
            value={spec?.username ?? "-"} 
          />
          <DetailRow 
            label="Password" 
            value={spec?.password ?? "-"} 
          />
        </CardContent>
      </Card>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>CCTV Detail Information</DialogTitle>
        </DialogHeader>
        {renderDetails()}
      </DialogContent>
    </Dialog>
  );
}