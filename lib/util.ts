import { randomBytes } from "crypto";

export function baseUrl() {
  // BASE_URL sunucu tarafında çalışma anında okunur (NEXT_PUBLIC_* derleme anında gömülür).
  return (process.env.BASE_URL || "http://localhost:3000").replace(/\/$/, "");
}

const TR: Record<string, string> = { ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u", İ: "i" };

export function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[çğıöşüİ]/g, (c) => TR[c] ?? c)
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "isletme";
}

export function token(n = 8) {
  return randomBytes(n).toString("base64url");
}

/** Google yorum bağlantısı: tam URL ya da Place ID kabul eder. */
export function googleReviewUrl(input: string | null): string | null {
  if (!input) return null;
  const v = input.trim();
  if (!v) return null;
  if (/^https?:\/\//i.test(v)) return v;
  if (/^[A-Za-z0-9_-]{20,}$/.test(v)) return `https://search.google.com/local/writereview?placeid=${encodeURIComponent(v)}`;
  return null;
}

/** Türkiye cep numarasını wa.me biçimine çevirir: 05xx... -> 905xx... */
export function normalizeTrPhone(raw: string): string | null {
  let d = raw.replace(/\D/g, "");
  if (d.startsWith("0090")) d = d.slice(2);
  if (d.startsWith("0")) d = "9" + d;
  if (d.length === 10 && d.startsWith("5")) d = "90" + d;
  return /^905\d{9}$/.test(d) ? d : null;
}

export const DEFAULT_TEMPLATE =
  "Merhaba {ad}, bugün bizi tercih ettiğiniz için teşekkür ederiz! Deneyiminizi birkaç saniyede paylaşırsanız çok seviniriz: {link}\n{isletme}";

export function fillTemplate(t: string, vars: Record<string, string>) {
  return t.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");
}

export function fmtDate(sqlite: string) {
  const d = new Date(sqlite.replace(" ", "T") + "Z");
  return d.toLocaleString("tr-TR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Istanbul" });
}
