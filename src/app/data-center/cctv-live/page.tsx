"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CctvPlayer } from "@/components/cctv/CctvPlayer";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { VideoOff } from "lucide-react";

type LiveCamera = {
  assetId: number;
  nama: string;
  ipAddress: string;
  sbu: string;
  lokasi: string;
  brand: string | null;
};

/**
 * Batas kamera yang boleh diputar bersamaan. Tiap stream aktif menahan satu
 * koneksi RTSP di go2rtc, jadi memutar ratusan kamera sekaligus akan
 * membanjiri jaringan kamera dan tidak ada gunanya di satu layar.
 */
const MAX_CONCURRENT = 12;

async function getLiveCameras(): Promise<LiveCamera[]> {
  const res = await fetch("/api/cctv/live");
  if (!res.ok) throw new Error("Gagal memuat daftar kamera");
  return res.json();
}

function formatSbu(sbu: string): string {
  return sbu.replace(/_/g, " ");
}

export default function CctvLivePage() {
  const [search, setSearch] = useState("");
  const [sbuFilter, setSbuFilter] = useState<string>("");
  const [playAll, setPlayAll] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["cctvLiveCameras"],
    queryFn: getLiveCameras,
    staleTime: 5 * 60 * 1000,
  });

  const sbuList = useMemo(
    () => Array.from(new Set((data ?? []).map((c) => c.sbu))).sort(),
    [data]
  );

  const cameras = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (data ?? []).filter((c) => {
      if (sbuFilter && c.sbu !== sbuFilter) return false;
      if (!q) return true;
      return [c.nama, c.lokasi, c.sbu, c.ipAddress, c.brand ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [data, search, sbuFilter]);

  const canPlayAll = cameras.length > 0 && cameras.length <= MAX_CONCURRENT;

  return (
    <div className="space-y-4 p-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Live CCTV</h1>
          <p className="text-sm text-muted-foreground">
            Pantauan langsung kamera yang terdaftar di master data CCTV.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Cari lokasi, SBU, IP, atau brand…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-72"
          />
          <Button
            variant={playAll ? "default" : "outline"}
            disabled={!canPlayAll}
            title={
              canPlayAll
                ? undefined
                : `Persempit filter dulu — maksimal ${MAX_CONCURRENT} kamera bisa diputar bersamaan`
            }
            onClick={() => setPlayAll((v) => !v)}
          >
            {playAll ? "Hentikan semua" : "Putar semua"}
          </Button>
        </div>
      </div>

      {sbuList.length > 1 && (
        <div className="flex flex-wrap gap-1.5">
          <Button
            size="sm"
            variant={sbuFilter === "" ? "default" : "outline"}
            onClick={() => {
              setSbuFilter("");
              setPlayAll(false);
            }}
          >
            Semua SBU
          </Button>
          {sbuList.map((sbu) => (
            <Button
              key={sbu}
              size="sm"
              variant={sbuFilter === sbu ? "default" : "outline"}
              onClick={() => {
                setSbuFilter(sbu);
                setPlayAll(false);
              }}
            >
              {formatSbu(sbu)}
            </Button>
          ))}
        </div>
      )}

      {!isLoading && !isError && (
        <p className="text-xs text-muted-foreground">
          Menampilkan {cameras.length} dari {data?.length ?? 0} kamera.
          {!canPlayAll && cameras.length > MAX_CONCURRENT && (
            <> Klik tile untuk memutar satu per satu.</>
          )}
        </p>
      )}

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="aspect-video w-full rounded-lg" />
          ))}
        </div>
      )}

      {isError && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-6 text-center text-sm text-destructive">
          Gagal memuat daftar kamera.
        </div>
      )}

      {!isLoading && !isError && cameras.length === 0 && (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-12 text-center text-muted-foreground">
          <VideoOff className="h-8 w-8" />
          <p className="text-sm">Tidak ada kamera yang cocok dengan filter ini.</p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cameras.map((cam) => (
          <div key={cam.assetId} className="space-y-1.5">
            <CctvPlayer
              // Remount saat mode berubah supaya autoStart benar-benar diterapkan.
              key={`${cam.assetId}-${playAll}`}
              assetId={cam.assetId}
              label={cam.nama}
              autoStart={playAll && canPlayAll}
            />
            <div className="flex items-center justify-between gap-2 px-0.5 text-xs text-muted-foreground">
              <span className="truncate">{formatSbu(cam.sbu)}</span>
              <span className="shrink-0 font-mono">{cam.ipAddress}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
