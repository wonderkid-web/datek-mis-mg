"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export const SUPPORTED_LOCALES = ["id", "en"] as const;
export type AppLocale = (typeof SUPPORTED_LOCALES)[number];

const LOCALE_STORAGE_KEY = "datek-locale";
const LOCALE_COOKIE_KEY = "datek-locale";
const DEFAULT_LOCALE: AppLocale = "id";

let lastKnownLocale: AppLocale = DEFAULT_LOCALE;

type TranslationParams = Record<string, string | number>;

const dictionaries = {
  id: {
    common: {
      appName: "Datek Holding",
      language: "Bahasa",
      indonesian: "Indonesia",
      english: "Inggris",
      theme: "Tema",
      profile: "Profile",
      logout: "Keluar",
      save: "Simpan",
      cancel: "Batal",
      loading: "Memuat...",
      retry: "Muat Ulang",
    },
    navbar: {
      menu: "Menu",
      dashboard: "Dashboard",
      employee: "Employee",
      masterData: "Master Data",
      asset: "Asset",
      dataCentre: "Data Centre",
      tracker: "Tracker",
      serviceRecords: "Service Records",
      nav: {
        "/master-data/laptop": "Spesifikasi Laptop/Intel NUC/PC",
        "/master-data/printer": "Spesifikasi Printer",
        "/master-data/cctv": "Spesifikasi CCTV",
        "/master-data/asset-categories": "Asset Categories",
        "/master-data/isp": "ISP",
        "/master-data/call-outgoing-co-group": "Callout Going & PSTN & Trunk",
        "/items/import": "Import Asset",
        "/items/laptop": "Asset Laptop",
        "/items/intel-nuc": "Asset Intel NUC",
        "/items/pc": "Asset PC",
        "/items/printer": "Asset Printer",
        "/items/cctv": "Asset CCTV",
        "/items/akun-telepon": "Akun Telepon",
        "/data-center/assets": "Data Assets",
        "/data-center/assigned-assets": "Assigned Assets",
        "/data-center/ip-address": "IP Address Users",
        "/tracker/laptop": "Tracker Laptop",
        "/tracker/intel-nuc": "Tracker Intel NUC",
        "/tracker/pc": "Tracker PC",
        "/tracker/sparepart": "Tracker Sparepart",
        "/service-records/history": "History",
        "/service-records/computer-maintenance": "Computer Maintenance",
        "/service-records/repetitive": "Printer Maintenance",
        "/service-records/cctv-maintenance": "CCTV Maintenance",
        "/service-records/isp": "ISP Speed Test",
        "/service-records/biling-records": "Biling Records",
        "/service-records/problem-sequence": "Problem Sequence",
        "/service-records/sparepart-tracker": "Sparepart Tracker",
      },
    },
    login: {
      title: "Masuk",
      subtitle: "Gunakan akun yang terdaftar untuk mengakses dashboard",
      heroTitle: "Kelola aset dan service records dengan lebih rapi",
      heroDescription:
        "Portal internal untuk manajemen data center, penugasan aset, dan histori perawatan. Akses aman, cepat, dan terintegrasi.",
      email: "Email",
      password: "Password",
      submit: "Login",
      submitting: "Memproses...",
      noAccount: "Belum punya akun? Hubungi admin via WhatsApp.",
      contactAdmin: "Hubungi Admin",
      showPassword: "Tampilkan password",
      hidePassword: "Sembunyikan password",
      success: "Login berhasil! Selamat datang kembali.",
      invalidCredentials: "Email atau password kamu salah.",
      genericError: "Terjadi kesalahan saat login. Coba lagi nanti.",
    },
    dashboard: {
      errorTitle: "Dashboard gagal dimuat",
      errorDescription:
        "Data agregasi tidak bisa diambil. Coba refresh query dan cek koneksi database.",
      overview: {
        totalAssets: "Total Aset",
        totalAssetsDescription: "Seluruh inventaris yang tercatat di sistem.",
        assignedAssets: "Aset Assigned",
        assignedAssetsDescription:
          "{ratio} dari total aset sudah terhubung ke assignment.",
        unassignedAssets: "Aset Belum Assigned",
        unassignedAssetsDescription:
          "Inventaris yang masih perlu ditindaklanjuti ke user atau unit kerja.",
        ipAddresses: "IP Address",
        ipAddressesDescription:
          "Total IP yang aktif tercatat di master IP address.",
        activeEmployees: "Employee Aktif",
        activeEmployeesDescription:
          "{total} total employee, termasuk nonaktif.",
        phoneAccounts: "Akun Telepon",
        phoneAccountsDescription:
          "{ratio} coverage terhadap employee aktif.",
        problems30Days: "Problem 30 Hari",
        problems30DaysDescription: "Rata-rata SLA penyelesaian {duration}.",
        billingThisMonth: "Billing Bulan Ini",
        billingThisMonthDescription:
          "{count} record panggilan di bulan berjalan.",
      },
      hero: {
        liveSnapshot: "Live Database Snapshot",
        updatedAt: "Update {value}",
        title:
          "Dashboard operasional yang sekarang mengikuti data nyata di sistem.",
        description:
          "Ringkasan ini mengambil langsung inventaris, employee, IP address, billing, problem ticket, service record, maintenance, dan speed test tanpa card hardcoded per OS atau per lokasi yang tidak sinkron.",
        assetCoverage: "Coverage Aset",
        assetCoverageDescription: "Aset yang sudah masuk assignment aktif.",
        ipCoverage: "Coverage IP",
        ipCoverageDescription:
          "Rasio IP address dibanding employee aktif.",
        avgSla: "Avg SLA",
        avgSlaDescription:
          "Rata-rata penanganan ticket dalam 30 hari terakhir.",
      },
      pulse: {
        title: "Pulse jaringan & telepon",
        description: "Indikator yang paling sering dilihat harian.",
        speedTestTitle: "Speed Test 30 Hari",
        speedTestRecords: "record terbaru tercatat",
        longestProblemTitle: "Longest Problem 30 Hari",
        longestProblemEmpty:
          "Belum ada problem sequence dalam 30 hari terakhir.",
        coverageTitle: "Coverage Telepon",
        coverageDescription:
          "Proporsi akun telepon terhadap employee aktif.",
      },
      sections: {
        assetDistributionTitle: "Distribusi aset per company",
        assetDistributionDescription:
          "Company dihitung dari assignment aktif asset.",
        categoryCompositionTitle: "Komposisi kategori aset",
        categoryCompositionDescription:
          "Breakdown kategori diambil dinamis dari data kategori aktual.",
        companySummaryTitle: "Ringkasan company",
        companySummaryDescription:
          "Gabungan aset assigned, IP, user aktif, dan kategori dominan per company.",
        osSpreadTitle: "Sebaran sistem operasi",
        osSpreadDescription:
          "OS laptop dan Intel NUC digabung tanpa filter value yang hardcoded.",
        latestActivityTitle: "Aktivitas terbaru lintas modul",
        latestActivityDescription:
          "Timeline gabungan problem ticket, service record, billing, dan speed test.",
        topBillingTitle: "Top billing user bulan ini",
        topBillingDescription:
          "User dengan akumulasi cost telepon terbesar di bulan berjalan.",
        recentProblemTitle: "Problem ticket terbaru",
        recentProblemDescription:
          "Ticket paling baru yang tercatat di modul Problem Sequence.",
      },
      table: {
        company: "Company",
        assets: "Aset",
        ip: "IP",
        activeUsers: "User Aktif",
        topCategory: "Top Kategori",
        operatingSystem: "Sistem Operasi",
        percentage: "Persentase",
        noCompanySummary: "Belum ada ringkasan company.",
        noOsData: "Data OS belum tersedia.",
      },
      serviceCards: {
        serviceRecord: "Service Record",
        serviceRecordDescription: "record dalam 30 hari terakhir",
        computerMaintenance: "Computer Maintenance",
        computerMaintenanceDescription: "pemeriksaan komputer 30 hari",
        printerMaintenance: "Printer Maintenance",
        printerMaintenanceDescription: "maintenance printer 30 hari",
        cctvMaintenance: "CCTV Maintenance",
        cctvMaintenanceDescription: "maintenance CCTV 30 hari",
        ispSpeedTest: "ISP Speed Test",
        ispSpeedTestDescription: "speed test tercatat 30 hari",
      },
      activity: {
        noRecentActivity: "Belum ada aktivitas terbaru yang bisa ditampilkan.",
        billingRecords: "{count} record",
        noBillingData: "Belum ada data billing pada bulan berjalan.",
        downSince: "Down sejak {value}",
        noRecentProblem: "Belum ada ticket problem terbaru.",
      },
      dialogs: {
        allAssets: "Semua Aset",
        assignedAssets: "Aset Assigned",
        unassignedAssets: "Aset Belum Assigned",
        allIpAddresses: "Seluruh IP Address",
        assetsInCompany: "Aset di {company}",
        ipInCompany: "IP Address di {company}",
      },
    },
  },
  en: {
    common: {
      appName: "Datek Holding",
      language: "Language",
      indonesian: "Indonesian",
      english: "English",
      theme: "Theme",
      profile: "Profile",
      logout: "Logout",
      save: "Save",
      cancel: "Cancel",
      loading: "Loading...",
      retry: "Reload",
    },
    navbar: {
      menu: "Menu",
      dashboard: "Dashboard",
      employee: "Employee",
      masterData: "Master Data",
      asset: "Asset",
      dataCentre: "Data Centre",
      tracker: "Tracker",
      serviceRecords: "Service Records",
      nav: {
        "/master-data/laptop": "Laptop/Intel NUC/PC Specifications",
        "/master-data/printer": "Printer Specifications",
        "/master-data/cctv": "CCTV Specifications",
        "/master-data/asset-categories": "Asset Categories",
        "/master-data/isp": "ISP",
        "/master-data/call-outgoing-co-group": "Callout Outgoing & PSTN & Trunk",
        "/items/import": "Import Asset",
        "/items/laptop": "Laptop Asset",
        "/items/intel-nuc": "Intel NUC Asset",
        "/items/pc": "PC Asset",
        "/items/printer": "Printer Asset",
        "/items/cctv": "CCTV Asset",
        "/items/akun-telepon": "Phone Account",
        "/data-center/assets": "Asset Data",
        "/data-center/assigned-assets": "Assigned Assets",
        "/data-center/ip-address": "User IP Addresses",
        "/tracker/laptop": "Laptop Tracker",
        "/tracker/intel-nuc": "Intel NUC Tracker",
        "/tracker/pc": "PC Tracker",
        "/tracker/sparepart": "Sparepart Tracker",
        "/service-records/history": "History",
        "/service-records/computer-maintenance": "Computer Maintenance",
        "/service-records/repetitive": "Printer Maintenance",
        "/service-records/cctv-maintenance": "CCTV Maintenance",
        "/service-records/isp": "ISP Speed Test",
        "/service-records/biling-records": "Billing Records",
        "/service-records/problem-sequence": "Problem Sequence",
        "/service-records/sparepart-tracker": "Sparepart Tracker",
      },
    },
    login: {
      title: "Sign In",
      subtitle: "Use your registered account to access the dashboard",
      heroTitle: "Manage assets and service records more cleanly",
      heroDescription:
        "An internal portal for data center management, asset assignment, and maintenance history. Secure, fast, and integrated access.",
      email: "Email",
      password: "Password",
      submit: "Login",
      submitting: "Processing...",
      noAccount: "Don't have an account yet? Contact the admin via WhatsApp.",
      contactAdmin: "Contact Admin",
      showPassword: "Show password",
      hidePassword: "Hide password",
      success: "Login successful. Welcome back.",
      invalidCredentials: "Your email or password is incorrect.",
      genericError: "Something went wrong while logging in. Please try again later.",
    },
    dashboard: {
      errorTitle: "Failed to load dashboard",
      errorDescription:
        "Aggregate data could not be fetched. Refresh the query and check the database connection.",
      overview: {
        totalAssets: "Total Assets",
        totalAssetsDescription: "All inventory recorded in the system.",
        assignedAssets: "Assigned Assets",
        assignedAssetsDescription:
          "{ratio} of total assets are already connected to an assignment.",
        unassignedAssets: "Unassigned Assets",
        unassignedAssetsDescription:
          "Inventory that still needs follow-up to a user or business unit.",
        ipAddresses: "IP Addresses",
        ipAddressesDescription:
          "Total active IPs recorded in the IP address master.",
        activeEmployees: "Active Employees",
        activeEmployeesDescription:
          "{total} total employees, including inactive ones.",
        phoneAccounts: "Phone Accounts",
        phoneAccountsDescription:
          "{ratio} coverage against active employees.",
        problems30Days: "Problems in 30 Days",
        problems30DaysDescription: "Average resolution SLA {duration}.",
        billingThisMonth: "Billing This Month",
        billingThisMonthDescription:
          "{count} call records in the current month.",
      },
      hero: {
        liveSnapshot: "Live Database Snapshot",
        updatedAt: "Updated {value}",
        title:
          "An operational dashboard that now follows the real data in the system.",
        description:
          "This summary pulls inventory, employees, IP addresses, billing, problem tickets, service records, maintenance, and speed tests directly without hardcoded cards per OS or location that fall out of sync.",
        assetCoverage: "Asset Coverage",
        assetCoverageDescription: "Assets that are already in active assignments.",
        ipCoverage: "IP Coverage",
        ipCoverageDescription:
          "IP address ratio compared with active employees.",
        avgSla: "Avg SLA",
        avgSlaDescription:
          "Average ticket handling time over the last 30 days.",
      },
      pulse: {
        title: "Network & phone pulse",
        description: "Indicators most frequently checked every day.",
        speedTestTitle: "30-Day Speed Test",
        speedTestRecords: "recent records captured",
        longestProblemTitle: "Longest Problem in 30 Days",
        longestProblemEmpty:
          "No problem sequences have been recorded in the last 30 days.",
        coverageTitle: "Phone Coverage",
        coverageDescription:
          "Phone account proportion compared with active employees.",
      },
      sections: {
        assetDistributionTitle: "Asset distribution by company",
        assetDistributionDescription:
          "Company is calculated from active asset assignments.",
        categoryCompositionTitle: "Asset category composition",
        categoryCompositionDescription:
          "The category breakdown is pulled dynamically from actual category data.",
        companySummaryTitle: "Company summary",
        companySummaryDescription:
          "Combined assigned assets, IPs, active users, and top categories per company.",
        osSpreadTitle: "Operating system spread",
        osSpreadDescription:
          "Laptop and Intel NUC OS are combined without hardcoded value filters.",
        latestActivityTitle: "Latest cross-module activity",
        latestActivityDescription:
          "Combined timeline of problem tickets, service records, billing, and speed tests.",
        topBillingTitle: "Top billing users this month",
        topBillingDescription:
          "Users with the highest accumulated phone cost in the current month.",
        recentProblemTitle: "Latest problem tickets",
        recentProblemDescription:
          "Newest tickets recorded in the Problem Sequence module.",
      },
      table: {
        company: "Company",
        assets: "Assets",
        ip: "IP",
        activeUsers: "Active Users",
        topCategory: "Top Category",
        operatingSystem: "Operating System",
        percentage: "Percentage",
        noCompanySummary: "No company summary is available yet.",
        noOsData: "OS data is not available yet.",
      },
      serviceCards: {
        serviceRecord: "Service Records",
        serviceRecordDescription: "records in the last 30 days",
        computerMaintenance: "Computer Maintenance",
        computerMaintenanceDescription: "computer checks in 30 days",
        printerMaintenance: "Printer Maintenance",
        printerMaintenanceDescription: "printer maintenance in 30 days",
        cctvMaintenance: "CCTV Maintenance",
        cctvMaintenanceDescription: "CCTV maintenance in 30 days",
        ispSpeedTest: "ISP Speed Test",
        ispSpeedTestDescription: "speed tests logged in 30 days",
      },
      activity: {
        noRecentActivity: "There is no recent activity to display yet.",
        billingRecords: "{count} records",
        noBillingData: "No billing data is available for the current month.",
        downSince: "Down since {value}",
        noRecentProblem: "There are no recent problem tickets yet.",
      },
      dialogs: {
        allAssets: "All Assets",
        assignedAssets: "Assigned Assets",
        unassignedAssets: "Unassigned Assets",
        allIpAddresses: "All IP Addresses",
        assetsInCompany: "Assets in {company}",
        ipInCompany: "IP addresses in {company}",
      },
    },
  },
} as const;

