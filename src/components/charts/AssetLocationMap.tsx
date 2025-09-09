"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { getAssetBreakdownByLocation } from "@/lib/assetService";
import { COMPANIES } from "@/lib/constants";
import { Skeleton } from "@/components/ui/skeleton";
import { AssetsDetailDialog } from "@/components/dialogs/AssetDetailDialog";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

// Fix for default marker icon issue with webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "/leaflet/marker-icon-2x.png",
  iconUrl: "/leaflet/marker-icon.png",
  shadowUrl: "/leaflet/marker-shadow.png",
});

interface LocationData {
  location: string;
  total: number;
  latitude: number;
  longitude: number;
}

function AssetLocationMap() {
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogFilters, setDialogFilters] = useState({});

  const { data: assetBreakdown, isLoading } = useQuery({
    queryKey: ["assetBreakdownForMap"],
    queryFn: getAssetBreakdownByLocation,
  });

  const handleMarkerClick = (title: string, filters: Record<string, any>) => {
    setDialogTitle(title);
    setDialogFilters(filters);
    setDialogOpen(true);
  };

  if (isLoading) {
    return <Skeleton className="h-[400px] w-full" />;
  }

  const mapData: LocationData[] =
    assetBreakdown
      ?.map((loc) => {
        const company = COMPANIES.find(
          (c) =>
            c.description === loc.location ||
            (loc.location === "PT Intan Sejati Andalan (Group)" &&
              c.type === "ISA")
        );

        if (!company) return null;

        const total = loc.data.reduce((sum, item) => sum + item.total, 0);

        return {
          location: loc.location,
          total: total,
          latitude: parseFloat(company.lintang),
          longitude: parseFloat(company.bujur),
        };
      })
      .filter((item): item is LocationData => item !== null) ?? [];

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Peta Aset Berdasarkan Lokasi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full rounded-md overflow-hidden">
            <MapContainer
              center={[-0.5, 101.5]}
              zoom={5}
              scrollWheelZoom={false}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {mapData.map((data) => (
                <Marker
                  key={data.location}
                  position={[data.latitude, data.longitude]}
                  eventHandlers={{
                    click: () => {
                      handleMarkerClick(`Aset di ${data.location}`, {
                        lokasiFisik: data.location,
                      });
                    },
                  }}
                >
                  <Popup>
                    <b>{data.location}</b>
                    <br />
                    Total Aset: {data.total}
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </CardContent>
      </Card>
      <AssetsDetailDialog
        isOpen={isDialogOpen}
        onOpenChange={setDialogOpen}
        title={dialogTitle}
        filters={dialogFilters}
      />
    </>
  );
}

export default AssetLocationMap;
