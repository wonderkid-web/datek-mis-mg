"use client";

import { useState } from "react";
import { StockMove, Item } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface StockMoveHistoryListProps {
  stockMoves: StockMove[];
  items: Item[];
}

export default function StockMoveHistoryList({ stockMoves, items }: StockMoveHistoryListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(stockMoves.length / itemsPerPage);
  const paginatedStockMoves = stockMoves.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getItemInfo = (itemId: string) => {
    return items.find((item) => item.id === itemId);
  };

  return (
    <div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Merk Barang</TableHead>
              <TableHead>From SBU</TableHead>
              <TableHead>To SBU</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Move Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedStockMoves.map((stockMove) => {
              const itemInfo = getItemInfo(stockMove.itemId);
              return (
                <TableRow key={stockMove.id}>
                  <TableCell>{itemInfo?.name || "N/A"}</TableCell>
                  <TableCell>{itemInfo?.description || "N/A"}</TableCell>
                  <TableCell>{stockMove.fromSBU}</TableCell>
                  <TableCell>{stockMove.toSBU}</TableCell>
                  <TableCell>{stockMove.quantity}</TableCell>
                  <TableCell>{new Date(stockMove.moveDate).toLocaleDateString()}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <div>
          Page {currentPage} of {totalPages}
        </div>
        <div className="flex items-center">
          <Button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            variant="outline"
          >
            Previous
          </Button>
          <Button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            variant="outline"
            className="ml-2"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
