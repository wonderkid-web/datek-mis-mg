"use client";

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getStockMoveTrendByItemId } from '@/lib/stockMoveService';

interface ItemStockMoveTrendChartProps {
  itemId: string;
}

export const ItemStockMoveTrendChart = ({ itemId }: ItemStockMoveTrendChartProps) => {
  const [data, setData] = useState<{ date: string; count: number }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const trendData = await getStockMoveTrendByItemId(itemId);
      setData(trendData);
    };
    fetchData();
  }, [itemId]);

  return (
    <div style={{ width: '100%', height: 300 }}>
      <h3 className="text-lg font-semibold mb-2">Tren Perpindahan Stok untuk Item Ini</h3>
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="count" stroke="#00612c" activeDot={{ r: 8 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
