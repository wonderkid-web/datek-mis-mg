// @ts-nocheck
"use client";

import { useState, useEffect, FormEvent, useMemo } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/ui/data-table";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";

import {
  getServiceRecords,
  createServiceRecord,
  deleteServiceRecord,
} from "@/lib/serviceRecordService";
import { getAssetAssignments } from "@/lib/assetAssignmentService";
import { getColumns } from "./columns";
import { exportColumns } from "./exportColumns";
import { DeleteRecordDialog } from "./delete-record-dialog";
import { EditRecordDialog } from "./edit-record-dialog";
import {
  AssetAssignment,
  Asset,
  User,
  LaptopSpecs,
  IntelNucSpecs,
  LaptopBrandOption,
  LaptopColorOption,
  LaptopMicrosoftOfficeOption,
  LaptopOsOption,
  LaptopPowerOption,
  LaptopProcessorOption,
  LaptopRamOption,
  LaptopStorageTypeOption,
  LaptopTypeOption,
  LaptopGraphicOption,
  LaptopVgaOption,
  LaptopLicenseOption,
  AssetCategory,
  PrinterSpecs,
  PrinterBrandOption,
  PrinterTypeOption,
  PrinterModelOption,
  ServiceRecordWithDetails,
  AssetAssignmentWithDetails,
} from "@/lib/types";
import { ExportActions } from "@/components/ExportActions";

// ... (keep all existing type definitions)

