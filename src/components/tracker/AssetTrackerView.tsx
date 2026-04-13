"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, ArrowUpDown } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { Button } from "@/components/ui/button";
import { getTrackedAssets } from "@/lib/trackerService";
import type { TrackerDeviceFamily } from "@/lib/types";

type TrackedAsset = Awaited<ReturnType<typeof getTrackedAssets>>[number];
type TrackedAssetHistory = TrackedAsset["assignmentHistories"][number];
type TrackedAssetAssignment = TrackedAsset["assignments"][number];
type TrackerTimelineRecord = {
  id: string;
  user: TrackedAssetHistory["user"] | TrackedAssetAssignment["user"] | null;
  nomorAsset: string | null;
  catatan: string | null;
  startedAt: Date | string;
  endedAt: Date | string | null;
};

const DEVICE_LABELS: Record<TrackerDeviceFamily, string> = {
  LAPTOP: "Laptop",
  INTEL_NUC: "Intel NUC",
  PC: "PC",
};

const formatDateTime = (value: Date | string | null | undefined) => {
  if (!value) return "-";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleString("id-ID");
};

const sortHistory = (histories: TrackedAssetHistory[]) =>
  [...histories].sort(
    (left, right) =>
      new Date(left.startedAt).getTime() - new Date(right.startedAt).getTime()
  );

const getTimelineRecords = (asset: TrackedAsset): TrackerTimelineRecord[] => {
  const historyRecords = sortHistory(asset.assignmentHistories).map((history) => ({
    id: `history-${history.id}`,
    user: history.user ?? null,
    nomorAsset: history.nomorAsset ?? null,
    catatan: history.catatan ?? null,
    startedAt: history.startedAt,
    endedAt: history.endedAt ?? null,
  }));

  if (historyRecords.length) {
    return historyRecords;
  }

  const activeAssignment = asset.assignments[0];
  if (!activeAssignment) {
    return [];
  }

  return [
    {
      id: `assignment-${activeAssignment.id}`,
      user: activeAssignment.user ?? null,
      nomorAsset: activeAssignment.nomorAsset ?? null,
      catatan: activeAssignment.catatan ?? null,
      startedAt: activeAssignment.createdAt,
      endedAt: null,
    },
  ];
};

const getCurrentHistory = (asset: TrackedAsset) =>
  getTimelineRecords(asset).find((history) => !history.endedAt) ?? null;

const getLatestHistory = (asset: TrackedAsset) => {
  const histories = getTimelineRecords(asset);
  return histories[histories.length - 1] ?? null;
};

const getUniqueUserCount = (asset: TrackedAsset) =>
  new Set(
    getTimelineRecords(asset)
      .map((history) => history.user?.namaLengkap?.trim())
      .filter((value): value is string => Boolean(value))
  ).size;

const getAssetSubtitle = (asset: TrackedAsset, deviceFamily: TrackerDeviceFamily) => {
  if (deviceFamily === "LAPTOP") {
    return (
      asset.laptopSpecs?.typeOption?.value ??
      asset.laptopSpecs?.processorOption?.value ??
      asset.category?.nama ??
      "-"
    );
  }

  if (deviceFamily === "INTEL_NUC") {
    return (
      asset.intelNucSpecs?.typeOption?.value ??
      asset.intelNucSpecs?.processorOption?.value ??
      asset.category?.nama ??
      "-"
    );
  }

  return (
    asset.pcSpecs?.processorOption?.value ??
    asset.pcSpecs?.motherboardOption?.value ??
    asset.category?.nama ??
    "-"
  );
};

interface AssetTrackerViewProps {
  deviceFamily: TrackerDeviceFamily;
  title: string;
  description: string;
}

