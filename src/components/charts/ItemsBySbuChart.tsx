
"use client";

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getItemsBySbu } from '@/lib/itemService';

export const ItemsBySbuChart = () => {
  const [data, setData] = useState<{ sbu: string; count: number }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const sbuData = await getItemsBySbu();
      setData(sbuData);
    };
    fetchData();
  }, []);

  return (
    <div style={{ width: '100%', height: 300 }}>
      <h3 className="text-lg font-semibold mb-2">Jumlah Item per SBU</h3>
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="sbu" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="count" fill="#00612c" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
