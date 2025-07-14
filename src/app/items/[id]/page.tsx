"use client";

import { useEffect, useState } from "react";
import { Item, StockMove } from "@/lib/types";
import { getItemById } from "@/lib/itemService";
import { getStockMovesByItemId } from "@/lib/stockMoveService";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ItemStockMoveTrendChart } from "@/components/charts/ItemStockMoveTrendChart";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";

export default function ItemDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const [item, setItem] = useState<Item | null>(null);
  const [stockMoves, setStockMoves] = useState<StockMove[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchItemDetails(id as string);
      fetchStockMoves(id as string);
    }
  }, [id]);

  const fetchItemDetails = async (itemId: string) => {
    setIsLoading(true);
    const itemData = await getItemById(itemId);
    setItem(itemData);
    setIsLoading(false);
  };

  const fetchStockMoves = async (itemId: string) => {
    const movesData = await getStockMovesByItemId(itemId);
    setStockMoves(movesData);
  };

  if (isLoading) {
    return <p>Loading item details...</p>;
  }

  if (!item) {
    return <p>Item not found.</p>;
  }

  return (
    <div className="min-h-screen max-h-screen overflow-auto bg-gray-100">
      <main className="container mx-auto p-8">
        <h1 className="mb-8 text-3xl font-bold">Item Details: {item.name}</h1>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Item Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p><strong>Name:</strong> {item.name}</p>
            <p><strong>Description:</strong> {item.description}</p>
            <p><strong>Current Quantity:</strong> {item.quantity}</p>
            <p><strong>Minimum Quantity for Alert:</strong> {item.minQuantity}</p>
            <p><strong>Created At:</strong> {new Date(item.createdAt).toLocaleString()}</p>
            <p><strong>Last Updated:</strong> {new Date(item.updatedAt).toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stock Movement History</CardTitle>
          </CardHeader>
          <CardContent>
            {stockMoves.length === 0 ? (
              <p>No stock movements for this item.</p>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      From SBU
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      To SBU
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {stockMoves.map((move) => (
                    <tr key={move.id}>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                        {move.quantity > 0 ? 'In' : 'Out'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {move.quantity}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {move.fromSBU}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {move.toSBU}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {new Date(move.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

            )}
          </CardContent>
        </Card>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Stock Movement Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ItemStockMoveTrendChart itemId={id as string} />
          </CardContent>
        </Card>

        <div className="mt-8">
          <Button onClick={() => router.back()}>Back to Items</Button>
        </div>
      </main>
    </div>
  );
}
