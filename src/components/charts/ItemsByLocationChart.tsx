"use client";

import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Item } from "@/lib/types";
import { LOCATIONS } from "@/lib/constants";

interface ItemsByLocationChartProps {
  items: Item[];
}

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#A28DFF",
  "#FF6666",
  "#66B2FF",
  "#FFD700",
  "#ADFF2F",
  "#FF69B4",
];

export default function ItemsByLocationChart({ items }: ItemsByLocationChartProps) {
  const data = React.useMemo(() => {
    const locationCounts: { [key: string]: number } = {};
    items.forEach((item) => {
      const locationName =
        LOCATIONS.find((l) => l.type === item.location)?.description ||
        "Tidak Diketahui";
      locationCounts[locationName] = (locationCounts[locationName] || 0) + 1;
    });

    return Object.entries(locationCounts).map(([name, value], index) => ({
      name,
      value,
      color: COLORS[index % COLORS.length],
    }));
  }, [items]);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          nameKey="name"
          label={({ name, percent }) =>
            // @ts-expect-error its okay
            `${name} (${(percent * 100).toFixed(0)}%)`
          }
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