type Dictionary = (typeof dictionaries)[AppLocale];

type LanguageContextValue = {
  locale: AppLocale;
  setLocale: (locale: AppLocale) => void;
  t: (key: string, params?: TranslationParams) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function isSupportedLocale(value: string | null | undefined): value is AppLocale {
  return SUPPORTED_LOCALES.includes(value as AppLocale);
}

function resolveLocale(value: string | null | undefined): AppLocale {
  return isSupportedLocale(value) ? value : DEFAULT_LOCALE;
}

function getNestedValue(dictionary: Dictionary, key: string): string | undefined {
  const value = key.split(".").reduce<unknown>((current, segment) => {
    if (!current || typeof current !== "object" || !(segment in current)) {
      return undefined;
    }
    return (current as Record<string, unknown>)[segment];
  }, dictionary);

  return typeof value === "string" ? value : undefined;
}

function interpolate(template: string, params?: TranslationParams) {
  if (!params) {
    return template;
  }

  return template.replace(/\{(\w+)\}/g, (_, key) => String(params[key] ?? `{${key}}`));
}

function readLocaleFromStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  return resolveLocale(window.localStorage.getItem(LOCALE_STORAGE_KEY));
}

interface LanguageProviderProps {
  children: React.ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [locale, setLocaleState] = useState<AppLocale>(lastKnownLocale);
  const [hasLoadedStoredLocale, setHasLoadedStoredLocale] = useState(false);

  useEffect(() => {
    const storedLocale = readLocaleFromStorage();
    if (storedLocale) {
      lastKnownLocale = storedLocale;
      setLocaleState(storedLocale);
    }
    setHasLoadedStoredLocale(true);
  }, []);

  useEffect(() => {
    if (!hasLoadedStoredLocale) {
      return;
    }

    lastKnownLocale = locale;
    document.documentElement.lang = locale;
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    document.cookie = `${LOCALE_COOKIE_KEY}=${locale}; path=/; max-age=31536000; samesite=lax`;
  }, [hasLoadedStoredLocale, locale]);

  const setLocale = useCallback((nextLocale: AppLocale) => {
    setLocaleState(nextLocale);
  }, []);

  const t = useCallback(
    (key: string, params?: TranslationParams) => {
      const dictionary = dictionaries[locale];
      const fallback = getNestedValue(dictionaries[DEFAULT_LOCALE], key) ?? key;
      const translated = getNestedValue(dictionary, key) ?? fallback;
      return interpolate(translated, params);
    },
    [locale]
  );

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t,
    }),
    [locale, setLocale, t]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useI18n() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useI18n must be used inside LanguageProvider");
  }
  return context;
}
