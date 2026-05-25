type ParsedSemver = {
  major: number;
  minor: number;
  patch: number;
  prerelease: string[];
};

const SEMVER_REGEX =
  /^v?(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([0-9A-Za-z.-]+))?(?:\+[0-9A-Za-z.-]+)?$/;

function parseSemver(input: string | null | undefined): ParsedSemver | null {
  if (!input) return null;

  const value = input.trim();
  if (!value) return null;

  const match = value.match(SEMVER_REGEX);
  if (!match) return null;

  const prerelease = match[4]
    ? match[4].split(".").filter((chunk) => chunk.length > 0)
    : [];

  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
    prerelease,
  };
}

function comparePrereleaseIdentifier(a: string, b: string) {
  const aIsNumeric = /^\d+$/.test(a);
  const bIsNumeric = /^\d+$/.test(b);

  if (aIsNumeric && bIsNumeric) {
    return Number(a) - Number(b);
  }

  if (aIsNumeric && !bIsNumeric) return -1;
  if (!aIsNumeric && bIsNumeric) return 1;

  return a.localeCompare(b);
}

export function compareSemver(
  leftInput: string | null | undefined,
  rightInput: string | null | undefined
) {
  const left = parseSemver(leftInput);
  const right = parseSemver(rightInput);

  if (!left || !right) return null;

  if (left.major !== right.major) return left.major - right.major;
  if (left.minor !== right.minor) return left.minor - right.minor;
  if (left.patch !== right.patch) return left.patch - right.patch;

  const leftPre = left.prerelease;
  const rightPre = right.prerelease;

  if (leftPre.length === 0 && rightPre.length === 0) return 0;
  if (leftPre.length === 0) return 1;
  if (rightPre.length === 0) return -1;

  const longest = Math.max(leftPre.length, rightPre.length);
  for (let i = 0; i < longest; i += 1) {
    const leftId = leftPre[i];
    const rightId = rightPre[i];

    if (leftId === undefined) return -1;
    if (rightId === undefined) return 1;

    const cmp = comparePrereleaseIdentifier(leftId, rightId);
    if (cmp !== 0) return cmp;
  }

  return 0;
}
