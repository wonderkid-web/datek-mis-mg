"use client";

import { useEffect, useState } from "react";
import { getAssets } from "@/lib/assetService";
import { getAssignments } from "@/lib/assignmentService";
import { columns } from "./columns";
import { DataTable } from "@/components/ui/data-table";
import { AddAssignmentDialog } from "@/app/assignments/add-assignment-dialog"; // Import the dialog

export default function UnassignedUsersPage() {
  const [unassignedAssets, setUnassignedAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const assets = await getAssets();
      const assignments = await getAssignments();

      const assignedAssetIds = new Set(assignments.map(assignment => assignment.assetId));
      const filteredUnassignedAssets = assets.filter(asset => !assignedAssetIds.has(asset.id));
        {/* @ts-expect-error its okay */}
      setUnassignedAssets(filteredUnassignedAssets);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return <div>Loading unassigned assets...</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Unassigned Assets</h1>
        <AddAssignmentDialog onSave={fetchData} /> {/* Add the button and dialog */}
      </div>
      <DataTable columns={columns} data={unassignedAssets} />
    </div>
  );
}
