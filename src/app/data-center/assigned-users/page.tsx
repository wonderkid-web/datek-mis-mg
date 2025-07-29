import { getAssignments } from "@/lib/assignmentService";
import { columns } from "./columns";
import { DataTable } from "@/components/ui/data-table";

export default async function AssignedUsersPage() {
  const assignments = await getAssignments();
  const assignedAssets = assignments.filter(assignment => assignment.userId !== null);

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Assigned Assets</h1>
      <DataTable columns={columns} data={assignedAssets} />
    </div>
  );
}