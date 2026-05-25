import { COMPANIES } from "@/lib/constants";

const COMPANY_GROUP_LABEL = "PT Intan Sejati Andalan (Group)";
const ISA_PREFIX = "PT Intan Sejati Andalan";

const normalizeToken = (value: string) =>
  value
    .trim()
    .replace(/\s*-\s*/g, "_")
    .replace(/[\s()]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toLowerCase();

const companyNameByNormalizedKey = new Map<string, string>();

for (const company of COMPANIES) {
  companyNameByNormalizedKey.set(
    normalizeToken(company.description),
    company.description
  );
}

companyNameByNormalizedKey.set(
  normalizeToken(COMPANY_GROUP_LABEL),
  COMPANY_GROUP_LABEL
);

export function resolveCanonicalCompanyName(
  value: string | null | undefined
): string | null {
  const trimmed = value?.trim();
  if (!trimmed) {
    return null;
  }

  return companyNameByNormalizedKey.get(normalizeToken(trimmed)) ?? trimmed;
}

function toUnderscoreVariant(value: string) {
  return value.replace(/\s*-\s*/g, "_").replace(/\s+/g, "_");
}

export function getCompanySearchVariants(value: string | null | undefined) {
  const trimmed = value?.trim();
  const canonical = resolveCanonicalCompanyName(value);
  const variants = new Set<string>();

  if (trimmed) {
    variants.add(trimmed);
  }

  if (canonical) {
    variants.add(canonical);
    variants.add(toUnderscoreVariant(canonical));
  }

  return Array.from(variants);
}

export function isIsaGroupCompany(value: string | null | undefined) {
  const canonical = resolveCanonicalCompanyName(value);
  return canonical === COMPANY_GROUP_LABEL || canonical?.startsWith(ISA_PREFIX) === true;
}

export { COMPANY_GROUP_LABEL };
