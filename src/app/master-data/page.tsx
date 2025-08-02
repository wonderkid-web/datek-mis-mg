"use client";

import React from "react";
import { Toaster } from "sonner";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import AssetCategoriesPage from "./asset-categories/page";
import LaptopMasterDataPage from "./laptop/page";
import MasterDataPrinterPage from "./printer/page";

export default function MasterDataPage() {
  return (
    <div className="min-h-screen max-h-screen overflow-auto bg-gray-100">
      <main className="container mx-auto p-8">
        <h1 className="mb-8 text-3xl font-bold">Master Data</h1>

        <Tabs defaultValue="asset-categories" className="w-full mb-8">
          <TabsList className="w-full">
            <TabsTrigger value="asset-categories">Asset Categories</TabsTrigger>
            <TabsTrigger value="laptop">Laptop Options</TabsTrigger>
            <TabsTrigger value="printer">Printer Options</TabsTrigger>
          </TabsList>
          <TabsContent value="asset-categories">
            <AssetCategoriesPage />
          </TabsContent>
          <TabsContent value="laptop">
            <LaptopMasterDataPage />
          </TabsContent>
          <TabsContent value="printer">
            <MasterDataPrinterPage />
          </TabsContent>
        </Tabs>
      </main>
      <Toaster />
    </div>
  );
}
