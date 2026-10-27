import Link from "next/link";
import { currentBusiness } from "@/lib/auth";

export default async function Home() {
  const b = await currentBusiness();
  return (
    <div className="wrap">
      <header className="top">
        <Link href="/" className="logo"><i>★</i>YorumKart</Link>
        <nav className="nav">
          {b ? <Link href="/panel">Panele git</Link> : <><Link href="/giris">Giriş</Link><Link href="/kayit" className="on">Ücretsiz dene</Link></>}
        </nav>
      </header>

      <section className="hero">
        <div>
          <h1>Memnun müşteriniz var, Google yorumunuz yok mu?</h1>
          <p className="lead">Masadaki QR/NFC kart ve tek tıkla WhatsApp mesajıyla müşterilerinizden Google yorumu isteyin. Şikâyetleri de Google&apos;a düşmeden önce siz görün.</p>
          <div className="row" style={{ maxWidth: 460 }}>
            <Link className="btn big" href="/kayit">14 gün ücretsiz başla</Link>
            <Link className="btn big ghost" href="/r/demo-kafe">Müşteri ekranını gör</Link>
          </div>
          <p className="small muted" style={{ marginTop: 12 }}>Kredi kartı gerekmez · Kurulum 5 dakika</p>
        </div>
        <div className="phone" aria-hidden>
          <div className="screen">
            <div className="rv-head" style={{ background: "#1f6f5c", padding: "26px 16px 30px" }}>
              <div className="avatar" style={{ width: 48, height: 48, fontSize: "1.2rem" }}>D</div>
              <div style={{ fontWeight: 700 }}>Demo Kafe</div>
              <div className="small" style={{ opacity: .85 }}>Ziyaretiniz için teşekkürler!</div>
            </div>
            <div style={{ padding: 16 }} className="stack">
              <div className="card" style={{ textAlign: "center" }}>
                <div className="stars">★★★★★</div>
                <div className="small muted">Deneyiminizi Google&apos;da paylaşın</div>
              </div>
              <div className="btn block">Google&apos;da yorum yaz</div>
              <div className="small muted" style={{ textAlign: "center" }}>İşletmeye özel not bırak</div>
            </div>
          </div>
        </div>
      </section>

      <section className="steps">
        <div className="card"><b>1</b><h3>Kartı masaya koyun</h3><p className="muted">QR/NFC stand müşteriyi doğrudan Google yorum ekranına götürür. Uygulama indirmek gerekmez.</p></div>
        <div className="card"><b>2</b><h3>WhatsApp ile hatırlatın</h3><p className="muted">Hizmetten sonra numarayı yazın, hazır mesaj kendi WhatsApp&apos;ınızdan gitsin.</p></div>
        <div className="card"><b>3</b><h3>Panelden takip edin</h3><p className="muted">Kaç kişi açtı, kaçı Google&apos;a geçti, kim size özel not bıraktı, hepsi tek ekranda.</p></div>
      </section>

      <footer className="footer">
        YorumKart, Google İşletme Profili kurallarına uygundur: herkese Google&apos;da yorum yazma seçeneği sunulur, yorum karşılığında indirim veya hediye verilmez.
      </footer>
    </div>
  );
}
