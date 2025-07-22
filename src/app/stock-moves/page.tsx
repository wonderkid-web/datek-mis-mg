"use client";

import { useEffect, useState } from "react";
import { Item, StockMove } from "@/lib/types";
import { createStockMove } from "@/lib/stockMoveService";
import { getItems } from "@/lib/itemService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Toaster, toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getDepartments } from "@/lib/departmentService";
import { getUsers } from "@/lib/userService";
import { Department, User } from "@/lib/types";

const sbuOptions = [
  "BIMP",
  "BIMR",
  "BIMS",
  "ISA",
  "ISAR",
  "MUL",
  "KPNJ",
  "KMA",
  "MG",
];

export default function StockMovesPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [items, setItems] = useState<Item[]>([]);

  const [form, setForm] = useState<any>({
    sbu: "",
    item: "",
    assetNumber: "",
    user: "",
    department: "",
    ipAddress: "",
    remote: "",
    guaranteeDate: "",
    quantity: 0,
  })

  useEffect(() => {
    fetchItems();
    fetchUsers();
    fetchDepartments();
  }, []);

  const fetchUsers = async () => {
    const usersData = await getUsers();
    setUsers(usersData);
  };

  const fetchDepartments = async () => {
    const departmentsData = await getDepartments();
    setDepartments(departmentsData);
  };

  const fetchItems = async () => {
    const itemsData = await getItems();
    setItems(itemsData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setForm((prevForm:any) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      quantity: parseInt(e.target.value),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const selectedItem = items.find((i) => i.id === form.item);
    const selectedUser = users.find((u) => u.id === form.user);
    const selectedDepartment = departments.find(
      (d) => d.id === form.department
    );

    if (!selectedItem || !selectedUser || !selectedDepartment) {
      toast.error("Please select valid Item, User, and Department.");
      return;
    }

    const stockMoveData: Omit<StockMove, "id" | "createdAt"> = {
      ...form,
      item: selectedItem.id!,
      itemName: selectedItem.name,
      itemDescription: selectedItem.description,
      user: selectedUser.name,
      department: selectedDepartment.name,
      guaranteeDate: new Date(form.guaranteeDate),
    };
    try {
      await createStockMove(stockMoveData);
      toast.success("Stock move created successfully!");
      setForm({
        sbu: "initial",
        item: "initial",
        assetNumber: "",
        user: "initial",
        department: "initial",
        ipAddress: "",
        remote: "",
        guaranteeDate: "",
        quantity: 0,
      });
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="min-h-screen max-h-screen overflow-auto bg-gray-100">
      <main className="container mx-auto p-8">
        <h1 className="mb-8 text-3xl font-bold">Kelola Pergerakan Stok</h1>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Tambah Pergerakan Stok Baru</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="sbu"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  SBU
                </label>
                <Select
                  value={form.sbu}
                  onValueChange={(value) => handleSelectChange("sbu", value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih SBU" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="initial">Pilih SBU</SelectItem>
                    {sbuOptions.map((sbu) => (
                      <SelectItem key={sbu} value={sbu}>
                        {sbu}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="mb-4">
                <label
                  htmlFor="item"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Barang
                </label>
                <Select
                  value={form.item}
                  onValueChange={(value) => {
                    handleSelectChange("item", value);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih Item" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="initial">Pilih Item</SelectItem>
                    {items.map((item) => (
                      <SelectItem key={item.id} value={item.id!}>
                        {item.name} ({item.description})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="mb-4">
                <label
                  htmlFor="quantity"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Jumlah
                </label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={handleQuantityChange}
                  value={form.quantity}
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="assetNumber"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  No Asset
                </label>
                <input
                  type="text"
                  id="assetNumber"
                  name="assetNumber"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={handleChange}
                  value={form.assetNumber}
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="user"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  User
                </label>
                <Select
                  value={form.user}
                  onValueChange={(value) => handleSelectChange("user", value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih User" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="initial">Pilih User</SelectItem>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id!}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="mb-4">
                <label
                  htmlFor="department"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Department
                </label>
                <Select
                  value={form.department}
                  onValueChange={(value) =>
                    handleSelectChange("department", value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="initial">Pilih Department</SelectItem>
                    {departments.map((department) => (
                      <SelectItem key={department.id} value={department.id!}>
                        {department.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="mb-4">
                <label
                  htmlFor="ipAddress"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  IP Address
                </label>
                <input
                  type="text"
                  id="ipAddress"
                  name="ipAddress"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={handleChange}
                  value={form.ipAddress}
                  required
                />
              </div>
              <div className="mb-6">
                <label
                  htmlFor="remote"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Remote
                </label>
                <input
                  type="text"
                  id="remote"
                  name="remote"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  onChange={handleChange}
                  value={form.remote}
                  required
                />
              </div>
              <div className="mb-6">
                <label
                  htmlFor="guaranteeDate"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Garansi
                </label>
                <input
                  type="date"
                  id="guaranteeDate"
                  name="guaranteeDate"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  value={form.guaranteeDate}
                  onChange={handleChange}
                  required
                />
              </div>
              <Button type="submit">Tambah Pergerakan Stok</Button>
            </form>
          </CardContent>
        </Card>
      </main>
      <Toaster />
    </div>
  );
}
