"use client";

import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Item, User } from "@/lib/types";

interface ItemsByUserChartProps {
  items: Item[];
  users: User[];
}

export default function ItemsByUserChart({ items, users }: ItemsByUserChartProps) {
  const data = React.useMemo(() => {
    const userItemCounts: { [key: string]: number } = {};
    items.forEach((item) => {
      const userName = users.find((u) => u.id === item.user)?.name || "Tidak Diketahui";
      userItemCounts[userName] = (userItemCounts[userName] || 0) + 1;
    });

    return Object.entries(userItemCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5 users with most items
  }, [items, users]);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="value" fill="#ffc658" />
      </BarChart>
    </ResponsiveContainer>
  );
}
