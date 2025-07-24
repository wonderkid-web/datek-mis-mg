"use client";

import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Item } from "@/lib/types";
import { COMPANIES } from "@/lib/constants";

interface ItemsBySbuChartProps {
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

export default function ItemsBySbuChart({ items }: ItemsBySbuChartProps) {
  const data = React.useMemo(() => {
    const sbuCounts: { [key: string]: number } = {};
    items.forEach((item) => {
      const companyName =
        COMPANIES.find((c) => c.type === item.company)?.description ||
        "Tidak Diketahui";
      sbuCounts[companyName] = (sbuCounts[companyName] || 0) + 1;
    });

    return Object.entries(sbuCounts).map(([name, value], index) => ({
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