const formatRupiah = (amount: number | string): string => {
  if (typeof amount === "string") {
    amount = parseFloat(amount.replace(/[^0-9,-]+/g, "").replace(",", "."));
  }
  if (isNaN(amount)) return "";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const parseRupiah = (rupiahString: string): number => {
  const cleanString = rupiahString.replace(/[^0-9]/g, "");
  return parseInt(cleanString, 10) || 0;
};

export default function ServiceHistoryPage() {
  const { data: session } = useSession();
  const [serviceRecords, setServiceRecords] = useState<
    ServiceRecordWithDetails[]
  >([]);
  const [assetAssignments, setAssetAssignments] = useState<
    AssetAssignmentWithDetails[]
  >([]);
  const [selectedAssignment, setSelectedAssignment] =
    useState<AssetAssignmentWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [recordToDelete, setRecordToDelete] =
    useState<ServiceRecordWithDetails | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [recordToEdit, setRecordToEdit] =
    useState<ServiceRecordWithDetails | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Form state
  const [ticketHelpdesk, setTicketHelpdesk] = useState("");
  const [assetAssignmentId, setAssetAssignmentId] = useState<number | null>(
    null
  );
  const [repairType, setRepairType] = useState<"SUPPLIER" | "INTERNAL">(
    "INTERNAL"
  );
  const [cost, setCost] = useState<string>("");
  const [remarks, setRemarks] = useState("");

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [records, assignments] = await Promise.all([
        getServiceRecords(),
        getAssetAssignments(),
      ]);
      setServiceRecords(records as ServiceRecordWithDetails[]);
      setAssetAssignments(assignments as AssetAssignmentWithDetails[]);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("Failed to load data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssetSelect = (assignmentIdStr: string) => {
    const id = parseInt(assignmentIdStr, 10);
    const assignment = assetAssignments.find((a) => a.id === id) || null;
    setSelectedAssignment(assignment);
    setAssetAssignmentId(id);
  };

  const handleCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numericValue = value.replace(/[^0-9]/g, "");
    setCost(formatRupiah(numericValue));
  };

  const resetForm = () => {
    setTicketHelpdesk("");
    setAssetAssignmentId(null);
    setRepairType("INTERNAL");
    setCost("");
    setRemarks("");
    setSelectedAssignment(null);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!assetAssignmentId) {
      toast.warning("Please select an Asset Number.");
      return;
    }
    setIsSubmitting(true);
    try {
      await createServiceRecord({
        ticketHelpdesk,
        assetAssignmentId,
        repairType,
        cost: parseRupiah(cost),
        remarks,
      });
      toast.success("Service record created successfully!");
      resetForm();
      fetchData();
    } catch (error) {
      console.error("Failed to create service record:", error);
      toast.error("Failed to save the record.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (record: ServiceRecordWithDetails) => {
    setRecordToEdit(record);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (record: ServiceRecordWithDetails) => {
    setRecordToDelete(record);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!recordToDelete) return;
    try {
      await deleteServiceRecord(recordToDelete.id);
      toast.success("Service record deleted successfully!");
      fetchData();
    } catch (error) {
      console.error("Failed to delete service record:", error);
      toast.error("Failed to delete the record.");
    } finally {
      setIsDeleteDialogOpen(false);
      setRecordToDelete(null);
    }
  };

  const columns = useMemo(
    () => getColumns({ handleEditClick, handleDeleteClick }),
    [assetAssignments]
  );

  const isAdmin = (session?.user as any)?.role === "administrator";

  return (
    <>
      {/* INI FORM  dan ini STATIC */}
      {isAdmin && (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Create New Service Record</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="assetAssignmentId">Asset Number</Label>
                <Select
                  onValueChange={handleAssetSelect}
                  value={assetAssignmentId?.toString() ?? ""}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select an Asset Number" />
                  </SelectTrigger>
                  <SelectContent>
                    {assetAssignments.map((a) => (
                      <SelectItem key={a.id} value={a.id.toString()}>
                        {a.nomorAsset}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="ticketHelpdesk">Ticket Helpdesk</Label>
                <Input
                  id="ticketHelpdesk"
                  value={ticketHelpdesk}
                  onChange={(e) =>
                    setTicketHelpdesk(e.target.value.toUpperCase())
                  }
                  className="w-full"
                />
              </div>

              <div>
                <Label htmlFor="repairType">Repair Type</Label>
                <Select
                  onValueChange={(value: "SUPPLIER" | "INTERNAL") =>
                    setRepairType(value)
                  }
                  value={repairType}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SUPPLIER">SUPPLIER</SelectItem>
                    <SelectItem value="INTERNAL">INTERNAL</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="cost">Cost</Label>
                <Input
                  id="cost"
                  value={cost}
                  onChange={handleCostChange}
                  placeholder="Rp 0"
                  className="w-full"
                />
              </div>

              <div>
                <Label htmlFor="remarks">Remarks</Label>
                <Textarea
                  id="remarks"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value.toUpperCase())}
                  className="w-full"
                />
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? "Saving..." : "Save Record"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Asset Details</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedAssignment ? (
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-semibold">User:</TableCell>
                    <TableCell>{selectedAssignment.user.namaLengkap}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold">Department:</TableCell>
                    <TableCell>
                      {selectedAssignment.user.departemen ?? "N/A"}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold">Company:</TableCell>
                    <TableCell>
                      {selectedAssignment.user.lokasiKantor ?? "N/A"}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold">Brand:</TableCell>
                    <TableCell>
                      {selectedAssignment.asset.laptopSpecs?.brandOption
                        ?.value ||
                        selectedAssignment.asset.intelNucSpecs?.brandOption
                          ?.value ||
                        "N/A"}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold">Model:</TableCell>
                    <TableCell>{selectedAssignment.asset.namaAsset}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold">
                      Serial Number:
                    </TableCell>
                    <TableCell>
                      {selectedAssignment.asset.nomorSeri || "N/A"}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold">Processor:</TableCell>
                    <TableCell>
                      {selectedAssignment.asset.laptopSpecs?.processorOption
                        ?.value ||
                        selectedAssignment.asset.intelNucSpecs?.processorOption
                          ?.value ||
                        "N/A"}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold">RAM:</TableCell>
                    <TableCell>
                      {selectedAssignment.asset.laptopSpecs?.ramOption?.value ||
                        selectedAssignment.asset.intelNucSpecs?.ramOption
                          ?.value ||
                        "N/A"}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold">
                      Storage Type:
                    </TableCell>
                    <TableCell>
                      {selectedAssignment.asset.laptopSpecs?.storageTypeOption
                        ?.value ||
                        selectedAssignment.asset.intelNucSpecs
                          ?.storageTypeOption?.value ||
                        "N/A"}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold">Graphic:</TableCell>
                    <TableCell>
                      {selectedAssignment.asset.laptopSpecs?.graphicOption
                        ?.value ||
                        selectedAssignment.asset.intelNucSpecs?.graphicOption
                          ?.value ||
                        "N/A"}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold">
                      Power Adaptor:
                    </TableCell>
                    <TableCell>
                      {selectedAssignment.asset.laptopSpecs?.powerOption
                        ?.value ||
                        selectedAssignment.asset.intelNucSpecs?.powerOption
                          ?.value ||
                        "N/A"}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold">Color:</TableCell>
                    <TableCell>
                      {selectedAssignment.asset.laptopSpecs?.colorOption
                        ?.value ||
                        selectedAssignment.asset.intelNucSpecs?.colorOption
                          ?.value ||
                        "N/A"}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold">MAC WLAN:</TableCell>
                    <TableCell>
                      {selectedAssignment.asset.laptopSpecs?.macWlan ||
                        selectedAssignment.asset.intelNucSpecs?.macWlan ||
                        "N/A"}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold">MAC LAN:</TableCell>
                    <TableCell>
                      {selectedAssignment.asset.laptopSpecs?.macLan ||
                        selectedAssignment.asset.intelNucSpecs?.macLan ||
                        "N/A"}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold">
                      Operating System:
                    </TableCell>
                    <TableCell>
                      {selectedAssignment.asset.laptopSpecs?.osOption?.value ||
                        selectedAssignment.asset.intelNucSpecs?.osOption
                          ?.value ||
                        "N/A"}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold">
                      License Type:
                    </TableCell>
                    <TableCell>
                      {selectedAssignment.asset.laptopSpecs?.licenseOption
                        ?.value ||
                        selectedAssignment.asset.intelNucSpecs?.licenseOption
                          ?.value ||
                        "N/A"}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold">
                      License Key:
                    </TableCell>
                    <TableCell>
                      {selectedAssignment.asset.laptopSpecs?.licenseKey ||
                        selectedAssignment.asset.intelNucSpecs?.licenseKey ||
                        "N/A"}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold">
                      Microsoft Office:
                    </TableCell>
                    <TableCell>
                      {selectedAssignment.asset.laptopSpecs
                        ?.microsoftOfficeOption?.value ||
                        selectedAssignment.asset.intelNucSpecs
                          ?.microsoftOfficeOption?.value ||
                        "N/A"}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold">
                      Purchase Date:
                    </TableCell>
                    <TableCell>
                      {selectedAssignment.asset.tanggalPembelian
                        ? new Date(
                            selectedAssignment.asset.tanggalPembelian
                          ).toLocaleDateString()
                        : "N/A"}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold">
                      Warranty End:
                    </TableCell>
                    <TableCell>
                      {selectedAssignment.asset.tanggalGaransi
                        ? new Date(
                            selectedAssignment.asset.tanggalGaransi
                          ).toLocaleDateString()
                        : "N/A"}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold">
                      Asset Status:
                    </TableCell>
                    <TableCell>
                      {selectedAssignment.asset.statusAsset || "N/A"}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            ) : (
              <p>Select an asset number to see details.</p>
            )}
          </CardContent>
        </Card>
      </div>
      )}

      {/* INI Table dan ini Promise */}
      <Card>
        <CardHeader>
          <CardTitle>Service Record History</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-5">
              <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <div className="flex justify-end mb-4">
                <ExportActions
                  columns={exportColumns}
                  data={serviceRecords}
                  fileName="Service_Record_History"
                />
              </div>
              <DataTable columns={columns} data={serviceRecords} />
            </>
          )}
        </CardContent>
      </Card>

      <DeleteRecordDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
      />

      <EditRecordDialog
        record={recordToEdit}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSave={fetchData}
      />
    </>
  );
}
