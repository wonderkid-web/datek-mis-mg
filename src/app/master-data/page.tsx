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
import CallOutgoingCoGroupPage from "./call-outgoing-co-group/page";

export default function MasterDataPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <main className="container mx-auto p-4 sm:p-8">
        <h1 className="mb-6 text-2xl font-bold sm:mb-8 sm:text-3xl">Master Data</h1>

        <Tabs defaultValue="asset-categories" className="w-full mb-8">
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger className="shrink-0" value="asset-categories">Asset Categories</TabsTrigger>
            <TabsTrigger className="shrink-0" value="laptop">Laptop Options</TabsTrigger>
            <TabsTrigger className="shrink-0" value="printer">Printer Options</TabsTrigger>
            <TabsTrigger className="shrink-0" value="call-outgoing-co-group">Callout Going & PSTN & Trunk</TabsTrigger>
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
          <TabsContent value="call-outgoing-co-group">
            <CallOutgoingCoGroupPage />
          </TabsContent>
        </Tabs>
      </main>
      <Toaster />
    </div>
  );
}
