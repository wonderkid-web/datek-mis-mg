import { COMPANIES } from "./constants";

export const UNKNOWN_ASSET_LOCATION = "Lokasi Asset Tidak Dikenali";

const ASSET_NUMBER_CODE_ALIASES: Record<string, string> = {
  // Nomor asset lama memakai ISAR, sedangkan master company memakai ISR.
  ISAR: "ISR",
};

const companyByCode = new Map(
  COMPANIES.map((company) => [company.type.toUpperCase(), company.description])
);

export function getAssetLocationCode(assetNumber: string | null | undefined) {
  const segments = assetNumber?.trim().toUpperCase().split("-");
  const rawCode = segments && segments.length >= 3 ? segments[1] : undefined;

  if (!rawCode) return null;

  const canonicalCode = ASSET_NUMBER_CODE_ALIASES[rawCode] ?? rawCode;
  return companyByCode.has(canonicalCode) ? canonicalCode : null;
}

export function resolveAssetLocationCompany(
  assetNumber: string | null | undefined
) {
  const code = getAssetLocationCode(assetNumber);
  return code
    ? companyByCode.get(code) ?? UNKNOWN_ASSET_LOCATION
    : UNKNOWN_ASSET_LOCATION;
}

export function getAssetLocationCodesForCompany(company: string) {
  const canonicalCodes = COMPANIES.filter(
    (item) => item.description === company
  ).map((item) => item.type.toUpperCase());
  const aliasCodes = Object.entries(ASSET_NUMBER_CODE_ALIASES)
    .filter(([, canonicalCode]) => canonicalCodes.includes(canonicalCode))
    .map(([aliasCode]) => aliasCode);

  return [...new Set([...canonicalCodes, ...aliasCodes])];
}

export const KNOWN_ASSET_LOCATION_CODES = [
  ...new Set([
    ...COMPANIES.map((company) => company.type.toUpperCase()),
    ...Object.keys(ASSET_NUMBER_CODE_ALIASES),
  ]),
];
