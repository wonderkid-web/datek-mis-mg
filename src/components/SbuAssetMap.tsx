"use client";

import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Item } from "@/lib/types";
import { COMPANIES } from "@/lib/constants";

// Fix for default marker icon issue with Webpack
// @ts-expect-error idontknow
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "/leaflet/marker-icon-2x.png",
  iconUrl: "/leaflet/marker-icon.png",
  shadowUrl: "/leaflet/marker-shadow.png",
});

interface SbuAssetMapProps {
  items: Item[];
}

export default function SbuAssetMap({ items }: SbuAssetMapProps) {
  const sbuAssetCounts = React.useMemo(() => {
    const counts: { [key: string]: number } = {};
    items.forEach((item) => {
      // @ts-expect-error its okay
      const company = COMPANIES.find((c) => c.type === item.company);
      if (company) {
        counts[company.type] = (counts[company.type] || 0) + 1;
      }
    });
    return counts;
  }, [items]);

  const mapCenter: [number, number] = [2, 100.5]; // Approximate center of Sumatra

  return (
    <MapContainer
      center={mapCenter}
      zoom={7.3}
      scrollWheelZoom={false}
      style={{ height: "600px", width: "100%" }}
    >
      <TileLayer

        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {COMPANIES.map((company) => {
        if (company.lintang && company.bujur) {
          const position: [number, number] = [+company.lintang, +company.bujur];
          const assetCount = sbuAssetCounts[company.type] || 0;
          return (
            <Marker key={company.type} position={position}>
              <Popup>
                <strong>{company.description}</strong>
                <br />
                Total Aset: {assetCount}
              </Popup>
            </Marker>
          );
        }
        return null;
      })}
    </MapContainer>
  );
}
