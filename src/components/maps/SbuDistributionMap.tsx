"use client";

import { useMemo } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { Building2, Layers, Package, Wifi } from "lucide-react";

import { COMPANIES } from "@/lib/constants";

type LocationInsight = {
  location: string;
  totalAssets: number;
  topCategory: string;
  topCategoryCount: number;
  ipCount: number;
};

type MarkerEntry = {
  type: string;
  description: string;
  statistics?: LocationInsight;
};

type MarkerData = {
  id: string;
  typeLabel: string;
  label: string;
  latitude: number;
  longitude: number;
  totalAssets: number;
  ipCount: number;
  topCategory: string;
  topCategoryCount: number;
  isCluster: boolean;
  entries: MarkerEntry[];
};

const DEFAULT_CENTER: [number, number] = [0.593241, 101.343108];

interface Props {
  locations: LocationInsight[];
}

function SbuDistributionMap({ locations }: Props) {
  const markerIcon = useMemo(
    () =>
      L.divIcon({
        className: "sbu-marker-wrapper",
        html: '<span class="sbu-marker-icon"></span>',
        iconSize: [36, 48],
        iconAnchor: [18, 44],
        popupAnchor: [0, -36],
      }),
    []
  );

  const markers = useMemo<MarkerData[]>(() => {
    const insightsByLocation = new Map(
      locations.map((item) => [item.location, item])
    );

    const grouped = new Map<string, MarkerData>();

    COMPANIES.forEach((company) => {
      const latitude = Number.parseFloat(company.lintang);
      const longitude = Number.parseFloat(company.bujur);

      if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
        return;
      }

      const isIsaVariant = company.type.startsWith("ISA");
      const key = isIsaVariant ? "ISA_GROUP" : company.type;
      const stats = insightsByLocation.get(company.description);

      let marker = grouped.get(key);

      if (!marker) {
        marker = {
          id: key,
          typeLabel: isIsaVariant ? "ISA" : company.type,
          label: isIsaVariant
            ? "PT Intan Sejati Andalan (Grup)"
            : company.description,
          latitude,
          longitude,
          totalAssets: 0,
          ipCount: 0,
          topCategory: "-",
          topCategoryCount: 0,
          isCluster: isIsaVariant,
          entries: [],
        };
        grouped.set(key, marker);
      }

      marker.latitude = latitude;
      marker.longitude = longitude;

      marker.entries.push({
        type: company.type,
        description: company.description,
        statistics: stats,
      });

      if (!stats) {
        return;
      }

      if (marker.isCluster) {
        marker.totalAssets += stats.totalAssets;
        marker.ipCount += stats.ipCount;

        if (
          stats.topCategory !== "-" &&
          stats.topCategoryCount >= marker.topCategoryCount
        ) {
          marker.topCategory = stats.topCategory;
          marker.topCategoryCount = stats.topCategoryCount;
        }
      } else {
        marker.totalAssets = stats.totalAssets;
        marker.ipCount = stats.ipCount;
        marker.topCategory = stats.topCategory;
        marker.topCategoryCount = stats.topCategoryCount;
      }
    });

    return Array.from(grouped.values());
  }, [locations]);

  const center = useMemo<[number, number]>(() => {
    if (!markers.length) {
      return DEFAULT_CENTER;
    }

    const { latitude, longitude } = markers.reduce(
      (acc, curr) => {
        acc.latitude += curr.latitude;
        acc.longitude += curr.longitude;
        return acc;
      },
      { latitude: 0, longitude: 0 }
    );

    return [latitude / markers.length, longitude / markers.length];
  }, [markers]);

  if (!markers.length) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        Data koordinat SBU belum tersedia.
      </div>
    );
  }

  return (
    <>
      <MapContainer
        center={center}
        zoom={6}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers.map((marker) => {
          const hasStatistics = marker.entries.some(
            (entry) => !!entry.statistics
          );

          return (
            <Marker
              key={`${marker.id}-${marker.latitude}-${marker.longitude}`}
              position={[marker.latitude, marker.longitude]}
              icon={markerIcon}
            >
              <Popup className="sbu-popup" minWidth={marker.isCluster ? 420 : 260}>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 font-semibold text-emerald-700">
                      {marker.typeLabel}
                    </div>
                    <div className="space-y-1">
                      <p className="font-semibold text-slate-900">
                        {marker.label}
                      </p>
                      <p className="flex items-center gap-1 text-xs text-slate-500">
                        <Building2 className="h-3.5 w-3.5" />
                        {marker.entries.length > 1
                          ? `${marker.entries.length} lokasi operasional`
                          : "Lokasi Operasional"}
                      </p>
                    </div>
                  </div>

                  {hasStatistics ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between rounded-lg bg-emerald-50 px-3 py-2">
                        <div className="flex items-center gap-2 text-xs font-medium text-emerald-700">
                          <Package className="h-4 w-4" />
                          Total Aset
                        </div>
                        <span className="text-sm font-semibold text-emerald-700">
                          {marker.totalAssets.toLocaleString("id-ID")}
                        </span>
                      </div>
                      <div className="flex items-center justify-between rounded-lg bg-slate-100 px-3 py-2">
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                          <Layers className="h-4 w-4" />
                          Top Kategori
                        </div>
                        <span className="flex items-center gap-1 text-sm font-semibold text-slate-700">
                          {marker.topCategory !== "-" ? (
                            <>
                              {marker.topCategory}
                              <span className="text-xs text-slate-500">
                                ({marker.topCategoryCount})
                              </span>
                            </>
                          ) : (
                            "-"
                          )}
                        </span>
                      </div>
                      <div className="flex items-center justify-between rounded-lg bg-sky-50 px-3 py-2">
                        <div className="flex items-center gap-2 text-xs font-medium text-sky-700">
                          <Wifi className="h-4 w-4" />
                          IP Aktif
                        </div>
                        <span className="text-sm font-semibold text-sky-700">
                          {marker.ipCount.toLocaleString("id-ID")}
                        </span>
                      </div>
                      {marker.entries.length > 1 && (
                        <div className="max-h-44 space-y-2 overflow-y-auto rounded-lg border border-slate-200 bg-white/70 px-3 py-2">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Rincian lokasi
                          </p>
                          {marker.entries.map((entry) => (
                            <div
                              key={`${entry.type}-${entry.description}`}
                              className="rounded-md bg-white px-3 py-2 shadow-sm"
                            >
                              <p className="text-sm font-medium text-slate-700">
                                {entry.description}
                              </p>
                              {entry.statistics ? (
                                <p className="text-xs text-slate-500">
                                  Aset {entry.statistics.totalAssets.toLocaleString("id-ID")} · IP {" "}
                                  {entry.statistics.ipCount.toLocaleString("id-ID")}
                                </p>
                              ) : (
                                <p className="text-xs text-slate-400">
                                  Ringkasan belum tersedia
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-500">
                      Ringkasan aset belum tersedia.
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
      <style jsx global>{`
        .sbu-marker-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .sbu-marker-icon {
          position: relative;
          display: block;
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #16a34a, #22c55e);
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 2px solid white;
          box-shadow: 0 10px 25px rgba(34, 197, 94, 0.35);
        }

        .sbu-marker-icon::after {
          content: "";
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(45deg);
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: white;
        }

        .sbu-popup .leaflet-popup-content-wrapper {
          border-radius: 14px;
          min-width: 300px;
          padding: 12px;
          box-shadow: 0 12px 30px rgba(15, 118, 110, 0.18);
        }

        .sbu-popup .leaflet-popup-tip {
          background: white;
        }

        .sbu-popup .leaflet-popup-content {
          margin: 0;
          width: auto !important;
        }
      `}</style>
    </>
  );
}

export default SbuDistributionMap;
