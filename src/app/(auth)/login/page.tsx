"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Mail,
  Eye,
  EyeOff,
  PhoneCallIcon,
  Lock,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import logo from "../../../../public/logo.png";
import laptopImg from "../../../../public/laptop.png";
import nucImg from "../../../../public/nuc.png";
import pcImg from "../../../../public/pc.png";
import printerImg from "../../../../public/printer.png";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await signIn("credentials", {
        redirect: false,
        callbackUrl: "/dashboard",
        email,
        password,
      });

      if (result?.ok) {
        toast.success("Login berhasil! Selamat datang kembali.");
        router.replace(result.url ?? "/");
        router.refresh();
        return;
      }

      toast.error("Email atau password kamu salah.");
    } catch (err) {
      toast.error("Terjadi kesalahan saat login. Coba lagi nanti.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left brand / hero section */}
      <div className="relative hidden lg:flex flex-col p-10 text-primary-foreground bg-gradient-to-br from-primary to-emerald-700">
        <div
          className={cn(
            "pointer-events-none absolute inset-0 opacity-20",
            "bg-[radial-gradient(800px_400px_at_0%_0%,rgba(255,255,255,0.2),transparent),radial-gradient(600px_300px_at_100%_100%,rgba(255,255,255,0.15),transparent)]"
          )}
        />

        <div className="relative z-10 flex items-center gap-3">
          <Image
            width={40}
            height={40}
            src={logo}
            alt="Logo"
            className="rounded-md border border-white/20"
            priority
          />
          <span className="text-lg font-semibold tracking-tight">Datek MIS</span>
        </div>

        {/* Center image grid */}
        <div className="relative z-10 flex-1 flex items-center justify-center">
          <div className="grid grid-cols-2 gap-6">
            <div className="rounded-xl border border-white/20 bg-white/10 backdrop-blur p-3">
              <Image
                src={laptopImg}
                alt="Laptop"
                width={140}
                height={140}
                className="rounded-lg object-contain drop-shadow-xl"
                priority
              />
            </div>
            <div className="rounded-xl border border-white/20 bg-white/10 backdrop-blur p-3">
              <Image
                src={nucImg}
                alt="Intel NUC"
                width={140}
                height={140}
                className="rounded-lg object-contain drop-shadow-xl"
                priority
              />
            </div>
            <div className="rounded-xl border border-white/20 bg-white/10 backdrop-blur p-3">
              <Image
                src={pcImg}
                alt="PC"
                width={140}
                height={140}
                className="rounded-lg object-contain drop-shadow-xl"
                priority
              />
            </div>
            <div className="rounded-xl border border-white/20 bg-white/10 backdrop-blur p-3">
              <Image
                src={printerImg}
                alt="Printer"
                width={140}
                height={140}
                className="rounded-lg object-contain drop-shadow-xl"
                priority
              />
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-auto">
          <h1 className="text-4xl font-bold leading-tight">
            Kelola aset dan service records dengan lebih rapi
          </h1>
          <p className="mt-3 text-white/80 max-w-md">
            Portal internal untuk manajemen data center, penugasan aset, dan histori
            perawatan. Akses aman, cepat, dan terintegrasi.
          </p>
        </div>
      </div>

      {/* Right form section */}
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md animate-in fade-in-0 zoom-in-95 duration-300">
          <Card className="w-full shadow-lg">
            <CardHeader className="items-center space-y-4 pt-8">
              <Image
                width={96}
                height={96}
                src={logo}
                alt="Company Logo"
                className="mx-auto rounded-xl border"
                priority
              />
              <div className="text-center">
                <h2 className="text-2xl font-semibold tracking-tight">Masuk</h2>
                <p className="text-sm text-muted-foreground">
                  Gunakan akun yang terdaftar untuk mengakses dashboard
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4" aria-busy={isLoading}>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="m@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="•••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      className="pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isLoading ? "Memproses..." : "Login"}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm text-muted-foreground">
                <p>Belum punya akun? Hubungi admin via WhatsApp.</p>
                <Link
                  className="mt-2 inline-flex items-center gap-2 text-primary underline"
                  href={
                    "https://wa.me/6281396369699?text=Siang%20ndan%2C%20mau%20request%20buat%20akun%20Datek%20nih.."
                  }
                >
                  Hubungi Admin <PhoneCallIcon className="w-4 h-4" />
                </Link>
              </div>
            </CardContent>
          </Card>
          <p className="mt-6 text-center text-xs text-muted-foreground">Developed by WonderKid 🐎</p>
        </div>
      </div>
    </div>
  );
}
