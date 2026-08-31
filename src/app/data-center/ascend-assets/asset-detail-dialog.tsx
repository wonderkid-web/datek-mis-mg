"use client";

import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { AscendAsset } from "@/lib/ascendAssetTypes";
import {
  getAscendCompanyLabel,
  getAscendDepartmentLabel,
  getAscendLocationLabel,
  getAscendRegionLabel,
  getAscendStatusLabel,
} from "@/lib/ascendAssetMappings";

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "UTC",
});

const currencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

function formatDate(value: string | null) {
  if (!value) return "-";
  return dateFormatter.format(new Date(value));
}

function DetailItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 break-words text-sm">{value || "-"}</dd>
    </div>
  );
}

interface AscendAssetDetailDialogProps {
  asset: AscendAsset | null;
  onClose: () => void;
}

export function AscendAssetDetailDialog({
  asset,
  onClose,
}: AscendAssetDetailDialogProps) {
  return (
    <Dialog open={Boolean(asset)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Asset: {asset?.assetCode ?? "-"}</DialogTitle>
          <DialogDescription>{asset?.assetName}</DialogDescription>
        </DialogHeader>

        {asset && (
          <>
            <div className="rounded-md border bg-muted/20 p-4">
              <dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <DetailItem label="Description" value={asset.assetName} />
                <DetailItem
                  label="Company"
                  value={getAscendCompanyLabel(asset.companyCode)}
                />
                <DetailItem
                  label="Region"
                  value={getAscendRegionLabel(asset.categoryCode)}
                />
                <DetailItem
                  label="Department"
                  value={getAscendDepartmentLabel(asset.departmentCode)}
                />
                <DetailItem
                  label="Location"
                  value={getAscendLocationLabel(asset.locationCode)}
                />
                <DetailItem label="Unit" value={asset.unitCode} />
              </dl>
            </div>

            <div>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Acquisition
              </h3>
              <dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <DetailItem
                  label="Register Date"
                  value={formatDate(asset.registerDate)}
                />
                <DetailItem
                  label="Acquisition Date"
                  value={formatDate(asset.acquisitionDate)}
                />
                <DetailItem
                  label="Acquisition Cost"
                  value={currencyFormatter.format(asset.acquisitionCost)}
                />
                <DetailItem label="Supplier Name" value={asset.supplierName} />
                <DetailItem label="User Name" value={asset.userName} />
                <DetailItem
                  label="Status"
                  value={getAscendStatusLabel(asset.statusCode)}
                />
                <DetailItem label="Barcode" value={asset.barcode} />
                <DetailItem label="Capex" value={asset.capex ? "Yes" : "No"} />
                <DetailItem
                  label="State"
                  value={
                    <Badge variant={asset.disabled ? "secondary" : "outline"}>
                      {asset.disabled ? "Inactive" : "Active"}
                    </Badge>
                  }
                />
                <DetailItem
                  label="Inactive Date"
                  value={formatDate(asset.inactiveDateTime)}
                />
              </dl>
            </div>

            <div className="rounded-md border bg-muted/30 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Remarks
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm">
                {asset.remarks || "-"}
              </p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
