import Link from "next/link";
import { requireBusiness } from "@/lib/auth";
import { query } from "@/lib/db";
import { fmtDate } from "@/lib/util";
import { RequestForm } from "@/components/request-form";

export const dynamic = "force-dynamic";

type Count = { type: string; n: number };
type Fb = { id: number; message: string; contact: string | null; created_at: string; customer_name: string | null };

export default async function Panel() {
  const b = await requireBusiness();
  const counts = await query<Count>(
    "SELECT type, COUNT(*) AS n FROM events WHERE business_id = ? AND created_at >= datetime('now', '-30 days') GROUP BY type",
    [b.id],
  );
  const c = (t: string) => Number(counts.find((x) => x.type === t)?.n ?? 0);
  const views = c("view"), clicks = c("google_click"), fb = c("feedback"), sent = c("request_sent");
  const rate = views ? Math.round((clicks / views) * 100) : 0;
  const sources = await query<{ source: string; n: number }>(
    "SELECT source, COUNT(*) AS n FROM events WHERE business_id = ? AND type = 'view' AND created_at >= datetime('now', '-30 days') GROUP BY source",
    [b.id],
  );
  const srcLabel: Record<string, string> = { qr: "QR", nfc: "NFC", whatsapp: "WhatsApp", link: "Bağlantı" };
  const feedback = await query<Fb>(
    `SELECT f.id, f.message, f.contact, f.created_at, r.customer_name FROM feedback f
     LEFT JOIN requests r ON r.id = f.request_id WHERE f.business_id = ? ORDER BY f.id DESC LIMIT 8`,
    [b.id],
  );

  return (
    <div className="grid">
      {!b.google_url && (
        <div className="card" style={{ borderColor: "var(--accent)" }}>
          <h2>Kurulumu tamamlayın</h2>
          <p className="muted">Google yorum bağlantınızı ekleyin; QR kodunuz ve WhatsApp mesajlarınız hazır olsun.</p>
          <Link className="btn" href="/panel/ayarlar">Ayarlara git</Link>
        </div>
      )}

      <div>
        <p className="small muted" style={{ marginBottom: 8 }}>Son 30 gün</p>
        <div className="stats">
          <div className="stat"><div className="n">{views}</div><div className="l">Yorum sayfası açıldı</div></div>
          <div className="stat"><div className="n">{clicks}</div><div className="l">Google&apos;a yönlendi ({rate}%)</div></div>
          <div className="stat"><div className="n">{sent}</div><div className="l">WhatsApp isteği</div></div>
          <div className="stat"><div className="n">{fb}</div><div className="l">Özel geri bildirim</div></div>
        </div>
        {sources.length > 0 && (
          <p className="small muted" style={{ marginTop: 8 }}>
            Ziyaret kaynağı: {sources.map((x) => `${srcLabel[x.source] ?? x.source} ${x.n}`).join(" · ")}
          </p>
        )}
      </div>

      <div className="two">
        <div className="card">
          <h2>Hızlı yorum iste</h2>
          <p className="muted small">Müşteri çıkarken numarasını yazın, mesaj hazır gelsin.</p>
          <RequestForm disabled={!b.google_url} />
        </div>
        <div className="card">
          <h2>Size özel notlar</h2>
          {feedback.length === 0 ? (
            <div className="empty">Henüz not yok. Mutsuz bir müşteri olursa önce burada görürsünüz.</div>
          ) : (
            <div className="stack">
              {feedback.map((f) => (
                <div key={f.id} className="fb">
                  <div>{f.message}</div>
                  <div className="small muted">
                    {fmtDate(f.created_at)}{f.customer_name ? ` · ${f.customer_name}` : ""}{f.contact ? ` · İletişim: ${f.contact}` : ""}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
