import {
  isKnownCompanyName,
  resolveCanonicalCompanyName,
} from "./companyResolver";

const UNKNOWN_COMPANY = "Tanpa Company";

export type AssetCompanySource = {
  category?: { slug?: string | null } | null;
  cctvSpecs?: {
    sbu?: string | null;
    channelCamera?: { sbu?: string | null } | null;
  } | null;
  assignments?: Array<{ user?: { lokasiKantor?: string | null } | null }> | null;
  lokasiFisik?: string | null;
};

const normalizeCompany = (value: string | null | undefined) => {
  const trimmed = resolveCanonicalCompanyName(value)?.trim() ?? value?.trim();
  return trimmed ? trimmed : UNKNOWN_COMPANY;
};

/**
 * Company sebuah asset: CCTV memakai SBU pada spesifikasi/channel camera,
 * selain itu memakai lokasi kantor user yang sedang memegang asset.
 * Mengikuti aturan yang sama dengan perhitungan di dashboard.
 *
 * Untuk asset yang belum di-assign (tidak punya lokasi kantor user), lokasi
 * fisik dipakai sebagai cadangan hanya bila isinya memang nama company.
 */
export function resolveAssetCompanyLabel(asset: AssetCompanySource) {
  if (asset.category?.slug === "cctv") {
    return normalizeCompany(
      asset.cctvSpecs?.sbu ?? asset.cctvSpecs?.channelCamera?.sbu
    );
  }

  const assignedCompany = asset.assignments?.[0]?.user?.lokasiKantor?.trim();
  if (assignedCompany) {
    return normalizeCompany(assignedCompany);
  }

  if (isKnownCompanyName(asset.lokasiFisik)) {
    return normalizeCompany(asset.lokasiFisik);
  }

  return UNKNOWN_COMPANY;
}
