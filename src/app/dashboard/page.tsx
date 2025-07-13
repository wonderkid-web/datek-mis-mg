
"use client";

import { StockMoveTrendChart } from '@/components/charts/StockMoveTrendChart';
import { ItemsBySbuChart } from '@/components/charts/ItemsBySbuChart';
import { FrequentItemsChart } from '@/components/charts/FrequentItemsChart';

export default function DashboardPage() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div className="col-span-1 md:col-span-2 lg:col-span-3">
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </div>
      <div className="col-span-1 md:col-span-2">
        <StockMoveTrendChart />
      </div>
      <div className="col-span-1">
        <ItemsBySbuChart />
      </div>
      <div className="col-span-1 md:col-span-3">
        <FrequentItemsChart />
      </div>
    </div>
  );
}
