"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Database, RefreshCw, Search } from "lucide-react";
import {
  getAscendAssetFilterOptions,
  getAscendAssetGroups,
  getAscendAssets,
} from "@/lib/ascendAssetService";
import type {
  AscendAsset,
  AscendAssetFilters,
  AscendAssetGroupBy,
  AscendAssetSortDirection,
  AscendAssetSortField,
} from "@/lib/ascendAssetTypes";
import { DataTable } from "@/components/ui/data-table";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createAscendAssetColumns } from "./columns";
import { AscendAssetDetailDialog } from "./asset-detail-dialog";
import { AscendAdvancedFilters } from "./advanced-filters";
import { AscendGroupsTable } from "./groups-table";

const INITIAL_FILTERS: AscendAssetFilters = { state: "all" };

export default function AscendAssetsPage() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<AscendAssetFilters>(INITIAL_FILTERS);
  const [groupBy, setGroupBy] = useState<AscendAssetGroupBy>("none");
  const [sortBy, setSortBy] = useState<AscendAssetSortField>("assetId");
  const [sortDirection, setSortDirection] =
    useState<AscendAssetSortDirection>("desc");
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 });
  const [selectedAsset, setSelectedAsset] = useState<AscendAsset | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPagination((current) => ({ ...current, pageIndex: 0 }));
    }, 350);

    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const optionsQuery = useQuery({
    queryKey: ["ascend-asset-filter-options"],
    queryFn: getAscendAssetFilterOptions,
    staleTime: 10 * 60_000,
  });

  const assetsQuery = useQuery({
    queryKey: [
      "ascend-assets",
      pagination.pageIndex,
      pagination.pageSize,
      search,
      filters,
      sortBy,
      sortDirection,
    ],
    queryFn: () =>
      getAscendAssets({
        page: pagination.pageIndex + 1,
        pageSize: pagination.pageSize,
        search,
        filters,
        sortBy,
        sortDirection,
      }),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
    enabled: groupBy === "none",
  });

  const groupsQuery = useQuery({
    queryKey: ["ascend-asset-groups", groupBy, search, filters],
    queryFn: () => {
      if (groupBy === "none") return Promise.resolve([]);
      return getAscendAssetGroups({ groupBy, search, filters });
    },
    staleTime: 60_000,
    enabled: groupBy !== "none",
  });

  const handleSort = useCallback(
    (field: AscendAssetSortField) => {
      if (sortBy === field) {
        setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      } else {
        setSortBy(field);
        setSortDirection("asc");
      }
      setPagination((current) => ({ ...current, pageIndex: 0 }));
    },
    [sortBy]
  );

  const columns = useMemo(
    () =>
      createAscendAssetColumns({
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
        sortBy,
        sortDirection,
        onSort: handleSort,
      }),
    [
      handleSort,
      pagination.pageIndex,
      pagination.pageSize,
      sortBy,
      sortDirection,
    ]
  );

  const pageCount = Math.max(
    1,
    Math.ceil((assetsQuery.data?.total ?? 0) / pagination.pageSize)
  );
  const groupedTotal =
    groupsQuery.data?.reduce((sum, group) => sum + group.total, 0) ?? 0;
  const activeQuery = groupBy === "none" ? assetsQuery : groupsQuery;

  const applyFilters = (nextFilters: AscendAssetFilters) => {
    setFilters(nextFilters);
    setPagination((current) => ({ ...current, pageIndex: 0 }));
  };

  const resetAll = () => {
    setFilters(INITIAL_FILTERS);
    setGroupBy("none");
    setSearchInput("");
    setSearch("");
    setSortBy("assetId");
    setSortDirection("desc");
    setPagination((current) => ({ ...current, pageIndex: 0 }));
  };

  const drillDown = (value: string) => {
    if (groupBy === "none" || value === "(blank)") return;

    const next = { ...filters };
    if (groupBy === "disabled") {
      next.state = value === "inactive" ? "disabled" : "active";
    } else {
      if (groupBy === "companyCode") next.companyCode = value;
      if (groupBy === "categoryCode") next.categoryCode = value;
      if (groupBy === "locationCode") next.locationCode = value;
      if (groupBy === "departmentCode") next.departmentCode = value;
      if (groupBy === "unitCode") next.unitCode = value;
      if (groupBy === "statusCode") next.statusCode = value;
    }
    setFilters(next);
    setGroupBy("none");
    setPagination((current) => ({ ...current, pageIndex: 0 }));
  };

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <Database className="h-7 w-7 text-primary" />
            <h1 className="text-3xl font-bold">Ascend Assets</h1>
            <Badge variant={activeQuery.isError ? "destructive" : "outline"}>
              {activeQuery.isError
                ? "Disconnected"
                : activeQuery.isLoading
                  ? "Connecting..."
                  : "Live · Read-only"}
            </Badge>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Server-side sorting, column filters, grouping, dan drill-down langsung
            dari SQL Server Ascend.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => activeQuery.refetch()}
          disabled={activeQuery.isFetching}
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${activeQuery.isFetching ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-xl">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            className="pl-9"
            placeholder="Global search: asset, barcode, user, company, unit, remarks..."
          />
        </div>
        <span className="text-sm text-muted-foreground">
          {(groupBy === "none"
            ? assetsQuery.data?.total ?? 0
            : groupedTotal
          ).toLocaleString("id-ID")} records
          {groupBy === "none" ? " · Klik baris untuk detail" : ""}
        </span>
      </div>

      <AscendAdvancedFilters
        filters={filters}
        options={optionsQuery.data}
        groupBy={groupBy}
        onApply={applyFilters}
        onReset={resetAll}
        onGroupByChange={(value) => {
          setGroupBy(value);
          setPagination((current) => ({ ...current, pageIndex: 0 }));
        }}
      />

      {activeQuery.isLoading ? (
        <TableSkeleton />
      ) : activeQuery.isError ? (
        <div className="rounded-md border border-destructive/40 bg-destructive/5 p-6 text-center">
          <p className="font-medium text-destructive">Data Ascend gagal dimuat.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {activeQuery.error instanceof Error
              ? activeQuery.error.message
              : "Periksa koneksi SQL Server."}
          </p>
          <Button className="mt-4" variant="outline" onClick={() => activeQuery.refetch()}>
            Coba Lagi
          </Button>
        </div>
      ) : groupBy !== "none" ? (
        <AscendGroupsTable
          groupBy={groupBy}
          groups={groupsQuery.data ?? []}
          onDrillDown={drillDown}
        />
      ) : (
        <DataTable
          columns={columns}
          data={assetsQuery.data?.items ?? []}
          totalCount={assetsQuery.data?.total ?? 0}
          pagination={pagination}
          onPaginationChange={setPagination}
          manualPagination
          pageCount={pageCount}
          onRowClick={setSelectedAsset}
          getRowClassName={(asset) =>
            asset.disabled
              ? "!bg-red-50 text-red-700 line-through decoration-red-500 hover:!bg-red-100 dark:!bg-red-950/30 dark:text-red-300"
              : ""
          }
        />
      )}

      <AscendAssetDetailDialog
        asset={selectedAsset}
        onClose={() => setSelectedAsset(null)}
      />
    </div>
  );
}
