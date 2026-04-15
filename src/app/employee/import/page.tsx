import { EmployeeImportPanel } from "@/components/employee/EmployeeImportPanel";

export default function ImportEmployeePage() {
  return (
    <div className="container mx-auto space-y-6 p-4">
      <div>
        <h1 className="text-2xl font-bold">Import Employee</h1>
        <p className="text-sm text-muted-foreground">
          Bulk create employee dari file Excel dengan format seperti halaman import asset.
        </p>
      </div>

      <EmployeeImportPanel />
    </div>
  );
}
