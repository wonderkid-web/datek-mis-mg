"use client";

import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface Props {
  data: {
    user: string;
    total: number;
  }[];
}

export default function ItemsByUserChart({ data }: Props) {
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
        <XAxis dataKey="user" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="total" fill="#ffc658" />
      </BarChart>
    </ResponsiveContainer>
  );
}
