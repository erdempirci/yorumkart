import { requireBusiness } from "@/lib/auth";
import { query } from "@/lib/db";
import { fmtDate } from "@/lib/util";
import { RequestForm } from "@/components/request-form";

export const dynamic = "force-dynamic";

type Req = { id: number; customer_name: string | null; phone_last4: string | null; created_at: string; opened_at: string | null; clicked_at: string | null };

export default async function Istekler() {
  const b = await requireBusiness();
  const rows = await query<Req>(
    "SELECT id, customer_name, phone_last4, created_at, opened_at, clicked_at FROM requests WHERE business_id = ? ORDER BY id DESC LIMIT 100",
    [b.id],
  );
  return (
    <div className="two">
      <div className="card">
        <h2>WhatsApp ile yorum iste</h2>
        <RequestForm disabled={!b.google_url} />
      </div>
      <div className="card">
        <h2>Gönderilen istekler</h2>
        {rows.length === 0 ? (
          <div className="empty">Henüz istek göndermediniz.</div>
        ) : (
          <table>
            <thead><tr><th>Müşteri</th><th>Tarih</th><th>Durum</th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.customer_name || "—"}<div className="small muted">•••• {r.phone_last4}</div></td>
                  <td className="small">{fmtDate(r.created_at)}</td>
                  <td>
                    {r.clicked_at ? <span className="tag g">Google&apos;a geçti</span> : r.opened_at ? <span className="tag y">Açtı</span> : <span className="tag">Gönderildi</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
