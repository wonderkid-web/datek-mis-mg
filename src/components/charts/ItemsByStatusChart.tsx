// @ts-nocheck
"use client";

import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Item } from "@/lib/types";
import { STATUSES } from "@/lib/constants";

interface ItemsByStatusChartProps {
  items: Item[];
}

const COLORS = [
  "#00C49F", // GOOD
  "#FFBB28", // NEED REPARATION
  "#FF8042", // BROKEN
  "#0088FE", // MISSING
  "#A28DFF", // SELL
  "#FF6666", // LEASED TO SBU
];

export default function ItemsByStatusChart({ items }: ItemsByStatusChartProps) {
  const data = React.useMemo(() => {
    const statusCounts: { [key: string]: number } = {};
    items.forEach((item) => {
      const statusName =
        STATUSES.find((s) => s.type === item.status)?.description ||
        "Tidak Diketahui";
      statusCounts[statusName] = (statusCounts[statusName] || 0) + 1;
    });

    return Object.entries(statusCounts).map(([name, value], index) => ({
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
