
"use client";

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getFrequentItems } from '@/lib/stockMoveService';

export const FrequentItemsChart = () => {
  const [data, setData] = useState<{ name: string; moves: number }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const frequentData = await getFrequentItems();
      setData(frequentData);
    };
    fetchData();
  }, []);

  return (
    <div style={{ width: '100%', height: 300 }}>
      <h3 className="text-lg font-semibold mb-2">Item yang Paling Sering Berpindah</h3>
      <ResponsiveContainer>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis dataKey="name" type="category" width={150} />
          <Tooltip />
          <Legend />
          <Bar dataKey="moves" fill="#00612c" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
