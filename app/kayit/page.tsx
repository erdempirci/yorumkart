import Link from "next/link";
import { signup } from "../actions";
import { ActionForm, Submit } from "@/components/forms";

export default function Kayit() {
  return (
    <div className="narrow">
      <Link href="/" className="logo"><i>★</i>YorumKart</Link>
      <h1 style={{ marginTop: 24 }}>İşletmenizi ekleyin</h1>
      <p className="muted">14 gün ücretsiz. Sonra aylık abonelik.</p>
      <div className="card">
        <ActionForm action={signup}>
          <div><label htmlFor="name">İşletme adı</label><input id="name" name="name" placeholder="Ör. Liman Kafe" required /></div>
          <div><label htmlFor="email">E-posta</label><input id="email" name="email" type="email" autoComplete="email" required /></div>
          <div><label htmlFor="password">Şifre</label><input id="password" name="password" type="password" minLength={8} autoComplete="new-password" required /></div>
          <Submit>Hesap oluştur</Submit>
        </ActionForm>
      </div>
      <p className="small muted" style={{ marginTop: 16 }}>Hesabınız var mı? <Link href="/giris">Giriş yapın</Link></p>
    </div>
  );
}
