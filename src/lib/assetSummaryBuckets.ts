export const ASSET_SUMMARY_BUCKET_ORDER = [
  "laptop",
  "intel-nuc",
  "other",
] as const;

export type AssetSummaryBucketKey = (typeof ASSET_SUMMARY_BUCKET_ORDER)[number];

export const ASSET_SUMMARY_PRIMARY_CATEGORY_SLUGS = [
  "laptop",
  "intel-nuc",
] as const;

export function isAssetSummaryBucketKey(
  value: string | null | undefined
): value is AssetSummaryBucketKey {
  return ASSET_SUMMARY_BUCKET_ORDER.includes(value as AssetSummaryBucketKey);
}

export function resolveAssetSummaryBucketKey(
  categorySlug: string | null | undefined
): AssetSummaryBucketKey {
  if (categorySlug === "laptop") {
    return "laptop";
  }

  if (categorySlug === "intel-nuc") {
    return "intel-nuc";
  }

  return "other";
}
