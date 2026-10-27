import { NextResponse } from "next/server";
import { one, run, DEMO_SLUG, type Business } from "@/lib/db";
import { isBot, sourceOf } from "@/lib/track";

export async function GET(req: Request, { params }: { params: { slug: string } }) {
  const b = await one<Business>("SELECT * FROM businesses WHERE slug = ?", [params.slug]);
  if (!b) return NextResponse.redirect(new URL("/", req.url), 302);
  const u = new URL(req.url);
  if (b.slug === DEMO_SLUG) return NextResponse.redirect(new URL(`/r/${b.slug}?demo=google`, req.url), 302);
  if (!b.google_url) return NextResponse.redirect(new URL(`/r/${b.slug}`, req.url), 302);

  const t = u.searchParams.get("t")?.slice(0, 32) ?? null;
  if (!isBot(req.headers.get("user-agent"))) {
    await run("INSERT INTO events (business_id, type, source) VALUES (?, 'google_click', ?)", [b.id, sourceOf(u.searchParams.get("k"), t)]);
    if (t) await run("UPDATE requests SET clicked_at = COALESCE(clicked_at, datetime('now')) WHERE token = ? AND business_id = ?", [t, b.id]);
  }
  return NextResponse.redirect(b.google_url, 302);
}
