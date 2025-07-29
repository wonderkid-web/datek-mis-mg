import { getAssets } from "@/lib/assetService";
import { getAssignments } from "@/lib/assignmentService";
import { columns } from "./columns";
import { DataTable } from "@/components/ui/data-table";

export default async function UnassignedUsersPage() {
  const assets = await getAssets();
  const assignments = await getAssignments();

  const assignedAssetIds = new Set(assignments.map(assignment => assignment.assetId));
  const unassignedAssets = assets.filter(asset => !assignedAssetIds.has(asset.id));

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Unassigned Assets</h1>
      <DataTable columns={columns} data={unassignedAssets} />
    </div>
  );
}