"use client";

import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AscendAssetGroup, AscendAssetGroupBy } from "@/lib/ascendAssetTypes";
import {
  getAscendCompanyLabel,
  getAscendDepartmentLabel,
  getAscendLocationLabel,
  getAscendRegionLabel,
  getAscendStatusLabel,
} from "@/lib/ascendAssetMappings";

const currencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const GROUP_LABELS: Record<Exclude<AscendAssetGroupBy, "none">, string> = {
  companyCode: "Company",
  categoryCode: "Region",
  locationCode: "Location",
  departmentCode: "Department",
  unitCode: "Unit",
  statusCode: "Status",
  disabled: "State",
};

function groupLabel(groupBy: Exclude<AscendAssetGroupBy, "none">, value: string) {
  if (value === "(blank)") return "Not specified";
  if (groupBy === "companyCode") return getAscendCompanyLabel(value);
  if (groupBy === "categoryCode") return getAscendRegionLabel(value);
  if (groupBy === "locationCode") return getAscendLocationLabel(value);
  if (groupBy === "departmentCode") return getAscendDepartmentLabel(value);
  if (groupBy === "statusCode") return getAscendStatusLabel(value);
  if (groupBy === "disabled") return value === "inactive" ? "Inactive" : "Active";
  return value;
}

interface AscendGroupsTableProps {
  groupBy: Exclude<AscendAssetGroupBy, "none">;
  groups: AscendAssetGroup[];
  onDrillDown: (value: string) => void;
}

export function AscendGroupsTable({
  groupBy,
  groups,
  onDrillDown,
}: AscendGroupsTableProps) {
  return (
    <div className="overflow-hidden rounded-md border">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-200 dark:bg-muted">
              <TableHead>{GROUP_LABELS[groupBy]}</TableHead>
              <TableHead className="text-right">Total Assets</TableHead>
              <TableHead className="text-right">Active</TableHead>
              <TableHead className="text-right">Inactive</TableHead>
              <TableHead className="text-right">Total Cost</TableHead>
              <TableHead className="w-28 text-center">Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {groups.length > 0 ? (
              groups.map((group) => (
                <TableRow
                  key={group.value}
                  className={group.value === "inactive" ? "bg-red-50 dark:bg-red-950/30" : ""}
                >
                  <TableCell className="font-medium">
                    {groupLabel(groupBy, group.value)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {group.total.toLocaleString("id-ID")}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    <Badge variant="outline">{group.active.toLocaleString("id-ID")}</Badge>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    <Badge variant={group.inactive > 0 ? "destructive" : "outline"}>
                      {group.inactive.toLocaleString("id-ID")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {currencyFormatter.format(group.totalCost)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Button variant="ghost" size="sm" onClick={() => onDrillDown(group.value)}>
                      Open <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No grouped results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
