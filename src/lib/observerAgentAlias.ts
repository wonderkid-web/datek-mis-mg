// Alias device Observer Agent memakai konvensi "Nama - Departemen - Perusahaan".
// Kalau bagian perusahaan tidak ditulis (contoh "Yolanda - ACC"), device itu
// dianggap milik Holding.

export const HOLDING_COMPANY_CODE = "HOLDING";
export const UNKNOWN_COMPANY_CODE = "UNKNOWN";
export const ALL_COMPANY_VALUE = "all";

export type ParsedObserverAlias = {
  raw: string | null;
  userName: string | null;
  department: string | null;
  companyCode: string;
  companyLabel: string;
};

const UNKNOWN_ALIAS: ParsedObserverAlias = {
  raw: null,
  userName: null,
  department: null,
  companyCode: UNKNOWN_COMPANY_CODE,
  companyLabel: "Tanpa perusahaan",
};

export function parseObserverAgentAlias(
  alias: string | null | undefined
): ParsedObserverAlias {
  const raw = alias?.trim() || null;
  const parts =
    raw
      ?.split("-")
      .map((part) => part.trim())
      .filter(Boolean) ?? [];

  if (!parts.length) return UNKNOWN_ALIAS;

  // Kurang dari 3 bagian berarti perusahaan tidak ditulis => Holding.
  if (parts.length < 3) {
    return {
      raw,
      userName: parts[0],
      department: parts[1] ?? null,
      companyCode: HOLDING_COMPANY_CODE,
      companyLabel: "Holding",
    };
  }

  const companyCode = parts[parts.length - 1].toUpperCase();

  return {
    raw,
    userName: parts[0],
    // Sisa bagian tengah digabung supaya alias 4 bagian tidak kehilangan info.
    department: parts.slice(1, -1).join(" - "),
    companyCode,
    companyLabel: companyCode,
  };
}

export function getObserverAliasCompanyLabel(companyCode: string) {
  if (companyCode === HOLDING_COMPANY_CODE) return "Holding";
  if (companyCode === UNKNOWN_COMPANY_CODE) return "Tanpa perusahaan";
  return companyCode;
}

// Holding di atas, device tanpa alias di paling bawah, sisanya alfabetis.
export function compareObserverCompanyCode(a: string, b: string) {
  const weight = (code: string) =>
    code === HOLDING_COMPANY_CODE ? 0 : code === UNKNOWN_COMPANY_CODE ? 2 : 1;

  const diff = weight(a) - weight(b);
  return diff !== 0 ? diff : a.localeCompare(b);
}
