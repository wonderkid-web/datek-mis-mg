import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatMacAddress(value: string): string {
  const hex = value.replace(/[^0-9a-fA-F]/g, "").slice(0, 12);
  const pairs = hex.match(/.{1,2}/g) ?? [];
  return pairs.join(":").toUpperCase();
}

export function isValidMacAddress(value: string): boolean {
  return /^[0-9A-F]{2}(:[0-9A-F]{2}){5}$/.test(value);
}
