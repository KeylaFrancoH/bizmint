import { CURRENCY_LOCALE } from "../types";
import { parseLocalDate } from "./finance";

export function formatMoney(amount: number, currency: string): string {
  const locale = CURRENCY_LOCALE[currency] || "es-EC";
  try {
    return new Intl.NumberFormat(locale, { style: "currency", currency }).format(amount || 0);
  } catch {
    return `${currency} ${(amount || 0).toFixed(2)}`;
  }
}

export function formatDate(iso: string): string {
  return parseLocalDate(iso).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/** Accepts "12,50" the same as "12.50" (some locales show a decimal comma on the numeric keyboard). */
export function parseAmount(str: string): number {
  return parseFloat(String(str).trim().replace(",", "."));
}
