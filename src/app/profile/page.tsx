"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Mail, Building2, Briefcase, MapPin, Shield, User2, Lock, Eye, EyeOff } from "lucide-react";

import { getUserById, changePassword } from "@/lib/userService";
import logo from "../../../public/logo.png";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const userId = Number((session?.user as any)?.id ?? 0);

  const { data: user, isLoading } = useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      if (!userId) return null;
      return await getUserById(userId);
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const onChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    if (!currentPassword || !newPassword) {
      toast.warning("Lengkapi semua field password");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Konfirmasi password baru tidak cocok");
      return;
    }
    setSubmitting(true);
    try {
      const res = await changePassword(userId, currentPassword, newPassword);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success("Password berhasil diubah. Silakan login ulang.");
      // Optional: force re-login after password change
      setTimeout(() => {
        signOut({ callbackUrl: "/login" });
      }, 1200);
    } catch (err) {
      toast.error("Gagal mengubah password");
    } finally {
      setSubmitting(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  const firstName = session?.user?.name?.split(" ")[0] ?? "User";
  const initial = firstName.charAt(0)?.toUpperCase() ?? "U";

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary to-emerald-700 p-6 text-primary-foreground">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(800px_400px_at_0%_0%,rgba(255,255,255,0.2),transparent),radial-gradient(600px_300px_at_100%_100%,rgba(255,255,255,0.15),transparent)]" />
        <div className="relative z-10 flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-white/20 flex items-center justify-center text-xl font-semibold">
            {initial}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-semibold">Hi, {firstName}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                <Shield className="h-3 w-3 mr-1" /> {(session?.user as any)?.role ?? "user"}
              </Badge>
            </div>
          </div>
          <Image src={logo} alt="Logo" width={40} height={40} className="rounded-md border border-white/20" />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informasi Akun</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading || status === "loading" ? (
            <div className="grid gap-2">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-6 w-1/2" />
            </div>
          ) : user ? (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center gap-3">
                <User2 className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Nama</p>
                  <p className="font-medium">{user.namaLengkap}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-medium">{user.email ?? "-"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Briefcase className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Departemen</p>
                  <p className="font-medium">{user.departemen ?? "-"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Jabatan</p>
                  <p className="font-medium">{user.jabatan ?? "-"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Corporate</p>
                  <p className="font-medium">{user.lokasiKantor ?? "-"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Role</p>
                  <p className="font-medium">{(session?.user as any)?.role ?? "-"}</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">User not found.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ubah Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onChangePassword} className="space-y-4 max-w-md">
            <div className="space-y-1">
              <Label htmlFor="currentPassword">Password Saat Ini</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="currentPassword"
                  type={showCurrent ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="pl-9 pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  onClick={() => setShowCurrent((s) => !s)}
                >
                  {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="newPassword">Password Baru</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="newPassword"
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="pl-9 pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  onClick={() => setShowNew((s) => !s)}
                >
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="pl-9 pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  onClick={() => setShowConfirm((s) => !s)}
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={submitting}>
                {submitting ? "Menyimpan..." : "Simpan Password"}
              </Button>
              <Button type="button" variant="outline" onClick={() => {
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
              }}>Reset</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
