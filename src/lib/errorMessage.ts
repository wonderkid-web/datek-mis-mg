type ErrorWithMessage = {
  message?: string;
};

type PrismaLikeError = ErrorWithMessage & {
  code?: string;
  meta?: {
    target?: string[] | string;
  };
};

function normalizeTargets(target: PrismaLikeError["meta"]) {
  const rawTarget = target?.target;

  if (Array.isArray(rawTarget)) {
    return rawTarget.map((value) => String(value).toLowerCase());
  }

  if (typeof rawTarget === "string") {
    return [rawTarget.toLowerCase()];
  }

  return [];
}

export function getErrorMessage(
  error: unknown,
  fallback = "Terjadi kesalahan."
) {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  if (typeof error === "string" && error.trim()) {
    return error;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as ErrorWithMessage).message === "string" &&
    (error as ErrorWithMessage).message?.trim()
  ) {
    return (error as ErrorWithMessage).message as string;
  }

  return fallback;
}

export function getUserFacingAssetError(
  error: unknown,
  fallback = "Gagal memproses data asset."
) {
  const prismaError = error as PrismaLikeError;
  const code = prismaError?.code;
  const targets = normalizeTargets(prismaError?.meta);

  if (code === "P2002") {
    if (targets.some((target) => target.includes("nomorseri") || target.includes("nomor_seri"))) {
      return "Nomor seri sudah terdaftar.";
    }

    if (
      targets.some(
        (target) =>
          target.includes("maclan") ||
          target.includes("mac_lan") ||
          target.includes("macwlan") ||
          target.includes("mac_wlan")
      )
    ) {
      return "MAC address sudah terdaftar.";
    }

    if (targets.some((target) => target.includes("email"))) {
      return "Email office account sudah terdaftar.";
    }

    return "Data yang sama sudah ada. Cek nomor seri, MAC address, atau email office.";
  }

  if (code === "P2003" || code === "P2025") {
    return "Master data yang dipilih tidak ditemukan atau sudah dihapus. Cek kategori, brand, model, dan spesifikasi lalu coba lagi.";
  }

  return getErrorMessage(error, fallback);
}
