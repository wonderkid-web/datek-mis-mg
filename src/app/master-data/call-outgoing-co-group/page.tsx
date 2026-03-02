"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { ArrowUpDown, Edit, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  createCallOutgoingOption,
  deleteCallOutgoingOption,
  getCallOutgoingOptions,
  updateCallOutgoingOption,
} from "@/lib/callOutgoingService";
import { createTrunk, deleteTrunk, getTrunks, updateTrunk } from "@/lib/trunkService";
import { createPstn, deletePstn, getPstns, updatePstn } from "@/lib/pstnService";

type CalloutItem = Awaited<ReturnType<typeof getCallOutgoingOptions>>[number];
type TrunkItem = Awaited<ReturnType<typeof getTrunks>>[number];
type PstnItem = Awaited<ReturnType<typeof getPstns>>[number];

type DeleteContext =
  | { type: "callout"; id: number; label: string }
  | { type: "trunk"; id: number; label: string }
  | { type: "pstn"; id: number; label: string }
  | null;

const parseNumber = (value: string) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return null;
  return numeric;
};

const buildCalloutColumns = ({
  onEdit,
  onDelete,
}: {
  onEdit: (item: CalloutItem) => void;
  onDelete: (item: CalloutItem) => void;
}): ColumnDef<CalloutItem>[] => [
  {
    id: "no",
    header: () => <div className="text-center">No</div>,
    cell: ({ row }) => <div className="text-center">{row.index + 1}</div>,
  },
  {
    accessorKey: "value",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Value
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "line",
    header: "Line",
  },
  {
    accessorKey: "company",
    header: "Company",
  },
  {
    id: "actions",
    header: () => <div className="text-center">Actions</div>,
    cell: ({ row }) => (
      <div className="flex items-center justify-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={(event) => {
            event.stopPropagation();
            onEdit(row.original);
          }}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="destructive"
          size="icon"
          onClick={(event) => {
            event.stopPropagation();
            onDelete(row.original);
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    ),
  },
];

const buildTrunkColumns = ({
  onEdit,
  onDelete,
}: {
  onEdit: (item: TrunkItem) => void;
  onDelete: (item: TrunkItem) => void;
}): ColumnDef<TrunkItem>[] => [
  {
    id: "no",
    header: () => <div className="text-center">No</div>,
    cell: ({ row }) => <div className="text-center">{row.index + 1}</div>,
  },
  {
    accessorKey: "nomorLine",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Nomor Line
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "company",
    header: "Company",
  },
  {
    accessorKey: "extension",
    header: "Extension",
  },
  {
    id: "actions",
    header: () => <div className="text-center">Actions</div>,
    cell: ({ row }) => (
      <div className="flex items-center justify-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={(event) => {
            event.stopPropagation();
            onEdit(row.original);
          }}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="destructive"
          size="icon"
          onClick={(event) => {
            event.stopPropagation();
            onDelete(row.original);
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    ),
  },
];

const buildPstnColumns = ({
  onEdit,
  onDelete,
}: {
  onEdit: (item: PstnItem) => void;
  onDelete: (item: PstnItem) => void;
}): ColumnDef<PstnItem>[] => [
  {
    id: "no",
    header: () => <div className="text-center">No</div>,
    cell: ({ row }) => <div className="text-center">{row.index + 1}</div>,
  },
  {
    accessorKey: "pstnCode",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        PSTN Code
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "pstnName",
    header: "PSTN Name",
  },
  {
    id: "actions",
    header: () => <div className="text-center">Actions</div>,
    cell: ({ row }) => (
      <div className="flex items-center justify-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={(event) => {
            event.stopPropagation();
            onEdit(row.original);
          }}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="destructive"
          size="icon"
          onClick={(event) => {
            event.stopPropagation();
            onDelete(row.original);
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    ),
  },
];

