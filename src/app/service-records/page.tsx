// @ts-nocheck
"use client";

import { useState, useEffect, FormEvent } from "react";

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
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"; // Import Table components

import {
  getServiceRecords,
  createServiceRecord,
} from "@/lib/serviceRecordService";
import { getAssetAssignments } from "@/lib/assetAssignmentService";
import { columns, ServiceRecordWithDetails } from "./columns";
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
} from "@/lib/types";

type LaptopSpecsWithRelations = LaptopSpecs & {
  brandOption?: LaptopBrandOption | null;
  colorOption?: LaptopColorOption | null;
  microsoftOfficeOption?: LaptopMicrosoftOfficeOption | null;
  osOption?: LaptopOsOption | null;
  powerOption?: LaptopPowerOption | null;
  processorOption?: LaptopProcessorOption | null;
  ramOption?: LaptopRamOption | null;
  storageTypeOption?: LaptopStorageTypeOption | null;
  typeOption?: LaptopTypeOption | null;
  graphicOption?: LaptopGraphicOption | null;
  vgaOption?: LaptopVgaOption | null;
  licenseOption?: LaptopLicenseOption | null;
};

type IntelNucSpecsWithRelations = IntelNucSpecs & {
  brandOption?: LaptopBrandOption | null;
  colorOption?: LaptopColorOption | null;
  microsoftOfficeOption?: LaptopMicrosoftOfficeOption | null;
  osOption?: LaptopOsOption | null;
  powerOption?: LaptopPowerOption | null;
  processorOption?: LaptopProcessorOption | null;
  ramOption?: LaptopRamOption | null;
  storageTypeOption?: LaptopStorageTypeOption | null;
  typeOption?: LaptopTypeOption | null;
  graphicOption?: LaptopGraphicOption | null;
  vgaOption?: LaptopVgaOption | null;
  licenseOption?: LaptopLicenseOption | null;
};

type PrinterSpecsWithRelations = PrinterSpecs & {
  brandOption?: PrinterBrandOption | null;
  typeOption?: PrinterTypeOption | null;
  modelOption?: PrinterModelOption | null;
};

type AssetWithDetails = Asset & {
  category?: AssetCategory | null;
  laptopSpecs?: LaptopSpecsWithRelations | null;
  intelNucSpecs?: IntelNucSpecsWithRelations | null;
  printerSpecs?: PrinterSpecsWithRelations | null;
};

type AssetAssignmentWithDetails = AssetAssignment & {
  asset: AssetWithDetails;
  user: User;
};

// Helper function to format number to Rupiah
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

// Helper function to parse Rupiah string to number
const parseRupiah = (rupiahString: string): number => {
  const cleanString = rupiahString.replace(/[^0-9]/g, "");
  return parseInt(cleanString, 10) || 0;
};

export default function ServiceRecordsPage() {
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

  // Form state
  const [ticketHelpdesk, setTicketHelpdesk] = useState("");
  const [assetAssignmentId, setAssetAssignmentId] = useState<number | null>(
    null
  );
  const [repairType, setRepairType] = useState<"SUPPLIER" | "INTERNAL">(
    "INTERNAL"
  );
  const [cost, setCost] = useState<string>(""); // Change type to string for formatted value
  const [remarks, setRemarks] = useState("");

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [records, assignments] = await Promise.all([
        getServiceRecords(),
        getAssetAssignments(),
      ]);
      //@ts-expect-error it's okay to use type assertion here
      setServiceRecords(records as ServiceRecordWithDetails[]);
      //@ts-expect-error it's okay to use type assertion here
      setAssetAssignments(assignments as AssetAssignmentWithDetails[]);
    } catch (error) {
      console.error("Failed to fetch data:", error);
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
    // Only allow numbers and commas/dots for input, then format
    const numericValue = value.replace(/[^0-9]/g, ""); // Remove non-numeric characters
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
      alert("Please select an Asset Number.");
      return;
    }
    setIsSubmitting(true);
    try {
      await createServiceRecord({
        ticketHelpdesk,
        // @ts-expect-error it's okay to use string here
        assetAssignmentId,
        repairType,
        cost: parseRupiah(cost), // Parse back to number for submission
        remarks,
      });
      resetForm();
      fetchData(); // Refresh the list
    } catch (error) {
      console.error("Failed to create service record:", error);
      alert("Failed to save the record. Check the console for details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-10 space-y-8">
      <h1 className="text-2xl font-bold mb-4">Manage Service Records</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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

      <Card>
        <CardHeader>
          <CardTitle>Service Record History</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading records...</p>
          ) : (
            <DataTable columns={columns} data={serviceRecords} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
