import { requireBusiness } from "@/lib/auth";
import { saveSettings } from "@/app/actions";
import { ActionForm, Submit } from "@/components/forms";
import { baseUrl, DEFAULT_TEMPLATE } from "@/lib/util";

export const dynamic = "force-dynamic";

export default async function Ayarlar({ searchParams }: { searchParams: { ilk?: string } }) {
  const b = await requireBusiness();
  const pageUrl = `${baseUrl()}/r/${b.slug}`;
  return (
    <div className="two">
      <div className="card">
        {searchParams.ilk && <div className="msg ok" style={{ marginBottom: 14 }}>Hoş geldiniz! Son adım: Google yorum bağlantınızı ekleyin.</div>}
        <h2>İşletme ayarları</h2>
        <ActionForm action={saveSettings}>
          <div><label htmlFor="name">İşletme adı</label><input id="name" name="name" defaultValue={b.name} required /></div>
          <div>
            <label htmlFor="google_url">Google yorum bağlantısı veya Place ID</label>
            <input id="google_url" name="google_url" defaultValue={b.google_url ?? ""} placeholder="https://g.page/r/.../review" />
            <p className="hint">Google İşletme Profili → Yorumları oku → &quot;Daha fazla yorum alın&quot; → bağlantıyı kopyala. Ya da Place ID yapıştırın.</p>
          </div>
          <div>
            <label htmlFor="wa_template">WhatsApp mesaj şablonu</label>
            <textarea id="wa_template" name="wa_template" defaultValue={b.wa_template ?? DEFAULT_TEMPLATE} />
            <p className="hint">Değişkenler: {"{ad}"} {"{isletme}"} {"{link}"}. İndirim/hediye vaadi eklemeyin; Google bunu yasaklıyor.</p>
          </div>
          <div><label htmlFor="color">Marka rengi</label><input id="color" name="color" type="color" defaultValue={b.color} /></div>
          <Submit>Kaydet</Submit>
        </ActionForm>
      </div>
      <div className="card">
        <h2>QR kod & NFC</h2>
        <div className="qr">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/api/qr/${b.slug}`} alt="Yorum sayfası QR kodu" />
          <div className="stack">
            <div><div className="small muted">Yorum sayfanız</div><a href={`/r/${b.slug}`} target="_blank" rel="noreferrer" style={{ wordBreak: "break-all" }}>{pageUrl}</a></div>
            <div className="row">
              <a className="btn" href={`/api/qr/${b.slug}?format=png&size=1200&download=1`}>PNG indir</a>
              <a className="btn ghost" href={`/api/qr/${b.slug}?format=svg&download=1`}>SVG (baskı)</a>
            </div>
          </div>
        </div>
        <p className="hint" style={{ marginTop: 14 }}>NFC kart/stand için NFC Tools gibi bir uygulamayla karta şu adresi &quot;URL&quot; olarak yazın: <code style={{ wordBreak: "break-all" }}>{pageUrl}?k=nfc</code>. QR kod zaten <code>?k=qr</code> ile gelir; böylece ziyaretlerin kaynağı ayrı kaydedilir.</p>
      </div>
    </div>
  );
}
