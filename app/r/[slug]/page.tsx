import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { one, run, DEMO_SLUG, type Business } from "@/lib/db";
import { isBot, sourceOf } from "@/lib/track";
import { FeedbackForm } from "@/components/feedback-form";

export const dynamic = "force-dynamic";

type Props = { params: { slug: string }; searchParams: { t?: string; k?: string; demo?: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const b = await one<Business>("SELECT name FROM businesses WHERE slug = ?", [params.slug]);
  return { title: b ? `${b.name} — Deneyiminizi paylaşın` : "Bulunamadı", robots: { index: false } };
}

export default async function ReviewPage({ params, searchParams }: Props) {
  const b = await one<Business>("SELECT * FROM businesses WHERE slug = ?", [params.slug]);
  if (!b) notFound();
  const t = searchParams.t?.slice(0, 32);
  const k = searchParams.k?.slice(0, 10);

  if (!isBot() && !searchParams.demo) {
    await run("INSERT INTO events (business_id, type, source) VALUES (?, 'view', ?)", [b.id, sourceOf(k, t)]);
    if (t) await run("UPDATE requests SET opened_at = COALESCE(opened_at, datetime('now')) WHERE token = ? AND business_id = ?", [t, b.id]);
  }

  const isDemo = b.slug === DEMO_SLUG;
  const q = new URLSearchParams();
  if (t) q.set("t", t);
  if (k) q.set("k", k);
  const goHref = `/r/${b.slug}/go${q.toString() ? `?${q}` : ""}`;
  const initial = b.name.trim().charAt(0).toLocaleUpperCase("tr-TR");

  return (
    <main className="rv" style={{ ["--brand" as string]: b.color }}>
      <div className="rv-head" style={{ background: b.color }}>
        <div className="avatar">{initial}</div>
        <h1 style={{ fontSize: "1.5rem", marginBottom: 4 }}>{b.name}</h1>
        <div style={{ opacity: 0.9 }}>Bizi tercih ettiğiniz için teşekkürler!</div>
      </div>
      <div className="rv-body stack">
        {searchParams.demo === "google" && (
          <div className="msg ok">Demo: Gerçek işletmede bu noktada müşterinin telefonunda Google yorum ekranı açılır.</div>
        )}
        <div className="card" style={{ textAlign: "center" }}>
          <div className="stars" aria-hidden>★★★★★</div>
          <p style={{ margin: "8px 0 16px" }}>Deneyiminizi Google&apos;da paylaşmanız başkalarının bizi bulmasına çok yardımcı olur. Yalnızca birkaç saniye sürer.</p>
          {b.google_url || isDemo ? (
            <a className="btn big block" href={goHref} style={{ background: b.color }}>Google&apos;da yorum yaz</a>
          ) : (
            <div className="msg err">Bu işletme henüz Google bağlantısını eklemedi.</div>
          )}
        </div>
        <details className="private">
          <summary>Yalnızca işletmeye iletmek istediğiniz bir not mu var?</summary>
          <div className="card">
            <FeedbackForm slug={b.slug} t={t} />
          </div>
        </details>
        <p className="small muted" style={{ textAlign: "center" }}>
          Google&apos;da her türlü yorumu yazabilirsiniz. Bu sayfa yorum karşılığında hediye veya indirim sunmaz.
        </p>
      </div>
    </main>
  );
}
