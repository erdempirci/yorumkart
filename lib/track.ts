import { headers } from "next/headers";

// WhatsApp, Facebook vb. bağlantı önizleme botları sayfayı açar; bunları sayma.
const BOT = /bot|crawl|spider|preview|whatsapp|facebookexternalhit|telegram|slack|discord|curl|wget|headless/i;

export function isBot(ua?: string | null) {
  const v = ua ?? headers().get("user-agent") ?? "";
  return !v || BOT.test(v);
}

export function sourceOf(k?: string | null, t?: string | null) {
  if (t) return "whatsapp";
  if (k === "qr" || k === "nfc") return k;
  return "link";
}
