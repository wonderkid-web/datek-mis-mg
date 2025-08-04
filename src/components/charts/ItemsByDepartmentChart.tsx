// @ts-nocheck
"use client";

import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";


interface ItemsByDepartmentChartProps {
  items: Item[];
}

export default function ItemsByDepartmentChart({ items }: ItemsByDepartmentChartProps) {
  const data = React.useMemo(() => {
    const departmentCounts: { [key: string]: number } = {};
    items.forEach((item) => {
      const departmentName = item.department || "Tidak Diketahui";
      departmentCounts[departmentName] = (departmentCounts[departmentName] || 0) + 1;
    });

    return Object.entries(departmentCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5 departments with most items
  }, [items]);

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
        <Bar dataKey="value" fill="#82ca9d" />
      </BarChart>
    </ResponsiveContainer>
  );
}