export default function CalloutPstnTrunkPage() {
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === "administrator";
  const queryClient = useQueryClient();

  const [calloutSearch, setCalloutSearch] = useState("");
  const [trunkSearch, setTrunkSearch] = useState("");
  const [pstnSearch, setPstnSearch] = useState("");

  const [calloutCreateOpen, setCalloutCreateOpen] = useState(false);
  const [calloutCreateValue, setCalloutCreateValue] = useState("");
  const [calloutCreateLine, setCalloutCreateLine] = useState("");
  const [calloutCreateCompany, setCalloutCreateCompany] = useState("");

  const [trunkCreateOpen, setTrunkCreateOpen] = useState(false);
  const [trunkCreateLine, setTrunkCreateLine] = useState("");
  const [trunkCreateCompany, setTrunkCreateCompany] = useState("");
  const [trunkCreateExtension, setTrunkCreateExtension] = useState("");

  const [pstnCreateOpen, setPstnCreateOpen] = useState(false);
  const [pstnCreateCode, setPstnCreateCode] = useState("");
  const [pstnCreateName, setPstnCreateName] = useState("");

  const [calloutEditOpen, setCalloutEditOpen] = useState(false);
  const [calloutEditItem, setCalloutEditItem] = useState<CalloutItem | null>(null);
  const [calloutEditValue, setCalloutEditValue] = useState("");
  const [calloutEditLine, setCalloutEditLine] = useState("");
  const [calloutEditCompany, setCalloutEditCompany] = useState("");

  const [trunkEditOpen, setTrunkEditOpen] = useState(false);
  const [trunkEditItem, setTrunkEditItem] = useState<TrunkItem | null>(null);
  const [trunkEditLine, setTrunkEditLine] = useState("");
  const [trunkEditCompany, setTrunkEditCompany] = useState("");
  const [trunkEditExtension, setTrunkEditExtension] = useState("");

  const [pstnEditOpen, setPstnEditOpen] = useState(false);
  const [pstnEditItem, setPstnEditItem] = useState<PstnItem | null>(null);
  const [pstnEditCode, setPstnEditCode] = useState("");
  const [pstnEditName, setPstnEditName] = useState("");

  const [deleteContext, setDeleteContext] = useState<DeleteContext>(null);

  const { data: calloutOptions } = useQuery<CalloutItem[]>({
    queryKey: ["callOutgoingOptions"],
    queryFn: () => getCallOutgoingOptions(),
  });

  const { data: trunkOptions } = useQuery<TrunkItem[]>({
    queryKey: ["trunkOptions"],
    queryFn: () => getTrunks(),
  });

  const { data: pstnOptions } = useQuery<PstnItem[]>({
    queryKey: ["pstnOptions"],
    queryFn: () => getPstns(),
  });

  const createCalloutMutation = useMutation({
    mutationFn: createCallOutgoingOption,
    onSuccess: () => {
      toast.success("Callout Going created.");
      queryClient.invalidateQueries({ queryKey: ["callOutgoingOptions"] });
      setCalloutCreateOpen(false);
      setCalloutCreateValue("");
      setCalloutCreateLine("");
      setCalloutCreateCompany("");
    },
    onError: (error: Error) => toast.error(error.message || "Failed to create Callout Going."),
  });

  const createTrunkMutation = useMutation({
    mutationFn: createTrunk,
    onSuccess: () => {
      toast.success("Trunk created.");
      queryClient.invalidateQueries({ queryKey: ["trunkOptions"] });
      setTrunkCreateOpen(false);
      setTrunkCreateLine("");
      setTrunkCreateCompany("");
      setTrunkCreateExtension("");
    },
    onError: (error: Error) => toast.error(error.message || "Failed to create Trunk."),
  });

  const createPstnMutation = useMutation({
    mutationFn: createPstn,
    onSuccess: () => {
      toast.success("PSTN created.");
      queryClient.invalidateQueries({ queryKey: ["pstnOptions"] });
      setPstnCreateOpen(false);
      setPstnCreateCode("");
      setPstnCreateName("");
    },
    onError: (error: Error) => toast.error(error.message || "Failed to create PSTN."),
  });

  const updateCalloutMutation = useMutation({
    mutationFn: (payload: { id: number; value: number; line: number; company: string }) =>
      updateCallOutgoingOption(payload.id, {
        value: payload.value,
        line: payload.line,
        company: payload.company,
      }),
    onSuccess: () => {
      toast.success("Callout Going updated.");
      queryClient.invalidateQueries({ queryKey: ["callOutgoingOptions"] });
      setCalloutEditOpen(false);
      setCalloutEditItem(null);
    },
    onError: (error: Error) => toast.error(error.message || "Failed to update Callout Going."),
  });

  const updateTrunkMutation = useMutation({
    mutationFn: (payload: { id: number; nomorLine: number; company: string; extension: number }) =>
      updateTrunk(payload.id, {
        nomorLine: payload.nomorLine,
        company: payload.company,
        extension: payload.extension,
      }),
    onSuccess: () => {
      toast.success("Trunk updated.");
      queryClient.invalidateQueries({ queryKey: ["trunkOptions"] });
      setTrunkEditOpen(false);
      setTrunkEditItem(null);
    },
    onError: (error: Error) => toast.error(error.message || "Failed to update Trunk."),
  });

  const updatePstnMutation = useMutation({
    mutationFn: (payload: { id: number; pstnCode: number; pstnName: string }) =>
      updatePstn(payload.id, {
        pstnCode: payload.pstnCode,
        pstnName: payload.pstnName,
      }),
    onSuccess: () => {
      toast.success("PSTN updated.");
      queryClient.invalidateQueries({ queryKey: ["pstnOptions"] });
      setPstnEditOpen(false);
      setPstnEditItem(null);
    },
    onError: (error: Error) => toast.error(error.message || "Failed to update PSTN."),
  });

  const deleteCalloutMutation = useMutation({
    mutationFn: deleteCallOutgoingOption,
    onSuccess: () => {
      toast.success("Callout Going deleted.");
      queryClient.invalidateQueries({ queryKey: ["callOutgoingOptions"] });
      setDeleteContext(null);
    },
    onError: (error: Error) => toast.error(error.message || "Failed to delete Callout Going."),
  });

  const deleteTrunkMutation = useMutation({
    mutationFn: deleteTrunk,
    onSuccess: () => {
      toast.success("Trunk deleted.");
      queryClient.invalidateQueries({ queryKey: ["trunkOptions"] });
      setDeleteContext(null);
    },
    onError: (error: Error) => toast.error(error.message || "Failed to delete Trunk."),
  });

  const deletePstnMutation = useMutation({
    mutationFn: deletePstn,
    onSuccess: () => {
      toast.success("PSTN deleted.");
      queryClient.invalidateQueries({ queryKey: ["pstnOptions"] });
      setDeleteContext(null);
    },
    onError: (error: Error) => toast.error(error.message || "Failed to delete PSTN."),
  });

  const filteredCalloutOptions = useMemo(() => {
    const items = calloutOptions ?? [];
    const query = calloutSearch.trim().toLowerCase();
    if (!query) return items;
    return items.filter((item) =>
      `${item.value} ${item.line} ${item.company}`.toLowerCase().includes(query)
    );
  }, [calloutOptions, calloutSearch]);

  const filteredTrunkOptions = useMemo(() => {
    const items = trunkOptions ?? [];
    const query = trunkSearch.trim().toLowerCase();
    if (!query) return items;
    return items.filter((item) =>
      `${item.nomorLine} ${item.company} ${item.extension}`.toLowerCase().includes(query)
    );
  }, [trunkOptions, trunkSearch]);

  const filteredPstnOptions = useMemo(() => {
    const items = pstnOptions ?? [];
    const query = pstnSearch.trim().toLowerCase();
    if (!query) return items;
    return items.filter((item) =>
      `${item.pstnCode} ${item.pstnName}`.toLowerCase().includes(query)
    );
  }, [pstnOptions, pstnSearch]);

  const handleCalloutCreate = () => {
    const value = parseNumber(calloutCreateValue);
    const line = parseNumber(calloutCreateLine);
    const company = calloutCreateCompany.trim();

    if (value === null || line === null || !company) {
      toast.error("Value, line, dan company wajib diisi.");
      return;
    }

    createCalloutMutation.mutate({ value, line, company });
  };

  const handleTrunkCreate = () => {
    const nomorLine = parseNumber(trunkCreateLine);
    const extension = parseNumber(trunkCreateExtension);
    const company = trunkCreateCompany.trim();

    if (nomorLine === null || extension === null || !company) {
      toast.error("Nomor line, company, dan extension wajib diisi.");
      return;
    }

    createTrunkMutation.mutate({ nomorLine, company, extension });
  };

  const handlePstnCreate = () => {
    const pstnCode = parseNumber(pstnCreateCode);
    const pstnName = pstnCreateName.trim();

    if (pstnCode === null || !pstnName) {
      toast.error("PSTN code dan PSTN name wajib diisi.");
      return;
    }

    createPstnMutation.mutate({ pstnCode, pstnName });
  };

  const handleCalloutEdit = () => {
    if (!calloutEditItem) return;
    const value = parseNumber(calloutEditValue);
    const line = parseNumber(calloutEditLine);
    const company = calloutEditCompany.trim();
    if (value === null || line === null || !company) {
      toast.error("Value, line, dan company wajib diisi.");
      return;
    }
    updateCalloutMutation.mutate({
      id: calloutEditItem.id,
      value,
      line,
      company,
    });
  };

  const handleTrunkEdit = () => {
    if (!trunkEditItem) return;
    const nomorLine = parseNumber(trunkEditLine);
    const extension = parseNumber(trunkEditExtension);
    const company = trunkEditCompany.trim();
    if (nomorLine === null || extension === null || !company) {
      toast.error("Nomor line, company, dan extension wajib diisi.");
      return;
    }
    updateTrunkMutation.mutate({
      id: trunkEditItem.id,
      nomorLine,
      company,
      extension,
    });
  };

  const handlePstnEdit = () => {
    if (!pstnEditItem) return;
    const pstnCode = parseNumber(pstnEditCode);
    const pstnName = pstnEditName.trim();
    if (pstnCode === null || !pstnName) {
      toast.error("PSTN code dan PSTN name wajib diisi.");
      return;
    }
    updatePstnMutation.mutate({
      id: pstnEditItem.id,
      pstnCode,
      pstnName,
    });
  };

  const handleDeleteConfirm = () => {
    if (!deleteContext) return;
    if (deleteContext.type === "callout") {
      deleteCalloutMutation.mutate(deleteContext.id);
      return;
    }
    if (deleteContext.type === "trunk") {
      deleteTrunkMutation.mutate(deleteContext.id);
      return;
    }
    deletePstnMutation.mutate(deleteContext.id);
  };

  return (
    <div className="container mx-auto py-10 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Master Data Callout Going & PSTN & Trunk</CardTitle>
          <CardDescription>
            Kelola data Callout Going, Trunk, dan PSTN untuk Akun Telepon dan Billing Records.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <Input
                placeholder="Search Callout Going..."
                value={calloutSearch}
                onChange={(event) => setCalloutSearch(event.target.value)}
                className="max-w-sm"
              />
              {isAdmin && (
                <Button onClick={() => setCalloutCreateOpen(true)}>
                  Add Callout Going
                </Button>
              )}
            </div>
            <DataTable
              columns={buildCalloutColumns({
                onEdit: (item) => {
                  setCalloutEditItem(item);
                  setCalloutEditValue(String(item.value));
                  setCalloutEditLine(String(item.line));
                  setCalloutEditCompany(item.company);
                  setCalloutEditOpen(true);
                },
                onDelete: (item) =>
                  setDeleteContext({
                    type: "callout",
                    id: item.id,
                    label: `${item.value} / ${item.line} / ${item.company}`,
                  }),
              })}
              data={filteredCalloutOptions}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <Input
                placeholder="Search Trunk..."
                value={trunkSearch}
                onChange={(event) => setTrunkSearch(event.target.value)}
                className="max-w-sm"
              />
              {isAdmin && <Button onClick={() => setTrunkCreateOpen(true)}>Add Trunk</Button>}
            </div>
            <DataTable
              columns={buildTrunkColumns({
                onEdit: (item) => {
                  setTrunkEditItem(item);
                  setTrunkEditLine(String(item.nomorLine));
                  setTrunkEditCompany(item.company);
                  setTrunkEditExtension(String(item.extension));
                  setTrunkEditOpen(true);
                },
                onDelete: (item) =>
                  setDeleteContext({
                    type: "trunk",
                    id: item.id,
                    label: `${item.nomorLine} / ${item.company}`,
                  }),
              })}
              data={filteredTrunkOptions}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <Input
                placeholder="Search PSTN..."
                value={pstnSearch}
                onChange={(event) => setPstnSearch(event.target.value)}
                className="max-w-sm"
              />
              {isAdmin && <Button onClick={() => setPstnCreateOpen(true)}>Add PSTN</Button>}
            </div>
            <DataTable
              columns={buildPstnColumns({
                onEdit: (item) => {
                  setPstnEditItem(item);
                  setPstnEditCode(String(item.pstnCode));
                  setPstnEditName(item.pstnName);
                  setPstnEditOpen(true);
                },
                onDelete: (item) =>
                  setDeleteContext({
                    type: "pstn",
                    id: item.id,
                    label: `${item.pstnCode} / ${item.pstnName}`,
                  }),
              })}
              data={filteredPstnOptions}
            />
          </div>
        </CardContent>
      </Card>

      <Dialog open={calloutCreateOpen} onOpenChange={setCalloutCreateOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Callout Going</DialogTitle>
            <DialogDescription>Masukkan value, line, dan company.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Value</Label>
              <Input
                type="number"
                value={calloutCreateValue}
                onChange={(event) => setCalloutCreateValue(event.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Line</Label>
              <Input
                type="number"
                value={calloutCreateLine}
                onChange={(event) => setCalloutCreateLine(event.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Company</Label>
              <Input
                value={calloutCreateCompany}
                onChange={(event) => setCalloutCreateCompany(event.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCalloutCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCalloutCreate} disabled={createCalloutMutation.isPending}>
              {createCalloutMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={trunkCreateOpen} onOpenChange={setTrunkCreateOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Trunk</DialogTitle>
            <DialogDescription>Masukkan nomor line, company, dan extension.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Nomor Line</Label>
              <Input
                type="number"
                value={trunkCreateLine}
                onChange={(event) => setTrunkCreateLine(event.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Company</Label>
              <Input
                value={trunkCreateCompany}
                onChange={(event) => setTrunkCreateCompany(event.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Extension</Label>
              <Input
                type="number"
                value={trunkCreateExtension}
                onChange={(event) => setTrunkCreateExtension(event.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTrunkCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleTrunkCreate} disabled={createTrunkMutation.isPending}>
              {createTrunkMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={pstnCreateOpen} onOpenChange={setPstnCreateOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add PSTN</DialogTitle>
            <DialogDescription>Masukkan PSTN code dan PSTN name.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>PSTN Code</Label>
              <Input
                type="number"
                value={pstnCreateCode}
                onChange={(event) => setPstnCreateCode(event.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>PSTN Name</Label>
              <Input
                value={pstnCreateName}
                onChange={(event) => setPstnCreateName(event.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPstnCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handlePstnCreate} disabled={createPstnMutation.isPending}>
              {createPstnMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={calloutEditOpen} onOpenChange={setCalloutEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Callout Going</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Value</Label>
              <Input
                type="number"
                value={calloutEditValue}
                onChange={(event) => setCalloutEditValue(event.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Line</Label>
              <Input
                type="number"
                value={calloutEditLine}
                onChange={(event) => setCalloutEditLine(event.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Company</Label>
              <Input
                value={calloutEditCompany}
                onChange={(event) => setCalloutEditCompany(event.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCalloutEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCalloutEdit} disabled={updateCalloutMutation.isPending}>
              {updateCalloutMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={trunkEditOpen} onOpenChange={setTrunkEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Trunk</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Nomor Line</Label>
              <Input
                type="number"
                value={trunkEditLine}
                onChange={(event) => setTrunkEditLine(event.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Company</Label>
              <Input
                value={trunkEditCompany}
                onChange={(event) => setTrunkEditCompany(event.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Extension</Label>
              <Input
                type="number"
                value={trunkEditExtension}
                onChange={(event) => setTrunkEditExtension(event.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTrunkEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleTrunkEdit} disabled={updateTrunkMutation.isPending}>
              {updateTrunkMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={pstnEditOpen} onOpenChange={setPstnEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit PSTN</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>PSTN Code</Label>
              <Input
                type="number"
                value={pstnEditCode}
                onChange={(event) => setPstnEditCode(event.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>PSTN Name</Label>
              <Input
                value={pstnEditName}
                onChange={(event) => setPstnEditName(event.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPstnEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handlePstnEdit} disabled={updatePstnMutation.isPending}>
              {updatePstnMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(deleteContext)} onOpenChange={(open) => !open && setDeleteContext(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Data?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Data {deleteContext?.label ?? ""} will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