export function AssetTrackerView({
  deviceFamily,
  title,
  description,
}: AssetTrackerViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [detailAsset, setDetailAsset] = useState<TrackedAsset | null>(null);

  const { data, isLoading, isError } = useQuery<TrackedAsset[]>({
    queryKey: ["tracker-assets", deviceFamily],
    queryFn: () => getTrackedAssets(deviceFamily),
  });

  const filteredAssets = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) {
      return data ?? [];
    }

    return (data ?? []).filter((asset) => {
      const currentHistory = getCurrentHistory(asset);
      const historyUsers = getTimelineRecords(asset)
        .map((history) => history.user?.namaLengkap ?? "")
        .join(" ");

      const corpus = [
        asset.namaAsset,
        asset.nomorSeri,
        asset.category?.nama ?? "",
        currentHistory?.user?.namaLengkap ?? "",
        currentHistory?.nomorAsset ?? "",
        historyUsers,
      ]
        .join(" ")
        .toLowerCase();

      return corpus.includes(query);
    });
  }, [data, searchTerm]);

  const summary = useMemo(() => {
    const assets = data ?? [];
    const assignedNow = assets.filter((asset) => getCurrentHistory(asset)).length;
    const totalHandovers = assets.reduce(
      (total, asset) => total + Math.max(getTimelineRecords(asset).length - 1, 0),
      0
    );
    const uniqueUsers = new Set(
      assets.flatMap((asset) =>
        getTimelineRecords(asset)
          .map((history) => history.user?.namaLengkap?.trim())
          .filter((value): value is string => Boolean(value))
      )
    ).size;

    return [
      { label: "Total Asset", value: assets.length },
      { label: "Sedang Dipakai", value: assignedNow },
      { label: "Total Handover", value: totalHandovers },
      { label: "User Pernah Pakai", value: uniqueUsers },
    ];
  }, [data]);

  const columns = useMemo<ColumnDef<TrackedAsset>[]>(
    () => [
      {
        id: "no",
        header: () => <div className="text-center">No.</div>,
        cell: ({ row }) => <div className="text-center">{row.index + 1}</div>,
      },
      {
        accessorKey: "namaAsset",
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="px-0"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Asset
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="space-y-1">
            <div className="font-medium">{row.original.namaAsset}</div>
            <div className="text-xs text-muted-foreground">
              {getAssetSubtitle(row.original, deviceFamily)}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "nomorSeri",
        header: "Serial Number",
      },
      {
        id: "currentUser",
        header: "Current User",
        cell: ({ row }) => getCurrentHistory(row.original)?.user?.namaLengkap ?? "-",
      },
      {
        id: "currentSince",
        header: "Current Since",
        cell: ({ row }) => formatDateTime(getCurrentHistory(row.original)?.startedAt),
      },
      {
        id: "riwayatUser",
        header: () => <div className="text-center">User Count</div>,
        cell: ({ row }) => (
          <div className="text-center">{getUniqueUserCount(row.original)}</div>
        ),
      },
      {
        id: "handover",
        header: () => <div className="text-center">Handover</div>,
        cell: ({ row }) => (
          <div className="text-center">
            {Math.max(getTimelineRecords(row.original).length - 1, 0)}
          </div>
        ),
      },
    ],
    [deviceFamily]
  );

  const detailHistories = useMemo(
    () => (detailAsset ? getTimelineRecords(detailAsset) : []),
    [detailAsset]
  );

  const currentHistory = detailAsset ? getCurrentHistory(detailAsset) : null;
  const latestHistory = detailAsset ? getLatestHistory(detailAsset) : null;

  if (isError) {
    return (
      <div className="container mx-auto py-10">
        Failed to load {DEVICE_LABELS[deviceFamily]} tracker data.
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 py-10">
      <Dialog
        open={Boolean(detailAsset)}
        onOpenChange={(open) => {
          if (!open) {
            setDetailAsset(null);
          }
        }}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle>{DEVICE_LABELS[deviceFamily]} Tracker Detail</DialogTitle>
          </DialogHeader>
          {detailAsset ? (
            <div className="space-y-4">
              <div className="rounded-lg border">
                <table className="w-full text-sm">
                  <tbody>
                    {[
                      { label: "Asset Name", value: detailAsset.namaAsset },
                      { label: "Serial Number", value: detailAsset.nomorSeri },
                      { label: "Category", value: detailAsset.category?.nama ?? "-" },
                      { label: "Current User", value: currentHistory?.user?.namaLengkap ?? "-" },
                      { label: "Current Asset Number", value: currentHistory?.nomorAsset ?? "-" },
                      { label: "Current Since", value: formatDateTime(currentHistory?.startedAt) },
                      {
                        label: "Total Riwayat User",
                        value: getUniqueUserCount(detailAsset).toLocaleString("id-ID"),
                      },
                      {
                        label: "Last Movement",
                        value: formatDateTime(latestHistory?.endedAt ?? latestHistory?.startedAt),
                      },
                    ].map((item) => (
                      <tr key={item.label} className="border-b last:border-b-0">
                        <td className="w-1/3 px-4 py-3 font-semibold align-top">
                          {item.label}
                        </td>
                        <td className="px-4 py-3">{item.value || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Visualisasi Riwayat Pemakaian</CardTitle>
                  <CardDescription>
                    Timeline user yang pernah memakai {detailAsset.namaAsset}.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {detailHistories.length ? (
                    <div className="flex flex-wrap items-center gap-2">
                      {detailHistories.map((history, index) => (
                        <div key={history.id} className="contents">
                          <div className="min-w-[180px] rounded-lg border bg-muted/40 px-3 py-3">
                            <div className="flex items-center justify-between gap-2">
                              <div className="font-medium">
                                {history.user?.namaLengkap ?? "User tidak tersedia"}
                              </div>
                              <Badge variant={history.endedAt ? "secondary" : "default"}>
                                {history.endedAt ? "Selesai" : "Aktif"}
                              </Badge>
                            </div>
                            <div className="mt-2 text-xs text-muted-foreground">
                              {formatDateTime(history.startedAt)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {history.endedAt
                                ? `sampai ${formatDateTime(history.endedAt)}`
                                : "masih berlangsung"}
                            </div>
                            <div className="mt-2 text-xs">
                              No Asset: {history.nomorAsset ?? "-"}
                            </div>
                          </div>
                          {index < detailHistories.length - 1 ? (
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          ) : null}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      Belum ada riwayat assignment untuk asset ini.
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>No Asset</TableHead>
                      <TableHead>Mulai</TableHead>
                      <TableHead>Selesai</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detailHistories.length ? (
                      detailHistories.map((history) => (
                        <TableRow key={history.id}>
                          <TableCell>{history.user?.namaLengkap ?? "-"}</TableCell>
                          <TableCell>{history.nomorAsset ?? "-"}</TableCell>
                          <TableCell>{formatDateTime(history.startedAt)}</TableCell>
                          <TableCell>{formatDateTime(history.endedAt)}</TableCell>
                          <TableCell>
                            <Badge variant={history.endedAt ? "secondary" : "default"}>
                              {history.endedAt ? "Selesai" : "Aktif"}
                            </Badge>
                          </TableCell>
                          <TableCell>{history.catatan ?? "-"}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center">
                          Belum ada riwayat assignment.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summary.map((card) => (
          <Card key={card.label}>
            <CardHeader className="pb-2">
              <CardDescription>{card.label}</CardDescription>
              <CardTitle className="text-2xl">
                {card.value.toLocaleString("id-ID")}
              </CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <Input
            placeholder={`Search ${DEVICE_LABELS[deviceFamily]}`}
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="w-full max-w-xs"
          />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton />
          ) : (
            <DataTable
              columns={columns}
              data={filteredAssets}
              onRowClick={(asset) => setDetailAsset(asset)}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
