"use client";

import { useState } from "react";
import { Item } from "@/lib/types";
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
import { useRouter } from "next/navigation";

interface ItemListProps {
  items: Item[];
  handleEdit: (item: Item) => void;
  handleDelete: (id: string) => void;
}

export default function ItemList({
  items,
  handleEdit,
  handleDelete,
}: ItemListProps) {
  const router = useRouter();
  const [filter, setFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(filter.toLowerCase()) ||
      item.description.toLowerCase().includes(filter.toLowerCase())
  );

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleExport = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredItems);
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

    XLSX.utils.book_append_sheet(workbook, worksheet, "Items");
    XLSX.writeFile(workbook, "items.xlsx");
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <Input
          type="text"
          placeholder="Filter by name or description..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="max-w-sm"
        />
        <Button onClick={handleExport}>Export to Excel</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Min Quantity</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedItems.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.description}</TableCell>
              <TableCell>{item.quantity}</TableCell>
              <TableCell>{item.minQuantity}</TableCell>
              <TableCell>
                <Button
                  variant="link"
                  onClick={() => router.push(`/items/${item.id}`)}
                  className="text-blue-600 p-0 h-auto"
                >
                  Detail
                </Button>
                <Button
                  variant="link"
                  onClick={() => handleEdit(item)}
                  className="text-primary p-0 h-auto ml-4"
                >
                  Edit
                </Button>
                <Button
                  variant="link"
                  onClick={() => handleDelete(item.id!)}
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
