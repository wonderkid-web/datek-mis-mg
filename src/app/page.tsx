import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, Clock, Layers, ShieldCheck, Users2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ThemeToggle } from "@/components/ThemeToggle";
import Image from "next/image";
import logo from "../../public/logo.png"

const features = [
  {
    title: "Centralized Asset Tracking",
    description:
      "Pantau semua perangkat operasional dalam satu dashboard terpadu lengkap dengan riwayat kepemilikan dan lokasi.",
    icon: Layers,
  },
  {
    title: "Service Record Digital",
    description:
      "Catat, jadwalkan, dan audit seluruh aktivitas maintenance secara real-time untuk memastikan kesiapan aset.",
    icon: Clock,
  },
  {
    title: "Insight & Reporting",
    description:
      "Ambil keputusan lebih cepat dengan statistik penggunaan, status IP, dan histori layanan yang mudah dianalisis.",
    icon: BarChart3,
  },
  {
    title: "Keamanan Terjamin",
    description:
      "Hak akses terkontrol dan autentikasi modern memastikan hanya tim berwenang yang dapat mengelola data.",
    icon: ShieldCheck,
  },
];

const formatNumber = new Intl.NumberFormat("id-ID");

export default async function LandingPage() {
  const [activeAssetCount, serviceRecordCount] = await Promise.all([
    prisma.assetAssignment.count(),
    prisma.serviceRecord.count(),
  ]);

  const stats = [
    {
      label: "Asset aktif terkelola",
      value: `${formatNumber.format(activeAssetCount)}${activeAssetCount >= 1000 ? "+" : ""}`,
    },
    {
      label: "Service record tersimpan",
      value: `${formatNumber.format(serviceRecordCount)}${serviceRecordCount >= 1000 ? "+" : ""}`,
    },
    { label: "Lokasi operasional", value: "9 kantor" },
  ];

  return (
    <div className="relative flex min-h-screen flex-col bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-50">
      <div className="absolute inset-0 overflow-hidden">
        <div className="pointer-events-none absolute -left-24 top-20 h-72 w-72 rounded-full bg-emerald-400/40 blur-3xl dark:bg-emerald-500/30" />
        <div className="pointer-events-none absolute -right-20 top-40 h-64 w-64 rounded-full bg-sky-300/30 blur-3xl dark:bg-sky-500/20" />
        <div className="pointer-events-none absolute left-1/2 top-96 h-80 w-80 -translate-x-1/2 rounded-full bg-emerald-300/20 blur-3xl dark:bg-emerald-400/10" />
      </div>

      <header className="relative z-10 border-b border-white/10">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
          <div className="flex gap-2 items-center">
            <div className="relative size-12 rounded-md overflow-hidden">
              <Image src={logo} alt="logo" layout="fill" objectFit="cover" />
            </div>
            <Link href="/" className="text-lg font-semibold tracking-wide text-slate-900 transition-colors dark:text-white">
              Datek MIS
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle
              variant="ghost"
              className="text-slate-700 hover:bg-slate-200 hover:text-slate-950 dark:text-slate-200 dark:hover:bg-white/10 dark:hover:text-white"
            />
            <Link
              href="/login"
              className="text-sm font-medium text-slate-700 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white"
            >
              Masuk
            </Link>
            <Button
              asChild
              className="bg-emerald-500 text-slate-900 hover:bg-emerald-400 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400"
            >
              <Link href="/auth/register">Daftar</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex flex-1 flex-col">
        <section className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-6 py-16 text-center">
          <span className="rounded-full border border-emerald-500/20 bg-emerald-100/40 px-4 py-1 text-xs uppercase tracking-[0.3em] text-emerald-700 dark:border-white/10 dark:bg-white/5 dark:text-emerald-200">
            Date Center Management
          </span>
          <h1 className="mt-6 text-4xl font-semibold leading-tight tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl">
            Kendalikan Aset dan Service Record perusahaan dalam satu platform modern
          </h1>
          <p className="mt-6 max-w-3xl text-base text-slate-600 sm:text-lg dark:text-slate-200">
            Datek MIS membantu tim operasional mengelola inventori perangkat, memonitor IP Address, dan mencatat seluruh aktivitas maintenance secara terstruktur.
            Didesain khusus untuk ekosistem Datek Group yang dinamis dan tersebar di berbagai lokasi.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Button
              asChild
              size="lg"
              className="bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
            >
              <Link href="/login" className="flex items-center gap-2">
                Masuk ke Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-slate-300 bg-transparent text-slate-900 hover:bg-slate-100 dark:border-white/40 dark:text-white dark:hover:bg-white/10"
            >
              <Link href="#features">Jelajahi Fitur</Link>
            </Button>
          </div>

          <div className="mt-14 grid w-full gap-6 rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-lg backdrop-blur dark:border-white/10 dark:bg-white/5">
            <div className="grid gap-4 text-left sm:grid-cols-3">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-slate-200 bg-white/90 p-4 transition-colors dark:border-white/10 dark:bg-slate-900/40"
                >
                  <p className="text-sm uppercase tracking-wider text-emerald-700 dark:text-emerald-200/80">
                    {stat.label}
                  </p>
                  <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">{stat.value}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-300">
              *Data agregat berdasarkan laporan internal Datek Holding selama 12 bulan terakhir.
            </p>
          </div>
        </section>

        <section
          id="features"
          className="relative bg-slate-100/70 py-16 transition-colors dark:bg-slate-900/40"
        >
          <div className="mx-auto w-full max-w-6xl px-6">
            <div className="mb-10 flex flex-col gap-3 text-center">
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600 dark:text-emerald-200">
                Fitur Utama
              </span>
              <h2 className="text-3xl font-semibold text-slate-900 dark:text-white sm:text-4xl">
                Mengakomodasi seluruh siklus hidup aset Datek Group
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-300 sm:text-base">
                Dari pencatatan inventori hingga laporan perawatan, semuanya terhubung dan terdokumentasi otomatis.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-slate-100 to-slate-200 p-6 transition hover:border-emerald-400/40 hover:shadow-xl hover:shadow-emerald-500/10 dark:border-white/10 dark:from-slate-900/70 dark:via-slate-900/40 dark:to-slate-800/50"
                >
                  <div className="absolute -right-12 top-1/2 h-28 w-28 -translate-y-1/2 rounded-full bg-emerald-400/20 blur-2xl transition group-hover:bg-emerald-500/20 dark:bg-emerald-500/10" />
                  <feature.icon className="h-10 w-10 text-emerald-600 dark:text-emerald-300" />
                  <h3 className="mt-4 text-xl font-semibold text-slate-900 dark:text-white">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative py-20">
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/80 via-emerald-400/70 to-emerald-300/60 p-10 text-center shadow-xl dark:border-emerald-400/40 dark:bg-gradient-to-br dark:from-slate-950 dark:via-emerald-900/30 dark:to-slate-950">
            <h2 className="text-3xl font-semibold text-slate-900 dark:text-white sm:text-4xl">
              Siap membawa manajemen aset Datek Holding ke level berikutnya?
            </h2>
            <p className="mx-auto max-w-2xl text-base text-slate-800 dark:text-slate-200">
              Dapatkan kendali penuh atas inventori perangkat, jadwal maintenance, dan penugasan IP address tanpa spreadsheet yang rumit.
              Tim kami siap membantu implementasi.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button
                asChild
                size="lg"
                className="bg-slate-900 text-white hover:bg-slate-800"
              >
                <Link href="/auth/register" className="flex items-center gap-2">
                  Mulai Onboarding
                  <Users2 className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-slate-900/50 bg-transparent text-slate-900 hover:bg-slate-900/10 dark:border-emerald-400/40 dark:bg-transparent dark:text-emerald-100 dark:hover:bg-emerald-500/20"
              >
                <Link href="/login">Masuk sebagai Admin</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-slate-200 bg-slate-100/70 py-6 transition-colors dark:border-white/10 dark:bg-slate-950/70">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-6 text-center text-xs text-slate-500 sm:flex-row sm:text-left dark:text-slate-400">
          <p>© {new Date().getFullYear()} Developed By WonderKid 🎠. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link className="hover:text-slate-700 dark:hover:text-slate-200" href="/login">
              Masuk
            </Link>
            <Link className="hover:text-slate-700 dark:hover:text-slate-200" href="/auth/register">
              Daftar
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
