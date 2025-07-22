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

import { Input } from "@/components/ui/input";

interface StockMoveHistoryListProps {
  stockMoves: StockMove[];
  items: Item[];
}

export default function StockMoveHistoryList({ stockMoves }: StockMoveHistoryListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const itemsPerPage = 10;

  const filteredStockMoves = stockMoves.filter((move) => {
    const searchTerm = searchQuery.toLowerCase();
    return (
      (move.sbu || "").toLowerCase().includes(searchTerm) ||
      (move.item || "").toLowerCase().includes(searchTerm) ||
      (move.assetNumber || "").toLowerCase().includes(searchTerm) ||
      (move.user || "").toLowerCase().includes(searchTerm) ||
      (move.department || "").toLowerCase().includes(searchTerm) ||
      (move.ipAddress || "").toLowerCase().includes(searchTerm) ||
      (move.remote || "").toLowerCase().includes(searchTerm)
    );
  });

  const totalPages = Math.ceil(filteredStockMoves.length / itemsPerPage);
  const paginatedStockMoves = filteredStockMoves.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );


  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <Input
          type="text"
          placeholder="Search by SBU, Item, Asset No., User, Dept., IP, Remote..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>
      <div className="overflow-x-auto flex-grow max-h-full">
        <Table className="h-full">
          <TableHeader>
            <TableRow>
              <TableHead>Nomor</TableHead>
              <TableHead>SBU</TableHead>
              <TableHead>Barang</TableHead>
              <TableHead>No Asset</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>IP Address</TableHead>
              <TableHead>Remote</TableHead>
              <TableHead>Garansi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedStockMoves.map((stockMove, index) => (
              <TableRow key={stockMove.id} className={index % 2 === 0 ? 'bg-gray-100' : ''}>
                <TableCell>{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
                <TableCell>{stockMove.sbu}</TableCell>
                <TableCell>{stockMove.itemName} - {stockMove.itemDescription}</TableCell>
                <TableCell>{stockMove.assetNumber}</TableCell>
                <TableCell>{stockMove.user}</TableCell>
                <TableCell>{stockMove.department}</TableCell>
                <TableCell>{stockMove.ipAddress}</TableCell>
                <TableCell>{stockMove.remote}</TableCell>
                <TableCell>{stockMove.guaranteeDate ? new Date(stockMove.guaranteeDate).toLocaleDateString() : 'N/A'}</TableCell>
              </TableRow>
            ))}
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
