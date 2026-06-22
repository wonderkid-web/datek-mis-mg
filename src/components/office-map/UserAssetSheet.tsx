"use client";

import { Building2, BriefcaseBusiness, Mail, MapPin, Package2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import type { OfficeSeat } from "@/lib/types";

interface UserAssetSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  seat: OfficeSeat | null;
}

const detailRows = (seat: OfficeSeat | null) => {
  const user = seat?.user;
  if (!user) {
    return [];
  }

  return [
    {
      label: "Label Seat",
      value:
        seat?.label?.trim() ||
        (seat
          ? `${seat.side === "TOP" ? "Atas" : "Bawah"} #${seat.position}`
          : "-"),
      icon: Building2,
    },
    {
      label: "Department",
      value: user.departemen ?? "-",
      icon: Building2,
    },
    {
      label: "Homebase",
      value: user.jabatan ?? "-",
      icon: BriefcaseBusiness,
    },
    {
      label: "Corporate",
      value: user.lokasiKantor ?? "-",
      icon: MapPin,
    },
    {
      label: "Email",
      value: user.email ?? "-",
      icon: Mail,
    },
  ];
};

export function UserAssetSheet({
  open,
  onOpenChange,
  seat,
}: UserAssetSheetProps) {
  const user = seat?.user;
  const assetAssignments = user?.assetAssignments ?? [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>{user?.namaLengkap ?? "Detail Seat"}</SheetTitle>
          <SheetDescription>
            {seat
              ? `${seat.label?.trim() || `Seat ${seat.side === "TOP" ? "atas" : "bawah"} #${seat.position}`}`
              : "Pilih user pada map untuk melihat aset yang sedang dipegang."}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Profil User</CardTitle>
              <CardDescription>
                Ringkasan identitas user yang menempati seat ini.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {detailRows(seat).map((row) => {
                const Icon = row.icon;

                return (
                  <div
                    key={row.label}
                    className="flex items-start justify-between gap-3 rounded-xl border px-4 py-3"
                  >
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Icon className="h-4 w-4" />
                      <span>{row.label}</span>
                    </div>
                    <span className="text-right text-sm font-medium text-slate-900">
                      {row.value}
                    </span>
                  </div>
                );
              })}
              <div className="flex items-center justify-between rounded-xl border px-4 py-3">
                <span className="text-sm text-slate-600">Status</span>
                <Badge variant={user?.isActive ? "default" : "secondary"}>
                  {user?.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Package2 className="h-4 w-4" />
                Assigned Assets
              </CardTitle>
              <CardDescription>
                Semua aset yang saat ini terhubung ke user tersebut.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {assetAssignments.length > 0 ? (
                assetAssignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex flex-col gap-1">
                        <p className="font-medium text-slate-950">
                          {assignment.asset.namaAsset}
                        </p>
                        <p className="text-sm text-slate-500">
                          {assignment.asset.category.nama}
                        </p>
                      </div>
                      <Badge variant="secondary">{assignment.nomorAsset}</Badge>
                    </div>
                    <div className="mt-3 grid gap-2 text-sm text-slate-600">
                      <div className="flex items-center justify-between gap-3">
                        <span>Serial Number</span>
                        <span className="font-medium text-slate-900">
                          {assignment.asset.nomorSeri}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span>Status</span>
                        <span className="font-medium text-slate-900">
                          {assignment.asset.statusAsset}
                        </span>
                      </div>
                      {assignment.catatan ? (
                        <div className="rounded-xl bg-white px-3 py-2 text-sm text-slate-600">
                          {assignment.catatan}
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed px-4 py-8 text-center text-sm text-slate-500">
                  User ini belum punya asset yang sedang ter-assign.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  );
}
