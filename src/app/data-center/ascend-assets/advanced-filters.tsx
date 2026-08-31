"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Layers3, RotateCcw, SlidersHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  AscendAssetFilterOptions,
  AscendAssetFilters,
  AscendAssetGroupBy,
  AscendAssetState,
} from "@/lib/ascendAssetTypes";
import {
  getAscendCompanyLabel,
  getAscendDepartmentLabel,
  getAscendLocationLabel,
  getAscendRegionLabel,
  getAscendStatusLabel,
} from "@/lib/ascendAssetMappings";

interface AdvancedFiltersProps {
  filters: AscendAssetFilters;
  options?: AscendAssetFilterOptions;
  groupBy: AscendAssetGroupBy;
  onApply: (filters: AscendAssetFilters) => void;
  onReset: () => void;
  onGroupByChange: (groupBy: AscendAssetGroupBy) => void;
}

function activeFilterCount(filters: AscendAssetFilters) {
  return Object.entries(filters).filter(([key, value]) => {
    if (key === "state") return value && value !== "all";
    return typeof value === "string" && value.trim() !== "";
  }).length;
}

export function AscendAdvancedFilters({
  filters,
  options,
  groupBy,
  onApply,
  onReset,
  onGroupByChange,
}: AdvancedFiltersProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<AscendAssetFilters>(filters);

  useEffect(() => setDraft(filters), [filters]);

  const count = useMemo(() => activeFilterCount(filters), [filters]);
  const update = (key: keyof AscendAssetFilters, value: string | undefined) =>
    setDraft((current) => ({ ...current, [key]: value }));
  const selectValue = (value: string | undefined) => value || "all";

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="mb-4">
      <div className="flex flex-wrap items-center gap-2">
        <CollapsibleTrigger asChild>
          <Button variant="outline" size="sm">
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            Advanced Filters
            {count > 0 && <Badge className="ml-2">{count}</Badge>}
            <ChevronDown
              className={`ml-2 h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
            />
          </Button>
        </CollapsibleTrigger>

        <div className="flex items-center gap-2">
          <Layers3 className="h-4 w-4 text-muted-foreground" />
          <Select
            value={groupBy}
            onValueChange={(value: AscendAssetGroupBy) => onGroupByChange(value)}
          >
            <SelectTrigger className="h-9 w-[190px]">
              <SelectValue placeholder="Group by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No grouping</SelectItem>
              <SelectItem value="companyCode">Company</SelectItem>
              <SelectItem value="categoryCode">Region</SelectItem>
              <SelectItem value="locationCode">Location</SelectItem>
              <SelectItem value="departmentCode">Department</SelectItem>
              <SelectItem value="unitCode">Unit</SelectItem>
              <SelectItem value="statusCode">Status</SelectItem>
              <SelectItem value="disabled">State</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {(count > 0 || groupBy !== "none") && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setDraft({ state: "all" });
              onReset();
            }}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
        )}
      </div>

      <CollapsibleContent>
        <div className="mt-3 rounded-lg border bg-muted/20 p-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1.5">
              <Label>Asset Code</Label>
              <Input
                value={draft.assetCode ?? ""}
                onChange={(event) => update("assetCode", event.target.value)}
                placeholder="Contains..."
              />
            </div>
            <div className="space-y-1.5">
              <Label>Asset Name</Label>
              <Input
                value={draft.assetName ?? ""}
                onChange={(event) => update("assetName", event.target.value)}
                placeholder="Contains..."
              />
            </div>
            <div className="space-y-1.5">
              <Label>Barcode</Label>
              <Input
                value={draft.barcode ?? ""}
                onChange={(event) => update("barcode", event.target.value)}
                placeholder="Contains..."
              />
            </div>
            <div className="space-y-1.5">
              <Label>User Name</Label>
              <Input
                value={draft.userName ?? ""}
                onChange={(event) => update("userName", event.target.value)}
                placeholder="Contains..."
              />
            </div>

            <div className="space-y-1.5">
              <Label>Company</Label>
              <Select
                value={selectValue(draft.companyCode)}
                onValueChange={(value) => update("companyCode", value === "all" ? undefined : value)}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All companies</SelectItem>
                  {options?.companies.map((code) => (
                    <SelectItem key={code} value={code}>{getAscendCompanyLabel(code)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Region</Label>
              <Select
                value={selectValue(draft.categoryCode)}
                onValueChange={(value) => update("categoryCode", value === "all" ? undefined : value)}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All regions</SelectItem>
                  {options?.regions.map((code) => (
                    <SelectItem key={code} value={code}>{getAscendRegionLabel(code)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Location</Label>
              <Select
                value={selectValue(draft.locationCode)}
                onValueChange={(value) => update("locationCode", value === "all" ? undefined : value)}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All locations</SelectItem>
                  {options?.locations.map((code) => (
                    <SelectItem key={code} value={code}>{getAscendLocationLabel(code)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Department</Label>
              <Select
                value={selectValue(draft.departmentCode)}
                onValueChange={(value) => update("departmentCode", value === "all" ? undefined : value)}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All departments</SelectItem>
                  {options?.departments.map((code) => (
                    <SelectItem key={code} value={code}>{getAscendDepartmentLabel(code)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select
                value={selectValue(draft.statusCode)}
                onValueChange={(value) => update("statusCode", value === "all" ? undefined : value)}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {options?.statuses.map((code) => (
                    <SelectItem key={code} value={code}>{getAscendStatusLabel(code)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>State</Label>
              <Select
                value={draft.state ?? "all"}
                onValueChange={(value: AscendAssetState) => update("state", value)}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All states</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="disabled">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Unit contains</Label>
              <Input
                value={draft.unitCode ?? ""}
                onChange={(event) => update("unitCode", event.target.value)}
                placeholder="Example: FS-G01"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Acquisition From</Label>
              <Input type="date" value={draft.acquisitionDateFrom ?? ""} onChange={(event) => update("acquisitionDateFrom", event.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Acquisition To</Label>
              <Input type="date" value={draft.acquisitionDateTo ?? ""} onChange={(event) => update("acquisitionDateTo", event.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Register From</Label>
              <Input type="date" value={draft.registerDateFrom ?? ""} onChange={(event) => update("registerDateFrom", event.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Register To</Label>
              <Input type="date" value={draft.registerDateTo ?? ""} onChange={(event) => update("registerDateTo", event.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Minimum Cost</Label>
              <Input type="number" min="0" value={draft.minimumCost ?? ""} onChange={(event) => update("minimumCost", event.target.value)} placeholder="0" />
            </div>
            <div className="space-y-1.5">
              <Label>Maximum Cost</Label>
              <Input type="number" min="0" value={draft.maximumCost ?? ""} onChange={(event) => update("maximumCost", event.target.value)} placeholder="No limit" />
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-2 border-t pt-4">
            <Button variant="outline" onClick={() => setDraft(filters)}>Undo draft</Button>
            <Button onClick={() => onApply(draft)}>Apply Filters</Button>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
