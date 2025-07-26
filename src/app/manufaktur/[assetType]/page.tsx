
"use client";

import { useParams } from "next/navigation";

export default function ManufactureAssetPage() {
  const params = useParams();
  const { assetType } = params;

  // Mock data for dropdowns, replace with actual data fetching
  const masterData: { [key: string]: string[] } = {
    telepon: ["Brand A", "Brand B"],
    switch: ["SwitchCorp", "NetGear"],
    // Add other asset types and their corresponding master data
  };

  const options = masterData[assetType as string] || [];

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-6">
        Manufacture Page for {assetType}
      </h1>
      <div className="w-full max-w-md">
        <label
          htmlFor="master-data-select"
          className="block text-sm font-medium text-gray-700"
        >
          Select from Master Data
        </label>
        <select
          id="master-data-select"
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
