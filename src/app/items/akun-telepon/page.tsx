"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import ReactSelect from "react-select";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getUsers } from "@/lib/userService";
import { getCallOutgoingOptions } from "@/lib/callOutgoingService";
import { getCoGroupOptions } from "@/lib/coGroupService";
import { createPhoneAccount } from "@/lib/phoneAccountService";

type UserOption = {
  id: number;
  namaLengkap: string;
  lokasiKantor: string | null;
  departemen: string | null;
};

export default function AkunTeleponPage() {
  const [userId, setUserId] = useState<number | null>(null);
  const [extension, setExtension] = useState("");
  const [account, setAccount] = useState("");
  const [codeDial, setCodeDial] = useState("");
  const [deposit, setDeposit] = useState("");
  const [callOutgoingId, setCallOutgoingId] = useState<number | null>(null);
  const [coGroupId, setCoGroupId] = useState<number | null>(null);

  const { data: users } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });

  const { data: callOutgoingOptions } = useQuery({
    queryKey: ["callOutgoingOptions"],
    queryFn: getCallOutgoingOptions,
  });

  const { data: coGroupOptions } = useQuery({
    queryKey: ["coGroupOptions"],
    queryFn: getCoGroupOptions,
  });

  const selectedUser = useMemo(() => {
    return (users as UserOption[] | undefined)?.find((item) => item.id === userId) ?? null;
  }, [users, userId]);

  useEffect(() => {
    if (!callOutgoingId && callOutgoingOptions?.length) {
      const defaultOption = callOutgoingOptions.find((item) => item.value === "12");
      if (defaultOption) {
        setCallOutgoingId(defaultOption.id);
      }
    }
  }, [callOutgoingOptions, callOutgoingId]);

  useEffect(() => {
    if (!coGroupId && coGroupOptions?.length) {
      const defaultOption = coGroupOptions.find((item) => item.value === "6");
      if (defaultOption) {
        setCoGroupId(defaultOption.id);
      }
    }
  }, [coGroupOptions, coGroupId]);

  const createMutation = useMutation({
    mutationFn: createPhoneAccount,
    onSuccess: () => {
      toast.success("Akun Telepon berhasil disimpan.");
      setUserId(null);
      setExtension("");
      setAccount("");
      setCodeDial("");
      setDeposit("");
      setCallOutgoingId(null);
      setCoGroupId(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal menyimpan Akun Telepon.");
    },
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!userId || !extension || !account || !codeDial || !deposit || !callOutgoingId || !coGroupId) {
      toast.error("Semua field wajib diisi.");
      return;
    }

    createMutation.mutate({
      userId,
      extension: Number(extension),
      account: Number(account),
      codeDial: codeDial.trim(),
      deposit: Number(deposit),
      callOutgoingId,
      coGroupId,
    });
  };

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Akun Telepon</CardTitle>
          <CardDescription>
            Input akun telepon berdasarkan data employee dan master data Call Outgoing/CO Group.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label>Nama User</Label>
              <ReactSelect
                options={(users as UserOption[] | undefined)?.map((item) => ({
                  value: String(item.id),
                  label: item.namaLengkap,
                }))}
                value={
                  selectedUser
                    ? { value: String(selectedUser.id), label: selectedUser.namaLengkap }
                    : null
                }
                onChange={(option) => setUserId(option ? Number(option.value) : null)}
                placeholder="Pilih user dari employee"
              />
            </div>

            <div className="space-y-2">
              <Label>Corporate</Label>
              <Input value={selectedUser?.lokasiKantor ?? ""} disabled />
            </div>

            <div className="space-y-2">
              <Label>Department</Label>
              <Input value={selectedUser?.departemen ?? ""} disabled />
            </div>

            <div className="space-y-2">
              <Label htmlFor="extension">Extension</Label>
              <Input
                id="extension"
                type="number"
                value={extension}
                onChange={(event) => setExtension(event.target.value)}
                placeholder="Input extension"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="account">Account</Label>
              <Input
                id="account"
                type="number"
                value={account}
                onChange={(event) => setAccount(event.target.value)}
                placeholder="Input account"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="codeDial">Code Dial</Label>
              <Input
                id="codeDial"
                value={codeDial}
                onChange={(event) => setCodeDial(event.target.value)}
                placeholder="*47*EXTACC##NOTUJUAN"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deposit">Deposit (Nominal Rupiah)</Label>
              <Input
                id="deposit"
                type="number"
                min={0}
                value={deposit}
                onChange={(event) => setDeposit(event.target.value)}
                placeholder="Input nominal rupiah"
              />
            </div>

            <div className="space-y-2">
              <Label>Call Outgoing</Label>
              <Select
                value={callOutgoingId ? String(callOutgoingId) : undefined}
                onValueChange={(value) => setCallOutgoingId(Number(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Call Outgoing" />
                </SelectTrigger>
                <SelectContent>
                  {(callOutgoingOptions ?? []).map((item) => (
                    <SelectItem key={item.id} value={String(item.id)}>
                      {item.value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>CO Group</Label>
              <Select
                value={coGroupId ? String(coGroupId) : undefined}
                onValueChange={(value) => setCoGroupId(Number(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih CO Group" />
                </SelectTrigger>
                <SelectContent>
                  {(coGroupOptions ?? []).map((item) => (
                    <SelectItem key={item.id} value={String(item.id)}>
                      {item.value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="pt-2">
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Saving..." : "Save Akun Telepon"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
