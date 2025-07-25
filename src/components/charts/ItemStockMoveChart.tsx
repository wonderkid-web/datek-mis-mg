import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { StockMove } from '@/lib/types';

interface ItemStockMoveChartProps {
  stockMoves: StockMove[];
}

const ItemStockMoveChart: React.FC<ItemStockMoveChartProps> = ({ stockMoves }) => {
  // For now, this chart will just display a placeholder or basic data.
  // A real stock move chart would require more complex data processing
  // to show changes over time (e.g., quantity changes, status changes).
  // For demonstration, let's just show the count of moves over time.

  const data = stockMoves.map(move => ({
    name: new Date(move.createdAt).toLocaleDateString(),
    count: 1, // Placeholder for now, actual data would be more complex
  }));

  if (stockMoves.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        Tidak ada data pergerakan stok untuk aset ini.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
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
        <Line type="monotone" dataKey="count" stroke="#8884d8" activeDot={{ r: 8 }} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default ItemStockMoveChart;
