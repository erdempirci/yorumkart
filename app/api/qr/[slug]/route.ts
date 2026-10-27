import QRCode from "qrcode";
import { one } from "@/lib/db";
import { baseUrl } from "@/lib/util";

export const runtime = "nodejs";

export async function GET(req: Request, { params }: { params: { slug: string } }) {
  const b = await one<{ slug: string }>("SELECT slug FROM businesses WHERE slug = ?", [params.slug]);
  if (!b) return new Response("Bulunamadı", { status: 404 });
  const u = new URL(req.url);
  const url = `${baseUrl()}/r/${b.slug}?k=qr`;
  const download = u.searchParams.has("download");
  const disp = (ext: string): Record<string, string> => (download ? { "Content-Disposition": `attachment; filename="yorum-qr-${b.slug}.${ext}"` } : {});

  if (u.searchParams.get("format") === "svg") {
    const svg = await QRCode.toString(url, { type: "svg", margin: 2, errorCorrectionLevel: "M" });
    return new Response(svg, { headers: { "Content-Type": "image/svg+xml", ...disp("svg") } });
  }
  const size = Math.min(2000, Math.max(200, Number(u.searchParams.get("size")) || 420));
  const png = await QRCode.toBuffer(url, { width: size, margin: 2, errorCorrectionLevel: "M" });
  return new Response(new Uint8Array(png), { headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=3600", ...disp("png") } });
}
