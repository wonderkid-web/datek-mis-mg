"use client";

import { useState } from "react";
import { StockMove } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import * as XLSX from "xlsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface StockMoveListProps {
  stockMoves: StockMove[];
  handleEdit: (stockMove: StockMove) => void;
  handleDelete: (id: string) => void;
}

export default function StockMoveList({
  stockMoves,
  handleEdit,
  handleDelete,
}: StockMoveListProps) {
  const [filter, setFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredStockMoves = stockMoves.filter(
    (move) =>
      move.itemName.toLowerCase().includes(filter.toLowerCase()) ||
      move.fromSBU.toLowerCase().includes(filter.toLowerCase()) ||
      move.toSBU.toLowerCase().includes(filter.toLowerCase())
  );

  const totalPages = Math.ceil(filteredStockMoves.length / itemsPerPage);
  const paginatedStockMoves = filteredStockMoves.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleExport = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredStockMoves);
    const workbook = XLSX.utils.book_new();

    // Add borders to all cells
    const range = XLSX.utils.decode_range(worksheet["!ref"]!);
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cell_address = { c: C, r: R };
        const cell_ref = XLSX.utils.encode_cell(cell_address);
        if (!worksheet[cell_ref]) continue;
        if (!worksheet[cell_ref].s) worksheet[cell_ref].s = {};
        worksheet[cell_ref].s.border = {
          top: { style: "thin", color: { auto: 1 } },
          right: { style: "thin", color: { auto: 1 } },
          bottom: { style: "thin", color: { auto: 1 } },
          left: { style: "thin", color: { auto: 1 } },
        };
      }
    }

    XLSX.utils.book_append_sheet(workbook, worksheet, "Stock Moves");
    XLSX.writeFile(workbook, "stock_moves.xlsx");
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <Input
          type="text"
          placeholder="Filter by item name or SBU..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="max-w-sm"
        />
        <Button onClick={handleExport}>Export to Excel</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Item</TableHead>
            <TableHead>From SBU</TableHead>
            <TableHead>To SBU</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Move Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedStockMoves.map((move) => (
            <TableRow key={move.id}>
              <TableCell>{move.itemName}</TableCell>
              <TableCell>{move.fromSBU}</TableCell>
              <TableCell>{move.toSBU}</TableCell>
              <TableCell>{move.quantity}</TableCell>
              <TableCell>{new Date(move.moveDate).toLocaleDateString()}</TableCell>
              <TableCell>
                <Button
                  variant="link"
                  onClick={() => handleEdit(move)}
                  className="text-primary p-0 h-auto"
                >
                  Edit
                </Button>
                <Button
                  variant="link"
                  onClick={() => handleDelete(move.id!)}
                  className="ml-4 text-red-600 p-0 h-auto"
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
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
